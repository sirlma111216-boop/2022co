import { Block, PullQuote } from "@/components/teach/Block";
import {
  CompareCards,
  Misconception,
  Note,
  PresenterTip,
  SectionHeading,
} from "@/components/teach/elements";
import { TermCard, TermChip } from "@/components/teach/TermCard";
import { PageNav, SessionHero, SessionLayout } from "@/components/layout/PageParts";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { AutoField } from "@/components/activity/AutoField";
import { AiCoach } from "@/components/activity/AiCoach";
import { CarryOver } from "@/components/activity/CarryOver";
import { ShareBar } from "@/components/wall/Wall";
import { ReverseOrderGame } from "@/components/game/ReverseOrderGame";
import { BAD_GOOD_QUESTIONS, ENDURING_PAIRS, QUESTION_LADDER } from "@/content/examples";
import { useSession } from "@/lib/session-context";
import { isFilled } from "@/lib/utils";

const SECTIONS = [
  { id: "s2-intro", label: "되돌아보기" },
  { id: "s2-keyidea", label: "핵심 아이디어" },
  { id: "s2-enduring", label: "영속적 이해" },
  { id: "a2", label: "ACTIVITY 2" },
  { id: "s2-inquiry", label: "탐구질문 3단계" },
  { id: "a3", label: "ACTIVITY 3" },
  { id: "s2-game", label: "순서를 뒤집어라!" },
];

