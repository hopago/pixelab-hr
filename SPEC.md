# 픽셀랩 HR · 사이트 명세서

> 한 장으로 끝나는 운영·개발 레퍼런스. 어디서든 이 문서 하나만 보면 다음 작업이 무엇인지, 왜 그렇게 만들었는지 알 수 있도록.

---

## 0. At a glance

| | |
|---|---|
| **Live** | https://pixelab-hr.vercel.app |
| **Repo** | https://github.com/hopago/pixelab-hr |
| **Owner** | 최호준 · 행정실 |
| **Stack** | Next.js 16.2 + React 19 + Supabase + Tailwind v4 |
| **Status** | MVP. 로직 구현 완료, Supabase 자격증명 연결 후 실사용 가능. |

5개 영역(조직문화 진단·1on1 면담·면접 평가·핵심인재 풀·리텐션)을 한 곳에서. 양식은 YAML로 정의하고, 응답은 시점·버전이 박제되어 보존된다.

---

## 1. 왜 만들었나

기존 픽셀랩 인사 영역은
1. **종이 회수함 기반** → 데이터가 모이지 않음
2. **양식 개정 이력 추적 불가** → 같은 양식인지, 새 버전인지 알 수 없음
3. **응답자 → 인사 회수 동선이 비효율** → 회수 누락·중복

이 앱은 그 흐름을 디지털화하되, **종이 양식의 시각·카피·구조를 그대로 보존**한다. 같은 얼굴, 다른 매체. 응답 페이지를 PDF로 인쇄하면 종이 양식과 픽셀 단위로 동일한 결과가 나온다.

### 세 가지 핵심 결정

1. **YAML이 양식의 진실** — 코드가 아니라 데이터. PR 머지 = 양식 변경. `npm run sync-forms` 가 hash diff만큼만 DB에 반영.
2. **응답 시점 스냅샷** — `form_responses.schema_snapshot_json`에 응답 시점 양식을 그대로 박제. 양식이 바뀌어도 옛 응답은 그 시점의 모습 그대로 다시 그려진다.
3. **링크는 발급 시점 버전에 고정** — 새 버전 발행해도 이미 발급된 토큰은 옛 버전으로 응답을 받음. 진행 중인 라운드의 일관성 보장.

### 사용자

| 역할 | 인원 | 권한 |
|---|---|---|
| **admin** | 인사 1명 (최호준) | 모든 작업: 양식·링크·응답·후보자·직원·신호·사용자 관리 |
| **interviewer** | 팀장 N명 | 본인에게 발급된 면접 평가 링크 작성, 본인 응답만 조회 |
| **public** | 토큰 보유자 | 토큰 URL로 1회성 접근, 인증 불필요 |

---

## 2. 다섯 영역 — 무엇을 어디서

| # | 영역 | 핵심 기능 | 주 화면 |
|---|---|---|---|
| 1 | **조직문화 진단** | 16문항 익명 설문, 8양식 클러스터 평균/편차 시각화 (Recharts 레이더+막대), CSV 내보내기 | `/admin/culture` |
| 2 | **인사 면담 기록** | 30/60/90일 1on1, 인사 에스컬레이션 안내 | `/admin/employees/[id]` |
| 3 | **면접 평가 & 질문지** | 직무별 질문지·면접관별 평가지, 후보자별 라운드 묶음 | `/admin/candidates/[id]` |
| 4 | **핵심인재 유치** | 후보자 풀 단계별 칸반(sourced→hired/rejected), 단계 변경 | `/admin/candidates` |
| 5 | **리텐션** | 직원 마스터 + 1on1 히스토리 + 신호 타임라인, 자동 추출, 해결/재오픈 | `/admin/retention` |

---

## 3. 기술 스택

| Layer | Choice | 비고 |
|---|---|---|
| Framework | **Next.js 16.2** App Router + **React 19** | RSC + Server Actions |
| Language | TypeScript strict | |
| Style | **Tailwind v4** + DDS v2.0 토큰 | `globals.css` `@theme` 블록 |
| Fonts | **Pretendard** (npm 패키지, 자체 호스팅) + **JetBrains Mono** (`next/font/google`) | 렌더 블로킹/FOUT 없음 |
| DB | **Supabase Postgres** + Row Level Security | RLS 로 admin/interviewer/anon 분리 |
| Auth | **Supabase Auth** — Google OAuth 전용 | `app_users` 테이블 allowlist 로 게이팅 |
| ORM | **Drizzle** (스키마 정의만) + **Supabase JS client** (질의) | |
| Forms | **react-hook-form** + **Zod** (FormSchema 검증) | |
| Charts | **Recharts** | 조직문화 레이더/막대 |
| Bundler | **Webpack** | Turbopack 이 한글 경로(`픽셀랩 HR`)에서 byte-boundary panic — 영문 경로면 Turbopack 가능 |
| Hosting | **Vercel** | GitHub `main` 브랜치 연동 자동 배포 |

