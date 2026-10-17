import type { Metadata } from "next";
import DefaultColors from "@/components/DefaultColors";
import RecapArchive from "@/components/recap/RecapArchive";

export const metadata: Metadata = { title: "Rangkuman bulanan · feelist" };

/** Arsip edisi Rangkuman bulanan yang sudah tersedia di perangkat ini */
export default function Page() {
  return (
    <>
      <DefaultColors />
      <RecapArchive />
    </>
  );
}
