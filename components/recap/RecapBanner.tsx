"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { safeOverlayAlpha } from "@/lib/moodColors";
import { editionFor } from "@/lib/recap/editions";
import { isRecapSeen, markRecapSeen, previousMonth } from "@/lib/recap/seen";
import { CloseIcon } from "../icons";

const BANNER_DAYS = 7; // tanggal 1–7

/**
 * Beranda, tanggal 1–7: "Rangkuman {bulan} kamu sudah siap" kalau rangkuman bulan lalu ada (≥ 3 playlist)
 * dan belum dibuka / bannernya belum ditutup.
 */
export default function RecapBanner({ bg }: { bg: string }) {
  const [target, setTarget] = useState<{ year: number; month: number } | null>(null);

  useEffect(() => {
    const now = new Date();
    if (now.getDate() > BANNER_DAYS) return;
    const prev = previousMonth(now.getFullYear(), now.getMonth() + 1);
    if (isRecapSeen(prev.year, prev.month)) return;
    let alive = true;
    // Kode rangkuman baru dimuat di sini, tidak memperberat beranda
    import("@/lib/recap")
      .then(({ buildRecap }) => buildRecap(prev.year, prev.month))
      .then((recap) => alive && recap && setTarget(prev))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!target) return null;
  const { monthName } = editionFor(target.month);
  const alpha = safeOverlayAlpha(bg, 0.16);

  return (
    <aside
      aria-label="Rangkuman bulanan"
      className="mb-6 flex items-center gap-3 rounded-[22px] py-2.5 pl-5 pr-2 text-white"
      style={{ background: alpha >= 0.06 ? `rgb(255 255 255 / ${alpha})` : "rgb(30 18 64 / 0.22)" }}
    >
      <p className="m-0 flex-1 text-[15px] font-bold">Rangkuman {monthName} kamu sudah siap</p>
      <Link
        href={`/rangkuman/${target.year}/${target.month}`}
        className="flex h-10 shrink-0 items-center rounded-[20px] bg-accent px-5 text-[15px] font-extrabold text-ink no-underline"
      >
        Buka
      </Link>
      <button
        type="button"
        onClick={() => {
          markRecapSeen(target.year, target.month);
          setTarget(null);
        }}
        aria-label={`Tutup pemberitahuan rangkuman ${monthName}`}
        className="grid size-11 shrink-0 place-items-center rounded-full border-0 bg-transparent text-white"
      >
        <CloseIcon width={18} height={18} />
      </button>
    </aside>
  );
}
