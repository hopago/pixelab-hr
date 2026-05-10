# Pixelab HR

픽셀랩성형외과의원 인사 관리 사내 웹앱.

5개 영역을 한 곳에서:
1. **조직문화 진단** — 16문항 양식, 익명 응답, 8양식 클러스터 평균/편차 시각화 (`/admin/culture`)
2. **인사 면담 기록** — 30/60/90일 1on1, 인사 에스컬레이션 (`/admin/employees/[id]`)
3. **면접 평가 & 질문지** — 직무별 질문지, 면접관별 평가지, 라운드별 묶음 (`/admin/candidates/[id]`)
4. **핵심인재 유치** — 후보자 풀 칸반, 단계 트래킹 (`/admin/candidates`)
5. **리텐션** — 직원 마스터, 1on1 히스토리, 신호 자동 추출 (`/admin/retention`)

## Stack

- **Next.js 16.2** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (DDS v2.0 토큰 포팅)
- **Supabase** (Postgres + RLS + Google OAuth)
- **Drizzle ORM** + raw SQL migrations
- **react-hook-form** + Zod
- **Recharts** (조직문화 시각화)

> **Webpack 빌드 사용** — 한글 경로(예: `픽셀랩 HR\pixelab-hr`)에서 Turbopack이 Rust 패닉(byte boundary)으로 빌드 실패하므로, `package.json`의 dev/build 스크립트는 `--webpack` 플래그를 명시합니다. 영문 경로면 Turbopack도 정상.

---

## 0 → 1 셋업

### 1. GitHub 레포 생성 + 푸시
사내에서 사용하는 organization/계정의 GitHub 에 빈 레포를 만들고 (`hopago/pixelab-hr` 권장), 다음을 실행:
```bash
git remote add origin https://github.com/hopago/pixelab-hr.git
git push -u origin main
```

### 2. Supabase 프로젝트
1. https://supabase.com/dashboard 에서 새 프로젝트 생성 (region: Northeast Asia / Seoul 권장)
2. **Project Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` 키 → `SUPABASE_SERVICE_ROLE_KEY` (서버 전용, 노출 금지)
3. **Project Settings → Database → Connection string**:
   - `URI` 의 Session mode → `DATABASE_URL`

### 3. Google OAuth 설정
1. Google Cloud Console → **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
2. Application type: **Web application**
3. Authorized redirect URIs: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Supabase 대시보드 → **Authentication → Providers → Google** 활성화 후 Client ID / Client Secret 입력
5. Supabase **Authentication → URL Configuration → Site URL** 에 배포 도메인(또는 `http://localhost:3000`) 등록
6. Redirect URLs 에 `${APP_URL}/auth/callback` 추가

