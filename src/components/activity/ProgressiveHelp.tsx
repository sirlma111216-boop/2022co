import { useState } from "react";
import { HelpCircle, Lightbulb, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 점진적 도움말.
 *
 * 예시를 처음부터 펼쳐 두면 연수생이 스스로 생각하기 전에 그것을 변형해 답한다.
 * 그래서 기본 상태에서는 아무것도 보여 주지 않고, 막혔을 때만 한 단계씩 연다.
 * 힌트를 봤다고 불이익은 없다 — 눈치 주는 문구를 쓰지 않는다.
 */
export function ProgressiveHelp({
  hint1,
  hint2,
  example,
  className,
}: {
  hint1?: string;
  hint2?: string;
  example?: string;
  className?: string;
}) {
  const [level, setLevel] = useState(0); // 0=닫힘, 1=힌트1, 2=힌트2
  const [showExample, setShowExample] = useState(false);

  const hasHint1 = !!hint1;
  const hasHint2 = !!hint2;
  const hasExample = !!example;
  if (!hasHint1 && !hasHint2 && !hasExample) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {hasHint1 && level === 0 && (
          <HelpButton onClick={() => setLevel(1)} icon={HelpCircle}>
            조금 막혔어요
          </HelpButton>
        )}
        {hasHint2 && level === 1 && (
          <HelpButton onClick={() => setLevel(2)} icon={Plus}>
            힌트 하나 더 보기
          </HelpButton>
        )}
        {hasExample && !showExample && (
          <HelpButton onClick={() => setShowExample(true)} icon={Lightbulb}>
            예시 보기
          </HelpButton>
        )}
      </div>

      {level >= 1 && hint1 && <HelpBox label="힌트 1">{hint1}</HelpBox>}
      {level >= 2 && hint2 && <HelpBox label="힌트 2">{hint2}</HelpBox>}
      {showExample && example && (
        <HelpBox label="예시" tone="example">
          {example}
        </HelpBox>
      )}
    </div>
  );
}

function HelpButton({
  onClick,
  icon: Icon,
  children,
}: {
  onClick: () => void;
  icon: typeof HelpCircle;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-pill border border-hairline bg-canvas px-3.5 py-2 text-fine text-ink-80 transition-transform active:scale-95 hover:border-action hover:text-action sm:min-h-0 sm:px-3 sm:py-1.5"
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

function HelpBox({
  label,
  tone = "hint",
  children,
}: {
  label: string;
  tone?: "hint" | "example";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "appear rounded-md px-4 py-3 text-caption leading-[1.7]",
        tone === "example" ? "bg-canvas-parchment text-ink-80" : "border-l-2 border-action bg-action/[0.05] text-ink-80",
      )}
    >
      <span className="mr-2 text-fine font-semibold uppercase tracking-[0.06em] text-ink-48">{label}</span>
      {children}
    </div>
  );
}
