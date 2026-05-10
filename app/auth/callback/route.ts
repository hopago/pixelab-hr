import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkAppUserByEmail } from "@/lib/auth/allowlist";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/admin";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", url));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const check = await checkAppUserByEmail(user?.email);
  if (!check.allowed) {
    // Sign out — they should not have a session if they aren't allowed.
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/access-denied", url));
  }

  // role-aware default landing
  const dest =
    check.role === "admin"
      ? next
      : next.startsWith("/admin")
        ? "/interview"
        : next;
  return NextResponse.redirect(new URL(dest, url));
}
