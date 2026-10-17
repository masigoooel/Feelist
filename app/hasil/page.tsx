import type { Metadata } from "next";
import FeelistApp from "@/components/FeelistApp";

export const metadata: Metadata = { title: "Playlist kamu · feelist" };

/** /hasil?riwayat={id}: halaman hasil dari riwayat di perangkat (tanpa memanggil AI lagi) */
export default function Page() {
  return <FeelistApp restore />;
}
