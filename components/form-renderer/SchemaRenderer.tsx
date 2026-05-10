"use client";

import { useState, type ReactNode } from "react";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import type { Block, FormSchema } from "@/lib/schema/form-schema";
import {
  BignumStrip,
  Callout,
  CheckGroup,
  DisplayBlock,
  Field,
  FieldHeader,
  Footer,
  LikertAnchorBar,
  LikertCluster,
  Masthead,
  MetaGrid,
  PageA4,
  RadioGroup,
  SectionHead,
  Signal,
  TableSimple,
} from "@/components/dds";
import { renderEmphasis } from "./emphasis";

type SchemaRendererProps = {
  form: FormSchema;
  /** When provided, the form is interactive and submits to this handler. */
  onSubmit?: (values: Record<string, unknown>) => Promise<void> | void;
  /** When provided, renders read-only with these values pre-filled (for response viewer). */
  readOnlyValues?: Record<string, unknown>;
  /** Override the default submit button label. */
  submitLabel?: string;
};

export function SchemaRenderer({
  form,
  onSubmit,
  readOnlyValues,
  submitLabel = "제출하기",
}: SchemaRendererProps) {
  const isReadOnly = !!readOnlyValues;
  const methods = useForm<Record<string, unknown>>({
    defaultValues: readOnlyValues ?? {},
  });
  const { handleSubmit, register, formState } = methods;
  const [submitting, setSubmitting] = useState(false);

  return (
    <PageA4>
      <Masthead
        meta={[
          { key: "DOC", value: form.doc_id },
          { key: "VER", value: `${form.version}.0` },
          { key: "DATE", value: form.date.replace(/-/g, ".") },
        ]}
      />

      <DisplayBlock
        eyebrow={form.intro.eyebrow}
        title={form.intro.title}
        lede={form.intro.lede ? renderEmphasis(form.intro.lede) : undefined}
      />

      {form.bignum && form.bignum.length > 0 && (
        <BignumStrip cells={form.bignum} />
      )}

      {form.topCallout && (
        <Callout label={form.topCallout.label}>{form.topCallout.body}</Callout>
      )}

      <FormProvider {...methods}>
        <form
          onSubmit={
            isReadOnly
              ? (e) => e.preventDefault()
              : handleSubmit(async (values) => {
                  if (!onSubmit) return;
                  try {
                    setSubmitting(true);
                    await onSubmit(values);
                  } finally {
                    setSubmitting(false);
                  }
                })
          }
        >
          {form.topMeta && form.topMeta.length > 0 && (
            <MetaGrid
              columns={form.topMeta.length}
              cells={form.topMeta.map((m) => ({
                label: m.label,
                value: m.id ? (
                  <input
                    type={m.fieldType === "date" ? "date" : "text"}
                    {...register(m.id)}
                    disabled={isReadOnly}
                    defaultValue={
                      isReadOnly
                        ? (readOnlyValues?.[m.id] as string | undefined)
                        : undefined
                    }
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      width: "100%",
                      fontFamily: "inherit",
                      fontSize: "inherit",
                      color: "inherit",
                      padding: 0,
                    }}
                  />
                ) : (
                  " "
                ),
              }))}
            />
          )}

          {form.topAnchorBar && (
            <LikertAnchorBar
              left={form.topAnchorBar.left}
              right={form.topAnchorBar.right}
            />
          )}

          {form.blocks.map((b, i) => (
            <BlockRenderer
              key={i}
              block={b}
              isReadOnly={isReadOnly}
              readOnlyValues={readOnlyValues}
            />
          ))}

          {form.outroCallout && (
            <Callout
              label={form.outroCallout.label}
              style={{ marginTop: "var(--spacing-s7)" }}
            >
              {form.outroCallout.body}
            </Callout>
          )}

          {!isReadOnly && (
            <div style={{ marginTop: "var(--spacing-s7)", textAlign: "right" }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: "var(--color-ink)",
                  color: "var(--color-paper)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12.5px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  border: "none",
                  padding: "16px 28px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? "제출 중…" : submitLabel}
              </button>
            </div>
          )}

          {Object.keys(formState.errors).length > 0 && (
            <p
              style={{
                color: "var(--color-warn)",
                fontSize: "var(--text-small)",
                marginTop: "var(--spacing-s4)",
                textAlign: "right",
              }}
            >
              응답하지 않은 필수 문항이 있습니다.
            </p>
          )}
        </form>
      </FormProvider>

      {form.footer && (
        <Footer left={form.footer.left} right={form.footer.right} />
      )}
    </PageA4>
  );
}

/* ── Block dispatcher (uses FormContext) ─────────────────── */

type BlockProps = {
  block: Block;
  isReadOnly: boolean;
  readOnlyValues?: Record<string, unknown>;
};

function BlockRenderer({
  block,
  isReadOnly,
  readOnlyValues,
}: BlockProps): ReactNode {
  switch (block.type) {
    case "section-head":
      return (
        <SectionHead num={block.num} title={block.title} aside={block.aside} />
      );

    case "anchor-bar":
      return <LikertAnchorBar left={block.left} right={block.right} />;

    case "field-text":
      return <FieldTextRow block={block} isReadOnly={isReadOnly} readOnlyValues={readOnlyValues} />;

    case "field-textarea":
      return <FieldTextareaRow block={block} isReadOnly={isReadOnly} readOnlyValues={readOnlyValues} />;

    case "radio-group":
      return <RadioGroupRow block={block} isReadOnly={isReadOnly} />;

    case "check-group":
      return <CheckGroupRow block={block} isReadOnly={isReadOnly} />;

    case "likert-cluster":
      return <LikertClusterRow block={block} isReadOnly={isReadOnly} />;

    case "callout":
      return <Callout label={block.label}>{block.body}</Callout>;

    case "paragraph":
      return (
        <p
          style={{
            fontSize: "var(--text-body)",
            lineHeight: 1.7,
            color: "var(--color-ink-3)",
            margin: "var(--spacing-s4) 0",
          }}
        >
          {renderEmphasis(block.text)}
        </p>
      );

    case "table":
      return <TableBlockRow block={block} />;

    case "meta-grid":
      return <MetaGridRow block={block} isReadOnly={isReadOnly} readOnlyValues={readOnlyValues} />;

    default: {
      const _exhaustive: never = block;
      void _exhaustive;
      return null;
    }
  }
}

