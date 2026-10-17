import type { SongSuggestion, Track } from "./types";

const DEEZER_SEARCH = "https://api.deezer.com/search";

type DeezerTrack = {
  id: number;
  title: string;
  preview: string;
  link: string;
  duration?: number; // detik (lagu penuh)
  artist: { name: string };
  album: { cover_medium: string };
};

type DeezerSearchResponse = {
  data?: DeezerTrack[];
  error?: { code: number; message: string };
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Kuota Deezer ±50 request / 5 detik per IP server, dipakai bersama semua pengguna.
// Semua pencarian lewat antrean: maksimal 35 request per 5 detik dan 8 berjalan bersamaan,
// supaya beberapa playlist sekaligus tidak membuat Deezer menolak (kode 4) lalu retry beruntun.
const DEEZER_WINDOW_MS = 5000;
const DEEZER_MAX_PER_WINDOW = 35; // jarak aman di bawah kuota Deezer (±50)
const DEEZER_MAX_CONCURRENT = 8;
// Antrean disimpan di globalThis supaya berlaku bersama untuk semua route (playlist, lagu tambahan, pengganti)
const queueStore = globalThis as typeof globalThis & { __feelistDeezer?: { starts: number[]; active: number } };
const deezer = (queueStore.__feelistDeezer ??= { starts: [], active: 0 });

async function acquireDeezerSlot() {
  for (;;) {
    const now = Date.now();
    while (deezer.starts.length && now - deezer.starts[0] >= DEEZER_WINDOW_MS) deezer.starts.shift();
    if (deezer.active < DEEZER_MAX_CONCURRENT && deezer.starts.length < DEEZER_MAX_PER_WINDOW) {
      deezer.active++;
      deezer.starts.push(now);
      return;
    }
    const full = deezer.starts.length >= DEEZER_MAX_PER_WINDOW;
    await sleep(full ? Math.max(20, DEEZER_WINDOW_MS - (now - deezer.starts[0])) : 30);
  }
}

/** Satu kali pencarian ke Deezer, dengan retry kecil kalau kena kuota. */
async function search(query: string): Promise<DeezerTrack[]> {
  const url = `${DEEZER_SEARCH}?q=${encodeURIComponent(query)}&limit=5`;

  for (let attempt = 0; attempt < 3; attempt++) {
    await acquireDeezerSlot();
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) {
        if (res.status >= 500) {
          await sleep(400 * (attempt + 1));
          continue;
        }
        return [];
      }
      const json = (await res.json()) as DeezerSearchResponse;
      // Kode 4 = kuota Deezer habis (maks ±50 request / 5 detik), tunggu lalu ulang
      if (json.error) {
        if (json.error.code === 4) {
          await sleep(1000 * (attempt + 1));
          continue;
        }
        return [];
      }
      return Array.isArray(json.data) ? json.data : [];
    } catch {
      // Timeout / jaringan putus: coba sekali lagi
      await sleep(300);
    } finally {
      deezer.active--;
    }
  }
  return [];
}

/** Normalisasi teks supaya perbandingan judul/artis lebih longgar. */
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // hapus aksen
    .replace(/\(.*?\)|\[.*?\]/g, " ") // hapus (feat. ...), [Remastered], dll
    .replace(/\s-\s.*$/, " ") // hapus " - Remastered 2011", dll
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function looselyMatches(a: string, b: string) {
  const na = normalize(a);
  const nb = normalize(b);
  return !!na && !!nb && (na.includes(nb) || nb.includes(na));
}

// Artis pertama saja (sebelum "feat", "&", ",", "x")
function mainArtist(artist: string) {
  return artist.split(/\s+(?:feat\.?|ft\.?|featuring|x|&|and)\s+|,/i)[0] ?? artist;
}

function toTrack(t: DeezerTrack): Track {
  return {
    id: String(t.id),
    title: t.title,
    artist: t.artist.name,
    cover: t.album.cover_medium,
    preview: t.preview || null,
    link: t.link,
    duration: t.duration && t.duration > 0 ? t.duration : undefined,
    reason: "",
    lift: 3,
  };
}

/** Cari satu lagu. Coba query ketat dulu, kalau kosong pakai query biasa. */
export async function findTrack(song: SongSuggestion): Promise<Track | null> {
  const clean = (s: string) => s.replace(/"/g, "");
  const artist = mainArtist(song.artist);

  // 1) Query ketat: artist:"..." track:"..."
  const strict = await search(`artist:"${clean(song.artist)}" track:"${clean(song.title)}"`);
  if (strict.length > 0) {
    const best = strict.find((t) => looselyMatches(t.artist.name, artist)) ?? strict[0];
    return toTrack(best);
  }

  // 2) Query biasa: "<judul> <artis>". Hasilnya harus mirip supaya tidak salah lagu.
  const loose = await search(`${song.title} ${song.artist}`);
  const best =
    loose.find((t) => looselyMatches(t.artist.name, artist) && looselyMatches(t.title, song.title)) ??
    loose.find((t) => looselyMatches(t.artist.name, artist)) ??
    loose.find((t) => looselyMatches(t.title, song.title));

  return best ? toTrack(best) : null;
}

/**
 * Cari semua lagu secara paralel. Lagu yang tidak ketemu atau dobel dibuang.
 * `sourceIndex` = urutan lagu di daftar dari AI (dipakai untuk mencocokkan ramalan).
 */
export async function findTracks(songs: SongSuggestion[]): Promise<(Track & { sourceIndex: number })[]> {
  const results = await Promise.all(
    songs.map((s, sourceIndex) =>
      findTrack(s)
        .then((t) => (t ? { ...t, reason: s.reason ?? "", lift: s.lift ?? 3, sourceIndex } : null))
        .catch(() => null),
    ),
  );

  const seen = new Set<string>();
  return results.filter((t): t is Track & { sourceIndex: number } => {
    if (!t || seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

/**
 * URL preview baru untuk satu lagu. Link preview Deezer kedaluwarsa (±1 jam), jadi playlist lama
 * (riwayat / offline) perlu minta ulang saat mau diputar. Ikut antrean kuota Deezer yang sama.
 */
export async function freshPreview(id: string): Promise<string | null> {
  await acquireDeezerSlot();
  try {
    const res = await fetch(`https://api.deezer.com/track/${encodeURIComponent(id)}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const json = (await res.json()) as { preview?: string; error?: unknown };
    return typeof json.preview === "string" && json.preview.startsWith("https://") ? json.preview : null;
  } catch {
    return null;
  } finally {
    deezer.active--;
  }
}
