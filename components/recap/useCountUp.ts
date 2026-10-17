"use client";

import { useEffect, useState } from "react";

/** Angka menghitung naik dari 0 (1,2 detik, ease-out). prefers-reduced-motion → langsung angka akhir. */
export function useCountUp(target: number, duration = 1200, delay = 200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }
    let frame = 0;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      setValue(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, delay]);
  return value;
}
