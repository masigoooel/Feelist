"use client";

import { useEffect } from "react";

/**
 * Daftarkan service worker Serwist (app/sw.ts → /serwist/sw.js) hanya di production.
 * Didaftarkan setelah halaman selesai dimuat & browser senggang, supaya tidak memperlambat beranda.
 */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const register = () => {
      import("@serwist/window")
        .then(({ Serwist }) => new Serwist("/serwist/sw.js", { scope: "/", type: "module" }).register())
        .catch(() => {
          // gagal daftar bukan masalah besar, aplikasi tetap jalan (hanya tanpa mode offline)
        });
    };
    const whenIdle = () =>
      "requestIdleCallback" in window ? requestIdleCallback(register, { timeout: 5000 }) : setTimeout(register, 3000);
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
    return () => window.removeEventListener("load", whenIdle);
  }, []);
  return null;
}
