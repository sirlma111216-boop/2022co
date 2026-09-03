import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer as TimerIcon } from "lucide-react";
import { useSession } from "@/lib/session-context";
import { cn } from "@/lib/utils";

/**
 * 옆 사람과 이야기하는 시간을 재는 타이머.
 * 발표 모드(교수자 화면)에서만 나타난다 — 연수생 화면에 초시계가 떠 있으면
 * 생각하라고 만든 시간이 쫓기는 시간이 된다.
 */
export function DiscussionTimer({ seconds = 60, label = "옆 선생님과 이야기" }: { seconds?: number; label?: string }) {
  const { presentMode } = useSession();
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    tick.current = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          setRunning(false);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [running]);

  if (!presentMode) return null;

  const mm = String(Math.floor(left / 60)).padStart(1, "0");
  const ss = String(left % 60).padStart(2, "0");
  const done = left === 0;

  return (
    <div className="my-6 flex flex-wrap items-center gap-4 rounded-lg border border-dashed border-action/50 bg-action/[0.04] px-5 py-4">
      <TimerIcon className="h-4 w-4 text-action" />
      <span className="text-caption font-semibold text-ink-80">{label}</span>
      <span
        className={cn(
          "tabular ml-auto font-display text-[1.75rem] font-semibold leading-none",
          done ? "text-bad" : "text-ink",
        )}
      >
        {mm}:{ss}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="inline-flex items-center gap-1.5 rounded-pill bg-action px-3.5 py-1.5 text-fine font-semibold text-white transition-transform active:scale-95"
        >
          {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {running ? "멈춤" : done ? "다시" : "시작"}
        </button>
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setLeft(seconds);
          }}
          aria-label="타이머 초기화"
          className="rounded-pill border border-hairline px-3 py-1.5 text-fine text-ink-48 transition-transform active:scale-95"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
