import Anthropic from "@anthropic-ai/sdk";
import {
  PlaylistAIError,
  SYSTEM_PROMPT,
  buildUserPrompt,
  isPlaceholderKey,
  parsePlaylistJson,
  type AIPlaylist,
  type GenerateInput,
} from "./prompt";

// Opsional (berbayar). Aktifkan dengan AI_PROVIDER=claude di .env.local
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

// Server-side fallback ("default") hanya didukung model generasi baru
const SUPPORTS_FALLBACK = /^claude-(opus-5|fable-5|sonnet-5-5)/.test(MODEL);

let client: Anthropic | null = null;
function getClient() {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    throw new PlaylistAIError("Server belum diatur: ANTHROPIC_API_KEY belum diisi (lokal: file .env.local · Vercel: Settings → Environment Variables, lalu Redeploy).", 500);
  }
  if (isPlaceholderKey(key)) {
    throw new PlaylistAIError(
      "ANTHROPIC_API_KEY masih berisi contoh dari .env.example. Ganti dengan key asli dari console Anthropic.",
      500,
    );
  }
  client ??= new Anthropic({ apiKey: key, timeout: 45_000, maxRetries: 1 });
  return client;
}

/** Minta rekomendasi playlist ke Claude. */
export async function generateWithClaude(input: GenerateInput, budgetMs?: number): Promise<AIPlaylist> {
  const anthropic = getClient();

  let response;
  try {
    response = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      // Effort rendah: cukup untuk tugas rekomendasi, dan jauh lebih cepat
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(input) }],
      // Kalau model menolak permintaan, server Anthropic otomatis coba model cadangan
      ...(SUPPORTS_FALLBACK
        ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }
        : {}),
    }, budgetMs ? { timeout: budgetMs } : undefined);
  } catch (err) {
    console.error("[claude] request gagal:", err);
    if (err instanceof Anthropic.AuthenticationError) {
      throw new PlaylistAIError("API key Anthropic nggak valid. Cek lagi ANTHROPIC_API_KEY.", 500);
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new PlaylistAIError("AI-nya lagi kebanjiran permintaan. Tunggu sebentar terus coba lagi.", 503);
    }
    if (err instanceof Anthropic.APIConnectionError) {
      throw new PlaylistAIError("Nggak bisa nyambung ke AI. Cek koneksi lalu coba lagi.", 504);
    }
    if (err instanceof Anthropic.APIError) {
      throw new PlaylistAIError("AI-nya lagi bermasalah. Coba lagi sebentar lagi, ya.");
    }
    throw err;
  }

  if (response.stop_reason === "refusal") {
    throw new PlaylistAIError("AI-nya nggak bisa memproses mood ini. Coba tulis dengan kata lain.", 422);
  }

  const text = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");

  if (!text.trim()) {
    throw new PlaylistAIError("AI-nya nggak ngasih jawaban. Coba lagi, ya.");
  }

  return parsePlaylistJson(text);
}
