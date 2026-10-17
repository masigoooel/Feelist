import { moodShades } from "@/lib/moodColors";
import StoryFrame from "../StoryFrame";
import { DecoLayer, FitText, FONT, INK, seededRandom, StoryCover } from "../parts";
import type { StoryProps } from "../types";

const COVER = 576; // sampul persegi di dalam case
const CASE_W = 16 + 48 + COVER + 16; // kaca 16 + punggung 48 + sampul + kaca 16
const CASE_H = 16 + COVER + 16;
const DISC = 588;

/** 15. "CD": jewel case dengan piringan pelangi yang mengintip */
export default function CD({ playlist, mood }: StoryProps) {
  const sh = moodShades(mood.bg);
  const year = new Date().getFullYear();
  const first = playlist.tracks[0];
  const rand = seededRandom(playlist.playlistTitle + (first?.id ?? ""));
  const bars = Array.from({ length: 34 }, () => 2 + Math.floor(rand() * 4) * 2);
  const digits = Array.from({ length: 12 }, () => Math.floor(rand() * 10)).join("");

  return (
    <StoryFrame
      bg={mood.bg}
      background={`linear-gradient(165deg, ${sh.light} 0%, ${mood.bg} 38%, ${sh.dark} 100%)`}
      decor={
        <DecoLayer>
          <div style={{ position: "absolute", left: -220, top: 1380, width: 760, height: 760, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        </DecoLayer>
      }
    >
      <div style={{ position: "relative", height: CASE_H }}>
        {/* Piringan CD mengintip dari kanan case */}
        <div
          style={{
            position: "absolute",
            left: 888 - DISC,
            top: (CASE_H - DISC) / 2,
            width: DISC,
            height: DISC,
            borderRadius: "50%",
            background:
              "repeating-radial-gradient(circle, rgba(255,255,255,0.1) 0 2px, rgba(255,255,255,0) 2px 7px), conic-gradient(from 20deg, #FFB3C7, #FFE29A, #B8F0C8, #A9D8FF, #D7B8FF, #FFB3C7, #FFE29A, #A9D8FF, #FFB3C7)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div style={{ width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.55)", display: "grid", placeItems: "center" }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: sh.dark }} />
          </div>
        </div>

        {/* Jewel case */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: CASE_W,
            height: CASE_H,
            boxSizing: "border-box",
            padding: 16,
            borderRadius: 10,
            background: "rgba(255,255,255,0.22)",
            border: "2px solid rgba(255,255,255,0.55)",
            boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
            display: "flex",
          }}
        >
          <div
            style={{
              width: 48,
              flexShrink: 0,
              background: "repeating-linear-gradient(180deg, #1C1A26 0 6px, #3A3746 6px 10px)",
              borderRadius: "4px 0 0 4px",
            }}
          />
          {first ? <StoryCover src={first.cover} size={COVER - 4} radius={0} bg={mood.bg} /> : <div style={{ width: COVER, background: sh.deep }} />}
          {/* Pantulan kaca */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 10,
              background:
                "linear-gradient(115deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.06) 32%, rgba(255,255,255,0) 33%, rgba(255,255,255,0) 62%, rgba(255,255,255,0.14) 63%, rgba(255,255,255,0) 78%)",
            }}
          />
        </div>

        {/* Stiker kuning */}
        {first && (
          <div
            style={{
              position: "absolute",
              left: CASE_W - 170,
              top: -40,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "#FFE14D",
              color: INK,
              transform: "rotate(12deg)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "0 26px",
              boxSizing: "border-box",
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>termasuk lagu hits</span>
            <FitText lines={2} style={{ marginTop: 4, fontSize: 30, fontWeight: 800, lineHeight: 1.05 }}>
              {first.title}
            </FitText>
          </div>
        )}
      </div>

      <FitText lines={2} style={{ marginTop: 44, fontSize: 60, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5 }}>
        {playlist.playlistTitle}
      </FitText>
      <p style={{ marginTop: 8, fontSize: 28, fontWeight: 600 }}>
        Feelist Records · {playlist.tracks.length} lagu · {mood.name}
      </p>

      {/* Daftar lagu ala sampul belakang */}
      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 8, fontFamily: FONT.mono }}>
        {playlist.tracks.slice(0, 5).map((t, i) => (
          <FitText key={t.id} lines={1} style={{ fontSize: 25 }}>
            <span style={{ fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}  {t.title}</span>
            <span> — {t.artist}</span>
          </FitText>
        ))}
      </div>

      <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", gap: 36 }}>
        {/* Barcode */}
        <div style={{ flexShrink: 0, background: "#FFFFFF", padding: "16px 18px 10px", borderRadius: 6, color: INK }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 74 }}>
            {bars.map((w, i) => (
              <div key={i} style={{ width: w, height: "100%", background: INK }} />
            ))}
          </div>
          <p style={{ marginTop: 6, fontFamily: FONT.mono, fontSize: 18, letterSpacing: 3, textAlign: "center" }}>{digits}</p>
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: FONT.mono, fontSize: 21 }}>℗ & © {year} Feelist Records</p>
          <FitText lines={2} style={{ marginTop: 10, fontFamily: FONT.serif, fontStyle: "italic", fontSize: 34, lineHeight: 1.15 }}>
            Terima kasih sudah mau mendengarkan perasaanmu sendiri.
          </FitText>
        </div>
      </div>
    </StoryFrame>
  );
}
