const parse = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

// Campur dua warna hex. `amount` = porsi warna kedua (0–1).
export function mix(base: string, other: string, amount: number) {
  const a = parse(base);
  const b = parse(other);
  return (
    "#" +
    a
      .map((v, i) => Math.round(v * (1 - amount) + b[i] * amount))
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Rasio kontras WCAG antara dua warna hex */
export function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const [r, g, bl] = parse(hex).map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
