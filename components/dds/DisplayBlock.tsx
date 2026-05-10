import type { ReactNode } from "react";

type DisplayBlockProps = {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
};

export function DisplayBlock({ eyebrow, title, lede }: DisplayBlockProps) {
  return (
    <div className="px-display">
      {eyebrow && <div className="px-display-eyebrow">{eyebrow}</div>}
      <h1 className="px-display-title">{title}</h1>
      {lede && <p className="px-display-lede">{lede}</p>}
    </div>
  );
}
