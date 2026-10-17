import type { MoodKey } from "../moods";
import type { Track } from "../types";
import type { Edition } from "./editions";

/**
 * Data yang boleh dipakai rangkuman dari satu playlist riwayat.
 * PRIVASI: sengaja TANPA `story` dan `request` (request.mood = teks cerita yang sama). Lihat toRecapSource().
 */
export type RecapSource = {
  id: string;
  mood: MoodKey | null;
  createdAt: number;
  sliderValue: number | null;
  tracks: Track[];
  rejected?: string[];
  liftMissing?: boolean;
};

export type WeekTrend = "membaik" | "memberat" | "stabil";
export type ListenerTypeId = "penikmat-sendu" | "pencari-semangat" | "pengelana" | "anak-pagi" | "anak-malam" | "serba-rasa";
export type SlideId = "cover" | "numbers" | "quiz" | "mood" | "calendar" | "hours" | "track" | "listenerType" | "closing";

export type ListenerType = {
  id: ListenerTypeId;
  name: string;
  description: string; // maks 25 kata
  traits: { label: string; value: number }[]; // 3 sifat, persen 0–100 dari data bulan ini
  match: { id: ListenerTypeId; name: string }; // "cocok sama"
  rarity: number | null; // persen pendengar dengan tipe ini; null = belum ada data agregat (jangan dikarang)
  reason: string; // aturan yang terpenuhi (untuk debug / tes)
};

export type RecapCopy = {
  opening: string; // kalimat pembuka slide cover
  coverTags: string[]; // 3 tag di cover
  hours: string; // "anak malam." dst. (null window → "kamu curhat kapan aja.")
  trend: string;
  tags: string[]; // "± 3 jam musik", "5,2 lagu per curhat", "no skip :')"
  slider: string; // dimasukkan ke slide listenerType
  closing: string;
};

export type Recap = {
  year: number;
  month: number; // 1–12
  edition: Edition;
  totals: { sessions: number; tracks: number; minutes: number | null }; // minutes null = tidak ada durasi dari Deezer
  moods: { mood: MoodKey; count: number }[]; // urut terbanyak; playlist tanpa mood tidak dihitung
  topMood: { mood: MoodKey; count: number; share: number } | null; // share 0–1 dari semua sesi
  calendar: { day: number; mood: MoodKey | null; count: number }[]; // 1..akhir bulan
  weekTrend: WeekTrend;
  hours: number[]; // 24 jam, jumlah sesi per jam
  favoriteWindow: { start: number; end: number; count: number } | null; // jendela 2 jam, end eksklusif (mod 24)
  topTrack: { title: string; artist: string; cover: string; count: number } | null;
  topArtist: { name: string; count: number } | null;
  slider: { temenin: number; hibur: number; used: boolean }; // persen sesi dengan posisi < 0.5 / ≥ 0.5
  listenerType: ListenerType;
  quiz: { answer: MoodKey; options: MoodKey[] } | null; // null kalau tidak ada mood sama sekali
  copy: RecapCopy;
  vsLastMonth: { liftDelta: number } | null; // rata-rata lift bulan ini − bulan lalu
};
