import { useState, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, Plus, Scissors, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useSession } from "@/lib/session-context";
import { useSubjectExample } from "@/lib/subject";
import type { UnitItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const SUGGEST_MIN = 6;

/**
 * MISSION — 30% 삭제 도전.
 *
 * 「무엇을 더 넣을까」가 아니라 「무엇을 덜어낼까」를 결정하게 하는 활동.
 * 남긴 것들 사이에 흐르는 공통점을 스스로 발견하게 해서, 바로 뒤의
 * '영속적 이해 한 문장'을 자기 손으로 끌어내도록 만든다.
 *
 * 드래그앤드롭 대신 탭 이동을 쓴다 — 연수생 절반이 휴대폰으로 참여한다.
 */
export function DeleteChallenge() {
  const ex = useSubjectExample();
  const { design, update } = useSession();
  const items = design.unitItems ?? [];
  const [draft, setDraft] = useState("");

  const kept = items.filter((i) => !i.dropped);
  const dropped = items.filter((i) => i.dropped);
  const target = Math.max(2, Math.round(items.length * 0.3));
  const reached = items.length >= 3 && dropped.length >= target;

  /** 이전 목록 기준으로 계산 — 같은 틱에 여러 번 눌러도 앞의 변경이 살아남는다 */
  const withItems = (fn: (cur: UnitItem[]) => UnitItem[]) =>
    update((prev) => ({ unitItems: fn(prev.unitItems ?? []) }));

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    const id = `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    withItems((cur) => [...cur, { id, text, dropped: false }]);
    setDraft("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
  };

  const move = (id: string, dropped: boolean) =>
    withItems((cur) => cur.map((i) => (i.id === id ? { ...i, dropped } : i)));

  const remove = (id: string) => withItems((cur) => cur.filter((i) => i.id !== id));

  return (
    <div className="space-y-7">
      {/* ── 1단계 · 떠오르는 대로 적기 ─────────────────────────── */}
      <div className="space-y-3">
        <Label htmlFor="unit-item">이 단원에서 다루려 했던 내용 · 개념 · 활동</Label>
        <p className="text-caption text-ink-48">
          다듬지 말고 떠오르는 대로 적어 주세요. {SUGGEST_MIN}~10개 정도면 충분합니다.
        </p>
        <div className="flex gap-2">
          <Input
            id="unit-item"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder={`예: ${ex.deleteChallenge[0]}`}
            maxLength={40}
          />
          <Button variant="pearl" size="sm" onClick={add} className="shrink-0" disabled={!draft.trim()}>
            <Plus className="h-4 w-4" /> 추가
          </Button>
        </div>
        {items.length > 0 && (
          <p className="tabular text-fine text-ink-48">
            {items.length}개 적음
            {items.length < 3 && " · 3개 이상 적으면 다음 단계가 열립니다"}
          </p>
        )}
      </div>

      {/* ── 2단계 · 30% 덜어내기 ───────────────────────────────── */}
      {items.length >= 3 && (
        <div className="appear space-y-4">
          <div className="rounded-lg bg-tile-1 px-5 py-5 text-white sm:px-6">
            <p className="flex items-center gap-2 text-fine font-semibold uppercase tracking-[0.08em] text-white/60">
              <Scissors className="h-3.5 w-3.5" /> 갑자기 수업 시간이 30% 줄었습니다
            </p>
            <p className="mt-2 text-body text-white/90">
              모든 것을 가르칠 수 없습니다. 무엇을 포기하시겠습니까?
            </p>
            <p className="mt-3 tabular text-caption text-white/60">
              최소 {target}개를 오른쪽으로 옮겨 주세요 · 지금 {dropped.length}개
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Column
              title="끝까지 남길 것"
              tone="keep"
              count={kept.length}
              empty="모두 덜어냈습니다. 하나쯤은 남겨 주세요."
            >
              {kept.map((it) => (
                <ItemRow
                  key={it.id}
                  text={it.text}
                  actionLabel="덜 다루기로"
                  icon="right"
                  onAction={() => move(it.id, true)}
                  onRemove={() => remove(it.id)}
                />
              ))}
            </Column>

            <Column
              title="이번에는 덜 다루기"
              tone="drop"
              count={dropped.length}
              empty="아직 아무것도 옮기지 않았습니다."
            >
              {dropped.map((it) => (
                <ItemRow
                  key={it.id}
                  text={it.text}
                  actionLabel="다시 남기기"
                  icon="left"
                  muted
                  onAction={() => move(it.id, false)}
                  onRemove={() => remove(it.id)}
                />
              ))}
            </Column>
          </div>
        </div>
      )}

      {/* ── 3단계 · 남긴 이유와 공통점 ──────────────────────────── */}
      {reached && (
        <div className="appear space-y-6 border-t border-hairline pt-7">
          <div className="rounded-lg border border-hairline bg-canvas-parchment px-5 py-4">
            <p className="text-caption font-semibold text-ink-48">끝까지 남긴 것</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {kept.map((it) => (
                <li
                  key={it.id}
                  className="rounded-pill border border-action/35 bg-canvas px-3 py-1.5 text-caption text-ink"
                >
                  {it.text}
                </li>
              ))}
            </ul>
          </div>

          <ReasonField
            id="retainReason"
            label="끝까지 남긴 것들은 왜 남겼습니까?"
            help="2~4문장으로 적어 주세요."
            rows={3}
            value={design.retainReason}
            onChange={(v) => update({ retainReason: v })}
            placeholder="이것을 모르면 다음 단원이 무너져서 / 시험이 아니라 생활에서 쓰게 되어서 …"
          />

          <div className="rounded-lg border-l-[3px] border-action bg-canvas px-5 py-5">
            <ReasonField
              id="commonThread"
              label="남은 것들 사이에 공통으로 흐르는 하나의 생각이 있다면 무엇입니까?"
              help="아직 완성된 문장이 아니어도 됩니다. 다음 활동에서 이것을 한 문장으로 다듬습니다."
              rows={2}
              value={design.commonThread}
              onChange={(v) => update({ commonThread: v })}
              placeholder="예: 힘이 물체의 운동을 바꾼다는 것"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Column({
  title,
  tone,
  count,
  empty,
  children,
}: {
  title: string;
  tone: "keep" | "drop";
  count: number;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        tone === "keep" ? "border-action/35 bg-canvas" : "border-hairline bg-canvas-parchment",
      )}
    >
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <p className={cn("text-caption font-semibold", tone === "keep" ? "text-ink" : "text-ink-48")}>{title}</p>
        <span className="tabular text-fine text-ink-48">{count}</span>
      </div>
      <div className="space-y-2">{count === 0 ? <p className="py-3 text-fine text-ink-48">{empty}</p> : children}</div>
    </div>
  );
}

function ItemRow({
  text,
  actionLabel,
  icon,
  muted,
  onAction,
  onRemove,
}: {
  text: string;
  actionLabel: string;
  icon: "left" | "right";
  muted?: boolean;
  onAction: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-hairline bg-canvas px-3 py-2",
        muted && "opacity-70",
      )}
    >
      <span className={cn("flex-1 text-body-sm leading-[1.5]", muted ? "text-ink-48 line-through" : "text-ink")}>
        {text}
      </span>
      <button
        type="button"
        onClick={onAction}
        title={actionLabel}
        aria-label={actionLabel}
        className="inline-flex min-h-9 min-w-9 items-center justify-center sm:min-h-0 sm:min-w-0 gap-1 rounded-pill border border-hairline px-3 py-1 text-fine text-ink-80 transition-transform active:scale-95 hover:border-action hover:text-action sm:px-2.5"
      >
        {icon === "left" && <ArrowLeft className="h-3 w-3" />}
        <span className="hidden sm:inline">{actionLabel}</span>
        {icon === "right" && <ArrowRight className="h-3 w-3" />}
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="항목 삭제"
        className="inline-flex min-h-9 min-w-9 items-center justify-center sm:min-h-0 sm:min-w-0 rounded-md p-1 text-ink-48 transition-transform active:scale-95 hover:text-bad"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ReasonField({
  id,
  label,
  help,
  rows,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  help?: string;
  rows: number;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {help && <p className="text-caption text-ink-48">{help}</p>}
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-md border border-hairline bg-canvas px-4 py-3 text-body leading-[1.6] text-ink placeholder:text-ink-48 focus:border-action focus:outline-none focus:ring-2 focus:ring-action/25"
      />
    </div>
  );
}
