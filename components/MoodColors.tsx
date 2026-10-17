"use client";

import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from "react";
import { DEFAULT_THEME } from "@/lib/moods";

/** Warna mood yang sedang dipakai seluruh aplikasi (satu sumber, diterapkan ke <html>/<body>) */
export type MoodColors = {
  bg: string;
  accent: string;
  soft: string;
  pageBg?: string; // latar halaman kalau beda dari bg mood (mis. layar pilih kartu Story)
};

/** "page" = pindah halaman (0.7s), "slider" = geser mood (0.35s) */
export type ColorSpeed = "page" | "slider";
const DURATION: Record<ColorSpeed, string> = { page: "0.7s", slider: "0.35s" };

type ContextValue = {
  getColors: () => MoodColors;
  setColors: (colors: MoodColors, speed?: ColorSpeed) => void;
};

const MoodColorContext = createContext<ContextValue | null>(null);

const same = (a: MoodColors, b: MoodColors) =>
  a.bg === b.bg && a.accent === b.accent && a.soft === b.soft && a.pageBg === b.pageBg;

/** Tulis ke CSS variable di <html> (hanya yang berubah); <body> memakai --page-bg dengan transisi --mood-speed */
function apply(colors: MoodColors, speed: ColorSpeed) {
  const root = document.documentElement.style;
  const write = (name: string, value: string) => {
    if (root.getPropertyValue(name) !== value) root.setProperty(name, value);
  };
  write("--mood-speed", DURATION[speed]); // durasi dulu, supaya transisi warna memakai durasi baru
  write("--mood-bg", colors.bg);
  write("--mood-accent", colors.accent);
  write("--mood-soft", colors.soft);
  write("--page-bg", colors.pageBg ?? colors.bg);
  const meta = document.querySelector('meta[name="theme-color"]');
  const themeColor = colors.pageBg ?? colors.bg;
  if (meta && meta.getAttribute("content") !== themeColor) meta.setAttribute("content", themeColor);
}

/**
 * State warna global. Disimpan di ref (bukan state React) dan langsung diterapkan ke DOM:
 * warna berubah di setiap langkah slider, dan memakai state React di sini memicu render bersarang
 * yang bisa menumpuk ("Maximum update depth exceeded") saat slider digeser cepat di HP lambat.
 */
export function MoodColorProvider({ children }: { children: ReactNode }) {
  const current = useRef<{ colors: MoodColors; speed: ColorSpeed }>({
    colors: { bg: DEFAULT_THEME.bg, accent: DEFAULT_THEME.accent, soft: DEFAULT_THEME.soft },
    speed: "page",
  });

  const setColors = useCallback((colors: MoodColors, speed: ColorSpeed = "page") => {
    if (same(current.current.colors, colors)) return;
    current.current = { colors, speed };
    apply(colors, speed);
  }, []);
  const getColors = useCallback(() => current.current.colors, []);
  const value = useMemo(() => ({ getColors, setColors }), [getColors, setColors]);

  return <MoodColorContext.Provider value={value}>{children}</MoodColorContext.Provider>;
}

export function useMoodColors() {
  const value = useContext(MoodColorContext);
  if (!value) throw new Error("useMoodColors harus dipakai di dalam <MoodColorProvider>");
  return value;
}
