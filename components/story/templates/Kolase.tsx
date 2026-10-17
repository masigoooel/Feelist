import type { CSSProperties } from "react";
import { safeOverlayAlpha } from "@/lib/moodColors";
import StoryFrame from "../StoryFrame";
import { DecoLayer, FitText, INK, LogoMark, StoryCover, StoryCTA, StoryLogo } from "../parts";
import type { StoryProps } from "../types";

// Posisi mosaik di kartu (tetap): lebar & tinggi 840 di tengah, mulai y 400 (area aman 250 + baris atas 60 + jarak 90).
// Jaraknya dibuat cukup supaya selotip (±65px ke atas/bawah dari sudut) tidak menutupi logo, label mood, dan judul.
const MOSAIC_SIZE = 840;
const MOSAIC = { left: 120, top: 400, right: 960, bottom: 400 + MOSAIC_SIZE };
// Selotip di keempat sudut mosaik: [pusat x, pusat y, rotasi]. Kanan atas & bawah tepat di sudut (tidak ada teks
// di sana); kiri atas & bawah sedikit ke luar supaya nomor kotak 1 dan judul kotak 4 tetap terbaca.
const TAPES: [number, number, number][] = [
  [MOSAIC.left - 12, MOSAIC.top - 12, -32],
  [MOSAIC.right, MOSAIC.top, 28],
  [MOSAIC.left - 28, MOSAIC.bottom + 28, 24],
  [MOSAIC.right, MOSAIC.bottom, -20],
];
// Latar gelap transparan di belakang teks yang menumpuk di atas cover (cover terang pun tetap terbaca)
const onCover = { alignSelf: "flex-start", maxWidth: "100%", background: "rgba(20,27,77,0.75)", borderRadius: 14, padding: "4px 14px" } as const;

/** 4. "Kolase": mosaik cover di kertas kotak */
export default function Kolase({ playlist, mood }: StoryProps) {
  const tracks = playlist.tracks.slice(0, 5);
  const grid = `rgba(255,255,255,${safeOverlayAlpha(mood.bg, 0.09)})`;

  // Kotak mosaik: cover sebagai latar, nomor di kiri atas, judul di kiri bawah
  const tile = (i: number, big: boolean, area: CSSProperties) => {
    const t = tracks[i];
    return (
      <div key={i} style={{ position: "relative", borderRadius: 32, overflow: "hidden", aspectRatio: "1", ...area }}>
        {t && <StoryCover src={t.cover} size="100%" radius={32} bg={mood.bg} style={{ position: "absolute", inset: 0 }} />}
        <div
          style={{
            position: "relative",
            height: "100%",
            boxSizing: "border-box",
            // Kotak besar: nomor agak ke dalam supaya tidak tertutup selotip kiri atas
            padding: big ? "44px 24px 24px 44px" : 24,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <span style={{ ...onCover, fontSize: big ? 48 : 30, fontWeight: 800, color: mood.accent }}>{i + 1}</span>
          {t && (
            <FitText as="span" lines={1} style={{ ...onCover, fontSize: big ? 40 : 24, fontWeight: 700 }}>
              {t.title}
            </FitText>
          )}
        </div>
      </div>
    );
  };

  return (
    <StoryFrame
      bg={mood.bg}
      background={`repeating-linear-gradient(0deg, ${grid} 0 2px, transparent 2px 60px), repeating-linear-gradient(90deg, ${grid} 0 2px, transparent 2px 60px), ${mood.bg}`}
      decor={
        <DecoLayer>
          {/* Catatan coretan + panah ke cover pertama */}
          <div
            style={{
              position: "absolute",
              left: 430,
              top: 118,
              transform: "rotate(-5deg)",
              fontSize: 34,
              fontWeight: 800,
              color: mood.accentText,
              whiteSpace: "nowrap",
            }}
          >
            yang ini paling kamu banget
          </div>
          <svg width={1080} height={400} style={{ position: "absolute", left: 0, top: 0 }}>
            <path d="M440 190 C 380 210, 360 260, 380 326" fill="none" stroke={mood.accent} strokeWidth={7} strokeLinecap="round" />
            <path d="M356 300 L380 330 L404 302" fill="none" stroke={mood.accent} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {/* Nama mood besar bergaris luar */}
          <div
            style={{
              position: "absolute",
              left: 60,
              top: 1640,
              transform: "rotate(-4deg)",
              fontSize: 120,
              fontWeight: 800,
              whiteSpace: "nowrap",
              color: "transparent",
              WebkitTextStroke: "3px rgba(255,255,255,0.3)",
            }}
          >
            {mood.name.toLowerCase()}
          </div>
          {/* Selotip, tampil di atas mosaik */}
          {TAPES.map(([x, y, r], i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                zIndex: 2,
                left: x - 85,
                top: y - 23,
                width: 170,
                height: 46,
                background: "rgba(255,255,255,0.5)",
                transform: `rotate(${r}deg)`,
              }}
            />
          ))}
        </DecoLayer>
      }
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <StoryLogo accent={mood.accent} bg={mood.bg} />
        <span
          style={{
            display: "flex",
            alignItems: "center",
            height: 60,
            padding: "0 28px",
            borderRadius: 30,
            background: `rgba(255,255,255,${safeOverlayAlpha(mood.bg, 0.16)})`,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          {mood.name}
        </span>
      </div>

      {/* Mosaik: cover 1 besar, 2–3 bertumpuk di kanan, baris bawah 4, 5, dan kotak logo */}
      <div style={{ marginTop: 90, alignSelf: "center", width: MOSAIC_SIZE, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {tile(0, true, { gridColumn: "1 / 3", gridRow: "1 / 3" })}
        {tile(1, false, { gridColumn: "3", gridRow: "1" })}
        {tile(2, false, { gridColumn: "3", gridRow: "2" })}
        {tile(3, false, { gridColumn: "1", gridRow: "3" })}
        {tile(4, false, { gridColumn: "2", gridRow: "3" })}
        <div
          style={{
            gridColumn: "3",
            gridRow: "3",
            aspectRatio: "1",
            borderRadius: 32,
            background: mood.accent,
            display: "grid",
            placeItems: "center",
          }}
        >
          <LogoMark size={150} outer={INK} middle={mood.bg} />
        </div>
      </div>

      <FitText lines={1} style={{ marginTop: 98, fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>
        {playlist.playlistTitle}
      </FitText>
      {playlist.description && (
        <FitText lines={1} style={{ marginTop: 12, fontSize: 34, fontWeight: 500 }}>
          {playlist.description}
        </FitText>
      )}
      <StoryCTA text="Bikin punyamu" accent={mood.accent} style={{ marginTop: "auto" }} />
    </StoryFrame>
  );
}
