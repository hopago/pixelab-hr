import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** SSR-aware Supabase client. Reads cookies for the current request session. */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // called from a Server Component — safe to ignore (set in Action/Route handler instead)
          }
        },
      },
    },
  );
}
