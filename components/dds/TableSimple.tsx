import type { ReactNode } from "react";

type Column = {
  header: ReactNode;
  width?: string;
};

type Row = ReactNode[];

type TableSimpleProps = {
  columns: Column[];
  rows: Row[];
};

export function TableSimple({ columns, rows }: TableSimpleProps) {
  return (
    <table className="px-table">
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th key={i} style={c.width ? { width: c.width } : undefined}>
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, ri) => (
          <tr key={ri}>
            {r.map((cell, ci) => (
              <td key={ci}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type SignalProps = {
  variant?: "default" | "ok" | "warn";
  label: string;
};

export function Signal({ variant = "default", label }: SignalProps) {
  const variantClass =
    variant === "ok"
      ? "px-signal px-signal--ok"
      : variant === "warn"
        ? "px-signal px-signal--warn"
        : "px-signal";
  return (
    <span className={variantClass}>
      <span className="px-signal-dot" />
      {label}
    </span>
  );
}
