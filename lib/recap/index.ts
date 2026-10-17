// Rangkuman bulanan: dihitung di perangkat dari riwayat playlist (IndexedDB, kunci "riwayat").
// PRIVASI: teks cerita pengguna TIDAK pernah dibaca maupun dikirim. Setiap entri riwayat lebih dulu
// dipetakan ke RecapSource (tanpa `story` & `request`), dan hanya itu yang dipakai perhitungan.

import { MOOD_KEYS, type MoodKey } from "../moods";
import { defaultLift, liftOf, shownTracks } from "../moodSlider";
import type { HistoryEntry } from "../playlistStore";
import type { Track } from "../types";
import { buildCopy } from "./copy";
import { editionFor } from "./editions";
import { listenerType, type ListenerStats } from "./listenerTypes";
import type { ListenerTypeId, Recap, RecapSource, WeekTrend } from "./types";

export { getSlides } from "./slides";
export type { Recap, RecapSource, SlideId } from "./types";

const MIN_SESSIONS = 3; // kurang dari ini → tidak ada rangkuman
const TREND_THRESHOLD = 0.4; // selisih rata-rata lift (skala 1–5) minimal untuk dianggap membaik / memberat
const WINDOW_MIN_SHARE = 0.3; // jendela jam favorit minimal 30% sesi

export type RecapOptions = {
  rarity?: Partial<Record<ListenerTypeId, number>>; // dari data agregat (kalau ada); tanpa ini rarity = null
  random?: () => number; // pengacak pilihan kuis (bawaan: tetap per bulan, supaya hasil tidak berubah-ubah)
};

/** Ambil HANYA field yang boleh dipakai rangkuman (cerita & request dibuang) */
export function toRecapSource(e: Pick<HistoryEntry, keyof RecapSource>): RecapSource {
  return { id: e.id, mood: e.mood, createdAt: e.createdAt, sliderValue: e.sliderValue, tracks: e.tracks, rejected: e.rejected, liftMissing: e.liftMissing };
}

/** Pengacak tetap dari seed (mulberry32) */
function seeded(seed: string) {
  let h = 1779033703;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 3432918353);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pct = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const inMonth = (ts: number, year: number, month: number) => {
  const d = new Date(ts);
  return d.getFullYear() === year && d.getMonth() + 1 === month;
};

type Session = { src: RecapSource; date: Date; tracks: Track[]; lift: number };

function sessionsOf(sources: RecapSource[], year: number, month: number): Session[] {
  return sources
    .filter((s) => inMonth(s.createdAt, year, month))
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((src) => {
      const tracks = shownTracks(src);
      return { src, date: new Date(src.createdAt), tracks, lift: mean(tracks.map(liftOf)) };
    });
}

/** Mood terbanyak dari sekumpulan sesi; seri → yang paling akhir */
function majorityMood(sessions: Session[]): MoodKey | null {
  const counts = new Map<MoodKey, { n: number; last: number }>();
  for (const s of sessions) {
    if (!s.src.mood) continue;
    const c = counts.get(s.src.mood) ?? { n: 0, last: 0 };
    counts.set(s.src.mood, { n: c.n + 1, last: Math.max(c.last, s.src.createdAt) });
  }
  let best: MoodKey | null = null;
  let bestC = { n: 0, last: 0 };
  for (const [m, c] of counts) if (c.n > bestC.n || (c.n === bestC.n && c.last > bestC.last)) [best, bestC] = [m, c];
  return best;
}

/** Minggu 1 (tgl 1–7) vs minggu terakhir (7 hari terakhir bulan itu); kalau salah satunya kosong,
 *  pakai kelompok 7 hari pertama & terakhir yang ada sesinya. Satu kelompok saja → stabil. */
