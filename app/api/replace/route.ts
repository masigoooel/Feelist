import { NextResponse, type NextRequest } from "next/server";
import { findExtraSongs } from "@/lib/extraSongs";
import { PlaylistAIError } from "@/lib/prompt";
import { aiRateLimit, getClientIp, rateLimit } from "@/lib/rate-limit";
import { validateExisting, validatePlaylistRequest } from "@/lib/validate";

// Pengganti lagu yang "nggak cocok" saat pool sudah habis (tidak ada cadangan yang belum tampil).
// Diminta lagu dengan tingkat lift yang sama dengan lagu yang ditolak.
export const maxDuration = 30;

const RATE_LIMIT = 12;
const RATE_WINDOW_MS = 60_000;
const REPLACE_COUNT = 5;
const AI_BUDGET_MS = 22_000;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const routeLimit = rateLimit(`replace:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  const limit = routeLimit.ok ? aiRateLimit(ip) : routeLimit;
  if (!limit.ok) return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format request nggak valid." }, { status: 400 });
  }
  const base = validatePlaylistRequest(body);
  if ("error" in base) return NextResponse.json({ error: base.error }, { status: 400 });
  const existing = validateExisting((body as { existing?: unknown }).existing);
  if ("error" in existing) return NextResponse.json({ error: existing.error }, { status: 400 });
  const lift = (body as { lift?: unknown }).lift;
  const focusLift = Number.isInteger(lift) && (lift as number) >= 1 && (lift as number) <= 5 ? [lift as number] : [3];

  try {
    const tracks = await findExtraSongs({
      input: base.data,
      existing: existing.data,
      focusLift,
      count: REPLACE_COUNT,
      budgetMs: AI_BUDGET_MS,
    });
    return NextResponse.json({ tracks });
  } catch (err) {
    if (!(err instanceof PlaylistAIError)) console.error("[replace] error tak terduga:", err);
    return NextResponse.json({ error: "Gagal mencari pengganti." }, { status: 502 });
  }
}
