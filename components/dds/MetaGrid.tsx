import type { ReactNode, CSSProperties } from "react";

type MetaCell = {
  label: string;
  value?: ReactNode;
};

type MetaGridProps = {
  cells: MetaCell[];
  columns?: number;
  style?: CSSProperties;
};

export function MetaGrid({ cells, columns, style }: MetaGridProps) {
  const cols = columns ?? cells.length;
  return (
    <div
      className="px-meta-grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        ...style,
      }}
    >
      {cells.map((cell, idx) => (
        <div key={idx}>
          <div className="px-meta-cell-label">{cell.label}</div>
          <div className="px-meta-cell-value">{cell.value ?? " "}</div>
        </div>
      ))}
    </div>
  );
}
