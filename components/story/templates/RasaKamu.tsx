import StoryFrame from "../StoryFrame";
import { DecoLayer, DecorPills, FitText, INK, moodNameSize, StoryCover, StoryCTA, StoryLogo } from "../parts";
import type { StoryProps } from "../types";

// Confetti: [x, y, rotasi] di pita atas (y 60–200) dan bawah (y 1660–1820)
const CONFETTI: [number, number, number][] = [
  [80, 92, -40],
  [236, 168, 25],
  [402, 70, -15],
  [566, 150, 45],
  [724, 96, -30],
  [884, 182, 10],
  [132, 1702, 35],
  [330, 1790, -25],
  [522, 1676, 15],
  [702, 1768, -40],
  [902, 1712, 30],
];

/** Pin lokasi 56px; ujung pin (bawah tengah) ditempatkan di titik (x, y) */
function Pin({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <svg viewBox="0 0 24 24" width={56} height={56} style={{ position: "absolute", left: x - 28, top: y - 51 }}>
      <path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill={color} />
    </svg>
  );
}

const sign = { position: "absolute", borderRadius: 14, padding: "12px 24px", fontSize: 28, fontWeight: 800, color: INK } as const;

/** 1. "Rasa kamu" (gaya Wrapped) */
export default function RasaKamu({ playlist, mood }: StoryProps) {
  const [first, ...rest] = playlist.tracks;
  // Judul panjang (2 baris di stiker) → deskripsi cukup 1 baris supaya muat di area aman
  const longTitle = playlist.playlistTitle.length > 20;
  const travel = playlist.mood === "perjalanan";
  const confettiColors = ["#FFFFFF", mood.accent, "#FFC2D6"];

  return (
    <StoryFrame
      bg={mood.bg}
      decor={
        <DecoLayer>
          <DecorPills position={{ top: -120, right: -40 }} align="flex-start" bg={mood.bg} />
          {/* Lingkaran garis besar */}
          <div
            style={{
              position: "absolute",
              left: -260,
              top: 160,
              width: 760,
              height: 760,
              borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.22)",
            }}
          />
          {travel ? (
            // Varian Perjalanan: rute putus-putus dari "Stasiun Rindu" ke "Rumah"
            <>
              <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
                <path
                  d="M980 40 C 1060 320, 900 520, 1010 800 S 930 1300, 1000 1560 S 900 1820, 760 1890"
                  fill="none"
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth={8}
                  strokeDasharray="4 26"
                  strokeLinecap="round"
                />
              </svg>
              <Pin x={980} y={40} color={mood.accent} />
              <Pin x={760} y={1890} color="#FFFFFF" />
              <div style={{ ...sign, left: 640, top: 120, transform: "rotate(-4deg)", background: mood.accent }}>Stasiun Rindu</div>
              <div style={{ ...sign, left: 470, top: 1760, transform: "rotate(3deg)", background: "#FFFFFF" }}>Rumah</div>
            </>
          ) : (
            CONFETTI.map(([x, y, r], i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: 34,
                  height: 14,
                  borderRadius: 4,
                  background: confettiColors[i % 3],
                  transform: `rotate(${r}deg)`,
                }}
              />
            ))
          )}
        </DecoLayer>
      }
    >
      <p style={{ fontSize: 36, fontWeight: 600 }}>Rasa kamu hari ini</p>
      <p
        style={{
          fontSize: moodNameSize(mood.name, 250),
          fontWeight: 800,
          lineHeight: 0.88,
          letterSpacing: "-0.05em",
          color: mood.accentText,
        }}
      >
        {mood.name}
      </p>

      {/* Stiker judul playlist */}
      <FitText
        as="div"
        lines={2}
        style={{
          marginTop: 44,
          alignSelf: "flex-start",
          maxWidth: "100%",
          background: "#FFFFFF",
          color: INK,
          borderRadius: 28,
          padding: "24px 40px",
          fontSize: 64,
          fontWeight: 800,
          lineHeight: 1.15,
          transform: "rotate(-3deg)",
        }}
      >
        {playlist.playlistTitle}
      </FitText>

      {playlist.description && (
        <FitText lines={longTitle ? 1 : 2} style={{ marginTop: 36, fontSize: 38, fontWeight: 500 }}>
          {playlist.description}
        </FitText>
      )}

      {/* Lagu unggulan */}
      {first && (
        <div style={{ marginTop: 56, display: "flex", alignItems: "center", gap: 40 }}>
          <StoryCover src={first.cover} size={240} radius={36} bg={mood.bg} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 30, fontWeight: 700, color: mood.accentText }}>Paling kamu banget</p>
            <FitText lines={2} style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1 }}>
              {first.title}
            </FitText>
            <p style={{ fontSize: 36, fontWeight: 500 }}>{first.artist}</p>
          </div>
        </div>
      )}

      {/* Lagu 2–5 */}
      <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 16 }}>
        {rest.slice(0, 4).map((t, i) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <StoryCover src={t.cover} size={60} radius={16} bg={mood.bg} />
            <span style={{ fontSize: 32, fontWeight: 800, color: mood.accentText }}>{i + 2}</span>
            <FitText lines={1} style={{ fontSize: 32, minWidth: 0 }}>
              <span style={{ fontWeight: 700 }}>{t.title}</span>
              <span style={{ fontWeight: 500 }}> — {t.artist}</span>
            </FitText>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <StoryLogo accent={mood.accent} bg={mood.bg} />
        <StoryCTA text="Bikin punyamu" accent={mood.accent} />
      </div>
    </StoryFrame>
  );
}
