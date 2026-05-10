import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 220,
          background: "var(--color-ink)",
          color: "var(--color-paper)",
          padding: "var(--spacing-s6) var(--spacing-s5)",
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "-0.025em",
            marginBottom: "var(--spacing-s7)",
          }}
        >
          Pixelab<span style={{ color: "var(--color-accent)" }}>·</span>HR
        </div>
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-s2)",
            flex: 1,
          }}
        >
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              style={{
                color: "var(--color-paper)",
                opacity: 0.85,
                textDecoration: "none",
                padding: "8px 0",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            opacity: 0.6,
            marginTop: "auto",
            paddingTop: "var(--spacing-s4)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ marginBottom: 4 }}>{session.email}</div>
          <div>ROLE · {session.role.toUpperCase()}</div>
          <LogoutButton />
        </div>
      </aside>
      <main style={{ flex: 1, background: "var(--color-surface)" }}>
        {children}
      </main>
    </div>
  );
}
