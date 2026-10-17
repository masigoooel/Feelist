import type { CSSProperties, ReactNode } from "react";
import { NEON, NEON_FONT, neonBox, neonText } from "@/lib/recap/themes/neonMalam";

/** Pengacak tetap supaya posisi hujan sama di setiap render */
function seeded(seed: number) {
  let h = seed;
  return () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return h / 4294967296;
  };
}
const rand = seeded(10);
const DROPS = Array.from({ length: 44 }, () => ({
  left: rand() * 390,
  height: 40 + rand() * 70,
  duration: 0.9 + rand() * 1.4,
  delay: -rand() * 2.4,
  color: rand() > 0.5 ? NEON.cyan : NEON.pink,
  opacity: 0.25 + rand() * 0.45,
  y: rand() * 800, // posisi saat animasi mati (sampul statis / reduced motion)
}));
const LASERS = [
  { left: 40, angle: 18, color: NEON.pink, delay: 0 },
  { left: 140, angle: 6, color: NEON.cyan, delay: 0.8 },
  { left: 250, angle: -6, color: NEON.pink, delay: 1.6 },
  { left: 350, angle: -18, color: NEON.cyan, delay: 2.4 },
];

/** Latar: hujan neon, 4 sinar laser dari bawah, cahaya pink di lantai, scanline tipis */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ background: NEON.bg }}>
      {LASERS.map((l, i) => (
        <span
          key={i}
          className="nm-laser"
          style={{
            left: l.left,
            background: `linear-gradient(to top, ${l.color}, transparent 85%)`,
            transform: `rotate(${l.angle}deg)`,
            animationDelay: `${l.delay}s`,
          }}
        />
      ))}
      {DROPS.map((d, i) => (
        <span
          key={i}
          className="nm-drop"
          style={{
            left: d.left,
            height: d.height,
            opacity: d.opacity,
            transform: `translateY(${d.y}px)`,
            background: `linear-gradient(to bottom, transparent, ${d.color})`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
      {/* Cahaya pink di lantai */}
      <div className="absolute inset-x-[-40px] bottom-[-120px] h-[300px] rounded-[50%]" style={{ background: "radial-gradient(closest-side, rgb(255 61 242 / 0.45), transparent)" }} />
      {/* Scanline */}
      <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.035) 0 1px, transparent 1px 3px)" }} />
    </div>
  );
}

/** Kilatan pink saat slide masuk */
export function Enter() {
  return <div aria-hidden className="nm-flash" />;
}

/** Satu baris teks yang naik dari balik mask */
export function Rise({ children, delay = 0, style, as: Tag = "p" }: { children: ReactNode; delay?: number; style?: CSSProperties; as?: "p" | "h2" | "div" | "span" }) {
  return (
    <Tag className="nm-mask m-0" style={style}>
      <span className="nm-rise" style={{ animationDelay: `${delay}s` }}>
        {children}
      </span>
    </Tag>
  );
}

/** Label kecil di atas slide (mono, cyan) */
export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 text-[12px] font-bold uppercase tracking-[3px]" style={{ fontFamily: NEON_FONT.mono, ...neonText(NEON.cyan) }}>
      {children}
    </p>
  );
}

/** Tag neon; `lit` = menyala, selain itu redup (tanpa cahaya, teks tetap terbaca) */
export function Tag({ children, color, lit = true, delay = 0 }: { children: ReactNode; color: string; lit?: boolean; delay?: number }) {
  return (
    <span
      className="nm-fade-up inline-flex h-8 items-center rounded-full px-3 text-[13px] font-bold"
      style={{
        fontFamily: NEON_FONT.mono,
        animationDelay: `${delay}s`,
        ...(lit ? { ...neonBox(color, 0.6), color } : { border: "2px solid rgb(255 255 255 / 0.22)", color: "rgb(255 255 255 / 0.6)" }),
      }}
    >
      {children}
    </span>
  );
}

/** Tata letak dasar slide di kanvas 390×844 (di bawah progress & tombol tutup) */
export function SlideBody({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return (
    <div className={`relative flex h-full flex-col px-6 pb-8 pt-[84px] text-white ${center ? "justify-center" : ""}`} style={{ fontFamily: NEON_FONT.sans }}>
      {children}
    </div>
  );
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
