import { NextResponse, type NextRequest } from "next/server";
import { fewestLifts, findExtraSongs } from "@/lib/extraSongs";
import { PlaylistAIError } from "@/lib/prompt";
import { aiRateLimit, getClientIp, rateLimit } from "@/lib/rate-limit";
import { validateExisting, validatePlaylistRequest } from "@/lib/validate";

// Lagu tambahan untuk pool Geser mood. Dipanggil browser di latar belakang setelah halaman hasil tampil,
// jadi pengguna tidak perlu menunggu. Browser membatasi tunggu 30 detik.
export const maxDuration = 30;

const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 60_000;
const EXTRA_COUNT = 12;
const AI_BUDGET_MS = 22_000; // sisakan waktu untuk pencarian Deezer

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const routeLimit = rateLimit(`playlist-more:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
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

  // Fokus pada tingkat lift yang paling sedikit di pool
  const focusLift = fewestLifts(existing.data);
  console.info(`[playlist/more] pool cuma ${existing.data.length} lagu, minta lagu tambahan (fokus lift ${focusLift.join(", ")})`);

  try {
    const tracks = await findExtraSongs({
      input: base.data,
      existing: existing.data,
      focusLift,
      count: EXTRA_COUNT,
      budgetMs: AI_BUDGET_MS,
    });
    return NextResponse.json({ tracks });
  } catch (err) {
    if (!(err instanceof PlaylistAIError)) console.error("[playlist/more] error tak terduga:", err);
    return NextResponse.json({ error: "Gagal menambah lagu." }, { status: 502 });
  }
}
