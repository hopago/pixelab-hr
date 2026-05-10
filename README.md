# Pixelab HR

픽셀랩성형외과의원 인사 관리 사내 웹앱.

5개 영역을 한 곳에서:
1. **조직문화 진단** — 16문항 양식, 익명 응답, 8양식 클러스터 시각화
2. **인사 면담 기록** — 30/60/90일 1on1, 인사 에스컬레이션
3. **면접 평가 & 질문지** — 직무별 질문지, 면접관별 평가지
4. **핵심인재 유치** — 후보자 풀, 단계 트래킹
5. **리텐션** — 직원 마스터, 1on1 히스토리, 신호 타임라인

## Stack

- **Next.js 16.2** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4** (DDS v2.0 토큰 포팅)
- **Supabase** (Postgres + Row Level Security + Google OAuth)
- **Drizzle ORM**
- **react-hook-form + Zod**
- **Recharts** (조직문화 시각화)

## 디자인 시스템

`app/globals.css`에 **Pixelab Document Design System v2.0**의 모든 토큰과 컴포넌트 클래스가 1:1 포팅되어 있습니다. 새 양식·페이지를 만들 때는 `components/dds/`의 React 컴포넌트만 조합해 사용합니다 — 새로운 색·폰트는 만들지 않습니다.

## 양식(YAML) 추가

`forms/` 디렉토리에 YAML 파일을 추가하고 `npm run sync-forms` 를 실행하면 `form_versions` 테이블에 새 버전이 등록됩니다. 자세한 가이드는 `forms/README.md` 참조.

## 로컬 개발

```bash
npm install
cp .env.example .env.local   # Supabase 자격증명 입력
npm run dev
```

## 폴더

```
app/                          Next.js App Router
components/dds/               DDS v2.0 컴포넌트 (14개)
components/form-renderer/     YAML 스키마 → React 폼 렌더러
lib/                          Supabase 클라이언트, 유틸, 토큰, 분석
forms/                        YAML 양식 정의 (버전별)
scripts/                      sync-forms, seed-admin
supabase/migrations/          DB 스키마 + RLS
```
