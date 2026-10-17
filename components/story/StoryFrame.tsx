import type { ReactNode, Ref } from "react";

export const STORY_W = 1080;
export const STORY_H = 1920;

type Props = {
  bg: string;
  background?: string; // latar khusus (mis. gradient); default = bg
  decor?: ReactNode; // hiasan yang boleh keluar dari area aman (posisi absolut), dirender di belakang konten
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
};

/**
 * Wadah kartu Story 1080x1920. Konten berada di area aman
 * (250px atas, 96px kiri-kanan, 340px bawah = bagian yang tertutup UI Instagram).
 */
export default function StoryFrame({ bg, background, decor, children, ref }: Props) {
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: STORY_W,
        height: STORY_H,
        overflow: "hidden",
        background: background ?? bg,
        color: "#FFFFFF",
        fontFamily: "var(--font-sans)",
      }}
    >
      {decor}
      <div
        className="story-content"
        style={{
          position: "relative",
          boxSizing: "border-box",
          height: "100%",
          padding: "250px 96px 340px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}
