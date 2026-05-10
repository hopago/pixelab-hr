import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminPage } from "@/components/admin/AdminPage";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  culture: "조직문화",
  onboarding: "1on1 / 온보딩",
  "interview-q": "면접 질문지",
  "interview-eval": "면접 평가지",
  exit: "퇴직",
};

export default async function ResponsesListPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const sp = await searchParams;
  const admin = createSupabaseAdminClient();

  const { data: responses } = await admin
    .from("form_responses")
    .select(
      "id, link_id, version_id, submitted_at, submitter_email, submitter_meta",
    )
    .order("submitted_at", { ascending: false })
    .limit(300);

  const versionIds = Array.from(
    new Set((responses ?? []).map((r) => r.version_id)),
  );
  const { data: versions } = await admin
    .from("form_versions")
    .select("id, template_id, version_number")
    .in("id", versionIds.length ? versionIds : ["00000000-0000-0000-0000-000000000000"]);

  const templateIds = Array.from(new Set((versions ?? []).map((v) => v.template_id)));
  const { data: templates } = await admin
    .from("form_templates")
    .select("id, slug, name, category")
    .in("id", templateIds.length ? templateIds : ["00000000-0000-0000-0000-000000000000"]);

  const linkIds = Array.from(new Set((responses ?? []).map((r) => r.link_id)));
  const { data: links } = await admin
    .from("form_links")
    .select("id, target_name")
    .in("id", linkIds.length ? linkIds : ["00000000-0000-0000-0000-000000000000"]);

  const versionMap = new Map(
    (versions ?? []).map((v) => [v.id, v]),
  );
  const templateMap = new Map((templates ?? []).map((t) => [t.id, t]));
  const linkMap = new Map((links ?? []).map((l) => [l.id, l]));

  const filtered = sp.template
    ? (responses ?? []).filter((r) => {
        const v = versionMap.get(r.version_id);
        if (!v) return false;
        const t = templateMap.get(v.template_id);
        return t?.slug === sp.template;
      })
    : responses ?? [];

  return (
    <AdminPage
      eyebrow="Admin · Responses"
      title="모인 응답"
      description="최근 300건. 양식별 필터를 적용하면 해당 양식 응답만 표시됩니다."
    >
      <FilterBar templates={templates ?? []} active={sp.template} />

      <div className="bg-paper border border-line mt-5 md:mt-6">
        <div className="px-table-wrap">
        <table className="px-table">
          <thead>
            <tr>
              <th style={{ width: "18%" }}>제출 시각</th>
              <th>양식</th>
              <th>대상자 / 응답자</th>
              <th style={{ width: "8%" }}>익명</th>
              <th style={{ width: "12%" }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const v = versionMap.get(r.version_id);
              const t = v ? templateMap.get(v.template_id) : undefined;
              const link = linkMap.get(r.link_id);
              const isAnonymous = !r.submitter_email;
              return (
                <tr key={r.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {new Date(r.submitted_at).toLocaleString("ko-KR")}
                  </td>
                  <td>
                    {t ? (
                      <span>
                        [{CATEGORY_LABEL[t.category] ?? t.category}]{" "}
                        {t.name}{" "}
                        <span style={{ color: "var(--color-mute)" }}>
                          v{v?.version_number}
                        </span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {isAnonymous
                      ? "(익명)"
                      : (r.submitter_email ?? link?.target_name ?? "—")}
                  </td>
                  <td>
                    {isAnonymous ? (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--color-mute)",
                        }}
                      >
                        ANON
                      </span>
                    ) : (
                      ""
                    )}
                  </td>
                  <td>
                    <Link
                      href={`/admin/responses/${r.id}`}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--color-ink)",
                        borderBottom: "1px solid var(--color-ink)",
                        textDecoration: "none",
                      }}
                    >
                      열기 →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ color: "var(--color-mute)" }}>
                  아직 응답이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </AdminPage>
  );
}

function FilterBar({
  templates,
  active,
}: {
  templates: Array<{ id: string; slug: string; name: string }>;
  active?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--spacing-s2)",
        flexWrap: "wrap",
      }}
    >
      <FilterChip href="/admin/responses" active={!active}>
        전체
      </FilterChip>
      {templates.map((t) => (
        <FilterChip
          key={t.id}
          href={`/admin/responses?template=${t.slug}`}
          active={active === t.slug}
        >
          {t.name}
        </FilterChip>
      ))}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "6px 10px",
        border: "1px solid var(--color-ink)",
        background: active ? "var(--color-ink)" : "var(--color-paper)",
        color: active ? "var(--color-paper)" : "var(--color-ink)",
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}
