// Fitur "Geser mood": memilih lagu dari pool sesuai posisi slider (p = 0–1),
// plus warna panel yang ikut bergeser. Tidak memanggil AI atau Deezer lagi.

import { contrast, mix } from "./color";
import { MOODS, themeFor, type MoodKey } from "./moods";
import type { Track } from "./types";

/** Jumlah lagu yang tampil: selalu lebih sedikit dari pool supaya slider benar-benar mengganti isi daftar */
export function visibleCount(poolSize: number) {
  if (poolSize <= 1) return poolSize;
  return Math.min(poolSize - 1, Math.max(5, Math.min(10, Math.floor(poolSize * 0.6))));
}

/** Mood yang sudah ceria: lift = tingkat energi, dan ujung kiri slider memakai warna tenang */
export const isCheerful = (mood: MoodKey | null) => mood === "bahagia" || mood === "semangat";

/** Posisi awal slider */
export const defaultLift = (mood: MoodKey | null) => (isCheerful(mood) ? 0.85 : 0.15);

/** Aturan slider per mood: label ujung, label tersembunyi, kalimat per rentang p, dan arti lift */
export type SliderRule = {
  left: string;
  right: string;
  hidden: string;
  captions: [string, string, string]; // p < 0.34, p < 0.67, selain itu
  liftName: "ceria" | "energi"; // dibacakan sebagai "Tingkat {liftName} X dari 5"
};

const DEFAULT_RULE: SliderRule = {
  left: "Temenin aku",
  right: "Hibur aku",
  hidden: "Geser dari temenin aku sampai hibur aku",
  captions: ["Pelan-pelan dulu, nggak apa-apa.", "Dari sendu, pelan-pelan ke hangat.", "Yuk, pelan-pelan bangkit."],
  liftName: "ceria",
};

const RULES: Partial<Record<MoodKey, SliderRule>> = {
  bahagia: {
    left: "Santai aja",
    right: "Makin pecah",
    hidden: "Geser dari santai aja sampai makin pecah",
    captions: ["Santai dulu, nikmatin senyumnya.", "Hangat, asyik, nggak buru-buru.", "Makin pecah, ayo joget!"],
    liftName: "energi",
  },
  semangat: {
    left: "Pemanasan dulu",
    right: "Gas pol",
    hidden: "Geser dari pemanasan dulu sampai gas pol",
    captions: ["Pemanasan dulu, pelan tapi pasti.", "Mulai panas, jaga ritmenya.", "Gas pol, jangan kasih kendor!"],
    liftName: "energi",
  },
};

export const sliderRule = (mood: MoodKey | null): SliderRule => (mood && RULES[mood]) || DEFAULT_RULE;

export const sliderCaption = (rule: SliderRule, p: number) => rule.captions[p < 0.34 ? 0 : p < 0.67 ? 1 : 2];

const isValidLift = (lift: unknown) => typeof lift === "number" && Number.isInteger(lift) && lift >= 1 && lift <= 5;

/** Tingkat ceria lagu (1–5) */
export const liftOf = (t: Track) => (isValidLift(t.lift) ? t.lift : 3);

/**
 * Lagu tanpa skor lift yang valid (mis. playlist lama sebelum ada Geser mood) diberi 3 + warning.
 * `liftMissing` = lebih dari separuh pool tidak punya lift asli → slider disembunyikan.
 */
export function normalizeLift(tracks: Track[]): { tracks: Track[]; liftMissing: boolean } {
  const missing = tracks.filter((t) => !isValidLift(t.lift));
  if (missing.length === 0) return { tracks, liftMissing: false };
  console.warn(
    `[geser-mood] ${missing.length} dari ${tracks.length} lagu tanpa skor lift yang valid, dipakai 3:`,
    missing.map((t) => t.title),
  );
  return {
    tracks: tracks.map((t) => (isValidLift(t.lift) ? t : { ...t, lift: 3 })),
    liftMissing: missing.length > tracks.length / 2,
  };
}

/**
 * Lagu yang tampil untuk posisi p (jumlahnya dari visibleCount). Target lift tiap slot naik dari s0 ke s1;
 * tiap slot mengambil lagu yang belum terpakai dengan |lift - target| terkecil.
 */
export function pickTracks(fullPool: Track[], p: number, rejected: readonly string[] = []): Track[] {
  const s0 = 1 + 2 * p;
  const s1 = 2 + 3 * p;
  // Lagu "nggak cocok" dibuang; jumlah tampil tetap dari ukuran pool penuh supaya yang ditolak diganti cadangan
  const pool = rejected.length ? fullPool.filter((t) => !rejected.includes(t.id)) : fullPool;
  const count = Math.min(visibleCount(fullPool.length), pool.length);
  const used = new Set<number>();
  const out: Track[] = [];
  for (let i = 0; i < count; i++) {
    const target = count === 1 ? s0 : s0 + ((s1 - s0) * i) / (count - 1);
    let best = -1;
    pool.forEach((t, j) => {
      if (used.has(j)) return;
      if (best === -1 || Math.abs(liftOf(t) - target) < Math.abs(liftOf(pool[best]) - target)) best = j;
    });
    used.add(best);
    out.push(pool[best]);
  }
  return out;
}

type Colors = { bg: string; accent: string };
const MIDDLE: Colors = { bg: "#7A47C2", accent: "#FFD84D" };
const CHEERFUL_END: Colors = { bg: "#C2541F", accent: "#FFE08A" }; // Bahagia

/** Warna panel untuk posisi p: interpolasi RGB dua segmen (ujung kiri → tengah → ujung kanan) */
export function sliderColors(mood: MoodKey | null, p: number): Colors & { soft: string } {
  const origin = themeFor(mood);
  const [left, right] = isCheerful(mood)
    ? [{ bg: MOODS.hujan.bg, accent: MOODS.hujan.accent }, origin]
    : [origin, CHEERFUL_END];
  const [a, b, t] = p <= 0.5 ? [left, MIDDLE, p / 0.5] : [MIDDLE, right, (p - 0.5) / 0.5];
  const bg = mix(a.bg, b.bg, t);
  // Teks sekunder: warna desain mood kalau kontrasnya cukup, selain itu putih
  const soft = contrast(origin.soft, bg) >= 4.5 ? origin.soft : "#FFFFFF";
  return { bg, accent: mix(a.accent, b.accent, t), soft };
}

/** Warna untuk tingkat lift 1–5: warna Geser mood di posisi yang setara (1 = ujung kiri, 5 = ujung kanan) */
export const liftColor = (mood: MoodKey | null, lift: number) => sliderColors(mood, (lift - 1) / 4).bg;

/**
 * Lagu yang benar-benar tampil untuk sebuah playlist tersimpan (urutan & jumlah sama dengan halaman hasil):
 * slider dibulatkan ke 5 tingkat; playlist lama tanpa lift = semua lagu kecuali yang ditolak.
 */
export function shownTracks(p: {
  tracks: Track[];
  mood: MoodKey | null;
  sliderValue: number | null;
  rejected?: readonly string[];
  liftMissing?: boolean;
}): Track[] {
  if (p.liftMissing) return p.rejected?.length ? p.tracks.filter((t) => !p.rejected!.includes(t.id)) : p.tracks;
  return pickTracks(p.tracks, Math.round((p.sliderValue ?? defaultLift(p.mood)) * 4) / 4, p.rejected);
}
