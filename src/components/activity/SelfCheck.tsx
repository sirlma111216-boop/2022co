import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn, safeJson } from "@/lib/utils";

/**
 * 작성한 뒤 스스로 점검하는 체크리스트.
 * 통과하지 못해도 다음 단계로 넘어갈 수 있다 — 막는 장치가 아니라 되읽게 하는 장치다.
 * 체크 상태는 이 브라우저에만 남는다(설계안 본문이 아니므로 서버에 올리지 않는다).
 */
export function SelfCheck({
  id,
  title = "쓰고 나서 스스로 확인해 보세요",
  items,
}: {
  id: string;
  title?: string;
  items: string[];
}) {
  const key = `bl.selfcheck.${id}`;
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));

  useEffect(() => {
    const saved = safeJson<boolean[] | null>(localStorage.getItem(key), null);
    if (saved && saved.length === items.length) setChecked(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const toggle = (i: number) => {
    const next = checked.map((c, idx) => (idx === i ? !c : c));
    setChecked(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  const done = checked.filter(Boolean).length;

  return (
    <div className="my-6 rounded-lg border border-hairline bg-canvas-parchment px-5 py-4">
      <div className="mb-3 flex flex-wrap items-baseline gap-3">
        <p className="text-caption font-semibold text-ink">{title}</p>
        <span className="tabular text-fine text-ink-48">
          {done} / {items.length}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => toggle(i)}
              className="flex w-full items-start gap-3 rounded-md px-1 py-1 text-left transition-transform active:scale-[0.995]"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-xs border transition-colors",
                  checked[i] ? "border-action bg-action text-white" : "border-ink-48/50 bg-canvas",
                )}
              >
                {checked[i] && <Check className="h-3 w-3" />}
              </span>
              <span className={cn("text-body-sm leading-[1.6]", checked[i] ? "text-ink" : "text-ink-80")}>{it}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-hairline pt-3 text-fine text-ink-48">
        다 체크하지 못해도 다음으로 넘어갈 수 있습니다. 무엇이 빠졌는지 알아차리는 것이 목적입니다.
      </p>
    </div>
  );
}
