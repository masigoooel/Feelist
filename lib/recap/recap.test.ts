import { describe, expect, it } from "vitest";
import type { MoodKey } from "../moods";
import { visibleCount } from "../moodSlider";
import type { HistoryEntry } from "../playlistStore";
import type { Track } from "../types";
import { HOURS_COPY, SLIDER_COPY, TREND_COPY } from "./copy";
import { LISTENER_TYPES } from "./listenerTypes";
import { computeRecap, getSlides } from "./index";

// ---------- Riwayat palsu ----------
const SECRET = "CERITA-RAHASIA-PENGGUNA"; // tidak boleh muncul di hasil rangkuman

const track = (id: string, lift: number, artist = `Artis ${id}`, duration: number | undefined = 210): Track => ({
  id,
  title: `Lagu ${id}`,
  artist,
  cover: `https://cdn.example/${id}.jpg`,
  preview: null,
  link: `https://deezer.example/${id}`,
  reason: "",
  lift,
  duration,
});

let seq = 0;
/** Satu playlist di riwayat (Oktober 2026 kecuali disebut lain). liftMissing → semua lagu tampil (mudah dihitung). */
function entry(p: { day: number; hour: number; minute?: number; mood: MoodKey | null; slider?: number | null; tracks: Track[]; month?: number }): HistoryEntry {
  const createdAt = new Date(2026, (p.month ?? 10) - 1, p.day, p.hour, p.minute ?? 0).getTime();
  seq++;
  return {
    id: `${createdAt}-${seq}`,
    title: `Playlist ${seq}`,
    description: "",
    mood: p.mood,
    story: SECRET,
    createdAt,
    sliderValue: p.slider ?? null,
    tracks: p.tracks,
    request: { mood: SECRET, language: "campur", era: "bebas", energy: "sedang", moodKey: p.mood },
    history: [],
    horoscope: null,
    liftMissing: true,
  };
}

const sad = (prefix: string) => [track("secukupnya", 1, "Hindia"), track(`${prefix}-a`, 1), track(`${prefix}-b`, 2), track(`${prefix}-c`, 2)];
const bright = (prefix: string) => [track(`${prefix}-a`, 3), track(`${prefix}-b`, 3), track(`${prefix}-c`, 4)];

/** 1. Galau malam: sendu, jam 23.00–01.00, slider di sisi "temenin", lagu yang sama terus diputar, akhir bulan membaik */
const galauMalam = [
  entry({ day: 2, hour: 23, minute: 30, mood: "galau", slider: 0.25, tracks: sad("g1") }),
  entry({ day: 4, hour: 0, minute: 15, mood: "galau", tracks: sad("g2") }),
  entry({ day: 6, hour: 23, minute: 50, mood: "patah-hati", slider: 0, tracks: sad("g3") }),
  entry({ day: 13, hour: 0, minute: 40, mood: "galau", slider: 0.25, tracks: sad("g4") }),
  entry({ day: 26, hour: 23, minute: 10, mood: "galau", slider: 0.25, tracks: [track("secukupnya", 1, "Hindia"), ...bright("g5")] }),
  entry({ day: 29, hour: 0, minute: 5, mood: "galau", slider: 0.75, tracks: bright("g6") }),
  // Bulan lalu (September) untuk vsLastMonth
  entry({ day: 10, hour: 22, mood: "galau", tracks: [track("s1", 1), track("s2", 1)], month: 9 }),
];

/** 2. Semangat pagi: ceria, jam 06.00–08.00, slider belum pernah digeser (posisi awal "hibur") */
const semangatPagi = [
  entry({ day: 3, hour: 6, minute: 10, mood: "semangat", tracks: [track("p1", 5), track("p2", 4)] }),
  entry({ day: 9, hour: 7, minute: 20, mood: "semangat", tracks: [track("p3", 5), track("p4", 4)] }),
  entry({ day: 15, hour: 6, minute: 45, mood: "bahagia", tracks: [track("p5", 4), track("p6", 5)] }),
  entry({ day: 21, hour: 7, minute: 5, mood: "semangat", tracks: [track("p7", 5), track("p8", 4)] }),
  entry({ day: 28, hour: 18, mood: "semangat", tracks: [track("p9", 4), track("p10", 5)] }),
];

