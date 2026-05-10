-- =================================================================
-- Pixelab HR — 0005_helpers
-- 응답 제출 시 link.use_count 원자적 증가용 RPC.
-- =================================================================

create or replace function public.increment_link_use(p_link_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update form_links set use_count = use_count + 1 where id = p_link_id;
$$;

-- service-role 만 호출 가능하도록 PUBLIC revoke (Supabase 기본 GRANT 회수)
revoke execute on function public.increment_link_use(uuid) from anon, authenticated;
