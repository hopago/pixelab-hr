import { z } from "zod";

/**
 * Pixelab HR — FormSchema
 * YAML로 정의된 양식의 스펙. 한 번 게시되면 사실상 immutable;
 * 새 버전을 발행하려면 새 YAML 파일을 만든다(예: v2.yaml → v3.yaml).
 */

/* ── Common option for radio/check ─────────────────────── */
const Option = z.object({
  value: z.string(),
  label: z.string(),
});

/* ── Block: each unit rendered in the form body ────────── */

const SectionHead = z.object({
  type: z.literal("section-head"),
  num: z.string(),
  title: z.string(),
  aside: z.string().optional(),
});

const AnchorBar = z.object({
  type: z.literal("anchor-bar"),
  left: z.string().default("1 · 전혀 아니다"),
  right: z.string().default("매우 그렇다 · 5"),
});

const FieldTextBlock = z.object({
  type: z.literal("field-text"),
  id: z.string(),
  num: z.string().optional(),
  title: z.string(),
  help: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
});

const FieldTextareaBlock = z.object({
  type: z.literal("field-textarea"),
  id: z.string(),
  num: z.string().optional(),
  title: z.string(),
  help: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
});

const RadioGroupBlock = z.object({
  type: z.literal("radio-group"),
  id: z.string(),
  num: z.string().optional(),
  title: z.string(),
  help: z.string().optional(),
  options: z.array(Option).min(2),
  horizontal: z.boolean().default(false),
  required: z.boolean().default(false),
});

const CheckGroupBlock = z.object({
  type: z.literal("check-group"),
  id: z.string(),
  num: z.string().optional(),
  title: z.string(),
  help: z.string().optional(),
  options: z.array(Option).min(1),
  horizontal: z.boolean().default(false),
});

const LikertQuestion = z.object({
  id: z.string(),
  text: z.string(),
});

const LikertClusterBlock = z.object({
  type: z.literal("likert-cluster"),
  tag: z.string(),
  name: z.string(),
  keywords: z.string().optional(),
  questions: z.array(LikertQuestion).min(1),
  scale: z.number().int().min(2).max(7).default(5),
});

const CalloutBlock = z.object({
  type: z.literal("callout"),
  label: z.string(),
  body: z.string(),
});

const ParagraphBlock = z.object({
  type: z.literal("paragraph"),
  text: z.string(),
});

const TableBlock = z.object({
  type: z.literal("table"),
  columns: z.array(
    z.object({
      header: z.string(),
      width: z.string().optional(),
    }),
  ),
  rows: z.array(z.array(z.string())),
});

const MetaGridCell = z.object({
  id: z.string().optional(),
  label: z.string(),
  fieldType: z.enum(["text", "date", "signature"]).optional(),
});

const MetaGridBlock = z.object({
  type: z.literal("meta-grid"),
  columns: z.number().int().min(1).max(6).optional(),
  cells: z.array(MetaGridCell),
});

export const Block = z.discriminatedUnion("type", [
  SectionHead,
  AnchorBar,
  FieldTextBlock,
  FieldTextareaBlock,
  RadioGroupBlock,
  CheckGroupBlock,
  LikertClusterBlock,
  CalloutBlock,
  ParagraphBlock,
  TableBlock,
  MetaGridBlock,
]);

export type Block = z.infer<typeof Block>;

/* ── Top-level FormSchema ──────────────────────────────── */

export const FormCategory = z.enum([
  "culture",
  "onboarding",
  "interview-q",
  "interview-eval",
  "exit",
]);

export const FormSchema = z.object({
  /** 사람이 읽는 문서 ID, 예: "DIAG-CULTURE-16Q" */
  doc_id: z.string(),
  /** URL 친화적 슬러그, 예: "diag-culture-16q" */
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /** 사람이 읽는 양식 이름 */
  name: z.string(),
  category: FormCategory,
  /** 정수 버전 — 1, 2, 3 ... */
  version: z.number().int().positive(),
  /** YYYY-MM-DD */
  date: z.string(),
  /** 익명 응답 여부. true면 응답에 IP/UA/email 미수집. */
  anonymous: z.boolean().default(false),
  /** 보존 정책 텍스트 (예: "RETENTION 3Y") */
  retention: z.string().optional(),
  /** 디스플레이 블록 — 양식의 헤드라인 */
  intro: z.object({
    eyebrow: z.string().optional(),
    title: z.string(),
    lede: z.string().optional(),
  }),
  /** 큰 숫자 스트립 (3개 권장) */
  bignum: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .optional(),
  /** 본문 시작 전 안내 콜아웃 */
  topCallout: z.object({ label: z.string(), body: z.string() }).optional(),
  /** 응답자 메타 입력 — 소속, 재직 기간 등 */
  topMeta: z.array(MetaGridCell).optional(),
  /** Likert 양식 시 본문 위 anchor bar */
  topAnchorBar: AnchorBar.optional(),
  /** 본문 블록들 (순서 유지) */
  blocks: z.array(Block),
  /** 본문 끝 안내 콜아웃 */
  outroCallout: z.object({ label: z.string(), body: z.string() }).optional(),
  /** 푸터 (좌/우) */
  footer: z.object({ left: z.string(), right: z.string() }).optional(),
});

export type FormSchema = z.infer<typeof FormSchema>;

/* ── Helpers ───────────────────────────────────────────── */

/**
 * 응답 payload 의 키들 — 응답시 어떤 id들이 채워지는지 추출.
 * 익명 검증, 응답 완성도 계산 등에 사용.
 */
export function collectResponseKeys(form: FormSchema): string[] {
  const keys: string[] = [];
  for (const m of form.topMeta ?? []) {
    if (m.id) keys.push(m.id);
  }
  for (const b of form.blocks) {
    switch (b.type) {
      case "field-text":
      case "field-textarea":
      case "radio-group":
      case "check-group":
        keys.push(b.id);
        break;
      case "likert-cluster":
        for (const q of b.questions) keys.push(q.id);
        break;
      case "meta-grid":
        for (const c of b.cells) if (c.id) keys.push(c.id);
        break;
      default:
        break;
    }
  }
  return keys;
}
