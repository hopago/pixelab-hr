-- =================================================================
-- Pixelab HR — 0001_init
-- 인증·사용자 / 양식 / 응답 / 응답 링크
-- =================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── 인증/사용자 ──────────────────────────────────────────────────
-- Supabase Auth 의 auth.users 와는 별도로, 앱 권한을 관리하는 화이트리스트.
-- email pk 로 두어 Google OAuth 로그인 시 검증 키로 사용.
create table if not exists app_users (
  email       text primary key,
  role        text not null check (role in ('admin', 'interviewer')),
  full_name   text,
  created_at  timestamptz not null default now()
);

-- ─── 양식 ────────────────────────────────────────────────────────
create table if not exists form_templates (
  id                 uuid primary key default uuid_generate_v4(),
  slug               text not null unique,
  category           text not null check (category in (
                       'culture', 'onboarding', 'interview-q', 'interview-eval', 'exit'
                     )),
  name               text not null,
  current_version_id uuid,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists form_versions (
  id                 uuid primary key default uuid_generate_v4(),
  template_id        uuid not null references form_templates(id) on delete cascade,
  version_number     int  not null,
  schema_json        jsonb not null,
  source_yaml_hash   text not null,
  published_at       timestamptz not null default now(),
  created_by         text references app_users(email) on delete set null,
  supersedes_id      uuid references form_versions(id) on delete set null,
  unique (template_id, version_number)
);

-- form_templates.current_version_id ↔ form_versions.id 양방향 FK
alter table form_templates
  add constraint form_templates_current_version_fk
  foreign key (current_version_id) references form_versions(id) on delete set null;

create index if not exists form_versions_template_idx on form_versions(template_id);

-- ─── 응답 링크 ────────────────────────────────────────────────────
create table if not exists form_links (
  id            uuid primary key default uuid_generate_v4(),
  token         text not null unique,                   -- nanoid(16)
  version_id    uuid not null references form_versions(id) on delete cascade,
  target_name   text,                                   -- 익명이면 발급 메모용
  target_role   text,
  candidate_id  uuid,                                   -- (FK 추가는 0002에서)
  employee_id   uuid,                                   -- (FK 추가는 0003에서)
  issued_by     text references app_users(email) on delete set null,
  issued_at     timestamptz not null default now(),
  expires_at    timestamptz,
  max_uses      int not null default 1,
  use_count     int not null default 0
);

create index if not exists form_links_version_idx on form_links(version_id);
create index if not exists form_links_token_idx on form_links(token);

-- ─── 응답 ────────────────────────────────────────────────────────
-- schema_snapshot_json 은 응답 시점 양식 스키마 박제. 이후 양식이 바뀌어도
-- 응답을 동일한 시각으로 재현 가능하게 함.
-- 익명 응답이면 submitter_email = null, submitter_meta = '{}'
create table if not exists form_responses (
  id                     uuid primary key default uuid_generate_v4(),
  link_id                uuid not null references form_links(id) on delete cascade,
  version_id             uuid not null references form_versions(id) on delete cascade,
  schema_snapshot_json   jsonb not null,
  payload_json           jsonb not null,
  submitted_at           timestamptz not null default now(),
  submitter_email        text,
  submitter_meta         jsonb not null default '{}'::jsonb
);

create index if not exists form_responses_link_idx on form_responses(link_id);
create index if not exists form_responses_version_idx on form_responses(version_id);
create index if not exists form_responses_submitted_idx on form_responses(submitted_at desc);
