"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ExternalIcon } from "./icons";

// "Dengerin full": buka pencarian lagu di aplikasi musik (link pencarian biasa, tanpa login / API)
const SERVICES = [
  { id: "spotify", label: "Spotify", url: (q: string) => `https://open.spotify.com/search/${encodeURIComponent(q)}` },
  { id: "ytmusic", label: "YouTube Music", url: (q: string) => `https://music.youtube.com/search?q=${encodeURIComponent(q)}` },
] as const;
type ServiceId = (typeof SERVICES)[number]["id"];

const KEY = "feelist:listen-service";
const readLast = (): ServiceId | null => {
  try {
    const v = localStorage.getItem(KEY);
    return SERVICES.some((s) => s.id === v) ? (v as ServiceId) : null;
  } catch {
    return null;
  }
};

type Props = {
  query: string; // "{judul} {artis}"
  note?: string; // keterangan kecil di menu (mis. "Mulai dari lagu pertama: …")
  className: string;
  children: ReactNode; // isi tombol
  ariaLabel?: string;
};

/** Tombol + menu kecil berisi pilihan aplikasi; pilihan terakhir ditaruh paling atas & diingat */
export default function ListenFull({ query, note, className, children, ariaLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(true);
  const [last, setLast] = useState<ServiceId | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Tutup saat klik di luar / tekan Escape (fokus kembali ke tombol)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!menu.current?.contains(e.target as Node) && !button.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    menu.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    if (!open) {
      setLast(readLast());
      // Buka ke atas kalau ruang di atas cukup (mis. di mini player bawah), selain itu ke bawah
      setUp((button.current?.getBoundingClientRect().top ?? 0) > 200);
    }
    setOpen((o) => !o);
  }

  function pick(id: ServiceId) {
    try {
      localStorage.setItem(KEY, id);
    } catch {
      // penyimpanan diblokir: tidak masalah
    }
    setOpen(false);
  }

  const services = last ? [...SERVICES].sort((a, b) => (a.id === last ? -1 : b.id === last ? 1 : 0)) : SERVICES;

  return (
    <div className="relative shrink-0">
      <button
        ref={button}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggle}
        className={className}
      >
        {children}
      </button>
      {open && (
        <div
          ref={menu}
          id={menuId}
          className={`absolute right-0 z-30 w-[240px] rounded-[18px] border-2 border-solid border-[#E4DFF5] bg-white p-2 text-left text-ink ${
            up ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"
          }`}
        >
          <p className="px-3 pb-1 pt-2 text-[13px] font-bold text-sub">Dengerin full di</p>
          {note && <p className="px-3 pb-2 text-[12px] font-medium text-sub">{note}</p>}
          {services.map((s) => (
            <a
              key={s.id}
              href={s.url(query)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => pick(s.id)}
              className="flex items-center justify-between gap-3 rounded-[12px] px-3 py-2.5 text-[15px] font-bold text-ink no-underline hover:bg-[#F6F4FB]"
            >
              <span>{s.label}</span>
              <span className="flex items-center gap-2 text-[12px] font-semibold text-sub">
                {s.id === last && "Terakhir dipakai"}
                <ExternalIcon width={16} height={16} />
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
