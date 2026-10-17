// Ekspor gambar rangkuman (1080×1920) dengan html-to-image, lalu Web Share (HP) atau unduh (desktop).

const PLACEHOLDER = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

function waitForImages(node: HTMLElement) {
  return Promise.all(
    [...node.querySelectorAll("img")].map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          }),
    ),
  );
}

/** Render node (ukuran 1080×1920) jadi File PNG */
export async function renderImage(node: HTMLElement, fileName: string): Promise<File> {
  await document.fonts.ready;
  await waitForImages(node);
  const { toPng } = await import("html-to-image");
  // Wajib: cover lewat /api/image?url=..., tanpa ini semua gambar dianggap sama oleh cache html-to-image
  const options = { width: 1080, height: 1920, pixelRatio: 1, includeQueryParams: true, imagePlaceholder: PLACEHOLDER };
  if (/^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent)) await toPng(node, options); // Safari: render 2x
  const url = await toPng(node, options);
  const blob = await (await fetch(url)).blob();
  return new File([blob], fileName, { type: "image/png" });
}

export function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** HP (layar sentuh): lembar berbagi bawaan; desktop / tidak didukung: unduh. Hasil: "share" | "download" | "cancel" */
export async function shareOrDownload(file: File): Promise<"share" | "download" | "cancel"> {
  // Chrome desktop (Windows/ChromeOS) juga punya Web Share, tapi di desktop gambar langsung diunduh
  const touch = matchMedia("(pointer: coarse)").matches;
  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return "share";
    } catch (err) {
      if ((err as Error).name === "AbortError") return "cancel";
    }
  }
  downloadFile(file);
  return "download";
}

/** "feelist-oktober-2026.png" */
export const recapFileName = (monthName: string, year: number) => `feelist-${monthName.toLowerCase()}-${year}.png`;
