import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkAppUserByEmail, type AppRole } from "./allowlist";

/**
 * Resolve current session + role. Redirects when unauthenticated or denied.
 * Pass `requiredRole` to enforce a minimum role (defaults to 'interviewer').
 */
export async function requireSession(requiredRole: AppRole = "interviewer") {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const check = await checkAppUserByEmail(user.email);
  if (!check.allowed) redirect("/access-denied");

  if (requiredRole === "admin" && check.role !== "admin") {
    redirect("/access-denied?need=admin");
  }

  return {
    user,
    email: check.email,
    role: check.role,
    fullName: check.fullName,
  };
}

/** Non-redirecting variant — returns null if no session, not allowlisted, or
 *  Supabase isn't configured yet (e.g. preview deploy without env vars). */
export async function getSessionOrNull() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const check = await checkAppUserByEmail(user.email);
    if (!check.allowed) return null;
    return {
      user,
      email: check.email,
      role: check.role,
      fullName: check.fullName,
    };
  } catch {
    return null;
  }
}