---

## 4. 폴더 맵

```
pixelab-hr/
├── app/
│   ├── (admin)/admin/             ← 인사 관리자 영역 (요구: admin)
│   │   ├── layout.tsx               · 사이드바(데스크톱) / 가로스크롤 네비(모바일)
│   │   ├── page.tsx                 · 대시보드 (KPI 4개 + 빠른 액션 4개)
│   │   ├── templates/page.tsx       · 양식 카탈로그
│   │   ├── links/                   · 응답 링크 목록 + new (단건/일괄)
│   │   ├── responses/               · 응답 모음 + [id] 상세 (read-only)
│   │   ├── culture/                 · 8양식 집계 + 시각화
│   │   ├── candidates/              · 후보자 풀 + [id] 상세 (라운드 묶음)
│   │   ├── employees/               · 직원 마스터 + [id] 1on1·신호 타임라인
│   │   ├── retention/               · 신호 대시보드
│   │   └── users/                   · app_users 관리
│   ├── login/                       ← Google OAuth 로그인
│   ├── auth/callback/               ← OAuth 콜백 (allowlist 검증)
│   ├── access-denied/               ← 거부 페이지
│   ├── r/[token]/                   ← 응답자 페이지 (인증 X)
│   │   ├── page.tsx                 · 토큰 → 양식 → 폼 렌더
│   │   └── done/page.tsx            · 제출 완료
│   ├── api/r/[token]/submit/        ← 응답 제출 API (POST)
│   ├── preview/                     ← 양식 미리보기 (인증 X)
│   │   ├── page.tsx                 · 카테고리별 카드 인덱스
│   │   └── [slug]/page.tsx          · A4 폼 미리보기
│   ├── page.tsx                     ← 홈 랜딩
│   ├── not-found.tsx                ← 404
│   ├── layout.tsx                   ← 루트 레이아웃 + 폰트 import
│   └── globals.css                  ← DDS 토큰 + 컴포넌트 클래스 + 반응형
│
├── components/
│   ├── dds/                         · DDS v2.0 컴포넌트 (15개 + Logo)
│   │   ├── Logo.tsx                   · on-dark/on-light × xs/sm/md/lg
│   │   ├── PageA4.tsx · Masthead.tsx · DisplayBlock.tsx · BignumStrip.tsx
│   │   ├── Callout.tsx · MetaGrid.tsx · SectionHead.tsx · Field.tsx
│   │   ├── LikertCluster.tsx · CheckGroup.tsx · RadioGroup.tsx
│   │   ├── TableSimple.tsx · Card.tsx · Footer.tsx · index.ts
│   ├── form-renderer/
│   │   ├── SchemaRenderer.tsx       · YAML 스키마 → React 폼 (인터랙티브 + 읽기전용)
│   │   ├── ResponderForm.tsx        · /r/[token] 클라이언트 래퍼
│   │   └── emphasis.tsx             · **bold** 인라인 강조 파서
│   ├── public/
│   │   ├── PublicHeader.tsx         · 홈/프리뷰 sticky 네비 + 로그인 CTA
│   │   ├── PublicFooter.tsx         · 3-컬럼 푸터
│   │   └── PublicShell.tsx          · 헤더+푸터 래퍼
│   ├── admin/
│   │   ├── AdminPage.tsx · AdminButton
│   │   └── LogoutButton.tsx
│   └── charts/
│       ├── CultureRadar.tsx         · Recharts RadarChart
│       └── CultureBars.tsx          · Recharts BarChart
│
├── lib/
│   ├── schema/
│   │   ├── form-schema.ts           · Zod FormSchema, 11 block types
│   │   └── load-yaml.ts             · forms/ 디렉토리 YAML 로더 (server-only)
│   ├── supabase/
│   │   ├── client.ts                · 브라우저 (anon)
│   │   ├── server.ts                · SSR (anon, 쿠키 기반)
│   │   └── admin.ts                 · service-role (RLS 우회)
│   ├── db/
│   │   ├── schema.ts                · Drizzle 테이블 정의
│   │   └── client.ts                · postgres 직접 연결
│   ├── auth/
│   │   ├── allowlist.ts             · email → role 매핑 + ADMIN_EMAIL_ALLOWLIST 부트스트랩
│   │   └── session.ts               · requireSession / getSessionOrNull
│   ├── analytics/
│   │   ├── culture-aggregate.ts     · 8양식 평균/표준편차 계산
│   │   ├── extract-signals.ts       · check-group → retention_signals 자동 추출
│   │   └── csv.ts                   · RFC4180 CSV 인코딩
│   ├── response/lookups.ts          · 토큰 → form schema 해석 (service-role)
│   ├── tokens.ts                    · nanoid(16) 토큰 발급
│   └── utils.ts                     · cn (clsx + tailwind-merge)
│
├── forms/                           ← 양식 YAML 저장소 (= 진실의 원천)
│   ├── README.md                    · YAML 작성 가이드
│   ├── diag-culture-16q/v2.yaml     · 16문항 조직문화 진단
│   └── form-1on1-30d/v2.yaml        · 입사 30일 1on1
│
├── scripts/
│   ├── db-migrate.ts                · supabase/migrations/*.sql 적용 (멱등)
│   ├── sync-forms.ts                · forms/*/v*.yaml → form_versions
│   └── seed-admin.ts                · ADMIN_EMAIL_ALLOWLIST → app_users
│
├── supabase/migrations/
│   ├── 0001_init.sql                · app_users · form_templates/versions/links/responses
│   ├── 0002_candidates.sql          · candidates · candidate_evaluations
│   ├── 0003_employees_retention.sql · employees · retention_signals
│   ├── 0004_rls.sql                 · RLS 정책 + is_admin/is_interviewer 헬퍼
│   └── 0005_helpers.sql             · increment_link_use RPC
│
├── public/
│   └── favicon.svg                  · 흑색 사각 + P + accent dot
│
├── middleware.ts                    · Supabase 세션 쿠키 갱신 (env 없으면 no-op)
├── next.config.ts                   · outputFileTracingRoot 핀
├── tailwind.config.ts               · (사용 X — Tailwind v4 는 @theme 사용)
├── package.json                     · scripts: dev/build/db:migrate/sync-forms/seed-admin
├── README.md                        · 운영 0→1 가이드
└── SPEC.md                          ← 이 문서
```

