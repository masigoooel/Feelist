"use client";

import { useEffect, useState } from "react";
import { keepHyphens } from "@/lib/keepHyphens";
import Logo from "./Logo";

const LINES = ["Lagi dengerin ceritamu…", "Nyari lagu yang paling pas…", "Nyusun urutannya biar enak…"];

type Props = {
  moodLabel: string; // nama mood dari chip, atau "Belum punya nama"
  story: string;
};

/** Layar memuat saat menunggu /api/playlist. Dipasang ulang tiap permintaan, jadi teks mulai dari awal. */
export default function LoadingScreen({ moodLabel, story }: Props) {
  const [line, setLine] = useState(0);

  // Ganti teks tiap 2,2 detik
  useEffect(() => {
    const id = setInterval(() => setLine((n) => (n + 1) % LINES.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-8">
      <header className="flex h-24 shrink-0 items-center">
        <Logo />
      </header>

      <main className="flex flex-1 items-center pb-24">
        <div className="flex w-full flex-wrap items-center justify-between gap-16">
          {/* Kolom kiri: teks */}
          <div className="flex flex-[1_1_420px] flex-col gap-7">
            <p className="text-[18px] font-semibold text-white/90">Rasa kamu: {moodLabel}</p>
            <h1
              tabIndex={-1}
              className="max-w-[12ch] text-[clamp(44px,5.5vw,80px)] font-extrabold leading-[0.98] tracking-[-0.04em]"
            >
              {/* Status memuat diumumkan pembaca layar; wadahnya tetap supaya pergantian teks terbaca */}
              <span role="status" className="block">
                {/* key berganti = elemen baru = animasi fade-in diputar ulang */}
                <span key={line} className="loading-fade block">
                  {LINES[line]}
                </span>
              </span>
            </h1>
            <p className="max-w-[38ch] text-[18px] font-medium">Dari cerita: “{keepHyphens(story)}”</p>
            <div className="flex gap-2" aria-hidden>
              {LINES.map((_, i) => (
                <span
                  key={i}
                  className={`loading-bar h-1.5 rounded-[3px] ${i === line ? "w-12 bg-accent" : "w-5 bg-white/40"}`}
                />
              ))}
            </div>
          </div>

          {/* Kolom kanan: tiga pil yang bergerak seperti equalizer */}
          <div className="flex h-[420px] flex-[0_1_420px] items-center justify-center gap-10" aria-hidden>
            {/* animation-delay inline supaya tidak tertimpa shorthand `animation` di globals.css */}
            <span className="loading-pill h-[200px] w-[72px] rounded-[36px] bg-white" />
            <span className="loading-pill h-[400px] w-[72px] rounded-[36px] bg-accent" style={{ animationDelay: "-0.35s" }} />
            <span className="loading-pill h-[280px] w-[72px] rounded-[36px] bg-white" style={{ animationDelay: "-0.7s" }} />
          </div>
        </div>
      </main>
    </div>
  );
}