export default function Session2() {
  const { design } = useSession();
  const a2done = isFilled(design.enduringUnderstanding, 10);
  const a3done =
    isFilled(design.inquiryFact, 5) && isFilled(design.inquiryConcept, 5) && isFilled(design.inquiryDebate, 5);

  return (
    <>
      <SessionHero
        kicker="2교시 · 50분"
        title="무엇을 남길 것인가"
        lead="단원이 끝나고 한 학기가 지난 뒤에도 학생에게 남아 있기를 바라는 것은 무엇입니까? 그 한 문장을 정하는 시간입니다."
        minutes={50}
        goals={[
          "국가 수준 핵심 아이디어를 단원 수준으로 좁혀 쓴다.",
          "이 단원이 끝난 뒤 학생에게 남길 한 문장을 만든다.",
          "정답 맞히기 질문을 탐구질문 3단계로 발전시킨다.",
        ]}
      />

      <SessionLayout sections={SECTIONS}>
        {/* ── 되돌아보기 ──────────────────────────────────────── */}
        <section id="s2-intro" className="scroll-mt-32">
          <SectionHeading
            eyebrow="되돌아보기"
            title="아까 고른 성취기준을 다시 볼까요?"
            lead="1교시에 쓰신 것 위에 오늘의 작업이 쌓입니다."
          />
          <CarryOver
            title="내 성취기준 카드"
            fields={[
              { field: "unitName", label: "단원" },
              { field: "achievementStandard", label: "성취기준" },
              { field: "knowledgeUnderstanding", label: "지식·이해" },
              { field: "processSkill", label: "과정·기능" },
            ]}
            hint="비어 있다면 1교시로 돌아가 채우셔도 되고, 지금 떠오르는 대로 이어 가셔도 됩니다."
          />
          <Block kind="teacher">
            <p>
              1교시에는 성취기준이 <strong>무엇을 요구하는지</strong>를 읽었습니다. 이제 한 걸음 더 갑니다.
              그 성취기준을 다 가르쳤을 때, 학생 머릿속에 <strong>무엇이 남기를 바라는지</strong>를 정합니다.
            </p>
            <p>
              이것을 정하지 않으면 수업 준비는 늘 "무엇을 더 넣을까"가 됩니다. 정하고 나면 반대로 "무엇을
              빼도 되는가"를 판단할 수 있게 됩니다.
            </p>
          </Block>
        </section>

        {/* ── SECTION 3 ──────────────────────────────────────── */}
        <section id="s2-keyidea" className="mt-16 scroll-mt-32">
          <SectionHeading
            eyebrow="SECTION 3"
            title="핵심 아이디어를 이해하기"
            lead="먼저 아주 흔한 오해 하나를 정리하고 갑니다."
          />

          <Misconception
            wrong="핵심 아이디어 = 교육과정 문서에 있는 문장을 그대로 복사해 오는 것"
            right="국가 수준 핵심 아이디어는 출발점이고, 단원 수준으로 좁히는 일은 교사의 몫입니다."
          >
            <p>
              국가 수준 핵심 아이디어는 여러 학년, 여러 단원을 아우르도록 매우 넓게 쓰여 있습니다. 그것을
              그대로 옮겨 적으면 문장은 생겼지만 이번 단원에서 무엇을 남길지는 여전히 정해지지 않은 상태입니다.
            </p>
          </Misconception>

          <Block kind="science" title="좁혀 보기">
            <p>
              <span className="text-ink-48">국가 수준</span> — "물체의 운동 변화는 물체에 작용하는 힘과
              관련된다."
            </p>
            <p>
              이 한 문장은 중1 힘 단원부터 고등학교 역학까지 걸쳐 있습니다. 중2 「힘과 운동」 단원 하나를
              위해서는 너무 넓습니다.
            </p>
            <p>
              <span className="text-ink-48">단원 수준으로 좁히면</span> — "물체에 작용하는 알짜힘이 0이 아닐
              때 물체의 속도가 변한다."
            </p>
            <p>
              좁히고 나니 무엇을 수업에서 확인해야 하는지가 분명해집니다. 알짜힘, 그리고 속도의 변화입니다.
            </p>
          </Block>

          <TermCard id="key-idea" />

          <Note tone="action">
            좁힐 때 도움이 되는 질문 세 가지입니다. ① 이 단원에서만 배우는 것인가, 여러 곳에서 되돌아오는
            것인가? ② 사실 하나인가, 관계를 말하는가? ③ 다른 상황에도 적용되는가?
          </Note>

          <PresenterTip>
            <p>"문서 문장을 그대로 쓰면 왜 안 될까요?"를 먼저 물어보고 답을 기다리세요.</p>
            <p>대부분 "너무 넓어서요"라고 답합니다. 그 답을 받아 좁히기 예시로 넘어가면 자연스럽습니다.</p>
          </PresenterTip>
        </section>

        {/* ── SECTION 4 ──────────────────────────────────────── */}
        <section id="s2-enduring" className="mt-16 scroll-mt-32">
          <SectionHeading
            eyebrow="SECTION 4"
            title="영속적 이해"
            lead="시험이 끝난 뒤에도 학생에게 남아, 다른 상황에서 다시 꺼내 사용할 수 있는 이해."
          />

          <Block kind="read">
            <p>
              <TermChip id="enduring" label="영속적 이해" />는 세 가지 특징을 가집니다.
            </p>
            <ul className="mt-2 space-y-1.5">
              <li>· <strong className="font-semibold text-ink">완결된 문장</strong>입니다. 단어나 제목이 아닙니다.</li>
              <li>· 사실 하나가 아니라 <strong className="font-semibold text-ink">개념들의 관계</strong>를 말합니다.</li>
              <li>· 이 단원 밖의 <strong className="font-semibold text-ink">다른 상황에도 적용</strong>됩니다.</li>
            </ul>
          </Block>

          <CompareCards
            leftLabel="단순 지식"
            rightLabel="보다 깊은 이해"
            items={ENDURING_PAIRS.map((p) => ({ left: p.left, right: p.right, note: p.note }))}
          />

          <Block kind="teacher">
            <p>
              왼쪽 문장들이 틀린 것은 아닙니다. 오히려 수업에서 반드시 다뤄야 하는 내용입니다. 다만 저것만
              남으면 시험이 끝났을 때 함께 사라집니다.
            </p>
            <p>
              오른쪽 문장들은 조금 다릅니다. 학생이 처음 보는 상황을 만났을 때 꺼내 쓸 수 있는 생각입니다.
              엘리베이터에서 몸이 무거워지는 느낌, 버스가 급정거할 때 몸이 앞으로 쏠리는 이유를 저 문장 하나로
              설명해 볼 수 있으니까요.
            </p>
            <p>
              그래서 우리는 단원마다 이런 문장을 <strong>하나만</strong> 정합니다. 여러 개를 정하면 결국
              아무것도 정하지 않은 것과 같아집니다.
            </p>
          </Block>

          <TermCard id="enduring" />

          <Block kind="think">
            <p>지금 맡고 계신 단원을 떠올려 보세요.</p>
            <p>
              그 단원이 끝나고 <strong>1년 뒤</strong>, 학생이 딱 한 문장만 기억한다면 무엇이었으면 좋겠습니까?
            </p>
            <p className="text-white/60">바로 아래 활동에서 그 문장을 적습니다.</p>
          </Block>
        </section>

        {/* ── ACTIVITY 2 ─────────────────────────────────────── */}
        <ActivityCard
          id="a2"
          no="ACTIVITY 2"
          title="수업이 끝난 뒤 한 문장만 남는다면?"
          minutes={10}
          done={a2done}
          prompt={
            <>
              이 단원이 끝난 뒤 학생이 딱 한 문장만 기억한다면 무엇이었으면 좋겠습니까?{" "}
              <strong>완결된 문장</strong>으로, <strong>40자 내외</strong>로 적어 주세요. 단어만 적으면 나중에
              평가할 수 없습니다.
            </>
          }
          footer={
            <div className="w-full space-y-4">
              <ShareBar
                activityId="a2"
                canShare={isFilled(design.enduringUnderstanding, 8)}
                content={() => ({
                  단원: design.unitName,
                  "단원 수준 핵심 아이디어": design.keyIdea,
                  "영속적 이해": design.enduringUnderstanding,
                })}
              />
              <AiCoach task="enduring" applyTo="enduringUnderstanding" />
            </div>
          }
        >
          <CarryOver
            title="참고 · 내 성취기준"
            fields={[{ field: "achievementStandard", label: "성취기준" }]}
            className="my-0"
          />

          <AutoField
            field="keyIdea"
            label="단원 수준으로 좁힌 핵심 아이디어"
            rows={2}
            recommend={60}
            placeholder="국가 수준 핵심 아이디어를 이번 단원 크기로 좁혀 적어 주세요."
            help="교육과정 문서의 문장을 그대로 옮기지 말고, 이번 단원에서 다룰 범위로 줄여 봅니다."
            example="국가 수준: 물체의 운동 변화는 물체에 작용하는 힘과 관련된다. → 단원 수준: 물체에 작용하는 알짜힘이 0이 아닐 때 물체의 속도가 변한다."
          />

          <AutoField
            field="enduringUnderstanding"
            label="학생에게 남길 한 문장 (영속적 이해)"
            rows={3}
            recommend={45}
            placeholder="예: 물체의 운동 변화는 물체에 작용하는 힘과 관계가 있다."
            help="'~이다', '~한다'로 끝나는 완결된 문장으로. 단원명이나 개념어만 적지 않습니다."
            example="빛이 다른 물질을 지날 때 속력이 달라지기 때문에 경로가 꺾이고, 우리는 그 경로를 따라 들어온 빛으로 물체를 본다."
          />

          <Note>
            길게 쓰지 않아도 됩니다. 오히려 짧고 분명한 문장이 수업에서 쓰기 좋습니다. 칠판에 한 줄로 적어 두고
            단원 내내 되돌아올 수 있을 정도면 충분합니다.
          </Note>
        </ActivityCard>

        {/* ── SECTION 5 ──────────────────────────────────────── */}
        <section id="s2-inquiry" className="mt-16 scroll-mt-32">
          <SectionHeading
            eyebrow="SECTION 5"
            title="탐구질문"
            lead="정답을 맞히게 하는 질문과, 학생을 계속 생각하게 만드는 질문은 다릅니다."
          />

          <div className="my-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-hairline bg-canvas-parchment px-5 py-5">
              <p className="text-fine font-semibold uppercase tracking-[0.06em] text-ink-48">좋지 않은 예</p>
              <p className="mt-2 text-body text-ink-48">"힘의 단위는 무엇인가?"</p>
              <p className="mt-3 text-caption leading-[1.6] text-ink-48">
                한 단어로 답이 끝납니다. 답한 학생과 답하지 못한 학생만 갈릴 뿐, 생각은 이어지지 않습니다.
              </p>
            </div>
            <div className="rounded-lg border border-action/35 bg-canvas px-5 py-5">
              <p className="text-fine font-semibold uppercase tracking-[0.06em] text-action">좋은 방향</p>
              <p className="mt-2 text-body text-ink">"힘이 작용하면 물체의 운동은 항상 변할까?"</p>
              <p className="mt-3 text-caption leading-[1.6] text-ink-80">
                답을 말한 뒤에 "왜 그렇게 생각했어?"가 자연스럽게 따라옵니다. 반례를 찾는 학생도 나옵니다.
              </p>
            </div>
          </div>

          <Block kind="read" title="질문을 세 단계로 나누어 봅니다">
            <p>
              한 번에 좋은 질문을 만들기는 어렵습니다. 대신 세 단계로 나누어 만들면 훨씬 쉬워집니다.
            </p>
          </Block>

          <div className="my-7 space-y-4">
            {QUESTION_LADDER.map((q, i) => (
              <div key={q.level} className="overflow-hidden rounded-lg border border-hairline">
                <div className="flex flex-wrap items-baseline gap-3 bg-canvas-parchment px-5 py-3">
                  <span className="tabular text-caption font-semibold text-action">{i + 1}</span>
                  <span className="text-tagline">{q.level}</span>
                  <span className="text-fine text-ink-48">{q.aka}</span>
                </div>
                <div className="space-y-3 bg-canvas px-5 py-4">
                  <p className="text-body-sm leading-[1.68] text-ink-80">{q.desc}</p>
                  <p className="rounded-md bg-canvas-parchment px-4 py-3 text-body-sm text-ink">
                    <span className="mr-2 text-fine font-semibold text-ink-48">힘과 운동</span>
                    {q.science}
                  </p>
                  <p className="rounded-md bg-canvas-parchment px-4 py-3 text-body-sm text-ink">
                    <span className="mr-2 text-fine font-semibold text-ink-48">빛</span>
                    {q.light}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Block kind="teacher">
            <p>
              수업은 보통 확인 질문에서 시작해 확장 질문으로 갑니다. 확인 질문을 건너뛰면 학생이 따라오지
              못하고, 확인 질문만 하면 수업이 퀴즈가 됩니다.
            </p>
            <p>
              특히 세 번째 확장·논쟁 질문이 어렵습니다. 요령이 하나 있습니다.{" "}
              <strong>"만약 ~라면 어떻게 될까?"</strong> 또는 <strong>"~을 정한다면 무엇을 근거로 삼아야
              할까?"</strong> 형태로 바꿔 보세요. 학생이 판단해야 할 상황이 생깁니다.
            </p>
          </Block>

          <div className="my-7 overflow-hidden rounded-lg border border-hairline">
            <p className="bg-canvas-parchment px-5 py-3 text-caption font-semibold text-ink-48">
              바꿔 보기 연습
            </p>
            <ul className="divide-y divide-hairline">
              {BAD_GOOD_QUESTIONS.map((q, i) => (
                <li key={i} className="grid gap-2 px-5 py-4 sm:grid-cols-2 sm:gap-6">
                  <span className="text-body-sm text-ink-48">{q.bad}</span>
                  <span className="text-body-sm text-ink">→ {q.good}</span>
                </li>
              ))}
            </ul>
          </div>

          <TermCard id="inquiry" />
        </section>

        {/* ── ACTIVITY 3 ─────────────────────────────────────── */}
        <ActivityCard
          id="a3"
          no="ACTIVITY 3"
          title="질문 업그레이드"
          minutes={8}
          done={a3done}
          prompt={
            <>
              먼저 지금 떠오르는 질문을 하나 그대로 적어 주세요. 다듬지 않아도 됩니다. 그런 다음 그 질문을
              확인 · 연결 · 확장 세 단계로 발전시켜 봅니다.
            </>
          }
          footer={
            <div className="w-full space-y-4">
              <ShareBar
                activityId="a3"
                canShare={isFilled(design.inquiryConcept, 5) || isFilled(design.inquiryDebate, 5)}
                content={() => ({
                  "처음 질문": design.inquiryOriginal,
                  "확인 질문": design.inquiryFact,
                  "연결 질문": design.inquiryConcept,
                  "확장·논쟁 질문": design.inquiryDebate,
                })}
              />
              <AiCoach task="inquiry" />
            </div>
          }
        >
          <CarryOver
            title="참고 · 내가 남길 한 문장"
            fields={[{ field: "enduringUnderstanding", label: "영속적 이해" }]}
            className="my-0"
          />

          <AutoField
            field="inquiryOriginal"
            label="처음 떠오른 질문"
            single
            placeholder="예: 힘의 단위는 무엇인가?"
            help="지금 그대로 적어 주세요. 이 질문을 아래에서 발전시킵니다."
          />

          <div className="grid gap-5">
            <AutoField
              field="inquiryFact"
              label="① 확인 질문"
              rows={2}
              placeholder="사실과 개념을 확인하는 질문"
              help="수업의 출발점. 답이 비교적 분명한 질문입니다."
              example="알짜힘이 0일 때 물체의 속도는 어떻게 되나요?"
            />
            <AutoField
              field="inquiryConcept"
              label="② 연결 질문"
              rows={2}
              placeholder="여러 개념 사이의 관계를 생각하게 하는 질문"
              help="답이 하나로 떨어지지 않고 설명이 필요한 질문입니다."
              example="힘이 작용하는데도 물체의 속도가 변하지 않는 경우가 있을까요?"
            />
            <AutoField
              field="inquiryDebate"
              label="③ 확장 또는 논쟁 질문"
              rows={2}
              placeholder="새로운 상황에 적용하거나 판단하게 하는 질문"
              help="'만약 ~라면?', '~을 정한다면 무엇을 근거로?' 형태가 만들기 쉽습니다."
              example="자율주행차의 급정거 기준을 정한다면 무엇을 근거로 삼아야 할까요?"
            />
          </div>
        </ActivityCard>

        {/* ── MINI GAME ──────────────────────────────────────── */}
        <section id="s2-game" className="mt-16 scroll-mt-32">
          <SectionHeading eyebrow="MINI GAME" title="순서를 뒤집어라!" lead="3교시로 넘어가기 전 2분." />
          <ReverseOrderGame />
          <PullQuote>목표 → 평가 → 수업</PullQuote>
          <PresenterTip>
            <p>전체가 맞힐 때까지 기다리지 마세요. 두세 분이 성공하면 정답을 함께 확인합니다.</p>
            <p>"활동부터 떠올리는 게 잘못이 아니라, 순서를 한 번 바꿔 보자는 겁니다"라고 정리해 주세요.</p>
          </PresenterTip>
        </section>

        <PageNav
          prev={{ to: "/s1", label: "1교시로 돌아가기" }}
          next={{ to: "/s3", label: "3교시 · 어떻게 확인할 것인가" }}
        />
      </SessionLayout>
    </>
  );
}
