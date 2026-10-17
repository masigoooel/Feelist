import type { Metadata } from "next";
import DefaultColors from "@/components/DefaultColors";
import HistoryPage from "@/components/HistoryPage";

export const metadata: Metadata = { title: "Playlist terakhir · feelist" };

/** /riwayat: playlist yang tersimpan di perangkat ini (IndexedDB), tanpa login */
export default function Page() {
  return (
    <>
      <DefaultColors />
      <HistoryPage />
    </>
  );
}
