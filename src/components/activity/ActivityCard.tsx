import type { ReactNode } from "react";
import { useEffect } from "react";
import { useSession } from "@/lib/session-context";
import type { ActivityId } from "@/lib/types";
import { ACTIVITY_LABEL } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * 실습 활동의 공통 껍데기.
 * 활동은 본문(설명)과 시각적으로 확실히 구분되어야 한다 —
 * 어두운 머리띠 + 흰 본문으로 "여기서부터는 직접 쓰는 곳"임을 알린다.
 */
export function ActivityCard({
  id,
  no,
  title,
  prompt,
  minutes,
  children,
  footer,
  done,
}: {
  id: ActivityId;
  no: string;
  title?: string;
  prompt?: ReactNode;
  minutes?: number;
  children: ReactNode;
  footer?: ReactNode;
  /** 이 활동의 필수 칸이 채워졌는지 — 진행률 집계에 쓰인다 */
  done?: boolean;
}) {
  const { markProgress } = useSession();

  useEffect(() => {
    if (done) markProgress(id);
  }, [done, id, markProgress]);

  return (
    <section
      id={id}
      className="my-10 scroll-mt-32 overflow-hidden rounded-lg border border-hairline bg-canvas"
    >
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-tile-1 px-5 py-4 text-white sm:px-7 sm:py-5">
        <span className="rounded-pill bg-white/15 px-3 py-1 text-fine font-semibold uppercase tracking-[0.1em]">
          {no}
        </span>
        <h3 className="flex-1 text-tagline text-white">{title ?? ACTIVITY_LABEL[id]}</h3>
        {minutes !== undefined && (
          <span className="tabular text-fine text-white/60">권장 {minutes}분</span>
        )}
        <span
          className={cn(
            "rounded-pill px-2.5 py-1 text-fine font-semibold",
            done ? "bg-white/90 text-ink" : "bg-white/10 text-white/70",
          )}
        >
          {done ? "작성 완료" : "작성 전"}
        </span>
      </header>

      {prompt && (
        <div className="border-b border-hairline bg-canvas-parchment px-5 py-4 text-body-sm leading-[1.7] text-ink-80 sm:px-7">
          {prompt}
        </div>
      )}

      <div className="space-y-6 px-5 py-6 sm:px-7 sm:py-7">{children}</div>

      {footer && (
        <div className="flex flex-wrap items-center gap-3 border-t border-hairline bg-canvas px-5 py-4 sm:px-7">
          {footer}
        </div>
      )}
    </section>
  );
}
