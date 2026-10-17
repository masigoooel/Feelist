"use client";

import { useEffect } from "react";

const INSTALLED = "(display-mode: standalone), (display-mode: fullscreen)";

/**
 * Saat dibuka sebagai aplikasi terinstal (layar utama HP), zoom pakai jari dimatikan supaya terasa
 * seperti aplikasi native. Di browser biasa zoom tetap bisa (aksesibilitas: pengguna boleh memperbesar teks).
 * - Android/Chrome: meta viewport user-scalable=no (+ touch-action di globals.css)
 * - iOS: Safari kadang mengabaikan user-scalable, jadi gesture pinch (gesturestart) ikut dicegah
 */
export default function NoZoomWhenInstalled() {
  useEffect(() => {
    const installed =
      matchMedia(INSTALLED).matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!installed) return;

    const meta = document.querySelector('meta[name="viewport"]');
    const original = meta?.getAttribute("content") ?? null;
    meta?.setAttribute(
      "content",
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
    );

    const block = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", block);
    document.addEventListener("gesturechange", block);
    return () => {
      if (meta && original !== null) meta.setAttribute("content", original);
      document.removeEventListener("gesturestart", block);
      document.removeEventListener("gesturechange", block);
    };
  }, []);
  return null;
}