---

## 5. 라우트 (전체)

### Public (인증 불필요)

| Path | 렌더링 | 무엇을 |
|---|---|---|
| `/` | 동적 | 홈 랜딩 — 히어로 + 5영역 카드 + 양식 목록 + 3단계 플로우 |
| `/preview` | 정적 | 양식 미리보기 인덱스 (카테고리별 그룹) |
| `/preview/[slug]` | 정적 | 양식 상세 (A4 + 브레드크럼) |
| `/login` | 정적 | Google OAuth 로그인 카드 |
| `/access-denied` | 동적 | allowlist 외 거부 또는 admin 권한 부족 |
| `/not-found` | 정적 | 404 |
| `/auth/callback` | 동적 | OAuth code → 세션 + allowlist 검증 |

### Responder (토큰 인증)

| Path | 렌더링 | 무엇을 |
|---|---|---|
| `/r/[token]` | 동적 | 토큰 → 양식 해석 → 인터랙티브 폼 |
| `/r/[token]/done` | 정적 | 제출 완료 |
| `POST /api/r/[token]/submit` | API | 응답 검증 + 박제 + retention signal 추출 |

### Admin (Google 세션 + role=admin)

| Path | 무엇을 |
|---|---|
| `/admin` | 대시보드 (KPI 4 + 빠른 액션 4) |
| `/admin/templates` | 양식 카탈로그 + 버전 히스토리 |
| `/admin/links` | 발급된 링크 200건 (status: OPEN/USED/EXPIRED) |
| `/admin/links/new` | 단건/일괄 발급 + CSV 다운로드 |
| `/admin/responses` | 응답 300건 (양식별 필터) |
| `/admin/responses/[id]` | 박제 스키마로 read-only 렌더, PDF 인쇄 가능 |
| `/admin/culture` | 8양식 평균/편차 (레이더+막대) + 집계 CSV |
| `/admin/candidates` | 후보자 풀 단계별 칸반 + 인라인 추가 |
| `/admin/candidates/[id]` | 후보자 상세 + 단계 변경 + 라운드별 평가 |
| `/admin/employees` | 직원 마스터 + 활성 신호 수 |
| `/admin/employees/[id]` | 1on1 히스토리 + 신호 타임라인 |
| `/admin/retention` | 신호 대시보드 (status × severity 필터) + 해결/재오픈 |
| `/admin/users` | app_users 관리 (admin/interviewer 추가/제거) |

