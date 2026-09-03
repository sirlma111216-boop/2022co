import { useState } from "react";
import { Bot, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { repo } from "@/lib/repo";
import { useSession } from "@/lib/session-context";
import { AI_TASK_LABEL, aiUsageLeft, requestAiReview, taskReady } from "@/lib/ai";
import type { AiResponse, AiTask, DesignField } from "@/lib/types";

/**
 * AI 동료 점검.
 *
 * 규칙
 *  - 초안이 없으면 버튼이 비활성이다. 사람이 먼저 쓴다.
 *  - 자동 호출은 절대 없다. 반드시 클릭으로만 호출한다.
 *  - AI가 사용자의 글을 마음대로 바꾸지 않는다. [이 제안 적용]을 눌러야 반영되고, 되돌릴 수 있다.
 */
export function AiCoach({
  task,
  applyTo,
  note,
}: {
  task: AiTask;
  /** 💡 수정 예시를 적용할 필드 (없으면 적용 버튼을 숨긴다) */
  applyTo?: DesignField;
  note?: string;
}) {
  const { design, profile, update, sessionId, uid } = useSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResponse | null>(null);
  const [applied, setApplied] = useState<string | null>(null);

  const ready = taskReady(task, design);
  const left = aiUsageLeft();

  const run = async () => {
    setLoading(true);
    setResult(null);
    const res = await requestAiReview(task, design, profile?.subject ?? "", profile?.schoolLevel ?? "");
    setResult(res);
    setLoading(false);
    if (sessionId && uid) void repo.bumpAiUsage(sessionId, uid).catch(() => {});
  };

  const apply = () => {
    if (!applyTo || !result || !result.ok) return;
    setApplied((design[applyTo] as string) ?? "");
    update({ [applyTo]: result.suggestion });
  };

  const undo = () => {
    if (!applyTo || applied === null) return;
    update({ [applyTo]: applied });
    setApplied(null);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={run} disabled={!ready || loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
          {loading ? "AI 동료가 읽는 중…" : "AI 동료에게 점검받기"}
        </Button>
        <span className="text-fine text-ink-48">
          {ready ? `${AI_TASK_LABEL[task]} · 남은 횟수 ${left}회` : "먼저 초안을 작성하면 활성화됩니다."}
        </span>
      </div>

      {note && <p className="text-fine text-ink-48">{note}</p>}

      {result && !result.ok && (
        <div className="rounded-lg border border-hairline bg-canvas-parchment px-5 py-4">
          <p className="text-body-sm text-ink-80">{result.message}</p>
          <p className="mt-1 text-fine text-ink-48">작성하신 내용은 그대로 보관되어 있습니다.</p>
          <Button variant="quiet" size="sm" className="mt-3" onClick={run}>
            <RotateCcw className="h-3.5 w-3.5" /> 다시 시도
          </Button>
        </div>
      )}

      {result && result.ok && (
        <div className="overflow-hidden rounded-lg border border-hairline">
          <Panel emoji="👍" title="좋은 점" items={result.good} />
          <Panel emoji="🔍" title="생각해볼 점" items={result.think} tone="parchment" />
          {result.suggestion && (
            <div className="border-t border-hairline bg-canvas px-5 py-4">
              <p className="mb-2 text-caption font-semibold text-ink">💡 수정 예시</p>
              <p className="whitespace-pre-line text-body-sm leading-[1.7] text-ink-80">
                {result.suggestion}
              </p>
              {applyTo && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button variant="primary" size="sm" onClick={apply} disabled={applied !== null}>
                    <Sparkles className="h-3.5 w-3.5" /> 이 제안 적용
                  </Button>
                  {applied !== null && (
                    <Button variant="quiet" size="sm" onClick={undo}>
                      <RotateCcw className="h-3.5 w-3.5" /> 되돌리기
                    </Button>
                  )}
                  <span className="text-fine text-ink-48">
                    적용하지 않아도 됩니다. 선생님의 문장이 기본입니다.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* AI는 답으로 끝내지 않는다 — 마지막에 되묻는다 */}
          {result.ask && (
            <div className="border-t border-hairline bg-canvas-parchment px-5 py-4">
              <p className="mb-2 text-caption font-semibold text-ink">🤔 다시 생각해 볼 질문</p>
              <p className="text-body-sm leading-[1.7] text-ink">{result.ask}</p>
              <p className="mt-2 text-fine text-ink-48">
                이 질문에는 AI가 답하지 않습니다. 선생님이 답할 자리입니다.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Panel({
  emoji,
  title,
  items,
  tone = "plain",
}: {
  emoji: string;
  title: string;
  items: string[];
  tone?: "plain" | "parchment";
}) {
  if (!items.length) return null;
  return (
    <div
      className={
        tone === "parchment"
          ? "border-t border-hairline bg-canvas-parchment px-5 py-4"
          : "bg-canvas px-5 py-4"
      }
    >
      <p className="mb-2 text-caption font-semibold text-ink">
        {emoji} {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2 text-body-sm leading-[1.7] text-ink-80">
            <span className="mt-[9px] h-1 w-1 shrink-0 rounded-pill bg-ink-48" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
