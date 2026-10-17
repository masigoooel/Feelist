import { NextResponse, type NextRequest } from "next/server";
import { generatePlaylist } from "@/lib/ai";
import { PlaylistAIError } from "@/lib/prompt";
import { findTracks } from "@/lib/deezer";
import { aiRateLimit, getClientIp, rateLimit } from "@/lib/rate-limit";
import type { PlaylistResponse } from "@/lib/types";
import { validatePlaylistRequest } from "@/lib/validate";

// AI + Deezer bisa makan waktu beberapa detik
export const maxDuration = 60;

const RATE_LIMIT = 8; // maksimal request...
const RATE_WINDOW_MS = 60_000; // ...per menit per IP

function errorResponse(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error: message }, { status, headers });
}

export async function POST(request: NextRequest) {
  // 1) Rate limit per IP
  const ip = getClientIp(request.headers);
  const routeLimit = rateLimit(`playlist:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  const limit = routeLimit.ok ? aiRateLimit(ip) : routeLimit;
  if (!limit.ok) {
    return errorResponse(
      `Pelan-pelan dulu, ya. Coba lagi dalam ${limit.retryAfter} detik.`,
      429,
      { "Retry-After": String(limit.retryAfter) },
    );
  }

  // 2) Validasi input
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Format request nggak valid.", 400);
  }
  const result = validatePlaylistRequest(body);
  if ("error" in result) return errorResponse(result.error, 400);

  try {
    // 3) Minta rekomendasi ke AI (Gemini / Claude)
    const playlist = await generatePlaylist(result.data);

    // 4) Cocokkan semua lagu ke Deezer secara paralel (sekali saja; hasilnya = pool).
    //    Pool kecil ditambah browser di latar belakang lewat /api/playlist/more, jadi tidak ditunggu di sini.
    const found = await findTracks(playlist.songs);
    if (found.length === 0) {
      return errorResponse(
        "Lagunya nggak ada yang ketemu di Deezer. Coba ubah mood atau filternya, ya.",
        404,
      );
    }

    // Semua lagu yang ketemu = pool untuk slider Geser mood (slider tidak memanggil AI/Deezer lagi).
    // Buang field internal sourceIndex dari respons.
    const tracks = found.map(({ id, title, artist, cover, preview, link, duration, reason, lift, sourceIndex }) => ({
      id,
      title,
      artist,
      cover,
      preview,
      link,
      duration,
      reason,
      lift,
      // Catatan per lagu dari AI ditempel ke lagunya (urutan AI ≠ urutan yang lolos Deezer / tampil di slider)
      setlistNote: playlist.setlistNotes[sourceIndex] || undefined,
      threadCaption: playlist.threadCaptions[sourceIndex] || undefined,
    }));
    // Lagu keberuntungan dari AI → indeks di daftar lagu yang ketemu (default lagu pertama)
    const lucky = playlist.horoscope
      ? Math.max(0, found.findIndex((t) => t.sourceIndex === playlist.horoscope!.luckySongIndex))
      : 0;

    const response: PlaylistResponse = {
      playlistTitle: playlist.playlistTitle,
      description: playlist.description,
      mood: result.data.moodKey ?? playlist.mood,
      story: result.data.mood,
      horoscope: playlist.horoscope
        ? { mood: playlist.horoscope.mood, luckySongIndex: lucky, advice: playlist.horoscope.advice }
        : null,
      storyCopy: playlist.storyCopy,
      tracks,
      skipped: playlist.songs.length - found.length,
    };
    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof PlaylistAIError) return errorResponse(err.message, err.status);
    console.error("[playlist] error tak terduga:", err);
    return errorResponse("Ada yang error di server. Coba lagi sebentar lagi, ya.", 500);
  }
}
