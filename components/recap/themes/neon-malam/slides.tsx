"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { coverSrc } from "@/lib/cover";
import { MOODS, type MoodKey } from "@/lib/moods";
import { SLIDE_COPY } from "@/lib/recap/copy";
import type { ListenerTypeId } from "@/lib/recap/types";
import { DIM_OPACITY, NEON, NEON_FONT, neonBox, neonMood, neonText } from "@/lib/recap/themes/neonMalam";
import { FitText } from "../../../FitText";
import { downloadFile, recapFileName, renderImage, shareOrDownload } from "../../exportImage";
import type { SlideProps } from "../../types";
import { useCountUp } from "../../useCountUp";
import { capitalize, Kicker, Rise, SlideBody, Tag } from "./parts";

const serif: CSSProperties = { fontFamily: NEON_FONT.serif, fontStyle: "italic", fontWeight: 400 };
const mono: CSSProperties = { fontFamily: NEON_FONT.mono };
const pad = (n: number) => String(n).padStart(2, "0");
const moodLabel = (m: MoodKey | null) => (m ? MOODS[m].label : "Campur");
const TAG_COLORS = [NEON.pink, NEON.cyan, NEON.yellow];

// ---------- 1. Cover ----------
export function Cover({ recap }: SlideProps) {
  const { edition, copy } = recap;
  return (
    <SlideBody>
      <Kicker>{SLIDE_COPY.editionLabel(edition.number, edition.monthName)}</Kicker>
      <div className="relative mt-24">
        {/* Pantulan di genangan: efek CSS (bukan teks kedua, jadi tidak dibaca ulang pembaca layar) */}
        <h2
          className="nm-ignite m-0 text-[84px] leading-[0.9] lowercase"
          style={{ ...serif, ...neonText(NEON.pink), WebkitBoxReflect: "below 6px linear-gradient(transparent 40%, rgb(0 0 0 / 0.38))" } as CSSProperties}
        >
          {edition.title}
        </h2>
      </div>
      <div aria-hidden className="absolute right-6 top-[150px] size-[96px] rounded-full" style={neonBox(NEON.cyan, 1.4)} />
      <div className="mt-auto flex flex-col gap-4">
        <Rise delay={0.5} style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>
          {copy.opening}
        </Rise>
        <div className="flex flex-wrap gap-2">
          {copy.coverTags.map((t, i) => (
            <Tag key={t} color={TAG_COLORS[i % 3]} delay={0.8 + i * 0.12}>
              {t}
            </Tag>
          ))}
        </div>
      </div>
    </SlideBody>
  );
}

// ---------- 2. Angka ----------
function NumberBox({ value, label, color, delay }: { value: number; label: string; color: string; delay: number }) {
  const n = useCountUp(value, 1200, delay * 1000);
  return (
    <div className="nm-fade-up flex flex-1 flex-col items-center gap-1 rounded-3xl px-3 py-6" style={{ ...neonBox(color), animationDelay: `${delay}s` }}>
      <span className="text-[64px] font-bold leading-none" style={{ ...mono, ...neonText(color) }}>
        {n}
      </span>
      <span className="text-[15px] font-bold">{label}</span>
    </div>
  );
}

export function Numbers({ recap }: SlideProps) {
  const { totals, copy, favoriteWindow, edition } = recap;
  return (
    <SlideBody>
      <Kicker>{edition.monthName}</Kicker>
      <div className="mt-10 flex gap-3">
        <NumberBox value={totals.sessions} label={SLIDE_COPY.numbers.sessions} color={NEON.pink} delay={0.15} />
        <NumberBox value={totals.tracks} label={SLIDE_COPY.numbers.tracks} color={NEON.cyan} delay={0.3} />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {copy.tags.map((t, i) => (
          <Tag key={t} color={NEON.yellow} delay={0.6 + i * 0.12}>
            {t}
          </Tag>
        ))}
      </div>
      <div className="mt-auto flex flex-col gap-3">
        {/* Tanpa jendela jam favorit: slide jam dilewati, kalimatnya masuk ke sini */}
        {!favoriteWindow && (
          <Rise delay={0.9} style={{ fontSize: 20, fontWeight: 700 }}>
            {capitalize(copy.hours)}
          </Rise>
        )}
        <Rise delay={1.05} style={{ ...serif, fontSize: 34, lineHeight: 1.1 }}>
          {copy.trend}
        </Rise>
      </div>
    </SlideBody>
  );
}

