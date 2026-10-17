import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Permanent_Marker, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import { MoodColorProvider } from "@/components/MoodColors";
import NoZoomWhenInstalled from "@/components/NoZoomWhenInstalled";
import ServiceWorker from "@/components/ServiceWorker";
import { DEFAULT_THEME } from "@/lib/moods";
import "./globals.css";

// Satu-satunya font: Plus Jakarta Sans
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  fallback: ["Helvetica Neue", "sans-serif"],
});

// Font tambahan khusus kartu Story (mesin tik, judul elegan, spidol). preload: false → beranda tidak ikut
// mengunduhnya; file font baru diambil saat template yang memakainya tampil (lalu ikut ter-embed di PNG).
const mono = Space_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "700"], display: "swap", preload: false });
const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});
const marker = Permanent_Marker({ variable: "--font-marker", subsets: ["latin"], weight: "400", display: "swap", preload: false });

export const metadata: Metadata = {
  title: "feelist",
  description:
    "Ceritain mood kamu, feelist bikinin playlist yang pas lengkap dengan preview lagu.",
  applicationName: "feelist",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "feelist",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: DEFAULT_THEME.bg, // diganti halaman saat mood berubah
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${mono.variable} ${serif.variable} ${marker.variable} h-full antialiased`}
      // Warna awal dari palet bawaan (lib/moods.ts)
      style={
        {
          "--mood-bg": DEFAULT_THEME.bg,
          "--mood-accent": DEFAULT_THEME.accent,
          "--mood-soft": DEFAULT_THEME.soft,
          "--page-bg": DEFAULT_THEME.bg,
          "--mood-speed": "0.7s",
          "--mini-space": "0px",
        } as React.CSSProperties
      }
    >
      <body className="min-h-full">
        <MoodColorProvider>{children}</MoodColorProvider>
        {/* Service worker (Serwist): cache halaman, font, logo, ikon & cover untuk mode offline */}
        <ServiceWorker />
        <NoZoomWhenInstalled />
      </body>
    </html>
  );
}
