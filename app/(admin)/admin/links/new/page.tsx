import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminPage } from "@/components/admin/AdminPage";
import { LinkIssuanceForm } from "./LinkIssuanceForm";

export const dynamic = "force-dynamic";

export default async function NewLinkPage() {
  const admin = createSupabaseAdminClient();
  const { data: templates } = await admin
    .from("form_templates")
    .select("id, slug, name, category, current_version_id")
    .order("category")
    .order("name");

  const { data: versions } = await admin
    .from("form_versions")
    .select("id, template_id, version_number, published_at")
    .order("version_number", { ascending: false });

  const versionsByTemplate = new Map<
    string,
    Array<{ id: string; version_number: number }>
  >();
  for (const v of versions ?? []) {
    const arr = versionsByTemplate.get(v.template_id) ?? [];
    arr.push({ id: v.id, version_number: v.version_number });
    versionsByTemplate.set(v.template_id, arr);
  }

  const options = (templates ?? []).map((t) => ({
    templateId: t.id,
    slug: t.slug,
    name: t.name,
    category: t.category,
    currentVersionId: t.current_version_id,
    versions: versionsByTemplate.get(t.id) ?? [],
  }));

  return (
    <AdminPage
      eyebrow="Admin · Links"
      title="응답 링크 발급"
      description="양식 버전과 대상자를 선택해 응답 링크를 만듭니다. 일괄 모드에서는 한 줄에 한 명씩 이름을 입력하면 N개의 토큰이 한 번에 만들어집니다."
    >
      <LinkIssuanceForm options={options} />
    </AdminPage>
  );
}
