import { ArrowRight } from "lucide-react";
import { useSession } from "@/lib/session-context";
import type { DesignField } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * 앞 단계에서 쓴 내용을 다시 보여 주는 카드.
 * "하나의 설계가 계속 자라고 있다"는 감각을 만드는 장치라, 비어 있을 때도 숨기지 않고
 * 어디로 돌아가 채우면 되는지 알려 준다.
 */
export function CarryOver({
  title = "아까 작성한 내용을 다시 볼까요?",
  fields,
  hint,
  className,
}: {
  title?: string;
  fields: { field: DesignField; label: string; fallback?: string }[];
  hint?: string;
  className?: string;
}) {
  const { design } = useSession();
  return (
    <aside
      className={cn(
        "my-8 overflow-hidden rounded-lg border border-hairline bg-canvas-parchment",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-hairline px-5 py-3">
        <ArrowRight className="h-4 w-4 text-action" />
        <p className="text-caption font-semibold text-ink">{title}</p>
      </div>
      <dl className="divide-y divide-hairline">
        {fields.map(({ field, label, fallback }) => {
          const v = ((design[field] as string) ?? "").trim();
          return (
            <div key={field} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[150px_1fr] sm:gap-4">
              <dt className="text-caption font-semibold text-ink-48">{label}</dt>
              <dd className={cn("text-body-sm leading-[1.65]", v ? "text-ink" : "text-ink-48")}>
                {v || fallback || "아직 비어 있습니다."}
              </dd>
            </div>
          );
        })}
      </dl>
      {hint && <p className="border-t border-hairline px-5 py-3 text-fine text-ink-48">{hint}</p>}
    </aside>
  );
}
