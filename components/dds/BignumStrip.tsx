import type { ReactNode } from "react";

type BignumCell = {
  value: ReactNode;
  label: string;
};

type BignumStripProps = {
  cells: BignumCell[];
};

export function BignumStrip({ cells }: BignumStripProps) {
  return (
    <div
      className="px-bignum"
      style={{
        gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
      }}
    >
      {cells.map((cell, idx) => (
        <div key={idx} className="px-bignum-cell">
          <div className="px-bignum-value">{cell.value}</div>
          <div className="px-bignum-label">{cell.label}</div>
        </div>
      ))}
    </div>
  );
}
