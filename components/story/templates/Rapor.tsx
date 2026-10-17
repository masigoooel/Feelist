import type { CSSProperties } from "react";
import { moodShades, readableOnPaper } from "@/lib/moodColors";
import { storyText } from "@/lib/storyCopyFallback";
import StoryFrame from "../StoryFrame";
import { DecoLayer, FitText, FONT, Grain, INK, INK_SOFT, LogoMark } from "../parts";
import type { StoryProps } from "../types";

const PAPER = "#FBF9F2";
const RED = "#C8102E";
const RULE = "#3A3357";
const COLS = "48px 236px 64px 72px 104px 1fr"; // No, Mata pelajaran, KKM, Nilai, Predikat, Deskripsi

/** Tanda tangan coretan */
function Signature({ d }: { d: string }) {
  return (
    <svg width={220} height={80} viewBox="0 0 220 80">
      <path d={d} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 21. "Rapor": laporan hasil belajar perasaan */
export default function Rapor({ playlist, mood }: StoryProps) {
  const sh = moodShades(mood.bg);
  // Warna cap: gelap mood, dipekatkan seperlunya supaya teks cap tetap kontras ≥ 4.5:1 (cap agak transparan + grain)
  const stamp = readableOnPaper(sh.dark, PAPER, 5.6);
  const text = storyText(playlist);
  const year = new Date().getFullYear();
  const cell: CSSProperties = { padding: "10px 8px", borderRight: `2px solid ${RULE}`, minWidth: 0, display: "flex", alignItems: "center" };
  const mid: CSSProperties = { ...cell, justifyContent: "center", textAlign: "center" };
  const head: CSSProperties = { ...cell, fontSize: 18, fontWeight: 800, textAlign: "center", textTransform: "uppercase", letterSpacing: 0.5 };
  const identity = [
    ["Nama", "Kamu"],
    ["Kelas", mood.name],
    ["Semester", `Ganjil ${year}`],
    ["Wali kelas", "Bu Feelist"],
  ];
  const absences = [
    ["Sakit hati", "2 hari"],
    ["Izin galau", "1 hari"],
    ["Tanpa keterangan", "0 hari"],
  ];
  const extras = [
    ["Paduan suara kamar mandi", "A"],
    ["Rebahan profesional", "A+"],
  ];

  return (
    <StoryFrame bg={PAPER} background={PAPER} decor={<DecoLayer><Grain opacity={0.18} blend="multiply" /></DecoLayer>}>
      <div style={{ color: INK }}>
        {/* Kop sekolah */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 104, height: 104, flexShrink: 0, borderRadius: "50%", border: `5px double ${INK}`, display: "grid", placeItems: "center" }}>
            <LogoMark size={70} outer={INK} middle={sh.dark} />
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 600, letterSpacing: 2 }}>YAYASAN PENDIDIKAN RASA</p>
            <p style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1 }}>SEKOLAH PERASAAN FEELIST</p>
            <p style={{ fontSize: 20, color: INK_SOFT }}>Jl. Hati No. 1, Kamar Sendiri · Terakreditasi A</p>
          </div>
        </div>
        <div style={{ marginTop: 16, borderTop: `5px solid ${INK}`, borderBottom: `2px solid ${INK}`, height: 5 }} />

        <p style={{ marginTop: 22, textAlign: "center", fontSize: 32, fontWeight: 800, letterSpacing: 1 }}>LAPORAN HASIL BELAJAR PERASAAN</p>

        {/* Identitas */}
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 6, columnGap: 30, fontSize: 24 }}>
          {identity.map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 10, minWidth: 0 }}>
              <span style={{ width: 130, flexShrink: 0, color: INK_SOFT }}>{k}</span>
              <span>:</span>
              <FitText lines={1} style={{ minWidth: 0, fontSize: 24, fontWeight: 700 }}>
                {v}
              </FitText>
            </div>
          ))}
        </div>

        {/* Tabel nilai */}
        <div style={{ marginTop: 20, border: `2px solid ${RULE}` }}>
          <div style={{ display: "grid", gridTemplateColumns: COLS, background: "#EDEAF4", borderBottom: `2px solid ${RULE}` }}>
            {["No", "Mata pelajaran", "KKM", "Nilai", "Predikat", "Deskripsi"].map((h, i) => (
              <div key={h} style={{ ...head, justifyContent: "center", borderRight: i === 5 ? "none" : head.borderRight }}>
                {h}
              </div>
            ))}
          </div>
          {text.report.map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: COLS, alignItems: "stretch", borderBottom: i === 4 ? "none" : `2px solid ${RULE}`, fontSize: 22 }}>
              <div style={mid}>{i + 1}</div>
              <div style={cell}>
                <FitText lines={2} style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
                  {r.subject}
                </FitText>
              </div>
              <div style={mid}>70</div>
              <div style={{ ...mid, fontWeight: 800, fontSize: 26 }}>{r.score}</div>
              <div style={{ ...mid, fontFamily: FONT.marker, fontSize: 34, lineHeight: 1, color: RED }}>
                {r.grade}
              </div>
              <div style={{ ...cell, borderRight: "none" }}>
                <FitText lines={2} style={{ fontSize: 20, lineHeight: 1.25, color: INK_SOFT }}>
                  {r.note}
                </FitText>
              </div>
            </div>
          ))}
        </div>

        {/* Ekstrakurikuler & ketidakhadiran */}
        <div style={{ marginTop: 18, display: "flex", gap: 24, fontSize: 22 }}>
          {[
            { title: "Ekstrakurikuler", rows: extras },
            { title: "Ketidakhadiran", rows: absences },
          ].map((b) => (
            <div key={b.title} style={{ flex: 1, minWidth: 0, border: `2px solid ${RULE}`, padding: "12px 16px" }}>
              <p style={{ fontWeight: 800, fontSize: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>{b.title}</p>
              {b.rows.map(([k, v]) => (
                <div key={k} style={{ marginTop: 6, display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span>{k}</span>
                  <span style={{ fontWeight: 800, whiteSpace: "nowrap" }}>{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Catatan wali kelas */}
        <div style={{ marginTop: 18, border: `2px solid ${RULE}`, padding: "12px 18px" }}>
          <p style={{ fontWeight: 800, fontSize: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>Catatan wali kelas</p>
          <FitText lines={2} style={{ marginTop: 4, fontFamily: FONT.serif, fontStyle: "italic", fontSize: 30, lineHeight: 1.2 }}>
            “{text.reportNote}”
          </FitText>
        </div>

        {/* Keputusan */}
        <div style={{ marginTop: 18, display: "flex", alignItems: "baseline", gap: 14, fontSize: 26 }}>
          <span style={{ fontWeight: 700 }}>Keputusan:</span>
          <FitText lines={1} style={{ minWidth: 0, fontSize: 30, fontWeight: 800 }}>
            Naik ke kelas <span style={{ textDecoration: "underline", textDecorationThickness: 3, textUnderlineOffset: 6 }}>{text.trainRoute.to}</span>
          </FitText>
        </div>

        {/* Tanda tangan */}
        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", fontSize: 22, textAlign: "center" }}>
          <div>
            <p>Orang tua/wali</p>
            <Signature d="M10 52 C 30 20, 46 18, 50 44 S 70 66, 86 34 S 118 20, 124 48 C 130 64, 160 40, 200 30" />
            <p style={{ fontWeight: 800 }}>Diri sendiri</p>
          </div>
          <div style={{ position: "relative" }}>
            <p>Wali kelas</p>
            <Signature d="M14 46 C 40 10, 60 70, 84 30 C 96 12, 108 60, 128 40 S 170 22, 206 44" />
            <p style={{ fontWeight: 800 }}>Bu Feelist</p>
            {/* Cap sekolah di samping tanda tangan */}
            <div
              style={{
                position: "absolute",
                left: -170,
                top: 6,
                width: 140,
                height: 140,
                boxSizing: "border-box",
                borderRadius: "50%",
                border: `4px solid ${stamp}`,
                color: stamp,
                opacity: 0.9,
                transform: "rotate(-14deg)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: 1,
              }}
            >
              <span>SEKOLAH</span>
              <span style={{ fontSize: 22 }}>FEELIST</span>
              <span>{year}</span>
            </div>
          </div>
        </div>
      </div>
    </StoryFrame>
  );
}
