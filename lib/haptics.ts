// Getaran halus, hanya di HP (layar sentuh) yang mendukung navigator.vibrate.
// iOS Safari & desktop tidak punya / tidak memakai vibrate, jadi dicek dulu supaya tidak error.

export function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  if (!matchMedia("(pointer: coarse)").matches) return; // bukan HP
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // sebagian browser melempar error kalau belum ada interaksi pengguna: abaikan
  }
}

/** Getaran saat slider melewati titik tengah (50) */
export const HAPTIC_MIDDLE = 10;
/** Getaran saat playlist selesai dibuat */
export const HAPTIC_DONE = [15, 40, 15];