---

## 6. 데이터 모델

### 핵심 테이블

```
app_users                ─ email PK, role admin|interviewer
form_templates           ─ slug · category · current_version_id
form_versions            ─ template_id · version_number · schema_json · source_yaml_hash
form_links               ─ token · version_id · target_name? · candidate_id? · employee_id?
                            expires_at · max_uses · use_count
form_responses           ─ link_id · version_id · schema_snapshot_json · payload_json
                            submitter_email? · submitter_meta (익명이면 {})
candidates               ─ name · role · stage(sourced→hired/rejected) · contact · notes
candidate_evaluations    ─ candidate_id · response_id · interviewer_email · round · recommendation
employees                ─ name · dept · role · email · joined_at · status(active|leaving|left)
retention_signals        ─ employee_id · signal_type · severity · raised_at · resolved_at?
                            source_response_id?
__migrations             ─ filename PK · applied_at  (scripts/db-migrate 가 관리)
```

### 관계 다이어그램

```
form_templates ──N── form_versions ──N── form_links ──1── form_responses
                         │                  │ ?              ?
                         │ (snapshot)       ├── candidate     │
                         └──────────────────┤                 ├── candidate_evaluation
                                            └── employee      │
                                                              └── retention_signal (auto)
```

### RLS 요약 (`supabase/migrations/0004_rls.sql`)

| 테이블 | INSERT | SELECT | UPDATE/DELETE |
|---|---|---|---|
| `app_users` | admin | self / admin | admin |
| `form_templates`/`versions` | admin | interviewer+ | admin |
| `form_links` | admin | admin | admin |
| `form_responses` | service-role only | admin / interviewer-self | admin |
| `candidates` | admin | interviewer+ | admin |
| `candidate_evaluations` | admin | admin / interviewer-self | admin |
| `employees`/`retention_signals` | admin | admin | admin |

응답 INSERT 는 라우트가 토큰 검증 후 service-role 로 직접 — 응답자에게 익명 권한을 주지 않는다.

---

## 7. 양식 (YAML) 스펙

### 파일 명명

```
forms/{slug}/v{N}.yaml
   └─ slug: URL 친화적 (소문자 + 하이픈)
   └─ N: 정수 버전. 새 버전은 새 파일.
```

### 최상위 필드

| 필드 | 타입 | 설명 |
|---|---|---|
| `doc_id` | string | 사람이 읽는 문서 ID, 예: `DIAG-CULTURE-16Q` |
| `slug` | string | URL slug, 디렉토리명과 일치 |
| `name` | string | 사람이 읽는 양식 이름 |
| `category` | enum | `culture` / `onboarding` / `interview-q` / `interview-eval` / `exit` |
| `version` | integer | 1, 2, 3 ... |
| `date` | YYYY-MM-DD | 발행일 표시용 |
| `anonymous` | boolean | true면 IP/UA/email 미수집 |
| `retention` | string? | 푸터 표시용 (예: `RETENTION 3Y`) |
| `intro` | object | `{ eyebrow?, title, lede? }` (lede 안에 `**bold**` 가능) |
| `bignum` | array? | `[{ value, label }, ...]` (3개 권장) |
| `topCallout` | object? | `{ label, body }` 본문 시작 전 안내 박스 |
| `topMeta` | array? | 응답자 메타 입력 필드 |
| `topAnchorBar` | object? | Likert 양식 본문 위 anchor (`{ left, right }`) |
| `blocks` | array | 본문 블록들 (순서대로) |
| `outroCallout` | object? | 본문 끝 안내 박스 |
| `footer` | object? | `{ left, right }` |

### Block 타입 (11종)

| type | 의미 | 응답 키 |
|---|---|---|
| `section-head` | A/B/C 섹션 구분선 + 제목 | — |
| `anchor-bar` | Likert 1↔5 anchor | — |
| `field-text` | 단답 입력 | `id` |
| `field-textarea` | 서술형 입력 | `id` |
| `radio-group` | 단일 선택 | `id` |
| `check-group` | 다중 선택 (특정 value는 retention_signals 자동 등록) | `id` |
| `likert-cluster` | 5점 척도 묶음 (조직문화 양식) | 각 question의 `id` |
| `callout` | 본문 중간 안내 박스 | — |
| `paragraph` | 단락 텍스트 (`**bold**` 가능) | — |
| `table` | 표 (첫 컬럼 "바로 알리기"/"이번 주 안에"/"월 보고로 충분"은 자동 색 점) | — |
| `meta-grid` | 표 형태 메타 입력 (서명 등) | 각 cell의 `id` |

