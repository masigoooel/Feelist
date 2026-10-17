"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mix } from "@/lib/color";
import { coverSrc } from "@/lib/cover";
import { readableOn, safeOverlayAlpha } from "@/lib/moodColors";
import { ACCENT_INK, DEFAULT_THEME, MOODS, type MoodKey } from "@/lib/moods";
import { shownTracks } from "@/lib/moodSlider";
import { editionFor } from "@/lib/recap/editions";
import { previousMonth } from "@/lib/recap/seen";
import { deletePlaylist, listHistory, type HistoryEntry } from "@/lib/playlistStore";
import { FitText } from "./FitText";
import Logo, { LogoMark } from "./Logo";
import { ShareIcon, TrashIcon } from "./icons";

const PAGE_BG = DEFAULT_THEME.bg; // #6C4CF5: halaman ini selalu ungu bawaan, bukan warna mood
const UNDO_MS = 5000;

/** Warna kartu: warna mood; tanpa mood → ungu bawaan digelapkan supaya kartu terlihat di atas latar ungu */
const cardColors = (mood: MoodKey | null) =>
  mood ? { bg: MOODS[mood].bg, accent: MOODS[mood].accent } : { bg: mix(DEFAULT_THEME.bg, ACCENT_INK, 0.3), accent: DEFAULT_THEME.accent };
const moodName = (mood: MoodKey | null) => (mood ? MOODS[mood].label : "Belum punya nama");
/** Putih transparan sebesar mungkin (≤ desired) yang tetap membuat teks putih di atasnya kontras ≥ 4.5:1 */
const whiteOver = (bg: string, desired: number) => {
  const a = safeOverlayAlpha(bg, desired);
  return a >= 0.06 ? `rgb(255 255 255 / ${a})` : "rgb(30 18 64 / 0.22)";
};

/** "Hari ini, 12.12" / "Kemarin, 23.47" / "13 Okt" (tahun lain: "13 Okt 2025") */
function when(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / 86_400_000);
  const time = `${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`;
  if (diff === 0) return `Hari ini, ${time}`;
  if (diff === 1) return `Kemarin, ${time}`;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}) }).replace(/\.$/, "");
}

function HistoryCard({ entry, onDelete }: { entry: HistoryEntry; onDelete: (e: HistoryEntry, el: HTMLElement | null) => void }) {
  const ref = useRef<HTMLElement>(null);
  const { bg, accent } = cardColors(entry.mood);
  const tracks = shownTracks(entry);
  const href = `/hasil?riwayat=${encodeURIComponent(entry.id)}`;
  const titleId = `judul-riwayat-${entry.id}`;
  return (
    <article
      ref={ref}
      aria-labelledby={titleId}
      className="history-card flex min-h-[300px] flex-col gap-[14px] rounded-[26px] p-[22px] text-white"
      style={{ background: bg }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full px-2.5 py-1 text-[13px] font-bold" style={{ background: whiteOver(bg, 0.18) }}>
          {moodName(entry.mood)}
        </span>
        <span className="text-[13px] font-semibold">{when(entry.createdAt)}</span>
      </div>

      <h2 id={titleId} className="m-0">
        <FitText lines={2} style={{ fontSize: 32, fontWeight: 800, lineHeight: 1, letterSpacing: -1, paddingBottom: 2 }}>
          {entry.title}
        </FitText>
      </h2>

      <div className="flex items-center gap-2">
        {tracks.slice(0, 3).map((t) => (
          // eslint-disable-next-line @next/next/no-img-element -- cover kecil dari proxy Deezer (tersimpan offline)
          <img
            key={t.id}
            src={coverSrc(t.cover)}
            alt=""
            width={52}
            height={52}
            loading="lazy"
            className="size-[52px] rounded-[12px] border-2 border-solid border-white/35 object-cover"
          />
        ))}
        <span className="ml-1 text-[13px] font-bold">{tracks.length} lagu</span>
      </div>

      {/* Cerita pengguna: hanya tampil di perangkat ini, tidak pernah ikut di kartu Story / link */}
      {entry.story && (
        <FitText lines={2} style={{ fontSize: 14, lineHeight: 1.4 }}>
          “{entry.story}”
        </FitText>
      )}

      <div className="mt-auto flex items-center gap-2.5">
        <Link
          href={href}
          aria-label={`Buka ${entry.title}`}
          className="flex h-11 flex-1 items-center justify-center rounded-[22px] text-[15px] font-extrabold no-underline"
          style={{ background: accent, color: ACCENT_INK }}
        >
          Buka
        </Link>
        <Link
          href={`${href}#kartu`}
          aria-label={`Bagikan ${entry.title} ke Story`}
          className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-solid border-white/50 text-white"
        >
          <ShareIcon width={20} height={20} />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(entry, ref.current)}
          aria-label={`Hapus ${entry.title}`}
          className="grid size-11 shrink-0 place-items-center rounded-full border-0 bg-transparent text-white"
        >
          <TrashIcon width={20} height={20} />
        </button>
      </div>
    </article>
  );
}

