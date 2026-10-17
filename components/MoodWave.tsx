import { readableOnPaper } from "@/lib/moodColors";
import { liftColor } from "@/lib/moodSlider";
import type { MoodKey } from "@/lib/moods";

// Warna gelombang mood Galau (sesuai desain); mood lain memakai turunan warna Geser mood-nya
const GALAU_COLORS = ["#2A3A8C", "#4A56B0", "#7A47C2", "#B0506A", "#C2541F"];
const WORDS = {
  ceria: ["sendu banget", "sendu", "hangat", "ceria", "ceria banget"],
  energi: ["santai banget", "santai", "sedang", "semangat", "semangat banget"],
};
const DURATION = [3.6, 2.8, 2.1, 1.6, 1.2]; // detik per 72 unit, lift 1–5
const DURATION_ACTIVE = [2.4, 1.8, 1.3, 0.95, 0.7];

/** Path sinus x 0–144 (dua kali lebar viewBox) supaya bisa digeser 72 unit dan berulang mulus */
function wavePath(lift: number, active: boolean) {
  const cycles = 1 + lift; // bilangan bulat: satu periode habis tepat di 72 → loop mulus
  const amp = (1.5 + lift * 1.7) * (active ? 1.15 : 1);
  let d = "";
  for (let x = 0; x <= 144; x += 1.5) {
    const y = 12 + Math.sin((x / 72) * cycles * 2 * Math.PI) * amp;
    d += `${x === 0 ? "M" : "L"}${x} ${y.toFixed(2)}`;
  }
  return d;
}

/** Indikator gelombang suara tingkat lift (1–5) di ujung kanan baris lagu */
export default function MoodWave({
  lift,
  active,
  mood,
  liftName,
}: {
  lift: number;
  active: boolean;
  mood: MoodKey | null;
  liftName: "ceria" | "energi";
}) {
  const level = Math.min(5, Math.max(1, Math.round(lift)));
  // Grafik di atas putih: kontras minimal 3:1
  const color = mood === "galau" ? GALAU_COLORS[level - 1] : readableOnPaper(liftColor(mood, level), "#FFFFFF", 3);
  return (
    <svg
      viewBox="0 0 72 24"
      width={84}
      height={28}
      role="img"
      aria-label={WORDS[liftName][level - 1]}
      className="shrink-0 overflow-hidden"
    >
      <g className="mood-wave" style={{ animationDuration: `${(active ? DURATION_ACTIVE : DURATION)[level - 1]}s` }}>
        <path d={wavePath(level, active)} fill="none" stroke={color} strokeWidth={active ? 2.8 : 2.2} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
