import Link from "next/link";
import { listFormYamls, loadFormYaml } from "@/lib/schema/load-yaml";
import { PublicShell } from "@/components/public/PublicShell";

export const dynamic = "force-static";

const CATEGORY_LABEL: Record<string, string> = {
  culture: "조직문화",
  onboarding: "1on1 / 온보딩",
  "interview-q": "면접 질문지",
  "interview-eval": "면접 평가지",
  exit: "퇴직 면담",
};

const CATEGORY_DESC: Record<string, string> = {
  culture: "익명 응답으로 우리 분위기를 측정합니다.",
  onboarding: "입사 직후 적응 점검을 위한 1on1 양식입니다.",
  "interview-q": "직무별 면접 질문지로 같은 기준에서 만납니다.",
  "interview-eval": "면접관별 평가를 라운드 단위로 모읍니다.",
  exit: "퇴직 시점에 솔직한 의견을 회수합니다.",
};

export default async function PreviewIndex() {
  const yamls = await listFormYamls();

  // Group by slug, take latest version per slug
  const bySlug = new Map<string, { absPath: string; version: string }>();
  for (const y of yamls) {
    const cur = bySlug.get(y.slug);
    if (!cur || y.version > cur.version) bySlug.set(y.slug, y);
  }

  type FormCard = {
    slug: string;
    name: string;
    category: string;
    version: number;
    versions: string[];
  };
  const cards: FormCard[] = [];
  for (const [slug, y] of bySlug.entries()) {
    try {
      const { schema } = await loadFormYaml(y.absPath);
      cards.push({
        slug,
        name: schema.name,
        category: schema.category,
        version: schema.version,
        versions: yamls
          .filter((x) => x.slug === slug)
          .map((x) => x.version)
          .sort()
          .reverse(),
      });
    } catch {
      // skip
    }
  }
  cards.sort((a, b) => a.category.localeCompare(b.category));

  // Group cards by category
  const byCategory = new Map<string, FormCard[]>();
  for (const c of cards) {
    const arr = byCategory.get(c.category) ?? [];
    arr.push(c);
    byCategory.set(c.category, arr);
  }

  return (
    <PublicShell>
      <section className="border-b border-line bg-paper">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-12 md:pb-16">
          <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink mb-4 flex items-center gap-3">
            <span className="inline-block w-6 h-px bg-accent" />
            Form Preview
          </div>
          <h1 className="text-[32px] md:text-[48px] font-extrabold tracking-[-0.03em] leading-[1.05] mb-4 break-keep">
            발행된 양식
            <br />
            그대로 보기.
          </h1>
          <p className="text-[14.5px] md:text-[16px] text-ink-4 leading-[1.7] max-w-[60ch]">
            forms/ 디렉토리의 YAML이 SchemaRenderer로 렌더링됩니다. 인쇄 미리보기에서
            그대로 PDF로 저장하면 종이 양식과 동일한 레이아웃이 나옵니다.
            응답을 받으려면 <Link href="/admin/links/new" className="underline underline-offset-2 text-ink hover:text-accent">관리자 → 링크 발급</Link>
            에서 응답 토큰을 만들어 주세요.
          </p>
        </div>
      </section>

      <section className="bg-surface">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-12 md:py-16">
          {cards.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-12 md:space-y-16">
              {Array.from(byCategory.entries()).map(([cat, items], idx) => (
                <div key={cat}>
                  <div className="flex items-baseline gap-4 border-t border-ink pt-4 pb-5 mb-6">
                    <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-mute">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-[20px] md:text-[24px] font-bold tracking-[-0.02em] m-0 flex-1">
                      {CATEGORY_LABEL[cat] ?? cat}
                    </h2>
                    <span className="font-mono text-[11px] text-mute">
                      {items.length} FORM{items.length !== 1 ? "S" : ""}
                    </span>
                  </div>
                  {CATEGORY_DESC[cat] && (
                    <p className="text-[13.5px] md:text-[14px] text-ink-4 leading-[1.7] mb-5 max-w-[60ch]">
                      {CATEGORY_DESC[cat]}
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {items.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/preview/${c.slug}`}
                        className="
                          block bg-paper border border-line
                          p-5 md:p-6 no-underline text-inherit
                          transition-all duration-200
                          hover:border-ink hover:-translate-y-px
                          hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.15)]
                          group
                        "
                      >
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-mute">
                            {c.slug}
                          </span>
                          <span className="font-mono text-[10px] tracking-[0.06em] text-mute">
                            v{c.version}
                          </span>
                        </div>
                        <div className="text-[15px] md:text-[16px] font-semibold mb-3 break-keep">
                          {c.name}
                        </div>
                        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-line">
                          <div className="font-mono text-[10px] text-mute">
                            VERSIONS · {c.versions.join(" / ")}
                          </div>
                          <div className="font-mono text-[11px] text-ink-4 group-hover:text-ink transition-colors">
                            열기 →
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicShell>
  );
}

function Empty() {
  return (
    <div className="bg-paper border border-line p-12 text-center">
      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-mute mb-3">
        No Forms Yet
      </div>
      <p className="text-[14px] text-ink-4 leading-[1.7] max-w-[40ch] mx-auto">
        아직 등록된 양식이 없습니다. forms/ 디렉토리에 YAML 파일을 추가하면
        여기에 자동으로 표시됩니다.
      </p>
    </div>
  );
}
