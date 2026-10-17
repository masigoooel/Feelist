// 12 edisi Rangkuman bulanan: tiap bulan punya judul & tema tetap, dipilih sesuai suasana bulannya.
// Tema (tampilan) didaftarkan di components/recap/themes/index.ts; tema yang belum dibuat memakai Neon malam.
// Ketujuh slide rangkuman mengikuti gaya edisinya (UI menyusul), jadi tidak ada dua bulan yang terasa sama.

export type EditionTheme =
  | "swiss"
  | "diary"
  | "riso"
  | "dreamy"
  | "editorial"
  | "pixel"
  | "retro70"
  | "boldFlat"
  | "brutalist"
  | "neonMalam"
  | "kolaseCover"
  | "y2k";

export type Edition = {
  number: number; // 1–12 (= bulan)
  monthName: string;
  title: string;
  theme: { id: EditionTheme; label: string; description: string };
};

const EDITIONS: Omit<Edition, "number">[] = [
  { monthName: "Januari", title: "Lembar baru", theme: { id: "swiss", label: "Swiss / grid", description: "Awal tahun yang rapi dan bersih." } },
  { monthName: "Februari", title: "Kirim rasa", theme: { id: "diary", label: "Buku harian", description: "Bulan surat cinta dan tulisan tangan." } },
  { monthName: "Maret", title: "Pancaroba", theme: { id: "riso", label: "Risograph", description: "Cuaca campur aduk, tinta pun saling tumpuk." } },
  { monthName: "April", title: "Mekar pelan", theme: { id: "dreamy", label: "Soft dreamy", description: "Lembut seperti bunga yang baru mekar." } },
  { monthName: "Mei", title: "Langit panjang", theme: { id: "editorial", label: "Editorial", description: "Tenang dan lapang seperti majalah." } },
  { monthName: "Juni", title: "Musim ujian", theme: { id: "pixel", label: "Pixel / game", description: "Ujian = boss level yang harus dilewati." } },
  { monthName: "Juli", title: "Liburan kecil", theme: { id: "retro70", label: "Retro 70-an", description: "Hangat, matahari, dan musim liburan." } },
  { monthName: "Agustus", title: "Merdeka rasa", theme: { id: "boldFlat", label: "Bold flat", description: "Merah putih, berani, dan lantang." } },
  { monthName: "September", title: "Angin kencang", theme: { id: "brutalist", label: "Brutalist", description: "Kencang, berisik, dan nabrak." } },
  { monthName: "Oktober", title: "Hujan pertama", theme: { id: "neonMalam", label: "Neon malam", description: "Hujan malam di bawah lampu kota." } },
  { monthName: "November", title: "Kabut pagi", theme: { id: "kolaseCover", label: "Kolase cover", description: "Bulan merenung, dikelilingi lagu-lagumu." } },
  { monthName: "Desember", title: "Tutup tahun", theme: { id: "y2k", label: "Y2K / chrome", description: "Pesta penutup tahun yang berkilau." } },
];

/** Edisi untuk bulan 1–12 */
export function editionFor(month: number): Edition {
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError(`Bulan tidak valid: ${month}`);
  return { number: month, ...EDITIONS[month - 1] };
}