function weekTrend(sessions: Session[], daysInMonth: number): WeekTrend {
  const first = sessions.filter((s) => s.date.getDate() <= 7);
  const last = sessions.filter((s) => s.date.getDate() > daysInMonth - 7);
  let a = first;
  let b = last;
  if (!a.length || !b.length) {
    const buckets = new Map<number, Session[]>();
    for (const s of sessions) {
      const w = Math.floor((s.date.getDate() - 1) / 7);
      buckets.set(w, [...(buckets.get(w) ?? []), s]);
    }
    const weeks = [...buckets.keys()].sort((x, y) => x - y);
    if (weeks.length < 2) return "stabil";
    a = buckets.get(weeks[0])!;
    b = buckets.get(weeks[weeks.length - 1])!;
  }
  const delta = mean(b.map((s) => s.lift)) - mean(a.map((s) => s.lift));
  return delta >= TREND_THRESHOLD ? "membaik" : delta <= -TREND_THRESHOLD ? "memberat" : "stabil";
}

/** Jendela 2 jam (boleh melewati tengah malam) dengan sesi terbanyak; < 30% sesi → null */
function favoriteWindow(hours: number[], sessions: number) {
  let best = { start: 0, count: -1 };
  for (let start = 0; start < 24; start++) {
    const count = hours[start] + hours[(start + 1) % 24];
    if (count > best.count) best = { start, count };
  }
  if (best.count < WINDOW_MIN_SHARE * sessions || best.count <= 0) return null;
  return { start: best.start, end: (best.start + 2) % 24, count: best.count };
}

/** Lagu / artis yang paling sering muncul (seri → yang muncul paling akhir) */
function mostFrequent<T>(items: { key: string; value: T; at: number }[]) {
  const m = new Map<string, { value: T; count: number; last: number }>();
  for (const it of items) {
    const c = m.get(it.key);
    m.set(it.key, { value: it.value, count: (c?.count ?? 0) + 1, last: Math.max(c?.last ?? 0, it.at) });
  }
  let best: { value: T; count: number; last: number } | null = null;
  for (const c of m.values()) if (!best || c.count > best.count || (c.count === best.count && c.last > best.last)) best = c;
  return best;
}

