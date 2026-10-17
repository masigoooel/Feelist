"use client";

import { useLayoutEffect, useRef } from "react";
import { keepHyphens } from "@/lib/keepHyphens";

type Props = {
  text: string;
  className?: string;
};

/** Judul besar yang mengecil sendiri kalau ada kata yang lebih lebar dari wadahnya, jadi kata tidak pernah terpotong */
export default function FitTitle({ text, className }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = ""; // mulai dari ukuran CSS (paling besar)
      for (let i = 0; i < 4 && el.scrollWidth > el.clientWidth; i++) {
        const size = parseFloat(getComputedStyle(el).fontSize);
        el.style.fontSize = `${Math.floor((size * el.clientWidth) / el.scrollWidth)}px`;
      }
    };
    fit();
    document.fonts.ready.then(fit); // ukur ulang setelah font asli selesai dimuat
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  return (
    <h1 ref={ref} tabIndex={-1} className={className}>
      {keepHyphens(text)}
    </h1>
  );
}
