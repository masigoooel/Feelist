"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import ErrorState from "@/components/ErrorState";
import FitTitle from "@/components/FitTitle";
import { useMoodColors } from "@/components/MoodColors";
import LoadingScreen from "@/components/LoadingScreen";
import Logo from "@/components/Logo";
import MoodInput from "@/components/MoodInput";
import StoryExamples from "@/components/StoryExamples";
import QuickMoodButtons from "@/components/QuickMoodButtons";
import RecapBanner from "@/components/recap/RecapBanner";
import SongFilters, { useSongFilters } from "@/components/SongFilters";
import ListenFull from "@/components/ListenFull";
import { ExternalIcon, RefreshIcon } from "@/components/icons";
import { mix } from "@/lib/color";
import { safeOverlayAlpha } from "@/lib/moodColors";
import { ACCENT_INK, MOODS, themeFor, type MoodKey } from "@/lib/moods";
import { defaultLift, normalizeLift, pickTracks, sliderCaption, sliderColors, sliderRule, visibleCount } from "@/lib/moodSlider";
import { errorCodeFor, type ErrorCode } from "@/lib/errors";
import { HAPTIC_DONE, HAPTIC_MIDDLE, vibrate } from "@/lib/haptics";
import { keepHyphens } from "@/lib/keepHyphens";
import { MIN_MOOD_LENGTH } from "@/lib/options";
import { loadPlaylist, savePlaylist } from "@/lib/playlistStore";
import type { PlaylistRequest, PlaylistResponse, SavedPlaylist, Track } from "@/lib/types";
import { useOnline } from "@/lib/useOnline";

type View = "home" | "loading" | "result" | "story" | "error" | "restoring";

// Beranda tetap ringan: bagian yang baru dipakai setelah ada hasil dimuat terpisah (dynamic import).
// Kartu Story (9 template + html-to-image) hanya dimuat di browser.
// Layar error tetap di bundel utama karena harus jalan saat offline.
const loadTrackList = () => import("@/components/TrackList");
const loadMiniPlayer = () => import("@/components/MiniPlayer");
const loadShareCard = () => import("@/components/ShareCard");

/** Potongan gagal diunduh (mis. offline sebelum service worker siap): tampilkan pesan, jangan crash */
function ChunkFailed() {
  return <p className="px-4 py-6 text-[15px] font-medium">Bagian ini butuh internet untuk dimuat pertama kali.</p>;
}
const orFallback =
  <T,>(load: () => Promise<{ default: T }>) =>
  () =>
    load().catch(() => ({ default: ChunkFailed as T }));

const TrackList = dynamic(orFallback(loadTrackList));
const MiniPlayer = dynamic(orFallback(loadMiniPlayer), { ssr: false });
const ShareCard = dynamic(orFallback(loadShareCard), { ssr: false });
const PlayerBar = dynamic(orFallback(() => loadMiniPlayer().then((m) => ({ default: m.PlayerBar }))), { ssr: false });

const MIN_LOADING_MS = 1500; // layar memuat tampil minimal segini supaya animasinya tidak berkedip
const MIN_POOL = 12; // pool lebih kecil dari ini → minta lagu tambahan di latar belakang
const MORE_TIMEOUT_MS = 30_000;
const trackName = (t: Track) => `${t.title} — ${t.artist}`;

/** Respons API yang gagal, membawa status HTTP untuk memilih pesan di layar error */
class RequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Playlist untuk kartu Story: urutan lagu sesuai slider; lagu keberuntungan dipetakan ke urutan itu */
function storyPlaylist(playlist: PlaylistResponse, tracks: Track[]): PlaylistResponse {
  const h = playlist.horoscope;
  const luckyId = h ? playlist.tracks[h.luckySongIndex]?.id : undefined;
  return {
    ...playlist,
    tracks,
    // Lagu keberuntungan tidak ada di daftar yang tampil → lagu pertama
    horoscope: h ? { ...h, luckySongIndex: Math.max(0, tracks.findIndex((t) => t.id === luckyId)) } : null,
  };
}


/**
 * Seluruh aplikasi satu halaman (beranda → memuat → hasil → pilih kartu), navigasi lewat hash.
 * Dipakai di "/" dan di "/hasil?riwayat={id}" (`restore`): playlist dibaca dari riwayat di perangkat,
 * tanpa memanggil AI lagi, termasuk posisi slider.
 */
