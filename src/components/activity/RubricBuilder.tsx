import { useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ELEMENT_BANK } from "@/content/examples";
import { useSession } from "@/lib/session-context";
import { EMPTY_ELEMENT, type AssessmentElement } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX = 3;
const LEVELS: { key: keyof Omit<AssessmentElement, "name">; label: string; hint: string }[] = [
  { key: "high", label: "상", hint: "무엇이 보이면 상인가 — 관찰할 수 있는 말로" },
  { key: "mid", label: "중", hint: "상과 무엇이 다른가" },
  { key: "low", label: "하", hint: "무엇이 빠져 있는가" },
];

/**
 * 평가요소 + 수행수준 편집기.
 *
 * 세 요소 모두 상·중·하를 쓰게 하면 6분 안에 끝나지 않는다.
 * 그래서 「가장 중요한 평가요소 하나」만 자세히 쓰게 하고, 나머지는 이름만 남긴다.
 * 전부 쓰고 싶은 사람을 막지는 않는다 — 버튼 하나로 모두 펼칠 수 있다.
 */
export function RubricBuilder() {
  const { design, update } = useSession();
  const items = design.assessmentElements?.length ? design.assessmentElements : [{ ...EMPTY_ELEMENT }];
  const keyIndex = Math.min(design.keyAssessmentIndex ?? 0, items.length - 1);
  const [showAll, setShowAll] = useState(false);

  const setItems = (next: AssessmentElement[]) => update({ assessmentElements: next });

  const patch = (i: number, p: Partial<AssessmentElement>) =>
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...p } : it)));

  const add = () => items.length < MAX && setItems([...items, { ...EMPTY_ELEMENT }]);

  const remove = (i: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== i));
    if (keyIndex >= items.length - 1) update({ keyAssessmentIndex: 0 });
  };

  const used = new Set(items.map((i) => i.name));

  return (
    <div className="space-y-5">
      <div>
        <Label>평가요소 고르기</Label>
        <p className="mt-1 text-caption text-ink-48">
          아래에서 누르면 빈 칸에 채워집니다. 직접 적으셔도 됩니다. 최대 {MAX}개.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ELEMENT_BANK.map((e) => (
            <button
              key={e.name}
              type="button"
              title={e.desc}
              disabled={used.has(e.name)}
              onClick={() => {
                const emptyIdx = items.findIndex((it) => !it.name.trim());
                if (emptyIdx >= 0) patch(emptyIdx, { name: e.name });
                else if (items.length < MAX) setItems([...items, { ...EMPTY_ELEMENT, name: e.name }]);
              }}
              className={cn(
                "rounded-pill border px-3.5 py-1.5 text-caption transition-transform active:scale-95",
                used.has(e.name)
                  ? "border-hairline bg-canvas-parchment text-ink-48"
                  : "border-hairline bg-canvas text-ink-80 hover:border-action hover:text-action",
              )}
            >
              {e.name}
            </button>
          ))}
        </div>
      </div>

      <p className="rounded-md bg-canvas-parchment px-4 py-3 text-caption leading-[1.65] text-ink-80">
        요소 옆의 <Star className="inline h-3.5 w-3.5 -translate-y-px text-action" /> 를 눌러{" "}
        <strong className="font-semibold text-ink">이번 과제에서 가장 중요한 평가요소 하나</strong>를 정하세요.
        그 하나만 상·중·하를 자세히 씁니다.
      </p>

      {items.map((it, i) => {
        const isKey = i === keyIndex;
        const showLevels = isKey || showAll;
        return (
          <div
            key={i}
            className={cn(
              "rounded-lg border bg-canvas",
              isKey ? "border-action" : "border-hairline",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2 border-b px-4 py-3",
                isKey ? "border-action/30 bg-action/[0.05]" : "border-hairline bg-canvas-parchment",
              )}
            >
              <button
                type="button"
                onClick={() => update({ keyAssessmentIndex: i })}
                aria-label="가장 중요한 평가요소로 지정"
                title="가장 중요한 평가요소로 지정"
                className="rounded-md p-1 transition-transform active:scale-90"
              >
                <Star
                  className={cn("h-4 w-4", isKey ? "fill-action text-action" : "text-ink-48 hover:text-action")}
                />
              </button>
              <span className={cn("tabular text-caption font-semibold", isKey ? "text-action" : "text-ink-48")}>
                {isKey ? "핵심 평가요소" : `평가요소 ${i + 1}`}
              </span>
              <Input
                value={it.name}
                onChange={(e) => patch(i, { name: e.target.value })}
                placeholder="예: 주장과 근거의 연결"
                className="flex-1 border-transparent bg-transparent px-2 py-1.5 font-semibold"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="이 평가요소 삭제"
                  className="rounded-md p-1.5 text-ink-48 transition-transform active:scale-95 hover:text-bad"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {showLevels ? (
              <div className="grid gap-4 px-4 py-4 sm:grid-cols-3">
                {LEVELS.map((lv) => (
                  <div key={lv.key} className="space-y-1.5">
                    <Label>{lv.label}</Label>
                    <Textarea
                      rows={3}
                      value={it[lv.key]}
                      onChange={(e) => patch(i, { [lv.key]: e.target.value })}
                      placeholder={lv.hint}
                      className="text-body-sm"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-3 text-caption text-ink-48">
                이름만 저장됩니다. 수준까지 쓰고 싶다면 아래에서 모두 펼치세요.
              </p>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap gap-3">
        {items.length < MAX && (
          <Button variant="pearl" size="sm" onClick={add}>
            <Plus className="h-4 w-4" /> 평가요소 추가 ({items.length}/{MAX})
          </Button>
        )}
        {items.length > 1 && (
          <Button variant="quiet" size="sm" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "핵심 요소만 보기" : "다른 평가요소도 수준 작성하기"}
          </Button>
        )}
      </div>
    </div>
  );
}
