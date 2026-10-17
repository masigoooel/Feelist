"use client";

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { mix } from "@/lib/color";
import { readableOn } from "@/lib/moodColors";
import { ACCENT_INK, MOODS, themeFor } from "@/lib/moods";
import {
  STORY_CATEGORIES,
  defaultTemplateFor,
  isStoryTab,
  isStoryTemplateId,
  templateById,
  templatesInTab,
  type StoryTab,
  type StoryTemplate,
  type StoryTemplateId,
} from "@/lib/storyTemplates";
import type { PlaylistResponse } from "@/lib/types";
import { STORY_H, STORY_W } from "./story/StoryFrame";
import type { StoryMood } from "./story/types";
import { ChevronLeftIcon, DownloadIcon } from "./icons";

type Props = {
  playlist: PlaylistResponse;
  colors: { bg: string; accent: string }; // warna asli mood (tidak ikut slider Geser mood)
  onBack: () => void;
};

const isSafari = () =>
  typeof navigator !== "undefined" && /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);

/** Tunggu semua <img> di dalam node selesai dimuat (berhasil atau gagal) */
function waitForImages(node: HTMLElement) {
  return Promise.all(
    [...node.querySelectorAll("img")].map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          }),
    ),
  );
}

function download(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// Gambar transparan 1x1 kalau ada gambar yang gagal di-embed
const PLACEHOLDER = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

// Kategori & template terakhir yang dipakai (dibagikan / disimpan), hanya di perangkat ini
const PICK_KEY = "feelist:story-pick";
type Pick = { tab: StoryTab; template: StoryTemplateId };

function readPick(): Partial<Pick> {
  try {
    const v = JSON.parse(localStorage.getItem(PICK_KEY) ?? "{}");
    return { tab: isStoryTab(v.tab) ? v.tab : undefined, template: isStoryTemplateId(v.template) ? v.template : undefined };
  } catch {
    return {};
  }
}

/** Analitik sederhana: template yang akhirnya dibagikan / disimpan (tanpa data pribadi) */
function trackShare(template: StoryTemplateId, aksi: "bagikan" | "simpan", mood: string | null) {
  const body = JSON.stringify({ template, aksi, mood });
  try {
    if (navigator.sendBeacon?.("/api/share-stat", body)) return;
    fetch("/api/share-stat", { method: "POST", body, keepalive: true }).catch(() => {});
  } catch {
    // analitik tidak boleh mengganggu pengguna
  }
}

/**
 * Tiga tata letak:
 * - "mobile" (< 640px): pratinjau mengecil supaya pratinjau + tab + baris thumbnail + tombol muat satu layar
 * - "narrow" (640–1071px): kolom kanan turun ke bawah pratinjau, thumbnail scroll ke samping, tombol menempel di bawah
 * - "desktop": pratinjau 432×768 (skala 0.4) + kolom kanan setinggi pratinjau; di layar yang kurang tinggi
 *   pratinjau & thumbnail mengecil bersama supaya semuanya terlihat tanpa zoom out
 */
type Mode = "mobile" | "narrow" | "desktop";
const MOBILE_RESERVED = 490; // header 64 + tab 44 + baris thumbnail ±240 + bar tombol ±104 + jarak
const DESKTOP_RESERVED = 120; // padding atas 20 + header 76 + padding bawah 24
const SIDE_BY_SIDE = 1072; // 432 + gap 56 + kolom kanan min 520 + padding 2×32
const RIGHT_FIXED = 237; // kolom kanan selain grid: pil 37 + tab 22+48 + jarak 26 + jarak min 20 + tombol 64 + padding grid 20
function layoutFor(): { mode: Mode; scale: number; thumb: number } {
  const mini = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--mini-space")) || 0;
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w < 640) return { mode: "mobile", scale: Math.min(0.26, Math.max(0.17, (h - MOBILE_RESERVED - mini) / STORY_H)), thumb: 0.1 };
  // Layar sempit: pratinjau tidak boleh terpotong bar tombol di bawah (±104px)
  if (w < SIDE_BY_SIDE) return { mode: "narrow", scale: Math.min(0.4, Math.max(0.2, (h - DESKTOP_RESERVED - 104 - mini) / STORY_H)), thumb: 0.2 };
  const scale = Math.min(0.4, Math.max(0.25, (h - DESKTOP_RESERVED - mini) / STORY_H));
  // Thumbnail ikut mengecil, dan minimal satu baris (thumbnail + nama ±40px) muat di area grid
  const gridSpace = STORY_H * scale - RIGHT_FIXED - 40;
  return { mode: "desktop", scale, thumb: Math.min((0.2 * scale) / 0.4, gridSpace / STORY_H) };
}

