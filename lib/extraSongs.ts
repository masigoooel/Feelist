// Minta lagu tambahan ke AI lalu verifikasi ke Deezer. Dipakai /api/playlist/more (pool kecil)
// dan /api/replace (pengganti lagu yang "nggak cocok" saat pool habis).

import { generatePlaylist } from "./ai";
import { findTracks } from "./deezer";
import type { PlaylistRequest, Track } from "./types";
import type { ExistingSong } from "./validate";

/** Tingkat lift yang paling sedikit jumlahnya di pool */
export function fewestLifts(existing: ExistingSong[]) {
  const counts = [1, 2, 3, 4, 5].map((lift) => existing.filter((s) => s.lift === lift).length);
  const fewest = Math.min(...counts);
  return [1, 2, 3, 4, 5].filter((_, i) => counts[i] === fewest);
}

export async function findExtraSongs({
  input,
  existing,
  focusLift,
  count,
  budgetMs,
}: {
  input: PlaylistRequest;
  existing: ExistingSong[];
  focusLift: number[];
  count: number;
  budgetMs: number;
}): Promise<Track[]> {
  // Lagu yang sudah ada dikirim ke AI supaya tidak muncul lagi
  const names = existing.map((s) => `${s.title} — ${s.artist}`);
  const more = await generatePlaylist(
    { ...input, exclude: [...new Set([...(input.exclude ?? []), ...names])], count, focusLift },
    budgetMs,
  );
  const known = new Set(existing.map((s) => `${s.title}|${s.artist}`.toLowerCase()));
  const found = await findTracks(more.songs.filter((s) => !known.has(`${s.title}|${s.artist}`.toLowerCase())));
  return found.map(({ id, title, artist, cover, preview, link, duration, reason, lift }) => ({
    id,
    title,
    artist,
    cover,
    preview,
    link,
    duration,
    reason,
    lift,
  }));
}
