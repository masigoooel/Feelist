// Komponen & gaya bersama untuk semua template kartu Story (ukuran dalam piksel kartu)
import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { mix } from "@/lib/color";
import { coverSrc } from "@/lib/cover";
import { safeOverlayAlpha } from "@/lib/moodColors";

export const INK = "#1E1240"; // teks gelap
export const INK_SOFT = "#4E4673"; // teks sekunder gelap

/** Cover Deezer lewat proxy same-origin supaya canvas tidak "tainted" */
export const imageUrl = coverSrc;

export { FitText, clamp, ellipsis } from "../FitText";

/** Ukuran nama mood besar: min(max, 888 / (0.6 × jumlah huruf)) */
export const moodNameSize = (name: string, max: number) => Math.min(max, 888 / (0.6 * Math.max(name.length, 1)));

/** Ikon tiga batang. `outer` = warna batang luar, `middle` = batang tengah. */
export function LogoMark({ size, outer, middle }: { size: number; outer: string; middle: string }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden style={{ flexShrink: 0 }}>
      <path d="M66 80 L66 120" stroke={outer} strokeWidth="22" strokeLinecap="round" fill="none" />
      <path d="M100 50 L100 150" stroke={middle} strokeWidth="22" strokeLinecap="round" fill="none" />
      <path d="M134 68 L134 132" stroke={outer} strokeWidth="22" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Logo kartu: ikon 52px + "feelist" 38px. Versi gelap untuk di atas kertas putih. */
export function StoryLogo({ accent, bg, dark = false }: { accent: string; bg: string; dark?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
      <LogoMark size={52} outer={dark ? INK : "#FFFFFF"} middle={dark ? bg : accent} />
      <span style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1.5, color: dark ? INK : "#FFFFFF" }}>
        feelist
      </span>
    </span>
  );
}

/** Tombol ajakan di kartu */
export function StoryCTA({ text, accent, style }: { text: string; accent: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 92,
        padding: "0 44px",
        borderRadius: 46,
        background: accent,
        color: INK,
        fontSize: 34,
        fontWeight: 700,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {text}
    </div>
  );
}

/** Cover lagu; kalau gambar gagal dimuat diganti kotak warna turunan bg mood */
export function StoryCover({
  src,
  size,
  radius,
  bg,
  style,
}: {
  src: string;
  size: number | string;
  radius: number;
  bg: string;
  style?: CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  const box: CSSProperties = { width: size, height: size, borderRadius: radius, flexShrink: 0, ...style };
  if (failed) return <div style={{ ...box, background: mix(bg, "#FFFFFF", 0.2) }} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- dirender jadi PNG, next/image tidak cocok di sini
    <img src={imageUrl(src)} alt="" onError={() => setFailed(true)} style={{ ...box, objectFit: "cover", display: "block" }} />
  );
}

/** Tiga pil vertikal hiasan (template Rasa kamu & Tiket); ditipiskan kalau membuat teks putih di atasnya kurang kontras */
export function DecorPills({ position, align, bg }: { position: CSSProperties; align: "flex-start" | "flex-end"; bg: string }) {
  const pills = [
    { h: 560, a: safeOverlayAlpha(bg, 0.1) },
    { h: 900, a: safeOverlayAlpha(bg, 0.16) },
    { h: 680, a: safeOverlayAlpha(bg, 0.1) },
  ];
  return (
    <div style={{ position: "absolute", display: "flex", gap: 36, alignItems: align, ...position }}>
      {pills.map((p, i) => (
        <div key={i} style={{ width: 150, height: p.h, borderRadius: 75, background: `rgb(255 255 255 / ${p.a})` }} />
      ))}
    </div>
  );
}

/**
 * Lapisan dekorasi kartu (di belakang konten). Elemen yang harus tampil di atas konten
 * (selotip, cap) diberi zIndex 2. Tidak bisa diklik dan disembunyikan dari pembaca layar.
 */
export function DecoLayer({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {children}
    </div>
  );
}

/** Font kartu Story (dipasang di app/layout.tsx lewat next/font) */
export const FONT = {
  mono: "var(--font-mono), ui-monospace, monospace",
  serif: "var(--font-serif), Georgia, serif",
  marker: "var(--font-marker), cursive",
} as const;

/**
 * Tekstur grain: SVG feTurbulence (fractalNoise 0.8, 3 oktaf, tanpa warna) menutupi seluruh kartu.
 * Kertas → blend "multiply", latar gelap → "screen".
 */
export function Grain({ opacity, blend }: { opacity: number; blend: "multiply" | "screen" }) {
  const id = `grain-${useId().replace(/:/g, "")}`;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity, mixBlendMode: blend }}>
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency={0.8} numOctaves={3} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={1080} height={1920} filter={`url(#${id})`} />
    </svg>
  );
}

/** Path bintang 4 sudut (viewBox 24) */
export const SPARKLE_PATH = "M12 2 C12.6 8 16 11.4 22 12 C16 12.6 12.6 16 12 22 C11.4 16 8 12.6 2 12 C8 11.4 11.4 8 12 2 Z";

/** Sparkle dekorasi di posisi absolut */
export function DecoSparkle({ size, color, style }: { size: number; color: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ position: "absolute", ...style }}>
      <path d={SPARKLE_PATH} fill={color} />
    </svg>
  );
}

/** Angka acak tetap dari seed (posisi bintang dll. sama di setiap ekspor) */
export function seededRandom(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return () => {
    h = (h + 0x6d2b79f5) >>> 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Bintang empat sudut (template Ramalan) */
export function Sparkle({ size, color, style }: { size: number; color: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden style={{ position: "absolute", ...style }}>
      <path d="M12 0C12 6.6 17.4 12 24 12C17.4 12 12 17.4 12 24C12 17.4 6.6 12 0 12C6.6 12 12 6.6 12 0Z" fill={color} />
    </svg>
  );
}
