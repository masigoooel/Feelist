import { setlistNote } from "@/lib/storyCopyFallback";
import StoryFrame from "../StoryFrame";
import { DecoLayer, FitText, FONT, INK, INK_SOFT, StoryCTA, StoryLogo } from "../parts";
import type { StoryProps } from "../types";

const STAGE = "#19191D";
const RED = "#D7263D";
const TAPE = "rgba(196,196,190,0.82)";

/** Selotip abu-abu di sudut kertas */
function Tape({ style }: { style: React.CSSProperties }) {
  return <div style={{ position: "absolute", width: 150, height: 46, background: TAPE, ...style }} />;
}

/** 14. "Setlist": kertas setlist yang ditempel di lantai panggung, ditulis spidol */
export default function Setlist({ playlist, mood }: StoryProps) {
  const now = new Date();
  const soundcheck = `${String(now.getHours()).padStart(2, "0")}.${String(now.getMinutes()).padStart(2, "0")}`;
  const main = playlist.tracks.slice(0, 4);
  const encore = playlist.tracks[4];
  // Lagu yang dilingkari: lagu keberuntungan dari ramalan (kalau ada di 4 lagu utama), selain itu lagu ke-2
  const lucky = playlist.horoscope?.luckySongIndex ?? 1;
  const circled = lucky < main.length ? lucky : Math.min(1, main.length - 1);
  // Mood ceria: yang dicoret justru lagu sedih
  const crossed = playlist.mood === "bahagia" || playlist.mood === "semangat" ? "LAGU SEDIH" : "LAGU CERIA";
  const marker = { fontFamily: FONT.marker, fontWeight: 400 } as const;

  return (
    <StoryFrame
      bg={STAGE}
      background={`radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255,255,255,0.09), rgba(255,255,255,0) 70%), ${STAGE}`}
      decor={
        <DecoLayer>
          {/* Papan panggung */}
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1={0} y1={160 * i + 40} x2={1080} y2={160 * i + 10} stroke="rgba(255,255,255,0.05)" strokeWidth={3} />
            ))}
          </svg>
          {/* Pick gitar */}
          <svg viewBox="0 0 100 110" width={130} height={143} style={{ position: "absolute", left: 860, top: 1640, transform: "rotate(-24deg)" }}>
            <path d="M50 106 C 30 86, 4 52, 6 26 C 8 8, 28 2, 50 2 C 72 2, 92 8, 94 26 C 96 52, 70 86, 50 106 Z" fill={mood.accent} />
            <path d="M50 96 C 34 78, 14 50, 16 30 C 18 16, 32 11, 50 11" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={4} />
          </svg>
          {/* Kabel */}
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <path d="M-20 1700 C 200 1640, 300 1820, 520 1780 S 760 1660, 820 1900" fill="none" stroke="#0B0B0D" strokeWidth={18} strokeLinecap="round" />
          </svg>
        </DecoLayer>
      }
    >
      {/* Kertas setlist miring */}
      <div style={{ position: "relative", background: "#FFFFFF", color: INK, padding: "52px 60px 48px", transform: "rotate(-2deg)", boxShadow: "0 24px 50px rgba(0,0,0,0.45)" }}>
        <Tape style={{ left: -50, top: -12, transform: "rotate(-38deg)" }} />
        <Tape style={{ right: -50, top: -12, transform: "rotate(38deg)" }} />
        <Tape style={{ left: -50, bottom: -12, transform: "rotate(38deg)" }} />
        <Tape style={{ right: -50, bottom: -12, transform: "rotate(-38deg)" }} />
        {/* Bekas gelas */}
        <div style={{ position: "absolute", right: 40, bottom: 120, width: 210, height: 210, boxSizing: "border-box", borderRadius: "50%", border: "12px solid rgba(150,105,60,0.16)" }} />

        <div style={{ ...marker, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 20 }}>
          <span style={{ fontSize: 78, lineHeight: 1 }}>SETLIST</span>
          <span style={{ fontSize: 28, color: INK_SOFT, whiteSpace: "nowrap" }}>soundcheck: {soundcheck}</span>
        </div>
        <FitText lines={1} style={{ ...marker, marginTop: 8, fontSize: 36, color: INK_SOFT }}>
          {playlist.playlistTitle}
        </FitText>
        <div style={{ marginTop: 18, height: 5, background: INK, borderRadius: 3 }} />

        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 24 }}>
          {main.map((t, i) => (
            <div key={t.id} style={{ position: "relative" }}>
              {i === circled && (
                // Lingkaran spidol merah di sekeliling judul + catatannya (tidak menimpa teks)
                <svg width={800} height={140} style={{ position: "absolute", left: -34, top: -16, overflow: "visible" }}>
                  <path
                    d="M40 12 C 220 -4, 640 0, 760 16 C 822 28, 816 112, 700 122 C 480 134, 160 132, 40 116 C -14 106, -10 26, 70 6"
                    fill="none"
                    stroke={RED}
                    strokeWidth={5}
                    strokeLinecap="round"
                  />
                </svg>
              )}
              <FitText lines={1} style={{ ...marker, position: "relative", fontSize: 50, lineHeight: 1.15 }}>
                {i + 1}. {t.title}
              </FitText>
              <FitText lines={1} style={{ ...marker, position: "relative", marginTop: 2, marginLeft: 52, fontSize: 28, color: INK_SOFT }}>
                ↳ {setlistNote(playlist, t, i)}
              </FitText>
            </div>
          ))}
          {/* Lagu yang dicoret */}
          <div style={{ position: "relative", alignSelf: "flex-start" }}>
            <span style={{ ...marker, fontSize: 50, lineHeight: 1.15, color: INK_SOFT }}>{main.length + 1}. {crossed}</span>
            <div style={{ position: "absolute", left: -8, right: -12, top: "52%", height: 6, borderRadius: 3, background: INK, transform: "rotate(-3deg)" }} />
          </div>
        </div>

        {encore && (
          <div style={{ marginTop: 30, paddingTop: 22, borderTop: `4px dashed ${INK}` }}>
            <FitText lines={1} style={{ ...marker, fontSize: 46 }}>
              ENCORE: {encore.title}
            </FitText>
          </div>
        )}
        <FitText lines={2} style={{ ...marker, marginTop: 20, fontSize: 32, color: RED, transform: "rotate(-2deg)" }}>
          !! jangan di-skip, apa pun yang terjadi !!
        </FitText>
      </div>

      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <StoryLogo accent={mood.accent} bg={mood.bg} />
        <StoryCTA text="Bikin setlist-mu" accent={mood.accent} />
      </div>
    </StoryFrame>
  );
}
