import type { CSSProperties } from "react";
import { keepHyphens } from "@/lib/keepHyphens";
import { moodShades } from "@/lib/moodColors";
import { storyText } from "@/lib/storyCopyFallback";
import StoryFrame from "../StoryFrame";
import { DecoLayer, FitText, INK, INK_SOFT, seededRandom, SPARKLE_PATH, StoryCover, StoryCTA, StoryLogo } from "../parts";
import type { StoryProps } from "../types";

const feelistBubble: CSSProperties & { fontSize: number } = {
  alignSelf: "flex-start",
  maxWidth: 820,
  padding: "22px 34px",
  borderRadius: "36px 36px 36px 10px",
  background: "rgb(255 255 255 / 0.16)",
  fontSize: 34,
  fontWeight: 600,
  lineHeight: 1.35,
  textWrap: "pretty", // hindari satu kata tertinggal sendirian di baris bawah, baris tetap penuh
};

/** Ikon garis wallpaper chat (viewBox 24): not musik, hati, sparkle */
const WALLPAPER_ICONS = [
  <g key="note">
    <path d="M9 18V5l11-2v12" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="17" cy="15" r="3" />
  </g>,
  <path key="heart" d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />,
  <path key="sparkle" d={SPARKLE_PATH} />,
];

/** Wallpaper: ikon 64px dalam grid 180×200, baris genap bergeser 60px, rotasi acak tetap −25..25° */
function Wallpaper({ seed }: { seed: string }) {
  const rand = seededRandom(seed);
  const icons = [];
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 7; col++) {
      const x = col * 180 + (row % 2 === 0 ? 60 : 0) + 58;
      const y = row * 200 + 68;
      const rot = Math.round(rand() * 50 - 25);
      icons.push(
        <g key={`${row}-${col}`} transform={`translate(${x} ${y}) rotate(${rot}) scale(${64 / 24}) translate(-12 -12)`}>
          {WALLPAPER_ICONS[(row + col) % 3]}
        </g>,
      );
    }
  }
  return (
    <svg
      width={1080}
      height={1920}
      fill="none"
      stroke="#FFFFFF"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: "absolute", inset: 0, opacity: 0.13 }}
    >
      {icons}
    </svg>
  );
}

/** 6. "Chat": percakapan dengan Feelist (kalimat umum, bukan cerita asli) */
export default function Chat({ playlist, mood }: StoryProps) {
  const text = storyText(playlist);
  const { dark } = moodShades(mood.bg);

  return (
    <StoryFrame
      bg={mood.bg}
      background={dark}
      decor={
        <DecoLayer>
          <Wallpaper seed={playlist.playlistTitle + (playlist.tracks[0]?.id ?? "")} />
          {/* Kolom ketik di bawah */}
          <div
            style={{
              position: "absolute",
              left: 60,
              right: 60,
              top: 1690,
              height: 104,
              borderRadius: 52,
              background: "rgba(255,255,255,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px 0 44px",
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>Tulis curhatmu…</span>
            <span style={{ width: 76, height: 76, borderRadius: "50%", background: mood.accent, display: "grid", placeItems: "center" }}>
              <svg viewBox="0 0 24 24" width={38} height={38} fill={INK}>
                <path d="M3.4 20.4 21 12 3.4 3.6l-.02 6.53L15 12 3.38 13.87z" />
              </svg>
            </span>
          </div>
        </DecoLayer>
      }
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo + badge notifikasi "1" di pojok kanan atas */}
        <div style={{ position: "relative" }}>
          <StoryLogo accent={mood.accent} bg={mood.bg} />
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: -16,
              right: -30,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#FF6B6B",
              color: INK,
              fontSize: 24,
              fontWeight: 800,
              display: "grid",
              placeItems: "center",
            }}
          >
            1
          </span>
        </div>
        <span style={{ fontSize: 28, fontWeight: 600 }}>online</span>
      </div>

      <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            alignSelf: "flex-end",
            maxWidth: 760,
            padding: "22px 34px",
            borderRadius: "36px 36px 10px 36px",
            background: mood.accent,
            color: INK,
            fontSize: 36,
            fontWeight: 700,
            lineHeight: 1.3,
            textWrap: "pretty",
          }}
        >
          {keepHyphens(text.chatOpening)}
        </div>

        <FitText as="div" lines={2} style={feelistBubble}>
          Siap. {playlist.description || "Ini lagu-lagu buat kamu:"}
        </FitText>

        {playlist.tracks.slice(0, 5).map((t) => (
          <div
            key={t.id}
            style={{
              alignSelf: "flex-start",
              maxWidth: 760,
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "12px 34px 12px 12px",
              borderRadius: 32,
              background: "#FFFFFF",
              color: INK,
            }}
          >
            <StoryCover src={t.cover} size={68} radius={20} bg={mood.bg} />
            <div style={{ minWidth: 0 }}>
              <FitText lines={1} style={{ fontSize: 32, fontWeight: 700 }}>{t.title}</FitText>
              <FitText lines={1} style={{ fontSize: 26, fontWeight: 500, color: INK_SOFT }}>{t.artist}</FitText>
            </div>
          </div>
        ))}

        <div style={feelistBubble}>{keepHyphens(text.chatClosing)}</div>
      </div>

      {/* Dorong tombol ke bawah area aman, tapi selalu ada jarak minimal 56px dari gelembung terakhir */}
      <div aria-hidden style={{ flex: "1 0 56px" }} />
      <StoryCTA text="Curhat ke Feelist" accent={mood.accent} style={{ alignSelf: "center" }} />
    </StoryFrame>
  );
}
