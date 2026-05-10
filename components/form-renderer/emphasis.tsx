import type { ReactNode } from "react";

/**
 * Pixelab 카피 컨벤션: **bold** 만 인정.
 * (이모지·느낌표는 가이드상 금지이므로 별도 처리 안 함)
 */
export function renderEmphasis(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((segment, i) => {
    if (segment.startsWith("**") && segment.endsWith("**")) {
      return <strong key={i}>{segment.slice(2, -2)}</strong>;
    }
    return <span key={i}>{segment}</span>;
  });
}
