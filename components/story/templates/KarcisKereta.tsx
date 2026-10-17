import { moodShades } from "@/lib/moodColors";
import { storyText } from "@/lib/storyCopyFallback";
import StoryFrame from "../StoryFrame";
import { DecoLayer, FitText, FONT, INK, INK_SOFT, LogoMark, seededRandom, StoryCTA, StoryLogo } from "../parts";
import type { StoryProps } from "../types";

const QR_N = 21;

/** Modul QR 21×21: tiga kotak finder di sudut + titik acak tetap dari seed (hiasan, bukan QR asli) */
function qrModules(rand: () => number) {
  const finder = (r: number, c: number) => {
    for (const [fr, fc] of [[0, 0], [0, QR_N - 7], [QR_N - 7, 0]]) {
      const y = r - fr;
      const x = c - fc;
      if (y >= -1 && y <= 7 && x >= -1 && x <= 7) {
        if (y < 0 || y > 6 || x < 0 || x > 6) return 0; // pemisah putih
        const ring = Math.min(y, x, 6 - y, 6 - x);
        return ring === 1 ? 0 : 1;
      }
    }
    return -1;
  };
  const cells: [number, number][] = [];
  for (let r = 0; r < QR_N; r++) {
    for (let c = 0; c < QR_N; c++) {
      const f = finder(r, c);
      if (f === 1 || (f === -1 && rand() < 0.48)) cells.push([r, c]);
    }
  }
  return cells;
}

