import type { ReactNode } from "react";
import { Check, Lightbulb, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Disclosure } from "@/components/ui/disclosure";
import { useSession } from "@/lib/session-context";

/** 섹션 표제 — 번호 + 제목 + 한 줄 요지 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  id,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  id?: string;
}) {
  return (
    <header id={id} className="scroll-mt-32 pt-2">
      {eyebrow && (
        <p className="mb-2 text-fine font-semibold uppercase tracking-[0.1em] text-action">{eyebrow}</p>
      )}
      <h2 className="text-display-md sm:text-[2.375rem] sm:leading-[1.15]">{title}</h2>
      {lead && <p className="mt-3 text-lead-airy text-ink-80 sm:text-[1.5rem]">{lead}</p>}
    </header>
  );
}

/** 좌: 흔히 하는 방식 / 우: 더 깊은 방식 */
export function CompareCards({
  leftLabel = "이런 경우가 많습니다",
  rightLabel = "이렇게 바꿔 봅니다",
  items,
}: {
  leftLabel?: string;
  rightLabel?: string;
  items: { left: string; right: string; note?: string }[];
}) {
  return (
    <div className="my-7 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <p className="text-fine font-semibold uppercase tracking-[0.06em] text-ink-48">{leftLabel}</p>
        <p className="hidden text-fine font-semibold uppercase tracking-[0.06em] text-action sm:block">
          {rightLabel}
        </p>
      </div>
      {items.map((it, i) => (
        <div key={i} className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-hairline bg-canvas-parchment px-5 py-4 text-body-sm text-ink-80">
            {it.left}
          </div>
          <div className="rounded-lg border border-action/35 bg-canvas px-5 py-4 text-body-sm text-ink">
            {it.right}
            {it.note && <p className="mt-2 text-caption text-ink-48">{it.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

/** ✕ 흔한 오해 → ○ 실제 */
export function Misconception({
  wrong,
  right,
  children,
}: {
  wrong: string;
  right: string;
  children?: ReactNode;
}) {
  return (
    <div className="my-7 overflow-hidden rounded-lg border border-hairline">
      <div className="flex items-start gap-3 bg-canvas-parchment px-5 py-4">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-pill bg-bad/10">
          <X className="h-3.5 w-3.5 text-bad" />
        </span>
        <p className="text-body-sm text-ink-80">
          <span className="mr-2 font-semibold text-ink">흔한 오해</span>
          {wrong}
        </p>
      </div>
      <div className="flex items-start gap-3 border-t border-hairline bg-canvas px-5 py-4">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-pill bg-good/10">
          <Check className="h-3.5 w-3.5 text-good" />
        </span>
        <div className="text-body-sm text-ink">
          <p>
            <span className="mr-2 font-semibold">실제로는</span>
            {right}
          </p>
          {children && <div className="mt-2 text-ink-80">{children}</div>}
        </div>
      </div>
    </div>
  );
}

/** 고급 용어(개념 렌즈·스트랜드 등)는 본문에서 빼고 여기에 격리한다. */
export function MoreInfo({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Disclosure
      className="my-6"
      tone="parchment"
      title={
        <span className="inline-flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-action" />
          더 알아보기 · {title}
        </span>
      }
    >
      {children}
    </Disclosure>
  );
}

/**
 * 교수자 진행 팁 — 발표 모드/강사 화면에서만 보인다.
 * 연수생 화면에서는 렌더되지 않으므로 프로젝터를 미러링해도 안전하다.
 */
export function PresenterTip({ children, always = false }: { children: ReactNode; always?: boolean }) {
  const { presentMode } = useSession();
  if (!presentMode && !always) return null;
  return (
    <aside className="my-6 rounded-lg border border-dashed border-action/50 bg-action/[0.04] px-5 py-4">
      <p className="mb-1.5 text-fine font-semibold uppercase tracking-[0.08em] text-action">교수자 진행 팁</p>
      <div className="space-y-1.5 text-body-sm text-ink-80">{children}</div>
    </aside>
  );
}

/** 번호가 붙은 예시 목록 */
export function ExampleList({
  items,
  tone = "plain",
}: {
  items: { label?: string; text: string }[];
  tone?: "plain" | "good" | "bad";
}) {
  return (
    <ul className="my-5 space-y-2.5">
      {items.map((it, i) => (
        <li
          key={i}
          className={cn(
            "rounded-md border px-4 py-3 text-body-sm",
            tone === "plain" && "border-hairline bg-canvas text-ink-80",
            tone === "good" && "border-good/25 bg-[#f2f8f4] text-ink",
            tone === "bad" && "border-hairline bg-canvas-parchment text-ink-48 line-through decoration-ink-48/40",
          )}
        >
          {it.label && <span className="mr-2 font-semibold text-ink">{it.label}</span>}
          <span className={cn(tone === "bad" && "no-underline")}>{it.text}</span>
        </li>
      ))}
    </ul>
  );
}

/** 짧은 안내 문구 */
export function Note({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "action" }) {
  return (
    <p
      className={cn(
        "my-5 rounded-md px-4 py-3 text-caption leading-[1.6]",
        tone === "neutral" ? "bg-canvas-parchment text-ink-80" : "bg-action/[0.06] text-ink-80",
      )}
    >
      {children}
    </p>
  );
}