/** Thumbnail template sebagai tombol (HP 0.1 = 108×192, desktop 0.2 = 216×384) */
const Thumb = memo(function Thumb({
  template,
  playlist,
  mood,
  mode,
  thumb,
  selected,
  label,
  tabIndex,
  onPick,
  onKeyDown,
  onFocus,
  buttonRef,
}: {
  template: StoryTemplate;
  playlist: PlaylistResponse;
  mood: StoryMood;
  mode: Mode;
  thumb: number;
  selected: boolean;
  label: string | null; // "Paling cocok" / "Terakhir dipakai"
  tabIndex: number;
  onPick: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onFocus: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  const Template = template.component;
  const mobile = mode === "mobile";
  const labelId = `thumb-label-${template.id}`;
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-pressed={selected}
      aria-label={`Pilih template ${template.label}`}
      aria-describedby={label ? labelId : undefined}
      tabIndex={tabIndex}
      onClick={onPick}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      className={`block shrink-0 cursor-pointer snap-start border-0 bg-transparent p-0 text-left text-white ${mobile ? "rounded-[14px]" : "rounded-[20px]"}`}
    >
      <div
        className={`relative overflow-hidden ${mobile ? "rounded-[12px]" : "rounded-[18px]"}`}
        style={{
          width: STORY_W * thumb,
          height: STORY_H * thumb,
          outline: selected ? `3px solid ${mood.accent}` : "none",
          outlineOffset: mobile ? 3 : 4,
        }}
      >
        <div aria-hidden style={{ transform: `scale(${thumb})`, transformOrigin: "top left", pointerEvents: "none" }}>
          <Template playlist={playlist} mood={mood} />
        </div>
        {/* HP: thumbnail terlalu sempit untuk label di baris nama, jadi ditempel di pojok */}
        {mobile && label && (
          <span id={labelId} className="absolute left-1.5 top-1.5 rounded-[6px] px-1.5 py-0.5 text-[11px] font-bold leading-tight" style={{ background: mood.accent, color: ACCENT_INK }}>
            {label}
          </span>
        )}
      </div>
      {mobile ? (
        <span className="mt-2 block text-center text-[13px] font-semibold">{template.label}</span>
      ) : (
        <span className="mt-3 flex items-center justify-between gap-2" style={{ width: STORY_W * thumb }}>
          <span className="truncate text-[17px] font-bold">{template.label}</span>
          {label && (
            <span id={labelId} className="shrink-0 whitespace-nowrap rounded-full bg-white/14 px-2 py-[3px] text-[12px] font-bold">
              {label}
            </span>
          )}
        </span>
      )}
    </button>
  );
});

