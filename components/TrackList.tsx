"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { MoodKey } from "@/lib/moods";
import type { Track } from "@/lib/types";
import TrackCard from "./TrackCard";

type Props = {
  tracks: Track[];
  current: Track | null;
  isPlaying: boolean;
  mood: MoodKey | null;
  liftName: "ceria" | "energi" | null;
  onToggle: (track: Track) => void;
  onReject: (track: Track) => void;
};

const FLIP_MS = 250;

/** Daftar lagu. Saat urutan berubah (slider Geser mood), baris pindah dengan animasi FLIP. */
export default function TrackList({ tracks, current, isPlaying, mood, liftName, onToggle, onReject }: Props) {
  const listRef = useRef<HTMLOListElement>(null);
  // Posisi tata letak terakhir tiap baris (offsetTop tidak terpengaruh transform animasi)
  const tops = useRef(new Map<string, number>());
  const order = tracks.map((t) => t.id).join(",");

  const rows = () => Array.from(listRef.current?.children ?? []) as HTMLElement[];

  useLayoutEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<string, number>();
    for (const row of rows()) {
      const id = row.dataset.id!;
      const top = row.offsetTop;
      next.set(id, top);
      const prev = tops.current.get(id);
      if (prev === undefined || reduce) continue;
      // Mulai dari posisi yang sedang terlihat, termasuk animasi sebelumnya yang belum selesai
      const shift = new DOMMatrixReadOnly(getComputedStyle(row).transform).m42;
      const dy = prev + shift - top;
      row.getAnimations().forEach((a) => a.cancel());
      if (Math.abs(dy) > 0.5) {
        row.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: FLIP_MS, easing: "ease" });
      }
    }
    tops.current = next;
  }, [order]);

  // Ukuran layar berubah → catat ulang posisi supaya animasi berikutnya mulai dari tempat yang benar
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(() => {
      tops.current = new Map(rows().map((row) => [row.dataset.id!, row.offsetTop]));
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  return (
    <ol ref={listRef} className="mt-[14px] flex w-full flex-col gap-0.5">
      {tracks.map((track, i) => (
        <TrackCard
          key={track.id}
          track={track}
          index={i}
          isCurrent={current?.id === track.id}
          isPlaying={current?.id === track.id && isPlaying}
          mood={mood}
          liftName={liftName}
          onToggle={onToggle}
          onReject={onReject}
        />
      ))}
    </ol>
  );
}
