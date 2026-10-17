// SEMUA kalimat otomatis Rangkuman bulanan ada di file ini (ubah teksnya di sini saja).
import { MOODS, type MoodKey } from "../moods";
import type { RecapCopy, WeekTrend } from "./types";

/** Teks tetap di slide (label, pertanyaan, tombol). {mood}, {n} diganti saat dipakai. */
export const SLIDE_COPY = {
  editionLabel: (n: number, monthName: string) => `Edisi ${String(n).padStart(2, "0")} · ${monthName}`,
  numbers: { sessions: "curhat", tracks: "lagu" },
  quiz: {
    question: "Lampu mana yang paling sering nyala bulan ini?",
    right: "Tepat!",
    wrong: (mood: string) => `Hampir! Yang paling sering nyala: ${mood}.`,
    count: (n: number) => `${n}x`,
    next: "Lihat jawabannya →",
  },
  mood: { label: "Mood paling sering", times: (n: number) => `${n}x` },
  calendar: { label: "Kalender rasa", weekdays: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"], empty: "nggak ada curhat" },
  hours: { label: "Jam favorit", range: (s: string, e: string) => `${s}–${e}` },
  track: { label: "Lagu paling sering", replay: (n: number) => `${n}x replay`, artist: (name: string) => `Penyanyi favorit: ${name}` },
  listener: { label: "Tipe pendengar", match: (name: string) => `Cocok sama ${name}`, rarity: (p: number) => `Cuma ${p}% pendengar` },
  closing: {
    stats: { sessions: "curhat", tracks: "lagu", minutes: "menit", mood: "mood utama" },
    share: "Bagikan edisi ini",
    save: "Simpan gambar",
    replay: "Putar ulang",
  },
  player: { close: "Tutup rangkuman", pause: "Jeda", play: "Lanjutkan", slide: (i: number, n: number) => `Slide ${i} dari ${n}` },
  notEnough: (month: string, year: number) => `Belum cukup playlist buat rangkuman ${month} ${year}.`,
  notEnoughHint: "Rangkuman muncul setelah ada minimal 3 playlist di bulan itu.",
} as const;

export const HOURS_COPY = {
  malam: "anak malam.", // jendela mulai ≥ 22 atau < 4 (jam 3 dini hari dihitung malam)
  subuh: "anak subuh.", // mulai 4–8
  siang: "curhat di sela-sela hari.", // mulai 9–16
  senja: "anak senja.", // mulai 17–21
  kapanAja: "kamu curhat kapan aja.", // tidak ada jendela favorit
} as const;

export const TREND_COPY: Record<WeekTrend, string> = {
  membaik: "Akhir bulan mulai cerah.",
  memberat: "Akhir bulan agak berat. Pelan-pelan, ya.",
  stabil: "Rasamu cukup stabil bulan ini.",
};

export const SLIDER_COPY = {
  temenin: "Kadang yang dibutuhkan memang ditemani dulu.", // temenin ≥ 60%
  hibur: "Kamu jago bangkit cepat.", // hibur ≥ 60%
  seimbang: "Kamu tahu kapan butuh ditemani, kapan butuh dihibur.",
} as const;

export const TAG_COPY = {
  jamMusik: (jam: number) => `± ${jam} jam musik`,
  menitMusik: (menit: number) => `± ${menit} menit musik`,
  laguPerCurhat: (x: string) => `${x} lagu per curhat`,
  noSkip: "no skip :')",
} as const;

export const CLOSING_COPY = (sessions: number, tracks: number) => `${sessions} curhat. ${tracks} lagu. 1 kamu yang tetap bertahan.`;
export const OPENING_COPY = (monthName: string, sessions: number) => `Ini ${monthName}-mu, dalam ${sessions} curhat.`;
export const COVER_TAGS = (sessions: number, topMood: MoodKey | null, hours: string) =>
  [`${sessions} curhat`, topMood ? `paling sering ${MOODS[topMood].label.toLowerCase()}` : "rasa campur aduk", hours.replace(/\.$/, "")];

/** Kalimat jam berdasarkan jam mulai jendela favorit */
export function hoursCopy(start: number | null): string {
  if (start === null) return HOURS_COPY.kapanAja;
  if (start >= 22 || start < 4) return HOURS_COPY.malam;
  if (start <= 8) return HOURS_COPY.subuh;
  if (start <= 16) return HOURS_COPY.siang;
  return HOURS_COPY.senja;
}

export function sliderCopy(temenin: number, hibur: number): string {
  if (temenin >= 60) return SLIDER_COPY.temenin;
  if (hibur >= 60) return SLIDER_COPY.hibur;
  return SLIDER_COPY.seimbang;
}

/** Tag angka kecil di slide angka */
export function numberTags(minutes: number | null, sessions: number, tracks: number, topTrackCount: number): string[] {
  const tags: string[] = [];
  if (minutes !== null && minutes > 0) tags.push(minutes >= 60 ? TAG_COPY.jamMusik(Math.round(minutes / 60)) : TAG_COPY.menitMusik(minutes));
  if (sessions > 0) tags.push(TAG_COPY.laguPerCurhat((Math.round((tracks / sessions) * 10) / 10).toLocaleString("id-ID")));
  if (topTrackCount >= 3) tags.push(TAG_COPY.noSkip);
  return tags;
}

export function buildCopy(p: {
  monthName: string;
  topMood: MoodKey | null;
  windowStart: number | null;
  trend: WeekTrend;
  minutes: number | null;
  sessions: number;
  tracks: number;
  topTrackCount: number;
  temenin: number;
  hibur: number;
}): RecapCopy {
  const hours = hoursCopy(p.windowStart);
  return {
    opening: OPENING_COPY(p.monthName, p.sessions),
    coverTags: COVER_TAGS(p.sessions, p.topMood, hours),
    hours,
    trend: TREND_COPY[p.trend],
    tags: numberTags(p.minutes, p.sessions, p.tracks, p.topTrackCount),
    slider: sliderCopy(p.temenin, p.hibur),
    closing: CLOSING_COPY(p.sessions, p.tracks),
  };
}