/** Hitung rangkuman bulan `month` (1–12) dari riwayat; null kalau sesi bulan itu < 3 */
export function computeRecap(entries: Pick<HistoryEntry, keyof RecapSource>[], year: number, month: number, opts: RecapOptions = {}): Recap | null {
  const sources = entries.map(toRecapSource);
  const sessions = sessionsOf(sources, year, month);
  if (sessions.length < MIN_SESSIONS) return null;
  const n = sessions.length;
  const daysInMonth = new Date(year, month, 0).getDate();
  const allTracks = sessions.flatMap((s) => s.tracks);

  // Angka: menit dari durasi Deezer; lagu tanpa durasi diperkirakan dari rata-rata lagu yang punya durasi
  const withDuration = allTracks.filter((t) => t.duration);
  const minutes = withDuration.length
    ? Math.round((mean(withDuration.map((t) => t.duration!)) * allTracks.length) / 60)
    : null;

  // Mood
  const moodCount = new Map<MoodKey, { count: number; last: number }>();
  for (const s of sessions) {
    if (!s.src.mood) continue;
    const c = moodCount.get(s.src.mood) ?? { count: 0, last: 0 };
    moodCount.set(s.src.mood, { count: c.count + 1, last: Math.max(c.last, s.src.createdAt) });
  }
  const moodsSorted = [...moodCount].sort((a, b) => b[1].count - a[1].count || b[1].last - a[1].last);
  const moods = moodsSorted.map(([mood, c]) => ({ mood, count: c.count }));
  const topMood = moods[0] ? { ...moods[0], share: moods[0].count / n } : null;

  // Kalender
  const calendar = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const ofDay = sessions.filter((s) => s.date.getDate() === day);
    return { day, mood: majorityMood(ofDay), count: ofDay.length };
  });

  // Jam
  const hours = Array.from({ length: 24 }, () => 0);
  for (const s of sessions) hours[s.date.getHours()]++;
  const fav = favoriteWindow(hours, n);

  // Lagu & artis
  const track = mostFrequent(sessions.flatMap((s) => s.tracks.map((t) => ({ key: t.id, value: t, at: s.src.createdAt }))));
  const artist = mostFrequent(sessions.flatMap((s) => s.tracks.map((t) => ({ key: t.artist.trim().toLowerCase(), value: t.artist.trim(), at: s.src.createdAt }))));
  const topTrack = track ? { title: track.value.title, artist: track.value.artist, cover: track.value.cover, count: track.count } : null;
  const topArtist = artist ? { name: artist.value, count: artist.count } : null;

  // Slider: posisi efektif (yang dilihat pengguna); belum pernah digeser = posisi awal mood itu
  const effective = sessions.map((s) => s.src.sliderValue ?? defaultLift(s.src.mood));
  const temenin = pct(effective.filter((p) => p < 0.5).length, n);
  const slider = { temenin, hibur: 100 - temenin, used: sessions.some((s) => s.src.sliderValue !== null) };

  // Tipe pendengar
  const stats: ListenerStats = {
    topMood: topMood?.mood ?? null,
    topShare: pct(topMood?.count ?? 0, n),
    temenin: slider.temenin,
    hibur: slider.hibur,
    windowStart: fav?.start ?? null,
    sadTracks: pct(allTracks.filter((t) => liftOf(t) <= 2).length, allTracks.length),
    happyTracks: pct(allTracks.filter((t) => liftOf(t) >= 4).length, allTracks.length),
    night: pct(sessions.filter((s) => s.date.getHours() >= 21 || s.date.getHours() < 3).length, n),
    morning: pct(sessions.filter((s) => s.date.getHours() >= 4 && s.date.getHours() < 10).length, n),
    travel: pct(moodCount.get("perjalanan")?.count ?? 0, n),
    variety: pct(moodCount.size, MOOD_KEYS.length),
  };

  // Kuis "Mood apa yang paling sering?": jawaban + 2 pengecoh acak
  const random = opts.random ?? seeded(`${year}-${month}`);
  let quiz: Recap["quiz"] = null;
  if (topMood) {
    const pool = MOOD_KEYS.filter((m) => m !== topMood.mood);
    const distractors: MoodKey[] = [];
    while (distractors.length < 2) distractors.push(pool.splice(Math.floor(random() * pool.length), 1)[0]);
    const options = [topMood.mood, ...distractors];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    quiz = { answer: topMood.mood, options };
  }

  // Dibanding bulan lalu (rata-rata lift sesi)
  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const prevSessions = sessionsOf(sources, prev.y, prev.m);
  const vsLastMonth = prevSessions.length
    ? { liftDelta: Math.round((mean(sessions.map((s) => s.lift)) - mean(prevSessions.map((s) => s.lift))) * 10) / 10 }
    : null;

  const trend = weekTrend(sessions, daysInMonth);
  return {
    year,
    month,
    edition: editionFor(month),
    totals: { sessions: n, tracks: allTracks.length, minutes },
    moods,
    topMood,
    calendar,
    weekTrend: trend,
    hours,
    favoriteWindow: fav,
    topTrack,
    topArtist,
    slider,
    listenerType: listenerType(stats, opts.rarity),
    quiz,
    copy: buildCopy({ monthName: editionFor(month).monthName, topMood: topMood?.mood ?? null, windowStart: fav?.start ?? null, trend, minutes, sessions: n, tracks: allTracks.length, topTrackCount: topTrack?.count ?? 0, temenin: slider.temenin, hibur: slider.hibur }),
    vsLastMonth,
  };
}

/** Rangkuman bulan `month` (1–12) dari riwayat di IndexedDB perangkat ini */
export async function buildRecap(year: number, month: number, opts?: RecapOptions): Promise<Recap | null> {
  const { listHistory } = await import("../playlistStore");
  return computeRecap(await listHistory(), year, month, opts);
}
