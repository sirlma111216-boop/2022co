import { Plus, Trash2 } from "lucide-react";
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
 * A4 한 장 안에 들어가야 하므로 요소는 최대 3개로 제한한다 — 이 제한 자체가 교육 내용이다.
 */
export function RubricBuilder() {
  const { design, update } = useSession();
  const items = design.assessmentElements?.length ? design.assessmentElements : [{ ...EMPTY_ELEMENT }];

  const setItems = (next: AssessmentElement[]) => update({ assessmentElements: next });

  const patch = (i: number, p: Partial<AssessmentElement>) =>
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...p } : it)));

  const add = () => items.length < MAX && setItems([...items, { ...EMPTY_ELEMENT }]);
  const remove = (i: number) => setItems(items.length > 1 ? items.filter((_, idx) => idx !== i) : items);

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

      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-hairline bg-canvas">
          <div className="flex items-center gap-3 border-b border-hairline bg-canvas-parchment px-4 py-3">
            <span className="tabular text-caption font-semibold text-action">평가요소 {i + 1}</span>
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
                className="rounded-md p-1.5 text-ink-48 hover:bg-canvas"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
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
        </div>
      ))}

      {items.length < MAX && (
        <Button variant="pearl" size="sm" onClick={add}>
          <Plus className="h-4 w-4" /> 평가요소 추가 ({items.length}/{MAX})
        </Button>
      )}
    </div>
  );
}
