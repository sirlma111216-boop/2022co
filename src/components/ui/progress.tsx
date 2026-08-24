import { cn } from "@/lib/utils";

export function Progress({
  value,
  max = 100,
  className,
  tone = "action",
}: {
  value: number;
  max?: number;
  className?: string;
  tone?: "action" | "ink";
}) {
  const pct = max === 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-pill bg-hairline", className)}>
      <div
        className={cn("h-full rounded-pill transition-[width] duration-500", tone === "action" ? "bg-action" : "bg-ink")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
