import { readableOn } from "@/lib/moodColors";
import { threadCaption } from "@/lib/storyCopyFallback";
import StoryFrame from "../StoryFrame";
import { FitText, LogoMark, seededRandom, StoryCover } from "../parts";
import type { StoryProps } from "../types";

const DARK = "#0F1218";
const TEXT = "#E8EAED";
const MUTED = "#8E98A6";
const LINE = "#2A303A";

const ICONS: Record<string, string> = {
  balas: "M4 5h16v10H9l-5 4z",
  repost: "M7 7h10l-3-3M17 17H7l3 3M4 12V9a2 2 0 0 1 2-2M20 12v3a2 2 0 0 1-2 2",
  suka: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  markah: "M6 3h12v18l-6-4-6 4z",
  bagikan: "M12 3v12M7 8l5-5 5 5M5 14v6h14v-6",
};

/** Ikon garis generik 24×24 */
function Icon({ d, size, color }: { d: string; size: number; color: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
      <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Avatar({ size, bg, accent }: { size: number; bg: string; accent: string }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, flexShrink: 0, display: "grid", placeItems: "center" }}>
      <LogoMark size={size * 0.72} outer="#FFFFFF" middle={accent} />
    </div>
  );
}

/** Lencana centang generik (bukan lencana merek mana pun) */
function Badge({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width={30} height={30} style={{ flexShrink: 0 }}>
      <circle cx={12} cy={12} r={10} fill={color} />
      <path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke={DARK} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const fmt = (n: number) => n.toLocaleString("id-ID");

/** 16. "Utas": satu utas media sosial (mode gelap), tiap lagu satu balasan */
export default function Utas({ playlist, mood }: StoryProps) {
  const accent = readableOn(mood.accent, DARK);
  const rand = seededRandom(playlist.playlistTitle + (playlist.tracks[0]?.id ?? ""));
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, "0")}.${String(now.getMinutes()).padStart(2, "0")}`;
  const date = now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const views = (8 + rand() * 40).toFixed(1).replace(".", ",");
  const stats = [
    { n: 60 + Math.floor(rand() * 400), label: "Repost" },
    { n: 10 + Math.floor(rand() * 90), label: "Kutipan" },
    { n: 800 + Math.floor(rand() * 4000), label: "Suka" },
    { n: 40 + Math.floor(rand() * 300), label: "Markah" },
  ];
  const tag = playlist.playlistTitle.replace(/[^\p{L}\p{N}]+/gu, "");
  const songs = playlist.tracks.slice(0, 5);
  const total = songs.length + 1;
  const separator = { height: 1, background: LINE, margin: "0 -96px" } as const;

  return (
    <StoryFrame bg={DARK}>
      <div style={{ color: TEXT }}>
        {/* Bilah atas */}
        <div style={{ display: "flex", alignItems: "center", gap: 28, paddingBottom: 18 }}>
          <Icon d="M15 5l-7 7 7 7" size={40} color={TEXT} />
          <span style={{ fontSize: 36, fontWeight: 700 }}>Utas</span>
        </div>
        <div style={separator} />

        {/* Profil */}
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 20 }}>
          <Avatar size={84} bg={mood.bg} accent={mood.accent} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 32, fontWeight: 700 }}>feelist</span>
              <Badge color={accent} />
            </div>
            <span style={{ fontSize: 26, color: MUTED }}>@feelist</span>
          </div>
          <div style={{ height: 60, padding: "0 30px", borderRadius: 30, background: TEXT, color: DARK, fontSize: 26, fontWeight: 700, display: "flex", alignItems: "center" }}>
            Ikuti
          </div>
        </div>

        <FitText lines={4} style={{ marginTop: 16, fontSize: 36, lineHeight: 1.3 }}>
          Utas {songs.length} lagu buat kamu yang lagi {mood.name.toLowerCase()}. Simpan dulu, dengerin pelan-pelan, satu per satu.{" "}
          <span style={{ color: accent }}>#{tag} #feelist</span>
        </FitText>
        <p style={{ marginTop: 14, fontSize: 26, color: MUTED }}>
          {time} · {date} · <span style={{ color: TEXT, fontWeight: 700 }}>{views} rb</span> tayangan
        </p>

        <div style={{ ...separator, marginTop: 18 }} />
        <FitText lines={1} style={{ padding: "12px 0", fontSize: 26, color: MUTED }}>
          {stats.map((s) => (
            <span key={s.label} style={{ marginRight: 30 }}>
              <span style={{ color: TEXT, fontWeight: 700 }}>{fmt(s.n)}</span> {s.label}
            </span>
          ))}
        </FitText>
        <div style={separator} />
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px" }}>
          {Object.entries(ICONS).map(([k, d]) => (
            <Icon key={k} d={d} size={42} color={MUTED} />
          ))}
        </div>
        <div style={separator} />
      </div>

      {/* Balasan 2/6–6/6, avatar dihubungkan garis */}
      <div style={{ position: "relative", marginTop: 16, display: "flex", flexDirection: "column", gap: 10, color: TEXT }}>
        <div style={{ position: "absolute", left: 29, top: 30, bottom: 60, width: 3, background: LINE }} />
        {songs.map((t, i) => (
          <div key={t.id} style={{ position: "relative", display: "flex", gap: 20, alignItems: "flex-start" }}>
            <Avatar size={60} bg={mood.bg} accent={mood.accent} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 25, color: MUTED, whiteSpace: "nowrap" }}>
                <span style={{ color: TEXT, fontWeight: 700 }}>feelist</span> @feelist · {i + 2}/{total}
              </p>
              <FitText lines={1} style={{ marginTop: 2, fontSize: 30 }}>
                {threadCaption(playlist, t, i)}
              </FitText>
              <FitText lines={1} style={{ marginTop: 2, fontSize: 25, color: accent }}>
                <span style={{ fontWeight: 700 }}>♪ {t.title}</span> — {t.artist}
              </FitText>
            </div>
            <StoryCover src={t.cover} size={92} radius={14} bg={mood.bg} />
          </div>
        ))}
      </div>

      {/* Kolom balasan (minimal 20px dari balasan terakhir) */}
      <div style={{ flex: "1 0 20px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Avatar size={60} bg={mood.bg} accent={mood.accent} />
        <div style={{ flex: 1, height: 76, borderRadius: 38, background: "#1A1F28", border: `2px solid ${LINE}`, padding: "0 30px", display: "flex", alignItems: "center", fontSize: 28, color: MUTED }}>
          Posting balasanmu
        </div>
        <div style={{ height: 64, padding: "0 30px", borderRadius: 32, background: accent, color: DARK, fontSize: 26, fontWeight: 700, display: "flex", alignItems: "center" }}>
          Balas
        </div>
      </div>
    </StoryFrame>
  );
}
