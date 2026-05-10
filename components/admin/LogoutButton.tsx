"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        window.location.href = "/login";
      }}
      style={{
        marginTop: 8,
        background: "transparent",
        color: "var(--color-paper)",
        border: "1px solid rgba(255,255,255,0.2)",
        padding: "4px 8px",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        cursor: "pointer",
      }}
    >
      LOGOUT
    </button>
  );
}
