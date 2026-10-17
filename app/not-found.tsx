import type { Metadata } from "next";
import Link from "next/link";
import DefaultColors from "@/components/DefaultColors";
import Logo from "@/components/Logo";

export const metadata: Metadata = { title: "Halaman nggak ketemu · feelist" };

/** 404: alamat yang tidak ada */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col px-8 text-white max-sm:px-4">
      <DefaultColors />
      <header className="flex h-[88px] items-center">
        <Link href="/" aria-label="Kembali ke beranda">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 flex-col items-start justify-center gap-5 pb-24">
        <p className="m-0 text-[15px] font-bold tracking-[3px]">404</p>
        <h1 tabIndex={-1} className="m-0 max-w-[14ch] text-[clamp(44px,7vw,96px)] font-extrabold leading-[0.95] tracking-[-0.045em]">
          Halaman ini nggak ketemu
        </h1>
        <p className="m-0 max-w-[40ch] text-[17px] font-medium">Mungkin alamatnya salah ketik, atau halamannya sudah pindah.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="flex h-12 items-center rounded-3xl bg-[#FFD84D] px-6 text-[15px] font-extrabold text-ink no-underline">
            Ke beranda
          </Link>
          <Link href="/riwayat" className="flex h-12 items-center rounded-3xl border-2 border-solid border-white/60 px-6 text-[15px] font-extrabold text-white no-underline">
            Playlist terakhir
          </Link>
        </div>
      </main>
    </div>
  );
}
