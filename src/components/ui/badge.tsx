import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "action" | "good" | "warn" | "dark";

const tones: Record<Tone, string> = {
  neutral: "bg-canvas-parchment text-ink-80 border-transparent",
  action: "bg-action/10 text-action border-transparent",
  good: "bg-[#eaf5ee] text-good border-transparent",
  warn: "bg-[#fdf4e3] text-warn border-transparent",
  dark: "bg-ink text-white border-transparent",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border px-2.5 py-1 text-fine font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
