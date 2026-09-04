import { cn } from "@/lib/utils";

export interface BarDatum {
  key: string;
  label: string;
  value: number;
  highlight?: boolean;
}

/**
 * 프로젝터에서 뒤쪽 자리까지 읽히는 것이 유일한 목표인 막대그래프.
 * 차트 라이브러리를 쓰지 않는다 — 굵은 막대, 큰 숫자, 최소한의 선.
 */
export function Bars({ data, total, dark = false }: { data: BarDatum[]; total?: number; dark?: boolean }) {
  const sum = total ?? data.reduce((a, b) => a + b.value, 0);
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="space-y-4">
      {data.map((d) => {
        const pct = sum === 0 ? 0 : Math.round((d.value / sum) * 100);
        return (
          <div key={d.key}>
            <div className="mb-1.5 flex items-baseline gap-3">
              <span className={cn("flex-1 text-body-sm", dark ? "text-white/85" : "text-ink-80")}>
                {d.label}
              </span>
              <span
                className={cn(
                  "tabular text-body-sm font-semibold",
                  dark ? "text-white" : "text-ink",
                )}
              >
                {pct}%
              </span>
              <span className={cn("tabular w-10 text-right text-fine", dark ? "text-white/50" : "text-ink-48")}>
                {d.value}명
              </span>
            </div>
            <div className={cn("h-3 w-full overflow-hidden rounded-pill", dark ? "bg-white/12" : "bg-hairline")}>
              <div
                className={cn(
                  "h-full origin-left rounded-pill transition-[width] duration-700 ease-out",
                  d.highlight ? "bg-action" : dark ? "bg-white/55" : "bg-ink/70",
                )}
                style={{ width: `${(d.value / max) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className={cn("tabular pt-1 text-fine", dark ? "text-white/50" : "text-ink-48")}>
        전체 {sum}명 응답
      </p>
    </div>
  );
}

/** 선택지 버튼 묶음 — 고르면 잠기고 결과가 열린다. */
export function ChoiceList<K extends string>({
  options,
  selected,
  onSelect,
  disabled,
}: {
  options: { key: K; label: string; sub?: string }[];
  selected: K | null;
  onSelect: (k: K) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((o) => {
        const on = selected === o.key;
        return (
          <button
            key={o.key}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(o.key)}
            className={cn(
              "rounded-lg border px-5 py-4 text-left transition-transform duration-150 active:scale-[0.98]",
              on ? "border-action bg-action/[0.06]" : "border-hairline bg-canvas hover:border-ink-48/40",
              // 선택 후에도 다른 보기를 누를 수 있다 — 완전히 죽은 것처럼 보이지 않게 한다
              disabled ? "opacity-60" : !!selected && !on && "opacity-80",
            )}
          >
            <span className="flex items-baseline gap-3">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-pill text-caption font-semibold",
                  on ? "bg-action text-white" : "bg-canvas-parchment text-ink-80",
                )}
              >
                {o.key}
              </span>
              <span className="flex-1">
                <span className="block text-body-sm text-ink">{o.label}</span>
                {o.sub && <span className="mt-1 block text-fine text-ink-48">{o.sub}</span>}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
