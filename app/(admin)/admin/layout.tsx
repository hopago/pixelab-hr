import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { Logo } from "@/components/dds";
import { LogoutButton } from "@/components/admin/LogoutButton";

const NAV: Array<{ href: string; label: string }> = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/templates", label: "양식" },
  { href: "/admin/links", label: "링크" },
  { href: "/admin/responses", label: "응답" },
  { href: "/admin/culture", label: "조직문화" },
  { href: "/admin/candidates", label: "후보자" },
  { href: "/admin/employees", label: "직원" },
  { href: "/admin/retention", label: "리텐션" },
  { href: "/admin/users", label: "사용자" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession("admin");

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* ─── Sidebar (desktop) / Topbar (mobile) ────────── */}
      <aside
        className="
          bg-ink text-paper
          md:w-[240px] md:h-screen md:sticky md:top-0
          md:flex md:flex-col
          md:px-7 md:py-9
          flex flex-row items-center justify-between
          px-5 py-4
          z-20
        "
      >
        {/* Brand */}
        <div className="md:mb-12">
          <Link
            href="/admin"
            aria-label="Pixelab HR"
            className="inline-block"
          >
            <Logo
              variant="on-dark"
              size="sm"
              showSubbrand={true}
              subbrand="HR · Internal"
            />
          </Link>
        </div>

        {/* Nav (desktop = vertical, mobile = horizontal scroll) */}
        <nav
          className="
            md:flex-1 md:flex md:flex-col md:gap-1 md:mt-0
            hidden md:block
          "
        >
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="
                block py-2 px-2 -mx-2
                font-mono text-[11px] tracking-[0.08em] uppercase
                text-paper/85 hover:text-paper hover:bg-white/5
                transition-colors
                no-underline
              "
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* User info + logout (desktop) */}
        <div
          className="
            hidden md:block
            font-mono text-[10px] opacity-60
            mt-auto pt-4
            border-t border-white/10
          "
        >
          <div className="mb-1 truncate">{session.email}</div>
          <div>ROLE · {session.role.toUpperCase()}</div>
          <LogoutButton />
        </div>

        {/* Mobile: just role + logout button beside the brand */}
        <div className="md:hidden flex items-center gap-3">
          <span
            className="
              font-mono text-[10px] tracking-[0.08em] uppercase
              text-paper/55
            "
          >
            {session.role}
          </span>
          <LogoutButton />
        </div>
      </aside>

      {/* ─── Mobile-only horizontal nav strip ───────────── */}
      <nav
        className="
          md:hidden
          sticky top-0 z-10
          bg-ink text-paper
          border-t border-white/10
          overflow-x-auto
        "
      >
        <div className="flex whitespace-nowrap px-3">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="
                inline-block px-3 py-3
                font-mono text-[11px] tracking-[0.08em] uppercase
                text-paper/75 hover:text-paper
                transition-colors
                no-underline
              "
            >
              {n.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ─── Main ──────────────────────────────────────── */}
      <main className="flex-1 bg-surface min-w-0">{children}</main>
    </div>
  );
}
