import type { ReactNode } from "react";
import { moodShades } from "@/lib/moodColors";
import { storyText } from "@/lib/storyCopyFallback";
import StoryFrame from "../StoryFrame";
import { DecoLayer, FitText, INK, INK_SOFT, StoryCTA, StoryLogo } from "../parts";
import type { StoryProps } from "../types";

const PAPER_W = 820;
const TOOTH_W = 40;
const TOOTH_H = 30;

const Divider = () => <div style={{ borderTop: "3px dashed #D9D3EE" }} />;

function Row({ label, value, big = false }: { label: string; value: ReactNode; big?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 24,
        fontSize: big ? 36 : 30,
        fontWeight: big ? 800 : 600,
      }}
    >
      <span>{label}</span>
      <span style={{ textAlign: "right" }}>{value}</span>
    </div>
  );
}

/** 5. "Struk": struk belanja rasa */
export default function Struk({ playlist, mood }: StoryProps) {
  const text = storyText(playlist);
  const stamp = moodShades(mood.bg).dark;
  const date = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  // Tepi bawah zigzag dari segitiga 40x30
  const teeth = Math.ceil(PAPER_W / TOOTH_W);
  const zigzag =
    `M0 0 ` +
    Array.from({ length: teeth }, (_, i) => `L${i * TOOTH_W + TOOTH_W / 2} ${TOOTH_H} L${(i + 1) * TOOTH_W} 0`).join(" ") +
    " Z";

  return (
    <StoryFrame
      bg={mood.bg}
      decor={
        <DecoLayer>
          {/* Label harga miring di pita atas */}
          <div
            style={{
              position: "absolute",
              left: 130,
              top: 128,
              padding: "14px 40px 14px 28px",
              borderRadius: "16px 999px 999px 16px",
              background: mood.accent,
              color: INK,
              fontSize: 30,
              fontWeight: 800,
              transform: "rotate(-6deg)",
            }}
          >
            Harga: 1 curhat
          </div>
          {/* Koin kembalian di pita bawah */}
          {[
            { left: 150, top: 1690, size: 96 },
            { left: 270, top: 1760, size: 70 },
            { left: 120, top: 1808, size: 80 },
          ].map((c, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: c.left,
                top: c.top,
                width: c.size,
                height: c.size,
                boxSizing: "border-box",
                borderRadius: "50%",
                background: "#FFD84D",
                border: "6px solid #E6B93A",
              }}
            />
          ))}
        </DecoLayer>
      }
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: PAPER_W, transform: "rotate(1.5deg)" }}>
          <div
            style={{
              background: "#FFFFFF",
              color: INK,
              borderRadius: "24px 24px 0 0",
              padding: "48px 56px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ alignSelf: "center" }}>
              <StoryLogo accent={mood.accent} bg={mood.bg} dark />
            </div>
            <p style={{ fontSize: 30, fontWeight: 600, color: INK_SOFT, textAlign: "center" }}>Struk rasa, {date}</p>
            <Divider />
            {playlist.tracks.slice(0, 5).map((t, i) => (
              <div key={t.id} style={{ display: "flex", alignItems: "baseline", gap: 12, fontSize: 30 }}>
                <FitText as="span" lines={1} style={{ fontSize: 30, fontWeight: 600, maxWidth: 430 }}>
                  {i + 1}. {t.title}
                </FitText>
                <span style={{ flex: 1, minWidth: 24, borderBottom: "3px dotted #B9B1D6" }} />
                <FitText as="span" lines={1} style={{ fontSize: 30, fontWeight: 500, color: INK_SOFT, maxWidth: 260 }}>
                  {t.artist}
                </FitText>
              </div>
            ))}
            <Divider />
            <Row label="Total lagu" value={playlist.tracks.length} />
            <Row label="Mood" value={mood.name} />
            <Row label="Kembalian" value={text.receiptChange} big />
            <Divider />
            {/* Kaki struk: ucapan di kiri, slot cap "LUNAS" di kanan (cap selalu di atas kertas, tidak menutupi teks) */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", minHeight: 238 }}>
              <p style={{ fontSize: 28, flex: 1 }}>Makasih udah cerita</p>
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  zIndex: 2,
                  right: 10,
                  top: 4,
                  width: 230,
                  height: 230,
                  boxSizing: "border-box",
                  borderRadius: "50%",
                  // bg mood digelapkan 35%: di atas kertas putih tetap kontras walau transparan 85%
                  border: `7px solid ${stamp}`,
                  color: stamp,
                  opacity: 0.85,
                  transform: "rotate(-18deg)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  lineHeight: 1.1,
                }}
              >
                <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: 2 }}>LUNAS</span>
                <span style={{ fontSize: 22, fontWeight: 700, maxWidth: 170 }}>dibayar pakai curhat</span>
              </div>
            </div>
          </div>
          <svg viewBox={`0 0 ${PAPER_W} ${TOOTH_H}`} width={PAPER_W} height={TOOTH_H} aria-hidden style={{ display: "block" }}>
            <path d={zigzag} fill="#FFFFFF" />
          </svg>
        </div>

        <FitText lines={2} style={{ marginTop: 56, fontSize: 52, fontWeight: 800, textAlign: "center" }}>
          {playlist.playlistTitle}
        </FitText>
        <StoryCTA text="Bikin punyamu" accent={mood.accent} style={{ marginTop: 40 }} />
      </div>
    </StoryFrame>
  );
}
