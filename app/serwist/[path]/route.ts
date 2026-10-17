// File service worker (sw.js) dari Serwist, dibuat saat build.
// Versi bawaan createSerwistRoute mengekspor `dynamic`/`dynamicParams`/`revalidate`, yang tidak
// kompatibel dengan cacheComponents. Di sini cukup generateStaticParams + "use cache"
// (pola Route Handler + Cache Components dari dokumentasi Next.js).
import { randomUUID } from "node:crypto";
import { createSerwistRoute } from "@serwist/turbopack";

const serwist = createSerwistRoute({
  swSrc: "app/sw.ts",
  useNativeEsbuild: true,
  // Pola bawaan Serwist + font (woff/woff2 dari next/font)
  globPatterns: [".next/static/**/*.{js,css,html,ico,png,svg,webp,json,webmanifest,woff,woff2}", "public/**/*"],
  // Halaman-halaman ikut disimpan supaya aplikasi (termasuk riwayat) bisa dibuka tanpa internet
  additionalPrecacheEntries: ["/", "/riwayat", "/hasil", "/rangkuman"].map((url) => ({
    url,
    revision: process.env.VERCEL_GIT_COMMIT_SHA ?? randomUUID(),
  })),
});

export const generateStaticParams = serwist.generateStaticParams;

async function serviceWorkerFile(path: string) {
  "use cache";
  const res = await serwist.GET(new Request("http://localhost/serwist"), { params: Promise.resolve({ path }) });
  return { body: await res.text(), type: res.headers.get("Content-Type") ?? "application/javascript" };
}

export async function GET(_request: Request, { params }: RouteContext<"/serwist/[path]">) {
  const { path } = await params;
  const file = await serviceWorkerFile(path);
  return new Response(file.body, {
    headers: {
      "Content-Type": file.type,
      "Service-Worker-Allowed": "/",
      "Cache-Control": "no-cache",
    },
  });
}
