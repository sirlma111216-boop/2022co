import type { ReactNode } from "react";
import { useSession } from "@/lib/session-context";

/**
 * A4 세로 1장 설계안.
 * 화면에서는 종이처럼 보이고, 인쇄하면 이 요소만 남는다(index.css의 @media print 참조).
 * 한 페이지를 넘기지 않도록 글자 크기와 여백을 인쇄 CSS에서 다시 조인다.
 */
export function DesignSheet() {
  const { design: d, profile } = useSession();

  const elements = d.assessmentElements.filter((e) => e.name.trim());
  const activities = d.learningActivities
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div
      id="print-sheet"
      className="sheet-paper mx-auto border border-hairline text-ink shadow-object print:border-0"
    >
      {/* 표제부 */}
      <header className="border-b-2 border-ink pb-2.5">
        <p className="sheet-label text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-48">
          2022 개정 교육과정 기반
        </p>
        <h1 className="mt-1 text-[19px] font-semibold leading-[1.2] tracking-[-0.02em]">
          단원 수업·평가 설계안
        </h1>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-ink-80">
          <Meta label="교과" value={profile?.subject} />
          <Meta label="학교급" value={profile?.schoolLevel} />
          <Meta label="단원" value={d.unitName} />
          <Meta label="작성" value={profile?.nickname} />
        </div>
      </header>

      <div className="mt-3 space-y-3">
        <Section n="1" title="교육과정에서 출발하기">
          <Row label="성취기준" value={d.achievementStandard} />
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            <Cell label="지식·이해" value={d.knowledgeUnderstanding} />
            <Cell label="과정·기능" value={d.processSkill} />
            <Cell label="가치·태도" value={d.valueAttitude} />
          </div>
        </Section>

        <Section n="2" title="학생에게 무엇을 남길 것인가">
          <Row label="단원 수준 핵심 아이디어" value={d.keyIdea} />
          <Row label="영속적 이해" value={d.enduringUnderstanding} strong />
        </Section>

        <Section n="3" title="어떤 질문으로 생각하게 할 것인가">
          <div className="grid grid-cols-3 gap-2">
            <Cell label="확인 질문" value={d.inquiryFact} />
            <Cell label="연결 질문" value={d.inquiryConcept} />
            <Cell label="확장·논쟁 질문" value={d.inquiryDebate} />
          </div>
        </Section>

        <Section n="4" title="무엇을 보면 이해했다고 판단할 것인가">
          <Row
            label="수행과제"
            value={[
              d.graspsG && `[목표] ${d.graspsG}`,
              d.graspsR && `[역할] ${d.graspsR}`,
              d.graspsA && `[대상] ${d.graspsA}`,
              d.graspsS && `[상황] ${d.graspsS}`,
              d.graspsP && `[산출물] ${d.graspsP}`,
              d.graspsS2 && `[기준] ${d.graspsS2}`,
            ]
              .filter(Boolean)
              .join("  ")}
          />
          {elements.length > 0 && (
            <table className="mt-1.5 w-full border-collapse text-[9.5px]">
              <thead>
                <tr className="bg-canvas-parchment text-left">
                  <th className="w-[24%] border border-hairline px-1.5 py-1 font-semibold">평가요소</th>
                  <th className="border border-hairline px-1.5 py-1 font-semibold">상</th>
                  <th className="border border-hairline px-1.5 py-1 font-semibold">중</th>
                  <th className="border border-hairline px-1.5 py-1 font-semibold">하</th>
                </tr>
              </thead>
              <tbody>
                {elements.map((e, i) => (
                  <tr key={i} className="align-top">
                    <td className="border border-hairline px-1.5 py-1 font-semibold">{e.name}</td>
                    <td className="border border-hairline px-1.5 py-1">{e.high}</td>
                    <td className="border border-hairline px-1.5 py-1">{e.mid}</td>
                    <td className="border border-hairline px-1.5 py-1">{e.low}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        <Section n="5" title="어떤 학습 경험을 제공할 것인가">
          {activities.length > 0 ? (
            <ol className="sheet-body space-y-0.5 text-[10px] leading-[1.45]">
              {activities.map((a, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-ink-48">·</span>
                  <span>{a}</span>
                </li>
              ))}
            </ol>
          ) : (
            <Empty />
          )}
        </Section>

        <Section n="6" title="어떻게 성장하도록 도울 것인가">
          <div className="grid grid-cols-3 gap-2">
            <Cell label="Feed Up · 어디로 가는가" value={d.feedUp} />
            <Cell label="Feed Back · 어디까지 왔는가" value={d.feedBack} />
            <Cell label="Feed Forward · 다음 한 걸음" value={d.feedForward} />
          </div>
        </Section>
      </div>

      <footer className="mt-3 border-t border-hairline pt-1.5 text-[8px] text-ink-48">
        성취기준 → 이해 → 질문 → 평가 → 수업 → 피드백 · 거꾸로 설계 연수실에서 작성
      </footer>
    </div>
  );
}

function Meta({ label, value }: { label: string; value?: string }) {
  return (
    <span>
      <span className="text-ink-48">{label}</span>{" "}
      <span className="font-semibold">{value?.trim() || "—"}</span>
    </span>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="sheet-section">
      <h2 className="mb-1 flex items-baseline gap-1.5 text-[11px] font-semibold leading-none">
        <span className="flex h-[15px] w-[15px] items-center justify-center rounded-pill bg-ink text-[8.5px] text-white">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="mt-1 grid grid-cols-[92px_1fr] gap-2 border-t border-divider-soft pt-1">
      <span className="sheet-label text-[9px] font-semibold text-ink-48">{label}</span>
      <span
        className={`sheet-body text-[10px] leading-[1.45] ${strong ? "font-semibold" : ""} ${
          value.trim() ? "" : "text-ink-48"
        }`}
      >
        {value.trim() || "—"}
      </span>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[4px] border border-hairline px-1.5 py-1">
      <p className="sheet-label text-[8.5px] font-semibold text-ink-48">{label}</p>
      <p className={`sheet-body mt-0.5 text-[10px] leading-[1.42] ${value.trim() ? "" : "text-ink-48"}`}>
        {value.trim() || "—"}
      </p>
    </div>
  );
}

function Empty() {
  return <p className="text-[10px] text-ink-48">—</p>;
}
