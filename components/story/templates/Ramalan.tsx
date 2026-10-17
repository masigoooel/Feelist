import { useId } from "react";
import { moodShades } from "@/lib/moodColors";
import { storyText } from "@/lib/storyCopyFallback";
import StoryFrame from "../StoryFrame";
import { DecoLayer, FitText, moodNameSize, seededRandom, Sparkle, StoryCTA, StoryLogo } from "../parts";
import type { StoryProps } from "../types";

// Rasi bintang di pita bawah (6 titik)
const CONSTELLATION: [number, number][] = [
  [140, 1700],
  [300, 1652],
  [450, 1732],
  [620, 1680],
  [790, 1782],
  [940, 1700],
];

/** 8. "Ramalan": ramalan musik hari ini (diisi AI lewat field horoscope) */
export default function Ramalan({ playlist, mood }: StoryProps) {
  const sh = moodShades(mood.bg);
  const moonMask = `bulan-${useId().replace(/:/g, "")}`;
  const h = playlist.horoscope;
  const lucky = playlist.tracks[h?.luckySongIndex ?? 0] ?? playlist.tracks[0];
  const boxes = [
    { label: "Suasana hati", value: h?.mood || playlist.description },
    { label: "Lagu keberuntungan", value: lucky ? `${lucky.title} — ${lucky.artist}` : "" },
    { label: "Saran", value: storyText(playlist).advice },
  ];

  // 70 bintang kecil; posisinya dari seed playlist supaya sama di setiap ekspor
  const rand = seededRandom(playlist.playlistTitle + (playlist.tracks[0]?.id ?? ""));
  const stars = Array.from({ length: 70 }, () => ({
    x: Math.round(rand() * 1080),
    y: Math.round(rand() * 1920),
    size: 4 + Math.round(rand() * 4),
    opacity: 0.35 + rand() * 0.55,
  }));

  return (
    <StoryFrame
      bg={mood.bg}
      background={`linear-gradient(180deg, ${sh.deep} 0%, ${sh.dark} 55%, ${mood.bg} 100%)`}
      decor={
        <DecoLayer>
          {stars.map((s, i) => (
            <div
              key={i}
              style={{ position: "absolute", left: s.x, top: s.y, width: s.size, height: s.size, borderRadius: "50%", background: "#FFFFFF", opacity: s.opacity }}
            />
          ))}
          {/* Bulan sabit */}
          <svg width={170} height={170} viewBox="0 0 170 170" style={{ position: "absolute", right: 120, top: 70 }}>
            <mask id={moonMask}>
              <rect width={170} height={170} fill="#FFFFFF" />
              <circle cx={118} cy={58} r={72} fill="#000000" />
            </mask>
            <circle cx={85} cy={85} r={85} fill={mood.accent} mask={`url(#${moonMask})`} />
          </svg>
          {/* Orbit di belakang nama mood */}
          <div
            style={{
              position: "absolute",
              left: 90,
              top: 356,
              width: 900,
              height: 360,
              boxSizing: "border-box",
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.18)",
              transform: "rotate(-12deg)",
            }}
          />
          {/* Rasi bintang */}
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <polyline points={CONSTELLATION.map((p) => p.join(",")).join(" ")} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={3} />
            {CONSTELLATION.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={9} fill="#FFFFFF" />
            ))}
          </svg>
          <Sparkle size={120} color={mood.accent} style={{ top: 300, right: 110 }} />
          <Sparkle size={56} color="#FFFFFF" style={{ top: 470, right: 300 }} />
          <Sparkle size={80} color="rgb(255 255 255 / 0.4)" style={{ bottom: 420, right: 120 }} />
        </DecoLayer>
      }
    >
      <StoryLogo accent={mood.accent} bg={mood.bg} />
      <p style={{ marginTop: 64, fontSize: 40, fontWeight: 600 }}>Ramalan musik hari ini</p>
      <p
        style={{
          // 220px sesuai desain, diperkecil untuk nama mood yang panjang supaya tidak keluar kartu
          fontSize: moodNameSize(mood.name, 220),
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: -10,
          color: mood.accentText,
        }}
      >
        {mood.name}
      </p>

      <div style={{ marginTop: 56, display: "flex", flexDirection: "column", gap: 24 }}>
        {boxes.map((b) => (
          <div key={b.label} style={{ border: "3px solid rgb(255 255 255 / 0.35)", borderRadius: 32, padding: "28px 34px" }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: mood.accentText }}>{b.label}</p>
            <FitText lines={2} style={{ marginTop: 8, fontSize: 40, fontWeight: 700, lineHeight: 1.25 }}>
              {b.value}
            </FitText>
          </div>
        ))}
      </div>

      <StoryCTA text="Cek ramalanmu" accent={mood.accent} style={{ marginTop: "auto", alignSelf: "center" }} />
    </StoryFrame>
  );
}
