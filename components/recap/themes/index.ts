import type { EditionTheme } from "@/lib/recap/editions";
import type { PartialRecapTheme, RecapTheme } from "../types";
import { neonMalam } from "./neon-malam";

/**
 * Daftar tema per edisi. Menambah tema baru: buat folder themes/<nama>/ yang mengekspor PartialRecapTheme,
 * lalu daftarkan di sini. Bagian yang belum dibuat (latar, slide tertentu, gambar bagikan) otomatis
 * memakai Neon malam, jadi tema bisa dibangun bertahap tanpa mengubah logika pemutar.
 */
const THEMES: Record<EditionTheme, PartialRecapTheme | null> = {
  swiss: null,
  diary: null,
  riso: null,
  dreamy: null,
  editorial: null,
  pixel: null,
  retro70: null,
  boldFlat: null,
  brutalist: null,
  neonMalam,
  kolaseCover: null,
  y2k: null,
};

const FALLBACK: RecapTheme = neonMalam;
const cache = new Map<EditionTheme, RecapTheme>();

/** Tema lengkap untuk satu edisi (objek yang sama setiap kali dipanggil) */
export function themeFor(id: EditionTheme): RecapTheme {
  let theme = cache.get(id);
  if (!theme) {
    const t = THEMES[id];
    theme = t ? ({ ...FALLBACK, ...t, id, slides: { ...FALLBACK.slides, ...t.slides } } as RecapTheme) : FALLBACK;
    cache.set(id, theme);
  }
  return theme;
}

/** Tema yang sudah benar-benar dibuat (bukan cadangan) */
export const isThemeReady = (id: EditionTheme) => THEMES[id] !== null;
