import { NextResponse, type NextRequest } from "next/server";
import { resolveTokenForResponse } from "@/lib/response/lookups";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { collectResponseKeys } from "@/lib/schema/form-schema";

type SubmitBody = {
  values?: Record<string, unknown>;
};

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;

  let body: SubmitBody;
  try {
    body = (await req.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  if (!body.values || typeof body.values !== "object") {
    return NextResponse.json({ error: "응답 값이 비어 있습니다." }, { status: 400 });
  }

  const resolution = await resolveTokenForResponse(token);
  if (!resolution.ok) {
    const status = resolution.reason === "not-found" ? 404 : 410;
    return NextResponse.json({ error: "이 링크는 응답을 받지 않습니다." }, { status });
  }

  // Filter values to only known schema keys.
  const allowed = new Set(collectResponseKeys(resolution.form));
  const payload: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body.values)) {
    if (allowed.has(k)) payload[k] = v;
  }

  const admin = createSupabaseAdminClient();

  // Anonymous: drop submitter info entirely.
  const isAnonymous = resolution.form.anonymous;
  const submitterMeta: Record<string, unknown> = isAnonymous
    ? {}
    : {
        ip: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip"),
        ua: req.headers.get("user-agent"),
      };

  // Insert response.
  const { error: insertErr } = await admin.from("form_responses").insert({
    link_id: resolution.link.id,
    version_id: resolution.version.id,
    schema_snapshot_json: resolution.form,
    payload_json: payload,
    submitter_email: null, // (interviewer-auth flow can populate this later)
    submitter_meta: submitterMeta,
  });
  if (insertErr) {
    console.error("[submit] insert failed", insertErr);
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  // Increment use_count atomically.
  const { error: updErr } = await admin.rpc("increment_link_use", {
    p_link_id: resolution.link.id,
  });
  if (updErr) {
    // Fallback to non-atomic update if the helper function isn't deployed.
    await admin
      .from("form_links")
      .update({ use_count: resolution.link.use_count + 1 })
      .eq("id", resolution.link.id);
  }

  return NextResponse.json({ ok: true });
}
