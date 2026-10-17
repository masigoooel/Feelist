import { NextResponse, type NextRequest } from "next/server";
import { freshPreview } from "@/lib/deezer";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

// URL preview baru untuk lagu yang link-nya sudah kedaluwarsa (dipanggil browser saat preview gagal diputar)
export async function GET(request: NextRequest) {
  if (!rateLimit(`preview:${getClientIp(request.headers)}`, 60, 60_000).ok) {
    return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 });
  }
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!/^\d{1,20}$/.test(id)) return NextResponse.json({ error: "Id lagu nggak valid." }, { status: 400 });
  const preview = await freshPreview(id);
  if (!preview) return NextResponse.json({ error: "Preview nggak tersedia." }, { status: 404 });
  return NextResponse.json({ preview }, { headers: { "Cache-Control": "public, max-age=300, s-maxage=600" } });
}
