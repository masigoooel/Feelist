import { moodShades, withAlpha } from "@/lib/moodColors";
import { storyText } from "@/lib/storyCopyFallback";
import StoryFrame from "../StoryFrame";
import { DecoLayer, DecorPills, DecoSparkle, FitText, INK, INK_SOFT, StoryCTA, StoryLogo } from "../parts";
import type { StoryProps } from "../types";

/** Barcode dari 14 pil; ukurannya diturunkan dari judul supaya selalu sama untuk playlist yang sama */
function barcode(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return Array.from({ length: 14 }, (_, i) => {
    h = (h * 1103515245 + 12345) >>> 0;
    return { w: 8 + (h % 7), h: 50 + ((h >>> 8) % 41), dark: i % 2 === 0 };
  });
}

/** 3. "Tiket": tiket putih dengan sobekan, di atas panggung */
export default function Tiket({ playlist, mood }: StoryProps) {
  const sh = moodShades(mood.bg);
  const text = storyText(playlist);
  const info = [
    { label: "Mood", value: mood.name, grow: false },
    { label: "Jumlah lagu", value: String(playlist.tracks.length), grow: false },
    { label: "Kursi", value: text.ticketSeat, grow: true },
  ];

  return (
    <StoryFrame
      bg={mood.bg}
      background={`radial-gradient(ellipse 95% 30% at 50% 0%, ${sh.light} 0%, ${sh.dark} 55%, ${sh.deep} 100%)`}
      decor={
        <DecoLayer>
          {/* Sorot lampu dari atas */}
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <polygon points="190,0 -40,1500 460,1500" fill="rgba(255,255,255,0.07)" />
            <polygon points="890,0 620,1500 1120,1500" fill="rgba(255,255,255,0.07)" />
            <polygon points="540,0 330,1300 750,1300" fill={withAlpha(mood.accent, 0.07)} />
          </svg>
          <DecorPills position={{ bottom: -160, left: -60 }} align="flex-end" bg={sh.deep} />
          {/* Lantai panggung */}
          <div style={{ position: "absolute", left: 90, top: 1560, width: 900, height: 260, borderRadius: "50%", background: withAlpha(mood.accent, 0.16) }} />
          <div style={{ position: "absolute", left: 240, top: 1620, width: 600, height: 140, borderRadius: "50%", background: withAlpha(mood.accent, 0.18) }} />
          {/* Sparkle di pita atas */}
          <DecoSparkle size={44} color="#FFFFFF" style={{ left: 120, top: 92 }} />
          <DecoSparkle size={30} color={mood.accent} style={{ left: 300, top: 170 }} />
          <DecoSparkle size={64} color={mood.accent} style={{ left: 780, top: 70 }} />
          <DecoSparkle size={36} color="#FFFFFF" style={{ left: 930, top: 176 }} />
          {/* Cap "Masuk", tampil di atas tiket */}
          <div
            style={{
              position: "absolute",
              zIndex: 2,
              right: 70,
              top: 1220,
              width: 200,
              height: 200,
              boxSizing: "border-box",
              borderRadius: "50%",
              border: `6px solid ${mood.accent}`,
              background: withAlpha(mood.bg, 0.85),
              color: mood.accentText,
              transform: "rotate(-14deg)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1.1,
            }}
          >
            <span style={{ fontSize: 24, fontWeight: 700 }}>Masuk</span>
            <span style={{ fontSize: 48, fontWeight: 800 }}>1 hati</span>
          </div>
        </DecoLayer>
      }
    >
      <div style={{ alignSelf: "center" }}>
        <StoryLogo accent={mood.accent} bg={mood.bg} />
      </div>

      <div style={{ marginTop: 48, background: "#FFFFFF", color: INK, borderRadius: 40, transform: "rotate(-2deg)" }}>
        <div style={{ padding: "52px 56px 40px" }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: mood.bg }}>Tiket rasa</p>
          <FitText lines={2} style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>
            {playlist.playlistTitle}
          </FitText>
          <div style={{ marginTop: 28, display: "flex", gap: 48 }}>
            {info.map((x) => (
              <div key={x.label} style={{ minWidth: 0, flex: x.grow ? 1 : undefined }}>
                <p style={{ fontSize: 24, fontWeight: 600, color: INK_SOFT }}>{x.label}</p>
                {x.grow ? (
                  <FitText lines={1} style={{ fontSize: 38, fontWeight: 800 }}>
                    {x.value}
                  </FitText>
                ) : (
                  <p style={{ fontSize: 38, fontWeight: 800, whiteSpace: "nowrap" }}>{x.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Garis sobekan dengan "lubang" di kedua ujung */}
        <div style={{ position: "relative", borderTop: "4px dashed #D9D3EE" }}>
          {[{ left: -36 }, { right: -36 }].map((pos, i) => (
            <div
              key={i}
              style={{ position: "absolute", top: -38, width: 72, height: 72, borderRadius: "50%", background: sh.deep, ...pos }}
            />
          ))}
        </div>

        <div style={{ padding: "40px 56px 48px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {playlist.tracks.slice(0, 5).map((t, i) => (
              <FitText key={t.id} lines={1} style={{ fontSize: 30 }}>
                <span style={{ fontWeight: 800, color: mood.bg, marginRight: 20 }}>{i + 1}</span>
                <span style={{ fontWeight: 700 }}>{t.title}</span>
                <span style={{ fontWeight: 500, color: INK_SOFT }}> — {t.artist}</span>
              </FitText>
            ))}
          </div>
          <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 10 }}>
            {barcode(playlist.playlistTitle).map((b, i) => (
              <div key={i} style={{ width: b.w, height: b.h, borderRadius: b.w / 2, background: b.dark ? INK : mood.bg }} />
            ))}
          </div>
        </div>
      </div>

      <StoryCTA text="Bikin punyamu" accent={mood.accent} style={{ marginTop: "auto", alignSelf: "center" }} />
    </StoryFrame>
  );
}
