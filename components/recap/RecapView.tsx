"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { buildRecap, type Recap } from "@/lib/recap";
import { SLIDE_COPY } from "@/lib/recap/copy";
import { editionFor } from "@/lib/recap/editions";
import { markRecapSeen } from "@/lib/recap/seen";
import { useMoodColors } from "../MoodColors";
import RecapPlayer from "./RecapPlayer";
import { themeFor } from "./themes";

/** /rangkuman/[tahun]/[bulan]: hitung rangkuman dari riwayat di perangkat, lalu putar */
export default function RecapView() {
  const params = useParams<{ tahun: string; bulan: string }>();
  const year = Number(params.tahun);
  const month = Number(params.bulan);
  const valid = Number.isInteger(year) && year > 2000 && Number.isInteger(month) && month >= 1 && month <= 12;
  const [state, setState] = useState<{ status: "loading" } | { status: "ready"; recap: Recap | null }>({ status: "loading" });
  const theme = themeFor(valid ? editionFor(month).theme.id : "neonMalam");

  // Latar halaman gelap (di luar "layar HP")
  const { setColors } = useMoodColors();
  useEffect(() => {
    setColors({ bg: theme.pageBg, accent: theme.progress.fill, soft: "#FFFFFF" });
  }, [setColors, theme]);

  useEffect(() => {
    if (!valid) return;
    let alive = true;
    buildRecap(year, month)
      .catch(() => null)
      .then((recap) => {
        if (!alive) return;
        if (recap) markRecapSeen(year, month); // banner beranda tidak menawarkan bulan ini lagi
        setState({ status: "ready", recap });
      });
    return () => {
      alive = false;
    };
  }, [valid, year, month]);

  if (valid && state.status === "loading") return <div className="min-h-screen" style={{ background: theme.pageBg }} />;
  if (valid && state.status === "ready" && state.recap) return <RecapPlayer recap={state.recap} theme={theme} />;

  // Belum cukup data / alamat tidak valid
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center text-white" style={{ background: theme.canvasBg }}>
      <h1 tabIndex={-1} className="m-0 max-w-[20ch] text-[32px] font-extrabold leading-tight">
        {SLIDE_COPY.notEnough(valid ? editionFor(month).monthName : "bulan ini", valid ? year : new Date().getFullYear())}
      </h1>
      <p className="m-0 max-w-[36ch] text-[16px]">{SLIDE_COPY.notEnoughHint}</p>
      <Link href="/riwayat" className="flex h-12 items-center rounded-3xl bg-[#FFD84D] px-6 text-[15px] font-extrabold text-ink no-underline">
        Kembali ke Playlist terakhir
      </Link>
    </main>
  );
}