### 4. 환경변수
`.env.example` 을 `.env.local` 로 복사하고 채웁니다:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:PWD@db.xxxxx.supabase.co:5432/postgres
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL_ALLOWLIST=hojun.choi@example.com
```

`ADMIN_EMAIL_ALLOWLIST` 는 첫 관리자(인사 최호준)의 Gmail 주소. 이 주소로 첫 로그인하면 `app_users` 테이블에 자동 등록됩니다.

### 5. DB 마이그레이션 + 시드
```bash
npm install
npm run db:migrate    # supabase/migrations/*.sql 순차 적용
npm run seed-admin    # ADMIN_EMAIL_ALLOWLIST 를 app_users 에 admin 으로 시드
npm run sync-forms    # forms/*/v*.yaml → form_versions 동기화
npm run dev
```

브라우저에서 http://localhost:3000/login → Google 로그인 → `/admin` 으로 이동.

### 6. Vercel 배포
1. Vercel 에서 New Project → GitHub 레포 연결
2. 위 환경변수를 Vercel Environment Variables 에 그대로 등록 (단, `NEXT_PUBLIC_APP_URL` 은 배포 도메인으로)
3. Build Command: `npm run build` (이미 `next build --webpack` 로 설정됨)
4. 첫 배포 후 도메인을 Supabase Authentication → URL Configuration 에 추가

---

## 디자인 시스템

`app/globals.css` 에 **Pixelab Document Design System v2.0** 의 모든 토큰과 컴포넌트 클래스가 1:1 포팅되어 있습니다. 새 양식·페이지를 만들 때는 `components/dds/` 의 React 컴포넌트만 조합해 사용합니다 — 새로운 색·폰트는 만들지 않습니다.

A4 인쇄 호환을 유지하므로 응답 페이지(`/r/[token]`)와 응답 상세(`/admin/responses/[id]`) 모두 PDF 인쇄 시 종이 양식과 동일한 레이아웃이 나옵니다.

---

## 양식(YAML) 추가

`forms/{slug}/v{N}.yaml` 파일을 만들고 `npm run sync-forms` 실행. 자세한 가이드는 [forms/README.md](forms/README.md) 참조.

새 양식 카테고리를 추가하려면 `lib/schema/form-schema.ts` 의 `FormCategory` 와 `supabase/migrations/0001_init.sql` 의 `form_templates.category` CHECK 제약을 함께 수정.

---

## 폴더

```
app/
├── (admin)/admin/             관리자 대시보드 (admin 역할 필요)
│   ├── page.tsx               KPI 대시보드
│   ├── templates/             양식 카탈로그
│   ├── links/{,new}/          응답 링크 발급/조회
│   ├── responses/{,[id]}/     응답 모음 + 상세 (read-only render)
│   ├── culture/               8양식 평균/편차 시각화 + CSV 내보내기
│   ├── candidates/{,[id]}/    후보자 풀 칸반
│   ├── employees/{,[id]}/     직원 마스터 + 1on1 히스토리 + 신호
│   ├── retention/             신호 대시보드 (해결/재오픈)
│   └── users/                 app_users 관리
├── login/                     Google OAuth 로그인
├── auth/callback/             OAuth 콜백 (allowlist 검증)
├── access-denied/             allowlist 외 거부 페이지
├── r/[token]/{,done}/         응답자 페이지 (인증 불필요)
├── api/r/[token]/submit/      응답 제출 API
└── preview/{,[slug]}/         양식 미리보기 (인증 불필요)

components/
├── dds/                       DDS v2.0 컴포넌트 (14개)
├── form-renderer/             SchemaRenderer + ResponderForm
├── charts/                    CultureRadar, CultureBars
└── admin/                     AdminPage, AdminButton, LogoutButton

lib/
├── schema/                    Zod FormSchema + YAML loader
├── supabase/                  browser/server/admin clients
├── db/                        Drizzle schema + postgres client
├── auth/                      session helper + allowlist
├── analytics/                 culture-aggregate, csv, extract-signals
├── response/lookups.ts        token → schema resolver
└── tokens.ts                  nanoid(16)

forms/                         YAML 양식 정의
scripts/                       db-migrate, sync-forms, seed-admin
supabase/migrations/           1_init / 2_candidates / 3_employees+retention / 4_rls / 5_helpers
middleware.ts                  Supabase 세션 쿠키 갱신
```

---

## 핵심 설계 결정

- **양식 = YAML in-repo, DB 동기화** — 코드 PR 로 양식을 변경, `sync-forms` 가 hash 변화만 감지해 새 버전 발행
- **응답 시점 스키마 박제** — `form_responses.schema_snapshot_json` 에 응답 시점의 양식이 그대로 저장. 추후 양식이 바뀌어도 응답은 옛 모습 그대로 재현 가능
- **응답 링크는 발급 시점의 버전에 고정** — 새 버전 발행해도 기존 토큰은 옛 버전으로 응답 받음
- **익명 양식의 익명성** — `anonymous: true` 인 양식은 IP/UA/이메일 미수집. RLS 가 한 번 더 검증
- **Google OAuth + 화이트리스트** — `app_users` 테이블에 등록되지 않은 Gmail 은 거부. ADMIN_EMAIL_ALLOWLIST 환경변수로 첫 admin 부트스트랩
- **리텐션 신호 자동 추출** — 1on1 응답에 `check-group` 으로 `rights_negotiation` / `gossip` / `accountability` 등 표준 키가 체크되면 `retention_signals` 에 자동 등록 (링크가 직원과 연결된 경우)

---

## Open Questions

플랜 단계에서 사용자 입력이 필요해 비워둔 항목:
- 직무별 면접 질문지 YAML 5종 (form-interview-q-doctor 등) — 사용자가 직무별 핵심 역량을 확정해 주면 양식 작성
- 60/90일 1on1 양식 — 30일 양식과 동일 구조에서 합의 점검 위주로 가지치기 필요
- Vercel 배포 후 사내 운영 매뉴얼(인사 입장 onboarding)
