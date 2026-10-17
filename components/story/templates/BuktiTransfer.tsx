import { moodShades } from "@/lib/moodColors";
import { storyText } from "@/lib/storyCopyFallback";
import StoryFrame from "../StoryFrame";
import { DecoLayer, FitText, FONT, INK, INK_SOFT, LogoMark, seededRandom, StoryCover } from "../parts";
import type { StoryProps } from "../types";

const PAGE = "#EEECF3";
const GREEN = "#146C3A";
const GREEN_SOFT = "#E1F4E8";
const LINE = "#E6E2EF";

/** 20. "Bukti transfer": struk dompet digital generik, yang ditransfer lagu */
export default function BuktiTransfer({ playlist, mood }: StoryProps) {
  const sh = moodShades(mood.bg);
  const text = storyText(playlist);
  const rand = seededRandom(playlist.playlistTitle + (playlist.tracks[0]?.id ?? ""));
  const digits = (n: number) => Array.from({ length: n }, () => Math.floor(rand() * 10)).join("");
  const ref = `FP${digits(12)}`;
  const now = new Date();
  const when = `${now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} · ${String(now.getHours()).padStart(2, "0")}.${String(now.getMinutes()).padStart(2, "0")} WIB`;
  const songs = playlist.tracks.slice(0, 5);
  const accounts = [
    { label: "Dari", name: "Perasaanmu", acc: `**** ${digits(4)}` },
    { label: "Ke", name: playlist.playlistTitle, acc: `**** ${digits(4)}` },
  ];
  const details = [
    { label: "No. referensi", value: ref, mono: true },
    { label: "Biaya admin", value: "Gratis", mono: false },
    { label: "Berita", value: text.chatOpening, mono: false },
  ];

  return (
    <StoryFrame
      bg={PAGE}
      background={PAGE}
      decor={
        <DecoLayer>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 640, background: sh.dark, borderRadius: "0 0 64px 64px" }} />
          <div style={{ position: "absolute", right: -120, top: -160, width: 520, height: 520, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        </DecoLayer>
      }
    >
      {/* Kepala aplikasi */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <LogoMark size={52} outer="#FFFFFF" middle={mood.accent} />
          <span style={{ fontSize: 36, fontWeight: 800 }}>Feelist Pay</span>
        </span>
        <span style={{ fontSize: 26, fontWeight: 600 }}>Bukti transfer</span>
      </div>

      <div style={{ marginTop: 30, background: "#FFFFFF", color: INK, borderRadius: 36, padding: "36px 40px 30px", boxShadow: "0 20px 50px rgba(20,27,77,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width={96} height={96} viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <circle cx={24} cy={24} r={23} fill={GREEN} />
            <path d="M14 25l7 7 13-15" fill="none" stroke="#FFFFFF" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <span style={{ display: "inline-block", padding: "6px 18px", borderRadius: 18, background: GREEN_SOFT, color: GREEN, fontSize: 24, fontWeight: 800 }}>Berhasil</span>
            <p style={{ marginTop: 6, fontSize: 24, color: INK_SOFT }}>{when}</p>
          </div>
        </div>

        <p style={{ marginTop: 24, fontSize: 26, fontWeight: 600, color: INK_SOFT }}>Total transfer</p>
        <p style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>{playlist.tracks.length} lagu</p>

        {/* Rekening asal & tujuan (disamarkan) */}
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          {accounts.map((a) => (
            <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 20, background: "#F5F3FA", borderRadius: 22, padding: "14px 22px" }}>
              <span style={{ width: 70, flexShrink: 0, fontSize: 24, fontWeight: 600, color: INK_SOFT }}>{a.label}</span>
              <FitText lines={1} style={{ flex: 1, minWidth: 0, fontSize: 28, fontWeight: 800 }}>
                {a.name}
              </FitText>
              <span style={{ fontFamily: FONT.mono, fontSize: 24, color: INK_SOFT, whiteSpace: "nowrap" }}>{a.acc}</span>
            </div>
          ))}
        </div>

        {/* Rincian transaksi */}
        <div style={{ marginTop: 18 }}>
          {details.map((d) => (
            <div key={d.label} style={{ display: "flex", justifyContent: "space-between", gap: 30, padding: "10px 0", borderBottom: `2px solid ${LINE}` }}>
              <span style={{ fontSize: 24, color: INK_SOFT, whiteSpace: "nowrap" }}>{d.label}</span>
              <FitText lines={1} style={{ minWidth: 0, fontSize: 24, fontWeight: 700, textAlign: "right", fontFamily: d.mono ? FONT.mono : undefined }}>
                {d.value}
              </FitText>
            </div>
          ))}
        </div>

        {/* Daftar lagu yang ditransfer */}
        <p style={{ marginTop: 20, fontSize: 24, fontWeight: 700, color: INK_SOFT }}>Rincian lagu</p>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          {songs.map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <StoryCover src={t.cover} size={52} radius={12} bg={mood.bg} />
              <FitText lines={1} style={{ flex: 1, minWidth: 0, fontSize: 26 }}>
                <span style={{ fontWeight: 700 }}>{t.title}</span>
                <span style={{ color: INK_SOFT }}> — {t.artist}</span>
              </FitText>
              <span style={{ fontSize: 24, fontWeight: 700, whiteSpace: "nowrap" }}>1 lagu</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "auto", display: "flex", gap: 20 }}>
        <div style={{ flex: 1, height: 88, borderRadius: 44, border: `3px solid ${sh.dark}`, boxSizing: "border-box", color: sh.dark, display: "grid", placeItems: "center", fontSize: 30, fontWeight: 800 }}>
          Bagikan
        </div>
        <div style={{ flex: 1, height: 88, borderRadius: 44, background: sh.dark, color: "#FFFFFF", display: "grid", placeItems: "center", fontSize: 30, fontWeight: 800 }}>
          Transfer lagi
        </div>
      </div>
    </StoryFrame>
  );
}
