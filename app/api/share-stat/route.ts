import { connection, NextResponse, type NextRequest } from "next/server";
import { isMoodKey } from "@/lib/moods";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isStoryTemplateId } from "@/lib/storyTemplateIds";

// Analitik sederhana: template kartu Story mana yang akhirnya dibagikan / disimpan.
// Hanya { template, aksi, mood }: TIDAK ada cerita pengguna maupun isi playlist, IP tidak ikut dicatat.
// Disimpan di log server (console; di Vercel terlihat di Runtime Logs) + hitungan di memori proses.

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

const store = globalThis as typeof globalThis & { __feelistShareStats?: Map<string, number> };
const counts = (store.__feelistShareStats ??= new Map<string, number>());

export async function POST(request: NextRequest) {
  const limit = rateLimit(`share-stat:${getClientIp(request.headers)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) return new NextResponse(null, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text()); // dikirim lewat sendBeacon (text/plain)
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (!isStoryTemplateId(body.template) || (body.aksi !== "bagikan" && body.aksi !== "simpan")) {
    return new NextResponse(null, { status: 400 });
  }
  const note = { template: body.template, aksi: body.aksi, mood: isMoodKey(body.mood) ? body.mood : null, at: new Date().toISOString() };
  const total = (counts.get(note.template) ?? 0) + 1;
  counts.set(note.template, total);

  console.info("[share-stat] kartu dipakai", JSON.stringify({ ...note, totalTemplateIni: total }));
  return new NextResponse(null, { status: 204 });
}

/** Rekap hitungan sejak server menyala (per proses), urut dari yang paling sering dipakai */
export async function GET() {
  await connection(); // selalu dihitung saat diminta, jangan dirender statis saat build
  const rekap = Object.fromEntries([...counts].sort((a, b) => b[1] - a[1]));
  return NextResponse.json({ rekap }, { headers: { "Cache-Control": "no-store" } });
}
