// Tipe pendengar Rangkuman bulanan. Aturan dipilih berurutan (yang pertama cocok menang):
//   1. Si Serba Rasa       : tidak ada mood yang > 35% sesi (rasa benar-benar campur, mengalahkan aturan lain)
//   2. Si Penikmat Sendu   : mood terbanyak galau / patah hati / hujan DAN slider "temenin" ≥ 55%
//   3. Si Pencari Semangat : mood terbanyak semangat / bahagia, ATAU slider "hibur" ≥ 60%
//   4. Si Pengelana        : mood terbanyak perjalanan
//   5. Si Anak Pagi        : jendela jam favorit mulai jam 4–9
//   6. Si Anak Malam       : jendela jam favorit mulai jam 22–2
//   7. Cadangan            : mood terbanyak sendu → Si Penikmat Sendu; selain itu Si Serba Rasa
// Tiap tipe: nama, deskripsi (maks 25 kata), 3 sifat (persen dari data bulan itu), dan pasangan "cocok sama".
// Rarity hanya diisi kalau ada data agregat (dari luar); tanpa itu null (jangan mengarang angka).

import type { MoodKey } from "../moods";
import type { ListenerType, ListenerTypeId } from "./types";

/** Angka bulan itu yang dipakai aturan & sifat (semua persen 0–100, dibulatkan) */
export type ListenerStats = {
  topMood: MoodKey | null;
  topShare: number; // persen sesi dengan mood terbanyak
  temenin: number;
  hibur: number;
  windowStart: number | null;
  sadTracks: number; // persen lagu tampil dengan lift ≤ 2
  happyTracks: number; // persen lagu tampil dengan lift ≥ 4
  night: number; // persen sesi jam 21.00–02.59
  morning: number; // persen sesi jam 04.00–09.59
  travel: number; // persen sesi mood perjalanan
  variety: number; // jumlah mood berbeda / 6
};

const SAD: MoodKey[] = ["galau", "patah-hati", "hujan"];
const CHEERFUL: MoodKey[] = ["semangat", "bahagia"];

type Definition = {
  name: string;
  description: string;
  traits: (s: ListenerStats) => [string, number][];
  match: ListenerTypeId;
};

export const LISTENER_TYPES: Record<ListenerTypeId, Definition> = {
  "penikmat-sendu": {
    name: "Si Penikmat Sendu",
    description: "Kamu nggak buru-buru mengusir sedih. Kamu dengarkan pelan-pelan, sampai lagunya selesai dan hatimu ikut lega.",
    traits: (s) => [["Mode temenin", s.temenin], ["Lagu sendu", s.sadTracks], ["Setia sama rasa", s.topShare]],
    match: "pencari-semangat",
  },
  "pencari-semangat": {
    name: "Si Pencari Semangat",
    description: "Buatmu musik itu bahan bakar. Lagu yang tepat bisa mengubah hari yang berat jadi hari yang bisa dilewati.",
    traits: (s) => [["Mode hibur", s.hibur], ["Lagu ceria", s.happyTracks], ["Mood utama", s.topShare]],
    match: "penikmat-sendu",
  },
  pengelana: {
    name: "Si Pengelana",
    description: "Perasaanmu paling hidup saat sedang di jalan. Pemandangan berganti, lagunya ikut bercerita sepanjang perjalanan.",
    traits: (s) => [["Di perjalanan", s.travel], ["Lagu ceria", s.happyTracks], ["Ragam mood", s.variety]],
    match: "serba-rasa",
  },
  "anak-pagi": {
    name: "Si Anak Pagi",
    description: "Kamu menyapa hari dengan lagu. Sebelum dunia ramai, kamu sudah tahu mau dibawa ke mana rasamu.",
    traits: (s) => [["Curhat pagi", s.morning], ["Lagu ceria", s.happyTracks], ["Mode hibur", s.hibur]],
    match: "anak-malam",
  },
  "anak-malam": {
    name: "Si Anak Malam",
    description: "Saat semua sudah tidur, kamu baru mulai jujur sama perasaan sendiri. Malam adalah ruang dengarmu.",
    traits: (s) => [["Curhat malam", s.night], ["Lagu sendu", s.sadTracks], ["Mode temenin", s.temenin]],
    match: "anak-pagi",
  },
  "serba-rasa": {
    name: "Si Serba Rasa",
    description: "Bulan ini rasamu berganti-ganti, dan kamu tetap menemukan lagu yang pas untuk setiap versinya.",
    traits: (s) => [["Ragam mood", s.variety], ["Mode temenin", s.temenin], ["Mode hibur", s.hibur]],
    match: "pengelana",
  },
};

/** Pilih tipe sesuai aturan berurutan di atas; `reason` menjelaskan aturan yang terpenuhi */
export function pickListenerType(s: ListenerStats): { id: ListenerTypeId; reason: string } {
  const start = s.windowStart;
  if (s.topShare <= 35) return { id: "serba-rasa", reason: "tidak ada mood > 35%" };
  if (s.topMood && SAD.includes(s.topMood) && s.temenin >= 55) return { id: "penikmat-sendu", reason: "mood sendu + temenin ≥ 55%" };
  if ((s.topMood && CHEERFUL.includes(s.topMood)) || s.hibur >= 60) return { id: "pencari-semangat", reason: "mood ceria atau hibur ≥ 60%" };
  if (s.topMood === "perjalanan") return { id: "pengelana", reason: "mood perjalanan" };
  if (start !== null && start >= 4 && start <= 9) return { id: "anak-pagi", reason: "jendela mulai 4–9" };
  if (start !== null && (start >= 22 || start <= 2)) return { id: "anak-malam", reason: "jendela mulai 22–2" };
  if (s.topMood && SAD.includes(s.topMood)) return { id: "penikmat-sendu", reason: "cadangan: mood terbanyak sendu" };
  return { id: "serba-rasa", reason: "cadangan" };
}

export function listenerType(s: ListenerStats, rarity: Partial<Record<ListenerTypeId, number>> = {}): ListenerType {
  const { id, reason } = pickListenerType(s);
  const def = LISTENER_TYPES[id];
  return {
    id,
    name: def.name,
    description: def.description,
    traits: def.traits(s).map(([label, value]) => ({ label, value: Math.max(0, Math.min(100, Math.round(value))) })),
    match: { id: def.match, name: LISTENER_TYPES[def.match].name },
    rarity: rarity[id] ?? null,
    reason,
  };
}
