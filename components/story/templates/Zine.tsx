import type { CSSProperties } from "react";
import { contrast } from "@/lib/color";
import { moodShades, withAlpha } from "@/lib/moodColors";
import StoryFrame from "../StoryFrame";
import { DecoLayer, FitText, FONT, Grain, INK, seededRandom } from "../parts";
import type { StoryProps } from "../types";

const PAPER = "#EDEBE4";
const BLACK = "#151413";
const CREAM = "#F5F2EA";
const MAX_W = 880; // lebar area judul (888) dikurangi sedikit ruang untuk huruf yang diputar

type Letter = { ch: string; size: number; rot: number; bg: number; font: number };

// Gaya kotak huruf guntingan: hitam, putih bergaris, warna mood, koran
function letterBox(bg: number, moodBg: string): CSSProperties {
  switch (bg) {
    case 0:
      return { background: BLACK, color: CREAM };
    case 1:
      return { background: "repeating-linear-gradient(45deg, #FFFFFF 0 10px, #E2DFD6 10px 20px)", color: INK };
    case 2:
      return { background: moodBg, color: "#FFFFFF" };
    default:
      return {
        background: "repeating-linear-gradient(0deg, rgba(30,18,64,0.1) 0 2px, transparent 2px 9px), #D9D4C5",
        color: INK,
      };
  }
}

const LETTER_FONTS: CSSProperties[] = [
  { fontFamily: "var(--font-sans)", fontWeight: 800 },
  { fontFamily: FONT.serif, fontWeight: 400 },
  { fontFamily: FONT.mono, fontWeight: 700 },
];

