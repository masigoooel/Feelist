// Tema "Neon malam" (Edisi 10 · Oktober · Hujan pertama): hujan malam di bawah lampu kota.
// Token warna & efek; komponen slide-nya di components/recap/themes/neon-malam/.
import type { CSSProperties } from "react";
import type { MoodKey } from "../../moods";

export const NEON = {
  bg: "#05030F",
  pink: "#FF3DF2",
  cyan: "#3DF2FF",
  yellow: "#FFE45C",
  white: "#FFFFFF",
  dim: "rgb(255 255 255 / 0.72)", // teks sekunder (kontras ≥ 4.5:1 di atas #05030F)
} as const;

/** Warna mood versi neon (semua kontras ≥ 4.5:1 di atas latar #05030F) */
export const NEON_MOOD: Record<MoodKey, string> = {
  galau: "#6F8BFF",
  "patah-hati": "#FF3DF2",
  perjalanan: "#3DFFB0",
  semangat: "#FFE45C",
  hujan: "#3DF2FF",
  bahagia: "#FF9F43",
};
export const neonMood = (m: MoodKey | null) => (m ? NEON_MOOD[m] : NEON.white);

export const NEON_FONT = {
  sans: "var(--font-sans), system-ui, sans-serif",
  serif: "var(--font-serif), Georgia, serif",
  mono: "var(--font-mono), ui-monospace, monospace",
} as const;

/** Teks neon: text-shadow 3 lapis warna yang sama (`k` = skala cahaya, mis. 2.7 untuk gambar 1080px) */
export const neonText = (c: string, k = 1): CSSProperties => ({ color: c, textShadow: `0 0 ${4 * k}px ${c}, 0 0 ${12 * k}px ${c}, 0 0 ${28 * k}px ${c}` });

/** Kotak neon: border 2px + cahaya luar & dalam (`border` px bisa diperbesar untuk gambar 1080px) */
export const neonBox = (c: string, strength = 1, border = 2): CSSProperties => ({
  border: `${border}px solid ${c}`,
  boxShadow: `0 0 ${12 * strength}px ${c}, inset 0 0 ${12 * strength}px ${c}`,
});

/** Versi redup (pilihan kuis yang salah, mood < 2x, hari tanpa curhat) */
export const DIM_OPACITY = 0.35;
