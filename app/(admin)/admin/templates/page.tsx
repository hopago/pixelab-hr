import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminPage } from "@/components/admin/AdminPage";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  culture: "조직문화",
  onboarding: "1on1 / 온보딩",
  "interview-q": "면접 질문지",
  "interview-eval": "면접 평가지",
  exit: "퇴직 면담",
};

export default async function TemplatesPage() {
  const admin = createSupabaseAdminClient();
  const { data: templates } = await admin
    .from("form_templates")
    .select("id, slug, category, name, current_version_id, updated_at")
    .order("category")
    .order("name");

  const { data: versions } = await admin
    .from("form_versions")
    .select("template_id, version_number, published_at")
    .order("version_number", { ascending: false });

  const versionsByTemplate = new Map<string, typeof versions>();
  for (const v of versions ?? []) {
    const arr = versionsByTemplate.get(v.template_id) ?? [];
    arr.push(v);
    versionsByTemplate.set(v.template_id, arr);
  }

  return (
    <AdminPage
      eyebrow="Admin · Templates"
      title="양식"
      description="forms/ 디렉토리의 YAML이 form_templates / form_versions 테이블에 동기화된 결과입니다. 새 버전을 발행하려면 YAML을 추가하고 npm run sync-forms 를 실행합니다."
    >
      <div
        style={{
          background: "var(--color-paper)",
          border: "1px solid var(--color-line)",
        }}
      >
        <table
          className="px-table"
          style={{ background: "var(--color-paper)" }}
        >
          <thead>
            <tr>
              <th style={{ width: "20%" }}>슬러그</th>
              <th style={{ width: "16%" }}>카테고리</th>
              <th>이름</th>
              <th style={{ width: "20%" }}>버전</th>
            </tr>
          </thead>
          <tbody>
            {(templates ?? []).map((t) => (
              <tr key={t.id}>
                <td>
                  <span className="px-cell-key">{t.slug}</span>
                </td>
                <td>{CATEGORY_LABEL[t.category] ?? t.category}</td>
                <td>
                  <Link
                    href={`/preview/${t.slug}`}
                    style={{ color: "var(--color-ink)" }}
                  >
                    {t.name}
                  </Link>
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                  {(versionsByTemplate.get(t.id) ?? [])
                    .map((v) => `v${v.version_number}`)
                    .join(" · ")}
                </td>
              </tr>
            ))}
            {(!templates || templates.length === 0) && (
              <tr>
                <td colSpan={4} style={{ color: "var(--color-mute)" }}>
                  아직 동기화된 양식이 없습니다. <code>npm run sync-forms</code>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}
