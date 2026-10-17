"use client";

import { useEffect, type RefObject } from "react";

type Props = {
  // Elemen <audio> dimiliki halaman supaya play() bisa dipanggil langsung
  // di dalam event klik (wajib di iOS Safari).
  audioRef: RefObject<HTMLAudioElement | null>;
  onPlayingChange: (playing: boolean) => void;
  onEnded: () => void;
  onError: () => void; // preview gagal dimuat (mis. link Deezer kedaluwarsa)
};

/** Satu-satunya pemutar audio (tanpa tampilan; status terlihat di baris lagu). */
export default function AudioPlayer({ audioRef, onPlayingChange, onEnded, onError }: Props) {
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => onPlayingChange(true);
    const onPause = () => onPlayingChange(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [audioRef, onPlayingChange, onEnded, onError]);

  // Preview musik 30 detik dari Deezer tanpa sumber teks/lirik; <track> kosong hanya akan menipu aturan ini
  // eslint-disable-next-line jsx-a11y/media-has-caption
  return <audio ref={audioRef} preload="none" />;
}
