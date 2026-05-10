"use client";

import { cn } from "@/lib/utils";

export type LikertScale = 5;

export type LikertQuestion = {
  id: string;
  text: string;
};

type LikertRowProps = {
  num: string;
  text: string;
  value?: number;
  onChange?: (value: number) => void;
  name?: string;
  scale?: number;
};

export function LikertRow({
  num,
  text,
  value,
  onChange,
  name,
  scale = 5,
}: LikertRowProps) {
  const cells = Array.from({ length: scale }, (_, i) => i + 1);
  return (
    <div className="px-q">
      <div className="px-q-num">{num}</div>
      <div className="px-q-text">{text}</div>
      <div className="px-likert" role="radiogroup" aria-label={text}>
        {cells.map((n) => {
          const selected = value === n;
          return (
            <div
              key={n}
              className={cn("px-likert-cell", selected && "px-likert-cell--selected")}
              role="radio"
              aria-checked={selected}
              tabIndex={onChange ? 0 : -1}
              onClick={() => onChange?.(n)}
              onKeyDown={(e) => {
                if (!onChange) return;
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  onChange(n);
                }
              }}
            >
              {n}
              {/* hidden input keeps native form submission working */}
              {name && (
                <input
                  type="radio"
                  name={name}
                  value={n}
                  checked={selected}
                  onChange={() => onChange?.(n)}
                  className="sr-only"
                  tabIndex={-1}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type AnchorBarProps = {
  left?: string;
  right?: string;
};

export function LikertAnchorBar({
  left = "1 · 전혀 아니다",
  right = "매우 그렇다 · 5",
}: AnchorBarProps) {
  return (
    <div className="px-anchor-bar">
      <div>NO</div>
      <div>QUESTION</div>
      <div>
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

type LikertClusterProps = {
  tag: string;
  name: string;
  keywords?: string;
  questions: LikertQuestion[];
  values?: Record<string, number | undefined>;
  onChange?: (id: string, value: number) => void;
  formName?: (id: string) => string;
};

export function LikertCluster({
  tag,
  name,
  keywords,
  questions,
  values,
  onChange,
  formName,
}: LikertClusterProps) {
  return (
    <div className="px-style-cluster">
      <div className="px-style-cluster-head">
        <span className="px-style-tag">{tag}</span>
        <span className="px-style-name">{name}</span>
        {keywords && <span className="px-style-keywords">{keywords}</span>}
      </div>
      {questions.map((q) => (
        <LikertRow
          key={q.id}
          num={q.id}
          text={q.text}
          value={values?.[q.id]}
          onChange={onChange ? (v) => onChange(q.id, v) : undefined}
          name={formName?.(q.id) ?? q.id}
        />
      ))}
    </div>
  );
}
