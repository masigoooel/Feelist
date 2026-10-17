"use client";

import { MOODS, MOOD_KEYS, type MoodKey } from "@/lib/moods";

type Props = {
  active: MoodKey | null;
  meaning: string; // arti warna yang sedang tampil
  onPick: (key: MoodKey) => void;
  disabled?: boolean;
};

export default function QuickMoodButtons({ active, meaning, onPick, disabled }: Props) {
  return (
    <>
      <div className="mt-6 flex flex-wrap gap-[10px]">
        {MOOD_KEYS.map((key) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              aria-pressed={isActive}
              onClick={() => onPick(key)}
              className={`h-11 rounded-[22px] px-5 text-[15px] font-semibold disabled:opacity-70 ${
                // Belum dipilih: garis tepi (teks putih langsung di atas warna mood, kontras ≥ 4.5:1 di semua mood)
                isActive ? "border-2 border-white bg-white text-mood" : "border-2 border-white/50 bg-transparent text-white"
              }`}
            >
              {MOODS[key].label}
            </button>
          );
        })}
      </div>

      {/* Arti warna yang sedang dipakai halaman */}
      <p aria-live="polite" className="mt-4 text-[15px] font-medium text-white">
        {meaning}
      </p>
    </>
  );
}
