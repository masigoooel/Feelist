// Palet warna mood feelist. Ubah warna, arti, atau teks tombol cukup di file ini.
// Teks di atas semua latar selalu putih; teks di atas warna aksen memakai ACCENT_INK.

export type MoodKey = "galau" | "bahagia" | "semangat" | "hujan" | "perjalanan" | "patah-hati";

export type MoodTheme = {
  bg: string; // warna latar halaman
  accent: string; // warna tombol utama, sorotan, & batang tengah logo
  // Teks sekunder di atas latar. Desainnya #E9E3FF, tapi di latar yang kontrasnya
  // kurang dari 4.5:1 dipakai putih supaya tetap mudah dibaca.
  soft: string;
  meaning: string; // arti warna (ditampilkan di bawah tombol mood)
};

export const ACCENT_INK = "#1E1240";

// Tema bawaan: dipakai sebelum ada mood yang dipilih / ditebak AI
export const DEFAULT_THEME: MoodTheme = {
  bg: "#6C4CF5",
  accent: "#FFD84D",
  soft: "#FFFFFF", // #E9E3FF hanya 4.23:1
  meaning: "Ungu, untuk rasa yang belum punya nama.",
};

export const MOODS: Record<MoodKey, MoodTheme & { label: string; text: string }> = {
  galau: {
    label: "Galau",
    text: "lagi galau parah, butuh lagu buat overthinking jam 2 pagi",
    bg: "#3A4FB8",
    accent: "#BFE3FF",
    soft: "#E9E3FF", // 5.65:1
    meaning: "Biru tua, untuk sendu yang bikin kamu banyak merenung.",
  },
  bahagia: {
    label: "Bahagia",
    text: "lagi happy banget, pengen lagu yang bikin senyum terus",
    bg: "#C2541F",
    accent: "#FFE08A",
    soft: "#FFFFFF", // #E9E3FF hanya 3.69:1
    meaning: "Oranye, untuk hangat dan ceria yang pengen dibagi.",
  },
  semangat: {
    label: "Semangat",
    text: "butuh semangat buat bangkit, gas pol hari ini",
    bg: "#C23B4A",
    accent: "#FFD84D",
    soft: "#FFFFFF", // #E9E3FF hanya 4.20:1
    meaning: "Merah, untuk energi dan berani mulai lagi.",
  },
  hujan: {
    label: "Hujan",
    text: "hujan di luar, pengen lagu yang adem dan cozy",
    bg: "#4F6475",
    accent: "#CFE8FF",
    soft: "#E9E3FF", // 4.95:1
    meaning: "Abu kebiruan, untuk tenang dan sejuk yang pelan.",
  },
  perjalanan: {
    label: "Perjalanan",
    text: "otw perjalanan jauh, butuh lagu buat sing along di jalan",
    bg: "#2F7D6D",
    accent: "#FFD84D",
    soft: "#FFFFFF", // #E9E3FF hanya 3.95:1
    meaning: "Hijau teal, untuk rasa bebas dan segar di jalan.",
  },
  "patah-hati": {
    label: "Patah hati",
    text: "baru patah hati, mau nangis dulu baru ikhlas",
    bg: "#9C4F6B",
    accent: "#FFC2D6",
    soft: "#E9E3FF", // 4.51:1
    meaning: "Merah muda pudar, untuk cinta yang lagi terluka.",
  },
};

export const MOOD_KEYS = Object.keys(MOODS) as MoodKey[];

export function isMoodKey(value: unknown): value is MoodKey {
  return typeof value === "string" && Object.hasOwn(MOODS, value);
}

export function themeFor(key: MoodKey | null | undefined): MoodTheme {
  return key ? MOODS[key] : DEFAULT_THEME;
}

