import "./neon.css";
import type { Recap } from "@/lib/recap";
import { NEON, NEON_FONT } from "@/lib/recap/themes/neonMalam";
import type { RecapTheme } from "../../types";
import { Backdrop, Enter } from "./parts";
import { ShareImage } from "./ShareImage";
import { Calendar, Closing, Cover, Hours, ListenerType, Mood, Numbers, Quiz, Track } from "./slides";

const noop = () => {};

/** Sampul edisi statis (arsip): latar + slide cover tanpa animasi */
function Thumbnail({ recap }: { recap: Recap }) {
  return (
    <div className="nm-root nm-static relative overflow-hidden" style={{ width: 390, height: 844, background: NEON.bg }}>
      <Backdrop />
      <Cover recap={recap} theme={neonMalam} onNext={noop} onRestart={noop} />
    </div>
  );
}

export const neonMalam: RecapTheme = {
  id: "neonMalam",
  palette: { bg: NEON.bg, text: NEON.white, accent: NEON.pink, accent2: NEON.cyan, highlight: NEON.yellow },
  fonts: NEON_FONT,
  pageBg: "#000000",
  canvasBg: NEON.bg,
  progress: { track: "rgb(255 255 255 / 0.22)", fill: NEON.pink },
  Backdrop,
  Enter,
  slides: { cover: Cover, numbers: Numbers, quiz: Quiz, mood: Mood, calendar: Calendar, hours: Hours, track: Track, listenerType: ListenerType, closing: Closing },
  ShareImage,
  Thumbnail,
};
