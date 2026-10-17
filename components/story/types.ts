import type { PlaylistResponse } from "@/lib/types";

/** Warna & nama mood untuk kartu Story */
export type StoryMood = {
  name: string;
  bg: string;
  accent: string;
  accentText: string; // aksen untuk TEKS: dicerahkan seperlunya supaya kontras ≥ 4.5:1 terhadap latar kartu
  meaning: string;
};

export type StoryProps = {
  playlist: PlaylistResponse;
  mood: StoryMood;
};
