// Status "sudah dibuka" Rangkuman bulanan (per bulan), di localStorage perangkat ini.
// Dipakai banner beranda: rangkuman yang sudah dibuka atau bannernya ditutup tidak ditawarkan lagi.

const KEY = "feelist:recap-seen";
const id = (year: number, month: number) => `${year}-${String(month).padStart(2, "0")}`;

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function isRecapSeen(year: number, month: number) {
  return read().includes(id(year, month));
}

export function markRecapSeen(year: number, month: number) {
  try {
    const list = read();
    if (!list.includes(id(year, month))) localStorage.setItem(KEY, JSON.stringify([...list, id(year, month)].slice(-24)));
  } catch {
    // penyimpanan diblokir: banner bisa muncul lagi, tidak masalah
  }
}

/** Bulan sebelum (year, month) */
export const previousMonth = (year: number, month: number) => (month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 });
