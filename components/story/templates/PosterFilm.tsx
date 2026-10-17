import { mix } from "@/lib/color";
import { moodShades } from "@/lib/moodColors";
import StoryFrame from "../StoryFrame";
import { DecoLayer, FitText, FONT, Grain, INK, INK_SOFT, LogoMark, seededRandom } from "../parts";
import type { StoryProps } from "../types";

const PAPER = "#EDE7DC";

const LEAF = "M0 0 C 10 -11, 30 -11, 40 0 C 30 11, 10 11, 0 0 Z"; // daun runcing, pangkal di (0,0)

/**
 * Daun karangan laurel kiri di sepanjang busur elips (pusat 380,92; rx 330; ry 78), dari bawah ke atas.
 * Tiap titik punya sepasang daun yang mengarah ke ujung cabang, miring ±38° dari batang; sisi kanan = cermin.
 */
function laurelLeaves() {
  const left: { x: number; y: number; rot: number }[] = [];
  for (let i = 0; i <= 8; i++) {
    const a = ((228 - i * 12.5) * Math.PI) / 180;
    const x = 380 + 330 * Math.cos(a);
    const y = 92 - 78 * Math.sin(a);
    const grow = (Math.atan2(78 * Math.cos(a), 330 * Math.sin(a)) * 180) / Math.PI; // arah tumbuh (ke atas)
    if (i === 8) left.push({ x, y, rot: grow });
    else left.push({ x, y, rot: grow - 38 }, { x, y, rot: grow + 38 });
  }
  return [...left, ...left.map((l) => ({ x: 760 - l.x, y: l.y, rot: 180 - l.rot }))];
}

/** 13. "Poster film": poster festival film indie, playlist sebagai filmnya */
export default function PosterFilm({ playlist, mood }: StoryProps) {
  const sh = moodShades(mood.bg);
  const year = new Date().getFullYear();
  const rand = seededRandom(playlist.playlistTitle + (playlist.tracks[0]?.id ?? ""));
  const stars = Array.from({ length: 22 }, () => ({ x: rand() * 888, y: rand() * 230, r: 1.5 + rand() * 2.5 }));
  const stars3 = playlist.tracks.slice(0, 3);
  const artists = [...new Set(playlist.tracks.slice(0, 5).map((t) => t.artist))].slice(0, 3);
  const titleSize = playlist.playlistTitle.length > 24 ? 108 : 132;
  const hill = mix(sh.deep, "#000000", 0.35);
  const leaves = laurelLeaves();
  const join = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} dan ${xs[xs.length - 1]}` : xs[0] ?? "");

  return (
    <StoryFrame bg={PAPER} background={PAPER} decor={<DecoLayer><Grain opacity={0.3} blend="multiply" /></DecoLayer>}>
      {/* Laurel festival */}
      <div style={{ position: "relative", alignSelf: "center", width: 760, height: 170, color: INK }}>
        <svg width={760} height={170} style={{ position: "absolute", inset: 0 }}>
          <path d="M191 28 A330 78 0 0 0 177 154" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
          <path d="M569 28 A330 78 0 0 1 583 154" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
          {leaves.map((l, i) => (
            <path key={i} d={LEAF} fill={INK} transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`} />
          ))}
        </svg>
        <div style={{ position: "absolute", inset: "0 230px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: FONT.serif, lineHeight: 1.15 }}>
          <span style={{ fontSize: 20, letterSpacing: 4 }}>SELEKSI RESMI</span>
          <span style={{ fontSize: 30, fontStyle: "italic", whiteSpace: "nowrap" }}>Festival Kamar Sendiri</span>
          <span style={{ fontSize: 22, letterSpacing: 3 }}>{year}</span>
        </div>
      </div>

      {/* Ilustrasi minimal: langit warna mood, cakrawala, bulan, sosok kecil */}
      <div
        style={{
          marginTop: 40,
          position: "relative",
          height: 440,
          overflow: "hidden",
          background: `linear-gradient(180deg, ${sh.deep} 0%, ${mood.bg} 62%, ${sh.light} 100%)`,
        }}
      >
        <svg width={888} height={440} style={{ position: "absolute", inset: 0 }}>
          {stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" opacity={0.75} />
          ))}
          <circle cx={640} cy={128} r={92} fill="#FFFFFF" opacity={0.12} />
          <circle cx={640} cy={128} r={62} fill="#F6EFDF" />
          <path d="M0 360 C 180 318, 330 330, 470 352 S 760 330, 888 342 L 888 440 L 0 440 Z" fill={hill} />
          <path d="M0 392 C 220 372, 520 388, 888 376 L 888 440 L 0 440 Z" fill={mix(hill, "#000000", 0.3)} />
          {/* Sosok kecil berdiri di bukit */}
          <g transform="translate(300 300)" fill="#0E0A1F">
            <circle cx={10} cy={6} r={7} />
            <path d="M3 15 h14 l2 24 h-5 l-1 16 h-6 l-1 -16 h-5 z" />
          </g>
        </svg>
      </div>

      <FitText
        lines={2}
        style={{ marginTop: 40, textAlign: "center", color: INK, fontFamily: FONT.serif, fontStyle: "italic", fontSize: titleSize, lineHeight: 0.95, paddingBottom: 10 }}
      >
        {playlist.playlistTitle}
      </FitText>
      {playlist.description && (
        <FitText lines={2} style={{ marginTop: 14, textAlign: "center", color: INK_SOFT, fontFamily: FONT.serif, fontSize: 40, lineHeight: 1.2 }}>
          {playlist.description}
        </FitText>
      )}

      {/* Blok kredit */}
      <FitText
        lines={4}
        style={{ marginTop: 36, textAlign: "center", color: INK, fontSize: 21, fontWeight: 600, letterSpacing: 1.5, lineHeight: 1.6, textTransform: "uppercase" }}
      >
        dibintangi <b style={{ fontWeight: 800 }}>{join(stars3.map((t) => t.title))}</b> · musik oleh{" "}
        <b style={{ fontWeight: 800 }}>{join(artists)}</b> · disutradarai oleh <b style={{ fontWeight: 800 }}>perasaanmu sendiri</b>
      </FitText>

      <div style={{ marginTop: "auto", alignSelf: "center", display: "flex", alignItems: "center", gap: 14, color: INK }}>
        <LogoMark size={56} outer={INK} middle={mood.bg} />
        <span style={{ fontSize: 42, fontWeight: 800, letterSpacing: 10, whiteSpace: "nowrap" }}>SEGERA DI FEELIST</span>
      </div>
    </StoryFrame>
  );
}
