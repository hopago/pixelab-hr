/**
 * Minimal CSV export: handles commas, quotes, and newlines via RFC4180 escaping.
 */
export function toCsv(
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>,
): string {
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines: string[] = [];
  lines.push(headers.map(escape).join(","));
  for (const r of rows) lines.push(r.map(escape).join(","));
  return lines.join("\n");
}
