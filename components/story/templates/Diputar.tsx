import { moodShades } from "@/lib/moodColors";
import StoryFrame from "../StoryFrame";
import { DecoLayer, FitText, INK, seededRandom, StoryCover, StoryLogo } from "../parts";
import type { StoryProps } from "../types";

const icon = { fill: "currentColor", "aria-hidden": true } as const;

/** 9. "Diputar": tampilan pemutar musik */
export default function Diputar({ playlist, mood }: StoryProps) {
  const [now, ...next] = playlist.tracks;
  const { deep } = moodShades(mood.bg);
  // Equalizer 32 batang, tinggi 60–200 (tetap untuk playlist yang sama)
  const rand = seededRandom(playlist.playlistTitle);
  const bars = Array.from({ length: 32 }, () => 60 + Math.round(rand() * 140));
  const ring = (size: number) => ({
    position: "absolute" as const,
    left: (600 - size) / 2,
    top: (600 - size) / 2,
    width: size,
    height: size,
    boxSizing: "border-box" as const,
    borderRadius: "50%",
    border: "3px solid rgba(255,255,255,0.08)",
  });

  return (
    <StoryFrame
      bg={mood.bg}
      decor={
        <DecoLayer>
          {/* Piringan hitam di belakang cover */}
          <div style={{ position: "absolute", left: 470, top: 400, width: 600, height: 600, borderRadius: "50%", background: deep }}>
            <div style={ring(470)} />
            <div style={ring(340)} />
            <div
              style={{
                position: "absolute",
                left: 205,
                top: 205,
                width: 190,
                height: 190,
                borderRadius: "50%",
                background: mood.accent,
                display: "grid",
                placeItems: "center",
              }}
            >
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: mood.bg }} />
            </div>
          </div>
          {/* Equalizer di pita bawah */}
          <div style={{ position: "absolute", left: 33, bottom: 40, display: "flex", alignItems: "flex-end", gap: 10 }}>
            {bars.map((h, i) => (
              <div key={i} style={{ width: 22, height: h, borderRadius: 11, background: `rgba(255,255,255,${i % 2 === 0 ? 0.14 : 0.18})` }} />
            ))}
          </div>
        </DecoLayer>
      }
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32 }}>
        <StoryLogo accent={mood.accent} bg={mood.bg} />
        <FitText as="span" lines={2} style={{ fontSize: 28, fontWeight: 600, textAlign: "right", maxWidth: 440 }}>
          Diputar dari {playlist.playlistTitle}
        </FitText>
      </div>

      {now && (
        <>
          {/* Satu-satunya bayangan di kartu */}
          <StoryCover
            src={now.cover}
            size={620}
            radius={56}
            bg={mood.bg}
            style={{ marginTop: 40, alignSelf: "center", boxShadow: "0 40px 80px rgba(10,14,50,0.45)" }}
          />
          <FitText lines={1} style={{ marginTop: 40, fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>{now.title}</FitText>
          <p style={{ fontSize: 38, fontWeight: 500 }}>{now.artist}</p>

          <div style={{ marginTop: 28, height: 12, borderRadius: 6, background: "rgb(255 255 255 / 0.25)" }}>
            <div style={{ width: "42%", height: "100%", borderRadius: 6, background: mood.accent }} />
          </div>

          <div style={{ marginTop: 28, display: "flex", alignItems: "center", justifyContent: "center", gap: 80 }}>
            <svg viewBox="0 0 24 24" width={64} height={64} {...icon}>
              <path d="M6 5h2v14H6zM20 5v14L9 12z" />
            </svg>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: mood.accent,
                color: INK,
                display: "grid",
                placeItems: "center",
              }}
            >
              <svg viewBox="0 0 24 24" width={60} height={60} {...icon}>
                <rect x="6" y="4.5" width="4" height="15" rx="1.2" />
                <rect x="14" y="4.5" width="4" height="15" rx="1.2" />
              </svg>
            </div>
            <svg viewBox="0 0 24 24" width={64} height={64} {...icon}>
              <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
            </svg>
          </div>
        </>
      )}

      <div style={{ marginTop: "auto" }}>
        <p style={{ fontSize: 26, fontWeight: 700, color: mood.accentText }}>Selanjutnya</p>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
          {next.slice(0, 2).map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <StoryCover src={t.cover} size={64} radius={16} bg={mood.bg} />
              <FitText lines={1} style={{ fontSize: 30, minWidth: 0 }}>
                <span style={{ fontWeight: 700 }}>{t.title}</span>
                <span style={{ fontWeight: 500 }}> — {t.artist}</span>
              </FitText>
            </div>
          ))}
        </div>
      </div>
    </StoryFrame>
  );
}
