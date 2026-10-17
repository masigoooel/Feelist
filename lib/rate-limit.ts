// Rate limit sederhana per IP (sliding window, disimpan di memori).
// Catatan: di serverless (Vercel) tiap instance punya memori sendiri,
// jadi ini "best effort". Untuk produksi besar pakai Redis/Upstash.

// Disimpan di globalThis: tiap route handler bisa memuat salinan modul sendiri, padahal batasnya
// (terutama batas AI bersama) harus berlaku lintas route dalam satu proses server.
const store = globalThis as typeof globalThis & { __feelistRateLimit?: Map<string, number[]> };
const hits = (store.__feelistRateLimit ??= new Map<string, number[]>());

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);
    const retryAfter = Math.ceil((windowMs - (now - recent[0])) / 1000);
    return { ok: false as const, retryAfter };
  }

  recent.push(now);
  hits.set(key, recent);

  // Bersihkan entri lama supaya Map tidak membengkak
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }

  return { ok: true as const, retryAfter: 0 };
}

/**
 * Batas bersama semua route yang memanggil AI (playlist, lagu tambahan, pengganti):
 * maksimal 12 panggilan AI per menit per IP, supaya satu orang tidak menghabiskan kuota gratis.
 */
export function aiRateLimit(ip: string) {
  return rateLimit(`ai:${ip}`, 12, 60_000);
}

export function getClientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
