import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useSession } from "@/lib/session-context";
import { useSubjectExample } from "@/lib/subject";
import type { LearningExperience } from "@/lib/types";

const MAX = 5;

/**
 * ACTIVITY 6 — 학습 경험 설계.
 *
 * 활동을 나열하는 칸이 아니라, 활동과 평가 증거를 잇는 칸이다.
 * 그래서 활동마다 "이 활동은 어떤 증거를 준비시키나요?"를 반드시 옆에 붙인다.
 * 선택지는 연수생이 직접 정한 평가요소와 성취기준 핵심 행동에서 가져온다 —
 * 자기가 쓴 말로 연결해야 정렬이 눈에 보인다.
 */
export function LearningExperiences() {
  const ex = useSubjectExample();
  const { design, update } = useSession();
  const items = design.learningExperiences ?? [];

  const evidenceOptions = [
    ...design.assessmentElements.filter((e) => e.name.trim()).map((e) => e.name.trim()),
    ...(design.standardCoreAction.trim() ? [`성취기준 핵심 행동 · ${design.standardCoreAction.trim()}`] : []),
  ];

  /** 이전 목록 기준으로 계산 — 연속 클릭에도 유실되지 않는다 */
  const withItems = (fn: (cur: LearningExperience[]) => LearningExperience[]) =>
    update((prev) => ({ learningExperiences: fn(prev.learningExperiences ?? []) }));

  const patch = (i: number, p: Partial<LearningExperience>) =>
    withItems((cur) => cur.map((it, idx) => (idx === i ? { ...it, ...p } : it)));
  const add = () => withItems((cur) => (cur.length < MAX ? [...cur, { what: "", evidence: "" }] : cur));
  const remove = (i: number) => withItems((cur) => cur.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="rounded-md bg-canvas-parchment px-4 py-3 text-caption text-ink-80">
          아래 [학습 경험 추가]를 눌러 3~5개를 적어 주세요. 차시 순서대로가 아니어도 됩니다.
        </p>
      )}

      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-hairline bg-canvas">
          <div className="flex items-center gap-3 border-b border-hairline bg-canvas-parchment px-4 py-2.5">
            <span className="tabular text-caption font-semibold text-action">경험 {i + 1}</span>
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="이 학습 경험 삭제"
              className="ml-auto inline-flex min-h-9 min-w-9 items-center justify-center sm:min-h-0 sm:min-w-0 rounded-md p-1.5 text-ink-48 transition-transform active:scale-95 hover:text-bad"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-4 px-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor={`le-what-${i}`}>학생이 해 보는 것</Label>
              <Input
                id={`le-what-${i}`}
                value={it.what}
                placeholder={`예: ${ex.experiences[0].what}`}
                onChange={(e) => patch(i, { what: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`le-ev-${i}`}>이 활동은 어떤 평가 증거를 준비시키나요?</Label>
              {evidenceOptions.length > 0 ? (
                <Select
                  id={`le-ev-${i}`}
                  value={evidenceOptions.includes(it.evidence) ? it.evidence : it.evidence ? "__custom" : ""}
                  onChange={(e) => patch(i, { evidence: e.target.value === "__custom" ? " " : e.target.value })}
                >
                  <option value="">선택해 주세요</option>
                  {evidenceOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                  <option value="__custom">직접 적기</option>
                </Select>
              ) : null}

              {(evidenceOptions.length === 0 || (!!it.evidence && !evidenceOptions.includes(it.evidence))) && (
                <Input
                  value={it.evidence.trim()}
                  placeholder={
                    evidenceOptions.length === 0
                      ? "평가요소를 먼저 정하면 목록에서 고를 수 있습니다. 지금은 직접 적어 주세요."
                      : "직접 적기"
                  }
                  onChange={(e) => patch(i, { evidence: e.target.value })}
                />
              )}
            </div>
          </div>
        </div>
      ))}

      {items.length < MAX && (
        <Button variant="pearl" size="sm" onClick={add}>
          <Plus className="h-4 w-4" /> 학습 경험 추가 ({items.length}/{MAX})
        </Button>
      )}
    </div>
  );
}
