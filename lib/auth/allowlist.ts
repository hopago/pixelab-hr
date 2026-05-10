import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AppRole = "admin" | "interviewer";

export type AppUserCheck =
  | { allowed: true; email: string; role: AppRole; fullName?: string | null }
  | { allowed: false; reason: "not-allowlisted" | "no-email" };

/**
 * Verify whether a Supabase auth user has been granted a role in app_users.
 * Falls back to ADMIN_EMAIL_ALLOWLIST env (comma-separated) if app_users is
 * still empty — that bootstraps the very first admin login.
 */
export async function checkAppUserByEmail(
  email: string | null | undefined,
): Promise<AppUserCheck> {
  if (!email) return { allowed: false, reason: "no-email" };
  const lower = email.toLowerCase();

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("app_users")
    .select("email, role, full_name")
    .ilike("email", lower)
    .maybeSingle();

  if (data) {
    return {
      allowed: true,
      email: data.email,
      role: data.role as AppRole,
      fullName: data.full_name,
    };
  }

  // Bootstrap fallback — first run, app_users empty.
  const bootstrap = (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (bootstrap.includes(lower)) {
    // Insert the row so subsequent checks don't depend on the env var.
    await admin
      .from("app_users")
      .upsert({ email: lower, role: "admin" }, { onConflict: "email" });
    return { allowed: true, email: lower, role: "admin" };
  }

  return { allowed: false, reason: "not-allowlisted" };
}
