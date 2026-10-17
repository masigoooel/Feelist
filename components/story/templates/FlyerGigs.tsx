import { readableOnPaper } from "@/lib/moodColors";
import StoryFrame from "../StoryFrame";
import { DecoLayer, FitText, FONT, Grain, INK, StoryLogo } from "../parts";
import type { StoryProps } from "../types";

const PAPER = "#F3EFE6";
const PINK = "#FF4F8B";

/** 12. "Flyer gigs": selebaran konser gaya risograph */
export default function FlyerGigs({ playlist, mood }: StoryProps) {
  // Warna mood untuk teks di kertas terang: digelapkan seperlunya supaya kontras ≥ 4.5:1
  // (target 5.2 karena grain multiply sedikit menggelapkan kertas)
  const moodInk = readableOnPaper(mood.bg, PAPER, 5.2);
  const name = mood.name.toUpperCase();
  const nameSize = Math.min(170, 880 / (0.74 * Math.max(name.length, 1)));
  const [head, ...rest] = playlist.tracks.slice(0, 5);
  const riso = { position: "absolute", mixBlendMode: "multiply" } as const;
  const info = [
    { label: "LOKASI", value: "Kamar sendiri" },
    { label: "JAM", value: "21.00 – puas" },
    { label: "HTM", value: "1 curhat" },
  ];

  return (
    <StoryFrame
      bg={PAPER}
      background={PAPER}
      decor={
        <DecoLayer>
          {/* Bentuk risograph: dua warna tinta yang saling tumpuk (multiply) */}
          <div style={{ ...riso, right: -170, top: -230, width: 560, height: 560, borderRadius: "50%", background: mood.bg, opacity: 0.9 }} />
          <div style={{ ...riso, right: 80, top: 90, width: 150, height: 150, borderRadius: "50%", background: PINK }} />
          <div style={{ ...riso, left: -280, top: 820, width: 700, height: 700, borderRadius: "50%", background: PINK, opacity: 0.85 }} />
          <div style={{ ...riso, left: -100, top: 1640, width: 1400, height: 96, background: PINK, transform: "rotate(-6deg)" }} />
          <div style={{ ...riso, left: -200, top: 1730, width: 1500, height: 110, background: mood.bg, transform: "rotate(-6deg)" }} />
          <div style={{ ...riso, left: -200, top: 1840, width: 1500, height: 40, background: PINK, transform: "rotate(-6deg)" }} />
          <Grain opacity={0.3} blend="multiply" />
        </DecoLayer>
      }
    >
      <div style={{ color: INK }}>
        <StoryLogo accent={mood.accent} bg={mood.bg} dark />
        <p style={{ marginTop: 10, fontFamily: FONT.mono, fontSize: 24, letterSpacing: 3 }}>MEMPERSEMBAHKAN</p>
      </div>

      {/* Judul dua lapis: bayangan pink bergeser 8px + warna mood */}
      <div style={{ marginTop: 34, fontWeight: 800, lineHeight: 0.92, letterSpacing: -4, color: moodInk, textShadow: `8px 8px 0 ${PINK}` }}>
        <p style={{ fontSize: 170, whiteSpace: "nowrap" }}>MALAM</p>
        <p style={{ fontSize: nameSize, whiteSpace: "nowrap" }}>{name}</p>
      </div>

      <FitText lines={2} style={{ marginTop: 34, fontSize: 42, fontWeight: 700, lineHeight: 1.15, color: INK }}>
        bersama {playlist.playlistTitle}
      </FitText>

      {/* Lineup ala festival: lagu pertama paling besar */}
      <div style={{ marginTop: 40, textAlign: "center", color: INK }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontFamily: FONT.mono, fontSize: 24, letterSpacing: 6 }}>
          <div style={{ flex: 1, height: 3, background: INK }} />
          LINEUP
          <div style={{ flex: 1, height: 3, background: INK }} />
        </div>
        {head && (
          <>
            <FitText lines={2} style={{ marginTop: 22, fontSize: 76, fontWeight: 800, lineHeight: 1.0, letterSpacing: -2, textTransform: "uppercase" }}>
              {head.title}
            </FitText>
            <FitText lines={1} style={{ marginTop: 6, fontSize: 28, fontWeight: 500 }}>
              {head.artist}
            </FitText>
          </>
        )}
        {[rest.slice(0, 2), rest.slice(2, 4)].map((row, ri) =>
          row.length ? (
            <FitText key={ri} lines={1} style={{ marginTop: ri === 0 ? 22 : 12, fontSize: ri === 0 ? 46 : 36, fontWeight: 800, textTransform: "uppercase" }}>
              {row.map((t, i) => (
                <span key={t.id}>
                  {i > 0 && <span> ✦ </span>}
                  {t.title}
                </span>
              ))}
            </FitText>
          ) : null,
        )}
      </div>

      <div style={{ marginTop: 44, borderTop: `4px solid ${INK}`, paddingTop: 22, display: "flex", gap: 32, color: INK }}>
        {info.map((x) => (
          <div key={x.label} style={{ flex: x.label === "LOKASI" ? 1.3 : 1, minWidth: 0 }}>
            <p style={{ fontFamily: FONT.mono, fontSize: 22, letterSpacing: 3 }}>{x.label}</p>
            <p style={{ marginTop: 4, fontSize: 34, fontWeight: 800, whiteSpace: "nowrap" }}>{x.value}</p>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "auto",
          marginBottom: 14, // ruang untuk kemiringan -2°
          alignSelf: "flex-start",
          height: 92,
          padding: "0 44px",
          display: "flex",
          alignItems: "center",
          background: PINK,
          color: INK,
          fontSize: 34,
          fontWeight: 800,
          whiteSpace: "nowrap",
          transform: "rotate(-2deg)",
        }}
      >
        amankan tempatmu di feelist
      </div>
    </StoryFrame>
  );
}
