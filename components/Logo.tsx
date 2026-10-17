// Logo feelist: tiga garis vertikal (tengah = warna aksen mood) + teks "feelist".
// `scale` untuk versi besar di kartu Story (ukuran dasar: ikon 32px, teks 22px).

type Props = {
  accent?: string;
  scale?: number;
};

/** Ikon tiga batang saja (mis. ilustrasi besar di tampilan kosong) */
export function LogoMark({ size, outer = "#FFFFFF", middle = "var(--mood-accent)" }: { size: number; outer?: string; middle?: string }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden>
      <path d="M66 80 L66 120" stroke={outer} strokeWidth="22" strokeLinecap="round" fill="none" />
      <path d="M100 50 L100 150" stroke={middle} strokeWidth="22" strokeLinecap="round" fill="none" />
      <path d="M134 68 L134 132" stroke={outer} strokeWidth="22" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default function Logo({ accent = "var(--mood-accent)", scale = 1 }: Props) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 * scale }}>
      <LogoMark size={32 * scale} middle={accent} />
      <span style={{ fontSize: 22 * scale, fontWeight: 700, letterSpacing: -0.8 * scale, color: "#FFFFFF" }}>
        feelist
      </span>
    </span>
  );
}
