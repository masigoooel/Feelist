// Daftar id template kartu Story, terpisah dari komponennya supaya route API bisa memakainya tanpa memuat template
export const STORY_TEMPLATE_IDS = [
  "rasa-kamu",
  "poster",
  "tiket",
  "kolase",
  "struk",
  "chat",
  "mixtape",
  "ramalan",
  "diputar",
  "zine",
  "roll-film",
  "flyer-gigs",
  "poster-film",
  "setlist",
  "cd",
  "utas",
  "notifikasi",
  "kuis",
  "karcis-kereta",
  "bukti-transfer",
  "rapor",
] as const;

export type StoryTemplateId = (typeof STORY_TEMPLATE_IDS)[number];

export const isStoryTemplateId = (v: unknown): v is StoryTemplateId =>
  typeof v === "string" && (STORY_TEMPLATE_IDS as readonly string[]).includes(v);
