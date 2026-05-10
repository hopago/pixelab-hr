import type { ReactNode } from "react";

type SectionHeadProps = {
  num: string;
  title: string;
  aside?: string;
};

export function SectionHead({ num, title, aside }: SectionHeadProps) {
  return (
    <header className="px-section-head">
      <span className="px-section-num">{num}</span>
      <h2 className="px-section-title">{title}</h2>
      {aside && <span className="px-section-aside">{aside}</span>}
    </header>
  );
}

type SectionProps = {
  children: ReactNode;
};

export function Section({ children }: SectionProps) {
  return <section className="px-section">{children}</section>;
}
