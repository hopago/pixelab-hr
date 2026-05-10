-- =================================================================
-- Pixelab HR — 0002_candidates
-- 핵심인재 풀 + 후보자별 면접 평가지 묶음
-- =================================================================

create table if not exists candidates (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  role        text,
  source      text,                                 -- '잡플래닛' | '추천' | ...
  stage       text not null default 'sourced'
                check (stage in ('sourced','screened','interview','offer','hired','rejected')),
  contact     jsonb not null default '{}'::jsonb,   -- {email, phone, links}
  notes       text,
  created_by  text references app_users(email) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists candidates_stage_idx on candidates(stage);

create table if not exists candidate_evaluations (
  id                 uuid primary key default uuid_generate_v4(),
  candidate_id       uuid not null references candidates(id) on delete cascade,
  response_id        uuid not null references form_responses(id) on delete cascade,
  interviewer_email  text references app_users(email) on delete set null,
  round              int not null default 1,
  recommendation     text check (recommendation in ('strong-yes','yes','no','strong-no')),
  created_at         timestamptz not null default now(),
  unique (response_id)
);

create index if not exists candidate_evaluations_candidate_idx on candidate_evaluations(candidate_id);

-- form_links.candidate_id 외래키 연결
alter table form_links
  add constraint form_links_candidate_fk
  foreign key (candidate_id) references candidates(id) on delete set null;
