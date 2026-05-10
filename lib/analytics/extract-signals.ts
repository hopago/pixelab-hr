import "server-only";

import type { FormSchema, Block } from "@/lib/schema/form-schema";

const SIGNAL_TYPES = [
  "rights_negotiation",
  "gossip",
  "accountability",
  "leaving_intent",
  "comp_query",
  "conflict",
  "other",
] as const;
type SignalType = (typeof SIGNAL_TYPES)[number];
const SIGNAL_TYPE_SET: ReadonlySet<string> = new Set(SIGNAL_TYPES);

export type ExtractedSignal = {
  signalType: SignalType;
  severity: "red" | "yellow" | "green";
  notes?: string;
};

/**
 * Scan a submitted form payload against its schema for retention-signal cues.
 * Currently looks at check-group blocks whose option `value` matches the
 * retention_signals.signal_type enum. Each matched checked option produces
 * one signal.
 */
export function extractRetentionSignals(
  schema: FormSchema,
  payload: Record<string, unknown>,
): ExtractedSignal[] {
  const out: ExtractedSignal[] = [];

  for (const block of schema.blocks) {
    if (block.type !== "check-group") continue;
    const checked = payload[block.id];
    if (!Array.isArray(checked)) continue;
    for (const v of checked) {
      if (typeof v !== "string") continue;
      if (!SIGNAL_TYPE_SET.has(v)) continue;
      // Skip conventional 'none' / 'no-issue' values; only known signal_types map.
      out.push({
        signalType: v as SignalType,
        // Default severity:
        //  rights_negotiation, gossip, accountability — yellow
        //  leaving_intent, conflict — red
        //  comp_query, other — yellow
        severity:
          v === "leaving_intent" || v === "conflict" ? "red" : "yellow",
        notes: `${schema.doc_id} 응답에서 자동 추출 (${block.num ?? block.id})`,
      });
    }
  }

  return out;
}
