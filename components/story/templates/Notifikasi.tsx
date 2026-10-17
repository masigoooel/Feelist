import { mix } from "@/lib/color";
import { moodShades, withAlpha } from "@/lib/moodColors";
import { storyText } from "@/lib/storyCopyFallback";
import StoryFrame from "../StoryFrame";
import { FitText, INK, INK_SOFT, LogoMark, StoryCover } from "../parts";
import type { StoryProps } from "../types";

const CARD = "#F2F1F7";
const ICON_BG = ["", "#1F7A52", INK]; // ikon aplikasi generik; yang pertama pakai warna mood

function Glyph({ d, size = 40, fill = false }: { d: string; size?: number; fill?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
      <path d={d} fill={fill ? "#FFFFFF" : "none"} stroke="#FFFFFF" strokeWidth={fill ? 0 : 2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 17. "Notifikasi": layar kunci ponsel generik berisi lagu & notifikasi */
export default function Notifikasi({ playlist, mood }: StoryProps) {
  const sh = moodShades(mood.bg);
  const text = storyText(playlist);
  const now = new Date();
  const clock = `${String(now.getHours()).padStart(2, "0")}.${String(now.getMinutes()).padStart(2, "0")}`;
  const date = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
  const track = playlist.tracks[0];
  const widget = mix(sh.deep, "#FFFFFF", 0.14);
  const times = ["baru saja", "2 mnt lalu", "15 mnt lalu"];

  return (
    <StoryFrame
      bg={sh.deep}
      background={`radial-gradient(ellipse 90% 45% at 50% 28%, ${withAlpha(mood.bg, 0.9)} 0%, ${withAlpha(mood.bg, 0)} 70%), linear-gradient(180deg, ${sh.deep} 0%, #0B0A14 100%)`}
    >
      {/* Bilah status */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 28, fontWeight: 600 }}>
        <span>Feelist Cell</span>
        <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width={38} height={26} viewBox="0 0 38 26">
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={i * 10} y={18 - i * 6} width={7} height={8 + i * 6} rx={1.5} fill="#FFFFFF" />
            ))}
          </svg>
          <svg width={34} height={26} viewBox="0 0 24 18">
            <path d="M2 6.5a15 15 0 0 1 20 0M5.5 10a10 10 0 0 1 13 0M9 13.5a5 5 0 0 1 6 0" fill="none" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" />
            <circle cx={12} cy={16.5} r={1.5} fill="#FFFFFF" />
          </svg>
          <svg width={52} height={26} viewBox="0 0 52 26">
            <rect x={1} y={2} width={44} height={22} rx={6} fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.6} />
            <rect x={4} y={5} width={32} height={16} rx={3.5} fill="#FFFFFF" />
            <rect x={47} y={9} width={3.5} height={8} rx={1.5} fill="#FFFFFF" opacity={0.6} />
          </svg>
        </span>
      </div>

      {/* Gembok, tanggal, jam */}
      <div style={{ marginTop: 26, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Glyph d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z" size={44} />
        <p style={{ marginTop: 12, fontSize: 36, fontWeight: 600, textTransform: "capitalize" }}>{date}</p>
        <p style={{ fontSize: 184, fontWeight: 700, lineHeight: 1, letterSpacing: -6 }}>{clock}</p>
      </div>

      {/* Widget pemutar musik */}
      {track && (
        <div style={{ marginTop: 32, background: widget, borderRadius: 40, padding: "26px 30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <StoryCover src={track.cover} size={104} radius={18} bg={mood.bg} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <FitText lines={1} style={{ fontSize: 32, fontWeight: 700 }}>
                {track.title}
              </FitText>
              <FitText lines={1} style={{ fontSize: 26 }}>
                {track.artist}
              </FitText>
            </div>
            <LogoMark size={56} outer="#FFFFFF" middle={mood.accent} />
          </div>
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 18, fontSize: 21, fontWeight: 600 }}>
            <span>1.12</span>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.28)" }}>
              <div style={{ width: "38%", height: "100%", borderRadius: 4, background: "#FFFFFF" }} />
            </div>
            <span>-2.48</span>
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center", alignItems: "center", gap: 70 }}>
            <Glyph d="M19 5v14L9 12zM6 5v14" size={44} fill />
            <Glyph d="M7 4h4v16H7zM13 4h4v16h-4z" size={52} fill />
            <Glyph d="M5 5v14l10-7zM18 5v14" size={44} fill />
          </div>
        </div>
      )}

      {/* Tiga notifikasi; yang teratas bertumpuk */}
      <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 14 }}>
        {text.notifications.map((n, i) => (
          <div key={i} style={{ position: "relative", paddingBottom: i === 0 ? 26 : 0 }}>
            {i === 0 &&
              [
                { inset: "0 52px", bottom: 0, a: 0.35 },
                { inset: "0 26px", bottom: 13, a: 0.6 },
              ].map((s, j) => (
                <div key={j} style={{ position: "absolute", left: 0, right: 0, margin: s.inset, bottom: s.bottom, height: 60, borderRadius: "0 0 28px 28px", background: withAlpha(CARD, s.a) }} />
              ))}
            <div style={{ position: "relative", background: CARD, color: INK, borderRadius: 32, padding: "22px 26px", display: "flex", gap: 22, alignItems: "flex-start" }}>
              <div style={{ width: 72, height: 72, borderRadius: 18, flexShrink: 0, background: ICON_BG[i] || sh.dark, display: "grid", placeItems: "center", color: "#FFFFFF", fontSize: 36, fontWeight: 800 }}>
                {i === 2 ? <LogoMark size={56} outer="#FFFFFF" middle={mood.accent} /> : n.title.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                  <FitText lines={1} style={{ flex: 1, minWidth: 0, fontSize: 28, fontWeight: 700 }}>
                    {n.title}
                  </FitText>
                  <span style={{ fontSize: 22, color: INK_SOFT, whiteSpace: "nowrap" }}>{times[i]}</span>
                </div>
                <FitText lines={2} style={{ marginTop: 2, fontSize: 27, lineHeight: 1.25 }}>
                  {n.body}
                </FitText>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Senter, kamera, bilah home */}
      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {["M9 3h6l-1 6h-4zM10 9h4v12h-4z", "M4 8h4l2-3h4l2 3h4v11H4zM12 11a3 3 0 1 0 0 6a3 3 0 0 0 0-6z"].map((d) => (
          <div key={d} style={{ width: 104, height: 104, borderRadius: "50%", background: "rgba(0,0,0,0.38)", display: "grid", placeItems: "center" }}>
            <Glyph d={d} size={44} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 22, alignSelf: "center", width: 280, height: 10, borderRadius: 5, background: "#FFFFFF" }} />
    </StoryFrame>
  );
}
