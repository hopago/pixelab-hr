-- =================================================================
-- Pixelab HR — 0003_employees_retention
-- 직원 마스터 + 리텐션 신호 트래킹
-- =================================================================

create table if not exists employees (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  dept        text,
  role        text,
  email       text unique,
  joined_at   date,
  status      text not null default 'active'
                check (status in ('active','leaving','left')),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists employees_status_idx on employees(status);
create index if not exists employees_dept_idx on employees(dept);

create table if not exists retention_signals (
  id                  uuid primary key default uuid_generate_v4(),
  employee_id         uuid not null references employees(id) on delete cascade,
  signal_type         text not null check (signal_type in (
                        'rights_negotiation',  -- 권리·예외·보상 협상
                        'gossip',              -- 정보 통제력 부족
                        'accountability',      -- 책임 회피·합의 뒤집기
                        'leaving_intent',      -- 퇴사 의사
                        'comp_query',          -- 처우·계약 질의
                        'conflict',            -- 다른 직원과의 갈등
                        'other'
                      )),
  severity            text not null default 'yellow'
                        check (severity in ('red','yellow','green')),
  raised_at           timestamptz not null default now(),
  raised_by           text references app_users(email) on delete set null,
  resolved_at         timestamptz,
  source_response_id  uuid references form_responses(id) on delete set null,
  notes               text
);

create index if not exists retention_signals_employee_idx on retention_signals(employee_id);
create index if not exists retention_signals_unresolved_idx on retention_signals(employee_id) where resolved_at is null;
create index if not exists retention_signals_severity_idx on retention_signals(severity) where resolved_at is null;

-- form_links.employee_id 외래키 연결
alter table form_links
  add constraint form_links_employee_fk
  foreign key (employee_id) references employees(id) on delete set null;
