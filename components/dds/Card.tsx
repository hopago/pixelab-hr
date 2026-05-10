import type { ReactNode } from "react";

type CardProps = {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
};

export function Card({ icon, title, description }: CardProps) {
  return (
    <div className="px-card">
      <div className="px-card-icon">{icon}</div>
      <div className="px-card-body">
        <p className="px-card-title">{title}</p>
        {description && <p className="px-card-desc">{description}</p>}
      </div>
    </div>
  );
}
