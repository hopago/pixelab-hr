import Link from "next/link";
import { listFormYamls, loadFormYaml } from "@/lib/schema/load-yaml";
import { PublicShell } from "@/components/public/PublicShell";
import { getSessionOrNull } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const DOMAINS: Array<{
  no: string;
  title: string;
  desc: string;
  examples: string[];
}> = [
  {
    no: "01",
    title: "조직문화 진단",
    desc: "16문항 익명 설문으로 픽셀랩의 8양식 분포를 본다. 매월 측정해 EVP 정의의 근거로.",
    examples: ["배려", "목표", "학습", "즐거움", "결과", "권위", "안전", "질서"],
  },
  {
    no: "02",
    title: "인사 면담 기록",
    desc: "30/60/90일 1on1을 같은 형식으로 받아 시점별 변화를 추적하고, 인사 에스컬레이션은 자동.",
    examples: ["입사 30일", "60일 점검", "90일 마일스톤"],
  },
  {
    no: "03",
    title: "면접 평가 & 질문지",
    desc: "직무별 질문지와 면접관 평가지를 분리. 한 후보자에 대한 모든 라운드를 한 화면에 묶어본다.",
    examples: ["직무별 질문지", "STAR 평가지", "라운드별 추천도"],
  },
  {
    no: "04",
    title: "핵심인재 유치",
    desc: "후보자 풀을 단계(발굴 → 입사)로 추적. 발급된 평가 링크와 응답이 후보자별로 자동 정리.",
    examples: ["단계 칸반", "후보자 메모", "유입 경로"],
  },
  {
    no: "05",
    title: "리텐션",
    desc: "직원 마스터에 1on1 히스토리·신호 타임라인을 묶어, 적응·이탈 신호를 한눈에.",
    examples: ["적응 신호", "이탈 신호", "처우 질의"],
  },
];

const CATEGORY_LABEL: Record<string, string> = {
  culture: "조직문화",
  onboarding: "1on1 / 온보딩",
  "interview-q": "면접 질문지",
  "interview-eval": "면접 평가지",
  exit: "퇴직",
};

async function loadAvailableForms() {
  const yamls = await listFormYamls();
  // Group by slug, take latest version per slug
  const bySlug = new Map<string, { absPath: string; version: string }>();
  for (const y of yamls) {
    const cur = bySlug.get(y.slug);
    if (!cur || y.version > cur.version) bySlug.set(y.slug, y);
  }
  const out: Array<{
    slug: string;
    name: string;
    category: string;
    version: number;
  }> = [];
  for (const [slug, y] of bySlug.entries()) {
    try {
      const { schema } = await loadFormYaml(y.absPath);
      out.push({
        slug,
        name: schema.name,
        category: schema.category,
        version: schema.version,
      });
    } catch {
      // skip invalid
    }
  }
  return out.sort((a, b) => a.category.localeCompare(b.category));
}