/* ── Individual block rows ──────────────────────────────── */

function FieldTextRow({
  block,
  isReadOnly,
  readOnlyValues,
}: {
  block: Extract<Block, { type: "field-text" }>;
  isReadOnly: boolean;
  readOnlyValues?: Record<string, unknown>;
}) {
  const { register } = useFormContext();
  return (
    <Field>
      <FieldHeader num={block.num} title={block.title} help={block.help} />
      <input
        className="px-field-input"
        placeholder={block.placeholder}
        {...register(block.id, { required: block.required })}
        disabled={isReadOnly}
        defaultValue={
          isReadOnly
            ? (readOnlyValues?.[block.id] as string | undefined)
            : undefined
        }
      />
    </Field>
  );
}

function FieldTextareaRow({
  block,
  isReadOnly,
  readOnlyValues,
}: {
  block: Extract<Block, { type: "field-textarea" }>;
  isReadOnly: boolean;
  readOnlyValues?: Record<string, unknown>;
}) {
  const { register } = useFormContext();
  return (
    <Field>
      <FieldHeader num={block.num} title={block.title} help={block.help} />
      <textarea
        className="px-field-textarea"
        placeholder={block.placeholder}
        {...register(block.id, { required: block.required })}
        disabled={isReadOnly}
        defaultValue={
          isReadOnly
            ? (readOnlyValues?.[block.id] as string | undefined)
            : undefined
        }
      />
    </Field>
  );
}

function RadioGroupRow({
  block,
  isReadOnly,
}: {
  block: Extract<Block, { type: "radio-group" }>;
  isReadOnly: boolean;
}) {
  const { control } = useFormContext();
  return (
    <Field>
      <FieldHeader num={block.num} title={block.title} help={block.help} />
      <Controller
        control={control}
        name={block.id}
        rules={{ required: block.required }}
        render={({ field }) => (
          <RadioGroup
            name={block.id}
            options={block.options}
            value={field.value as string | undefined}
            onChange={isReadOnly ? undefined : field.onChange}
            horizontal={block.horizontal}
          />
        )}
      />
    </Field>
  );
}

function CheckGroupRow({
  block,
  isReadOnly,
}: {
  block: Extract<Block, { type: "check-group" }>;
  isReadOnly: boolean;
}) {
  const { control } = useFormContext();
  return (
    <Field>
      <FieldHeader num={block.num} title={block.title} help={block.help} />
      <Controller
        control={control}
        name={block.id}
        render={({ field }) => (
          <CheckGroup
            name={block.id}
            options={block.options}
            values={(field.value as string[] | undefined) ?? []}
            onChange={isReadOnly ? undefined : field.onChange}
            horizontal={block.horizontal}
          />
        )}
      />
    </Field>
  );
}

function LikertClusterRow({
  block,
  isReadOnly,
}: {
  block: Extract<Block, { type: "likert-cluster" }>;
  isReadOnly: boolean;
}) {
  const { watch, setValue } = useFormContext();
  const values: Record<string, number | undefined> = {};
  for (const q of block.questions) {
    const v = watch(q.id) as number | undefined;
    values[q.id] = typeof v === "number" ? v : undefined;
  }
  return (
    <LikertCluster
      tag={block.tag}
      name={block.name}
      keywords={block.keywords}
      questions={block.questions}
      values={values}
      onChange={
        isReadOnly
          ? undefined
          : (id, v) =>
              setValue(id, v, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
      }
      formName={(id) => id}
    />
  );
}

function TableBlockRow({
  block,
}: {
  block: Extract<Block, { type: "table" }>;
}) {
  return (
    <TableSimple
      columns={block.columns.map((c) => ({
        header: c.header,
        width: c.width,
      }))}
      rows={block.rows.map((row) =>
        row.map((cell, idx) => {
          if (idx === 0) {
            if (cell === "바로 알리기")
              return <Signal variant="warn" label={cell} />;
            if (cell === "이번 주 안에") return <Signal label={cell} />;
            if (cell === "월 보고로 충분")
              return <Signal variant="ok" label={cell} />;
          }
          return cell;
        }),
      )}
    />
  );
}

function MetaGridRow({
  block,
  isReadOnly,
  readOnlyValues,
}: {
  block: Extract<Block, { type: "meta-grid" }>;
  isReadOnly: boolean;
  readOnlyValues?: Record<string, unknown>;
}) {
  const { register } = useFormContext();
  return (
    <MetaGrid
      columns={block.columns}
      cells={block.cells.map((c) => ({
        label: c.label,
        value: c.id ? (
          <input
            type={c.fieldType === "date" ? "date" : "text"}
            {...register(c.id)}
            disabled={isReadOnly}
            defaultValue={
              isReadOnly
                ? (readOnlyValues?.[c.id] as string | undefined)
                : undefined
            }
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              width: "100%",
              fontFamily: "inherit",
              fontSize: "inherit",
              color: "inherit",
              padding: 0,
              minHeight: c.fieldType === "signature" ? "2.5em" : undefined,
            }}
          />
        ) : (
          " "
        ),
      }))}
    />
  );
}
