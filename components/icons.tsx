// Ikon garis sederhana (warna mengikuti teks)
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export const SliderIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </svg>
);

export const RefreshIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 4v4h-4" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

/** Ikon tiga batang untuk lagu yang sedang diputar */
export const PlayingIcon = ({ color, ...p }: IconProps & { color: string }) => (
  <svg {...base} {...p} stroke={color} strokeWidth={2.6}>
    <path d="M7 10v4M12 6v12M17 8.5v7" />
  </svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const DownloadIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </svg>
);

export const PlayIcon = (p: IconProps) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
  </svg>
);

export const PauseIcon = (p: IconProps) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <rect x="6" y="5" width="4" height="14" rx="1.5" />
    <rect x="14" y="5" width="4" height="14" rx="1.5" />
  </svg>
);

export const NextIcon = (p: IconProps) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <path d="M5 6.2v11.6a1 1 0 0 0 1.53.85L15 13.2V17a1 1 0 0 0 2 0V7a1 1 0 0 0-2 0v3.8L6.53 5.35A1 1 0 0 0 5 6.2Z" />
  </svg>
);

export const PrevIcon = (p: IconProps) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <path d="M19 6.2v11.6a1 1 0 0 1-1.53.85L9 13.2V17a1 1 0 0 1-2 0V7a1 1 0 0 1 2 0v3.8l8.47-5.45A1 1 0 0 1 19 6.2Z" />
  </svg>
);

/** Tautan keluar (buka di aplikasi / situs lain) */
export const ExternalIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
);

/** Bagikan: kotak dengan panah ke atas */
export const ShareIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 15V3M7.5 7.5 12 3l4.5 4.5M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
  </svg>
);

export const TrashIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M9 7V4.5A.5.5 0 0 1 9.5 4h5a.5.5 0 0 1 .5.5V7M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M10 11v6M14 11v6" />
  </svg>
);
