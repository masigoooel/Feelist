import type { NextRequest } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

// Proxy gambar Deezer supaya bisa digambar ke kartu Story tanpa membuat
// canvas "tainted" oleh CORS (html-to-image butuh gambar dari origin yang sama).

function isDeezerCdn(url: URL) {
  return (
    url.protocol === "https:" &&
    (url.hostname === "dzcdn.net" || url.hostname.endsWith(".dzcdn.net"))
  );
}

export async function GET(request: NextRequest) {
  // Satu halaman hasil memuat ±25 cover; 600/menit cukup longgar tapi mencegah penyalahgunaan bandwidth
  if (!rateLimit(`image:${getClientIp(request.headers)}`, 600, 60_000).ok) {
    return new Response("Terlalu banyak permintaan", { status: 429 });
  }
  const raw = request.nextUrl.searchParams.get("url");
  let target: URL;
  try {
    target = new URL(raw ?? "");
  } catch {
    return new Response("URL nggak valid", { status: 400 });
  }
  // Hanya izinkan CDN gambar Deezer, supaya tidak jadi open proxy
  if (!isDeezerCdn(target)) return new Response("Host nggak diizinkan", { status: 400 });

  try {
    const res = await fetch(target, { signal: AbortSignal.timeout(8000) });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) {
      return new Response("Gambar nggak ketemu", { status: 404 });
    }
    return new Response(res.body, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
      },
    });
  } catch {
    return new Response("Gagal ambil gambar", { status: 502 });
  }
}
