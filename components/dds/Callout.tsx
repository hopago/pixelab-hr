import type { ReactNode, CSSProperties } from "react";

type CalloutProps = {
  label: string;
  children: ReactNode;
  style?: CSSProperties;
};

export function Callout({ label, children, style }: CalloutProps) {
  return (
    <div className="px-callout" style={style}>
      <div className="px-callout-label">{label}</div>
      <p>{children}</p>
    </div>
  );
}
