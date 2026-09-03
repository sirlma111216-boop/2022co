import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, GripVertical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, shuffle } from "@/lib/utils";

const CARDS = [
  { id: "understanding", label: "학생에게 남겨야 할 이해", sub: "이 단원이 끝난 뒤 남는 것" },
  { id: "evidence", label: "이해했다는 증거", sub: "무엇을 보면 알 수 있는가" },
  { id: "activity", label: "학습 활동", sub: "그 증거가 나오게 하는 경험" },
];

const ANSWER = ["understanding", "evidence", "activity"];

export function ReverseOrderGame({ onSolved }: { onSolved?: () => void }) {
  const [items, setItems] = useState(() => {
    let s = shuffle(CARDS.map((c) => c.id));
    // 처음부터 정답 배열이면 게임이 되지 않는다.
    while (s.join() === ANSWER.join()) s = shuffle(s);
    return s;
  });
  const [checked, setChecked] = useState(false);
  const solved = checked && items.join() === ANSWER.join();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setItems((prev) => arrayMove(prev, prev.indexOf(String(active.id)), prev.indexOf(String(over.id))));
    setChecked(false);
  };

  const move = (id: string, dir: -1 | 1) => {
    setItems((prev) => {
      const i = prev.indexOf(id);
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      return arrayMove(prev, i, j);
    });
    setChecked(false);
  };

  const check = () => {
    setChecked(true);
    if (items.join() === ANSWER.join()) onSolved?.();
  };

  const reset = () => {
    setItems(shuffle(CARDS.map((c) => c.id)));
    setChecked(false);
  };

  return (
    <div className="my-8 overflow-hidden rounded-lg border border-hairline bg-canvas">
      <header className="bg-tile-1 px-5 py-4 text-white sm:px-7">
        <p className="text-fine font-semibold uppercase tracking-[0.1em] text-white/60">MINI GAME</p>
        <h3 className="mt-1 text-tagline text-white">순서를 뒤집어라!</h3>
        <p className="mt-1 text-caption text-white/70">
          수업을 설계할 때 무엇을 먼저 정해야 할까요? 카드를 끌어 순서를 맞춰 보세요.
        </p>
      </header>

      <div className="space-y-3 px-5 py-6 sm:px-7">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((id, idx) => {
              const card = CARDS.find((c) => c.id === id)!;
              const correct = checked && ANSWER[idx] === id;
              const wrong = checked && ANSWER[idx] !== id;
              return (
                <SortableRow
                  key={id}
                  id={id}
                  index={idx}
                  label={card.label}
                  sub={card.sub}
                  correct={correct}
                  wrong={wrong}
                  onUp={() => move(id, -1)}
                  onDown={() => move(id, 1)}
                />
              );
            })}
          </SortableContext>
        </DndContext>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button variant="primary" size="sm" onClick={check}>
            순서 확인하기
          </Button>
          <Button variant="quiet" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" /> 다시 섞기
          </Button>
          {checked && !solved && (
            <span className="text-caption text-warn">아직입니다. 무엇을 가장 먼저 정해야 할까요?</span>
          )}
        </div>
      </div>

      {solved && (
        <div className="border-t border-hairline bg-canvas-parchment px-5 py-7 sm:px-7">
          <p className="pull-quote text-ink">바로 이것이 백워드 설계의 가장 단순한 모습입니다.</p>
          <div className="mt-5 space-y-3 text-body-sm leading-[1.72] text-ink-80">
            <p>
              보통 수업을 준비할 때는 <strong className="font-semibold text-ink">"무슨 활동을 할까?"</strong>부터
              생각하기 쉽습니다. 재미있는 활동이 떠오르면 수업이 잘 될 것 같으니까요.
            </p>
            <p>
              백워드 설계는 순서를 뒤집습니다. 먼저{" "}
              <strong className="font-semibold text-ink">"학생에게 무엇이 남아야 하는가?"</strong>를 정합니다.
              그다음 <strong className="font-semibold text-ink">"무엇을 보면 그것을 이해했다고 판단할 수 있을까?"</strong>
              를 정합니다. 마지막으로{" "}
              <strong className="font-semibold text-ink">"그 증거가 나타나게 하려면 어떤 학습 경험이 필요한가?"</strong>
              를 생각합니다.
            </p>
            <p className="text-ink">목표 → 평가 → 수업. 다음 시간에 이 순서대로 직접 만들어 봅니다.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SortableRow({
  id,
  index,
  label,
  sub,
  correct,
  wrong,
  onUp,
  onDown,
}: {
  id: string;
  index: number;
  label: string;
  sub: string;
  correct: boolean;
  wrong: boolean;
  onUp: () => void;
  onDown: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-canvas px-4 py-4",
        isDragging && "opacity-70",
        correct && "border-good/50 bg-[#f2f8f4]",
        wrong && "border-warn/50 bg-[#fdf8ee]",
        !correct && !wrong && "border-hairline",
      )}
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded-md p-1.5 text-ink-48 active:cursor-grabbing"
        aria-label="끌어서 순서 바꾸기"
      >
        <GripVertical className="h-5 w-5" />
      </span>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-canvas-parchment text-caption font-semibold text-ink-80">
        {index + 1}
      </span>
      <span className="flex-1">
        <span className="block text-body-sm font-semibold text-ink">{label}</span>
        <span className="block text-fine text-ink-48">{sub}</span>
      </span>
      <span className="flex shrink-0 flex-col">
        <button type="button" onClick={onUp} aria-label="위로" className="inline-flex min-h-9 min-w-9 items-center justify-center sm:min-h-0 sm:min-w-0 rounded-md p-1 text-ink-48 hover:bg-canvas-parchment">
          <ChevronUp className="h-4 w-4" />
        </button>
        <button type="button" onClick={onDown} aria-label="아래로" className="inline-flex min-h-9 min-w-9 items-center justify-center sm:min-h-0 sm:min-w-0 rounded-md p-1 text-ink-48 hover:bg-canvas-parchment">
          <ChevronDown className="h-4 w-4" />
        </button>
      </span>
    </div>
  );
}