자세한 예시는 [forms/README.md](forms/README.md) 와 시드 양식 두 개 참조.

### 자동 retention 신호 매핑

`check-group` 의 option `value` 가 다음 중 하나면 응답 시점에 `retention_signals` row 자동 생성 (단, 링크가 직원과 연결된 경우):

| value | severity | 의미 |
|---|---|---|
| `rights_negotiation` | yellow | 권리·예외·보상 협상 |
| `gossip` | yellow | 정보 통제력 부족 |
| `accountability` | yellow | 책임 회피·합의 뒤집기 |
| `leaving_intent` | red | 퇴사 의사 |
| `comp_query` | yellow | 처우·계약 질의 |
| `conflict` | red | 동료 갈등 |
| `other` | yellow | 기타 |

`none` 같은 비-신호 value는 단순 응답으로만 저장.

---

## 8. 인증 플로우

```
1. 사용자가 /login 에서 [Google로 로그인] 클릭
2. createBrowserClient.auth.signInWithOAuth({ provider: 'google',
     redirectTo: `${origin}/auth/callback` })
3. Google → Supabase → /auth/callback?code=...
4. /auth/callback (Route Handler):
     · supabase.auth.exchangeCodeForSession(code)  → 세션 쿠키 set
     · supabase.auth.getUser()                     → email 추출
     · checkAppUserByEmail(email)                  → app_users 매칭
       (없으면 ADMIN_EMAIL_ALLOWLIST 폴백 후 admin 자동 등록)
     · 거부 → signOut() + /access-denied
     · 허용 → role 별 기본 행선지 redirect
5. 이후 모든 admin 라우트는 layout.tsx 의 requireSession('admin')
   에서 동일 검증을 다시 함 (RLS도 같은 로직 + JWT email 검증)
```

핵심: **app_users 가 진짜 권한 원천**. Google 로그인은 단지 신원 증명일 뿐.

---

## 9. 응답 플로우

```
1. 인사가 /admin/links/new 에서 양식·버전·대상자 입력
2. server action issueLinks() → form_links insert (service-role)
   토큰: nanoid 16자, 사람 친화 알파벳(0/O/1/I/l 제외)
3. CSV 다운로드 또는 직접 복사 → 카톡/이메일 일괄 발송
4. 응답자가 /r/{token} 접속
5. resolveTokenForResponse(token):
   · 토큰 lookup
   · 만료/사용횟수 검증
   · form_versions.schema_json 조인 → FormSchema 파싱
6. ResponderForm (client) 이 SchemaRenderer 로 렌더
   응답자가 작성·제출 → POST /api/r/{token}/submit
7. /api/r/{token}/submit:
   · 토큰 재검증
   · 응답값을 schema 키로 화이트리스트 필터
   · form_responses insert with schema_snapshot_json (박제!)
   · 익명이면 submitter_meta = {}, 아니면 IP/UA
   · increment_link_use(link_id) RPC 로 use_count 원자 증가
   · 직원 연결된 링크 + check-group 에 known signal value → retention_signals insert
8. 클라이언트 → /r/{token}/done 으로 navigate
```

박제(snapshot) 의 의미: form_versions 에서 schema_json 을 가져와 응답 시점에 form_responses.schema_snapshot_json 에 한 번 더 저장. 이후 양식이 v3 으로 바뀌어도 응답은 v2 의 모습 그대로 보인다.

---

## 10. 조직문화 집계 (`/admin/culture`)

```
입력
  · category=culture 인 양식 한 개
  · 그 양식의 모든 버전에 대한 form_responses 전체

처리 (lib/analytics/culture-aggregate.ts)
  for each likert-cluster (A~H, 8개):
    for each response:
      cluster_mean[response] = mean(question values within the cluster)
    cluster.mean = mean(cluster_means)
    cluster.sd   = sample SD(cluster_means, ddof=1)
    cluster.n    = count(responses with at least one answer)

출력
  · 8x { tag, name, keywords, mean, sd, n }
  · Recharts 레이더 (도메인 0~5) + 막대 (3.5점 이상 강조)
  · CSV 다운로드 버튼
```

응답이 여러 양식 버전에 걸쳐 있어도 같은 클러스터 태그(A·B·C…)로 합쳐서 집계. 양식 버전이 바뀌어 문항 텍스트가 살짝 달라져도 태그가 같으면 연속선상으로 본다.

---

