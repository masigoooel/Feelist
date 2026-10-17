import { generateWithClaude } from "./claude";
import { generateWithGemini } from "./gemini";
import { PlaylistAIError, type AIPlaylist, type GenerateInput } from "./prompt";

// Pilih penyedia AI lewat env AI_PROVIDER: "gemini" (gratis, default) atau "claude" (berbayar)
const PROVIDER = (process.env.AI_PROVIDER || "gemini").toLowerCase();

// Kuota AI gratis dipakai bersama semua pengguna: batasi yang berjalan bersamaan di instance ini.
// Kalau penuh, langsung tolak (503 → layar "Lagi ramai banget") daripada menumpuk antrean panjang.
const MAX_CONCURRENT_AI = 6;
// Di globalThis supaya berlaku bersama untuk semua route yang memanggil AI
const gateStore = globalThis as typeof globalThis & { __feelistAI?: { active: number } };
const gate = (gateStore.__feelistAI ??= { active: 0 });

/** `budgetMs` = batas waktu panggilan ini (dipakai saat minta lagu tambahan) */
export async function generatePlaylist(input: GenerateInput, budgetMs?: number): Promise<AIPlaylist> {
  if (gate.active >= MAX_CONCURRENT_AI) {
    throw new PlaylistAIError("AI-nya lagi rame banget dipakai orang. Coba lagi sebentar lagi, ya.", 503);
  }
  gate.active++;
  try {
    return await (PROVIDER === "claude" ? generateWithClaude(input, budgetMs) : generateWithGemini(input, budgetMs));
  } finally {
    gate.active--;
  }
}
