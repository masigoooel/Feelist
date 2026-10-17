// Kasus pesan untuk layar error (components/ErrorState.tsx)

export type ErrorCode = "ramai" | "kosong" | "offline" | "lainnya";

/** Status HTTP / jenis kegagalan → kasus pesan error */
export function errorCodeFor(status: number | null, offline: boolean): ErrorCode {
  if (offline) return "offline";
  if (status === 429 || status === 503) return "ramai"; // rate limit / kuota AI habis / AI penuh
  if (status === 404) return "kosong"; // tidak ada lagu yang lolos verifikasi Deezer
  return "lainnya";
}
