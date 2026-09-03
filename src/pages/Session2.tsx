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
import { DeleteChallenge } from "@/components/activity/DeleteChallenge";
import { ChoicePoll } from "@/components/activity/ChoicePoll";
import { SelfCheck } from "@/components/activity/SelfCheck";
import { DiscussionTimer } from "@/components/activity/DiscussionTimer";
import { Disclosure } from "@/components/ui/disclosure";
import { ShareBar } from "@/components/wall/Wall";
import { ReverseOrderGame } from "@/components/game/ReverseOrderGame";
import { BAD_GOOD_QUESTIONS, ENDURING_PAIRS, QUESTION_JUDGE_OPTIONS, QUESTION_LADDER } from "@/content/examples";
import { useSession } from "@/lib/session-context";
import { POLL_QUESTION } from "@/lib/types";
import { cn, isFilled } from "@/lib/utils";

const SECTIONS = [
  { id: "s2-intro", label: "되돌아보기" },
  { id: "s2-keyidea", label: "핵심 아이디어" },
  { id: "s2-delete", label: "30% 삭제 도전" },
  { id: "s2-enduring", label: "영속적 이해" },
  { id: "a2", label: "ACTIVITY 2" },
  { id: "s2-inquiry", label: "탐구질문 3단계" },
  { id: "a3", label: "ACTIVITY 3" },
  { id: "s2-game", label: "순서를 뒤집어라!" },
];

const PLACEMENTS = [
  { key: "goal", label: "목표", note: "학생에게 남길 이해" },
  { key: "evidence", label: "평가 증거", note: "이해했다는 것을 보여 주는 것" },
  { key: "activity", label: "학습 활동", note: "그 증거가 나오게 하는 경험" },
];

