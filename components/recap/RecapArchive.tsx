"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Recap } from "@/lib/recap";
import Logo from "../Logo";
import { themeFor } from "./themes";

const THUMB = 0.42; // sampul 390×844 → ±164×354

/** /rangkuman: arsip edisi yang sudah tersedia (bulan dengan ≥ 3 playlist), terbaru di atas */
export default function RecapArchive() {
  const [recaps, setRecaps] = useState<Recap[] | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([import("@/lib/recap"), import("@/lib/playlistStore")])
      .then(async ([{ computeRecap }, { listHistory }]) => {
        const entries = await listHistory();
        const months = [...new Set(entries.map((e) => { const d = new Date(e.createdAt); return d.getFullYear() * 100 + d.getMonth() + 1; }))].sort((a, b) => b - a);
        return months.map((ym) => computeRecap(entries, Math.floor(ym / 100), ym % 100)).filter((r): r is Recap => r !== null);
      })
      .catch(() => [])
      .then((list) => alive && setRecaps(list));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-[1200px] px-8 pb-14 text-white max-sm:px-4">
      <header className="flex h-[88px] items-center justify-between">
        <Link href="/" aria-label="Kembali ke beranda">
          <Logo />
        </Link>
        <Link href="/riwayat" className="text-[15px] font-semibold text-white no-underline">
          Playlist terakhir
        </Link>
      </header>
      <main>
        <h1 tabIndex={-1} className="m-0 mt-6 text-[clamp(44px,6vw,80px)] font-extrabold leading-[0.95] tracking-[-0.045em]">
          Rangkuman bulanan
        </h1>
        {recaps && (
          <p className="m-0 mt-2 text-[16px] font-medium">
            {recaps.length ? `${recaps.length} edisi tersedia · dihitung di perangkat ini` : "Belum ada edisi. Rangkuman muncul setelah ada minimal 3 playlist dalam sebulan."}
          </p>
        )}
        {recaps && recaps.length === 0 && (
          <Link href="/" className="mt-6 inline-flex h-12 items-center rounded-3xl bg-[#FFD84D] px-6 text-[15px] font-extrabold text-ink no-underline">
            Buat playlist
          </Link>
        )}
        {recaps && recaps.length > 0 && (
          <ul className="m-0 mt-8 grid list-none grid-cols-[repeat(auto-fill,minmax(164px,1fr))] gap-x-5 gap-y-8 p-0">
            {recaps.map((r) => {
              const theme = themeFor(r.edition.theme.id);
              const now = new Date(); // hanya dirender setelah riwayat dimuat (bukan saat prerender)
              const current = r.year === now.getFullYear() && r.month === now.getMonth() + 1;
              return (
                <li key={`${r.year}-${r.month}`}>
                  <Link
                    href={`/rangkuman/${r.year}/${r.month}`}
                    aria-label={`Rangkuman ${r.edition.monthName} ${r.year}: ${r.edition.title}${current ? " (bulan ini, masih berjalan)" : ""}`}
                    className="group block text-white no-underline"
                  >
                    <div aria-hidden className="relative overflow-hidden rounded-2xl transition-transform duration-200 group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0" style={{ width: 390 * THUMB, height: 844 * THUMB }}>
                      <div style={{ transform: `scale(${THUMB})`, transformOrigin: "top left", pointerEvents: "none" }}>
                        <theme.Thumbnail recap={r} />
                      </div>
                      {current && <span className="absolute left-2 top-2 rounded-full bg-[#FFD84D] px-2 py-0.5 text-[11px] font-extrabold text-ink">Bulan ini</span>}
                    </div>
                    <p className="m-0 mt-2.5 text-[15px] font-extrabold">
                      {r.edition.monthName} {r.year} · {r.edition.title}
                    </p>
                    <p className="m-0 text-[13px] font-semibold">{r.edition.theme.label}</p>
                    <p className="m-0 mt-0.5 text-[13px] leading-snug">{r.edition.theme.description}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
