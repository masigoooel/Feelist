// Riwayat playlist di IndexedDB (idb-keyval), kunci "riwayat": satu daftar, terbaru di atas, maksimal 50.
// Halaman "Playlist terakhir" (/riwayat) & halaman hasil dari riwayat (/hasil?riwayat={id}) membaca dari sini,
// jadi bisa dibuka tanpa internet & tanpa memanggil AI lagi. Cover lagunya disimpan service worker.
// PRIVASI: `story` (cerita pengguna) hanya disimpan & ditampilkan di perangkat ini.

import { createStore, delMany, get, keys, update } from "idb-keyval";
import { normalizeLift } from "./moodSlider";
import type { MoodKey } from "./moods";
import type { Horoscope, PlaylistRequest, SavedPlaylist, StoryCopy, Track } from "./types";

const MAX_PLAYLISTS = 50;
const KEY = "riwayat";
const LEGACY_LOCAL = "feelist:last"; // versi paling lama: satu playlist di localStorage
const LEGACY_INDEX = "index"; // versi sebelumnya: "index" + "playlist:{id}"

/** Satu playlist di riwayat */
export type HistoryEntry = {
  id: string;
  title: string;
  description: string;
  mood: MoodKey | null;
  story: string;
  createdAt: number;
  sliderValue: number | null; // posisi Geser mood (0–1); null = posisi awal
  tracks: Track[]; // pool lagu (id, title, artist, cover, preview, link, lift, + alasan/durasi/catatan)
  // Tambahan supaya halaman hasil dari riwayat sama persis: "Buat ulang", kartu Story, lagu yang ditolak
  request: PlaylistRequest;
  history: string[];
  rejected?: string[];
  liftMissing?: boolean;
  horoscope: Horoscope | null;
  storyCopy?: StoryCopy;
  skipped?: number;
};

let db: ReturnType<typeof createStore> | null = null;
const store = () => (db ??= createStore("feelist", "playlists"));

function toEntry(saved: SavedPlaylist, createdAt: number): HistoryEntry {
  const p = saved.playlist;
  return {
    id: saved.id,
    title: p.playlistTitle,
    description: p.description,
    mood: p.mood,
    story: p.story,
    createdAt,
    sliderValue: saved.lift ?? null,
    tracks: p.tracks,
    request: saved.request,
    history: saved.history,
    rejected: saved.rejected,
    liftMissing: saved.liftMissing,
    horoscope: p.horoscope,
    storyCopy: p.storyCopy,
    skipped: p.skipped,
  };
}

/** Kembali ke bentuk yang dipakai halaman hasil; playlist lama tanpa skor lift ditandai liftMissing */
export function entryToSaved(e: HistoryEntry): SavedPlaylist {
  const { tracks, liftMissing } = normalizeLift(e.tracks);
  return {
    id: e.id,
    playlist: {
      playlistTitle: e.title,
      description: e.description,
      mood: e.mood,
      story: e.story,
      horoscope: e.horoscope,
      storyCopy: e.storyCopy,
      tracks,
      skipped: e.skipped ?? 0,
    },
    request: e.request,
    history: e.history,
    lift: e.sliderValue ?? undefined,
    liftMissing: e.liftMissing || liftMissing,
    rejected: e.rejected,
  };
}

const newestFirst = (a: HistoryEntry, b: HistoryEntry) => b.createdAt - a.createdAt;

/** Pindahkan data versi lama (sekali saja) ke kunci "riwayat" */
let migrated: Promise<void> | null = null;
function migrate() {
  return (migrated ??= (async () => {
    const found: SavedPlaylist[] = [];
    try {
      const raw = localStorage.getItem(LEGACY_LOCAL);
      if (raw) {
        const data = JSON.parse(raw) as SavedPlaylist;
        if (typeof data?.playlist?.playlistTitle === "string" && Array.isArray(data.playlist.tracks)) found.push(data);
        localStorage.removeItem(LEGACY_LOCAL);
      }
    } catch {
      // data rusak / penyimpanan diblokir: abaikan
    }
    const oldKeys = (await keys(store())).filter((k) => k === LEGACY_INDEX || String(k).startsWith("playlist:"));
    for (const k of oldKeys) {
      if (k === LEGACY_INDEX) continue;
      const saved = await get<SavedPlaylist>(k, store());
      if (saved?.playlist) found.push(saved);
    }
    if (found.length) {
      await update<HistoryEntry[]>(
        KEY,
        (list = []) => {
          const ids = new Set(list.map((e) => e.id));
          const added = found.filter((s) => !ids.has(s.id)).map((s) => toEntry(s, Number(s.id) || Date.now()));
          return [...list, ...added].sort(newestFirst).slice(0, MAX_PLAYLISTS);
        },
        store(),
      );
    }
    if (oldKeys.length) await delMany(oldKeys, store());
  })().catch(() => {}));
}

/** Simpan / perbarui playlist (mis. posisi slider berubah). Waktu dibuat tidak berubah. */
export async function savePlaylist(saved: SavedPlaylist) {
  await migrate();
  await update<HistoryEntry[]>(
    KEY,
    (list = []) => {
      const old = list.find((e) => e.id === saved.id);
      const entry = toEntry(saved, old?.createdAt ?? (Number(saved.id) || Date.now()));
      return [entry, ...list.filter((e) => e.id !== saved.id)].sort(newestFirst).slice(0, MAX_PLAYLISTS);
    },
    store(),
  );
}

export async function listHistory(): Promise<HistoryEntry[]> {
  await migrate();
  return ((await get<HistoryEntry[]>(KEY, store())) ?? []).sort(newestFirst);
}

export async function loadPlaylist(id: string): Promise<SavedPlaylist | null> {
  await migrate();
  const entry = ((await get<HistoryEntry[]>(KEY, store())) ?? []).find((e) => e.id === id);
  return entry ? entryToSaved(entry) : null;
}

export async function deletePlaylist(id: string) {
  await update<HistoryEntry[]>(KEY, (list = []) => list.filter((e) => e.id !== id), store());
}
