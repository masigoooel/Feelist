import { NextResponse, type NextRequest } from "next/server";
import { isMoodKey } from "@/lib/moods";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

// Catatan anonim "Lagu ini nggak cocok" untuk evaluasi rekomendasi.
// Hanya { mood, lagu, posisiSlider }: TIDAK ada cerita pengguna, IP tidak ikut dicatat.
// Untuk sementara disimpan di log server (console); di Vercel terlihat di Runtime Logs.

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

export async function POST(request: NextRequest) {
  const limit = rateLimit(`feedback:${getClientIp(request.headers)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) return new NextResponse(null, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const song = (body.lagu ?? {}) as Record<string, unknown>;
  const p = Number(body.posisiSlider);
  const note = {
    mood: isMoodKey(body.mood) ? body.mood : null,
    lagu: { id: text(song.id, 40), title: text(song.title, 150), artist: text(song.artist, 150) },
    posisiSlider: Number.isFinite(p) ? Math.min(1, Math.max(0, Math.round(p * 100) / 100)) : null,
    at: new Date().toISOString(),
  };
  if (!note.lagu.title) return new NextResponse(null, { status: 400 });

  console.info("[feedback] lagu nggak cocok", JSON.stringify(note));
  return new NextResponse(null, { status: 204 });
}
