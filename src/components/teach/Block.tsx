import type { ReactNode } from "react";
import { BookOpen, FlaskConical, MessageSquareQuote, PenLine, Sparkles } from "lucide-react";
import { useSubjectExample } from "@/lib/subject";
import { cn } from "@/lib/utils";

export type BlockKind = "read" | "teacher" | "science" | "think" | "oneline";

const META: Record<BlockKind, { label: string; icon: typeof BookOpen }> = {
  read: { label: "함께 읽어보기", icon: BookOpen },
  teacher: { label: "교수자 설명", icon: MessageSquareQuote },
  // 라벨은 선택한 교과에 따라 바뀐다(아래에서 덮어쓴다). 여기 값은 마지막 안전망.
  science: { label: "수업에서 보면", icon: FlaskConical },
  think: { label: "잠깐 생각해보기", icon: PenLine },
  oneline: { label: "한 문장으로 정리", icon: Sparkles },
};

/**
 * 강의 서술의 기본 단위.
 * 강조는 색을 늘리지 않고 '면(surface) 전환'으로 만든다 —
 * [잠깐 생각해보기]만 어두운 면으로 뒤집어 리듬을 만든다.
 */
export function Block({
  kind,
  children,
  title,
  className,
}: {
  kind: BlockKind;
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  const ex = useSubjectExample();
  const { label: baseLabel, icon: Icon } = META[kind];
  const label = kind === "science" ? ex.lens : baseLabel;
  const dark = kind === "think";

  return (
    <section
      className={cn(
        "my-7 rounded-lg px-5 py-5 sm:px-7 sm:py-6",
        kind === "read" && "bg-canvas-parchment",
        kind === "teacher" && "border-l-[3px] border-action bg-canvas pl-5 sm:pl-6",
        kind === "science" && "border border-hairline bg-canvas-pearl",
        kind === "think" && "bg-tile-1 text-white",
        kind === "oneline" && "border-l-[3px] border-action bg-canvas-parchment",
        className,
      )}
    >
      <div
        className={cn(
          "mb-3 flex items-center gap-2 text-fine font-semibold uppercase tracking-[0.06em]",
          dark ? "text-white/70" : "text-ink-48",
        )}
      >
        <Icon className="h-[15px] w-[15px]" aria-hidden />
        <span>{label}</span>
      </div>

      {title && (
        <h3 className={cn("mb-2 text-tagline", dark && "text-white")}>{title}</h3>
      )}

      <div
        className={cn(
          "space-y-3 text-body leading-[1.72]",
          dark ? "text-white/90" : "text-ink-80",
          kind === "oneline" && "text-[1.25rem] font-semibold leading-[1.5] text-ink sm:text-[1.375rem]",
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** 강사가 소리 내어 읽는 한 줄. 전체 폭 어두운 타일로 시선을 끌어당긴다. */
export function PullQuote({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <blockquote
      className={cn(
        "my-9 rounded-lg px-6 py-8 text-center sm:px-10 sm:py-10",
        tone === "dark" ? "bg-tile-1 text-white" : "bg-canvas-parchment text-ink",
      )}
    >
      <p className="pull-quote mx-auto max-w-[30ch]">{children}</p>
    </blockquote>
  );
}
