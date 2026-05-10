import "server-only";

import { FormSchema, type Block } from "@/lib/schema/form-schema";

export type ClusterAggregate = {
  tag: string;          // 'A', 'B', ...
  name: string;         // '배려'
  keywords?: string;
  questionIds: string[]; // ['A1', 'A2']
  /** mean of (mean of question values) per response, then averaged across responses */
  mean: number;
  /** sample standard deviation of per-response cluster means */
  sd: number;
  /** count of responses where at least one question is answered */
  n: number;
};

export type CultureAggregate = {
  templateSlug: string;
  templateName: string;
  totalResponses: number;
  clusters: ClusterAggregate[];
};

/**
 * Aggregate culture-survey responses into 8-style cluster summaries.
 * Inputs:
 *  - schema: the snapshotted form schema (any culture-category form)
 *  - responses: array of payload_json values
 */
export function aggregateCulture(
  schema: import("@/lib/schema/form-schema").FormSchema,
  responses: Array<Record<string, unknown>>,
): CultureAggregate {
  const clusters: Array<{
    tag: string;
    name: string;
    keywords?: string;
    questionIds: string[];
  }> = [];
  for (const block of schema.blocks) {
    if (block.type !== "likert-cluster") continue;
    clusters.push({
      tag: block.tag,
      name: block.name,
      keywords: block.keywords,
      questionIds: block.questions.map((q) => q.id),
    });
  }

  const out: ClusterAggregate[] = clusters.map((c) => {
    const perResponseMeans: number[] = [];
    for (const r of responses) {
      const vals: number[] = [];
      for (const qid of c.questionIds) {
        const v = r[qid];
        if (typeof v === "number" && Number.isFinite(v)) vals.push(v);
        else if (typeof v === "string") {
          const n = parseFloat(v);
          if (Number.isFinite(n)) vals.push(n);
        }
      }
      if (vals.length > 0) {
        perResponseMeans.push(vals.reduce((a, b) => a + b, 0) / vals.length);
      }
    }
    const n = perResponseMeans.length;
    const mean =
      n > 0 ? perResponseMeans.reduce((a, b) => a + b, 0) / n : 0;
    const sd =
      n > 1
        ? Math.sqrt(
            perResponseMeans.reduce((s, x) => s + (x - mean) ** 2, 0) /
              (n - 1),
          )
        : 0;

    return {
      tag: c.tag,
      name: c.name,
      keywords: c.keywords,
      questionIds: c.questionIds,
      mean: Number(mean.toFixed(2)),
      sd: Number(sd.toFixed(2)),
      n,
    };
  });

  return {
    templateSlug: schema.slug,
    templateName: schema.name,
    totalResponses: responses.length,
    clusters: out,
  };
}

/** Validate a candidate raw schema-snapshot. */
export function isCultureSchema(snapshot: unknown): boolean {
  try {
    const parsed = FormSchema.parse(snapshot);
    return parsed.category === "culture";
  } catch {
    return false;
  }
}