/** Perkiraan lebar huruf (em) per font, dibuat agak longgar supaya kata tidak pernah terpotong */
function glyphWidth(ch: string, font: number) {
  if (font === 2) return 0.64; // monospace
  if (/[MWmw]/.test(ch)) return font === 0 ? 0.98 : 0.8;
  if (/[iljtfI.,'!:;]/.test(ch)) return 0.36;
  return font === 0 ? 0.72 : 0.56;
}

/** Skala judul: sebesar mungkin (≤ 1) asal tiap kata muat satu baris dan judul maksimal 3 baris */
function cutoutScale(words: Letter[][]) {
  for (let k = 1; k > 0.45; k -= 0.03) {
    const widths = words.map((w) => w.reduce((s, l) => s + glyphWidth(l.ch, l.font) * l.size * k + 30 * k, 0));
    if (widths.some((w) => w > MAX_W)) continue;
    let rows = 1;
    let line = 0;
    for (const w of widths) {
      const next = line === 0 ? w : line + 24 * k + w;
      if (next > MAX_W) {
        rows++;
        line = w;
      } else line = next;
    }
    if (rows <= 3) return k;
  }
  return 0.45;
}

/** 10. "Zine": fotokopian dengan judul dari huruf guntingan majalah */
export default function Zine({ playlist, mood }: StoryProps) {
  const sh = moodShades(mood.bg);
  // Kotak huruf warna mood: kalau putih kurang kontras di atasnya, pakai versi gelapnya
  const letterMood = contrast("#FFFFFF", mood.bg) >= 4.6 ? mood.bg : sh.dark;
  const rand = seededRandom(playlist.playlistTitle + (playlist.tracks[0]?.id ?? ""));
  let prevBg = -1;
  const words = playlist.playlistTitle
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      [...word].map((ch): Letter => {
        let bg = Math.floor(rand() * 4);
        if (bg === prevBg) bg = (bg + 1) % 4; // dua kotak bersebelahan tidak sama
        prevBg = bg;
        return { ch, size: 96 + Math.round(rand() * 16), rot: Math.round((rand() * 14 - 7) * 10) / 10, bg, font: Math.floor(rand() * 3) };
      }),
    );
  const k = cutoutScale(words);
  const quote = playlist.description || "Kalau lagunya pas, jangan dilewati.";

  return (
    <StoryFrame
      bg={PAPER}
      background={PAPER}
      decor={
        <DecoLayer>
          <Grain opacity={0.35} blend="multiply" />
          {/* Dua staples di sudut atas */}
          {[
            { left: 70, top: 96, rot: -9 },
            { left: 920, top: 92, rot: 7 },
          ].map((s) => (
            <div
              key={s.left}
              style={{
                position: "absolute",
                left: s.left,
                top: s.top,
                width: 92,
                height: 12,
                borderRadius: 3,
                background: "linear-gradient(180deg, #C9C9C6 0%, #8E8E8A 100%)",
                boxShadow: "0 3px 0 rgba(0,0,0,0.18)",
                transform: `rotate(${s.rot}deg)`,
              }}
            />
          ))}
        </DecoLayer>
      }
    >
      <div style={{ color: INK }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 24, fontFamily: FONT.mono, fontSize: 28 }}>
          <span style={{ whiteSpace: "nowrap" }}>feelist zine no. 01</span>
          <FitText lines={1} style={{ minWidth: 0, textAlign: "right", fontSize: 28 }}>
            edisi: {mood.name.toLowerCase()}
          </FitText>
        </div>
        <div style={{ marginTop: 16, height: 4, background: INK }} />
      </div>

      {/* Judul dari huruf guntingan; satu kata tidak pernah dipecah ke dua baris */}
      <div
        aria-label={playlist.playlistTitle}
        style={{ marginTop: 36, display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 24 * k, rowGap: 10 * k }}
      >
        {words.map((word, wi) => (
          <span key={wi} style={{ display: "inline-flex", flexWrap: "nowrap", alignItems: "center" }}>
            {word.map((l, li) => (
              <span
                key={li}
                aria-hidden
                style={{
                  ...letterBox(l.bg, letterMood),
                  ...LETTER_FONTS[l.font],
                  display: "inline-block",
                  margin: `${4 * k}px ${3 * k}px`,
                  padding: `${2 * k}px ${12 * k}px`,
                  fontSize: l.size * k,
                  lineHeight: 1.1,
                  transform: `rotate(${l.rot}deg)`,
                  boxShadow: "2px 3px 0 rgba(0,0,0,0.12)",
                }}
              >
                {l.ch}
              </span>
            ))}
          </span>
        ))}
      </div>

      {/* Daftar lagu: blok hitam fotokopian, sedikit miring */}
      <div
        style={{
          marginTop: 40,
          background: BLACK,
          color: CREAM,
          padding: "36px 48px 40px",
          transform: "rotate(-1.5deg)",
          fontFamily: FONT.mono,
        }}
      >
        <p style={{ fontSize: 24, letterSpacing: 4, color: mood.accent }}>SISI A · {playlist.tracks.length} LAGU</p>
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          {playlist.tracks.slice(0, 5).map((t, i) => (
            <FitText key={t.id} lines={1} style={{ fontSize: 29 }}>
              <span style={{ fontWeight: 700 }}>{String(i + 1).padStart(2, "0")} </span>
              <span style={{ fontWeight: 700 }}>{t.title}</span>
              <span> — {t.artist}</span>
            </FitText>
          ))}
        </div>
      </div>

      {/* Kutipan dengan stabilo warna mood */}
      <FitText lines={2} style={{ marginTop: 40, color: INK, fontFamily: FONT.serif, fontStyle: "italic", fontSize: 52, lineHeight: 1.18 }}>
        <span
          style={{
            backgroundImage: `linear-gradient(180deg, transparent 52%, ${withAlpha(mood.bg, 0.28)} 52%, ${withAlpha(mood.bg, 0.28)} 90%, transparent 90%)`,
            boxDecorationBreak: "clone",
            WebkitBoxDecorationBreak: "clone",
          }}
        >
          “{quote}”
        </span>
      </FitText>

      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            background: BLACK,
            color: CREAM,
            height: 92,
            padding: "0 40px",
            display: "flex",
            alignItems: "center",
            fontFamily: FONT.mono,
            fontWeight: 700,
            fontSize: 32,
            whiteSpace: "nowrap",
            transform: "rotate(-1deg)",
          }}
        >
          bikin zine-mu →
        </div>
        {/* Cap bulat putus-putus */}
        <div
          style={{
            width: 180,
            height: 180,
            boxSizing: "border-box",
            borderRadius: "50%",
            border: `4px dashed ${INK}`,
            color: INK,
            transform: "rotate(-12deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontFamily: FONT.mono,
            fontWeight: 700,
            fontSize: 22,
            lineHeight: 1.25,
            textTransform: "uppercase",
          }}
        >
          putar pas
          <br />
          tengah
          <br />
          malam
        </div>
      </div>
    </StoryFrame>
  );
}
