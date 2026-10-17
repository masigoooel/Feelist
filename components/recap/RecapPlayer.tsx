"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { getSlides, type Recap } from "@/lib/recap";
import { SLIDE_COPY } from "@/lib/recap/copy";
import { CloseIcon, PauseIcon, PlayIcon } from "../icons";
import type { RecapTheme } from "./types";

const SLIDE_MS = 7000;
const TAP_MS = 250; // ditekan lebih lama dari ini = "ditahan" (jeda), bukan ketukan
const W = 390;
const H = 844;

/** Kanvas Story 390×844 diskalakan supaya muat di layar (HP: penuh, desktop: di tengah) */
function useCanvasScale() {
  const [view, setView] = useState({ scale: 1, framed: false });
  useLayoutEffect(() => {
    const update = () => {
      const framed = window.innerWidth > 500; // desktop / tablet: "layar HP" di tengah dengan sudut membulat
      const pad = framed ? 32 : 0;
      setView({ framed, scale: Math.min((window.innerWidth - pad) / W, (window.innerHeight - pad) / H, framed ? 1 : 2) });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return view;
}

/**
 * Pemutar rangkuman ala Story: progress per slide (7 detik, berhenti saat ditahan), ketuk kanan 55% = lanjut,
 * kiri 45% = kembali, panah kiri/kanan, Esc menutup. Slide kuis tidak lanjut otomatis.
 * Tombol jeda tersedia karena konten bergerak otomatis (WCAG 2.2.2).
 */
export default function RecapPlayer({ recap, theme }: { recap: Recap; theme: RecapTheme }) {
  const router = useRouter();
  const slides = getSlides(recap);
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(0); // naik saat "Putar ulang" → semua slide dipasang ulang
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const { scale, framed } = useCanvasScale();
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const elapsed = useRef(0);
  const press = useRef<{ at: number; x: number } | null>(null);
  const stage = useRef<HTMLDivElement>(null);

  const id = slides[index];
  const auto = id !== "quiz"; // kuis menunggu jawaban
  const last = index === slides.length - 1;

  const go = useCallback(
    (to: number) => {
      const next = Math.max(0, Math.min(slides.length - 1, to));
      elapsed.current = 0;
      setIndex(next);
    },
    [slides.length],
  );
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);
  const restart = useCallback(() => {
    elapsed.current = 0;
    setRound((r) => r + 1);
    setIndex(0);
  }, []);

  // Isi progress: segmen sebelum = penuh, sesudah = kosong, aktif = waktu berjalan (ditulis langsung ke DOM)
  useEffect(() => {
    fills.current.forEach((el, i) => el && (el.style.transform = `scaleX(${i < index ? 1 : i > index ? 0 : Math.min(1, elapsed.current / SLIDE_MS)})`));
    let frame = 0;
    let before = performance.now();
    const tick = (now: number) => {
      const dt = now - before;
      before = now;
      if (auto && !paused && !holding && !document.hidden) elapsed.current = Math.min(SLIDE_MS, elapsed.current + dt);
      const el = fills.current[index];
      if (el) el.style.transform = `scaleX(${elapsed.current / SLIDE_MS})`;
      if (elapsed.current >= SLIDE_MS && !last) {
        go(index + 1);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [index, round, auto, paused, holding, last, go]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") router.push("/riwayat");
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, router]);

  // Ketuk / tahan. Tombol & tautan di dalam slide (kuis, bagikan) tidak dihitung sebagai ketukan.
  const interactive = (t: EventTarget | null) => t instanceof Element && !!t.closest("button, a, input, [data-no-tap]");
  function onDown(e: PointerEvent) {
    if (interactive(e.target)) return;
    press.current = { at: performance.now(), x: e.clientX };
    setHolding(true);
  }
  function onUp(e: PointerEvent) {
    const p = press.current;
    press.current = null;
    setHolding(false);
    if (!p || interactive(e.target) || performance.now() - p.at > TAP_MS) return;
    const box = stage.current!.getBoundingClientRect();
    if ((p.x - box.left) / box.width >= 0.45) next();
    else prev();
  }
  function onCancel() {
    press.current = null;
    setHolding(false);
  }

  const Slide = theme.slides[id];
  const { Backdrop, Enter } = theme;
  const label = `Rangkuman ${recap.edition.monthName} ${recap.year}`;

  return (
    <div className="nm-root fixed inset-0 grid place-items-center overflow-hidden" style={{ background: theme.pageBg }}>
      <section
        aria-label={label}
        aria-roledescription="carousel"
        className="relative shrink-0 overflow-hidden"
        style={{ width: W * scale, height: H * scale, borderRadius: framed ? 28 * scale : 0, background: theme.canvasBg }}
      >
        <div
          ref={stage}
          className="absolute left-0 top-0 touch-manipulation select-none"
          style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left" }}
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerCancel={onCancel}
          onPointerLeave={onCancel}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Backdrop />

          {/* Slide aktif; key baru → animasi masuk diputar ulang */}
          <div
            key={`${round}-${index}`}
            role="group"
            aria-roledescription="slide"
            aria-label={SLIDE_COPY.player.slide(index + 1, slides.length)}
            aria-live={paused ? "polite" : "off"}
            className="absolute inset-0"
          >
            <Enter />
            <Slide recap={recap} theme={theme} onNext={next} onRestart={restart} />
          </div>

          {/* Progress: satu segmen per slide */}
          <div aria-hidden className="absolute inset-x-3 top-3 flex gap-1">
            {slides.map((s, i) => (
              <span key={s} className="h-[3px] flex-1 overflow-hidden rounded-full" style={{ background: theme.progress.track }}>
                <span
                  ref={(el) => {
                    fills.current[i] = el;
                  }}
                  className="block h-full origin-left rounded-full"
                  style={{ background: theme.progress.fill, transform: "scaleX(0)" }}
                />
              </span>
            ))}
          </div>

          {/* Kontrol: jeda & tutup (44px) */}
          <div className="absolute right-2 top-5 flex gap-1">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? SLIDE_COPY.player.play : SLIDE_COPY.player.pause}
              className="grid size-11 place-items-center rounded-full border-0 bg-transparent text-white"
            >
              {paused ? <PlayIcon width={20} height={20} /> : <PauseIcon width={20} height={20} />}
            </button>
            <Link href="/riwayat" aria-label={SLIDE_COPY.player.close} className="grid size-11 place-items-center rounded-full text-white">
              <CloseIcon width={22} height={22} />
            </Link>
          </div>

          {/* Navigasi untuk keyboard / pembaca layar (terlihat saat difokus) */}
          <div className="absolute bottom-2 left-2 flex gap-2">
            <button type="button" onClick={prev} disabled={index === 0} className="sr-only focus:not-sr-only focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-[14px] focus:font-bold focus:text-[#05030F]">
              Sebelumnya
            </button>
            <button type="button" onClick={next} disabled={last} className="sr-only focus:not-sr-only focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-[14px] focus:font-bold focus:text-[#05030F]">
              Berikutnya
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