/** Layar "Pilih gaya kartu" + ekspor kartu Story jadi PNG */
export default function ShareCard({ playlist, colors, onBack }: Props) {
  const mood: StoryMood = useMemo(
    () => ({
      name: playlist.mood ? MOODS[playlist.mood].label : "Belum punya nama",
      bg: colors.bg,
      accent: colors.accent,
      // Teks berwarna aksen harus kontras ≥ 4.5:1, juga di atas hiasan putih tipis (±10%)
      accentText: readableOn(colors.accent, mix(colors.bg, "#FFFFFF", 0.1)),
      meaning: themeFor(playlist.mood).meaning,
    }),
    [playlist.mood, colors.bg, colors.accent],
  );
  const pageBg = mix(colors.bg, ACCENT_INK, 0.45); // sama dengan latar <body> di layar ini (app/page.tsx)
  const recommended = defaultTemplateFor(playlist.mood);

  // Template awal = rekomendasi pertama; tab awal = kategori terakhir yang dipakai
  const [selected, setSelected] = useState<StoryTemplateId>(recommended);
  const [lastPick, setLastPick] = useState<Partial<Pick>>(readPick);
  const [tab, setTab] = useState<StoryTab>(() => lastPick.tab ?? "rekomendasi");
  const [{ mode, scale, thumb }, setLayout] = useState(layoutFor);
  const [busy, setBusy] = useState(false);
  const files = useRef<Partial<Record<StoryTemplateId, File>>>({});
  const exportRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selected);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const items = templatesInTab(tab, playlist.mood);
  const selectedIndex = items.findIndex((t) => t.id === selected);
  // Roving tabindex: fokus Tab masuk ke thumbnail terpilih (atau yang pertama kalau tidak ada di tab ini)
  const [focusIndex, setFocusIndex] = useState(0);
  const activeIndex = Math.min(focusIndex, items.length - 1);

  const fileName = `feelist-${playlist.playlistTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "playlist"}.png`;

  useLayoutEffect(() => {
    const update = () => setLayout(layoutFor());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /** Render kartu terpilih (yang ada di luar layar) jadi file PNG, disimpan di cache */
  const renderNow = useCallback(
    async (id: StoryTemplateId): Promise<File | null> => {
      const cached = files.current[id];
      if (cached) return cached;
      const node = exportRef.current?.firstElementChild as HTMLElement | null;
      if (!node || selectedRef.current !== id) return null;
      await document.fonts.ready;
      await waitForImages(node);
      const options = {
        width: STORY_W,
        height: STORY_H,
        pixelRatio: 1,
        imagePlaceholder: PLACEHOLDER,
        // Wajib: semua cover memakai /api/image?url=..., tanpa ini cache html-to-image
        // menganggap semuanya gambar yang sama
        includeQueryParams: true,
      };
      // html-to-image baru dimuat saat kartu pertama kali diekspor
      const { toPng } = await import("html-to-image");
      // Safari kadang melewatkan gambar/font di render pertama, jadi render dua kali
      if (isSafari()) await toPng(node, options);
      const dataUrl = await toPng(node, options);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], fileName, { type: "image/png" });
      // Abaikan kalau pengguna sudah ganti template selagi proses berjalan
      if (selectedRef.current !== id) return null;
      files.current[id] = file;
      return file;
    },
    [fileName],
  );

  // Antrean: render berat dijalankan satu per satu. Pekerjaan yang sudah basi (template diganti)
  // langsung selesai karena renderNow mengecek cache & template terpilih sebelum mulai.
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const render = useCallback(
    (id: StoryTemplateId) => {
      const job = queue.current.then(() => renderNow(id));
      queue.current = job.catch(() => {});
      return job;
    },
    [renderNow],
  );

  // Siapkan PNG di latar belakang supaya tombol bagikan bisa langsung jalan (Web Share butuh klik "segar")
  useEffect(() => {
    selectedRef.current = selected;
    const timer = setTimeout(() => {
      render(selected).catch((err) => console.error("[story] gagal bikin gambar:", err));
    }, 300);
    return () => clearTimeout(timer);
  }, [selected, render]);

  /** Geser daftar thumbnail (bukan halaman) sampai thumbnail ke-i terlihat */
  const reveal = useCallback((i: number) => {
    const list = listRef.current;
    const el = optionRefs.current[i];
    if (!list || !el) return;
    const lr = list.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const pad = 16;
    if (er.left < lr.left + pad) list.scrollLeft -= lr.left + pad - er.left;
    else if (er.right > lr.right - pad) list.scrollLeft += er.right - (lr.right - pad);
    if (er.top < lr.top + pad) list.scrollTop -= lr.top + pad - er.top;
    else if (er.bottom > lr.bottom - pad) list.scrollTop += er.bottom - (lr.bottom - pad);
  }, []);

  // Thumbnail terpilih digeser ke area terlihat saat ganti tab / pilihan
  useEffect(() => {
    if (selectedIndex >= 0) reveal(selectedIndex);
  }, [selectedIndex, tab, reveal]);

  async function getFile() {
    setBusy(true);
    try {
      return await render(selected);
    } catch (err) {
      console.error("[story] gagal bikin gambar:", err);
      return null;
    } finally {
      setBusy(false);
    }
  }

  /** Kartu benar-benar dipakai: ingat kategori + template, lalu catat analitiknya */
  function markUsed(aksi: "bagikan" | "simpan") {
    const pick: Pick = { tab, template: selected };
    setLastPick(pick);
    try {
      localStorage.setItem(PICK_KEY, JSON.stringify(pick));
    } catch {
      // penyimpanan penuh / diblokir: tidak masalah
    }
    trackShare(selected, aksi, playlist.mood);
  }

  async function handleSave() {
    const file = await getFile();
    if (!file) return;
    download(file);
    markUsed("simpan");
  }

  async function handleShare() {
    const file = await getFile();
    if (!file) return;
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        markUsed("bagikan");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          download(file);
          markUsed("simpan");
        }
      }
    } else {
      download(file);
      markUsed("simpan");
    }
  }

  function changeTab(next: StoryTab) {
    setTab(next);
    const list = templatesInTab(next, playlist.mood);
    setFocusIndex(Math.max(0, list.findIndex((t) => t.id === selected)));
  }

  // Tab kategori: panah kiri/kanan + Home/End (mengganti tab tidak mengganti template)
  function onTabKey(e: KeyboardEvent, index: number) {
    const n = STORY_CATEGORIES.length;
    const next =
      e.key === "ArrowRight" ? (index + 1) % n : e.key === "ArrowLeft" ? (index - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    changeTab(STORY_CATEGORIES[next].id);
    tabRefs.current[next]?.focus();
  }

  // Thumbnail: panah berpindah fokus, Home/End ke ujung; Enter/Spasi memilih (bawaan <button>)
  function onThumbKey(e: KeyboardEvent, index: number) {
    const list = listRef.current;
    const cols = list && getComputedStyle(list).display === "grid" ? getComputedStyle(list).gridTemplateColumns.split(" ").length : 0;
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
    let next = -1;
    if (step) next = Math.min(items.length - 1, Math.max(0, index + step));
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setFocusIndex(next);
    optionRefs.current[next]?.focus({ preventScroll: true });
    reveal(next);
  }

  const Template = templateById(selected).component;
  const tabLabel = STORY_CATEGORIES.find((c) => c.id === tab)?.label ?? "";
  const desktop = mode === "desktop";
  const mobile = mode === "mobile";
  const previewH = STORY_H * scale;

  const actions = mobile ? (
    <div className="flex gap-[10px]">
      <button
        type="button"
        onClick={handleSave}
        disabled={busy}
        aria-label="Simpan gambar"
        className="grid size-14 shrink-0 place-items-center rounded-full border-2 border-white/50 bg-transparent text-white disabled:opacity-70"
      >
        <DownloadIcon />
      </button>
      <button
        type="button"
        onClick={handleShare}
        disabled={busy}
        aria-busy={busy}
        className="h-14 flex-1 rounded-[28px] border-0 bg-accent px-7 text-[16px] font-bold text-ink disabled:opacity-70"
      >
        Bagikan ke Story
      </button>
    </div>
  ) : (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={handleSave}
        disabled={busy}
        aria-label="Simpan gambar"
        className="flex h-16 shrink-0 items-center gap-2.5 rounded-[32px] border-2 border-solid border-white/50 bg-transparent px-[26px] text-[17px] font-bold text-white disabled:opacity-70 [&_svg]:size-[22px]"
      >
        <DownloadIcon />
        Simpan
      </button>
      <button
        type="button"
        onClick={handleShare}
        disabled={busy}
        aria-busy={busy}
        className="h-16 max-w-[420px] flex-1 rounded-[32px] border-0 px-7 text-[19px] font-extrabold disabled:opacity-70"
        style={{ background: colors.accent, color: ACCENT_INK }}
      >
        Bagikan ke Story
      </button>
    </div>
  );

  return (
    // Latar halaman = <body> (bg mood + 45% #1E1240, transisi 0.7s lewat MoodColorProvider)
    <div className="min-h-screen text-white">
      <div className={mobile ? "px-4" : "mx-auto box-content max-w-[1240px] px-8 pb-6 pt-5"}>
        <header className={`flex items-center gap-4 ${mobile ? "h-16" : "h-[76px]"}`}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Kembali"
            className={`grid shrink-0 place-items-center rounded-full border-2 border-solid bg-transparent text-white ${mobile ? "size-11 border-white/50" : "size-[52px] border-white/45"}`}
          >
            <ChevronLeftIcon />
          </button>
          <h1 tabIndex={-1} className={mobile ? "text-[24px] font-bold" : "text-[32px] font-extrabold tracking-[-1px]"}>
            Pilih gaya kartu
          </h1>
        </header>

        <main
          className={
            mobile
              ? "flex flex-col gap-4 pb-[calc(112px+var(--mini-space,0px))]"
              : `flex flex-wrap items-stretch gap-14 ${desktop ? "pb-[var(--mini-space,0px)]" : "justify-center pb-[calc(120px+var(--mini-space,0px))]"}`
          }
        >
          {/* Pratinjau besar */}
          <div
            className={`shrink-0 overflow-hidden ${mobile ? "mx-auto rounded-[18px]" : "rounded-[28px]"}`}
            style={{ width: STORY_W * scale, height: previewH, boxShadow: "0 24px 60px rgba(20,8,20,0.5)" }}
            aria-label={`Pratinjau kartu ${templateById(selected).label}`}
            role="img"
          >
            <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <Template playlist={playlist} mood={mood} />
            </div>
          </div>

          {/* Kolom kanan: setinggi pratinjau di desktop, supaya tombol sejajar bagian bawah pratinjau */}
          <div
            className="flex min-w-0 flex-col"
            style={desktop ? { flex: "1 1 520px", height: previewH } : mobile ? undefined : { flex: "1 1 100%" }}
          >
            {!mobile && (
              <p className="flex items-center gap-2.5 self-start rounded-full bg-white/12 py-2 pl-2.5 pr-[18px] text-[15px] font-semibold">
                <span className="size-3.5 shrink-0 rounded-full border-2 border-solid" style={{ background: colors.bg, borderColor: colors.accent }} />
                {playlist.mood ? (
                  <span>
                    Cocok buat mood <b>{mood.name}</b>
                  </span>
                ) : (
                  <span>Pilihan terpopuler</span>
                )}
              </p>
            )}

            {/* Tab kategori */}
            <div
              role="tablist"
              aria-label="Kategori gaya kartu"
              className={`flex shrink-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
                mobile ? "-mx-4 gap-6 px-4" : "mt-[22px] gap-7 border-0 border-b-2 border-solid border-white/14"
              }`}
            >
              {STORY_CATEGORIES.map((c, i) => {
                const active = c.id === tab;
                const count = templatesInTab(c.id, playlist.mood).length;
                return (
                  <button
                    key={c.id}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    id={`story-tab-${c.id}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls="story-tabpanel"
                    tabIndex={active ? 0 : -1}
                    onClick={() => changeTab(c.id)}
                    onKeyDown={(e) => onTabKey(e, i)}
                    className={`flex shrink-0 items-center gap-2 border-0 border-b-[3px] border-solid bg-transparent px-0 ${
                      mobile ? "h-11 text-[15px] font-bold" : "-mb-[2px] pb-3 pt-1 text-[19px] font-extrabold"
                    } ${active ? "text-white" : "border-transparent text-white/72"}`}
                    style={active ? { borderBottomColor: colors.accent } : undefined}
                  >
                    {c.label}
                    {!mobile && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[13px] font-bold ${active ? "" : "bg-white/14 text-white"}`}
                        style={active ? { background: colors.accent, color: ACCENT_INK } : undefined}
                      >
                        <span className="sr-only">, </span>
                        {count}
                        <span className="sr-only"> template</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Thumbnail: hanya tab yang terbuka yang dirender */}
            <div
              id="story-tabpanel"
              role="tabpanel"
              aria-labelledby={`story-tab-${tab}`}
              className={desktop ? "mt-[18px] flex min-h-0 shrink flex-col" : "mt-3"}
            >
              <div
                ref={listRef}
                role="group"
                aria-label={`Template ${tabLabel}`}
                className={
                  desktop
                    ? // Grid 216px auto-fill; padding 8px supaya outline terpilih & cincin fokus tidak terpotong saat di-scroll
                      "-mx-2 grid min-h-0 content-start gap-6 overflow-y-auto p-2"
                    : `flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
                        mobile ? "-mx-4 scroll-px-4 gap-3 px-4 py-[10px]" : "-mx-8 scroll-px-8 gap-6 px-8 py-3"
                      }`
                }
                style={desktop ? ({ gridTemplateColumns: `repeat(auto-fill, ${STORY_W * thumb}px)` } as CSSProperties) : undefined}
              >
                {items.map((t, i) => (
                  <Thumb
                    key={t.id}
                    template={t}
                    playlist={playlist}
                    mood={mood}
                    mode={mode}
                    thumb={thumb}
                    selected={t.id === selected}
                    label={t.id === lastPick.template ? "Terakhir dipakai" : !mobile && t.id === recommended ? "Paling cocok" : null}
                    tabIndex={i === activeIndex ? 0 : -1}
                    onPick={() => {
                      setSelected(t.id);
                      setFocusIndex(i);
                    }}
                    onKeyDown={(e) => onThumbKey(e, i)}
                    onFocus={() => setFocusIndex(i)}
                    buttonRef={(el) => {
                      optionRefs.current[i] = el;
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Desktop: tombol di bagian bawah kolom, sejajar bagian bawah pratinjau */}
            {desktop && (
              <>
                <div className="min-h-5 flex-1" />
                {actions}
              </>
            )}
          </div>
        </main>
      </div>

      {/* HP & layar sempit: tombol menempel di bawah layar */}
      {!desktop && (
        <div className="fixed inset-x-0 bottom-0 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4" style={{ background: pageBg }}>
          <div className={mobile ? undefined : "mx-auto max-w-[640px]"}>{actions}</div>
        </div>
      )}

      {/* Kartu ukuran asli di luar layar, sumber ekspor PNG */}
      <div ref={exportRef} aria-hidden style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none" }}>
        <Template playlist={playlist} mood={mood} />
      </div>
    </div>
  );
}