export default async function Home() {
  const [session, forms] = await Promise.all([
    getSessionOrNull(),
    loadAvailableForms(),
  ]);

  return (
    <PublicShell>
      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="border-b border-line bg-paper">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-16 md:pb-24">
          <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink mb-5 flex items-center gap-3">
            <span className="inline-block w-6 h-px bg-accent" />
            Pixelab · Beauty Clinic HR
          </div>

          <h1 className="text-[40px] md:text-[64px] lg:text-[80px] font-extrabold tracking-[-0.035em] leading-[1.02] m-0 mb-6 md:mb-8 break-keep">
            픽셀랩의 사람과 양식,
            <br />
            한 곳에서.
          </h1>

          <p className="text-[15px] md:text-[17px] text-ink-4 leading-[1.7] max-w-[60ch] mb-10 md:mb-12">
            조직문화 진단부터 입사 30일 1on1, 면접 평가, 핵심인재 풀, 리텐션
            신호까지 한 화면에서. <strong className="text-ink font-semibold">양식은
            YAML 한 파일로 정의</strong>하고, 응답은 시점·버전이 박제되어 보존됩니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            {session ? (
              <Link
                href="/admin"
                className="
                  inline-flex items-center justify-center
                  bg-ink text-paper
                  font-mono text-[12px] md:text-[13px] tracking-[0.08em] uppercase
                  px-7 py-4 border border-ink no-underline
                  hover:bg-ink-3 transition-colors
                "
              >
                관리자 대시보드 열기 →
              </Link>
            ) : (
              <Link
                href="/login"
                className="
                  inline-flex items-center justify-center
                  bg-ink text-paper
                  font-mono text-[12px] md:text-[13px] tracking-[0.08em] uppercase
                  px-7 py-4 border border-ink no-underline
                  hover:bg-ink-3 transition-colors
                "
              >
                Google로 로그인 →
              </Link>
            )}
            <Link
              href="/preview"
              className="
                inline-flex items-center justify-center
                bg-paper text-ink
                font-mono text-[12px] md:text-[13px] tracking-[0.08em] uppercase
                px-7 py-4 border border-ink no-underline
                hover:bg-surface transition-colors
              "
            >
              양식 미리보기
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 5 Domains ────────────────────────────────── */}
      <section className="bg-surface">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-16 md:py-20">
          <SectionHeader num="01" title="다섯 영역" aside="DOMAINS" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            {DOMAINS.map((d) => (
              <article
                key={d.no}
                className="
                  bg-paper border border-line
                  p-6 md:p-7
                  transition-all duration-200
                  hover:border-ink hover:-translate-y-px
                  hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.15)]
                "
              >
                <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-mute mb-4">
                  {d.no}
                </div>
                <h3 className="text-[18px] md:text-[20px] font-bold tracking-[-0.015em] mb-3 break-keep">
                  {d.title}
                </h3>
                <p className="text-[13.5px] md:text-[14px] text-ink-4 leading-[1.65] mb-5 break-keep">
                  {d.desc}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {d.examples.map((e) => (
                    <span
                      key={e}
                      className="
                        inline-block
                        font-mono text-[10px] tracking-[0.04em] uppercase
                        text-ink-4
                        px-2 py-1 border border-line
                      "
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Available Forms ──────────────────────────── */}
      <section className="bg-paper border-t border-line">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-16 md:py-20">
          <SectionHeader
            num="02"
            title="현재 발행된 양식"
            aside={`${forms.length} FORMS`}
          />
          {forms.length === 0 ? (
            <p className="text-[14px] text-mute">
              아직 등록된 양식이 없습니다. forms/ 디렉토리에 YAML을 추가해 주세요.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {forms.map((f) => (
                <Link
                  key={f.slug}
                  href={`/preview/${f.slug}`}
                  className="
                    block bg-surface-2 border border-line
                    p-5 md:p-6
                    no-underline text-inherit
                    transition-all duration-200
                    hover:border-ink hover:bg-paper
                    group
                  "
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-mute">
                      {CATEGORY_LABEL[f.category] ?? f.category}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.06em] text-mute">
                      v{f.version}
                    </span>
                  </div>
                  <div className="text-[15px] md:text-[16px] font-semibold mb-1 break-keep">
                    {f.name}
                  </div>
                  <div className="font-mono text-[11px] text-ink-4 group-hover:text-ink transition-colors">
                    {f.slug} →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── How it Works ─────────────────────────────── */}
      <section className="bg-surface border-t border-line">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-16 md:py-20">
          <SectionHeader num="03" title="어떻게 동작하나" aside="FLOW" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
            <FlowStep
              num="A"
              title="인사가 링크를 발급"
              body="양식·대상·만료를 정해 단건 또는 일괄로 토큰 URL을 만듭니다. CSV로 받아 카톡·이메일에 붙여넣으면 끝."
            />
            <FlowStep
              num="B"
              title="응답자가 채워 제출"
              body="브라우저로 링크를 열고 종이 양식과 똑같이 생긴 화면에 답합니다. 익명 양식은 IP/UA도 수집되지 않습니다."
            />
            <FlowStep
              num="C"
              title="인사가 모아본다"
              body="응답은 시점의 양식 스키마와 함께 박제됩니다. 양식이 바뀌어도 옛 응답은 그대로 보입니다."
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

function SectionHeader({
  num,
  title,
  aside,
}: {
  num: string;
  title: string;
  aside?: string;
}) {
  return (
    <header className="flex items-baseline gap-4 border-t border-ink pt-4 pb-5 mb-8 md:mb-10">
      <span className="font-mono text-[12px] font-medium tracking-[0.06em] text-ink">
        {num}
      </span>
      <h2 className="text-[22px] md:text-[28px] font-bold tracking-[-0.02em] m-0 flex-1 break-keep">
        {title}
      </h2>
      {aside && (
        <span className="font-mono text-[11px] tracking-[0.06em] text-mute">
          {aside}
        </span>
      )}
    </header>
  );
}

function FlowStep({
  num,
  title,
  body,
}: {
  num: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div
        className="
          inline-flex items-center justify-center
          w-9 h-9 mb-4
          bg-ink text-paper
          font-mono text-[14px] font-semibold
        "
      >
        {num}
      </div>
      <h4 className="text-[16px] md:text-[17px] font-semibold mb-2 break-keep">
        {title}
      </h4>
      <p className="text-[13.5px] md:text-[14px] text-ink-4 leading-[1.7] break-keep">
        {body}
      </p>
    </div>
  );
}
