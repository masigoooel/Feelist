import type { Recap, SlideId } from "./types";

const ORDER: SlideId[] = ["cover", "numbers", "quiz", "mood", "calendar", "hours", "track", "listenerType", "closing"];

/**
 * Slide yang ditampilkan, berurutan:
 * - "hours" dilewati kalau tidak ada jendela jam favorit (kalimat "kamu curhat kapan aja." masuk slide numbers)
 * - "track" dilewati kalau lagu teratas muncul < 2 kali
 * - "quiz" & "mood" dilewati kalau tidak ada playlist bermood sama sekali
 * - Kalimat slider tidak punya slide sendiri: masuk ke slide listenerType (recap.copy.slider)
 */
export function getSlides(recap: Recap): SlideId[] {
  return ORDER.filter((id) => {
    if (id === "hours") return recap.favoriteWindow !== null;
    if (id === "track") return (recap.topTrack?.count ?? 0) >= 2;
    if (id === "quiz") return recap.quiz !== null;
    if (id === "mood") return recap.moods.length > 0;
    return true;
  });
}
