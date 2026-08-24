import { HelpCircle } from "lucide-react";
import { TERM_MAP, type Term } from "@/content/terms";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const ROWS: { key: keyof Term; label: string; num: string }[] = [
  { key: "oneLine", label: "한 줄 정의", num: "①" },
  { key: "easy", label: "쉬운 설명", num: "②" },
  { key: "science", label: "과학 수업 예", num: "③" },
  { key: "misconception", label: "흔히 하는 오해", num: "④" },
  { key: "summary", label: "한 문장 정리", num: "⑤" },
];

export function TermBody({ term }: { term: Term }) {
  return (
    <dl className="divide-y divide-hairline">
      {ROWS.map(({ key, label, num }) => (
        <div key={key} className="grid gap-1.5 py-4 sm:grid-cols-[132px_1fr] sm:gap-5">
          <dt className="flex items-baseline gap-1.5 text-caption font-semibold text-ink-48">
            <span className="text-action">{num}</span>
            {label}
          </dt>
          <dd
            className={cn(
              "text-body-sm leading-[1.72] text-ink-80",
              key === "summary" && "font-semibold text-ink",
              key === "misconception" && "text-ink-80",
            )}
          >
            {term[key]}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** 화면에 펼쳐 두는 용어 카드 */
export function TermCard({ id, className }: { id: string; className?: string }) {
  const term = TERM_MAP[id];
  if (!term) return null;
  return (
    <section className={cn("my-7 overflow-hidden rounded-lg border border-hairline bg-canvas", className)}>
      <header className="flex items-baseline gap-3 border-b border-hairline bg-canvas-parchment px-5 py-4 sm:px-6">
        <span className="text-fine font-semibold uppercase tracking-[0.08em] text-ink-48">용어</span>
        <h3 className="text-tagline">{term.name}</h3>
      </header>
      <div className="px-5 py-1 sm:px-6">
        <TermBody term={term} />
      </div>
    </section>
  );
}

/** 본문 안에서 용어를 누르면 열리는 작은 칩 */
export function TermChip({ id, label }: { id: string; label?: string }) {
  const term = TERM_MAP[id];
  if (!term) return <span>{label ?? id}</span>;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="mx-0.5 inline-flex items-baseline gap-1 rounded-xs px-1 text-action underline decoration-action/35 underline-offset-4 transition-transform active:scale-[0.97] hover:decoration-action"
        >
          {label ?? term.name}
          <HelpCircle className="h-3.5 w-3.5 shrink-0 self-center" aria-hidden />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{term.name}</DialogTitle>
          <p className="mt-1 text-caption text-ink-48">{term.oneLine}</p>
        </DialogHeader>
        <div className="overflow-y-auto px-6 py-1">
          <TermBody term={term} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
