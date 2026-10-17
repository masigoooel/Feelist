/**
 * Cover Deezer lewat proxy same-origin (/api/image). Dipakai di semua tempat supaya:
 * - kartu Story bisa digambar ke canvas tanpa "tainted" (CORS),
 * - service worker bisa menyimpan cover untuk mode offline.
 */
export const coverSrc = (src: string) => (src ? `/api/image?url=${encodeURIComponent(src)}` : src);