/** Kotak ringkasan bulan ini: 4 mood terbanyak (disembunyikan kalau < 3 playlist bulan ini) */
function MonthSummary({ items }: { items: HistoryEntry[] }) {
  const now = new Date();
  const inMonth = (y: number, m: number) =>
    items.filter((e) => {
      const d = new Date(e.createdAt);
      return d.getMonth() + 1 === m && d.getFullYear() === y;
    });
  // Bulan berjalan kalau sudah ≥ 3 playlist (= ada rangkumannya), selain itu bulan lalu
  const current = { year: now.getFullYear(), month: now.getMonth() + 1 };
  const prev = previousMonth(current.year, current.month);
  const isCurrent = inMonth(current.year, current.month).length >= 3;
  const target = isCurrent ? current : prev;
  const thisMonth = inMonth(target.year, target.month);
  if (thisMonth.length < 3) return null;
  const counts = new Map<MoodKey, { n: number; last: number }>();
  for (const e of thisMonth) {
    if (!e.mood) continue;
    const c = counts.get(e.mood) ?? { n: 0, last: 0 };
    counts.set(e.mood, { n: c.n + 1, last: Math.max(c.last, e.createdAt) });
  }
  const top = [...counts].sort((a, b) => b[1].n - a[1].n || b[1].last - a[1].last).slice(0, 4);
  if (!top.length) return null;
  const max = top[0][1].n;
  const month = editionFor(target.month).monthName;
  const alpha = safeOverlayAlpha(PAGE_BG, 0.12);
  const boxBg = mix(PAGE_BG, "#FFFFFF", alpha);
  // Tautan kuning #FFD84D dicerahkan seperlunya supaya kontras ≥ 4.5:1 di atas kotak
  const linkColor = readableOn("#FFD84D", boxBg);
  return (
    <div className="flex max-w-[420px] items-center gap-4 rounded-[20px] px-[18px] py-[14px]" style={{ background: `rgb(255 255 255 / ${alpha})` }}>
      <div role="img" aria-label={top.map(([m, c]) => `${MOODS[m].label} ${c.n} playlist`).join(", ")} className="flex h-9 shrink-0 items-end gap-1">
        {top.map(([m, c]) => (
          <span
            key={m}
            className="w-2.5 rounded-[5px] border-2 border-solid border-white/70"
            style={{ height: Math.max(10, Math.round((36 * c.n) / max)), background: MOODS[m].bg }}
          />
        ))}
      </div>
      <p className="m-0 text-[14px] leading-snug">
        <b>
          {month} {isCurrent ? "ini" : "lalu"} kamu paling sering {MOODS[top[0][0]].label}.
        </b>{" "}
        <Link href={`/rangkuman/${target.year}/${target.month}`} className="font-bold underline underline-offset-2" style={{ color: linkColor }}>
          Lihat rangkuman bulanan
        </Link>
      </p>
    </div>
  );
}

