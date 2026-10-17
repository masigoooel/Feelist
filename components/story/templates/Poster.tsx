import { moodShades } from "@/lib/moodColors";
import StoryFrame from "../StoryFrame";
import { DecoLayer, FitText, INK, StoryCTA, StoryLogo } from "../parts";
import type { StoryProps } from "../types";

/**
 * Titik halftone: grid jarak 24px, radius 6 di sudut (cx, cy) mengecil ke 1.5 di ujung terjauh.
 * Koordinat relatif terhadap kotak w×h.
 */
function Halftone({ w, h, corner, color, style }: { w: number; h: number; corner: [number, number]; color: string; style: React.CSSProperties }) {
  const dots: { x: number; y: number; r: number }[] = [];
  const far = Math.hypot(w, h);
  for (let y = 12; y < h; y += 24) {
    for (let x = 12; x < w; x += 24) {
      const d = Math.hypot(x - corner[0], y - corner[1]) / far;
      dots.push({ x, y, r: 6 - 4.5 * Math.min(1, d) });
    }
  }
  return (
    <svg width={w} height={h} style={{ position: "absolute", ...style }}>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={color} />
      ))}
    </svg>
  );
}

/** 2. "Poster": 5 judul lagu besar berselang warna */
export default function Poster({ playlist, mood }: StoryProps) {
  const { shade } = moodShades(mood.bg);
  const edition = `FEELIST · EDISI ${mood.name.toUpperCase()}`;

  return (
    <StoryFrame
      bg={mood.bg}
      decor={
        <DecoLayer>
          {/* Pita miring di belakang judul-judul lagu */}
          <div style={{ position: "absolute", left: -200, top: 760, width: 1500, height: 520, background: shade, transform: "rotate(-12deg)" }} />
          <Halftone w={380} h={200} corner={[380, 0]} color={mood.accent} style={{ right: 0, top: 0, opacity: 0.55 }} />
          <Halftone w={380} h={220} corner={[0, 220]} color="#FFFFFF" style={{ left: 0, bottom: 0, opacity: 0.35 }} />
          {/* Bingkai */}
          <div style={{ position: "absolute", inset: 40, border: "3px solid rgba(255,255,255,0.3)", borderRadius: 12 }} />
          {/* Tulisan vertikal di tepi kanan */}
          <div
            style={{
              position: "absolute",
              left: 1030,
              top: 960,
              transform: "rotate(90deg)",
              transformOrigin: "0 0",
              whiteSpace: "nowrap",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 8,
              color: mood.accentText,
            }}
          >
            {edition} · {edition}
          </div>
          {/* Lencana bulat */}
          <div
            style={{
              position: "absolute",
              right: 90,
              top: 360,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: mood.accent,
              color: INK,
              transform: "rotate(12deg)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            <span style={{ fontSize: 26, fontWeight: 700 }}>Edisi</span>
            <span style={{ fontSize: 46, fontWeight: 800, maxWidth: 190 }}>{mood.name}</span>
            <span style={{ fontSize: 22, fontWeight: 600 }}>{playlist.tracks.length} lagu</span>
          </div>
        </DecoLayer>
      }
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <StoryLogo accent={mood.accent} bg={mood.bg} />
        <span style={{ fontSize: 32, fontWeight: 700, color: mood.accentText }}>{mood.name}</span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
        {playlist.tracks.slice(0, 5).map((t, i) => (
          // Dua baris teratas berhenti sebelum lencana (x ≥ 770) supaya tidak tertimpa
          <div key={t.id} style={{ maxWidth: i < 2 ? 640 : undefined }}>
            <FitText
              lines={1}
              style={{
                fontSize: 100,
                fontWeight: 800,
                lineHeight: 0.95,
                letterSpacing: -4,
                color: i % 2 === 0 ? "#FFFFFF" : mood.accentText,
                paddingBottom: 6, // ruang ekor huruf (g, j, y)
              }}
            >
              {t.title}
            </FitText>
            <FitText lines={1} style={{ fontSize: 30, fontWeight: 600 }}>
              {t.artist}
            </FitText>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 30, fontWeight: 500 }}>Playlist buat kamu</p>
      <FitText lines={2} style={{ fontSize: 52, fontWeight: 800 }}>
        {playlist.playlistTitle}
      </FitText>
      <StoryCTA text="Bikin punyamu" accent={mood.accent} style={{ marginTop: 32 }} />
    </StoryFrame>
  );
}