export default function FeelistApp({ restore = false }: { restore?: boolean }) {
  const [view, setView] = useState<View>(restore ? "restoring" : "home");
  const [story, setStory] = useState("");
  const [chosenMood, setChosenMood] = useState<MoodKey | null>(null);
  // Bahasa & era (diingat di perangkat). Energi tidak lagi dipilih di beranda: mood & Geser mood sudah mewakilinya
  const [filters, setFilters] = useSongFilters();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SavedPlaylist | null>(null);
  // Info untuk layar memuat: cerita & mood dari permintaan yang sedang berjalan
  const [pending, setPending] = useState<{ story: string; moodKey: MoodKey | null } | null>(null);

  // Lagu tambahan untuk pool sedang diminta di latar belakang
  const [addingMore, setAddingMore] = useState(false);
  const moreFor = useRef<string | null>(null);

  const [current, setCurrent] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Layar error: kasus pesan & mood permintaan yang gagal; permintaan terakhir untuk "Coba lagi"
  const [failure, setFailure] = useState<{ code: ErrorCode; mood: MoodKey | null } | null>(null);
  const lastAttempt = useRef<{ request: PlaylistRequest; history: string[]; lift?: number } | null>(null);

  const showLoading = view === "loading" && pending !== null;
  const showError = view === "error" && failure !== null;
  const online = useOnline();
  const showResult = view === "result" && result !== null;
  const showStory = view === "story" && result !== null;
  // Geser mood: posisi slider & lagu yang tampil (dipilih dari pool, tanpa memanggil AI/Deezer lagi)
  // Slider 5 tingkat (step 25): posisi awal / tersimpan di antara tingkat dibulatkan ke tingkat terdekat
  const lift = result ? Math.round((result.lift ?? defaultLift(result.playlist.mood)) * 4) / 4 : 0;
  const pool = result?.playlist.tracks;
  const rejected = result?.rejected;
  const sliderOn = !!result && !result.liftMissing; // playlist lama tanpa lift: semua lagu tampil, tanpa slider
  const rule = sliderRule(result?.playlist.mood ?? null);
  // Dihitung ulang dari (pool, p) setiap kali salah satunya berubah, tidak disimpan di state
  const visibleTracks = useMemo(() => {
    if (!pool) return [];
    if (sliderOn) return pickTracks(pool, lift, rejected);
    return rejected?.length ? pool.filter((t) => !rejected.includes(t.id)) : pool;
  }, [pool, lift, sliderOn, rejected]);

  // Beranda: mood yang dipilih. Memuat: mood dari chip saat submit. Hasil: mood playlist (chip atau tebakan AI)
  // dengan warna yang ikut posisi slider. Layar pilih kartu & kartu Story: selalu warna asli mood
  // (urutan lagunya tetap mengikuti slider).
  const theme = {
    ...themeFor(showLoading ? pending.moodKey : showResult || showStory ? result.playlist.mood : chosenMood),
    ...(showResult && sliderOn ? sliderColors(result.playlist.mood, lift) : {}),
  };

  // Warna mood global (MoodColorProvider → <body>). Saat memuat, warna terakhir dipertahankan sampai
  // respons AI datang, jadi tidak ada kilatan ungu bawaan; lalu ditransisikan ke warna mood hasil.
  const { setColors } = useMoodColors();
  const lastView = useRef(view);
  useEffect(() => {
    const previous = lastView.current;
    lastView.current = view;
    if (view === "loading" || view === "error") return; // layar error mengatur warnanya sendiri
    // Geser slider di halaman hasil = transisi cepat; pindah halaman = 0.7s
    const speed = previous === "result" && view === "result" ? "slider" : "page";
    const pageBg = view === "story" ? mix(theme.bg, ACCENT_INK, 0.45) : undefined; // layar pilih kartu: bg mood + 45% #1E1240 supaya pratinjau menonjol
    setColors({ bg: theme.bg, accent: theme.accent, soft: theme.soft, pageBg }, speed);
  }, [view, theme.bg, theme.accent, theme.soft, setColors]);

  // Ganti layar → fokus pindah ke judul halaman (tidak saat aplikasi pertama dibuka)
  // (dibandingkan dengan layar sebelumnya, jadi aman walau effect dijalankan dua kali oleh StrictMode)
  const focusedView = useRef(view);
  useEffect(() => {
    if (focusedView.current === view) return;
    focusedView.current = view;
    // Layar yang dimuat terpisah (dynamic import) belum punya judul di frame pertama: coba tiap frame ±1 detik
    let frame = 0;
    let tries = 0;
    const focusTitle = () => {
      const title = document.querySelector<HTMLElement>("h1");
      if (title) title.focus({ preventScroll: true });
      else if (tries++ < 60) frame = requestAnimationFrame(focusTitle);
    };
    frame = requestAnimationFrame(focusTitle);
    return () => cancelAnimationFrame(frame);
  }, [view]);

  // Urutan lagu berubah (slider / lagu diganti) → diumumkan pembaca layar lewat aria-live, ditunda
  // sebentar supaya tidak berisik selagi slider digeser
  const orderKey = visibleTracks.map((t) => t.id).join(",");
  const firstTrack = visibleTracks[0];
  const announceFirst = firstTrack ? `${firstTrack.title} oleh ${firstTrack.artist}` : "";
  const resultId = result?.id ?? "";
  const [listNote, setListNote] = useState("");
  const lastOrder = useRef({ id: "", key: "" });
  useEffect(() => {
    const previous = lastOrder.current;
    lastOrder.current = { id: resultId, key: orderKey };
    if (!resultId || previous.id !== resultId || previous.key === orderKey) return;
    const count = orderKey.split(",").length;
    const timer = setTimeout(() => setListNote(`Urutan lagu berubah. ${count} lagu, mulai dari ${announceFirst}.`), 700);
    return () => clearTimeout(timer);
  }, [resultId, orderKey, announceFirst]);

  // Simpan playlist (termasuk posisi slider) ke IndexedDB setiap kali berubah; ditunda sebentar
  // supaya menggeser slider tidak menulis berkali-kali
  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => savePlaylist(result).catch(() => {}), 400);
    return () => clearTimeout(timer);
  }, [result]);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setCurrent(null);
    setIsPlaying(false);
  }, []);

  // Tombol back/forward browser berpindah antara beranda dan hasil
  useEffect(() => {
    const onPop = () => {
      const hash = location.hash;
      const next: View =
        hash === "#kartu"
          ? "story"
          : hash === "#hasil"
            ? "result"
            : hash === "#gagal"
              ? "error"
              : "home";
      if (next === "home") stopAudio(); // kembali ke beranda = hentikan preview
      setView(next);
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [stopAudio]);

  function openResult() {
    // Dari layar error ("Coba lagi" berhasil): ganti entri #gagal supaya Back tidak kembali ke error
    if (location.hash === "#gagal") history.replaceState(null, "", "#hasil");
    else if (location.hash !== "#hasil") history.pushState(null, "", "#hasil");
    setView("result");
    window.scrollTo(0, 0);
  }

  function goHome(e: React.MouseEvent) {
    e.preventDefault();
    stopAudio();
    history.pushState(null, "", "/");
    setView("home");
    setError(null);
    window.scrollTo(0, 0);
  }

  // /hasil?riwayat={id}: buka playlist dari riwayat (IndexedDB) tanpa memanggil AI; #kartu = langsung pilih kartu
  useEffect(() => {
    if (!restore) return;
    const id = new URLSearchParams(location.search).get("riwayat");
    const wantStory = location.hash === "#kartu";
    (id ? loadPlaylist(id) : Promise.resolve(null))
      .catch(() => null)
      .then((saved) => {
        if (!saved) {
          history.replaceState(null, "", "/");
          setError("Playlist itu sudah nggak ada di perangkat ini.");
          setView("home");
          return;
        }
        setResult(saved);
        history.replaceState(null, "", `${location.pathname}${location.search}#hasil`);
        setView("result");
        if (wantStory) {
          history.pushState(null, "", "#kartu");
          setView("story");
        }
      });
  }, [restore]);

  /**
   * Minta lagu tambahan di latar belakang lalu gabungkan ke pool tanpa duplikat:
   * - /api/playlist/more saat pool kecil setelah halaman hasil tampil,
   * - /api/replace saat lagu ditolak tapi tidak ada cadangan lagi.
   * Slider tetap bisa dipakai dengan pool yang ada; maksimal 30 detik, gagal = diam saja.
   */
  async function addMoreSongs(saved: SavedPlaylist, endpoint = "/api/playlist/more", extraBody: object = {}) {
    // Satu permintaan saja dalam satu waktu (mis. tombol "nggak cocok" diklik beruntun)
    if (moreFor.current === saved.id) return;
    moreFor.current = saved.id;
    setAddingMore(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...saved.request,
          exclude: saved.history,
          existing: saved.playlist.tracks.map(({ title, artist, lift }) => ({ title, artist, lift })),
          ...extraBody,
        }),
        signal: AbortSignal.timeout(MORE_TIMEOUT_MS),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !Array.isArray(data?.tracks)) return;
      const extra = normalizeLift(data.tracks as Track[]).tracks;
      // Gabungkan ke pool tanpa duplikat (hanya kalau playlist-nya masih sama)
      setResult((r) => {
        if (!r || r.id !== saved.id) return r;
        const ids = new Set(r.playlist.tracks.map((t) => t.id));
        const added = extra.filter((t) => !ids.has(t.id) && ids.add(t.id));
        if (added.length === 0) return r;
        return {
          ...r,
          playlist: { ...r.playlist, tracks: [...r.playlist.tracks, ...added] },
          history: [...r.history, ...added.map(trackName)].slice(-60),
        };
      });
    } catch {
      // waktu habis / koneksi putus: diamkan, pool yang ada tetap dipakai
    } finally {
      if (moreFor.current === saved.id) {
        moreFor.current = null;
        setAddingMore(false);
      }
    }
  }

  /** Tampilkan layar error (Back kembali ke halaman sebelumnya) */
  function showFailure(code: ErrorCode, mood: MoodKey | null) {
    setFailure({ code, mood });
    if (location.hash !== "#gagal") history.pushState(null, "", "#gagal");
    setView("error");
    window.scrollTo(0, 0);
  }

  function retry() {
    const attempt = lastAttempt.current;
    if (attempt) generate(attempt.request, attempt.history, attempt.lift);
  }

  /** Kirim permintaan ke API, lalu buka halaman hasil. */
  async function generate(request: PlaylistRequest, previousHistory: string[] = [], previousLift?: number) {
    lastAttempt.current = { request, history: previousHistory, lift: previousLift };
    // Sudah ketahuan offline: langsung tampilkan layar offline tanpa menunggu
    if (!navigator.onLine) {
      showFailure("offline", request.moodKey ?? null);
      return;
    }
    // Unduh bagian halaman hasil selagi layar memuat tampil (minimal 1,5 detik), bukan saat beranda dibuka
    loadTrackList().catch(() => {});
    loadMiniPlayer().catch(() => {});
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    setPending({ story: request.mood, moodKey: request.moodKey ?? null });
    setView("loading");
    window.scrollTo(0, 0);
    const minDelay = new Promise((r) => setTimeout(r, MIN_LOADING_MS));

    try {
      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => null);
      await minDelay;
      if (!res.ok || !data) throw new RequestError(res.status, data?.error ?? "Gagal membuat playlist");

      const { tracks, liftMissing } = normalizeLift((data as PlaylistResponse).tracks);
      const playlist = { ...(data as PlaylistResponse), tracks };
      const saved: SavedPlaylist = {
        id: String(Date.now()),
        playlist,
        request: { ...request, exclude: undefined },
        history: [...previousHistory, ...playlist.tracks.map(trackName)].slice(-60),
        lift: previousLift, // "buat ulang" mempertahankan posisi slider
        liftMissing,
      };
      stopAudio();
      setResult(saved);
      openResult();
      vibrate(HAPTIC_DONE);
      if (tracks.length < MIN_POOL && !liftMissing) addMoreSongs(saved);
    } catch (err) {
      if (controller.signal.aborted) return;
      await minDelay;
      const status = err instanceof RequestError ? err.status : null;
      // fetch melempar TypeError saat jaringan putus
      showFailure(errorCodeFor(status, err instanceof TypeError && !navigator.onLine), request.moodKey ?? null);
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }

  function handleSubmit() {
    if (loading) return;
    // Kalau hanya memilih chip tanpa mengetik, pakai teks bawaan mood itu
    const text = story.trim() || (chosenMood ? MOODS[chosenMood].text : "");
    if (text.length < MIN_MOOD_LENGTH) {
      setError("Ceritain dulu mood kamu, atau pilih salah satu mood.");
      return;
    }
    generate({ mood: text, ...filters, energy: "sedang", moodKey: chosenMood });
  }

  function handleRegenerate() {
    if (!result || loading) return;
    generate({ ...result.request, exclude: result.history }, result.history, result.lift);
  }

  // Layar pilih gaya kartu Story
  function openStory() {
    history.pushState(null, "", "#kartu");
    setView("story");
    window.scrollTo(0, 0);
  }

  /** Play/pause preview. Dipanggil langsung dari klik supaya jalan di iOS. */
  function toggleTrack(track: Track) {
    const audio = audioRef.current;
    if (!audio || !track.preview) return;
    if (current?.id === track.id) {
      if (audio.paused) audio.play().catch(() => setIsPlaying(false));
      else audio.pause();
      return;
    }
    // Ganti lagu: otomatis menghentikan lagu sebelumnya (hanya satu yang berputar)
    audio.src = track.preview;
    setCurrent(track);
    audio.play().catch(() => setIsPlaying(false));
  }

  // Geser slider: urutan & warna berubah realtime; lagu yang sedang diputar tetap diputar
  function setLift(p: number) {
    // Getar halus saat melewati / tepat di titik tengah (50)
    if ((lift - 0.5) * (p - 0.5) < 0 || (p === 0.5 && lift !== 0.5)) vibrate(HAPTIC_MIDDLE);
    setResult((r) => (r ? { ...r, lift: p } : r));
  }


  /**
   * "Lagu ini nggak cocok": lagu diganti cadangan dari pool yang belum tampil (tanpa AI).
   * Kalau cadangan habis, minta pengganti ke /api/replace. Catatan anonim dikirim ke /api/feedback.
   */
  function rejectTrack(track: Track) {
    if (!result) return;
    const nextRejected = [...(result.rejected ?? []), track.id];
    if (current?.id === track.id) stopAudio();
    setResult({ ...result, rejected: nextRejected });

    // Tanpa cerita pengguna: hanya mood, lagu, dan posisi slider
    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mood: result.playlist.mood,
        lagu: { id: track.id, title: track.title, artist: track.artist },
        posisiSlider: sliderOn ? lift : null,
      }),
      keepalive: true,
    }).catch(() => {});

    const pool = result.playlist.tracks;
    const available = pool.filter((t) => !nextRejected.includes(t.id)).length;
    const shown = sliderOn ? visibleCount(pool.length) : pool.length;
    if (available <= shown) addMoreSongs(result, "/api/replace", { lift: track.lift });
  }

  // Lagu sebelumnya / berikutnya (di urutan yang sedang tampil) yang punya preview
  const nextTrack = useMemo(() => {
    if (!current) return null;
    return visibleTracks.slice(visibleTracks.findIndex((t) => t.id === current.id) + 1).find((t) => t.preview) ?? null;
  }, [visibleTracks, current]);
  const prevTrack = useMemo(() => {
    const i = current ? visibleTracks.findIndex((t) => t.id === current.id) : -1;
    return i > 0 ? (visibleTracks.slice(0, i).findLast((t) => t.preview) ?? null) : null;
  }, [visibleTracks, current]);

  const playTrack = useCallback((track: Track | null) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!track?.preview) {
      setIsPlaying(false);
      return;
    }
    audio.src = track.preview;
    setCurrent(track);
    audio.play().catch(() => setIsPlaying(false));
  }, []);
  const playNext = useCallback(() => playTrack(nextTrack), [playTrack, nextTrack]);
  const playPrev = useCallback(() => playTrack(prevTrack), [playTrack, prevTrack]);

  // Link preview Deezer kedaluwarsa (±1 jam), mis. playlist lama dari riwayat: minta URL baru lalu putar ulang.
  // Sekali per lagu per 10 menit supaya tidak berulang-ulang kalau lagunya memang tidak bisa diputar.
  const previewRefreshed = useRef(new Map<string, number>());
  const handleAudioError = useCallback(async () => {
    const track = current;
    const audio = audioRef.current;
    const last = track ? previewRefreshed.current.get(track.id) : undefined;
    if (!track || !audio || !navigator.onLine || (last && Date.now() - last < 10 * 60_000)) {
      setIsPlaying(false);
      return;
    }
    previewRefreshed.current.set(track.id, Date.now());
    const res = await fetch(`/api/preview?id=${encodeURIComponent(track.id)}`).catch(() => null);
    const data = res?.ok ? await res.json().catch(() => null) : null;
    if (typeof data?.preview !== "string") {
      setIsPlaying(false);
      return;
    }
    const preview: string = data.preview;
    // URL baru ikut disimpan ke playlist (riwayat) supaya berikutnya langsung jalan
    setResult((r) =>
      r && { ...r, playlist: { ...r.playlist, tracks: r.playlist.tracks.map((t) => (t.id === track.id ? { ...t, preview } : t)) } },
    );
    setCurrent({ ...track, preview });
    audio.src = preview;
    audio.play().catch(() => setIsPlaying(false));
  }, [current]);

  // Mini player tampil selama ada preview (diputar/dijeda) di semua halaman setelah hasil.
  // Halaman hasil: bar 76px selebar layar (di dalam tata letak); halaman lain: pil melayang.
  const showMini = current !== null && view !== "home";
  const showBar = showMini && showResult;
  useEffect(() => {
    // Ruang bawah ekstra supaya konten tidak tertutup pemutar (hasil: tinggi bar 76px; lainnya: pil 64px + jarak 16px)
    const root = document.documentElement.style;
    const space = showBar ? "76px" : showMini ? "80px" : "0px";
    if (root.getPropertyValue("--mini-space") !== space) root.setProperty("--mini-space", space);
  }, [showMini, showBar]);

  // Ringkasan daftar lagu; total durasi hanya kalau semua lagu punya durasi dari Deezer
  const totalSeconds = visibleTracks.every((t) => t.duration) ? visibleTracks.reduce((sum, t) => sum + (t.duration ?? 0), 0) : 0;
  const summary = [
    `${visibleTracks.length} lagu`,
    sliderOn ? `diurutkan dari ${rule.liftName === "energi" ? "santai ke penuh energi" : "sendu ke ceria"}` : "",
    totalSeconds ? `${Math.max(1, Math.round(totalSeconds / 60))} menit` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const firstFull = visibleTracks[0];
  const pillAlpha = safeOverlayAlpha(theme.bg, 0.16);
  const pillBg = pillAlpha >= 0.06 ? `rgb(255 255 255 / ${pillAlpha})` : "rgb(30 18 64 / 0.22)";

  return (
    <>
      <AudioPlayer audioRef={audioRef} onPlayingChange={setIsPlaying} onEnded={playNext} onError={handleAudioError} />

      {showStory ? (
        /* ---------------- Pilih gaya kartu Story ---------------- */
        <ShareCard
          playlist={storyPlaylist(result.playlist, visibleTracks)}
          colors={theme}
          onBack={() => history.back()}
        />
      ) : view === "restoring" ? (
        /* Membaca playlist dari riwayat (sekejap) */
        <div className="min-h-screen" />
      ) : showError ? (
        /* ---------------- Layar Error ---------------- */
        <ErrorState mood={failure.mood} code={failure.code} onRetry={retry} />
      ) : showLoading ? (
        /* ---------------- Layar Memuat ---------------- */
        <LoadingScreen
          moodLabel={pending.moodKey ? MOODS[pending.moodKey].label : "Belum punya nama"}
          story={pending.story}
        />
      ) : showResult ? (
        /* ---------------- Halaman Hasil ---------------- */
        <div className="flex min-h-screen flex-col">
          <main className="flex flex-1 flex-wrap">
            {/* Panel kiri (warna Geser mood). Desktop: menempel di layar, jadi tombol selalu terlihat saat daftar lagu di-scroll */}
            <section className="flex flex-[1_1_400px] flex-col gap-7 px-12 pb-9 pt-8 text-white max-[940px]:px-6 max-[940px]:pb-8 max-[940px]:pt-6 min-[941px]:sticky min-[941px]:top-0 min-[941px]:h-[calc(100dvh-var(--mini-space,0px))] min-[941px]:self-start min-[941px]:overflow-y-auto">
              <div className="flex items-center justify-between gap-4">
                <Link href="/" onClick={goHome} aria-label="Kembali ke beranda">
                  <Logo />
                </Link>
                {/* Putih 16% (diturunkan seperlunya supaya teks putih tetap kontras ≥ 4.5:1 di atas warna slider) */}
                <span className="rounded-full px-4 py-2 text-[14px] font-bold" style={{ background: pillBg }}>
                  {result.playlist.mood ? MOODS[result.playlist.mood].label : "Belum punya nama"}
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-center gap-[18px]">
                <FitTitle
                  text={result.playlist.playlistTitle}
                  className="m-0 text-[clamp(52px,6vw,88px)] font-extrabold leading-[0.92] tracking-[-0.05em]"
                />
                {result.playlist.description && (
                  <p className="max-w-[34ch] text-[17px] font-medium leading-[1.5] text-soft">
                    {keepHyphens(result.playlist.description)}
                  </p>
                )}

                {/* Geser mood: 5 tingkat */}
                {sliderOn ? (
                  <div className="mt-[22px] flex max-w-[440px] flex-col gap-2">
                    <div aria-hidden className="flex justify-between gap-4 text-[15px] font-bold text-white">
                      <span>{rule.left}</span>
                      <span>{rule.right}</span>
                    </div>
                    <label htmlFor="geser-mood" className="sr-only">
                      {rule.hidden}
                    </label>
                    <input
                      id="geser-mood"
                      type="range"
                      min={0}
                      max={100}
                      step={25}
                      value={Math.round(lift * 100)}
                      onChange={(e) => setLift(Number(e.target.value) / 100)}
                      className="lift-range"
                    />
                    {/* Titik penanda tiap tingkat: putih kalau nilainya ≤ posisi slider */}
                    <div aria-hidden className="lift-dots">
                      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                        <span
                          key={v}
                          style={{ left: `calc(18px + (100% - 36px) * ${v})`, background: v <= lift ? "#FFFFFF" : "rgb(255 255 255 / 0.45)" }}
                        />
                      ))}
                    </div>
                    <p aria-live="polite" className="mt-2 text-[17px] font-semibold text-white">
                      {keepHyphens(sliderCaption(rule, lift))}
                    </p>
                    {addingMore && (
                      <p role="status" className="text-[13px] font-medium text-soft">
                        Nambahin pilihan lagu…
                      </p>
                    )}
                  </div>
                ) : (
                  /* Playlist lama tanpa skor lift: ajak buat ulang */
                  <div className="mt-[22px] flex max-w-[440px] flex-col items-start gap-[10px]">
                    <p className="text-[15px] font-medium text-white">Playlist ini dibuat sebelum fitur Geser mood.</p>
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      disabled={loading}
                      className="border-0 bg-transparent p-0 text-[15px] font-bold text-white underline underline-offset-4 disabled:opacity-70"
                    >
                      Buat ulang biar bisa digeser
                    </button>
                  </div>
                )}
              </div>

              <div className="flex max-w-[440px] flex-col gap-[10px]">
                <button
                  type="button"
                  onClick={openStory}
                  className="h-[58px] w-full rounded-[29px] border-0 bg-accent px-7 text-[17px] font-extrabold text-ink"
                >
                  Bagikan ke Story
                </button>
                <div className="flex gap-[10px]">
                  {firstFull && (
                    <div className="flex min-w-0 flex-1 [&>div]:flex-1">
                      <ListenFull
                        query={`${firstFull.title} ${firstFull.artist}`}
                        note={`Mulai dari lagu pertama: ${firstFull.title}`}
                        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[26px] border-2 border-solid border-white/50 bg-transparent px-5 text-[15px] font-bold text-white"
                      >
                        <ExternalIcon width={18} height={18} />
                        Dengerin full semua
                      </ListenFull>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    disabled={loading}
                    aria-label="Buat ulang playlist"
                    className="grid size-[52px] shrink-0 place-items-center rounded-full border-2 border-solid border-white/50 bg-transparent text-white disabled:opacity-70"
                  >
                    <RefreshIcon width={22} height={22} strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </section>

            {/* Panel kanan: daftar lagu */}
            <section className="flex min-w-0 flex-[999_1_560px] flex-col bg-white px-[clamp(16px,4vw,56px)] pb-5 pt-9 text-ink">
              <div className="mx-auto w-full max-w-[760px]">
                {!online && <p className="mb-2 text-[13px] font-medium text-sub">Kamu lagi offline. Preview lagu butuh internet.</p>}
                <p aria-live="polite" className="sr-only">
                  {listNote}
                </p>
                <p className="text-[15px] font-bold text-sub">{summary}</p>
                <TrackList
                  tracks={visibleTracks}
                  current={current}
                  isPlaying={isPlaying}
                  mood={result.playlist.mood}
                  liftName={sliderOn ? rule.liftName : null}
                  onReject={rejectTrack}
                  onToggle={toggleTrack}
                />
              </div>
            </section>
          </main>

          {/* Mini player: membentang di bawah kedua panel, menempel di bawah layar */}
          {showBar && (
            <PlayerBar
              track={current}
              isPlaying={isPlaying}
              audioRef={audioRef}
              hasPrev={prevTrack !== null}
              hasNext={nextTrack !== null}
              onToggle={() => toggleTrack(current)}
              onPrev={playPrev}
              onNext={playNext}
            />
          )}
        </div>
      ) : (
        /* ---------------- Halaman Beranda ---------------- */
        <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-8">
          <header className="flex h-24 shrink-0 items-center justify-between">
            <Logo />
            <Link href="/riwayat" className="text-[15px] font-semibold text-white no-underline">
              Playlist terakhir
            </Link>
          </header>

          <main className="flex flex-1 flex-col justify-center pb-24 pt-12">
            <RecapBanner bg={theme.bg} />
            <h1 tabIndex={-1} className="max-w-[11ch] text-[60px] font-extrabold leading-[0.92] tracking-[-0.05em] sm:text-[clamp(56px,9vw,132px)]">
              Lagi ngerasain apa?
            </h1>

            <form
              className="mt-14"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <MoodInput
                value={story}
                onChange={(v) => {
                  setStory(v);
                  if (error) setError(null);
                }}
                onSubmit={handleSubmit}
                loading={loading}
              />

              <SongFilters value={filters} bg={theme.bg} onChange={setFilters} disabled={loading} />

              <StoryExamples
                visible={story === ""}
                onPick={(text) => {
                  setStory(text);
                  setError(null);
                  // Fokuskan kolom yang sedang terlihat (input desktop / textarea HP), kursor di akhir teks
                  requestAnimationFrame(() => {
                    const field = ["mood-desktop", "mood-mobile"]
                      .map((id) => document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null)
                      .find((el) => el && el.offsetParent !== null);
                    field?.focus();
                    field?.setSelectionRange(text.length, text.length);
                  });
                }}
              />


              <QuickMoodButtons
                active={chosenMood}
                meaning={theme.meaning}
                disabled={loading}
                onPick={(key) => {
                  // Klik chip yang sudah terpilih = batal pilih
                  setChosenMood((m) => (m === key ? null : key));
                  setError(null);
                }}
              />

              {error && (
                <p role="alert" className="mt-4 text-[15px] font-semibold text-white">
                  {error}
                </p>
              )}

              {/* HP: tombol "Buat playlist" menempel di bawah layar */}
              <div className="mood-fade fixed inset-x-0 bottom-0 bg-mood px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 sm:hidden">
                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="h-14 w-full rounded-[28px] bg-accent px-8 text-[17px] font-bold text-ink disabled:opacity-70"
                >
                  Buat playlist
                </button>
              </div>
            </form>
          </main>
        </div>
      )}

      {showMini && !showBar && (
        <MiniPlayer
          track={current}
          isPlaying={isPlaying}
          audioRef={audioRef}
          hasNext={nextTrack !== null}
          onToggle={() => toggleTrack(current)}
          onNext={playNext}
          // Di atas bar tombol yang menempel di bawah layar pilih kartu (HP & layar sempit < 1072px)
          className={view === "story" ? "bottom-4 max-[1071px]:bottom-[calc(max(16px,env(safe-area-inset-bottom))+80px)]" : "bottom-4"}
        />
      )}
    </>
  );
}
