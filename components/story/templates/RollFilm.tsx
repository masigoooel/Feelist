import StoryFrame from "../StoryFrame";
import { DecoLayer, FitText, FONT, Grain, StoryCover, StoryLogo } from "../parts";
import type { StoryProps } from "../types";

const DARK = "#121212";
const STRIP = "#2A2622";
const ORANGE = "#FF8A3D";
const CREAM = "#F5EFE4";

/** Satu baris lubang sproket di tepi pita film */
function Sprockets() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0 18px" }}>
      {Array.from({ length: 21 }, (_, i) => (
        <div key={i} style={{ width: 30, height: 22, borderRadius: 5, background: DARK }} />
      ))}
    </div>
  );
}

/** 11. "Roll film": pita negatif berisi 3 lagu, cap tanggal oranye menyala */
export default function RollFilm({ playlist, mood }: StoryProps) {
  const now = new Date();
  const two = (n: number) => String(n).padStart(2, "0");
  const stamp = `'${two(now.getFullYear() % 100)} ${two(now.getMonth() + 1)} ${two(now.getDate())}`;
  const frames = playlist.tracks.slice(0, 3);
  const exposures = Math.min(5, playlist.tracks.length);

  return (
    <StoryFrame
      bg={DARK}
      decor={
        <DecoLayer>
          {/* Bocoran cahaya oranye di sudut */}
          <div
            style={{
              position: "absolute",
              right: -420,
              top: -460,
              width: 1100,
              height: 1100,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,138,61,0.55) 0%, rgba(255,96,40,0.22) 38%, rgba(255,96,40,0) 68%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -480,
              top: 1460,
              width: 900,
              height: 900,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,110,50,0.3) 0%, rgba(255,110,50,0) 65%)",
            }}
          />
          <Grain opacity={0.16} blend="screen" />
        </DecoLayer>
      }
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
        <StoryLogo accent={mood.accent} bg={mood.bg} />
        <FitText lines={1} style={{ minWidth: 0, fontFamily: FONT.mono, fontSize: 24, letterSpacing: 2, color: CREAM, textAlign: "right" }}>
          ISO 400 · {exposures} EXP · {mood.name.toUpperCase()}
        </FitText>
      </div>

      <FitText
        lines={2}
        style={{ marginTop: 64, fontFamily: FONT.serif, fontStyle: "italic", fontSize: 104, lineHeight: 1.0, color: CREAM, paddingBottom: 8 }}
      >
        {playlist.playlistTitle}
      </FitText>
      {playlist.description && (
        <FitText lines={2} style={{ marginTop: 20, fontFamily: FONT.serif, fontSize: 40, lineHeight: 1.2, color: "#D6CCBD" }}>
          {playlist.description}
        </FitText>
      )}

      {/* Pita film miring, keluar dari tepi kartu */}
      <div style={{ marginTop: 64, marginLeft: -140, marginRight: -140, transform: "rotate(-2deg)" }}>
        <div style={{ background: STRIP, padding: "16px 0", boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>
          <Sprockets />
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 160px 0", fontFamily: FONT.mono, fontSize: 18, color: ORANGE }}>
            <span>FEELIST 400</span>
            <span>▸ {mood.name.toUpperCase()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 30, padding: "14px 0 18px" }}>
            {frames.map((t, i) => (
              <div key={t.id} style={{ width: 270 }}>
                <StoryCover src={t.cover} size={270} radius={6} bg={mood.bg} />
                <p style={{ marginTop: 12, fontFamily: FONT.mono, fontSize: 18, color: ORANGE }}>{i + 1}A</p>
                <FitText lines={2} style={{ marginTop: 2, fontFamily: FONT.mono, fontWeight: 700, fontSize: 22, lineHeight: 1.25, color: CREAM }}>
                  {t.title}
                </FitText>
              </div>
            ))}
          </div>
          <Sprockets />
        </div>
      </div>

      {/* Cap tanggal ala kamera saku */}
      <p
        style={{
          marginTop: 40,
          alignSelf: "flex-end",
          fontFamily: FONT.mono,
          fontWeight: 700,
          fontSize: 46,
          letterSpacing: 4,
          color: ORANGE,
          textShadow: "0 0 10px rgba(255,138,61,0.85), 0 0 26px rgba(255,100,40,0.55)",
          transform: "rotate(-2deg)",
          whiteSpace: "nowrap",
        }}
      >
        {stamp}
      </p>

      {/* Sisa rol: lagu 4–5 */}
      {playlist.tracks.length > 3 && (
        <div style={{ marginTop: 28, fontFamily: FONT.mono, color: CREAM }}>
          <p style={{ fontSize: 22, letterSpacing: 3, color: ORANGE }}>SISA ROL</p>
          {playlist.tracks.slice(3, 5).map((t, i) => (
            <FitText key={t.id} lines={1} style={{ marginTop: 10, fontSize: 26 }}>
              <span style={{ color: ORANGE }}>{i + 4}A </span>
              <span style={{ fontWeight: 700 }}>{t.title}</span>
              <span> — {t.artist}</span>
            </FitText>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: "auto",
          alignSelf: "center",
          height: 92,
          padding: "0 44px",
          borderRadius: 46,
          border: `3px solid ${CREAM}`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          color: CREAM,
          fontSize: 32,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        cuci cetak rasamu di feelist
      </div>
    </StoryFrame>
  );
}
