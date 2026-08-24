import { useState } from "react";
import { cn } from "@/lib/utils";

export type Dimension = "k" | "p" | "v";

export interface Segment {
  text: string;
  dim?: Dimension;
}

const DIM_META: Record<Dimension, { label: string; question: string; mark: string; chip: string }> = {
  k: {
    label: "지식·이해",
    question: "무엇을 알아야 하는가?",
    // 강조색은 Action Blue 하나뿐 — 나머지는 잉크 농담과 밑줄 형태로 구분한다.
    mark: "text-action decoration-action/45 decoration-2 underline underline-offset-[6px]",
    chip: "border-action/40 bg-action/[0.06] text-action",
  },
  p: {
    label: "과정·기능",
    question: "무엇을 할 수 있어야 하는가?",
    mark: "text-ink decoration-ink/45 decoration-2 underline underline-offset-[6px]",
    chip: "border-ink/30 bg-canvas-parchment text-ink",
  },
  v: {
    label: "가치·태도",
    question: "어떤 태도로 대하는가?",
    mark: "text-ink-48 decoration-ink-48/60 decoration-dotted decoration-2 underline underline-offset-[6px]",
    chip: "border-hairline bg-canvas text-ink-48",
  },
};

/**
 * 성취기준 한 문장을 세 차원으로 색 분해해서 보여 준다.
 * 칩을 누르면 해당 부분만 남고 나머지는 흐려진다 — 프로젝터에서 함께 읽기 좋게.
 */
export function StandardDissect({
  code,
  segments,
  notes,
}: {
  code: string;
  segments: Segment[];
  notes?: Partial<Record<Dimension, string>>;
}) {
  const [focus, setFocus] = useState<Dimension | null>(null);
  const inSentence = (d: Dimension) => segments.some((s) => s.dim === d);
  // 문장에 없는 차원도 설명이 있으면 카드로 남긴다 — "여기엔 없다"는 것 자체가 오늘의 요점이다.
  const shown = (["k", "p", "v"] as Dimension[]).filter((d) => inSentence(d) || !!notes?.[d]);
  const present = shown.filter(inSentence);

  return (
    <div className="my-8 overflow-hidden rounded-lg border border-hairline">
      <div className="border-b border-hairline bg-canvas-parchment px-5 py-3 sm:px-7">
        <span className="text-caption font-semibold text-ink-48">{code}</span>
      </div>

      <div className="bg-canvas px-5 py-7 sm:px-7 sm:py-9">
        <p className="text-[1.25rem] leading-[2.1] text-ink sm:text-[1.5rem] sm:leading-[2.15]">
          {segments.map((s, i) => (
            <span
              key={i}
              className={cn(
                "transition-opacity duration-200",
                s.dim ? DIM_META[s.dim].mark : "text-ink-80",
                focus && s.dim !== focus && "opacity-25",
              )}
            >
              {s.text}
            </span>
          ))}
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          {present.map((d) => (
            <button
              key={d}
              type="button"
              onMouseEnter={() => setFocus(d)}
              onMouseLeave={() => setFocus(null)}
              onFocus={() => setFocus(d)}
              onBlur={() => setFocus(null)}
              onClick={() => setFocus((f) => (f === d ? null : d))}
              className={cn(
                "rounded-pill border px-3.5 py-1.5 text-caption font-semibold transition-transform active:scale-95",
                DIM_META[d].chip,
                focus === d && "ring-2 ring-action/25",
              )}
            >
              {DIM_META[d].label}
            </button>
          ))}
          <span className="self-center text-fine text-ink-48">← 눌러 보세요</span>
        </div>
      </div>

      <div className="grid divide-y divide-hairline border-t border-hairline sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {shown.map((d) => {
          const absent = !inSentence(d);
          return (
            <div
              key={d}
              className={cn(
                "px-5 py-5 transition-colors duration-200",
                absent ? "bg-canvas-parchment" : "bg-canvas",
                focus === d && !absent && "bg-canvas-parchment",
              )}
            >
              <p className="flex flex-wrap items-center gap-2 text-fine font-semibold uppercase tracking-[0.06em] text-ink-48">
                {DIM_META[d].label}
                {absent && (
                  <span className="rounded-pill bg-canvas px-2 py-0.5 text-[10px] normal-case tracking-normal text-ink-48">
                    이 문장에는 없음
                  </span>
                )}
              </p>
              <p className={cn("mt-1.5 text-body-sm font-semibold", absent ? "text-ink-48" : "text-ink")}>
                {DIM_META[d].question}
              </p>
              {notes?.[d] && <p className="mt-2 text-caption leading-[1.65] text-ink-80">{notes[d]}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
