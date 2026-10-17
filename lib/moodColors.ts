// Warna turunan bg mood untuk dekorasi kartu Story
import { contrast, mix } from "./color";

const INK = "#1E1240";

export type MoodShades = {
  dark: string; // bg dicampur #1E1240 35%
  deep: string; // bg dicampur #1E1240 60%
  light: string; // bg dicampur putih 20%
  shade: string; // bayangan biru gelap transparan
};

export function moodShades(bg: string): MoodShades {
  return {
    dark: mix(bg, INK, 0.35),
    deep: mix(bg, INK, 0.6),
    light: mix(bg, "#FFFFFF", 0.2),
    shade: "rgba(20,27,77,0.5)",
  };
}

/** Warna hex dengan transparansi (mis. bg mood 85%) */
export function withAlpha(hex: string, alpha: number) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Warna teks yang terbaca (kontras ≥ min) di atas `bg`: kalau `fg` kurang kontras, dicampur putih
 * sedikit demi sedikit (latar kartu Story selalu gelap/sedang). Dipakai untuk teks berwarna aksen.
 */
export function readableOn(fg: string, bg: string, min = 4.6) {
  for (let t = 0; t <= 1.0001; t += 0.05) {
    const c = mix(fg, "#FFFFFF", Math.min(1, t));
    if (contrast(c, bg) >= min) return c;
  }
  return "#FFFFFF";
}

/** Kebalikan readableOn untuk latar terang (kertas): `fg` digelapkan ke arah tinta sampai kontras ≥ min */
export function readableOnPaper(fg: string, paper: string, min = 4.6) {
  for (let t = 0; t <= 1.0001; t += 0.05) {
    const c = mix(fg, INK, Math.min(1, t));
    if (contrast(c, paper) >= min) return c;
  }
  return INK;
}

/** Transparansi hiasan putih terbesar (≤ desired) yang masih membuat teks putih di atasnya kontras ≥ min */
export function safeOverlayAlpha(bg: string, desired: number, min = 4.6) {
  for (let a = desired; a > 0; a -= 0.01) {
    if (contrast("#FFFFFF", mix(bg, "#FFFFFF", a)) >= min) return Math.round(a * 100) / 100;
  }
  return 0;
}
