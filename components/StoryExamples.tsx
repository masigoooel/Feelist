"use client";

import { useSyncExternalStore } from "react";

const EXAMPLES = [
  "habis presentasi, capek tapi lega",
  "lagi nunggu hujan reda di halte",
  "baru putus, tapi pengen cepet move on",
  "nyetir malam sendirian",
  "besok ujian, butuh fokus",
  "lagi kangen temen SMA",
];

// 3 contoh acak, dipilih sekali per kunjungan di browser (server tidak merender apa pun → tidak ada hydration mismatch)
let picked: string[] | null = null;
const pickExamples = () =>
  (picked ??= EXAMPLES.map((text) => ({ text, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .slice(0, 3)
    .map((x) => x.text));
const subscribe = () => () => {};

type Props = {
  visible: boolean; // disembunyikan setelah pengguna mulai mengetik
  onPick: (text: string) => void;
};

/** Contoh cerita yang bisa diketuk, di bawah kolom cerita.
 *  Teks putih penuh (bukan 85%): 85% tidak lolos kontras 4.5:1 di latar ungu bawaan & Bahagia. */
export default function StoryExamples({ visible, onPick }: Props) {
  const examples = useSyncExternalStore(subscribe, pickExamples, () => null);

  return (
    // Tinggi disiapkan sejak awal (HP: 3 baris, desktop: 1 baris) supaya tidak ada pergeseran tata letak.
    // Setelah mulai mengetik, contoh hanya disembunyikan (ruangnya tetap): kalau dihapus, tinggi halaman
    // menyusut & isi beranda yang ditengahkan ikut melompat (di HP terasa seperti layar ter-zoom/loncat).
    <div
      aria-hidden={!visible || undefined}
      inert={!visible}
      className={`mt-3 flex min-h-[132px] flex-col items-start sm:min-h-11 sm:flex-row sm:flex-wrap sm:gap-x-6 ${visible ? "" : "invisible"}`}
    >
      {examples?.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => onPick(text)}
          className="min-h-11 border-0 bg-transparent p-0 text-left text-[14px] font-semibold text-white"
        >
          <span className="font-medium">Coba:</span> {text}
        </button>
      ))}
    </div>
  );
}
