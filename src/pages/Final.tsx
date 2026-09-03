import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Check, FileDown, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DesignSheet } from "@/components/sheet/DesignSheet";
import { SectionHeading } from "@/components/teach/elements";
import { useSession } from "@/lib/session-context";
import { cn, isFilled } from "@/lib/utils";

export default function Final() {
  const { design: d, profile } = useSession();
  const [copied, setCopied] = useState("");

  const checks = [
    { label: "성취기준", ok: isFilled(d.achievementStandard, 8), to: "/s1#a1" },
    { label: "핵심 행동", ok: isFilled(d.standardCoreAction, 2), to: "/s1#a1" },
    { label: "30% 삭제", ok: isFilled(d.commonThread, 4), to: "/s2#m1" },
    { label: "남길 한 문장", ok: isFilled(d.enduringUnderstanding, 8), to: "/s2#a2" },
    { label: "핵심 탐구질문", ok: isFilled(d.keyInquiry, 5), to: "/s2#a3" },
    { label: "수행과제", ok: isFilled(d.graspsG, 5) && isFilled(d.graspsP, 3), to: "/s3#a4" },
    {
      label: "RED TEAM",
      ok: (d.redTeamFindings?.length ?? 0) > 0 || isFilled(d.performanceTaskAfter, 10),
      to: "/s3#r1",
    },
    { label: "평가요소", ok: d.assessmentElements.some((e) => isFilled(e.name, 2)), to: "/s3#a5" },
    {
      label: "학습 경험",
      ok: (d.learningExperiences ?? []).some((e) => isFilled(e.what, 4)) || isFilled(d.learningActivities, 8),
      to: "/s3#a6",
    },
    { label: "피드백 3문장", ok: isFilled(d.feedUp, 3) && isFilled(d.feedBack, 3) && isFilled(d.feedForward, 3), to: "/s3#s3-feedback" },
  ];
  const doneCount = checks.filter((c) => c.ok).length;

  const asText = () =>
    [
      "2022 개정 교육과정 기반 단원 수업·평가 설계안",
      `교과: ${profile?.subject ?? ""} / 학교급: ${profile?.schoolLevel ?? ""} / 단원: ${d.unitName}`,
      "",
      "1. 교육과정에서 출발하기",
      `성취기준: ${d.achievementStandard}`,
      `지식·이해: ${d.knowledgeUnderstanding}`,
      `과정·기능: ${d.processSkill}`,
      `가치·태도: ${d.valueAttitude}`,
      `핵심 행동: ${d.standardCoreAction}`,
      "",
      "2. 학생에게 무엇을 남길 것인가",
      `핵심 아이디어: ${d.keyIdea}`,
      `영속적 이해: ${d.enduringUnderstanding}`,
      "",
      "3. 어떤 질문으로 생각하게 할 것인가",
      `핵심 탐구질문: ${d.keyInquiry}`,
      `확인 질문: ${d.inquiryFact}`,
      `연결 질문: ${d.inquiryConcept}`,
      `확장·논쟁 질문: ${d.inquiryDebate}`,
      "",
      "4. 무엇을 보면 이해했다고 판단할 것인가",
      `수행과제(G): ${d.graspsG}`,
      `(R) ${d.graspsR} / (A) ${d.graspsA} / (S) ${d.graspsS}`,
      `(P) ${d.graspsP} / (S) ${d.graspsS2}`,
      ...(d.performanceTaskAfter.trim() ? [`RED TEAM 수정 후: ${d.performanceTaskAfter}`] : []),
      ...d.assessmentElements
        .filter((e) => e.name.trim())
        .map((e) => `평가요소 - ${e.name} | 상: ${e.high} | 중: ${e.mid} | 하: ${e.low}`),
      "",
      "5. 어떤 학습 경험을 제공할 것인가",
      ...(d.learningExperiences ?? [])
        .filter((e) => e.what.trim())
        .map((e) => `- ${e.what}${e.evidence.trim() ? ` → ${e.evidence.trim()}` : ""}`),
      d.learningActivities,
      "",
      "6. 어떻게 성장하도록 도울 것인가",
      `Feed Up: ${d.feedUp}`,
      `Feed Back: ${d.feedBack}`,
      `Feed Forward: ${d.feedForward}`,
    ].join("\n");

  const share = async () => {
    const text = asText();
    try {
      if (navigator.share) {
        await navigator.share({ title: "나의 단원 수업·평가 설계안", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied("설계안 전문을 클립보드에 복사했습니다.");
    } catch {
      setCopied("복사하지 못했습니다. 화면의 설계안을 직접 선택해 복사해 주세요.");
    }
    window.setTimeout(() => setCopied(""), 3200);
  };

  return (
    <>
      <section className="bg-canvas py-14 sm:py-[72px] no-print">
        <div className="content-w">
          <SectionHeading
            eyebrow="FINAL"
            title="나의 단원 설계 한 장"
            lead="150분 동안 쓰신 내용이 A4 한 장으로 모였습니다. 인쇄하거나 PDF로 저장해 학교로 가져가세요."
          />

          <div className="mt-8 rounded-lg border border-hairline bg-canvas-parchment px-5 py-5 sm:px-6">
            <div className="flex flex-wrap items-baseline gap-3">
              <p className="text-caption font-semibold text-ink">작성 현황</p>
              <p className="tabular text-caption text-ink-48">
                {doneCount} / {checks.length}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {checks.map((c) => (
                <Link
                  key={c.label}
                  to={c.to}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-caption transition-transform active:scale-95",
                    c.ok
                      ? "border-transparent bg-canvas text-ink-80"
                      : "border-warn/40 bg-[#fdf8ee] text-warn",
                  )}
                >
                  {c.ok ? <Check className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                  {c.label}
                </Link>
              ))}
            </div>
            {doneCount < checks.length && (
              <p className="mt-4 text-fine text-ink-48">
                비어 있는 항목을 눌러 해당 활동으로 돌아갈 수 있습니다. 다 채우지 않아도 인쇄는 됩니다.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> 인쇄
            </Button>
            <Button variant="ghost" onClick={() => window.print()}>
              <FileDown className="h-4 w-4" /> PDF로 저장
            </Button>
            <Button variant="pearl" onClick={share}>
              <Share2 className="h-4 w-4" /> 공유하기
            </Button>
            <span className="text-fine text-ink-48">
              {copied || "PDF 저장은 인쇄 대화상자에서 대상을 'PDF로 저장'으로 바꾸면 됩니다."}
            </span>
          </div>
        </div>
      </section>

      {/* 종이 미리보기 — 파치먼트 면 위에 흰 종이를 올린다 */}
      <section className="bg-canvas-parchment py-10 print:bg-white print:py-0">
        <div className="mx-auto w-full max-w-[calc(210mm+40px)] overflow-x-auto px-5 print:max-w-none print:overflow-visible print:px-0">
          <div className="origin-top-left scale-[0.42] sm:origin-top sm:scale-[0.8] lg:scale-100 print:scale-100">
            <DesignSheet />
          </div>
        </div>
      </section>

      <section className="bg-canvas py-14 no-print">
        <div className="content-w">
          <div className="rounded-lg border border-hairline bg-canvas px-6 py-7">
            <h2 className="text-tagline">아직 끝이 아닙니다 · FINAL MISSION</h2>
            <p className="mt-2 max-w-reading text-body-sm leading-[1.7] text-ink-80">
              설계안을 만들었다고 수업이 바뀌지는 않습니다. 마지막으로, 150분 전에 적으셨던 「가장 공들였던
              활동」을 다시 꺼내 지금의 설계와 나란히 놓고 직접 결정해 보세요.
            </p>
            <Link
              to="/reflect"
              className="mt-5 inline-flex items-center gap-2 rounded-pill bg-action px-6 py-3 text-body-sm text-white transition-transform active:scale-[0.97]"
            >
              처음의 내 수업과 다시 만나기 →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