/** Halaman "Playlist terakhir": riwayat playlist di perangkat ini (tanpa login, bisa offline) */
export default function HistoryPage() {
  const [items, setItems] = useState<HistoryEntry[] | null>(null);
  const [filter, setFilter] = useState<MoodKey | "semua">("semua");
  // Hapus dengan "Urungkan": kartu langsung hilang, baru dihapus permanen setelah 5 detik
  const [pending, setPending] = useState<HistoryEntry | null>(null);
  const pendingRef = useRef<{ entry: HistoryEntry; timer: ReturnType<typeof setTimeout> } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const undoRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let alive = true;
    listHistory()
      .then((list) => alive && setItems(list))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, []);

  /** Hapus permanen yang sedang menunggu (dipanggil saat waktunya habis, hapus berikutnya, atau keluar halaman) */
  const flush = useCallback(() => {
    const p = pendingRef.current;
    if (!p) return;
    clearTimeout(p.timer);
    pendingRef.current = null;
    deletePlaylist(p.entry.id).catch(() => {});
  }, []);

  useEffect(() => {
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [flush]);

  function remove(entry: HistoryEntry, card: HTMLElement | null) {
    flush();
    // Fokus pindah ke kartu berikutnya (atau sebelumnya) supaya pengguna keyboard tidak kehilangan posisi
    const cards = [...(listRef.current?.querySelectorAll<HTMLElement>("article") ?? [])];
    const i = card ? cards.indexOf(card) : -1;
    const neighbour = cards[i + 1] ?? cards[i - 1];
    const timer = setTimeout(() => {
      flush();
      setPending(null);
    }, UNDO_MS);
    pendingRef.current = { entry, timer };
    setPending(entry);
    requestAnimationFrame(() => (neighbour?.querySelector<HTMLElement>("a") ?? undoRef.current)?.focus());
  }

  function undo() {
    const p = pendingRef.current;
    if (p) clearTimeout(p.timer);
    pendingRef.current = null;
    setPending(null);
  }

  // Kartu yang sudah dihapus permanen dibuang dari daftar; yang menunggu cukup disembunyikan
  useEffect(() => {
    if (pending) return;
    // dijalankan setelah toast hilang: sinkronkan daftar dengan IndexedDB
    let alive = true;
    listHistory()
      .then((list) => alive && setItems(list))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [pending]);

  const visible = useMemo(() => (items ?? []).filter((e) => e.id !== pending?.id), [items, pending]);
  // Chip mood: hanya mood yang punya playlist (terbanyak dulu); chip aktif tetap tampil walau isinya sudah habis
  const moods = useMemo(() => {
    const counts = new Map<MoodKey, number>();
    for (const e of visible) if (e.mood) counts.set(e.mood, (counts.get(e.mood) ?? 0) + 1);
    const list = [...counts].sort((a, b) => b[1] - a[1]).map(([m]) => m);
    if (filter !== "semua" && !list.includes(filter)) list.unshift(filter); // tepat setelah "Semua" supaya tetap terlihat
    return list;
  }, [visible, filter]);
  const shown = filter === "semua" ? visible : visible.filter((e) => e.mood === filter);
  const chipOff = whiteOver(PAGE_BG, 0.16);

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-[1200px] px-8 pb-14 max-sm:px-4 max-sm:pb-[calc(112px+env(safe-area-inset-bottom))]">
        <header className="flex h-[88px] items-center justify-between">
          <Link href="/" aria-label="Kembali ke beranda" className="text-white">
            <Logo />
          </Link>
          <Link
            href="/"
            className="flex h-12 items-center rounded-3xl bg-[#FFD84D] px-6 text-[15px] font-extrabold text-ink no-underline max-sm:hidden"
          >
            Buat playlist baru
          </Link>
        </header>

        <main>
          {items && items.length === 0 ? (
            /* Riwayat benar-benar kosong */
            <div className="flex flex-col items-center gap-5 py-20 text-center">
              <LogoMark size={160} outer="#FFFFFF" middle={DEFAULT_THEME.accent} />
              <h1 tabIndex={-1} className="m-0 text-[clamp(40px,5vw,56px)] font-extrabold leading-[0.95] tracking-[-0.045em]">
                Belum ada playlist
              </h1>
              <Link href="/" className="flex h-12 items-center rounded-3xl bg-[#FFD84D] px-7 text-[15px] font-extrabold text-ink no-underline">
                Buat playlist pertamamu
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
                <div>
                  <h1 tabIndex={-1} className="m-0 text-[clamp(48px,6vw,80px)] font-extrabold leading-[0.95] tracking-[-0.045em] max-sm:text-[44px]">
                    Playlist terakhir
                  </h1>
                  {items && <p className="mt-2 text-[16px] font-medium text-white">{visible.length} playlist · tersimpan di perangkat ini</p>}
                </div>
                {/* Baru dirender setelah riwayat dimuat (memakai tanggal hari ini, jangan saat prerender) */}
                {items && <MonthSummary items={visible} />}
              </div>

              {/* Saringan mood */}
              {items && (
                <div
                  role="group"
                  aria-label="Saring berdasarkan mood"
                  className="mt-7 flex gap-2 max-sm:-mx-4 max-sm:overflow-x-auto max-sm:px-4 max-sm:[scrollbar-width:none] sm:flex-wrap max-sm:[&::-webkit-scrollbar]:hidden"
                >
                  {(["semua", ...moods] as const).map((m) => {
                    const active = filter === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setFilter(m)}
                        className="h-10 shrink-0 rounded-[20px] border-0 px-[18px] text-[14px] font-bold"
                        style={active ? { background: "#FFFFFF", color: "#4A2FD0" } : { background: chipOff, color: "#FFFFFF" }}
                      >
                        {m === "semua" ? "Semua" : MOODS[m].label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Kartu */}
              {items &&
                (shown.length ? (
                  <div ref={listRef} className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(min(330px,100%),1fr))] gap-5">
                    {shown.map((e) => (
                      <HistoryCard key={e.id} entry={e} onDelete={remove} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-3xl border-2 border-dashed border-white/40 p-10 text-center">
                    <p className="m-0 text-[20px] font-extrabold">
                      Belum ada playlist {filter === "semua" ? "" : MOODS[filter].label}
                    </p>
                    <p className="m-0 mt-2 text-[15px] font-medium">Ceritain rasamu, nanti playlist-nya muncul di sini.</p>
                  </div>
                ))}
            </>
          )}

      {/* HP: "Buat playlist baru" menempel di bawah layar */}
          <div className="fixed inset-x-0 bottom-0 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 sm:hidden" style={{ background: PAGE_BG }}>
            <Link href="/" className="flex h-14 w-full items-center justify-center rounded-[28px] bg-[#FFD84D] text-[16px] font-extrabold text-ink no-underline">
              Buat playlist baru
            </Link>
          </div>

          {/* Toast hapus + Urungkan (5 detik) */}
          <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4 max-sm:bottom-[calc(max(16px,env(safe-area-inset-bottom))+80px)]">
            {pending && (
              <div role="status" className="toast-in pointer-events-auto flex items-center gap-4 rounded-2xl bg-ink py-2.5 pl-5 pr-2.5 text-[15px] font-semibold text-white">
                Playlist dihapus
                <button
                  ref={undoRef}
                  type="button"
                  onClick={undo}
                  className="h-10 rounded-[20px] border-0 bg-transparent px-3.5 text-[15px] font-extrabold text-[#FFD84D]"
                >
                  Urungkan
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

    </div>
  );
}
