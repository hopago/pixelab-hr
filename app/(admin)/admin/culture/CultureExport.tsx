"use client";

import { useMemo } from "react";
import type { CultureAggregate } from "@/lib/analytics/culture-aggregate";
import { toCsv } from "@/lib/analytics/csv";
import { AdminButton } from "@/components/admin/AdminPage";

type Props = {
  slug: string;
  aggregate: CultureAggregate;
  totalResponses: number;
};

export function CultureExport({ slug, aggregate, totalResponses }: Props) {
  const csv = useMemo(() => {
    return toCsv(
      ["tag", "name", "keywords", "mean", "sd", "n"],
      aggregate.clusters.map((c) => [
        c.tag,
        c.name,
        c.keywords ?? "",
        c.mean,
        c.sd,
        c.n,
      ]),
    );
  }, [aggregate]);

  if (totalResponses === 0) return null;

  return (
    <AdminButton
      href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
      variant="ghost"
    >
      ↓ 집계 CSV
    </AdminButton>
  );
}
