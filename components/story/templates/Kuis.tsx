import type { MoodKey } from "@/lib/moods";
import { moodShades } from "@/lib/moodColors";
import { storyText } from "@/lib/storyCopyFallback";
import StoryFrame from "../StoryFrame";
import { DecoLayer, DecoSparkle, FitText, INK, INK_SOFT, seededRandom, StoryCover } from "../parts";
import type { StoryProps } from "../types";

// "Paling cocok diputar" per mood
const BEST_TIME: Record<MoodKey, string> = {
  galau: "Jam 2 pagi",
  bahagia: "Pagi yang cerah",
  semangat: "Sebelum mulai kerja",
  hujan: "Sore gerimis",
  perjalanan: "Di kursi jendela",
  "patah-hati": "Saat sendirian",
};

/** 18. "Kuis": layar hasil kuis kepribadian musik */
export default function Kuis({ playlist, mood }: StoryProps) {
  const sh = moodShades(mood.bg);
  const { quiz } = storyText(playlist);
  const rand = seededRandom(playlist.playlistTitle + (playlist.tracks[0]?.id ?? ""));
  const players = (40000 + Math.floor(rand() * 160000)).toLocaleString("id-ID");
  const first = playlist.tracks[0];
  const covers = playlist.tracks.slice(0, 4);

  return (
    <StoryFrame
      bg={mood.bg}
      background={`linear-gradient(180deg, ${mood.bg} 0%, ${sh.dark} 100%)`}
      decor={
        <DecoLayer>
          <DecoSparkle size={56} color={mood.accent} style={{ left: 120, top: 120 }} />
          <DecoSparkle size={34} color="#FFFFFF" style={{ left: 880, top: 160 }} />
          <DecoSparkle size={44} color={mood.accent} style={{ left: 900, top: 1700 }} />
          <div style={{ position: "absolute", left: -200, top: 1600, width: 560, height: 560, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        </DecoLayer>
      }
    >
      {/* Progres kuis */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ flex: 1, height: 14, borderRadius: 7, background: "#FFFFFF" }} />
        <span style={{ fontSize: 26, fontWeight: 700, whiteSpace: "nowrap" }}>10/10 selesai</span>
      </div>
      <p style={{ marginTop: 26, fontSize: 46, fontWeight: 800, lineHeight: 1.1 }}>Kamu tipe pendengar yang mana?</p>
      <p style={{ marginTop: 8, fontSize: 26, fontWeight: 500 }}>Dimainkan {players} orang</p>

      {/* Kartu hasil */}
      <div style={{ marginTop: 30, background: "#FFFFFF", color: INK, borderRadius: 40, padding: "40px 44px" }}>
        <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
          <div style={{ width: 180, height: 180, flexShrink: 0, borderRadius: 30, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", background: sh.light }}>
            {covers.length === 4 ? covers.map((t) => <StoryCover key={t.id} src={t.cover} size={90} radius={0} bg={mood.bg} />) : first && <StoryCover src={first.cover} size={180} radius={0} bg={mood.bg} />}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <span style={{ display: "inline-block", padding: "8px 18px", borderRadius: 20, background: sh.dark, color: "#FFFFFF", fontSize: 22, fontWeight: 700 }}>
              Langka · cuma {quiz.rarity}% orang
            </span>
            <p style={{ marginTop: 12, fontSize: 24, fontWeight: 600, color: INK_SOFT }}>Tipe kamu:</p>
            <FitText lines={2} style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.05 }}>
              {quiz.type}
            </FitText>
          </div>
        </div>

        <FitText lines={4} style={{ marginTop: 24, fontSize: 27, lineHeight: 1.38, color: INK_SOFT }}>
          {quiz.description}
        </FitText>

        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 16 }}>
          {quiz.traits.map((t) => (
            <div key={t.label}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 20, fontSize: 25, fontWeight: 700 }}>
                <FitText lines={1} style={{ minWidth: 0, fontSize: 25 }}>
                  {t.label}
                </FitText>
                <span>{t.value}%</span>
              </div>
              <div style={{ marginTop: 8, height: 16, borderRadius: 8, background: "#ECE8F6" }}>
                <div style={{ width: `${t.value}%`, height: "100%", borderRadius: 8, background: sh.dark }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 26, display: "flex", gap: 18 }}>
          {[
            { label: "Lagu andalan", value: first?.title ?? "-" },
            { label: "Paling cocok diputar", value: playlist.mood ? BEST_TIME[playlist.mood] : "Kapan saja" },
          ].map((b) => (
            <div key={b.label} style={{ flex: 1, minWidth: 0, background: "#F3F0FA", borderRadius: 24, padding: "18px 22px" }}>
              <p style={{ fontSize: 22, fontWeight: 600, color: INK_SOFT }}>{b.label}</p>
              <FitText lines={1} style={{ marginTop: 4, fontSize: 30, fontWeight: 800 }}>
                {b.value}
              </FitText>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "auto", display: "flex", gap: 20 }}>
        <div style={{ flex: 1, height: 92, borderRadius: 46, border: "3px solid #FFFFFF", boxSizing: "border-box", display: "grid", placeItems: "center", fontSize: 32, fontWeight: 700 }}>
          Ulangi kuis
        </div>
        <div style={{ flex: 1, height: 92, borderRadius: 46, background: mood.accent, color: INK, display: "grid", placeItems: "center", fontSize: 32, fontWeight: 700 }}>
          Cek tipemu
        </div>
      </div>
    </StoryFrame>
  );
}
