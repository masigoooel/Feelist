// Validasi body request yang dipakai bersama oleh /api/playlist dan /api/playlist/more.

import { isMoodKey } from "./moods";
import { ENERGIES, ERAS, LANGUAGES, MAX_MOOD_LENGTH, MIN_MOOD_LENGTH, isOption } from "./options";
import type { PlaylistRequest } from "./types";

const MAX_EXCLUDE = 60;

const cleanName = (s: string) => s.replace(/\s+/g, " ").trim().slice(0, 120);

/** Validasi body request playlist. Mengembalikan pesan error atau data yang sudah bersih. */
export function validatePlaylistRequest(body: unknown): { error: string } | { data: PlaylistRequest } {
  if (!body || typeof body !== "object") return { error: "Format request nggak valid." };
  const b = body as Record<string, unknown>;

  if (typeof b.mood !== "string") return { error: "Mood wajib diisi." };
  // Rapikan spasi berlebih & karakter kontrol
  const mood = b.mood.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
  if (mood.length < MIN_MOOD_LENGTH) return { error: "Ceritain mood-mu dulu, minimal beberapa huruf." };
  if (mood.length > MAX_MOOD_LENGTH) {
    return { error: `Mood-nya kepanjangan, maksimal ${MAX_MOOD_LENGTH} karakter.` };
  }

  const language = b.language ?? "campur";
  const era = b.era ?? "bebas";
  const energy = b.energy ?? "sedang";
  if (!isOption(LANGUAGES, language)) return { error: "Pilihan bahasa nggak valid." };
  if (!isOption(ERAS, era)) return { error: "Pilihan era nggak valid." };
  if (!isOption(ENERGIES, energy)) return { error: "Pilihan energi nggak valid." };

  const moodKey = b.moodKey ?? null;
  if (moodKey !== null && !isMoodKey(moodKey)) return { error: "Pilihan mood nggak valid." };

  let exclude: string[] | undefined;
  if (b.exclude !== undefined) {
    if (!Array.isArray(b.exclude)) return { error: "Format daftar lagu lama nggak valid." };
    exclude = b.exclude
      .filter((s): s is string => typeof s === "string")
      .map(cleanName)
      .filter(Boolean)
      .slice(-MAX_EXCLUDE);
  }

  return { data: { mood, language, era, energy, moodKey, exclude } };
}

export type ExistingSong = { title: string; artist: string; lift: number };

/** Validasi daftar lagu yang sudah ada di pool (untuk permintaan lagu tambahan) */
export function validateExisting(value: unknown): { error: string } | { data: ExistingSong[] } {
  if (!Array.isArray(value)) return { error: "Format daftar lagu nggak valid." };
  const data = value
    .slice(0, MAX_EXCLUDE)
    .filter((s): s is ExistingSong => !!s && typeof s.title === "string" && typeof s.artist === "string")
    .map((s) => ({
      title: cleanName(s.title),
      artist: cleanName(s.artist),
      lift: Number.isInteger(s.lift) && s.lift >= 1 && s.lift <= 5 ? s.lift : 3,
    }))
    .filter((s) => s.title && s.artist);
  return { data };
}
