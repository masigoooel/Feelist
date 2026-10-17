"use client";

import { useEffect } from "react";
import type { ErrorCode } from "@/lib/errors";
import { themeFor, type MoodKey } from "@/lib/moods";
import { useMoodColors } from "./MoodColors";

const MESSAGES: Record<ErrorCode, { title: string; body: string }> = {
  ramai: { title: "Lagi ramai banget", body: "Coba lagi sebentar ya, kami lagi nyiapin lagunya." },
  kosong: { title: "Lagunya belum ketemu", body: "Coba ceritain mood-mu lebih detail." },
  offline: { title: "Kamu lagi offline", body: "Sambungin internet dulu, atau buka playlist lamamu." },
  lainnya: { title: "Ada yang nggak beres", body: "Coba sekali lagi ya." },
};

type Props = {
  mood: MoodKey | null; // mood permintaan; null = pertahankan warna terakhir
  code: ErrorCode;
  onRetry: () => void;
};

/** Layar error penuh: logo tiga batang besar (tanpa animasi), judul, penjelasan, dan tombol "Coba lagi" */
export default function ErrorState({ mood, code, onRetry }: Props) {
  const { setColors } = useMoodColors();
  useEffect(() => {
    if (!mood) return;
    const { bg, accent, soft } = themeFor(mood);
    setColors({ bg, accent, soft });
  }, [mood, setColors]);

  const { title, body } = MESSAGES[code];
  return (
    // Latar = <body> (warna mood dari MoodColorProvider), teks putih
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center px-6 text-center text-white">
      <svg viewBox="0 0 200 200" width={120} height={120} aria-hidden>
        <path d="M66 80 L66 120" stroke="#FFFFFF" strokeWidth="22" strokeLinecap="round" fill="none" />
        <path d="M100 50 L100 150" stroke="var(--mood-accent)" strokeWidth="22" strokeLinecap="round" fill="none" />
        <path d="M134 68 L134 132" stroke="#FFFFFF" strokeWidth="22" strokeLinecap="round" fill="none" />
      </svg>
      <h1 tabIndex={-1} className="mt-6 text-[32px] font-extrabold leading-[1.1]">
        {title}
      </h1>
      <p className="mt-3 text-[16px] font-medium leading-[1.5]">{body}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-8 h-14 rounded-[28px] border-0 bg-accent px-8 text-[16px] font-bold text-ink"
      >
        Coba lagi
      </button>
    </main>
  );
}
