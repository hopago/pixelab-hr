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
      <div
        style={{
          padding: "var(--spacing-s4) var(--spacing-s8)",
          background: "var(--color-ink)",
          color: "var(--color-paper)",
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-s5)",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        <span style={{ opacity: 0.55 }}>RESPONSE</span>
        <span>{schema.doc_id} · v{schema.version}</span>
        <span style={{ opacity: 0.55 }}>SUBMITTED</span>
        <span>{new Date(response.submitted_at).toLocaleString("ko-KR")}</span>
        <span style={{ opacity: 0.55 }}>BY</span>
        <span>{isAnonymous ? "(익명)" : response.submitter_email}</span>
        <span style={{ marginLeft: "auto" }}>
          <a
            href="/admin/responses"
            style={{
              color: "var(--color-paper)",
              textDecoration: "none",
              opacity: 0.85,
            }}
          >
            ← 응답 목록
          </a>
        </span>
      </div>

      <SchemaRenderer form={schema} readOnlyValues={values} />
    </div>
  );
}