## 11. 디자인 시스템 (DDS v2.0)

`app/globals.css` 의 `@theme` 블록에 모든 토큰. 새 색·폰트·간격은 절대 인라인하지 말 것 — 토큰만 사용.

### 컬러 (8단계 그레이 + accent + warn/ok)

```
ink #0A0A0A  ink-2 #1C1C1E  ink-3 #2C2C2E  ink-4 #5A5A60
mute #8E8E93  mute-2 #C7C7CC
line #E5E5EA  line-soft #EFEFF3
surface #F7F7F9  surface-2 #FAFAFB  paper #FFFFFF
accent #0F03FC  accent-ink #0700C9
warn #C8102E  ok #006939
```

비율 5/85/10: accent 5% 안쪽, ink/paper 85%, mute/line 10%.

### 타이포

```
sans  Pretendard Variable (npm 자체 호스팅)
mono  JetBrains Mono (next/font/google)

display 60 / 800 / -3.5%      h1 36 / 700 / -2%
h2      22 / 700 / -2%        h3 16 / 600
body  14.5 / 400 / 1.6        small 12.5  meta 11
```

모바일에서는 `display` 36→30px, `bignum` 44→32→30px로 자동 축소.

### 컴포넌트 (15개)

`components/dds/*` — Logo, PageA4, Masthead, DisplayBlock, BignumStrip, Callout, MetaGrid, SectionHead, Field family, LikertCluster, CheckGroup, RadioGroup, TableSimple, Card, Footer.

A4 양식과 화면 양식이 **같은 클래스**(`.px-*`)를 쓴다. `@media print` 에서 페이지가 정확히 210mm 로 고정.

### 카피 톤 (3 규칙)

1. **한자어를 풀어 쓴다** — "본 양식은" → "이 종이는"
2. **명령형 대신 청유형** — "확인할 것" → "확인해 주세요"
3. **이모지·느낌표 금지** — 친절은 단어 선택으로

피해야 할 톤 ↔ 권장 톤 예시는 `pixelab-design-system-v2.html` 참조.

---

## 12. 0 → 1 셋업 (운영자 체크리스트)

### A. Supabase 프로젝트
- [ ] supabase.com 에서 새 프로젝트 (region: `Northeast Asia (Seoul)`)
- [ ] **Project Settings → API** 에서 4개 값 확보
  - [ ] `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `anon public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `service_role` 키 → `SUPABASE_SERVICE_ROLE_KEY` (서버 전용)
- [ ] **Project Settings → Database → Connection string (URI, Session pooler)** → `DATABASE_URL`

### B. Google OAuth
- [ ] Google Cloud Console → Credentials → OAuth Client ID (Web)
- [ ] Authorized redirect URI: `https://{프로젝트}.supabase.co/auth/v1/callback`
- [ ] Supabase **Authentication → Providers → Google** 활성화 후 Client ID/Secret 입력
- [ ] **Authentication → URL Configuration**
  - Site URL: `https://pixelab-hr.vercel.app` (또는 로컬 `http://localhost:3000`)
  - Redirect URLs: `https://pixelab-hr.vercel.app/auth/callback` 추가

