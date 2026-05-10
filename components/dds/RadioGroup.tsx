"use client";

import { cn } from "@/lib/utils";

export type RadioOption = {
  value: string;
  label: string;
};

type RadioGroupProps = {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (next: string) => void;
  horizontal?: boolean;
};

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  horizontal,
}: RadioGroupProps) {
  return (
    <div
      className={cn(
        "px-checkgroup",
        horizontal && "px-checkgroup--horizontal",
      )}
      role="radiogroup"
    >
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <label key={opt.value} className="px-check">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange?.(opt.value)}
            />
            <span className="px-check-box px-check-box--radio" />
            <span className="px-check-label">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
