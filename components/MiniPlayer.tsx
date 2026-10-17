"use client";

import { useEffect, useRef, type RefObject } from "react";
import { coverSrc } from "@/lib/cover";
import type { Track } from "@/lib/types";
import { FitText } from "./FitText";
import ListenFull from "./ListenFull";
import { ExternalIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon } from "./icons";

type Props = {
  track: Track;
  isPlaying: boolean;
  audioRef: RefObject<HTMLAudioElement | null>;
  hasNext: boolean;
  onToggle: () => void;
  onNext: () => void;
  className?: string; // posisi bawah per halaman (di atas bar tombol di HP)
};

/** Garis progres tipis 3px (tepi bawah / atas); lebar diubah langsung lewat ref supaya pemutar tidak render ulang terus */
function Progress({ audioRef, top = false }: { audioRef: RefObject<HTMLAudioElement | null>; top?: boolean }) {
  const bar = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => {
      const ratio = audio.duration ? audio.currentTime / audio.duration : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${ratio})`;
    };
    update();
    audio.addEventListener("timeupdate", update);
    audio.addEventListener("loadedmetadata", update);
    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("loadedmetadata", update);
    };
  }, [audioRef]);
  return (
    <span aria-hidden className={`absolute inset-x-0 h-[3px] ${top ? "top-0" : "bottom-0"}`}>
      <span ref={bar} className="block h-full origin-left scale-x-0 bg-accent" />
    </span>
  );
}

/** Pemutar kecil yang menempel di bawah layar selama ada preview yang diputar */
export default function MiniPlayer({ track, isPlaying, audioRef, hasNext, onToggle, onNext, className = "" }: Props) {
  return (
    <div
      role="region"
      aria-label="Pemutar preview"
      className={`mini-player fixed inset-x-4 z-20 mx-auto flex max-w-[560px] items-center gap-3 overflow-hidden rounded-[20px] bg-ink px-3 py-2.5 text-white ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- cover kecil dari CDN Deezer */}
      <img src={coverSrc(track.cover)} alt="" width={40} height={40} className="size-10 shrink-0 rounded-[10px] object-cover" />
      <div className="min-w-0 flex-1">
        <FitText lines={1} style={{ fontSize: 14, fontWeight: 700 }}>
          {track.title}
        </FitText>
        <FitText lines={1} style={{ fontSize: 12, fontWeight: 500, color: "rgb(255 255 255 / 0.8)" }}>
          {track.artist}
        </FitText>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-label={`${isPlaying ? "Jeda" : "Putar"} ${track.title} oleh ${track.artist}`}
        className="grid size-11 shrink-0 place-items-center rounded-full border-0 bg-transparent text-white"
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        aria-label="Putar lagu berikutnya"
        className="grid size-11 shrink-0 place-items-center rounded-full border-0 bg-transparent text-white disabled:opacity-40"
      >
        <NextIcon />
      </button>
      <Progress audioRef={audioRef} />
    </div>
  );
}

const ROUND = "grid shrink-0 place-items-center rounded-full border-0 disabled:opacity-40";

/**
 * Halaman hasil: bar pemutar 76px selebar layar di bawah kedua panel (menempel di bawah layar saat di-scroll).
 * Sebelumnya / berikutnya mengikuti urutan lagu yang sedang tampil.
 */
export function PlayerBar({
  track,
  isPlaying,
  audioRef,
  hasPrev,
  hasNext,
  onToggle,
  onPrev,
  onNext,
}: Omit<Props, "className"> & { hasPrev: boolean; onPrev: () => void }) {
  return (
    <div
      role="region"
      aria-label="Pemutar preview"
      className="sticky bottom-0 z-20 grid h-[76px] shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 max-[640px]:grid-cols-[minmax(0,1fr)_auto_auto] bg-ink px-7 text-white max-[640px]:gap-2 max-[640px]:px-4"
    >
      <Progress audioRef={audioRef} top />
      <div className="flex min-w-0 items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- cover kecil dari CDN Deezer */}
        <img src={coverSrc(track.cover)} alt="" width={44} height={44} className="size-11 shrink-0 rounded-[10px] object-cover" />
        <div className="min-w-0">
          <FitText lines={1} style={{ fontSize: 15, fontWeight: 700 }}>
            {track.title}
          </FitText>
          <FitText lines={1} style={{ fontSize: 13, fontWeight: 500, color: "rgb(255 255 255 / 0.8)" }}>
            {`${track.artist} · preview 30 detik`}
          </FitText>
        </div>
      </div>

      <div className="flex items-center gap-2 max-[640px]:gap-0">
        <button type="button" onClick={onPrev} disabled={!hasPrev} aria-label="Putar lagu sebelumnya" className={`${ROUND} size-11 bg-transparent text-white`}>
          <PrevIcon />
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-label={`${isPlaying ? "Jeda" : "Putar"} ${track.title} oleh ${track.artist}`}
          className={`${ROUND} size-12 bg-white text-ink`}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button type="button" onClick={onNext} disabled={!hasNext} aria-label="Putar lagu berikutnya" className={`${ROUND} size-11 bg-transparent text-white`}>
          <NextIcon />
        </button>
      </div>

      <div className="flex justify-end">
        <ListenFull
          query={`${track.title} ${track.artist}`}
          ariaLabel={`Dengerin full ${track.title}`}
          className="flex h-11 items-center gap-2 whitespace-nowrap rounded-[22px] border-2 border-solid border-white/40 bg-transparent px-4 text-[14px] font-bold text-white max-[640px]:size-11 max-[640px]:justify-center max-[640px]:px-0"
        >
          <ExternalIcon width={18} height={18} />
          <span className="max-[640px]:sr-only">Dengerin full</span>
        </ListenFull>
      </div>
    </div>
  );
}