export default function Session2() {
  const { design, update } = useSession();
  const a2done = isFilled(design.enduringUnderstanding);
  const a3done = isFilled(design.keyInquiry);
  const kept = (design.unitItems ?? []).filter((i) => !i.dropped);

  return (
    <>
      <SessionHero
        kicker="2교시 · 50분"
        title="무엇을 남길 것인가"
        lead="단원이 끝나고 한 학기가 지난 뒤에도 학생에게 남아 있기를 바라는 것은 무엇입니까? 그 한 문장을 정하는 시간입니다."
        minutes={50}
        goals={[
          "다루려던 것의 30%를 실제로 덜어내 본다.",
          "남은 것들을 하나의 문장으로 묶어 영속적 이해를 만든다.",
          "학생이 가장 오래 생각할 질문 하나를 만든다.",
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
              { field: "standardCoreAction", label: "핵심 행동" },
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

          <PresenterTip>
            <p>"문서 문장을 그대로 쓰면 왜 안 될까요?"를 먼저 물어보고 답을 기다리세요.</p>
            <p>대부분 "너무 넓어서요"라고 답합니다. 그 답을 받아 바로 다음 미션으로 넘어가면 자연스럽습니다.</p>
          </PresenterTip>
        </section>

        {/* ── MISSION · 30% 삭제 도전 ─────────────────────────── */}
        <ActivityCard
          id="m1"
          no="MISSION"
          title="30% 삭제 도전"
          minutes={10}
          done={isFilled(design.commonThread)}
          prompt={
            <>
              깊이 있는 학습을 위해서는 무엇을 더 넣을지보다,{" "}
              <strong>무엇을 과감히 덜어낼지</strong> 결정해야 할 때가 있습니다. 여기서 덜어낸 만큼 남은
              것이 선명해집니다.
            </>
          }
        >
          <div id="s2-delete" className="scroll-mt-32">
            <DeleteChallenge />
          </div>

          <PresenterTip>
            <p>덜어내기를 어려워하는 분이 많습니다. "완전히 안 가르친다는 뜻이 아니라, 이번에는 덜 다룬다는 뜻"이라고 풀어 주세요.</p>
            <p>다 옮긴 분들께 "무엇을 버릴 때 가장 망설이셨어요?"를 물으면 다음 활동으로 자연스럽게 이어집니다.</p>
          </PresenterTip>
        </ActivityCard>

        {isFilled(design.commonThread, 2) && (
          <PullQuote>이제 방금 버리지 못했던 것들을 한 문장으로 묶어봅니다.</PullQuote>
        )}

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
              방금 끝까지 남긴 것들을 하나의 문장으로 묶어 주세요.{" "}
              <strong>완결된 문장</strong>으로, <strong>40자 내외</strong>로 적습니다.
            </>
          }
          footer={
            <div className="w-full space-y-4">
              <ShareBar
                activityId="a2"
                canShare={isFilled(design.enduringUnderstanding)}
                content={() => ({
                  단원: design.unitName,
                  "끝까지 남긴 것": kept.map((k) => k.text).join(", "),
                  "영속적 이해": design.enduringUnderstanding,
                })}
              />
              <AiCoach task="enduring" applyTo="enduringUnderstanding" />
            </div>
          }
        >
          {/* 30% 삭제 결과 요약 */}
          {kept.length > 0 && (
            <div className="rounded-lg border border-hairline bg-canvas-parchment px-5 py-4">
              <p className="text-caption font-semibold text-ink-48">내가 끝까지 남긴 것</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {kept.map((k) => (
                  <li
                    key={k.id}
                    className="rounded-pill border border-action/35 bg-canvas px-3 py-1.5 text-caption text-ink"
                  >
                    {k.text}
                  </li>
                ))}
              </ul>
              {isFilled(design.retainReason, 2) && (
                <p className="mt-3 border-t border-hairline pt-3 text-caption leading-[1.65] text-ink-80">
                  <span className="mr-2 font-semibold text-ink-48">내가 남긴 이유</span>
                  {design.retainReason}
                </p>
              )}
              {isFilled(design.commonThread, 2) && (
                <p className="mt-2 text-caption leading-[1.65] text-ink">
                  <span className="mr-2 font-semibold text-ink-48">공통으로 흐르는 생각</span>
                  {design.commonThread}
                </p>
              )}
            </div>
          )}

          <AutoField
            field="keyIdea"
            label="단원 수준으로 좁힌 핵심 아이디어"
            rows={2}
            recommend={60}
            placeholder="국가 수준 핵심 아이디어를 이번 단원 크기로 좁혀 적어 주세요."
            hint1="교육과정 문서의 문장에서 이번 단원과 상관없는 학년·범위를 지워 보세요. 남는 것이 단원 수준입니다."
            example="국가 수준: 물체의 운동 변화는 물체에 작용하는 힘과 관련된다. → 단원 수준: 물체에 작용하는 알짜힘이 0이 아닐 때 물체의 속도가 변한다."
          />

          <AutoField
            field="enduringUnderstanding"
            label="학생에게 남길 한 문장 (영속적 이해)"
            rows={3}
            recommend={45}
            placeholder="'~이다', '~한다'로 끝나는 완결된 문장으로 적어 주세요."
            hint1="위에 적은 '공통으로 흐르는 생각'을 그대로 문장으로 펴 보세요. 주어와 서술어를 갖추면 됩니다."
            hint2="'A는 B와 관계가 있다', 'A가 달라지면 B가 달라진다' 같은 관계문 형태가 가장 쉽습니다."
            example="빛이 다른 물질을 지날 때 속력이 달라지기 때문에 경로가 꺾이고, 우리는 그 경로를 따라 들어온 빛으로 물체를 본다."
          />

          <SelfCheck
            id="a2-enduring"
            items={[
              "단어나 단원명이 아니라 완결된 문장인가?",
              "개념 사이의 관계가 들어 있는가?",
              "이 단원이 아닌 새로운 상황에도 적용할 수 있는가?",
              "내가 방금 '남기기로 한 것'과 실제로 연결되는가?",
            ]}
          />

          <Note>
            길게 쓰지 않아도 됩니다. 칠판에 한 줄로 적어 두고 단원 내내 되돌아올 수 있을 정도면 충분합니다.
          </Note>
        </ActivityCard>

        {/* ── SECTION 5 ──────────────────────────────────────── */}
        <section id="s2-inquiry" className="mt-16 scroll-mt-32">
          <SectionHeading
            eyebrow="SECTION 5"
            title="탐구질문"
            lead="정답을 맞히게 하는 질문과, 학생을 계속 생각하게 만드는 질문은 다릅니다."
          />

          {/* 먼저 판별하게 한다 */}
          <ChoicePoll
            pollId={POLL_QUESTION}
            question="이 중 학생들이 가장 오래 생각하고 서로 다른 근거를 이야기할 가능성이 높은 질문은 무엇입니까?"
            options={QUESTION_JUDGE_OPTIONS}
            choiceField="questionJudgeChoice"
            reasonField="questionJudgeReason"
            layout="compact"
            reasonPlaceholder="예: 답이 하나로 떨어지지 않고 근거가 갈릴 것 같아서요."
            afterVote={
              <>
                <Block kind="teacher" className="my-0">
                  <p>
                    C와 D가 많이 갈렸을 겁니다. 둘 다 좋은 질문이지만 결이 다릅니다. C는 개념들 사이의 관계를
                    따지게 하고, D는 가치 판단까지 요구합니다.
                  </p>
                  <p>
                    A는 한 단어로 끝납니다. B는 답이 분명하지만 수업의 출발점으로는 꼭 필요합니다.{" "}
                    <strong>즉 A·B가 나쁜 질문이라는 뜻이 아니라, 서로 하는 일이 다르다는 뜻입니다.</strong>
                  </p>
                </Block>
                <DiscussionTimer seconds={60} label="옆 선생님과 판단 비교하기" />
              </>
            }
          />

          <Block kind="read" title="질문을 세 단계로 나누어 봅니다">
            <p>한 번에 좋은 질문을 만들기는 어렵습니다. 대신 세 단계로 나누어 만들면 훨씬 쉬워집니다.</p>
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
          title="내 단원의 가장 강한 질문 하나"
          minutes={8}
          done={a3done}
          prompt={
            <>
              세 개를 억지로 만들지 않습니다. 먼저{" "}
              <strong>가장 중요한 질문 하나</strong>만 제대로 만듭니다.
            </>
          }
          footer={
            <div className="w-full space-y-4">
              <ShareBar
                activityId="a3"
                canShare={isFilled(design.keyInquiry)}
                content={() => ({
                  "핵심 탐구질문": design.keyInquiry,
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
            field="keyInquiry"
            label="오늘 만든 영속적 이해를 학생이 가장 깊게 생각하게 만드는 질문 하나"
            rows={3}
            placeholder="물음표로 끝나는 한 문장으로 적어 주세요."
            hint1="영속적 이해 문장을 의문문으로 바꿔 보세요. 그다음 '항상 그럴까?', '예외는 없을까?'를 붙이면 단단해집니다."
            hint2="학생마다 다른 답이 나올 여지가 없다면, 아직 확인 질문에 가깝습니다."
            example="힘이 작용하는데도 물체의 속력이 변하지 않는 경우가 있을까?"
          />

          <SelfCheck
            id="a3-key-question"
            title="내 질문을 스스로 점검해 보세요"
            items={[
              "한 단어로 답이 끝나지는 않는가?",
              "이유나 근거를 설명해야 답할 수 있는가?",
              "처음 배운 상황을 넘어 다른 상황으로 연결될 수 있는가?",
              "학생마다 다른 생각이나 근거가 나올 여지가 있는가?",
            ]}
          />

          <Disclosure title="질문을 단계별로 확장해 보기 (선택)" tone="parchment">
            <p className="mb-4 text-caption text-ink-48">
              시간이 남는 분만 하시면 됩니다. 위에서 만든 질문 하나로도 설계안은 완성됩니다.
            </p>
            <div className="grid gap-5">
              <AutoField
                field="inquiryFact"
                label="① 확인 질문"
                rows={2}
                placeholder="사실과 개념을 확인하는 질문"
                example="알짜힘이 0일 때 물체의 속도는 어떻게 되나요?"
              />
              <AutoField
                field="inquiryConcept"
                label="② 연결 질문"
                rows={2}
                placeholder="여러 개념 사이의 관계를 생각하게 하는 질문"
                example="힘이 작용하는데도 물체의 속도가 변하지 않는 경우가 있을까요?"
              />
              <AutoField
                field="inquiryDebate"
                label="③ 확장 또는 논쟁 질문"
                rows={2}
                placeholder="새로운 상황에 적용하거나 판단하게 하는 질문"
                example="자율주행차의 급정거 기준을 정한다면 무엇을 근거로 삼아야 할까요?"
              />
            </div>
          </Disclosure>
        </ActivityCard>

        {/* ── MINI GAME ──────────────────────────────────────── */}
        <section id="s2-game" className="mt-16 scroll-mt-32">
          <SectionHeading eyebrow="MINI GAME" title="순서를 뒤집어라!" lead="3교시로 넘어가기 전 2분." />
          <ReverseOrderGame />

          {/* 미니게임 후속 — 내 활동은 어디에 놓이는가 */}
          <div className="my-8 rounded-lg border border-hairline bg-canvas px-5 py-6 sm:px-7">
            <p className="text-fine font-semibold uppercase tracking-[0.08em] text-action">이어서 한 가지만</p>
            <h3 className="mt-2 text-tagline">
              그렇다면 START에서 적었던 「가장 공들였던 활동」은 이 세 단계 중 어디에 놓여야 합니까?
            </h3>

            {isFilled(design.initialActivity, 2) ? (
              <p className="mt-3 rounded-md bg-canvas-parchment px-4 py-3 text-body-sm text-ink">
                내가 적었던 활동 · <strong className="font-semibold">{design.initialActivity}</strong>
              </p>
            ) : (
              <p className="mt-3 text-caption text-ink-48">
                START에서 활동을 적지 않으셨습니다. 지금 떠오르는 활동으로 생각해 보셔도 됩니다.
              </p>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {PLACEMENTS.map((p) => {
                const on = design.backwardPlacement === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => update({ backwardPlacement: p.key })}
                    className={cn(
                      "rounded-lg border px-4 py-4 text-left transition-transform active:scale-[0.98]",
                      on ? "border-action bg-action/[0.06]" : "border-hairline bg-canvas hover:border-ink-48/40",
                    )}
                  >
                    <span className="block text-body-sm font-semibold text-ink">{p.label}</span>
                    <span className="mt-1 block text-fine text-ink-48">{p.note}</span>
                  </button>
                );
              })}
            </div>

            {design.backwardPlacement && (
              <div className="appear mt-5 rounded-lg border-l-[3px] border-action bg-canvas-parchment px-5 py-4">
                {/* 고른 칸마다 되묻는 지점이 다르다 — 같은 문구를 돌려주면 판단한 보람이 없다 */}
                <p className="text-body-sm leading-[1.72] text-ink">
                  {design.backwardPlacement === "goal" &&
                    "그 활동 자체가 목적지라고 보신 거군요. 그렇다면 한 가지만 물어보겠습니다. 그 활동을 하지 않고도 같은 이해에 도달할 수 있다면, 목표는 활동이 아니라 그 이해 쪽에 있습니다."}
                  {design.backwardPlacement === "evidence" &&
                    "그 활동에서 학생의 이해가 실제로 드러난다면 증거가 맞습니다. 다만 그러려면 '무엇을 보고 판단할지'가 활동 안에 정해져 있어야 합니다. 그 기준이 아직 없다면, 지금은 증거가 아니라 활동입니다."}
                  {design.backwardPlacement === "activity" &&
                    "대부분의 활동이 여기에 놓입니다. 자연스러운 답입니다."}
                </p>
                <p className="mt-2 text-body-sm leading-[1.72] text-ink-80">
                  활동이 중요하지 않다는 뜻이 아닙니다. 다만{" "}
                  <strong className="font-semibold text-ink">활동은 목적지가 결정된 뒤에 선택할 때 더
                  강해집니다.</strong>
                </p>
              </div>
            )}
          </div>

          <PullQuote>목표 → 평가 → 수업</PullQuote>

          <PresenterTip>
            <p>전체가 맞힐 때까지 기다리지 마세요. 두세 분이 성공하면 정답을 함께 확인합니다.</p>
            <p>
              후속 질문에서 "학습 활동"이 아닌 곳을 고른 분이 있으면 반드시 이유를 물어보세요. 목표를 담은
              활동이라면 그 판단도 맞습니다.
            </p>
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
