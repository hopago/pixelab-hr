import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { FormSchema } from "@/lib/schema/form-schema";
import { aggregateCulture } from "@/lib/analytics/culture-aggregate";
import { AdminPage } from "@/components/admin/AdminPage";
import { CultureRadar } from "@/components/charts/CultureRadar";
import { CultureBars } from "@/components/charts/CultureBars";
import { CultureExport } from "./CultureExport";

export const dynamic = "force-dynamic";

export default async function CulturePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const sp = await searchParams;
  const admin = createSupabaseAdminClient();

  // Load all culture-category templates.
  const { data: templates } = await admin
    .from("form_templates")
    .select("id, slug, name, current_version_id")
    .eq("category", "culture")
    .order("name");

  if (!templates || templates.length === 0) {
    return (
      <AdminPage
        eyebrow="Admin · Culture"
        title="조직문화"
        description="조직문화 카테고리에 등록된 양식이 없습니다. forms/diag-culture-16q/v2.yaml 같은 culture 양식을 추가하고 sync-forms를 실행해 주세요."
      >
        <p style={{ color: "var(--color-mute)" }}>—</p>
      </AdminPage>
    );
  }

  const targetSlug = sp.template ?? templates[0].slug;
  const targetTemplate =
    templates.find((t) => t.slug === targetSlug) ?? templates[0];

  // Pull all responses for any version of this template.
  const { data: versions } = await admin
    .from("form_versions")
    .select("id, version_number")
    .eq("template_id", targetTemplate.id);

  const versionIds = (versions ?? []).map((v) => v.id);

  let responses: Array<{
    payload_json: Record<string, unknown>;
    schema_snapshot_json: unknown;
    submitted_at: string;
  }> = [];

  if (versionIds.length > 0) {
    const { data } = await admin
      .from("form_responses")
      .select("payload_json, schema_snapshot_json, submitted_at")
      .in("version_id", versionIds);
    responses = (data ?? []) as typeof responses;
  }

  // Use the current version's schema for cluster definitions.
  const { data: currentVersion } = await admin
    .from("form_versions")
    .select("schema_json")
    .eq("id", targetTemplate.current_version_id ?? versionIds[0])
    .maybeSingle();

  const schema = FormSchema.parse(currentVersion?.schema_json);
  const aggregate = aggregateCulture(
    schema,
    responses.map((r) => r.payload_json),
  );

  const chartData = aggregate.clusters.map((c) => ({
    name: c.name,
    tag: c.tag,
    mean: c.mean,
    sd: c.sd,
  }));

  return (
    <AdminPage
      eyebrow="Admin · Culture"
      title={targetTemplate.name}
      description={`${aggregate.totalResponses}건의 응답을 8양식 클러스터로 집계했습니다. 익명 양식이므로 누가 어떻게 답했는지는 보지 않고, 평균과 편차만 봅니다.`}
      action={
        <CultureExport
          slug={targetTemplate.slug}
          aggregate={aggregate}
          totalResponses={aggregate.totalResponses}
        />
      }
    >
      {templates.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: "var(--spacing-s5)",
            flexWrap: "wrap",
          }}
        >
          {templates.map((t) => (
            <Link
              key={t.id}
              href={`/admin/culture?template=${t.slug}`}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "6px 10px",
                border: "1px solid var(--color-ink)",
                background:
                  t.slug === targetSlug
                    ? "var(--color-ink)"
                    : "var(--color-paper)",
                color:
                  t.slug === targetSlug
                    ? "var(--color-paper)"
                    : "var(--color-ink)",
                textDecoration: "none",
              }}
            >
              {t.name}
            </Link>
          ))}
        </div>
      )}

      {aggregate.totalResponses === 0 ? (
        <div
          style={{
            background: "var(--color-paper)",
            border: "1px solid var(--color-line)",
            padding: "var(--spacing-s7)",
            textAlign: "center",
            color: "var(--color-mute)",
          }}
        >
          아직 응답이 없습니다. 응답이 들어오면 여기에 차트가 그려집니다.
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--spacing-s5)",
              marginBottom: "var(--spacing-s7)",
            }}
          >
            <ChartCard title="8양식 평균 · 레이더">
              <CultureRadar
                data={chartData.map((d) => ({ name: d.name, mean: d.mean }))}
              />
            </ChartCard>
            <ChartCard title="8양식 평균 · 막대 (3.5점 이상은 강조)">
              <CultureBars data={chartData} />
            </ChartCard>
          </div>

          <div
            style={{
              background: "var(--color-paper)",
              border: "1px solid var(--color-line)",
            }}
          >
            <table className="px-table">
              <thead>
                <tr>
                  <th style={{ width: "8%" }}>태그</th>
                  <th style={{ width: "16%" }}>양식</th>
                  <th>키워드</th>
                  <th style={{ width: "10%" }}>평균</th>
                  <th style={{ width: "10%" }}>편차 σ</th>
                  <th style={{ width: "10%" }}>응답수</th>
                </tr>
              </thead>
              <tbody>
                {aggregate.clusters.map((c) => (
                  <tr key={c.tag}>
                    <td>
                      <span className="px-cell-key">{c.tag}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--color-mute)",
                      }}
                    >
                      {c.keywords ?? "—"}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>
                      {c.mean.toFixed(2)}
                    </td>
                    <td
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-mute)",
                      }}
                    >
                      {c.sd.toFixed(2)}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{c.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminPage>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--color-paper)",
        border: "1px solid var(--color-line)",
        padding: "var(--spacing-s5)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-meta)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--color-ink-4)",
          marginBottom: "var(--spacing-s4)",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
