import type { Metadata } from "next";
import { Suspense } from "react";
import RecapView from "@/components/recap/RecapView";

export const metadata: Metadata = { title: "Rangkuman bulanan · feelist" };

/** Rangkuman bulanan ala Story; dihitung di perangkat dari riwayat (tanpa server, tanpa cerita pengguna) */
export default function Page() {
  return (
    // tahun/bulan dibaca dari URL di browser (useParams) → dibungkus Suspense supaya halaman tetap bisa di-prerender
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <RecapView />
    </Suspense>
  );
}
