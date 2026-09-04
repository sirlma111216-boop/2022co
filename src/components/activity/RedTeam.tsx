import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ShieldAlert, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { WallDialog } from "@/components/wall/Wall";
import { useSession } from "@/lib/session-context";
import { RED_TEAM_CHECKS } from "@/lib/types";
import { cn, isFilled, safeJson } from "@/lib/utils";

/** GRASPS 칸에서 '수정 전' 과제 요약문을 만든다 */
function summarizeTask(d: {
  graspsG: string;
  graspsR: string;
  graspsA: string;
  graspsS: string;
  graspsP: string;
  graspsS2: string;
}) {
  return [
    d.graspsG && `[목표] ${d.graspsG}`,
    d.graspsR && `[역할] ${d.graspsR}`,
    d.graspsA && `[대상] ${d.graspsA}`,
    d.graspsS && `[상황] ${d.graspsS}`,
    d.graspsP && `[산출물] ${d.graspsP}`,
    d.graspsS2 && `[기준] ${d.graspsS2}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * RED TEAM — 개념 없이 풀어보기.
 *
 * 좋은 수행과제인지 확인하는 가장 빠른 방법은 반대로 공격해 보는 것이다.
 * 다섯 질문 중 하나라도 '그렇다'면 과제에 구멍이 있다고 분명히 말하되,
 * 사용자를 비난하지 않고 곧바로 고칠 자리를 준다.
 *
 * 동료 자동 매칭은 연수 당일 안정성을 우선해 넣지 않았다.
 * 대신 기존 공유 담벼락을 그대로 재사용해 「동료 과제 공격하기」를 연결한다.
 */
type Answers = Record<string, boolean | undefined>;

/** '아니다'는 설계안에 남지 않으므로(구멍만 저장) 응답 상태는 이 기기에 따로 보관한다 */
const ANSWERS_KEY = (sid: string | null, uid: string | null) => `bl.redteam.${sid ?? "-"}.${uid ?? "-"}`;

export function RedTeam() {
  const { design, update, sessionId, uid } = useSession();
  const [wallOpen, setWallOpen] = useState(false);

  const findings = design.redTeamFindings ?? [];
  const [answers, setAnswers] = useState<Answers>(() =>
    Object.fromEntries(RED_TEAM_CHECKS.map((c) => [c.id, findings.includes(c.id) ? true : undefined])),
  );
  // 항상 최신 응답을 가리키는 참조 — 같은 틱에 두 번 눌러도 앞의 답이 덮이지 않는다
  const answersRef = useRef<Answers>(answers);

  // 새로고침 복구: '그렇다'뿐 아니라 '아니다'까지 되살린다
  useEffect(() => {
    const saved = safeJson<Answers | null>(localStorage.getItem(ANSWERS_KEY(sessionId, uid)), null);
    if (!saved) return;
    answersRef.current = saved;
    setAnswers(saved);
  }, [sessionId, uid]);

  const taskReady = isFilled(design.graspsG) || isFilled(design.graspsP);

  // 처음 들어왔을 때의 과제를 '수정 전'으로 붙잡아 둔다. 이후에는 덮어쓰지 않는다.
  useEffect(() => {
    if (!taskReady) return;
    if (design.performanceTaskBefore?.trim()) return;
    update({ performanceTaskBefore: summarizeTask(design) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskReady]);

  const answeredCount = Object.values(answers).filter((v) => v !== undefined).length;
  const holes = RED_TEAM_CHECKS.filter((c) => answers[c.id] === true);
  const allAnswered = answeredCount === RED_TEAM_CHECKS.length;
  // 이미 적어 둔 글이 있으면 응답 복구 여부와 상관없이 입력칸을 계속 열어 둔다
  const hasWritten = isFilled(design.redTeamComment, 2) || isFilled(design.performanceTaskAfter, 2);
  const showEditor = answeredCount > 0 || hasWritten;

  const setAnswer = (id: string, value: boolean) => {
    const next = { ...answersRef.current, [id]: value };
    answersRef.current = next;
    setAnswers(next);
    localStorage.setItem(ANSWERS_KEY(sessionId, uid), JSON.stringify(next));
    update({
      redTeamFindings: RED_TEAM_CHECKS.filter((c) => next[c.id] === true).map((c) => c.id),
    });
  };

  if (!taskReady) {
    return (
      <div className="rounded-lg border border-hairline bg-canvas-parchment px-5 py-6">
        <p className="text-body-sm text-ink-80">
          먼저 위에서 수행과제의 <strong className="font-semibold text-ink">G(목표)</strong>와{" "}
          <strong className="font-semibold text-ink">P(산출물)</strong>를 작성해 주세요. 공격할 과제가 있어야
          RED TEAM을 시작할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 공격 대상 */}
      <div className="rounded-lg border border-hairline bg-canvas-parchment px-5 py-4">
        <p className="mb-2 text-caption font-semibold text-ink-48">공격 대상 · 내가 방금 만든 과제</p>
        <p className="whitespace-pre-line text-body-sm leading-[1.7] text-ink">
          {design.performanceTaskBefore?.trim() || summarizeTask(design)}
        </p>
      </div>

      {/* 다섯 질문 */}
      <div className="space-y-3">
        {RED_TEAM_CHECKS.map((c, i) => {
          const a = answers[c.id];
          return (
            <div
              key={c.id}
              className={cn(
                "rounded-lg border px-5 py-4 transition-colors",
                a === true ? "border-bad/45 bg-[#fdf3f1]" : "border-hairline bg-canvas",
              )}
            >
              <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
                <span className="tabular mt-0.5 text-caption font-semibold text-ink-48">{i + 1}</span>
                <p className="min-w-[220px] flex-1 text-body-sm font-semibold leading-[1.55] text-ink">
                  {c.question}
                </p>
                <div className="flex gap-2">
                  <AnswerButton on={a === true} tone="bad" onClick={() => setAnswer(c.id, true)}>
                    그렇다
                  </AnswerButton>
                  <AnswerButton on={a === false} tone="good" onClick={() => setAnswer(c.id, false)}>
                    아니다
                  </AnswerButton>
                </div>
              </div>
              {a === true && <p className="mt-3 border-t border-bad/20 pt-3 text-caption text-ink-80">{c.hint}</p>}
            </div>
          );
        })}
      </div>

      {/* 판정 */}
      {answeredCount > 0 && (
        <div className="appear">
          {holes.length > 0 ? (
            <div className="rounded-lg border-2 border-bad/50 bg-[#fdf3f1] px-5 py-5 sm:px-6">
              <p className="flex items-center gap-2 text-tagline text-bad">
                <ShieldAlert className="h-5 w-5" /> 과제에 구멍이 있습니다
              </p>
              <p className="mt-2 text-body-sm leading-[1.7] text-ink-80">
                {holes.length}개 지점에서 학생이 이 단원의 핵심 개념을 몰라도 과제를 완성할 수 있습니다.
                과제가 나쁘다는 뜻이 아닙니다 — <strong className="font-semibold text-ink">무엇을 증거로 볼지가
                아직 선명하지 않다</strong>는 뜻입니다.
              </p>
              <ul className="mt-4 space-y-2">
                {holes.map((h) => (
                  <li key={h.id} className="flex gap-2.5 text-caption leading-[1.6] text-ink-80">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bad" />
                    <span>{h.question}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : allAnswered ? (
            <div className="rounded-lg border border-good/40 bg-[#f2f8f4] px-5 py-5 sm:px-6">
              <p className="flex items-center gap-2 text-tagline text-good">
                <ShieldCheck className="h-5 w-5" /> 지금은 구멍이 보이지 않습니다
              </p>
              <p className="mt-2 text-body-sm leading-[1.7] text-ink-80">
                그렇다면 한 번만 더 의심해 보세요. 이 과제를 가장 잘 피해 갈 학생은 어떻게 할까요?
                아래에 적어 두면 나중에 과제를 다듬을 때 단서가 됩니다.
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* 공격 방법 서술 + 수정 */}
      {showEditor && (
        <div className="appear space-y-5">
          <div className="space-y-2">
            <Label htmlFor="redTeamComment">
              어떤 방식으로 개념 없이도 과제를 완성할 수 있을까요?
            </Label>
            <p className="text-caption text-ink-48">
              공격자의 입장에서 구체적으로 적어 보세요. 예: "인터넷에서 사례를 찾아 그대로 정리해도 발표가 됩니다."
            </p>
            <Textarea
              id="redTeamComment"
              rows={3}
              value={design.redTeamComment}
              placeholder="학생이 이 과제를 개념 없이 통과하는 가장 쉬운 길은…"
              onChange={(e) => update({ redTeamComment: e.target.value })}
            />
          </div>

          <div className="space-y-2 rounded-lg border-l-[3px] border-action bg-canvas px-5 py-5">
            <Label htmlFor="performanceTaskAfter">그 구멍을 막은 과제로 다시 써 보세요</Label>
            <p className="text-caption text-ink-48">
              전부 새로 쓰지 않아도 됩니다. 대개 <strong className="font-semibold text-ink">상황(S)에 자료를
              추가</strong>하거나, <strong className="font-semibold text-ink">산출물(P)에 "근거를 지목할 것"을
              요구</strong>하는 것만으로 구멍이 막힙니다.
            </p>
            <Textarea
              id="performanceTaskAfter"
              rows={5}
              value={design.performanceTaskAfter}
              placeholder="수정한 수행과제를 적어 주세요."
              onChange={(e) => update({ performanceTaskAfter: e.target.value })}
            />
            {!design.performanceTaskAfter?.trim() && (
              <Button
                variant="pearl"
                size="sm"
                className="mt-1"
                onClick={() => update({ performanceTaskAfter: design.performanceTaskBefore || summarizeTask(design) })}
              >
                원래 과제를 불러와 고치기
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 동료 과제 공격하기 — ACTIVITY 4 에 공유된 과제를 본다 */}
      <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-5">
        <Button variant="ghost" size="sm" onClick={() => setWallOpen(true)}>
          <Users className="h-4 w-4" /> 동료의 과제도 공격해 보기
        </Button>
        <span className="text-fine text-ink-48">
          ACTIVITY 4 담벼락에서 다른 선생님의 과제를 골라, 댓글로 구멍을 하나 알려 주세요.
        </span>
      </div>
      <WallDialog activityId="a4" open={wallOpen} onOpenChange={setWallOpen} />
    </div>
  );
}

function AnswerButton({
  on,
  tone,
  onClick,
  children,
}: {
  on: boolean;
  tone: "bad" | "good";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-pill border px-4 py-1.5 text-caption font-semibold transition-transform active:scale-95",
        on && tone === "bad" && "border-bad bg-bad text-white",
        on && tone === "good" && "border-good bg-good text-white",
        !on && "border-hairline bg-canvas text-ink-80 hover:border-ink-48/50",
      )}
    >
      {children}
    </button>
  );
}

/** 수정 전 → 수정 후 나란히 보기 (RED TEAM 직후, FINAL 성찰에서 재사용) */
export function BeforeAfter({ compact = false }: { compact?: boolean }) {
  const { design } = useSession();
  const before = design.performanceTaskBefore?.trim();
  const after = design.performanceTaskAfter?.trim();
  if (!before && !after) return null;

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", compact ? "my-4" : "my-7")}>
      <div className="rounded-lg border border-hairline bg-canvas-parchment px-5 py-4">
        <p className="mb-2 text-fine font-semibold uppercase tracking-[0.06em] text-ink-48">수정 전</p>
        <p className="whitespace-pre-line text-caption leading-[1.65] text-ink-48">{before || "—"}</p>
        {design.redTeamComment?.trim() && (
          <p className="mt-3 border-t border-hairline pt-3 text-caption leading-[1.6] text-bad">
            RED TEAM이 찾은 구멍 · {design.redTeamComment}
          </p>
        )}
      </div>
      <div className="rounded-lg border border-action/40 bg-canvas px-5 py-4">
        <p className="mb-2 text-fine font-semibold uppercase tracking-[0.06em] text-action">수정 후</p>
        <p className="whitespace-pre-line text-caption leading-[1.65] text-ink">{after || "아직 수정하지 않았습니다."}</p>
      </div>
    </div>
  );
}
