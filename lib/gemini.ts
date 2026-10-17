import { ApiError, GoogleGenAI, ThinkingLevel, type GenerateContentResponse } from "@google/genai";
import {
  PLAYLIST_JSON_SCHEMA,
  PlaylistAIError,
  SYSTEM_PROMPT,
  buildUserPrompt,
  isPlaceholderKey,
  parsePlaylistJson,
  type AIPlaylist,
  type GenerateInput,
} from "./prompt";

// Model utama (bisa diganti lewat env). Default: Gemini 3.8 Flash (gratis di free tier)
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

// Model cadangan kalau model utama sibuk (503), kuotanya habis (429), atau tidak tersedia.
// Free tier sering penuh di jam ramai, jadi dicoba berurutan.
const FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS ?? "gemini-3.6-flash,gemini-3.5-flash-lite")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const MODELS = [...new Set([MODEL, ...FALLBACK_MODELS])];

// Batas waktu total semua percobaan (route punya maxDuration 60 detik)
const TOTAL_BUDGET_MS = 50_000;
const ATTEMPT_TIMEOUT_MS = 30_000;

let client: GoogleGenAI | null = null;
function getClient() {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new PlaylistAIError("Server belum diatur: GEMINI_API_KEY belum diisi (lokal: file .env.local · Vercel: Settings → Environment Variables, lalu Redeploy).", 500);
  }
  if (isPlaceholderKey(key)) {
    throw new PlaylistAIError(
      "GEMINI_API_KEY masih berisi contoh dari .env.example. Ganti dengan key asli dari Google AI Studio.",
      500,
    );
  }
  client ??= new GoogleGenAI({ apiKey: key });
  return client;
}

/** Error yang layak dicoba ulang dengan model lain */
function isRetryable(err: unknown) {
  if (err instanceof ApiError) return [404, 429, 500, 502, 503, 504].includes(err.status);
  return err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError");
}

/** Ubah error dari Gemini jadi pesan yang ramah untuk pengguna */
function toUserError(err: unknown): PlaylistAIError {
  if (err instanceof ApiError) {
    if (err.status === 429) {
      return new PlaylistAIError("Kuota gratis AI lagi habis. Tunggu sebentar (atau besok) lalu coba lagi.", 503);
    }
    if (err.status === 400 && /api key/i.test(err.message)) {
      return new PlaylistAIError("API key Gemini nggak valid. Cek lagi GEMINI_API_KEY.", 500);
    }
    if (err.status === 401 || err.status === 403) {
      return new PlaylistAIError("API key Gemini nggak punya akses. Cek lagi GEMINI_API_KEY.", 500);
    }
    if (err.status === 404) {
      return new PlaylistAIError(`Model Gemini nggak ditemukan. Cek GEMINI_MODEL (${MODELS.join(", ")}).`, 500);
    }
    if (err.status === 503) {
      return new PlaylistAIError("AI-nya lagi rame banget dipakai orang. Coba lagi sebentar lagi, ya.", 503);
    }
    return new PlaylistAIError("AI-nya lagi bermasalah. Coba lagi sebentar lagi, ya.");
  }
  if (err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError")) {
    return new PlaylistAIError("AI-nya kelamaan mikir. Coba lagi, ya.", 504);
  }
  return new PlaylistAIError("Nggak bisa nyambung ke AI. Cek koneksi lalu coba lagi.", 504);
}

function callModel(ai: GoogleGenAI, model: string, prompt: string, timeoutMs: number) {
  return ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      // Paksa jawaban berupa JSON sesuai skema
      responseMimeType: "application/json",
      responseJsonSchema: PLAYLIST_JSON_SCHEMA,
      temperature: 1,
      maxOutputTokens: 8192,
      // Mode berpikir ringan supaya cepat (hanya untuk model Gemini 3 ke atas)
      ...(model.startsWith("gemini-3") ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
      abortSignal: AbortSignal.timeout(timeoutMs),
    },
  });
}

/** Minta rekomendasi playlist ke Gemini, pindah ke model cadangan kalau perlu. */
export async function generateWithGemini(input: GenerateInput, budgetMs = TOTAL_BUDGET_MS): Promise<AIPlaylist> {
  const ai = getClient();
  const prompt = buildUserPrompt(input);
  const deadline = Date.now() + budgetMs;

  let response: GenerateContentResponse | null = null;
  let lastError: unknown = null;

  for (const model of MODELS) {
    const remaining = deadline - Date.now();
    if (remaining < 5_000) break; // waktu hampir habis, jangan mulai percobaan baru
    try {
      response = await callModel(ai, model, prompt, Math.min(ATTEMPT_TIMEOUT_MS, remaining));
      break;
    } catch (err) {
      lastError = err;
      const status = err instanceof ApiError ? err.status : (err as Error)?.name;
      console.warn(`[gemini] ${model} gagal (${status})${isRetryable(err) ? ", coba model berikutnya" : ""}`);
      if (!isRetryable(err)) break; // misalnya key salah: percuma coba model lain
    }
  }

  if (!response) {
    console.error("[gemini] semua percobaan gagal:", lastError);
    throw toUserError(lastError);
  }

  // Permintaan diblokir filter keamanan
  const finish = response.candidates?.[0]?.finishReason;
  if (response.promptFeedback?.blockReason || finish === "SAFETY" || finish === "PROHIBITED_CONTENT") {
    throw new PlaylistAIError("AI-nya nggak bisa memproses mood ini. Coba tulis dengan kata lain.", 422);
  }

  const text = response.text ?? "";
  if (!text.trim()) {
    throw new PlaylistAIError("AI-nya nggak ngasih jawaban. Coba lagi, ya.");
  }

  return parsePlaylistJson(text);
}
