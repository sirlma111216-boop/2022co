import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 접기/펼치기. 긴 설명이 한 화면을 잡아먹지 않도록 하는 기본 장치.
 * (프로젝터에서 접힌 상태가 잘 보이도록 라벨을 충분히 크게 유지한다.)
 */
export function Disclosure({
  title,
  children,
  defaultOpen = false,
  tone = "plain",
  right,
  className,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  tone?: "plain" | "parchment";
  right?: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-hairline",
        tone === "parchment" ? "bg-canvas-parchment" : "bg-canvas",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-transform duration-150 active:scale-[0.995]"
      >
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-action transition-transform duration-200", open && "rotate-180")}
        />
        <span className="flex-1 text-body-sm font-semibold text-ink">{title}</span>
        {right}
      </button>
      {open && (
        <div id={id} className="border-t border-hairline px-5 py-5 text-body-sm leading-[1.68] text-ink-80">
          {children}
        </div>
      )}
    </div>
  );
}