/** 3. Campur aduk: tiap sesi beda mood & beda jam, slider bolak-balik */
const campurAduk = [
  entry({ day: 1, hour: 1, mood: "galau", slider: 0.25, tracks: [track("c1", 2), track("c2", 3)] }),
  entry({ day: 5, hour: 5, mood: "bahagia", slider: 0.75, tracks: [track("c3", 4), track("c4", 3)] }),
  entry({ day: 9, hour: 9, mood: "hujan", slider: 0.25, tracks: [track("c5", 2), track("c6", 2)] }),
  entry({ day: 13, hour: 13, mood: "perjalanan", slider: 0.75, tracks: [track("c7", 4), track("c8", 3)] }),
  entry({ day: 17, hour: 17, mood: "semangat", slider: 0.75, tracks: [track("c9", 5), track("c10", 4)] }),
  entry({ day: 21, hour: 20, mood: "patah-hati", slider: 0.25, tracks: [track("c11", 1), track("c12", 2)] }),
  entry({ day: 25, hour: 23, mood: "galau", slider: 0.5, tracks: [track("c13", 3), track("c14", 3)] }),
];

// ---------- Tes ----------
describe("buildRecap / computeRecap", () => {
  it("galau-malam → Si Penikmat Sendu, anak malam (jendela melewati tengah malam), slide lengkap", () => {
    const r = computeRecap(galauMalam, 2026, 10)!;
    expect(r.totals.sessions).toBe(6); // playlist September tidak ikut
    expect(r.topMood).toMatchObject({ mood: "galau", count: 5 });
    expect(r.favoriteWindow).toEqual({ start: 23, end: 1, count: 6 });
    expect(r.copy.hours).toBe(HOURS_COPY.malam);
    expect(r.slider).toEqual({ temenin: 83, hibur: 17, used: true });
    expect(r.copy.slider).toBe(SLIDER_COPY.temenin);
    expect(r.listenerType.id).toBe("penikmat-sendu");
    expect(r.listenerType.match.name).toBe("Si Pencari Semangat");
    expect(r.topTrack).toMatchObject({ title: "Lagu secukupnya", count: 5 });
    expect(r.topArtist).toMatchObject({ name: "Hindia", count: 5 });
    expect(r.copy.tags).toContain("no skip :')");
    expect(r.weekTrend).toBe("membaik");
    expect(r.copy.trend).toBe(TREND_COPY.membaik);
    expect(r.vsLastMonth?.liftDelta).toBeGreaterThan(0);
    expect(r.edition).toMatchObject({ number: 10, monthName: "Oktober", title: "Hujan pertama" });
    expect(getSlides(r)).toEqual(["cover", "numbers", "quiz", "mood", "calendar", "hours", "track", "listenerType", "closing"]);
  });

  it("semangat-pagi → Si Pencari Semangat, anak subuh, slide lagu dilewati", () => {
    const r = computeRecap(semangatPagi, 2026, 10)!;
    expect(r.topMood).toMatchObject({ mood: "semangat", count: 4 });
    expect(r.favoriteWindow).toMatchObject({ start: 6, end: 8, count: 4 });
    expect(r.copy.hours).toBe(HOURS_COPY.subuh);
    expect(r.slider).toEqual({ temenin: 0, hibur: 100, used: false }); // posisi awal mood ceria = 0.85
    expect(r.copy.slider).toBe(SLIDER_COPY.hibur);
    expect(r.listenerType.id).toBe("pencari-semangat");
    expect(r.topTrack?.count).toBe(1);
    expect(getSlides(r)).toEqual(["cover", "numbers", "quiz", "mood", "calendar", "hours", "listenerType", "closing"]);
    expect(r.vsLastMonth).toBeNull();
  });

  it("campur aduk → Si Serba Rasa, tanpa jendela jam (slide jam dilewati, kalimat masuk slide angka)", () => {
    const r = computeRecap(campurAduk, 2026, 10)!;
    expect(r.topMood!.share).toBeLessThanOrEqual(0.35);
    expect(r.favoriteWindow).toBeNull();
    expect(r.copy.hours).toBe(HOURS_COPY.kapanAja);
    expect(r.listenerType.id).toBe("serba-rasa");
    expect(r.copy.slider).toBe(SLIDER_COPY.seimbang);
    expect(getSlides(r)).toEqual(["cover", "numbers", "quiz", "mood", "calendar", "listenerType", "closing"]);
  });

  it("kurang dari 3 playlist di bulan itu → null", () => {
    expect(computeRecap(galauMalam.slice(0, 2), 2026, 10)).toBeNull();
    expect(computeRecap(galauMalam, 2026, 9)).toBeNull(); // September hanya 1
  });

  it("cerita pengguna tidak pernah ada di hasil rangkuman", () => {
    for (const h of [galauMalam, semangatPagi, campurAduk]) {
      expect(JSON.stringify(computeRecap(h, 2026, 10))).not.toContain(SECRET);
    }
  });

  it("kalender: 31 hari Oktober, mood harian = terbanyak / terakhir", () => {
    const extra = [...semangatPagi, entry({ day: 3, hour: 20, mood: "galau", tracks: [track("x1", 2)] })];
    const r = computeRecap(extra, 2026, 10)!;
    expect(r.calendar).toHaveLength(31);
    expect(r.calendar[2]).toEqual({ day: 3, mood: "galau", count: 2 }); // seri 1–1 → yang terakhir
    expect(r.calendar[3]).toEqual({ day: 4, mood: null, count: 0 });
  });

  it("angka: jumlah lagu, menit dari durasi Deezer, lagu per curhat", () => {
    const r = computeRecap(semangatPagi, 2026, 10)!;
    expect(r.totals).toEqual({ sessions: 5, tracks: 10, minutes: 35 }); // 10 × 210 detik
    expect(r.copy.tags).toEqual(["± 35 menit musik", "2 lagu per curhat"]);
    expect(r.copy.closing).toBe("5 curhat. 10 lagu. 1 kamu yang tetap bertahan.");
    const noDuration = semangatPagi.map((e) => ({ ...e, tracks: e.tracks.map((t) => ({ ...t, duration: undefined })) }));
    expect(computeRecap(noDuration, 2026, 10)!.totals.minutes).toBeNull();
  });

  it("jumlah lagu mengikuti lagu yang tampil di Geser mood (bukan seluruh pool)", () => {
    const pool = Array.from({ length: 12 }, (_, i) => track(`pool-${i}`, (i % 5) + 1));
    const withSlider = [1, 2, 3].map((d) => ({ ...entry({ day: d, hour: 12, mood: "hujan", slider: 0.5, tracks: pool }), liftMissing: false }));
    expect(computeRecap(withSlider, 2026, 10)!.totals.tracks).toBe(3 * visibleCount(12));
  });

  it("kuis: 3 pilihan berbeda, salah satunya jawaban; hasil tetap untuk bulan yang sama", () => {
    const a = computeRecap(galauMalam, 2026, 10)!;
    const b = computeRecap(galauMalam, 2026, 10)!;
    expect(a.quiz!.answer).toBe("galau");
    expect(new Set(a.quiz!.options).size).toBe(3);
    expect(a.quiz!.options).toContain("galau");
    expect(a.quiz).toEqual(b.quiz);
  });

  it("tren memberat & rarity hanya dari data agregat", () => {
    const reversed = [
      entry({ day: 1, hour: 9, mood: "bahagia", tracks: [track("r1", 5)] }),
      entry({ day: 3, hour: 9, mood: "bahagia", tracks: [track("r2", 5)] }),
      entry({ day: 30, hour: 9, mood: "bahagia", tracks: [track("r3", 2)] }),
    ];
    const r = computeRecap(reversed, 2026, 10)!;
    expect(r.weekTrend).toBe("memberat");
    expect(r.listenerType.rarity).toBeNull(); // tidak ada data agregat → disembunyikan
    expect(computeRecap(reversed, 2026, 10, { rarity: { "pencari-semangat": 14 } })!.listenerType.rarity).toBe(14);
  });

  it("setiap tipe pendengar: deskripsi maks 25 kata, 3 sifat 0–100", () => {
    for (const def of Object.values(LISTENER_TYPES)) expect(def.description.split(/\s+/).length).toBeLessThanOrEqual(25);
    for (const h of [galauMalam, semangatPagi, campurAduk]) {
      const t = computeRecap(h, 2026, 10)!.listenerType;
      expect(t.traits).toHaveLength(3);
      for (const tr of t.traits) {
        expect(tr.value).toBeGreaterThanOrEqual(0);
        expect(tr.value).toBeLessThanOrEqual(100);
      }
    }
  });
});
