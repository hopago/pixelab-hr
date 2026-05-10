"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { newToken } from "@/lib/tokens";
import { requireSession } from "@/lib/auth/session";

export type IssueLinksInput = {
  versionId: string;
  targets: Array<{
    targetName?: string;
    targetRole?: string;
    candidateId?: string;
    employeeId?: string;
  }>;
  expiresAt?: string | null; // ISO date or null
  maxUses?: number;
};

export type IssuedLink = {
  token: string;
  url: string;
  targetName?: string;
};

export async function issueLinks(
  input: IssueLinksInput,
): Promise<{ ok: true; links: IssuedLink[] } | { ok: false; error: string }> {
  const session = await requireSession("admin");
  if (!input.versionId) return { ok: false, error: "양식 버전을 선택해 주세요." };
  if (!input.targets || input.targets.length === 0) {
    return { ok: false, error: "최소 한 명의 대상자가 필요합니다." };
  }

  const admin = createSupabaseAdminClient();

  // Verify the version exists
  const { data: ver } = await admin
    .from("form_versions")
    .select("id")
    .eq("id", input.versionId)
    .maybeSingle();
  if (!ver) return { ok: false, error: "선택한 양식 버전을 찾을 수 없습니다." };

  const rows = input.targets.map((t) => ({
    token: newToken(),
    version_id: input.versionId,
    target_name: t.targetName ?? null,
    target_role: t.targetRole ?? null,
    candidate_id: t.candidateId ?? null,
    employee_id: t.employeeId ?? null,
    expires_at: input.expiresAt ?? null,
    max_uses: input.maxUses ?? 1,
    issued_by: session.email,
  }));

  const { data, error } = await admin.from("form_links").insert(rows).select("token, target_name");
  if (error || !data) {
    console.error("[issueLinks] insert failed", error);
    return { ok: false, error: "링크 생성에 실패했습니다." };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const links: IssuedLink[] = data.map((r) => ({
    token: r.token,
    url: `${baseUrl}/r/${r.token}`,
    targetName: r.target_name ?? undefined,
  }));

  revalidatePath("/admin/links");
  return { ok: true, links };
}
