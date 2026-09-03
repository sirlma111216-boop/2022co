import { useEffect, useRef, type ReactNode } from "react";
import { Bars } from "@/components/poll/Poll";
import { Label, Textarea } from "@/components/ui/input";
import { useSession } from "@/lib/session-context";
import type { DesignField } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface PollOption {
  key: string;
  /** 카드 제목 (예: "수업 A — 재미있고 활기찬 수업") */
  title: string;
  /** 카드 본문 — 줄 단위로 준다 */
  lines?: string[];
  /** 한 줄짜리 보기일 때 쓰는 짧은 설명 */
  sub?: string;
}

/**
 * 「먼저 판단하게 하고, 이유를 말하게 하고, 그다음 남들과 비교시키는」 활동 한 벌.
 *
 * 설계 의도가 세 가지 있다.
 *  1. 고르기 전에는 다른 사람의 분포를 보여 주지 않는다 — 다수 쪽으로 쏠리는 것을 막는다.
 *  2. 고른 뒤에는 반드시 이유를 쓰게 한다 — 감이 아니라 근거로 판단하게 한다.
 *  3. 분포에 정답 표시를 하지 않는다 — 판단이 갈리는 것 자체가 이 활동의 재료다.
 */
export function ChoicePoll({
  pollId,
  question,
  options,
  choiceField,
  reasonField,
  reasonLabel = "왜 그렇게 판단하셨나요?",
  reasonPlaceholder = "한 줄이면 충분합니다.",
  layout = "cards",
  afterVote,
}: {
  pollId: string;
  question: string;
  options: PollOption[];
  /** 고른 보기를 설계안에도 남긴다 */
  choiceField: DesignField;
  reasonField: DesignField;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  /** cards = 큰 카드 세로 배치 / compact = 짧은 보기 그리드 */
  layout?: "cards" | "compact";
  /** 투표 후에만 보여줄 내용 (설명, 타이머 등) */
  afterVote?: ReactNode;
}) {
  const { votes, castVote, session, design, update, mode } = useSession();
  const chosen = votes[pollId] ?? ((design[choiceField] as string) || "");
  const results = session?.pollResults ?? {};
  const synced = useRef(false);

  // 새로고침 후 설계안에는 선택이 남아 있는데 votes 에 없을 수 있다 — 화면 상태를 맞춘다.
  useEffect(() => {
    synced.current = true;
  }, []);

  const pick = (key: string) => {
    if (chosen) return;
    update({ [choiceField]: key });
    void castVote(pollId, key);
  };

  const data = options.map((o) => ({
    key: o.key,
    label: o.sub ? `${o.key}. ${o.sub}` : o.title,
    value: results[`${pollId}_${o.key}`] ?? 0,
    highlight: chosen === o.key,
  }));

  const reason = (design[reasonField] as string) ?? "";

  return (
    <div className="my-8">
      <p className="text-[1.15rem] font-semibold leading-[1.5] text-ink sm:text-[1.3rem]">{question}</p>

      <div
        className={cn(
          "mt-6 gap-3",
          layout === "cards" ? "grid sm:grid-cols-3" : "grid sm:grid-cols-2",
        )}
      >
        {options.map((o) => {
          const on = chosen === o.key;
          return (
            <button
              key={o.key}
              type="button"
              disabled={!!chosen}
              onClick={() => pick(o.key)}
              className={cn(
                "rounded-lg border px-5 py-4 text-left transition-transform duration-150",
                !chosen && "hover:border-ink-48/50 active:scale-[0.98]",
                on ? "border-action bg-action/[0.06]" : "border-hairline bg-canvas",
                chosen && !on && "opacity-55",
              )}
            >
              <span className="flex items-baseline gap-2.5">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-pill text-fine font-semibold",
                    on ? "bg-action text-white" : "bg-canvas-parchment text-ink-80",
                  )}
                >
                  {o.key}
                </span>
                <span className="flex-1 text-body-sm font-semibold leading-[1.45] text-ink">{o.title}</span>
              </span>
              {o.lines && (
                <ul className="mt-3 space-y-1.5 border-t border-hairline pt-3">
                  {o.lines.map((l, i) => (
                    <li key={i} className="text-caption leading-[1.6] text-ink-80">
                      {l}
                    </li>
                  ))}
                </ul>
              )}
              {o.sub && !o.lines && <p className="mt-2 text-caption text-ink-48">{o.sub}</p>}
            </button>
          );
        })}
      </div>

      {!chosen && (
        <p className="mt-4 text-fine text-ink-48">
          하나를 고르면 이유를 적는 칸과 전체 응답 분포가 열립니다.
        </p>
      )}

      {chosen && (
        <div className="appear mt-7 space-y-6">
          <div className="space-y-2">
            <Label htmlFor={`reason-${pollId}`}>{reasonLabel}</Label>
            <Textarea
              id={`reason-${pollId}`}
              rows={2}
              value={reason}
              placeholder={reasonPlaceholder}
              onChange={(e) => update({ [reasonField]: e.target.value })}
            />
          </div>

          <div className="rounded-lg border border-hairline bg-canvas-parchment px-5 py-5 sm:px-6">
            <p className="mb-5 text-caption font-semibold text-ink-48">
              지금까지의 응답 {mode === "local" && "· 로컬 모드에서는 내 응답만 집계됩니다"}
            </p>
            <Bars data={data} />
            <p className="mt-5 border-t border-hairline pt-4 text-fine text-ink-48">
              정답은 표시하지 않습니다. 판단이 갈리는 것 자체가 오늘의 재료입니다.
            </p>
          </div>

          {afterVote}
        </div>
      )}
    </div>
  );
}
