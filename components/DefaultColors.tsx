"use client";

import { useEffect } from "react";
import { DEFAULT_THEME } from "@/lib/moods";
import { useMoodColors } from "./MoodColors";

/** Halaman tanpa warna mood (Playlist terakhir, Rangkuman): latar kembali ke ungu bawaan #6C4CF5 */
export default function DefaultColors() {
  const { setColors } = useMoodColors();
  useEffect(() => {
    setColors({ bg: DEFAULT_THEME.bg, accent: DEFAULT_THEME.accent, soft: DEFAULT_THEME.soft });
  }, [setColors]);
  return null;
}
