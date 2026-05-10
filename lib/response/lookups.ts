import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { FormSchema } from "@/lib/schema/form-schema";

/**
 * Server-side resolution of a response token to its form version + schema.
 * Service-role: bypasses RLS so anonymous responders can read.
 */
export type LinkResolution =
  | {
      ok: true;
      link: {
        id: string;
        token: string;
        version_id: string;
        target_name: string | null;
        expires_at: string | null;
        max_uses: number;
        use_count: number;
        candidate_id: string | null;
        employee_id: string | null;
      };
      version: {
        id: string;
        template_id: string;
        version_number: number;
      };
      form: import("@/lib/schema/form-schema").FormSchema;
    }
  | { ok: false; reason: "not-found" | "expired" | "exhausted" };

export async function resolveTokenForResponse(
  token: string,
): Promise<LinkResolution> {
  const admin = createSupabaseAdminClient();

  const { data: link } = await admin
    .from("form_links")
    .select(
      "id, token, version_id, target_name, expires_at, max_uses, use_count, candidate_id, employee_id",
    )
    .eq("token", token)
    .maybeSingle();

  if (!link) return { ok: false, reason: "not-found" };
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return { ok: false, reason: "expired" };
  }
  if (link.use_count >= link.max_uses) {
    return { ok: false, reason: "exhausted" };
  }

  const { data: version } = await admin
    .from("form_versions")
    .select("id, template_id, version_number, schema_json")
    .eq("id", link.version_id)
    .maybeSingle();
  if (!version) return { ok: false, reason: "not-found" };

  const form = FormSchema.parse(version.schema_json);
  return {
    ok: true,
    link,
    version: {
      id: version.id,
      template_id: version.template_id,
      version_number: version.version_number,
    },
    form,
  };
}
