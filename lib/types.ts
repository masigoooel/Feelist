import type { MoodKey } from "./moods";
import type { Energy, Era, Language } from "./options";

export type Track = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  preview: string | null; // beberapa lagu di Deezer tidak punya preview
  link: string;
  duration?: number; // durasi lagu penuh dari Deezer (detik); kosong untuk playlist lama
  reason: string; // alasan singkat dari AI kenapa lagu ini cocok
  lift: number; // tingkat ceria dari AI: 1 = sangat sendu, 5 = sangat ceria/penyemangat
  setlistNote?: string; // catatan spidol untuk kartu Setlist (dari AI, ditempel ke lagunya di server)
  threadCaption?: string; // kalimat pendek untuk kartu Utas
};

export type PlaylistRequest = {
  mood: string;
  language: Language;
  era: Era;
  energy: Energy;
  moodKey?: MoodKey | null; // mood yang dipilih lewat chip (opsional)
  exclude?: string[]; // lagu yang sudah pernah direkomendasikan (untuk "Buat ulang")
};

/** Isi template "Ramalan": diisi AI */
export type Horoscope = {
  mood: string; // suasana hati, 1 kalimat
  luckySongIndex: number; // indeks lagu keberuntungan di `tracks`
  advice: string; // saran lucu
};

/** Teks kartu Story bertema mood (diisi AI; kosong → lib/storyCopyFallback.ts) */
export type QuizResult = {
  type: string; // tipe hasil kuis, maks 4 kata
  rarity: number; // persen orang dengan tipe ini (5–30)
  description: string;
  traits: { label: string; value: number }[]; // 4 sifat, nilai 0–100
};

export type ReportRow = { subject: string; score: number; grade: string; note: string };

export type StoryCopy = {
  chatOpening: string;
  chatClosing: string;
  receiptChange: string;
  ticketSeat: string;
  quiz?: QuizResult;
  report?: ReportRow[]; // 5 mata pelajaran rapor
  reportNote?: string; // catatan wali kelas
  notifications?: { title: string; body: string }[]; // 3 notifikasi layar kunci
  trainRoute?: { from: string; to: string }; // stasiun asal & tujuan karcis kereta
};

export type PlaylistResponse = {
  playlistTitle: string;
  description: string;
  mood: MoodKey | null; // mood dari chip, atau tebakan AI (null = warna bawaan)
  story: string; // cerita pengguna yang dipakai untuk membuat playlist (tidak pernah tampil di kartu Story)
  horoscope: Horoscope | null;
  storyCopy?: StoryCopy; // kosong untuk playlist lama
  tracks: Track[]; // "pool": semua lagu yang ketemu di Deezer; yang tampil dipilih slider (lib/moodSlider.ts)
  skipped: number; // jumlah lagu dari AI yang tidak ketemu di Deezer
};

/** Playlist yang sudah jadi, beserta cerita & request asalnya (disimpan di IndexedDB) */
export type SavedPlaylist = {
  id: string; // Date.now() saat dibuat
  playlist: PlaylistResponse;
  request: PlaylistRequest;
  history: string[]; // lagu yang sudah pernah muncul (dikirim saat "buat ulang")
  lift?: number; // posisi slider Geser mood (0–1); kosong = posisi awal
  liftMissing?: boolean; // playlist lama: >50% lagu tanpa skor lift asli → slider disembunyikan
  rejected?: string[]; // id lagu yang ditandai "nggak cocok" (tidak ditampilkan lagi)
};

export type SongSuggestion = { title: string; artist: string; reason?: string; lift?: number };
