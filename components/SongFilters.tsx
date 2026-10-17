"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { safeOverlayAlpha } from "@/lib/moodColors";
import { ERAS, LANGUAGES, isOption, type Era, type Language } from "@/lib/options";

export type SongFilterValue = { language: Language; era: Era };

const DEFAULT: SongFilterValue = { language: "campur", era: "bebas" };

// ---------- Pilihan terakhir di localStorage (dibaca tanpa hydration mismatch) ----------
const KEY = "feelist:song-filters";
const listeners = new Set<() => void>();
let memory: SongFilterValue | null = null; // cadangan kalau localStorage diblokir
const read = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
function parse(raw: string | null): SongFilterValue {
  try {
    const v = raw ? JSON.parse(raw) : {};
    return { language: isOption(LANGUAGES, v.language) ? v.language : DEFAULT.language, era: isOption(ERAS, v.era) ? v.era : DEFAULT.era };
  } catch {
    return DEFAULT;
  }
}

/** Bahasa & era pilihan pengguna (bawaan Campur & Bebas), diingat di perangkat ini */
export function useSongFilters(): [SongFilterValue, (v: SongFilterValue) => void] {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  const set = (v: SongFilterValue) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(v));
    } catch {
      // penyimpanan diblokir: pilihan tetap berlaku sampai halaman ditutup
      memory = v;
    }
    listeners.forEach((l) => l());
  };
  return [memory ?? parse(raw), set];
}

// ---------- Kalimat interaktif ----------
// Kata di dalam kalimat ("Lagu campur dari era mana aja") & label di daftar pilihan
const LANGUAGE_WORD: Record<Language, string> = { campur: "campur", indonesia: "Indonesia", internasional: "internasional" };
const ERA_WORD: Record<Era, string> = { bebas: "mana aja", "90an": "90-an", "2000an": "2000-an", "2010an": "2010-an", terbaru: "terbaru" };
const ERA_OPTION_LABEL = (e: (typeof ERAS)[number]) => (e.value === "bebas" ? "Mana aja" : e.label);

type Field = "language" | "era";

function ChevronDown() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/** Satu kata kunci (tombol) + daftar pilihannya */
function Keyword<T extends string>({
  field,
  ariaName,
  word,
  options,
  value,
  open,
  openBg,
  disabled,
  onOpen,
  onClose,
  onPick,
}: {
  field: Field;
  openBg: string;
  ariaName: string;
  word: string;
  options: { value: T; label: string }[];
  value: T;
  open: boolean;
  disabled?: boolean;
  onOpen: () => void;
  onClose: () => void;
  onPick: (v: T) => void;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const listId = `pilihan-${field}`;
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));

  function openList() {
    setActive(selectedIndex);
    onOpen();
  }

  // Baru dibuka: fokus ke opsi terpilih; daftar digeser ke kiri kalau keluar dari tepi layar (HP)
  useLayoutEffect(() => {
    const el = list.current;
    if (!open || !el) return;
    optionRefs.current[selectedIndex]?.focus();
    // Batas kanan = tepi area konten + 8px (HP: lebar layar − 24px). Bukan innerWidth: di HP, daftar yang
    // melewati tepi justru ikut melebarkan viewport.
    const host = el.closest("form") ?? document.body;
    const overflow = el.getBoundingClientRect().right - (host.getBoundingClientRect().right + 8);
    el.style.transform = overflow > 0 ? `translateX(${-overflow}px)` : "";
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- hanya saat dibuka

  // Klik di luar = tutup
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!list.current?.contains(t) && !button.current?.contains(t)) onClose();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, onClose]);

  function close(focusButton: boolean) {
    onClose();
    if (focusButton) button.current?.focus();
  }

  function onListKey(e: KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(options.length - 1, Math.max(0, active + (e.key === "ArrowDown" ? 1 : -1)));
      setActive(next);
      optionRefs.current[next]?.focus();
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const next = e.key === "Home" ? 0 : options.length - 1;
      setActive(next);
      optionRefs.current[next]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPick(options[active].value);
      close(true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "Tab") {
      onClose();
    }
  }

  return (
    <span className="relative inline-block">
      <button
        ref={button}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${ariaName}: ${word}`}
        onClick={() => (open ? onClose() : openList())}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            openList();
          }
        }}
        className="inline-flex h-10 items-center gap-1 rounded-t-lg border-0 border-b-2 border-dotted border-white px-2 align-middle text-[17px] font-extrabold text-white disabled:opacity-70"
        style={{ background: open ? openBg : "transparent" }}
      >
        {word}
        <ChevronDown />
      </button>
      {open && (
        <ul
          ref={list}
          id={listId}
          role="listbox"
          aria-label={ariaName}
          className="filter-dropdown absolute left-0 top-[46px] z-40 m-0 min-w-[180px] max-w-[calc(100vw-48px)] list-none rounded-2xl bg-white p-1.5 shadow-[0_16px_36px_rgba(20,10,60,0.3)]"
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              ref={(el) => {
                optionRefs.current[i] = el;
              }}
              role="option"
              aria-selected={o.value === value}
              tabIndex={i === active ? 0 : -1}
              onClick={() => {
                onPick(o.value);
                close(true);
              }}
              onKeyDown={onListKey}
              onFocus={() => setActive(i)}
              className={`flex h-10 cursor-pointer items-center whitespace-nowrap rounded-[10px] px-3.5 text-[15px] font-bold text-ink hover:bg-[#F3F0FA] ${
                o.value === value ? "bg-[#F3F0FA]" : ""
              }`}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </span>
  );
}

/** "Lagu {bahasa} dari era {era}": pengganti panel pengaturan di beranda. Hanya satu daftar terbuka. */
export default function SongFilters({
  value,
  bg,
  onChange,
  disabled,
}: {
  value: SongFilterValue;
  bg: string; // warna mood yang sedang tampil (untuk latar kata kunci yang terbuka)
  onChange: (v: SongFilterValue) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState<Field | null>(null);
  const close = () => setOpen(null);
  // Putih 18%, diturunkan seperlunya supaya teks putih tetap kontras ≥ 4.5:1; kalau putih tidak aman, gelap tipis
  const alpha = safeOverlayAlpha(bg, 0.18);
  const openBg = alpha >= 0.06 ? `rgb(255 255 255 / ${alpha})` : "rgb(30 18 64 / 0.22)";
  return (
    <div className="mt-[14px] text-[17px] font-medium text-white/95">
      Lagu{" "}
      <Keyword
        field="language"
        ariaName="Bahasa lagu"
        word={LANGUAGE_WORD[value.language]}
        options={LANGUAGES.map((l) => ({ value: l.value, label: l.label }))}
        value={value.language}
        open={open === "language"}
        openBg={openBg}
        disabled={disabled}
        onOpen={() => setOpen("language")}
        onClose={close}
        onPick={(language) => onChange({ ...value, language })}
      />{" "}
      dari era{" "}
      <Keyword
        field="era"
        ariaName="Era lagu"
        word={ERA_WORD[value.era]}
        options={ERAS.map((e) => ({ value: e.value, label: ERA_OPTION_LABEL(e) }))}
        value={value.era}
        open={open === "era"}
        openBg={openBg}
        disabled={disabled}
        onOpen={() => setOpen("era")}
        onClose={close}
        onPick={(era) => onChange({ ...value, era })}
      />
    </div>
  );
}
