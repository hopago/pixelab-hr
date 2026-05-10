import type { ReactNode } from "react";

type AdminPageProps = {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
};

export function AdminPage({
  title,
  eyebrow,
  description,
  action,
  children,
}: AdminPageProps) {
  return (
    <div style={{ padding: "var(--spacing-s7) var(--spacing-s8)" }}>
      <header
        style={{
          paddingBottom: "var(--spacing-s5)",
          marginBottom: "var(--spacing-s6)",
          borderBottom: "1px solid var(--color-ink)",
        }}
      >
        {eyebrow && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-meta)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-mute)",
              marginBottom: "var(--spacing-s3)",
            }}
          >
            {eyebrow}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "var(--spacing-s5)",
          }}
        >
          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            {title}
          </h1>
          {action}
        </div>
        {description && (
          <p
            style={{
              fontSize: "var(--text-body)",
              color: "var(--color-ink-4)",
              margin: "var(--spacing-s4) 0 0",
              maxWidth: "60ch",
            }}
          >
            {description}
          </p>
        )}
      </header>
      {children}
    </div>
  );
}

export function AdminButton({
  href,
  children,
  variant = "primary",
  type = "submit",
  disabled,
  download,
}: {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  type?: "submit" | "button";
  disabled?: boolean;
  download?: string | boolean;
}) {
  const baseStyle = {
    fontFamily: "var(--font-mono)",
    fontSize: "12.5px",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    padding: "12px 20px",
    border: "1px solid var(--color-ink)",
    cursor: disabled ? "not-allowed" : "pointer",
    textDecoration: "none",
    display: "inline-block",
    opacity: disabled ? 0.5 : 1,
    background:
      variant === "primary" ? "var(--color-ink)" : "var(--color-paper)",
    color:
      variant === "primary" ? "var(--color-paper)" : "var(--color-ink)",
  };
  if (href) {
    return (
      <a
        href={href}
        style={baseStyle}
        download={typeof download === "string" ? download : undefined}
      >
        {children}
      </a>
    );
  }
  return (
    <button type={type} disabled={disabled} style={baseStyle}>
      {children}
    </button>
  );
}
