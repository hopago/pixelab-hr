"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Logo } from "@/components/dds";

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
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Minimal header — just brand, no nav */}
      <header className="border-b border-line bg-paper">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <a href="/" aria-label="픽셀랩 HR 홈" className="inline-block no-underline text-ink">
            <Logo variant="on-light" size="sm" showSubbrand={false} />
          </a>
          <a
            href="/"
            className="font-mono text-[11px] tracking-[0.06em] uppercase text-ink-4 hover:text-ink no-underline transition-colors"
          >
            ← 홈으로
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-12 md:py-20">
        <div className="w-full max-w-[440px]">
          <div className="bg-paper border border-line p-8 md:p-10">
            <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink mb-5 flex items-center gap-3">
              <span className="inline-block w-6 h-px bg-accent" />
              Sign in
            </div>
            <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-[-0.025em] leading-[1.15] mb-3 break-keep">
              픽셀랩 HR에
              <br />
              로그인합니다.
            </h1>
            <p className="text-[14px] text-ink-4 leading-[1.7] mb-8 break-keep">
              Google 계정으로 로그인하시면, 인사 라인이 미리 등록한 사용자 목록과
              대조해 접근을 허용합니다. 등록되지 않은 계정은 거부 페이지로
              이동합니다.
            </p>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={submitting}
              className="
                w-full inline-flex items-center justify-center gap-3
                bg-ink text-paper border border-ink
                font-mono text-[12.5px] tracking-[0.08em] uppercase
                px-6 py-4
                hover:bg-ink-3 transition-colors
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                aria-hidden
              >
                <path
                  fill="#FFFFFF"
                  d="M14.66 8.16c0-.5-.04-.99-.13-1.45H8v2.74h3.74c-.16.85-.65 1.57-1.39 2.06v1.7h2.25c1.32-1.21 2.06-3 2.06-5.05z"
                />
                <path
                  fill="#FFFFFF"
                  d="M8 15c1.86 0 3.42-.61 4.56-1.66l-2.25-1.7c-.62.42-1.42.66-2.31.66-1.78 0-3.28-1.2-3.82-2.81H1.86v1.76A6.99 6.99 0 0 0 8 15z"
                />
                <path
                  fill="#FFFFFF"
                  d="M4.18 9.49a4.2 4.2 0 0 1 0-2.69V5.04H1.86a7.04 7.04 0 0 0 0 6.21l2.32-1.76z"
                />
                <path
                  fill="#FFFFFF"
                  d="M8 4a3.8 3.8 0 0 1 2.68 1.04l1.99-1.99A6.74 6.74 0 0 0 8 1a6.99 6.99 0 0 0-6.14 3.62L4.18 6.4C4.72 4.79 6.22 4 8 4z"
                />
              </svg>
              {submitting ? "이동 중…" : "Google로 로그인"}
            </button>

            {error && (
              <p className="mt-4 text-warn text-[13px] leading-[1.6]">
                {error}
              </p>
            )}
          </div>

          <div className="mt-6 bg-paper border-l-[3px] border-ink px-5 py-4">
            <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-4 mb-1.5">
              안내
            </div>
            <p className="text-[13px] text-ink-3 leading-[1.65]">
              면접관·관리자 계정 등록은 인사(최호준)가 진행합니다. 등록이 안 되어
              있는 경우 인사에 먼저 알려 주세요.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-line bg-paper">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-4 font-mono text-[10px] tracking-[0.06em] uppercase text-mute flex items-center justify-between">
          <span>PIXELAB · BEAUTY CLINIC HR</span>
          <span>OWNER 최호준</span>
        </div>
      </footer>
    </div>
  );
}
