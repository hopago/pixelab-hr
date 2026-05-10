"use client";

import { cn } from "@/lib/utils";

export type CheckOption = {
  value: string;
  label: string;
};

type CheckGroupProps = {
  name: string;
  options: CheckOption[];
  values?: string[];
  onChange?: (next: string[]) => void;
  horizontal?: boolean;
};

export function CheckGroup({
  name,
  options,
  values = [],
  onChange,
  horizontal,
}: CheckGroupProps) {
  const toggle = (v: string) => {
    if (!onChange) return;
    if (values.includes(v)) onChange(values.filter((x) => x !== v));
    else onChange([...values, v]);
  };
  return (
    <div
      className={cn(
        "px-checkgroup",
        horizontal && "px-checkgroup--horizontal",
      )}
    >
      {options.map((opt) => {
        const checked = values.includes(opt.value);
        return (
          <label key={opt.value} className="px-check">
            <input
              type="checkbox"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => toggle(opt.value)}
            />
            <span className="px-check-box" />
            <span className="px-check-label">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
