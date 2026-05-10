import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { FormSchema } from "@/lib/schema/form-schema";
import { SchemaRenderer } from "@/components/form-renderer/SchemaRenderer";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function ResponseDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { data: response } = await admin
    .from("form_responses")
    .select("id, schema_snapshot_json, payload_json, submitted_at, submitter_email, submitter_meta")
    .eq("id", id)
    .maybeSingle();
  if (!response) notFound();

  let schema;
  try {
    schema = FormSchema.parse(response.schema_snapshot_json);
  } catch {
    notFound();
  }

  const isAnonymous = !response.submitter_email;
  const values = (response.payload_json ?? {}) as Record<string, unknown>;

  return (
    <div>
      {/* meta strip above the rendered form */}
      <div className="bg-ink text-paper px-5 py-3 md:px-12 md:py-4 font-mono text-[10px] md:text-[11px] tracking-[0.06em] uppercase flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2">
        <span className="opacity-55">RESPONSE</span>
        <span>{schema.doc_id} · v{schema.version}</span>
        <span className="opacity-55">SUBMITTED</span>
        <span>{new Date(response.submitted_at).toLocaleString("ko-KR")}</span>
        <span className="opacity-55">BY</span>
        <span>{isAnonymous ? "(익명)" : response.submitter_email}</span>
        <span className="md:ml-auto">
          <a
            href="/admin/responses"
            className="text-paper opacity-85 no-underline hover:opacity-100"
          >
            ← 응답 목록
          </a>
        </span>
      </div>

      <SchemaRenderer form={schema} readOnlyValues={values} />
    </div>
  );
}
