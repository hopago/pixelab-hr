-- =================================================================
-- Pixelab HR — 0004_rls
-- Row Level Security
--   • app_users: 본인 row 만 select
--   • form_templates / form_versions: admin 전체 / interviewer는 select 만
--   • form_links: admin 전체
--   • form_responses: admin select 전체, interviewer 본인 응답만, INSERT 는
--     서버 라우트가 service-role 로 수행 (RLS 무시) — 토큰 검증은 라우트 책임
--   • candidates / candidate_evaluations: admin 전체, interviewer 본인 round
--   • employees / retention_signals: admin 전체
-- =================================================================

alter table app_users           enable row level security;
alter table form_templates      enable row level security;
alter table form_versions       enable row level security;
alter table form_links          enable row level security;
alter table form_responses      enable row level security;
alter table candidates          enable row level security;
alter table candidate_evaluations enable row level security;
alter table employees           enable row level security;
alter table retention_signals   enable row level security;

-- ─── 헬퍼 함수 ────────────────────────────────────────────────────
-- auth.jwt() 에서 email 추출, app_users 에서 role 매칭.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from app_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and role = 'admin'
  );
$$;

create or replace function public.is_interviewer() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from app_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and role in ('admin','interviewer')
  );
$$;

create or replace function public.current_email() returns text
language sql stable security definer set search_path = public, auth as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

-- ─── app_users ────────────────────────────────────────────────────
create policy "app_users self select" on app_users
  for select using (lower(email) = public.current_email());
create policy "app_users admin all" on app_users
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── form_templates ───────────────────────────────────────────────
create policy "templates interviewer select" on form_templates
  for select using (public.is_interviewer());
create policy "templates admin write" on form_templates
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── form_versions ────────────────────────────────────────────────
create policy "versions interviewer select" on form_versions
  for select using (public.is_interviewer());
create policy "versions admin write" on form_versions
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── form_links ───────────────────────────────────────────────────
-- admin 만. 응답 페이지(/r/[token]) 는 service-role 로 토큰 조회.
create policy "links admin all" on form_links
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── form_responses ───────────────────────────────────────────────
-- INSERT 는 service-role 로만 (RLS 무시) — 라우트가 토큰 검증.
-- admin: 모두 select
-- interviewer: 본인이 제출한 응답만 (submitter_email 매칭)
create policy "responses admin select" on form_responses
  for select using (public.is_admin());
create policy "responses interviewer self select" on form_responses
  for select using (
    submitter_email is not null
    and lower(submitter_email) = public.current_email()
  );
create policy "responses admin update delete" on form_responses
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── candidates ───────────────────────────────────────────────────
create policy "candidates admin all" on candidates
  for all using (public.is_admin()) with check (public.is_admin());
create policy "candidates interviewer select" on candidates
  for select using (public.is_interviewer());

-- ─── candidate_evaluations ────────────────────────────────────────
create policy "candidate_evals admin all" on candidate_evaluations
  for all using (public.is_admin()) with check (public.is_admin());
create policy "candidate_evals interviewer self" on candidate_evaluations
  for select using (
    interviewer_email is not null
    and lower(interviewer_email) = public.current_email()
  );

-- ─── employees / retention_signals ────────────────────────────────
create policy "employees admin all" on employees
  for all using (public.is_admin()) with check (public.is_admin());
create policy "retention admin all" on retention_signals
  for all using (public.is_admin()) with check (public.is_admin());
