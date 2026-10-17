import { mix } from "@/lib/color";
import { moodShades } from "@/lib/moodColors";
import StoryFrame from "../StoryFrame";
import { DecoLayer, FitText, INK, INK_SOFT, StoryCTA, StoryLogo } from "../parts";
import type { StoryProps } from "../types";

/** 7. "Mixtape": kaset dengan label judul */
export default function Mixtape({ playlist, mood }: StoryProps) {
  const cassette = mix(mood.bg, "#000000", 0.3); // bg mood digelapkan 30%
  const { deep } = moodShades(mood.bg);
  const now = new Date();
  const recorded = `Direkam ${now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}, jam ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const TAPE = "M150 900 C 40 980, 120 1060, 50 1140 S 110 1300, 40 1400 S 140 1560, 70 1700 S 160 1840, 300 1900";

  const reel = (
    <div style={{ width: 150, height: 150, borderRadius: "50%", background: mood.accent, display: "grid", placeItems: "center" }}>
      <div style={{ width: 70, height: 70, borderRadius: "50%", background: cassette }} />
    </div>
  );

  return (
    <StoryFrame
      bg={mood.bg}
      decor={
        <DecoLayer>
          {/* Garis retro di bawah daftar lagu */}
          {[
            { top: 1480, color: mood.accent },
            { top: 1550, color: "#FFC2D6" },
            { top: 1620, color: "#FFD84D" },
          ].map((s) => (
            <div
              key={s.top}
              style={{ position: "absolute", left: -310, top: s.top, width: 1700, height: 54, background: s.color, opacity: 0.9, transform: "rotate(-18deg)" }}
            />
          ))}
          {/* Pita kaset terurai dari sudut kiri bawah kaset */}
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <path d={TAPE} fill="none" stroke={deep} strokeWidth={16} strokeLinecap="round" />
            <path d={TAPE} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={4} strokeLinecap="round" />
          </svg>
          {/* Gulungan samar di pojok kanan bawah */}
          <div style={{ position: "absolute", left: 770, top: 1610, width: 420, height: 420, boxSizing: "border-box", borderRadius: "50%", border: "30px solid rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", left: 890, top: 1730, width: 180, height: 180, boxSizing: "border-box", borderRadius: "50%", border: "18px dashed rgba(255,255,255,0.14)" }} />
          {/* Label selotip di pita atas */}
          <div
            style={{
              position: "absolute",
              left: 330,
              top: 140,
              padding: "10px 24px",
              background: "rgba(255,255,255,0.75)",
              color: INK,
              fontSize: 30,
              fontWeight: 700,
              whiteSpace: "nowrap",
              transform: "rotate(3deg)",
            }}
          >
            {recorded}
          </div>
        </DecoLayer>
      }
    >
      <div style={{ alignSelf: "center" }}>
        <StoryLogo accent={mood.accent} bg={mood.bg} />
      </div>

      <div
        style={{
          marginTop: 56,
          width: 888,
          height: 560,
          boxSizing: "border-box",
          borderRadius: 48,
          background: cassette,
          transform: "rotate(-4deg)",
          padding: 40,
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        <div style={{ background: "#FFFFFF", color: INK, borderRadius: 24, padding: "24px 36px" }}>
          <p style={{ fontSize: 26, fontWeight: 700, color: INK_SOFT }}>Sisi A, {mood.name}</p>
          <FitText lines={1} style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.15 }}>
            {playlist.playlistTitle}
          </FitText>
        </div>
        <div
          style={{
            flex: 1,
            borderRadius: 80,
            background: "rgb(255 255 255 / 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 48px",
          }}
        >
          {reel}
          <div style={{ width: 220, height: 8, borderRadius: 4, background: "rgb(255 255 255 / 0.4)" }} />
          {reel}
        </div>
      </div>

      <div style={{ marginTop: 80, display: "flex", flexDirection: "column", gap: 16 }}>
        {playlist.tracks.slice(0, 5).map((t, i) => (
          <FitText key={t.id} lines={1} style={{ fontSize: 34 }}>
            <span style={{ fontWeight: 800, color: mood.accentText, marginRight: 24 }}>{i + 1}</span>
            <span style={{ fontWeight: 700 }}>{t.title}</span>
            <span style={{ fontWeight: 500 }}> — {t.artist}</span>
          </FitText>
        ))}
      </div>

      <StoryCTA text="Rekam mixtape-mu" accent={mood.accent} style={{ marginTop: "auto", alignSelf: "center" }} />
    </StoryFrame>
  );
}
