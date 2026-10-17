import type { ComponentType } from "react";
import type { Recap, SlideId } from "@/lib/recap";
import type { EditionTheme } from "@/lib/recap/editions";

/** Props setiap slide: data rangkuman + tema, plus aksi (kuis → lanjut, penutup → putar ulang) */
export type SlideProps = {
  recap: Recap;
  theme: RecapTheme;
  onNext: () => void;
  onRestart: () => void;
};

/**
 * Satu tema edisi. Semua tema memakai bentuk yang sama; logika pemutar, berbagi, dan arsip tidak perlu diubah
 * saat menambah tema. Tema baru cukup didaftarkan di themes/index.ts (bagian yang belum dibuat = Neon malam).
 */
export type RecapTheme = {
  id: EditionTheme;
  palette: { bg: string; text: string; accent: string; accent2: string; highlight: string };
  fonts: { sans: string; serif: string; mono: string };
  pageBg: string; // latar di luar "layar HP" (desktop)
  canvasBg: string;
  progress: { track: string; fill: string };
  Backdrop: ComponentType; // latar kanvas 390×844
  Enter: ComponentType; // efek saat slide masuk (mis. kilatan)
  slides: Record<SlideId, ComponentType<SlideProps>>;
  ShareImage: ComponentType<{ recap: Recap }>; // versi statis slide penutup 1080×1920 untuk dibagikan / disimpan
  Thumbnail: ComponentType<{ recap: Recap }>; // sampul edisi statis 390×844 (arsip /rangkuman)
};

/** Tema yang sedang dibuat boleh baru sebagian; sisanya diambil dari tema cadangan */
export type PartialRecapTheme = Partial<Omit<RecapTheme, "slides">> & { slides?: Partial<RecapTheme["slides"]> };
