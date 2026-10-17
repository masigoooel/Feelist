import type { CSSProperties } from "react";
import { coverSrc } from "@/lib/cover";
import { MOODS } from "@/lib/moods";
import type { Recap } from "@/lib/recap";
import { SLIDE_COPY } from "@/lib/recap/copy";
import { NEON, NEON_FONT, neonBox, neonMood, neonText } from "@/lib/recap/themes/neonMalam";
import { LogoMark } from "../../../Logo";

const K = 2.7; // skala cahaya neon untuk kanvas 1080px (kanvas slide = 390px)
const serif: CSSProperties = { fontFamily: NEON_FONT.serif, fontStyle: "italic", fontWeight: 400 };
const mono: CSSProperties = { fontFamily: NEON_FONT.mono };
const pad = (n: number) => String(n).padStart(2, "0");

/** Hujan & laser statis (tanpa animasi) untuk kanvas 1080×1920 */
const RAIN = Array.from({ length: 46 }, (_, i) => ({ x: (i * 211) % 1080, y: (i * 389) % 1700, h: 90 + ((i * 53) % 140), c: i % 2 ? NEON.cyan : NEON.pink, o: 0.25 + ((i * 7) % 5) / 12 }));
const LASERS = [
  { x: 110, a: 18, c: NEON.pink },
  { x: 390, a: 6, c: NEON.cyan },
  { x: 690, a: -6, c: NEON.pink },
  { x: 970, a: -18, c: NEON.cyan },
];

/**
 * Versi statis slide penutup untuk dibagikan / disimpan (1080×1920, area aman Story 250/96/340).
 * Hanya angka, mood, lagu teratas, jam, kalender mini, dan tipe pendengar. TIDAK ada cerita pengguna.
 */
export function ShareImage({ recap }: { recap: Recap }) {
  const { edition, totals, topMood, topTrack, favoriteWindow, listenerType, copy } = recap;
  const offset = (new Date(recap.year, recap.month - 1, 1).getDay() + 6) % 7;
  const cells = [...Array.from({ length: offset }, () => null), ...recap.calendar];
  const stats = [
    { value: totals.sessions, label: SLIDE_COPY.closing.stats.sessions, c: NEON.pink },
    { value: totals.tracks, label: SLIDE_COPY.closing.stats.tracks, c: NEON.cyan },
    ...(totals.minutes !== null ? [{ value: totals.minutes, label: SLIDE_COPY.closing.stats.minutes, c: NEON.yellow }] : []),
  ];

  return (
    <div style={{ position: "relative", width: 1080, height: 1920, overflow: "hidden", background: NEON.bg, color: NEON.white, fontFamily: NEON_FONT.sans }}>
      {/* Latar statis */}
      {LASERS.map((l, i) => (
        <span key={i} style={{ position: "absolute", left: l.x, bottom: -40, width: 6, height: 2000, opacity: 0.35, background: `linear-gradient(to top, ${l.c}, transparent 85%)`, transform: `rotate(${l.a}deg)`, transformOrigin: "50% 100%" }} />
      ))}
      {RAIN.map((d, i) => (
        <span key={`r${i}`} style={{ position: "absolute", left: d.x, top: d.y, width: 3, height: d.h, opacity: d.o, background: `linear-gradient(to bottom, transparent, ${d.c})` }} />
      ))}
      <div style={{ position: "absolute", left: -100, right: -100, bottom: -300, height: 760, borderRadius: "50%", background: "radial-gradient(closest-side, rgb(255 61 242 / 0.45), transparent)" }} />
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.035) 0 2px, transparent 2px 7px)" }} />

      {/* Isi (area aman) */}
      <div style={{ position: "relative", boxSizing: "border-box", height: "100%", padding: "250px 96px 340px", display: "flex", flexDirection: "column" }}>
        <p style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: 8, textTransform: "uppercase", ...mono, ...neonText(NEON.cyan, K) }}>
          {SLIDE_COPY.editionLabel(edition.number, edition.monthName)} · {recap.year}
        </p>
        <h1 style={{ margin: "16px 0 0", fontSize: 150, lineHeight: 0.95, textTransform: "lowercase", ...serif, ...neonText(NEON.pink, K) }}>{edition.title}</h1>
        <p style={{ margin: "22px 0 0", fontSize: 42, fontWeight: 700, lineHeight: 1.25 }}>{copy.closing}</p>

        <div style={{ marginTop: 40, display: "flex", gap: 24 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ flex: 1, borderRadius: 40, padding: "28px 0 24px", textAlign: "center", ...neonBox(s.c, K, 5) }}>
              <div style={{ fontSize: 104, fontWeight: 700, lineHeight: 1, ...mono, ...neonText(s.c, K) }}>{s.value}</div>
              <div style={{ marginTop: 8, fontSize: 32, fontWeight: 700 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mood & jam */}
        <div style={{ marginTop: 32, display: "flex", gap: 20, flexWrap: "wrap" }}>
          {topMood && (
            <span style={{ display: "inline-flex", alignItems: "center", height: 84, padding: "0 32px", borderRadius: 42, fontSize: 34, fontWeight: 800, ...neonBox(neonMood(topMood.mood), K * 0.6, 5), ...neonText(neonMood(topMood.mood), K * 0.6) }}>
              {MOODS[topMood.mood].label} {SLIDE_COPY.mood.times(topMood.count)}
            </span>
          )}
          {favoriteWindow && (
            <span style={{ display: "inline-flex", alignItems: "center", height: 84, padding: "0 32px", borderRadius: 42, fontSize: 34, fontWeight: 800, ...mono, ...neonBox(NEON.cyan, K * 0.6, 5), ...neonText(NEON.cyan, K * 0.6) }}>
              {pad(favoriteWindow.start)}.00–{pad(favoriteWindow.end)}.00
            </span>
          )}
        </div>

        {/* Lagu teratas */}
        {topTrack && (
          <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 32 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- dirender jadi PNG */}
            <img src={coverSrc(topTrack.cover)} alt="" width={156} height={156} style={{ width: 156, height: 156, borderRadius: 24, objectFit: "cover", ...neonBox(NEON.pink, K * 0.5, 4) }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: NEON.dim }}>{SLIDE_COPY.track.label}</div>
              <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.05, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 680 }}>{topTrack.title}</div>
              <div style={{ fontSize: 34, fontWeight: 600, color: NEON.dim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 680 }}>{topTrack.artist}</div>
              <div style={{ marginTop: 4, fontSize: 34, fontWeight: 700, ...mono, ...neonText(NEON.pink, K * 0.6) }}>{SLIDE_COPY.track.replay(topTrack.count)}</div>
            </div>
          </div>
        )}

        {/* Kalender mini & tipe */}
        <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", gap: 48 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 34px)", gap: 10 }}>
            {cells.map((c, i) => (
              <span
                key={i}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: !c ? "transparent" : c.mood ? neonMood(c.mood) : c.count ? "rgb(255 255 255 / 0.6)" : "rgb(255 255 255 / 0.1)",
                  boxShadow: c?.mood ? `0 0 14px ${neonMood(c.mood)}` : "none",
                }}
              />
            ))}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: NEON.dim }}>{SLIDE_COPY.listener.label}</div>
            <div style={{ fontSize: 76, lineHeight: 1, ...serif, ...neonText(NEON.yellow, K * 0.7) }}>{listenerType.name}</div>
          </div>
        </div>

        <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 16 }}>
          <LogoMark size={64} outer={NEON.white} middle={NEON.pink} />
          <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1.5 }}>feelist</span>
        </div>
      </div>
    </div>
  );
}
