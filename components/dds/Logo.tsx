import { cn } from "@/lib/utils";

/**
 * Pixelab Beauty Clinic — wordmark logo.
 * Inline JSX (not external SVG) so Pretendard 폰트가 페이지 폰트 스택에서 그대로 적용됨.
 *
 * 사용 예시
 *   <Logo />                                ← 검정 배경용(흰 글자)
 *   <Logo variant="on-light" />             ← 흰 배경용(검정 글자)
 *   <Logo size="sm" showSubbrand={false} /> ← 사이드바 축약형
 */

type LogoProps = {
  variant?: "on-dark" | "on-light";
  size?: "xs" | "sm" | "md" | "lg";
  showSubbrand?: boolean;
  subbrand?: string;
  className?: string;
};

const SIZE: Record<NonNullable<LogoProps["size"]>, { w: number; sub: number; gap: number; dot: number }> = {
  xs: { w: 18, sub: 7,   gap: 4, dot: 4 },
  sm: { w: 22, sub: 8,   gap: 5, dot: 4 },
  md: { w: 30, sub: 9,   gap: 6, dot: 5 },
  lg: { w: 44, sub: 11,  gap: 8, dot: 7 },
};

export function Logo({
  variant = "on-dark",
  size = "md",
  showSubbrand = true,
  subbrand = "Beauty Clinic",
  className,
}: LogoProps) {
  const { w, sub, gap, dot } = SIZE[size];
  const fg = variant === "on-dark" ? "var(--color-paper)" : "var(--color-ink)";
  const subOpacity = variant === "on-dark" ? 0.55 : 0.7;

  return (
    <div className={cn("inline-block leading-none select-none", className)}>
      <div
        style={{
          fontWeight: 800,
          fontSize: w,
          letterSpacing: "-0.025em",
          lineHeight: 1,
          color: fg,
          fontFamily: "var(--font-sans)",
          fontFeatureSettings: '"ss01"',
          display: "inline-flex",
          alignItems: "baseline",
          gap: 0,
        }}
      >
        <span>Pixelab</span>
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: dot,
            height: dot,
            background: "var(--color-accent)",
            marginLeft: 3,
            marginBottom: Math.max(2, dot - 1),
            alignSelf: "flex-end",
          }}
        />
      </div>
      {showSubbrand && (
        <div
          style={{
            marginTop: gap,
            fontSize: sub,
            fontWeight: 500,
            letterSpacing: "0.36em",
            textTransform: "uppercase",
            color: fg,
            opacity: subOpacity,
            fontFamily: "var(--font-sans)",
          }}
        >
          {subbrand}
        </div>
      )}
    </div>
  );
}
