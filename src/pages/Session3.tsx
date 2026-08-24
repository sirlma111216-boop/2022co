import { Block, PullQuote } from "@/components/teach/Block";
import {
  ExampleList,
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
import { RubricBuilder } from "@/components/activity/RubricBuilder";
import { ShareBar } from "@/components/wall/Wall";
import { Bars } from "@/components/poll/Poll";
import {
  BAD_ELEMENTS,
  BAD_TASK,
  FEEDBACK_GUIDE,
  GRASPS_EXAMPLE,
  RUBRIC_EXAMPLE,
} from "@/content/examples";
import { useSession } from "@/lib/session-context";
import { cn, isFilled } from "@/lib/utils";
import type { DesignField } from "@/lib/types";

const SECTIONS = [
  { id: "s3-intro", label: "되돌아보기" },
  { id: "s3-backward", label: "백워드 설계" },
  { id: "s3-badtask", label: "이 과제로 충분할까" },
  { id: "s3-grasps", label: "GRASPS" },
  { id: "a4", label: "ACTIVITY 4" },
  { id: "s3-rubric", label: "루브릭·평가요소" },
  { id: "a5", label: "ACTIVITY 5" },
  { id: "a6", label: "ACTIVITY 6" },
  { id: "s3-feedback", label: "과정 중심 피드백" },
];

const GRASPS_FIELDS: { field: DesignField; letter: string; label: string; help: string; example: string }[] = [
  {
    field: "graspsG",
    letter: "G",
    label: "Goal · 무엇을 해결해야 하는가?",
    help: "학생이 해결해야 할 문제나 도전을 한 문장으로.",
    example: "어린이보호구역 제한속도를 낮출지 판단해 근거와 함께 제안한다.",
  },
  {
    field: "graspsR",
    letter: "R",
    label: "Role · 학생은 어떤 역할인가?",
    help: "학생이 맡는 입장. 현실에 있을 법한 역할이면 충분합니다.",
    example: "학교 안전 자문단의 학생 위원",
  },
  {
    field: "graspsA",
    letter: "A",
    label: "Audience · 누구에게 보여 주는가?",
    help: "결과물을 받는 사람. 교사 말고 다른 대상을 정해 보세요.",
    example: "학교 안전 협의회(교사·학부모·지역 담당자)",
  },
  {
    field: "graspsS",
    letter: "S",
    label: "Situation · 어떤 상황인가?",
    help: "주어지는 자료와 조건, 갈등 요소.",
    example: "통학로 사진과 속도별 정지거리 자료가 주어지고, 통행 불편과 안전이라는 상반된 의견이 있다.",
  },
  {
    field: "graspsP",
    letter: "P",
    label: "Product · 무엇을 만들거나 수행하는가?",
    help: "산출물의 형태와 분량. 구체적일수록 좋습니다.",
    example: "A4 한 장 제안서 + 3분 구두 설명 (근거 자료와 해석 포함)",
  },
  {
    field: "graspsS2",
    letter: "S",
    label: "Standards · 무엇을 기준으로 판단하는가?",
    help: "평가요소의 예고편. 아래 ACTIVITY 5와 이어집니다.",
    example: "① 과학 개념의 정확성 ② 자료 해석의 타당성 ③ 주장과 근거의 연결",
  },
];

export default function Session3() {
  const { design, session, votedTask, castTaskPoll, mode } = useSession();

  const a4done = isFilled(design.graspsG, 8) && isFilled(design.graspsP, 5);
  const a5done = design.assessmentElements.some((e) => isFilled(e.name, 2) && isFilled(e.high, 3));
  const a6done = isFilled(design.learningActivities, 15);

  const taskResults = session?.taskPollResults ?? { yes: 0, notEnough: 0 };

  return (
    <>
      <SessionHero
        kicker="3교시 · 50분"
        title="어떻게 확인할 것인가"
        lead="이해했다는 것은 머릿속 상태라 직접 볼 수 없습니다. 그래서 우리는 대신 볼 것을 정합니다. 그것이 평가 설계입니다."
        minutes={50}
        goals={[
          "백워드 설계 3단계로 목표 → 평가 → 수업의 순서를 세운다.",
          "GRASPS로 이해가 드러나는 수행과제를 만든다.",
          "평가요소 2~3개와 수행수준을 정하고 피드백까지 설계한다.",
        ]}
      />

      <SessionLayout sections={SECTIONS}>
        {/* ── 되돌아보기 ─────────────────────────────────────── */}
        <section id="s3-intro" className="scroll-mt-32">
          <SectionHeading
            eyebrow="되돌아보기"
            title="지금까지 만든 것"
            lead="이제 이 세 가지를 실제로 확인할 방법을 만듭니다."
          />
          <CarryOver
            title="내 설계안 · 여기까지"
            fields={[
              { field: "achievementStandard", label: "성취기준" },
              { field: "enduringUnderstanding", label: "남길 한 문장" },
              { field: "inquiryDebate", label: "확장·논쟁 질문" },
            ]}
          />
        </section>

        {/* ── SECTION 6 ──────────────────────────────────────── */}
        <section id="s3-backward" className="mt-16 scroll-mt-32">
          <SectionHeading
            eyebrow="SECTION 6"
            title="백워드 설계, 세 단계면 충분합니다"
            lead="어려운 이론이 아닙니다. 순서를 바꾸는 것뿐입니다."
          />

          <ol className="my-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                n: "STEP 1",
                t: "학생에게 무엇이 남아야 하는가?",
                d: "성취기준과 핵심 아이디어에서 출발해 이 단원에서 남길 이해를 정합니다.",
                done: "2교시에 이미 하셨습니다.",
              },
              {
                n: "STEP 2",
                t: "무엇을 보면 이해했다고 판단할 수 있는가?",
                d: "그 이해가 겉으로 드러나는 증거를 정합니다. 수행과제와 평가요소가 여기서 나옵니다.",
                done: "오늘 이 시간에 합니다.",
              },
              {
                n: "STEP 3",
                t: "그렇다면 어떤 학습 경험이 필요한가?",
                d: "그 증거가 나타날 수 있도록 수업을 세웁니다. 활동은 마지막에 정해집니다.",
                done: "오늘 후반부에 합니다.",
              },
            ].map((s) => (
              <li key={s.n} className="rounded-lg border border-hairline bg-canvas px-5 py-5">
                <p className="text-fine font-semibold uppercase tracking-[0.1em] text-action">{s.n}</p>
                <p className="mt-2 text-body font-semibold leading-[1.45] text-ink">{s.t}</p>
                <p className="mt-2.5 text-caption leading-[1.65] text-ink-80">{s.d}</p>
                <p className="mt-3 border-t border-hairline pt-2.5 text-fine text-ink-48">{s.done}</p>
              </li>
            ))}
          </ol>

          <PullQuote tone="dark">목표 → 평가 → 수업</PullQuote>

          <Misconception
            wrong="백워드 설계 = 시험 문제부터 만드는 것"
            right="평가를 먼저 생각하는 것은 맞지만, 그것은 문항을 뽑는 일이 아니라 학생의 이해가 드러나는 증거를 설계하는 일입니다."
          >
            <p>
              문항부터 만들면 결국 '외운 것을 확인하기 쉬운 문항'으로 흘러갑니다. 그래서 우리는 문항이 아니라{" "}
              <TermChip id="evidence" label="평가 증거" />부터 정합니다. "학생이 무엇을 하고 있으면 이해했다고
              말할 수 있을까?"에 답하는 것입니다.
            </p>
          </Misconception>

          <TermCard id="backward" />
          <TermCard id="evidence" />
        </section>

        {/* ── SECTION 7 ──────────────────────────────────────── */}
        <section id="s3-badtask" className="mt-16 scroll-mt-32">
          <SectionHeading
            eyebrow="SECTION 7"
            title="이 수행과제로 충분할까요?"
            lead="실제로 많이 쓰이는 과제 하나를 함께 봅니다."
          />

          <div className="my-7 rounded-lg border border-hairline bg-canvas-parchment px-6 py-7">
            <p className="text-fine font-semibold uppercase tracking-[0.08em] text-ink-48">수행과제</p>
            <p className="mt-2 text-lead text-ink">"{BAD_TASK.title}"</p>
          </div>

          <Block kind="read">
            <p>
              이 과제만으로 <strong className="text-ink">"힘과 운동 변화 사이의 관계를 이해했는지"</strong>{" "}
              판단할 수 있을까요?
            </p>
          </Block>

          <div className="my-6 grid gap-3 sm:grid-cols-2">
            {(
              [
                ["yes", "YES", "판단할 수 있다"],
                ["notEnough", "NOT ENOUGH", "이것만으로는 부족하다"],
              ] as const
            ).map(([key, big, sub]) => (
              <button
                key={key}
                type="button"
                disabled={!!votedTask}
                onClick={() => void castTaskPoll(key)}
                className={cn(
                  "rounded-lg border px-6 py-6 text-left transition-transform active:scale-[0.98]",
                  votedTask === key
                    ? "border-action bg-action/[0.06]"
                    : "border-hairline bg-canvas hover:border-ink-48/40",
                  votedTask && votedTask !== key && "opacity-55",
                )}
              >
                <span className="block text-tagline text-ink">{big}</span>
                <span className="mt-1 block text-caption text-ink-48">{sub}</span>
              </button>
            ))}
          </div>

          {votedTask && (
            <div className="appear my-7 rounded-lg border border-hairline bg-canvas-parchment px-5 py-6 sm:px-7">
              <p className="mb-5 text-caption font-semibold text-ink-48">
                지금까지의 응답 {mode === "local" && "· 로컬 모드에서는 내 응답만 집계됩니다"}
              </p>
              <Bars
                data={[
                  { key: "yes", label: "YES · 판단할 수 있다", value: taskResults.yes, highlight: votedTask === "yes" },
                  {
                    key: "notEnough",
                    label: "NOT ENOUGH · 부족하다",
                    value: taskResults.notEnough,
                    highlight: votedTask === "notEnough",
                  },
                ]}
              />
            </div>
          )}

          {votedTask && (
            <>
              <Block kind="teacher" title="왜 부족할까요">
                <ul className="space-y-2">
                  {BAD_TASK.why.map((w, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="mt-[10px] h-1 w-1 shrink-0 rounded-pill bg-ink-48" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
                <p className="pt-2 font-semibold text-ink">{BAD_TASK.fix}</p>
              </Block>

              <Block kind="science" title="이렇게 바꿔 봅니다">
                <p className="text-ink-48 line-through">"힘의 종류를 조사하여 PPT로 발표하시오."</p>
                <p className="mt-2 text-ink">
                  "학교 앞 어린이보호구역의 제한속도를 30km/h로 유지할지 20km/h로 낮출지, 속도별 정지거리
                  자료를 근거로 판정하고 A4 한 장 제안서를 쓰시오."
                </p>
                <p className="mt-3">
                  바뀐 과제는 힘과 운동의 관계를 <strong>쓰지 않으면 완성되지 않습니다</strong>. 정지거리가 왜
                  속도에 따라 그렇게 달라지는지 설명해야 하니까요. 바로 그 지점이 평가 증거입니다.
                </p>
              </Block>

              <TermCard id="performance" />
            </>
          )}

          <PresenterTip>
            <p>소수 쪽을 먼저 들어보세요. "YES로 보신 분, 어떤 점에서 그렇게 보셨어요?"</p>
            <p>정답을 알려 주기보다 "그럼 이 과제로 A와 B 학생을 어떻게 구분하시겠어요?"로 되물으면 좋습니다.</p>
          </PresenterTip>
        </section>

        {/* ── GRASPS ─────────────────────────────────────────── */}
        <section id="s3-grasps" className="mt-16 scroll-mt-32">
          <SectionHeading
            eyebrow="도구"
            title="GRASPS — 여섯 칸으로 맥락 만들기"
            lead="수행과제를 쓸 때 빠지기 쉬운 여섯 가지를 순서대로 묻습니다."
          />

          <div className="my-7 overflow-hidden rounded-lg border border-hairline">
            <div className="bg-canvas-parchment px-5 py-3">
              <p className="text-caption font-semibold text-ink-48">{GRASPS_EXAMPLE.title}</p>
            </div>
            <ul className="divide-y divide-hairline">
              {GRASPS_EXAMPLE.rows.map((r, i) => (
                <li key={i} className="grid gap-2 bg-canvas px-5 py-4 sm:grid-cols-[190px_1fr] sm:gap-6">
                  <div>
                    <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-pill bg-action text-caption font-semibold text-white">
                      {r.letter}
                    </span>
                    <span className="text-caption font-semibold text-ink">{r.name}</span>
                    <p className="mt-1 text-fine text-ink-48">{r.q}</p>
                  </div>
                  <p className="text-body-sm leading-[1.68] text-ink-80">{r.value}</p>
                </li>
              ))}
            </ul>
          </div>

          <Misconception
            wrong="역할과 상황이 화려할수록 좋은 수행평가다."
            right="맥락은 이해가 드러나게 하는 장치일 뿐입니다. 핵심은 '성취기준과 남길 이해가 실제로 드러나는가'입니다."
          >
            <p>
              우주 정거장 사령관이 되어 외계 생명체에게 설명하는 과제도, 결국 교과서 내용을 요약해 옮기는
              것으로 끝난다면 좋은 과제가 아닙니다. 반대로 평범한 학교 복도 조명 문제라도 배운 개념을 써야만
              답이 나온다면 좋은 과제입니다.
            </p>
          </Misconception>

          <TermCard id="grasps" />
        </section>

        {/* ── ACTIVITY 4 ─────────────────────────────────────── */}
        <ActivityCard
          id="a4"
          no="ACTIVITY 4"
          title="나의 수행과제 만들기"
          minutes={12}
          done={a4done}
          prompt={
            <>
              위 여섯 칸을 선생님의 단원으로 채워 봅니다. 다 채우지 못해도 괜찮습니다. 특히{" "}
              <strong>G(목표)</strong>와 <strong>P(산출물)</strong> 두 칸만 분명해도 과제의 뼈대가 섭니다.
            </>
          }
          footer={
            <div className="w-full space-y-4">
              <ShareBar
                activityId="a4"
                canShare={isFilled(design.graspsG, 5)}
                content={() => ({
                  "G 목표": design.graspsG,
                  "R 역할": design.graspsR,
                  "A 대상": design.graspsA,
                  "S 상황": design.graspsS,
                  "P 산출물": design.graspsP,
                  "S 기준": design.graspsS2,
                })}
              />
              <AiCoach task="task" note="성취기준·남길 이해와 과제가 정렬되는지를 중심으로 봅니다." />
            </div>
          }
        >
          <CarryOver
            title="이 과제가 드러내야 할 것"
            fields={[
              { field: "achievementStandard", label: "성취기준" },
              { field: "enduringUnderstanding", label: "남길 한 문장" },
              { field: "inquiryDebate", label: "확장·논쟁 질문" },
            ]}
            className="my-0"
            hint="아래 여섯 칸을 채운 뒤, 이 세 가지가 과제 안에서 실제로 드러나는지 한 번 확인해 보세요."
          />

          <div className="grid gap-5">
            {GRASPS_FIELDS.map((g) => (
              <div key={g.field} className="grid gap-3 sm:grid-cols-[44px_1fr] sm:gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-canvas-parchment text-tagline text-ink-80">
                  {g.letter}
                </span>
                <AutoField
                  field={g.field}
                  label={g.label}
                  help={g.help}
                  example={g.example}
                  rows={2}
                />
              </div>
            ))}
          </div>
        </ActivityCard>

        {/* ── SECTION 8 ──────────────────────────────────────── */}
        <section id="s3-rubric" className="mt-16 scroll-mt-32">
          <SectionHeading
            eyebrow="SECTION 8"
            title="루브릭과 평가요소"
            lead="루브릭은 채점표가 아니라, 학생에게 먼저 주는 지도입니다."
          />

          <PullQuote>
            잘했는지 못했는지 점수만 주는 표가 아니라, 무엇을 잘해야 하는지 미리 보여 주는 지도.
          </PullQuote>

          <Block kind="teacher">
            <p>
              루브릭을 만들 때 가장 중요한 결정은 "무엇을 볼 것인가", 곧{" "}
              <TermChip id="element" label="평가요소" />를 고르는 일입니다. 요소를 잘못 고르면 아무리 정교한
              표를 만들어도 성취기준과 상관없는 것을 재게 됩니다.
            </p>
          </Block>

          <div className="my-7 overflow-hidden rounded-lg border border-hairline">
            <p className="bg-canvas-parchment px-5 py-3 text-caption font-semibold text-ink-48">
              자주 들어가지만 다시 생각해 볼 평가요소
            </p>
            <ul className="divide-y divide-hairline">
              {BAD_ELEMENTS.map((b) => (
                <li key={b.name} className="grid gap-1 bg-canvas px-5 py-4 sm:grid-cols-[160px_1fr] sm:gap-5">
                  <span className="text-body-sm font-semibold text-ink-48 line-through">{b.name}</span>
                  <span className="text-caption leading-[1.65] text-ink-80">{b.why}</span>
                </li>
              ))}
            </ul>
          </div>

          <Block kind="science" title="과학 수행평가에서 쓸 만한 평가요소">
            <p>
              과학 개념의 정확성 · 증거의 적절성 · 자료 해석 · 과학적 설명 · 모형의 타당성 · 주장과 근거의 연결.
            </p>
            <p>
              다만 <strong>모든 평가에서 전부 사용할 필요는 없습니다.</strong> 이번 과제에서 정말 보고 싶은
              것 2~4개만 고르세요. A4 한 장 설계안에서는 3개를 넘기지 않기를 권합니다.
            </p>
          </Block>

          <div className="my-7 overflow-hidden rounded-lg border border-hairline">
            <div className="bg-canvas-parchment px-5 py-3">
              <p className="text-caption font-semibold text-ink-48">
                수행수준 서술 예시 · {RUBRIC_EXAMPLE.element}
              </p>
            </div>
            <ul className="divide-y divide-hairline">
              {RUBRIC_EXAMPLE.levels.map((l) => (
                <li key={l.level} className="grid gap-2 bg-canvas px-5 py-4 sm:grid-cols-[60px_1fr] sm:gap-5">
                  <span className="text-tagline text-action">{l.level}</span>
                  <span className="text-body-sm leading-[1.68] text-ink-80">{l.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <Note tone="action">
            수준을 적을 때 "잘함 / 보통 / 미흡" 같은 말만 쓰지 마세요. 그것은 판정이지 설명이 아닙니다.{" "}
            <strong>무엇이 보이면 그 수준인지</strong>를 적어야 학생이 읽고 방향을 잡을 수 있습니다.
          </Note>

          <TermCard id="rubric" />
        </section>

        {/* ── ACTIVITY 5 ─────────────────────────────────────── */}
        <ActivityCard
          id="a5"
          no="ACTIVITY 5"
          title="평가요소 3개만 고르기"
          minutes={6}
          done={a5done}
          prompt={
            <>
              선생님의 수행과제를 평가할 핵심 평가요소를 <strong>최대 3개</strong>만 고르거나 직접 적어
              주세요. 그리고 각 요소마다 상 · 중 · 하가 어떻게 다른지 짧게 적습니다.
            </>
          }
          footer={
            <div className="w-full space-y-4">
              <ShareBar
                activityId="a5"
                canShare={a5done}
                content={() =>
                  Object.fromEntries(
                    design.assessmentElements
                      .filter((e) => e.name.trim())
                      .map((e) => [e.name, `상: ${e.high}\n중: ${e.mid}\n하: ${e.low}`]),
                  )
                }
              />
            </div>
          }
        >
          <CarryOver
            title="참고 · 내 수행과제"
            fields={[
              { field: "graspsG", label: "G 목표" },
              { field: "graspsP", label: "P 산출물" },
            ]}
            className="my-0"
          />
          <RubricBuilder />
        </ActivityCard>

        {/* ── ACTIVITY 6 ─────────────────────────────────────── */}
        <ActivityCard
          id="a6"
          no="ACTIVITY 6"
          title="어떤 학습 경험이 필요한가"
          minutes={5}
          done={a6done}
          prompt={
            <>
              마지막 단계입니다. 위에서 정한 <strong>증거가 실제로 나타나려면</strong> 학생이 무엇을
              경험해야 할까요? 재미있는 활동을 나열하는 것이 아니라, 증거에서 거꾸로 세우는 것입니다.
            </>
          }
          footer={
            <ShareBar
              activityId="a6"
              canShare={isFilled(design.learningActivities, 10)}
              content={() => ({
                "핵심 학습 활동": design.learningActivities,
                "수행과제 목표": design.graspsG,
              })}
            />
          }
        >
          <Block kind="teacher" className="my-0">
            <p>
              스스로에게 이렇게 물어보세요. "학생이 이 과제를 해내려면, 그전에 무엇을 한 번은 해 봤어야
              할까?" 그 답이 곧 수업 활동입니다.
            </p>
          </Block>

          <ExampleList
            tone="good"
            items={[
              { label: "1차시", text: "속도-시간 그래프에서 알짜힘이 0인 구간 찾아 근거 말하기 (짝 활동)" },
              { label: "2차시", text: "정지거리 자료를 표에서 그래프로 바꾸고 경향 읽기" },
              { label: "3차시", text: "처음 보는 상황(엘리베이터·버스 급정거)에 힘 다이어그램 그려 설명하기" },
              { label: "4차시", text: "제안서 초안 쓰고 루브릭으로 서로 점검하기 → 수정본 제출" },
            ]}
          />

          <AutoField
            field="learningActivities"
            label="핵심 학습 활동 (3~5개)"
            rows={5}
            placeholder={"1차시 …\n2차시 …\n3차시 …"}
            help="차시별로 한 줄씩 적어 주세요. A4 설계안에 그대로 들어갑니다."
          />
        </ActivityCard>

        {/* ── SECTION 9 ──────────────────────────────────────── */}
        <section id="s3-feedback" className="mt-16 scroll-mt-32">
          <SectionHeading
            eyebrow="SECTION 9"
            title="과정 중심 피드백"
            lead="평가는 마지막에 점수를 매기는 일만이 아닙니다. 가는 도중에 방향을 알려 주는 일이기도 합니다."
          />

          <Block kind="read">
            <p>피드백은 세 가지 질문에 답하는 것으로 충분합니다.</p>
          </Block>

          <div className="my-7 grid gap-4 sm:grid-cols-3">
            {FEEDBACK_GUIDE.map((f) => (
              <div key={f.key} className="rounded-lg border border-hairline bg-canvas px-5 py-5">
                <p className="text-fine font-semibold uppercase tracking-[0.08em] text-action">{f.name}</p>
                <p className="mt-2 text-body font-semibold leading-[1.45] text-ink">{f.q}</p>
                <p className="mt-2.5 text-caption leading-[1.65] text-ink-80">{f.desc}</p>
                <p className="mt-3 border-t border-hairline pt-3 text-caption leading-[1.6] text-ink-48">
                  "{f.example}"
                </p>
              </div>
            ))}
          </div>

          <div className="my-8 grid gap-5">
            <AutoField
              field="feedUp"
              label="Feed Up · 나는 어디로 가고 있는가?"
              rows={2}
              placeholder="학생에게 목표와 기준을 알려 주는 한 문장"
              help="과제를 나눠 줄 때 학생에게 실제로 할 말을 그대로 적어 보세요."
              example="이번 과제에서 볼 것은 세 가지예요. 개념이 정확한지, 자료를 제대로 읽었는지, 주장과 근거가 연결되는지."
            />
            <AutoField
              field="feedBack"
              label="Feed Back · 현재 어디까지 왔는가?"
              rows={2}
              placeholder="현재 위치를 알려 주는 한 문장"
              help="잘잘못이 아니라 기준에 비추어 지금 어디쯤인지를 말합니다."
              example="자료는 잘 찾았어요. 다만 그 표의 어느 숫자를 근거로 삼았는지가 아직 글에 없어요."
            />
            <AutoField
              field="feedForward"
              label="Feed Forward · 다음에는 무엇을 해야 하는가?"
              rows={2}
              placeholder="바로 실행할 수 있는 다음 한 걸음"
              help="고칠 곳을 하나만 짚어 주는 편이 실제로 더 잘 고쳐집니다."
              example="다음 수정본에서는 '표의 40km/h 줄을 보면'처럼 근거를 한 문장으로 콕 집어 넣어 보세요."
            />
          </div>

          <AiCoach
            task="align"
            note="지금까지 쓰신 설계안 전체가 한 방향을 보고 있는지 점검합니다."
          />

          <TermCard id="alignment" />

          <PresenterTip>
            <p>세 문장을 다 쓴 분께 하나만 소리 내어 읽어 달라고 부탁해 보세요.</p>
            <p>"이 말을 학생에게 실제로 할 수 있겠어요?"라고 물으면 문장이 훨씬 구체적으로 바뀝니다.</p>
          </PresenterTip>
        </section>

        <PageNav
          prev={{ to: "/s2", label: "2교시로 돌아가기" }}
          next={{ to: "/final", label: "FINAL · 나의 단원 설계 한 장" }}
        />
      </SessionLayout>
    </>
  );
}
