import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SectionRef {
  id: string;
  label: string;
}

/** 교시 첫 화면의 표제부 — 전체 폭 어두운 타일로 차시 전환을 분명히 한다. */
export function SessionHero({
  kicker,
  title,
  lead,
  minutes,
  goals,
}: {
  kicker: string;
  title: string;
  lead: string;
  minutes: number;
  goals: string[];
}) {
  return (
    <header className="bg-tile-1 py-14 text-white sm:py-[72px]">
      <div className="content-w">
        <p className="text-fine font-semibold uppercase tracking-[0.14em] text-white/55">{kicker}</p>
        <h1 className="mt-3 max-w-[18ch] text-[2.25rem] leading-[1.14] tracking-[-0.022em] text-white sm:text-[3.25rem]">
          {title}
        </h1>
        <p className="mt-5 max-w-reading text-lead-airy text-white/80">{lead}</p>

        <div className="mt-9 grid gap-3 border-t border-white/15 pt-7 sm:grid-cols-[auto_1fr] sm:gap-8">
          <p className="tabular text-caption text-white/50">{minutes}분</p>
          <ul className="space-y-2">
            {goals.map((g, i) => (
              <li key={i} className="flex gap-3 text-body-sm text-white/85">
                <span className="tabular mt-[3px] text-fine text-white/40">{String(i + 1).padStart(2, "0")}</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}

/** 우측 고정 목차 (데스크톱) + 상단 칩 (모바일) */
export function SectionRail({ sections }: { sections: SectionRef[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-130px 0px -60% 0px", threshold: 0 },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  return (
    <>
      <div className="sticky top-[92px] z-20 -mx-4 mb-6 overflow-x-auto px-4 py-2 lg:hidden no-print">
        <div className="flex gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={cn(
                "shrink-0 rounded-pill border px-3 py-1.5 text-fine",
                active === s.id ? "border-action bg-action text-white" : "border-hairline bg-canvas text-ink-48",
              )}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <nav className="sticky top-32 hidden max-h-[70vh] overflow-y-auto lg:block no-print">
        <p className="mb-3 text-fine font-semibold uppercase tracking-[0.08em] text-ink-48">이 시간의 흐름</p>
        <ul className="space-y-1 border-l border-hairline">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={cn(
                  "-ml-px block border-l-2 py-1.5 pl-4 text-caption transition-colors",
                  active === s.id
                    ? "border-action font-semibold text-action"
                    : "border-transparent text-ink-48 hover:text-ink-80",
                )}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

/** 본문 + 우측 목차 2단 레이아웃 */
export function SessionLayout({ sections, children }: { sections: SectionRef[]; children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-wide gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_210px] lg:gap-14 lg:py-14">
      <div className="min-w-0">{children}</div>
      {/* min-w-0 이 없으면 모바일에서 칩 줄이 그리드 열을 밀어 가로 스크롤이 생긴다 */}
      <aside className="order-first min-w-0 lg:order-last">
        <SectionRail sections={sections} />
      </aside>
    </div>
  );
}

/** 페이지 하단 이동 */
export function PageNav({
  prev,
  next,
}: {
  prev?: { to: string; label: string };
  next?: { to: string; label: string };
}) {
  return (
    <div className="mt-14 flex flex-col gap-3 border-t border-hairline pt-8 sm:flex-row sm:items-center no-print">
      {prev ? (
        <Link
          to={prev.to}
          className="inline-flex items-center gap-2 rounded-pill border border-hairline px-5 py-3 text-body-sm text-ink-80 transition-transform active:scale-[0.97]"
        >
          <ArrowLeft className="h-4 w-4" />
          {prev.label}
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          to={next.to}
          className="inline-flex items-center gap-2 rounded-pill bg-action px-6 py-3 text-body-sm text-white transition-transform active:scale-[0.97] sm:ml-auto"
        >
          {next.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
