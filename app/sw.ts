/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
// Service worker feelist (dibundel Serwist lewat app/serwist/[path]/route.ts).
// Precache: halaman utama, aset build (JS/CSS/font), logo, ikon, manifest.
// Runtime: cover lagu (lewat /api/image) disimpan supaya playlist lama tetap bergambar saat offline.
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, ExpirationPlugin, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // /hasil?riwayat={id} dilayani dari /hasil yang tersimpan (data playlist-nya dari IndexedDB)
  precacheOptions: { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^riwayat$/] },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname === "/api/image",
      handler: new CacheFirst({
        cacheName: "covers",
        plugins: [new ExpirationPlugin({ maxEntries: 1500, maxAgeSeconds: 60 * 24 * 60 * 60, maxAgeFrom: "last-used" })],
      }),
    },
    ...defaultCache,
  ],
  // Offline & halaman belum tersimpan: pakai halaman utama
  fallbacks: {
    entries: [{ url: "/", matcher: ({ request }) => request.destination === "document" }],
  },
});

serwist.addEventListeners();
