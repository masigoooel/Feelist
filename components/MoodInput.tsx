"use client";

import { useEffect, useState } from "react";
import { MAX_MOOD_LENGTH } from "@/lib/options";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
};

const PLACEHOLDERS = ["Ceritain aja di sini…", "Lagi di mana, ngapain?", "Hari ini rasanya gimana?"];
const PLACEHOLDER_MS = 3000;

/** Baris input: kolom cerita + tombol "Buat playlist" (bahasa & era diatur lewat kalimat di bawahnya) */
export default function MoodInput({ value, onChange, onSubmit, loading }: Props) {
  // Placeholder berganti tiap 3 detik; berhenti saat kolom difokus/terisi, mati saat prefers-reduced-motion
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const rotating = !focused && value === "";
  useEffect(() => {
    if (!rotating || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length), PLACEHOLDER_MS);
    return () => clearInterval(timer);
  }, [rotating]);
  const placeholder = PLACEHOLDERS[placeholderIndex];
  const focusProps = { onFocus: () => setFocused(true), onBlur: () => setFocused(false) };

  const fieldClass =
    "min-w-0 bg-transparent font-semibold text-white placeholder:text-placeholder disabled:opacity-70";

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-4 border-b-2 border-white/50 pb-4">
      <label htmlFor="mood-desktop" className="sr-only">
        Ceritain mood kamu
      </label>
      {/* Desktop: input satu baris */}
      <input
        id="mood-desktop"
        type="text"
        value={value}
        maxLength={MAX_MOOD_LENGTH}
        placeholder={placeholder}
        disabled={loading}
        onChange={(e) => onChange(e.target.value)}
        {...focusProps}
        className={`hidden h-14 flex-[999_1_320px] text-[28px] sm:block ${fieldClass}`}
      />
      {/* HP: textarea */}
      <label htmlFor="mood-mobile" className="sr-only">
        Ceritain mood kamu
      </label>
      <textarea
        id="mood-mobile"
        value={value}
        maxLength={MAX_MOOD_LENGTH}
        placeholder={placeholder}
        disabled={loading}
        rows={3}
        {...focusProps}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onSubmit();
          }
        }}
        className={`flex-1 resize-none text-[24px] leading-snug sm:hidden ${fieldClass}`}
      />

      {/* Desktop: tombol di dalam baris input (di HP tombolnya menempel di bawah layar) */}
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="hidden h-14 shrink-0 rounded-[28px] bg-accent px-8 text-[17px] font-bold text-ink disabled:opacity-70 sm:block"
      >
        Buat playlist
      </button>
    </div>
  );
}