const time = (start: number, plus: number) => {
  const m = (start + plus) % (24 * 60);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(m % 60).padStart(2, "0")}`;
};

/** 19. "Karcis kereta": e-tiket kereta dari perasaan sekarang ke perasaan tujuan */
export default function KarcisKereta({ playlist, mood }: StoryProps) {
  const sh = moodShades(mood.bg);
  const text = storyText(playlist);
  const rand = seededRandom(playlist.playlistTitle + (playlist.tracks[0]?.id ?? ""));
  const code = `FL-${Array.from({ length: 5 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(rand() * 32)]).join("")}`;
  const qr = qrModules(rand);
  const bars = Array.from({ length: 30 }, () => 2 + Math.floor(rand() * 4) * 2);
  const digits = Array.from({ length: 13 }, () => Math.floor(rand() * 10)).join("");
  const date = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const depart = 23 * 60;
  const stops = playlist.tracks.slice(0, 5);
  const grid = [
    { label: "Penumpang", value: "Kamu" },
    { label: "Kereta", value: "Feelist Ekspres" },
    { label: "Kelas", value: "Eksekutif Hati" },
    { label: "Tanggal", value: date },
    { label: "Gerbong", value: `Rasa ${1 + Math.floor(rand() * 8)}` },
    { label: "Kursi", value: text.ticketSeat },
  ];
  const label = { fontSize: 20, fontWeight: 700, letterSpacing: 2, color: INK_SOFT, textTransform: "uppercase" } as const;

  return (
    <StoryFrame
      bg={sh.deep}
      decor={
        <DecoLayer>
          {/* Rel kereta di bawah */}
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <line x1={0} y1={1700} x2={1080} y2={1700} stroke="rgba(255,255,255,0.18)" strokeWidth={6} />
            <line x1={0} y1={1760} x2={1080} y2={1760} stroke="rgba(255,255,255,0.18)" strokeWidth={6} />
            {Array.from({ length: 14 }, (_, i) => (
              <rect key={i} x={i * 84 - 10} y={1690} width={26} height={84} fill="rgba(255,255,255,0.08)" />
            ))}
          </svg>
        </DecoLayer>
      }
    >
      <div style={{ background: "#FFFFFF", color: INK, borderRadius: 36, overflow: "hidden" }}>
        {/* Kepala tiket warna mood */}
        <div style={{ background: sh.dark, color: "#FFFFFF", padding: "28px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <LogoMark size={52} outer="#FFFFFF" middle={mood.accent} />
            <div>
              <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1 }}>E-tiket kereta rasa</p>
              <p style={{ fontSize: 22, fontWeight: 500 }}>feelist</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>KODE BOOKING</p>
            <p style={{ fontFamily: FONT.mono, fontSize: 34, fontWeight: 700 }}>{code}</p>
          </div>
        </div>

        <div style={{ padding: "30px 40px 26px" }}>
          {/* Asal → tujuan */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={label}>Asal</p>
              <FitText lines={1} style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>
                {text.trainRoute.from}
              </FitText>
              <p style={{ fontFamily: FONT.mono, fontSize: 24 }}>{time(depart, 0)}</p>
            </div>
            <svg width={120} height={40} viewBox="0 0 120 40" style={{ flexShrink: 0 }}>
              <line x1={4} y1={20} x2={104} y2={20} stroke={INK} strokeWidth={4} strokeDasharray="8 8" />
              <path d="M100 8 L116 20 L100 32" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
              <p style={label}>Tujuan</p>
              <FitText lines={1} style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>
                {text.trainRoute.to}
              </FitText>
              <p style={{ fontFamily: FONT.mono, fontSize: 24 }}>{time(depart, stops.length * 4 + 4)}</p>
            </div>
          </div>

          {/* Detail penumpang */}
          <div style={{ marginTop: 26, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", rowGap: 18, columnGap: 24 }}>
            {grid.map((g) => (
              <div key={g.label} style={{ minWidth: 0 }}>
                <p style={label}>{g.label}</p>
                <FitText lines={1} style={{ marginTop: 2, fontSize: 28, fontWeight: 800 }}>
                  {g.value}
                </FitText>
              </div>
            ))}
          </div>
        </div>

        {/* Garis sobek dengan dua lubang */}
        <div style={{ position: "relative", borderTop: "4px dashed #D9D3EE" }}>
          {[{ left: -32 }, { right: -32 }].map((pos, i) => (
            <div key={i} style={{ position: "absolute", top: -34, width: 64, height: 64, borderRadius: "50%", background: sh.deep, ...pos }} />
          ))}
        </div>

        <div style={{ padding: "26px 40px 32px" }}>
          {/* Lagu sebagai stasiun pemberhentian */}
          <p style={label}>Pemberhentian</p>
          <div style={{ position: "relative", marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ position: "absolute", left: 11, top: 16, bottom: 16, width: 4, background: "#D9D3EE" }} />
            {stops.map((t, i) => (
              <div key={t.id} style={{ position: "relative", display: "flex", alignItems: "center", gap: 22 }}>
                <div style={{ width: 26, height: 26, flexShrink: 0, boxSizing: "border-box", borderRadius: "50%", border: `5px solid ${sh.dark}`, background: "#FFFFFF" }} />
                <span style={{ fontFamily: FONT.mono, fontSize: 22, color: INK_SOFT, flexShrink: 0 }}>{time(depart, 4 + i * 4)}</span>
                <FitText lines={1} style={{ minWidth: 0, fontSize: 28 }}>
                  <span style={{ fontWeight: 800 }}>{t.title}</span>
                  <span style={{ color: INK_SOFT }}> — {t.artist}</span>
                </FitText>
              </div>
            ))}
          </div>

          {/* QR, barcode, aturan lucu */}
          <div style={{ marginTop: 26, display: "flex", gap: 30, alignItems: "flex-start" }}>
            <svg width={190} height={190} viewBox={`0 0 ${QR_N} ${QR_N}`} style={{ flexShrink: 0 }} shapeRendering="crispEdges">
              {qr.map(([r, c]) => (
                <rect key={`${r}-${c}`} x={c} y={r} width={1.02} height={1.02} fill={INK} />
              ))}
            </svg>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 60 }}>
                {bars.map((w, i) => (
                  <div key={i} style={{ width: w, height: "100%", background: INK }} />
                ))}
              </div>
              <p style={{ marginTop: 4, fontFamily: FONT.mono, fontSize: 18, letterSpacing: 3 }}>{digits}</p>
              <div style={{ marginTop: 12, fontSize: 20, lineHeight: 1.35, color: INK_SOFT }}>
                <p>• Dilarang menangis terlalu keras di gerbong tenang.</p>
                <p>• Tiket berlaku untuk satu kali perasaan.</p>
                <p>• Bagasi kenangan maksimal 20 kg.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <StoryLogo accent={mood.accent} bg={mood.bg} />
        <StoryCTA text="Pesan tiketmu" accent={mood.accent} />
      </div>
    </StoryFrame>
  );
}
