// Opsi filter & mood yang dipakai bersama oleh client dan server.

export const MAX_MOOD_LENGTH = 200;
export const MIN_MOOD_LENGTH = 2;

export const LANGUAGES = [
  { value: "campur", label: "Campur" },
  { value: "indonesia", label: "Indonesia" },
  { value: "internasional", label: "Internasional" },
] as const;

export const ERAS = [
  { value: "bebas", label: "Bebas" },
  { value: "90an", label: "90-an" },
  { value: "2000an", label: "2000-an" },
  { value: "2010an", label: "2010-an" },
  { value: "terbaru", label: "Terbaru" },
] as const;

export const ENERGIES = [
  { value: "santai", label: "Santai" },
  { value: "sedang", label: "Sedang" },
  { value: "tinggi", label: "Tinggi" },
] as const;

export type Language = (typeof LANGUAGES)[number]["value"];
export type Era = (typeof ERAS)[number]["value"];
export type Energy = (typeof ENERGIES)[number]["value"];

// Cek apakah sebuah nilai termasuk salah satu opsi yang valid
export function isOption<T extends string>(
  options: readonly { value: T }[],
  value: unknown,
): value is T {
  return typeof value === "string" && options.some((o) => o.value === value);
}
