import type { ReactNode } from "react";

/**
 * Kata bertanda hubung (mis. "apa-apa", "pelan-pelan") dibungkus nowrap supaya
 * browser tidak mematahkannya di tanda hubung. Plus Jakarta Sans tidak punya
 * karakter tanda hubung tak-patah (U+2011), jadi pakai cara ini.
 */
export function keepHyphens(text: string): ReactNode {
  const parts = text.split(/(\S+-\S+)/);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} style={{ whiteSpace: "nowrap" }}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}