### C. Vercel 환경변수
[Vercel 대시보드 → Settings → Environment Variables](https://vercel.com/hopagos-projects/pixelab-hr/settings/environment-variables) 에서 6개:

| Key | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | A에서 확보 | Production + Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | A에서 확보 | Production + Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | A에서 확보 | Production + Preview |
| `DATABASE_URL` | A에서 확보 | Production + Preview |
| `NEXT_PUBLIC_APP_URL` | `https://pixelab-hr.vercel.app` | Production + Preview |
| `ADMIN_EMAIL_ALLOWLIST` | `your.email@example.com` | Production + Preview |

저장 후 **Redeploy** 한 번 트리거.

### D. DB 초기화 (로컬에서 1회)
```bash
cp .env.example .env.local           # A의 값 그대로 복사
npm install
npm run db:migrate                   # 5개 SQL 마이그레이션 적용
npm run seed-admin                   # ADMIN_EMAIL_ALLOWLIST → app_users
npm run sync-forms                   # forms/*/v*.yaml → form_versions
```

### E. 첫 로그인 검증
- [ ] https://pixelab-hr.vercel.app/login → Google 로그인
- [ ] /admin 으로 리다이렉트 되는지 확인
- [ ] /admin/users 에서 본인이 admin 으로 등록돼 있는지 확인
- [ ] /admin/templates 에서 양식 2개(diag-culture-16q v2, form-1on1-30d v2) 보이는지 확인

### F. 면접관 추가
- [ ] /admin/users → 추가 → role: 면접관

---

## 13. 일일 명령어

```bash
# 개발
npm run dev              # localhost:3000 (webpack)
npm run typecheck        # tsc --noEmit
npm run build            # next build --webpack
npm run lint

# DB / 양식
npm run db:migrate       # 새 마이그레이션 적용 (멱등)
npm run sync-forms       # YAML 변경분 form_versions 에 반영
npm run seed-admin       # 부트스트랩 admin 추가/갱신

# 배포
git push                 # main → Vercel 자동 배포
vercel deploy --prod --yes   # CLI 직접 배포 (이미 hopago 로그인됨)
```

---

## 14. 양식을 새로 만드는 5단계

1. **복제** — `forms/diag-culture-16q/v2.yaml` 같은 비슷한 양식을 복사
2. **이름·번호 변경** — `slug`, `doc_id`, `version`, `name`, `date`, `category`
3. **본문 작성** — `intro`, `blocks`, `outroCallout`, `footer` 차례로
4. **카피 톤 점검** — 한자어 풀기 / 청유형 / 이모지 없음
5. **`npm run sync-forms`** → `/admin/templates` 에서 새 양식이 보이는지 확인 → `/preview/{slug}` 에서 종이 양식과 비교

새 버전을 발행할 때(예: 경영진의 인재상이 바뀜)는 **기존 파일을 수정하지 말고** `v3.yaml` 새로 만들기. 응답 무결성 유지의 핵심.

---

## 15. 컨벤션 & 함정

### 컨벤션
- **TypeScript 엄격 모드** — `any` 회피, Zod 로 외부 데이터 검증
- **Server Components 우선** — `'use client'` 는 인터랙션 필요할 때만
- **Tailwind v4** — 모든 토큰은 `@theme` 블록을 거쳐서. `bg-ink` `text-mute` `text-body` 처럼 토큰명을 그대로 유틸리티로 사용
- **인라인 스타일 최소화** — 새 컴포넌트는 Tailwind 클래스 / `.px-*` 클래스로
- **DDS 컴포넌트 우선** — 새 시각 요소가 필요하면 먼저 `components/dds/` 에 추가하고 그 다음 사용
- **카피 톤 (3 규칙)** 은 PR 리뷰의 1순위 검토 사항

### 함정 / 알아둘 것

1. **한글 경로 + Turbopack panic** — `픽셀랩 HR\pixelab-hr` 안에서 `next dev`/`next build` 시 Turbopack 이 byte-boundary 로 panic. `package.json` 스크립트에 `--webpack` 명시. 영문 경로(`Desktop\pixelab-hr` 직속)면 Turbopack 도 OK.

2. **`middleware` deprecation 경고** — Next 16 에서 `middleware.ts` 가 deprecated, `proxy.ts` 권장. 빌드는 그대로 통과하지만 향후 마이그레이션 필요.

3. **응답 키 화이트리스트** — `/api/r/[token]/submit` 은 `collectResponseKeys(form)` 로 필터. YAML 에 정의되지 않은 임의 키가 응답에 들어와도 저장되지 않음.

4. **익명 양식의 익명성** — `anonymous: true` 인 양식은 `submitter_meta = {}`, `submitter_email = null`. RLS 정책과 라우트 양쪽에서 보장.

5. **버전 박제** — 응답 상세 (`/admin/responses/[id]`) 는 `schema_snapshot_json` 만 보고 그린다. `form_versions` 를 안 본다. 이게 박제의 핵심.

6. **YAML 텍스트 변경 vs 새 버전** — 오타 수정처럼 의미가 안 바뀌면 같은 `v2.yaml` 덮어쓰기 OK (`sync-forms` 가 schema_json 만 갱신). 의미가 바뀌거나 문항 추가/제거면 반드시 `v3.yaml` 새로 만들기.

7. **getSessionOrNull 은 throw 하지 않는다** — Supabase env 미설정 시 null 반환. 홈페이지가 첫 배포에서도 정상 렌더하도록.

8. **Google OAuth 도메인** — Workspace 도메인이 있으면 도메인 단위 화이트리스트 더 깔끔. 현재는 개별 이메일(`app_users`) 화이트리스트.

9. **카드 호버 lift** — 호버 시 `-translate-y-px` + soft shadow. 인쇄 시에는 그림자/테두리 모두 단순화 (`@media print`).

10. **Webpack lockfile 경고** — `outputFileTracingRoot` 를 `next.config.ts` 에 핀해서 상위 디렉토리(C:\\Users\\user)가 root 로 잘못 잡히는 것 방지.

---

## 16. 로드맵 / 미해결

### 양식 (사용자 콘텐츠 필요)
- [ ] `forms/form-1on1-60d/v1.yaml` — 60일 1on1 (30일 합의 점검 위주)
- [ ] `forms/form-1on1-90d/v1.yaml` — 90일 마일스톤
- [ ] `forms/form-interview-q-doctor/v1.yaml` — 의사 직무 질문지
- [ ] `forms/form-interview-q-coordinator/v1.yaml` — 코디네이터 질문지
- [ ] `forms/form-interview-eval/v1.yaml` — STAR 기반 평가지

### 기능 확장
- [ ] `/interview` 포털 — interviewer role 전용, 본인 발급된 평가 링크 목록
- [ ] 응답 마감 알림 (미응답 N일 후 인사에게 노티)
- [ ] 후보자 단계별 자동 면접 평가 링크 발급 (interview 단계 진입 시)
- [ ] 직원 입사 시 자동 30일 1on1 링크 예약
- [ ] 익명 응답 집계 통계 (히스토리 그래프)
- [ ] 다국어 (영문) 양식 지원

### 기술 부채
- [ ] `middleware.ts` → `proxy.ts` (Next 16 권장)
- [ ] Drizzle 로 실제 질의 마이그레이션 (현재는 Supabase JS client)
- [ ] E2E 테스트 (Playwright) 응답 플로우 검증
- [ ] OG 이미지 (소셜 카드 미리보기)
- [ ] 다크 모드 (현재는 라이트 톤만 — 사내 인쇄 정합성 우선)

### 운영
- [ ] 사내 운영 매뉴얼 (인사 입장 onboarding 문서)
- [ ] 백업 정책 (Supabase 자동 백업 + 주간 export)
- [ ] OAuth 클라이언트 갱신 일정 (Google 정책 변경 대응)

---

## 17. 변경 이력

| 일자 | 커밋 | 무엇 |
|---|---|---|
| 2026-05-10 | `12c1115` | 초기 scaffold |
| 2026-05-10 | `cf7f558` | DDS v2.0 토대 + 14 컴포넌트 |
| 2026-05-10 | `9970f23` | YAML 양식 엔진 + 시드 양식 2종 |
| 2026-05-10 | `412dad0` | Supabase + Google OAuth + 응답 플로우 + admin |
| 2026-05-10 | `9ff533a` | 5영역 도메인 페이지 + 운영 README |
| 2026-05-10 | `48bbdf5` | Logo 컴포넌트 + 반응형 + 현대카드 폴리시 |
| 2026-05-10 | `14d4912` | middleware env 가드 |
| 2026-05-10 | `f251bcf` | Public 네비 + 홈 재설계 + Pretendard 자체 호스팅 |
| 2026-05-10 | `(this)` | 사이트 명세서 |

---

## 18. 어디서 무엇을 고치는가 (cheat sheet)

| 무엇을 바꾸고 싶다면 | 이 파일을 |
|---|---|
| 양식 텍스트·블록 | `forms/{slug}/v{N}.yaml` (+ `npm run sync-forms`) |
| 새 카테고리 | `lib/schema/form-schema.ts` `FormCategory` + `0001_init.sql` CHECK |
| 새 블록 타입 | `lib/schema/form-schema.ts` `Block` 유니온 + `SchemaRenderer` switch |
| DDS 색·폰트·간격 | `app/globals.css` `@theme` 블록 |
| DDS 컴포넌트 시각 | `app/globals.css` `.px-*` 클래스 |
| Public 네비/풋터 | `components/public/PublicHeader.tsx` `PublicFooter.tsx` |
| 관리자 사이드바 항목 | `app/(admin)/admin/layout.tsx` `NAV` 배열 |
| 홈 5영역 카피 | `app/page.tsx` `DOMAINS` 배열 |
| RLS 정책 | `supabase/migrations/0004_rls.sql` (+ 새 마이그레이션 발행) |
| 자동 retention 신호 매핑 | `lib/analytics/extract-signals.ts` |
| 8양식 집계 로직 | `lib/analytics/culture-aggregate.ts` |
| 응답 토큰 길이/문자집합 | `lib/tokens.ts` |
| 인쇄 레이아웃 | `app/globals.css` `@media print` 블록 |

---

*이 문서는 단일 진실 원천(Single Source of Truth) 입니다. 무엇이 바뀌면 같은 PR 안에서 SPEC.md 도 함께 갱신해 주세요.*
