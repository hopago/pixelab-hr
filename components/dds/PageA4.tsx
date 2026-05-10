import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageA4Props = {
  children: ReactNode;
  className?: string;
};

export function PageA4({ children, className }: PageA4Props) {
  return (
    <div className={cn("px-page", className)}>
      <div className="px-page-inner">{children}</div>
    </div>
  );
}