// ---------- 3. Kuis ----------
export function Quiz({ recap, onNext }: SlideProps) {
  const [picked, setPicked] = useState<MoodKey | null>(null);
  const quiz = recap.quiz!;
  const countOf = (m: MoodKey) => recap.moods.find((x) => x.mood === m)?.count ?? 0;
  const right = picked === quiz.answer;
  return (
    <SlideBody>
      <Kicker>Kuis</Kicker>
      <Rise as="h2" delay={0.2} style={{ marginTop: 28, fontSize: 30, fontWeight: 800, lineHeight: 1.15 }}>
        {SLIDE_COPY.quiz.question}
      </Rise>
      <div className="mt-8 flex flex-col gap-3" role="group" aria-label={SLIDE_COPY.quiz.question}>
        {quiz.options.map((m, i) => {
          const c = neonMood(m);
          const isAnswer = m === quiz.answer;
          const dim = picked !== null && !isAnswer;
          return (
            <button
              key={m}
              type="button"
              disabled={picked !== null}
              aria-pressed={picked === m}
              onClick={() => setPicked(m)}
              className="nm-fade-up flex h-16 items-center justify-between rounded-[20px] bg-transparent px-5 text-left text-[20px] font-extrabold disabled:cursor-default"
              style={{
                animationDelay: `${0.4 + i * 0.12}s`,
                ...(dim ? { border: "2px solid rgb(255 255 255 / 0.2)", color: "rgb(255 255 255 / 0.55)", opacity: 1 - DIM_OPACITY / 2 } : { ...neonBox(c, picked && isAnswer ? 1.6 : 0.8), ...neonText(c) }),
              }}
            >
              {MOODS[m].label}
              {picked !== null && isAnswer && (
                <span className="text-[18px]" style={mono}>
                  {SLIDE_COPY.quiz.count(countOf(m))}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-auto flex flex-col gap-4" aria-live="polite">
          <p className="nm-fade-up m-0 text-[24px] font-extrabold" style={neonText(right ? NEON.yellow : NEON.cyan)}>
            {right ? SLIDE_COPY.quiz.right : SLIDE_COPY.quiz.wrong(MOODS[quiz.answer].label)}
          </p>
          <button
            type="button"
            onClick={onNext}
            className="nm-fade-up h-[52px] rounded-[26px] bg-transparent text-[16px] font-extrabold"
            style={{ ...neonBox(NEON.yellow, 0.7), color: NEON.yellow, animationDelay: "0.15s" }}
          >
            {SLIDE_COPY.quiz.next}
          </button>
        </div>
      )}
    </SlideBody>
  );
}

// ---------- 4. Mood ----------
export function Mood({ recap }: SlideProps) {
  const top = recap.topMood!;
  const c = neonMood(top.mood);
  const n = useCountUp(top.count, 900, 600);
  return (
    <SlideBody>
      <Kicker>{SLIDE_COPY.mood.label}</Kicker>
      <h2 className="nm-ignite m-0 mt-16 text-[76px] font-extrabold leading-[0.95] tracking-[-0.03em]" style={neonText(c)}>
        {MOODS[top.mood].label}
      </h2>
      <div className="nm-fade-up mt-10 grid size-[150px] place-items-center self-center rounded-full" style={{ ...neonBox(c, 1.2), animationDelay: "0.5s" }}>
        <span className="text-[48px] font-bold" style={{ ...mono, ...neonText(c) }}>
          {SLIDE_COPY.mood.times(n)}
        </span>
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        {recap.moods.slice(1).map((m, i) => (
          <Tag key={m.mood} color={neonMood(m.mood)} lit={m.count >= 2} delay={0.9 + i * 0.1}>
            {MOODS[m.mood].label} {SLIDE_COPY.mood.times(m.count)}
          </Tag>
        ))}
      </div>
    </SlideBody>
  );
}

// ---------- 5. Kalender (mulai Senin) ----------
function monthGrid(year: number, month: number, days: { day: number; mood: MoodKey | null; count: number }[]) {
  const offset = (new Date(year, month - 1, 1).getDay() + 6) % 7; // Senin = 0
  return [...Array.from({ length: offset }, () => null), ...days];
}

export function Calendar({ recap }: SlideProps) {
  const cells = monthGrid(recap.year, recap.month, recap.calendar);
  let lit = 0;
  return (
    <SlideBody>
      <Kicker>{SLIDE_COPY.calendar.label}</Kicker>
      <Rise as="h2" delay={0.1} style={{ ...serif, marginTop: 14, fontSize: 52, lineHeight: 1, ...neonText(NEON.pink) }}>
        {recap.edition.monthName}
      </Rise>
      <div className="mt-8 grid grid-cols-7 gap-1.5" style={mono}>
        {SLIDE_COPY.calendar.weekdays.map((d) => (
          <span key={d} className="pb-1 text-center text-[11px] font-bold" style={{ color: NEON.dim }}>
            {d}
          </span>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <span key={`x${i}`} aria-hidden />;
          const has = cell.count > 0;
          const c = cell.mood ? neonMood(cell.mood) : NEON.white;
          const delay = has ? 0.3 + lit++ * 0.12 : 0;
          return (
            <span
              key={cell.day}
              aria-label={`${cell.day}: ${has ? moodLabel(cell.mood) : SLIDE_COPY.calendar.empty}`}
              className={`grid aspect-square place-items-center rounded-[10px] text-[13px] font-bold ${has ? "nm-light" : ""}`}
              style={
                has
                  ? { ...neonBox(c, 0.7), background: `color-mix(in srgb, ${c} 22%, transparent)`, color: NEON.white, animationDelay: `${delay}s` }
                  : { border: "1px solid rgb(255 255 255 / 0.12)", color: "rgb(255 255 255 / 0.55)" }
              }
            >
              {cell.day}
            </span>
          );
        })}
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        {recap.moods.map((m, i) => (
          <Tag key={m.mood} color={neonMood(m.mood)} delay={0.6 + i * 0.08}>
            {MOODS[m.mood].label}
          </Tag>
        ))}
      </div>
    </SlideBody>
  );
}

// ---------- 6. Jam ----------
export function Hours({ recap }: SlideProps) {
  const w = recap.favoriteWindow!;
  const R = 96;
  const angle = (h: number) => (h / 24) * Math.PI * 2 - Math.PI / 2; // jam 0 di atas
  const pt = (h: number, r: number) => [120 + r * Math.cos(angle(h)), 120 + r * Math.sin(angle(h))];
  const [x1, y1] = pt(w.start, R);
  const [x2, y2] = pt(w.start + 2, R);
  const arcLen = (R * 2 * Math.PI * 2) / 24;
  return (
    <SlideBody>
      <Kicker>{SLIDE_COPY.hours.label}</Kicker>
      <p className="nm-ignite m-0 mt-10 text-[76px] font-bold leading-none" style={{ ...mono, ...neonText(NEON.cyan) }}>
        {pad(w.start)}.00
      </p>
      <p className="m-0 mt-2 text-[16px] font-bold" style={{ ...mono, color: NEON.dim }}>
        {SLIDE_COPY.hours.range(`${pad(w.start)}.00`, `${pad(w.end)}.00`)}
      </p>
      <svg viewBox="0 0 240 240" width={240} height={240} className="mt-6 self-center" aria-hidden>
        <circle cx={120} cy={120} r={R} fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth={2} />
        {Array.from({ length: 24 }, (_, h) => {
          const [a, b] = pt(h, R - 8);
          const [c, d] = pt(h, R - (h % 6 === 0 ? 16 : 12));
          return <line key={h} x1={a} y1={b} x2={c} y2={d} stroke="rgb(255 255 255 / 0.5)" strokeWidth={h % 6 === 0 ? 2 : 1} />;
        })}
        {[0, 6, 12, 18].map((h) => {
          const [x, y] = pt(h, R - 30);
          return (
            <text key={h} x={x} y={y + 4} textAnchor="middle" fontSize={12} fill="rgb(255 255 255 / 0.7)" style={mono}>
              {h}
            </text>
          );
        })}
        {/* Busur jendela favorit */}
        <path
          className="nm-draw"
          d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`}
          fill="none"
          stroke={NEON.pink}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={arcLen}
          style={{ "--nm-len": arcLen, filter: `drop-shadow(0 0 6px ${NEON.pink})` } as CSSProperties}
        />
        {/* Jarum berputar ke jam favorit */}
        <g className="nm-hand" style={{ "--nm-deg": `${w.start * 15 + 15}deg`, transformBox: "view-box", transformOrigin: "120px 120px" } as CSSProperties}>
          <line x1={120} y1={120} x2={120} y2={44} stroke={NEON.yellow} strokeWidth={3} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${NEON.yellow})` }} />
        </g>
        <circle cx={120} cy={120} r={6} fill={NEON.yellow} />
      </svg>
      <Rise delay={1} style={{ ...serif, marginTop: "auto", fontSize: 40, lineHeight: 1.05 }}>
        Kamu {recap.copy.hours}
      </Rise>
    </SlideBody>
  );
}

// ---------- 7. Lagu ----------
const EQ = Array.from({ length: 18 }, (_, i) => ({ h: 18 + ((i * 37) % 40), d: (i * 0.13) % 0.9 }));

export function Track({ recap }: SlideProps) {
  const t = recap.topTrack!;
  return (
    <SlideBody>
      <Kicker>{SLIDE_COPY.track.label}</Kicker>
      <div className="relative mt-8 size-[230px] self-center rounded-full" style={neonBox(NEON.pink, 0.8)}>
        <div
          className="nm-spin absolute inset-0 grid place-items-center rounded-full"
          style={{ background: "repeating-radial-gradient(circle, #0d0b16 0 2px, #1c1928 2px 4px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- cover lewat proxy (tersimpan offline) */}
          <img src={coverSrc(t.cover)} alt="" width={96} height={96} className="size-24 rounded-full object-cover" />
          <span className="absolute size-3 rounded-full" style={{ background: NEON.bg }} />
        </div>
      </div>
      <div className="mt-8">
        <Rise delay={0.3}>
          <FitText as="span" lines={2} style={{ display: "block", fontSize: 34, fontWeight: 800, lineHeight: 1.05 }}>
            {t.title}
          </FitText>
        </Rise>
        <Rise delay={0.4} style={{ fontSize: 16, fontWeight: 600, color: NEON.dim, marginTop: 6 }}>
          {t.artist}
        </Rise>
      </div>
      <p className="nm-fade-up m-0 mt-4 text-[22px] font-bold" style={{ ...mono, ...neonText(NEON.pink), animationDelay: "0.6s" }}>
        {SLIDE_COPY.track.replay(t.count)}
      </p>
      {recap.topArtist && (
        <div className="mt-3">
          <Tag color={NEON.cyan} delay={0.8}>
            {SLIDE_COPY.track.artist(recap.topArtist.name)}
          </Tag>
        </div>
      )}
      <div aria-hidden className="mt-auto flex h-14 items-end justify-between">
        {EQ.map((b, i) => (
          <span key={i} className="nm-eq w-[10px] rounded-t-[3px]" style={{ height: b.h, background: i % 2 ? NEON.cyan : NEON.pink, boxShadow: `0 0 8px ${i % 2 ? NEON.cyan : NEON.pink}`, animationDelay: `${b.d}s` }} />
        ))}
      </div>
    </SlideBody>
  );
}

// ---------- 8. Tipe pendengar ----------
const ILLUSTRATION: Record<ListenerTypeId, string> = {
  "penikmat-sendu": "M60 26c14 20 22 33 22 44a22 22 0 0 1-44 0c0-11 8-24 22-44Z", // tetes hujan
  "pencari-semangat": "M66 18 34 66h22l-6 36 32-50H60l6-34Z", // petir
  pengelana: "M60 20a40 40 0 1 0 0 80 40 40 0 1 0 0-80Zm16 24-10 26-26 10 10-26 26-10Z", // kompas
  "anak-pagi": "M60 42a18 18 0 1 0 0 36 18 18 0 1 0 0-36ZM60 18v12M60 90v12M18 60h12M90 60h12M30 30l8 8M82 82l8 8M90 30l-8 8M38 82l-8 8", // matahari
  "anak-malam": "M74 24a36 36 0 1 0 22 54 30 30 0 0 1-22-54Z", // bulan sabit
  "serba-rasa": "M60 22l7 22 22 7-22 7-7 22-7-22-22-7 22-7 7-22ZM88 76l3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9Z", // kilau
};

export function ListenerType({ recap }: SlideProps) {
  const t = recap.listenerType;
  return (
    <SlideBody>
      <Kicker>{SLIDE_COPY.listener.label}</Kicker>
      <svg viewBox="0 0 120 120" width={112} height={112} className="nm-ignite mt-6" aria-hidden>
        <path d={ILLUSTRATION[t.id]} fill="none" stroke={NEON.yellow} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${NEON.yellow})` }} />
      </svg>
      <Rise as="h2" delay={0.3} style={{ ...serif, marginTop: 8, fontSize: 52, lineHeight: 1, ...neonText(NEON.pink) }}>
        {t.name}
      </Rise>
      <Rise delay={0.45} style={{ marginTop: 12, fontSize: 16, fontWeight: 500, lineHeight: 1.45 }}>
        {t.description}
      </Rise>
      <div className="mt-6 flex flex-col gap-3">
        {t.traits.map((tr, i) => (
          <div key={tr.label} className="nm-fade-up" style={{ animationDelay: `${0.6 + i * 0.12}s` }}>
            <div className="flex justify-between text-[14px] font-bold">
              <span>{tr.label}</span>
              <span style={mono}>{tr.value}%</span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-[5px]" style={{ background: "rgb(255 255 255 / 0.12)" }}>
              <div className="nm-fill h-full rounded-[5px]" style={{ width: `${tr.value}%`, background: `linear-gradient(90deg, ${NEON.pink}, ${NEON.cyan})`, boxShadow: `0 0 10px ${NEON.pink}`, animationDelay: `${0.7 + i * 0.12}s` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto flex flex-col gap-3">
        <Rise delay={1} style={{ ...serif, fontSize: 22, lineHeight: 1.2 }}>
          {recap.copy.slider}
        </Rise>
        <div className="flex flex-wrap gap-2">
          <Tag color={NEON.yellow} delay={1.1}>
            {SLIDE_COPY.listener.match(t.match.name)}
          </Tag>
          {t.rarity !== null && (
            <Tag color={NEON.cyan} delay={1.2}>
              {SLIDE_COPY.listener.rarity(t.rarity)}
            </Tag>
          )}
        </div>
      </div>
    </SlideBody>
  );
}

// ---------- 9. Penutup ----------
export function Closing({ recap, theme, onRestart }: SlideProps) {
  const exportNode = useRef<HTMLDivElement>(null);
  const file = useRef<Promise<File> | null>(null);
  const [busy, setBusy] = useState(false);
  const { edition, totals, copy } = recap;
  const fileName = recapFileName(edition.monthName, recap.year);
  const ShareImage = theme.ShareImage;

  // Gambar 1080×1920 disiapkan di latar belakang begitu slide tampil, supaya "Bagikan" bisa langsung
  // membuka lembar berbagi (browser HP hanya mengizinkannya tepat setelah ketukan)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (exportNode.current && !file.current) file.current = renderImage(exportNode.current.firstElementChild as HTMLElement, fileName);
    }, 700);
    return () => clearTimeout(timer);
  }, [fileName]);
  const cells = monthGrid(recap.year, recap.month, recap.calendar);
  const stats = [
    { label: SLIDE_COPY.closing.stats.sessions, value: String(totals.sessions) },
    { label: SLIDE_COPY.closing.stats.tracks, value: String(totals.tracks) },
    { label: SLIDE_COPY.closing.stats.minutes, value: totals.minutes !== null ? String(totals.minutes) : "–" },
    { label: SLIDE_COPY.closing.stats.mood, value: moodLabel(recap.topMood?.mood ?? null) },
  ];

  async function run(share: boolean) {
    if (!exportNode.current || busy) return;
    setBusy(true);
    try {
      file.current ??= renderImage(exportNode.current.firstElementChild as HTMLElement, fileName);
      const png = await file.current;
      if (share) await shareOrDownload(png);
      else downloadFile(png);
    } catch (err) {
      file.current = null; // coba render ulang di klik berikutnya
      console.error("[rangkuman] gagal bikin gambar:", err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SlideBody>
      {/* Kartu edisi di layar; yang dibagikan / disimpan adalah versi statis 1080×1920 (theme.ShareImage) */}
      <div className="nm-fade-up rounded-3xl p-5" style={{ ...neonBox(NEON.pink, 0.8), background: NEON.bg }}>
        <p className="m-0 text-[11px] font-bold uppercase tracking-[3px]" style={{ ...mono, ...neonText(NEON.cyan) }}>
          {SLIDE_COPY.editionLabel(edition.number, edition.monthName)} · {recap.year}
        </p>
        <h2 className="m-0 mt-2 text-[46px] leading-[0.95] lowercase" style={{ ...serif, ...neonText(NEON.pink) }}>
          {edition.title}
        </h2>
        <p className="m-0 mt-3 text-[15px] font-semibold leading-snug text-white">{copy.closing}</p>
        <div aria-hidden className="mt-4 grid grid-cols-7 gap-1">
          {cells.map((c, i) => (
            <span
              key={i}
              className="h-2.5 rounded-full"
              style={{ background: !c ? "transparent" : c.mood ? neonMood(c.mood) : c.count ? "rgb(255 255 255 / 0.6)" : "rgb(255 255 255 / 0.1)", boxShadow: c?.mood ? `0 0 6px ${neonMood(c.mood)}` : "none" }}
            />
          ))}
        </div>
        <dl className="m-0 mt-4 grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl px-3 py-2" style={{ border: "1px solid rgb(255 255 255 / 0.18)" }}>
              <dd className="m-0 text-[22px] font-bold leading-tight" style={{ ...mono, ...neonText(NEON.yellow) }}>
                {s.value}
              </dd>
              <dt className="text-[12px] font-bold" style={{ color: NEON.dim }}>
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-auto flex flex-col gap-2.5">
        <button type="button" disabled={busy} onClick={() => run(true)} className="h-[52px] rounded-[26px] border-0 text-[16px] font-extrabold disabled:opacity-70" style={{ background: NEON.pink, color: NEON.bg }}>
          {SLIDE_COPY.closing.share}
        </button>
        <button type="button" disabled={busy} onClick={() => run(false)} className="h-[52px] rounded-[26px] bg-transparent text-[16px] font-extrabold disabled:opacity-70" style={{ ...neonBox(NEON.cyan, 0.6), color: NEON.cyan }}>
          {SLIDE_COPY.closing.save}
        </button>
        <button type="button" onClick={onRestart} className="h-11 rounded-[22px] border-0 bg-transparent text-[15px] font-bold text-white underline underline-offset-4">
          {SLIDE_COPY.closing.replay}
        </button>
      </div>

      {/* Versi statis 1080×1920 (sumber gambar yang dibagikan / disimpan), di luar layar */}
      <div ref={exportNode} aria-hidden className="nm-static" style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none" }}>
        <ShareImage recap={recap} />
      </div>
    </SlideBody>
  );
}
