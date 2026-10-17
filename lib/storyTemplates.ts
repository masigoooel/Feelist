import type { ComponentType } from "react";
import BuktiTransfer from "@/components/story/templates/BuktiTransfer";
import CD from "@/components/story/templates/CD";
import Chat from "@/components/story/templates/Chat";
import Diputar from "@/components/story/templates/Diputar";
import FlyerGigs from "@/components/story/templates/FlyerGigs";
import KarcisKereta from "@/components/story/templates/KarcisKereta";
import Kolase from "@/components/story/templates/Kolase";
import Kuis from "@/components/story/templates/Kuis";
import Mixtape from "@/components/story/templates/Mixtape";
import Notifikasi from "@/components/story/templates/Notifikasi";
import Poster from "@/components/story/templates/Poster";
import PosterFilm from "@/components/story/templates/PosterFilm";
import Ramalan from "@/components/story/templates/Ramalan";
import Rapor from "@/components/story/templates/Rapor";
import RasaKamu from "@/components/story/templates/RasaKamu";
import RollFilm from "@/components/story/templates/RollFilm";
import Setlist from "@/components/story/templates/Setlist";
import Struk from "@/components/story/templates/Struk";
import Tiket from "@/components/story/templates/Tiket";
import Utas from "@/components/story/templates/Utas";
import Zine from "@/components/story/templates/Zine";
import type { StoryProps } from "@/components/story/types";
import type { MoodKey } from "./moods";
import type { StoryTemplateId } from "./storyTemplateIds";

export { isStoryTemplateId, type StoryTemplateId } from "./storyTemplateIds";

export type StoryCategory = "seru" | "ngobrol" | "kalcer" | "lokal";

/** Tab di layar "Pilih gaya kartu"; "rekomendasi" berisi 3 template sesuai mood */
export const STORY_CATEGORIES: { id: "rekomendasi" | StoryCategory; label: string }[] = [
  { id: "rekomendasi", label: "Rekomendasi" },
  { id: "seru", label: "Seru" },
  { id: "ngobrol", label: "Ngobrol" },
  { id: "kalcer", label: "Kalcer" },
  { id: "lokal", label: "Lokal" },
];
export type StoryTab = (typeof STORY_CATEGORIES)[number]["id"];

export type StoryTemplate = {
  id: StoryTemplateId;
  label: string;
  component: ComponentType<StoryProps>;
  category: StoryCategory;
};

export const STORY_TEMPLATES: StoryTemplate[] = [
  { id: "rasa-kamu", label: "Rasa kamu", category: "seru", component: RasaKamu },
  { id: "poster", label: "Poster", category: "seru", component: Poster },
  { id: "tiket", label: "Tiket", category: "seru", component: Tiket },
  { id: "kolase", label: "Kolase", category: "seru", component: Kolase },
  { id: "struk", label: "Struk", category: "seru", component: Struk },
  { id: "diputar", label: "Diputar", category: "seru", component: Diputar },
  { id: "ramalan", label: "Ramalan", category: "seru", component: Ramalan },
  { id: "chat", label: "Chat", category: "ngobrol", component: Chat },
  { id: "utas", label: "Utas", category: "ngobrol", component: Utas },
  { id: "notifikasi", label: "Notifikasi", category: "ngobrol", component: Notifikasi },
  { id: "kuis", label: "Kuis", category: "ngobrol", component: Kuis },
  { id: "zine", label: "Zine", category: "kalcer", component: Zine },
  { id: "roll-film", label: "Roll film", category: "kalcer", component: RollFilm },
  { id: "flyer-gigs", label: "Flyer gigs", category: "kalcer", component: FlyerGigs },
  { id: "poster-film", label: "Poster film", category: "kalcer", component: PosterFilm },
  { id: "setlist", label: "Setlist", category: "kalcer", component: Setlist },
  { id: "cd", label: "CD", category: "kalcer", component: CD },
  { id: "mixtape", label: "Mixtape", category: "kalcer", component: Mixtape },
  { id: "karcis-kereta", label: "Karcis kereta", category: "lokal", component: KarcisKereta },
  { id: "bukti-transfer", label: "Bukti transfer", category: "lokal", component: BuktiTransfer },
  { id: "rapor", label: "Rapor", category: "lokal", component: Rapor },
];

// 3 rekomendasi per mood; yang pertama = template awal yang terpilih
const RECOMMENDED: Record<MoodKey | "none", StoryTemplateId[]> = {
  galau: ["chat", "zine", "rapor"],
  "patah-hati": ["chat", "utas", "mixtape"],
  bahagia: ["rasa-kamu", "flyer-gigs", "kuis"],
  semangat: ["rasa-kamu", "setlist", "tiket"],
  hujan: ["mixtape", "roll-film", "zine"],
  perjalanan: ["karcis-kereta", "roll-film", "tiket"],
  none: ["rasa-kamu", "struk", "notifikasi"],
};

export function recommendedFor(mood: MoodKey | null): StoryTemplateId[] {
  return RECOMMENDED[mood ?? "none"];
}

/** Template awal = rekomendasi pertama untuk mood itu */
export function defaultTemplateFor(mood: MoodKey | null): StoryTemplateId {
  return recommendedFor(mood)[0];
}

/** Isi satu tab (urutan sesuai daftar kategori / rekomendasi) */
export function templatesInTab(tab: StoryTab, mood: MoodKey | null): StoryTemplate[] {
  if (tab === "rekomendasi") return recommendedFor(mood).map(templateById);
  return STORY_TEMPLATES.filter((t) => t.category === tab);
}

export const isStoryTab = (v: unknown): v is StoryTab => STORY_CATEGORIES.some((c) => c.id === v);

export function templateById(id: StoryTemplateId): StoryTemplate {
  return STORY_TEMPLATES.find((t) => t.id === id) ?? STORY_TEMPLATES[0];
}
