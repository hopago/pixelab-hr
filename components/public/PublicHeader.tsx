import Link from "next/link";
import { Logo } from "@/components/dds";
import { getSessionOrNull } from "@/lib/auth/session";

const NAV: Array<{ href: string; label: string }> = [
  { href: "/preview", label: "양식 미리보기" },
];

type Props = {
  /** Hide the global nav links (login page chrome).  */
  minimal?: boolean;
};

export async function PublicHeader({ minimal = false }: Props) {
  const session = await getSessionOrNull();

  return (
    <header
      className="
        sticky top-0 z-30
        bg-paper/85 backdrop-blur-md
        border-b border-line
      "
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-3 md:py-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="픽셀랩 HR 홈"
          className="inline-block no-underline text-ink"
        >
          <Logo
            variant="on-light"
            size="sm"
            showSubbrand={false}
          />
          <span className="sr-only">픽셀랩 HR</span>
        </Link>

        {!minimal && (
          <>
            <nav className="hidden md:flex items-center gap-6">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="
                    font-mono text-[11px] tracking-[0.08em] uppercase
                    text-ink-4 hover:text-ink no-underline
                    transition-colors
                  "
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 md:gap-3">
              {session ? (
                <Link
                  href="/admin"
                  className="
                    inline-block bg-ink text-paper
                    font-mono text-[11px] tracking-[0.08em] uppercase
                    px-4 py-2.5 md:px-5 md:py-3
                    border border-ink no-underline
                    hover:bg-ink-3 transition-colors
                    whitespace-nowrap
                  "
                >
                  관리자 →
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="
                    inline-block bg-ink text-paper
                    font-mono text-[11px] tracking-[0.08em] uppercase
                    px-4 py-2.5 md:px-5 md:py-3
                    border border-ink no-underline
                    hover:bg-ink-3 transition-colors
                    whitespace-nowrap
                  "
                >
                  로그인
                </Link>
              )}
            </div>
          </>
        )}
      </div>

      {/* Mobile-only secondary nav strip */}
      {!minimal && (
        <nav
          className="
            md:hidden border-t border-line
            overflow-x-auto
          "
        >
          <div className="flex whitespace-nowrap px-3">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="
                  inline-block px-3 py-2.5
                  font-mono text-[10px] tracking-[0.08em] uppercase
                  text-ink-4 hover:text-ink
                  no-underline transition-colors
                "
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
