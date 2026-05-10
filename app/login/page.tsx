"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  PageA4,
  Masthead,
  DisplayBlock,
  Callout,
  Footer,
} from "@/components/dds";

export default function LoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (e) {
      setError(e.message);
      setSubmitting(false);
    }
  };

  return (
    <PageA4>
      <Masthead
        meta={[
          { key: "DOC", value: "PIXELAB-HR" },
          { key: "VER", value: "—" },
          { key: "DATE", value: "LOGIN" },
        ]}
      />
      <DisplayBlock
        eyebrow="Sign in · Google"
        title={"픽셀랩 HR에\n로그인합니다."}
        lede={
          <>
            Google 계정으로 로그인하시면, 인사 라인이 미리 등록한 사용자 목록과
            대조해 접근을 허용합니다. 등록되지 않은 계정으로 로그인하면 거부 페이지로
            이동합니다.
          </>
        }
      />

      <Callout label="안내">
        면접관·관리자 계정 등록은 인사(최호준)가 진행합니다. 등록이 안 되어 있는
        경우 인사에 먼저 알려 주세요.
      </Callout>

      <div style={{ marginTop: "var(--spacing-s7)" }}>
        <button
          type="button"
          onClick={handleGoogle}
          disabled={submitting}
          style={{
            background: "var(--color-ink)",
            color: "var(--color-paper)",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            border: "none",
            padding: "16px 28px",
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? "이동 중…" : "Google로 로그인"}
        </button>
        {error && (
          <p
            style={{
              color: "var(--color-warn)",
              fontSize: "var(--text-small)",
              marginTop: "var(--spacing-s4)",
            }}
          >
            {error}
          </p>
        )}
      </div>

      <Footer left="PIXELAB-HR · LOGIN" right="GOOGLE OAUTH" />
    </PageA4>
  );
}
