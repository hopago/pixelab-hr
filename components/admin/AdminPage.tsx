import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminPageProps = {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AdminPage({
  title,
  eyebrow,
  description,
  action,
  children,
  className,
}: AdminPageProps) {
  return (
    <div
      className={cn(
        "px-5 py-8 md:px-10 md:py-12 lg:px-16 lg:py-12",
        className,
      )}
    >
      <header className="pb-5 mb-6 md:mb-8 border-b border-ink">
        {eyebrow && (
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-mute mb-3">
            {eyebrow}
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
          <h1 className="text-[28px] md:text-[36px] font-extrabold tracking-[-0.025em] leading-[1.1] m-0 break-keep">
            {title}
          </h1>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {description && (
          <p className="text-[14px] md:text-body text-ink-4 mt-4 max-w-[60ch] leading-[1.7]">
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
  const cls = cn(
    "inline-block whitespace-nowrap",
    "font-mono text-[12px] tracking-[0.08em] uppercase",
    "px-5 py-3 border border-ink no-underline",
    "transition-colors duration-150",
    disabled && "opacity-50 cursor-not-allowed pointer-events-none",
    variant === "primary"
      ? "bg-ink text-paper hover:bg-ink-3"
      : "bg-paper text-ink hover:bg-surface",
  );
  if (href) {
    return (
      <a
        href={href}
        className={cls}
        download={typeof download === "string" ? download : undefined}
      >
        {children}
      </a>
    );
  }
  return (
    <button type={type} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
