"use client";

import { keepHyphens } from "@/lib/keepHyphens";
import { coverSrc } from "@/lib/cover";
import { liftOf } from "@/lib/moodSlider";
import type { MoodKey } from "@/lib/moods";
import type { Track } from "@/lib/types";
import ListenFull from "./ListenFull";
import MoodWave from "./MoodWave";
import { PlayingIcon } from "./icons";

type Props = {
  track: Track;
  index: number;
  isCurrent: boolean; // lagu di pemutar (diputar atau dijeda)
  isPlaying: boolean;
  mood: MoodKey | null;
  liftName: "ceria" | "energi" | null; // null = gelombang disembunyikan (playlist lama tanpa lift)
  onToggle: (track: Track) => void;
  onReject: (track: Track) => void; // "Ganti lagu" (= "Lagu ini nggak cocok")
};

const SMALL_BUTTON =
  "flex h-10 items-center gap-1.5 whitespace-nowrap rounded-[20px] border-2 border-solid border-[#E4DFF5] bg-white px-3.5 text-[13px] font-bold text-ink";

/** Satu baris lagu. Klik = putar/jeda preview; tanpa preview = buka di Deezer. */
export default function TrackCard({ track, index, isCurrent, isPlaying, mood, liftName, onToggle, onReject }: Props) {
  const titleId = `judul-${track.id}`;
  const hasPreview = !!track.preview;
  const label = hasPreview
    ? `${isPlaying ? "Jeda" : "Putar"} ${track.title} oleh ${track.artist}`
    : `Buka ${track.title} oleh ${track.artist} di Deezer`;

  return (
    <li data-id={track.id}>
      {/* Tombol utama & tombol kecil bersebelahan (tombol tidak boleh di dalam tombol) */}
      <div
        className={`flex flex-wrap items-center gap-x-[14px] gap-y-2 rounded-[18px] px-[14px] py-[10px] ${isCurrent ? "" : "hover:bg-[#F6F4FB]"}`}
        // Lagu yang sedang diputar: warna bg mood saat ini dengan opacity 0.1
        style={isCurrent ? { background: "color-mix(in srgb, var(--mood-bg) 10%, transparent)" } : undefined}
      >
        <button
          type="button"
          aria-label={label}
          aria-pressed={hasPreview ? isPlaying : undefined}
          onClick={() => (hasPreview ? onToggle(track) : window.open(track.link, "_blank", "noopener,noreferrer"))}
          className="order-1 flex min-w-0 flex-1 cursor-pointer items-center gap-[14px] rounded-[14px] border-0 bg-transparent p-0 text-left text-ink"
        >
          <span className="w-6 shrink-0 text-right text-[14px] font-bold text-num">{index + 1}</span>

          <span className="relative size-[52px] shrink-0 overflow-hidden rounded-[14px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- cover kecil langsung dari CDN Deezer */}
            <img src={coverSrc(track.cover)} alt="" width={52} height={52} loading="lazy" className="size-full object-cover" />
            {isPlaying && (
              <span className="absolute inset-0 grid place-items-center bg-[rgb(30_18_64/0.55)]">
                <PlayingIcon color="#FFFFFF" width={24} height={24} />
              </span>
            )}
          </span>

          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span id={titleId} className="text-[17px] font-bold leading-[1.3]">
              {keepHyphens(track.title)}
            </span>
            <span className="text-[14px] font-medium text-sub">{keepHyphens(track.artist)}</span>
            {!hasPreview && <span className="text-[13px] text-sub-2">Preview nggak tersedia, buka di Deezer</span>}
          </span>
        </button>

        {/* Lagu yang sedang diputar: "Dengerin full" & "Ganti lagu". HP: turun ke baris sendiri di bawah judul */}
        {isCurrent && (
          <div className="order-2 flex shrink-0 gap-2 max-[640px]:order-3 max-[640px]:basis-full max-[640px]:pl-[90px]">
            <ListenFull query={`${track.title} ${track.artist}`} className={SMALL_BUTTON} ariaLabel={`Dengerin full ${track.title}`}>
              Dengerin full
            </ListenFull>
            <button type="button" onClick={() => onReject(track)} aria-describedby={titleId} className={SMALL_BUTTON}>
              Ganti lagu
            </button>
          </div>
        )}

        {liftName && (
          <span className="order-3 shrink-0 max-[640px]:order-2">
            <MoodWave lift={liftOf(track)} active={isPlaying} mood={mood} liftName={liftName} />
          </span>
        )}
      </div>
    </li>
  );
}
