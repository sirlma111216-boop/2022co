import { Block, PullQuote } from "@/components/teach/Block";
import { Misconception, Note, PresenterTip, SectionHeading } from "@/components/teach/elements";
import { TermCard, TermChip } from "@/components/teach/TermCard";
import { PageNav, SessionHero, SessionLayout } from "@/components/layout/PageParts";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { AutoField } from "@/components/activity/AutoField";
import { AiCoach } from "@/components/activity/AiCoach";
import { CarryOver } from "@/components/activity/CarryOver";
import { RubricBuilder } from "@/components/activity/RubricBuilder";
import { LearningExperiences } from "@/components/activity/LearningExperiences";
import { RedTeam, BeforeAfter } from "@/components/activity/RedTeam";
import { DiscussionTimer } from "@/components/activity/DiscussionTimer";
import { Disclosure } from "@/components/ui/disclosure";
import { Label, Textarea } from "@/components/ui/input";
import { ShareBar } from "@/components/wall/Wall";
import { Bars } from "@/components/poll/Poll";
import {
  AMBIGUOUS_TASK,
  BAD_ELEMENTS,
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
  { id: "r1", label: "RED TEAM" },
  { id: "s3-rubric", label: "루브릭·평가요소" },
  { id: "a5", label: "ACTIVITY 5" },
  { id: "a6", label: "ACTIVITY 6" },
  { id: "s3-feedback", label: "과정 중심 피드백" },
];

const CONTEXT_FIELDS: { field: DesignField; letter: string; label: string; help: string; hint1?: string; example: string }[] = [
  {
    field: "graspsR",
    letter: "R",
    label: "Role · 학생은 어떤 역할인가?",
    help: "현실에 있을 법한 역할이면 충분합니다.",
    example: "학교 안전 자문단의 학생 위원",
  },
  {
    field: "graspsA",
    letter: "A",
    label: "Audience · 누구에게 보여 주는가?",
    help: "교사 말고 다른 대상을 정해 보세요.",
    example: "학교 안전 협의회(교사·학부모·지역 담당자)",
  },
  {
    field: "graspsS",
    letter: "S",
    label: "Situation · 어떤 상황인가?",
    help: "주어지는 자료와 조건, 갈등 요소.",
    hint1: "여기에 '자료'를 넣으면 과제가 단단해집니다. 학생이 해석할 표나 그래프를 하나 정해 보세요.",
    example: "통학로 사진과 속도별 정지거리 자료가 주어지고, 통행 불편과 안전이라는 상반된 의견이 있다.",
  },
  {
    field: "graspsS2",
    letter: "S",
    label: "Standards · 무엇을 기준으로 판단하는가?",
    help: "평가요소의 예고편. ACTIVITY 5와 이어집니다.",
    example: "① 과학 개념의 정확성 ② 자료 해석의 타당성 ③ 주장과 근거의 연결",
  },
];

export default function Session3() {
  const { design, update, session, votedTask, castTaskPoll, mode } = useSession();

  const a4done = isFilled(design.graspsG) && isFilled(design.graspsP);
  const r1done = (design.redTeamFindings?.length ?? 0) > 0 || isFilled(design.performanceTaskAfter);
  const a5done = design.assessmentElements.some((e) => isFilled(e.name, 2));
  const a6done = (design.learningExperiences ?? []).some((e) => isFilled(e.what));

  const taskResults = session?.taskPollResults ?? { yes: 0, notEnough: 0 };
  const keyElement = design.assessmentElements[design.keyAssessmentIndex ?? 0];

  return (
    <>
      <SessionHero
        kicker="3교시 · 50분"
        title="어떻게 확인할 것인가"
        lead="이해했다는 것은 머릿속 상태라 직접 볼 수 없습니다. 그래서 우리는 대신 볼 것을 정합니다. 그것이 평가 설계입니다."
        minutes={50}
        goals={[
          "백워드 설계 3단계로 목표 → 평가 → 수업의 순서를 세운다.",
          "GRASPS로 수행과제를 만들고, 그 과제를 직접 공격해 구멍을 찾는다.",
          "핵심 평가요소 하나를 정하고, 학습 경험을 평가 증거와 연결한다.",
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
              { field: "standardCoreAction", label: "핵심 행동" },
              { field: "enduringUnderstanding", label: "남길 한 문장" },
              { field: "keyInquiry", label: "핵심 탐구질문" },
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

        {/* ── SECTION 7 · 판단이 갈리는 사례 ─────────────────── */}
        <section id="s3-badtask" className="mt-16 scroll-mt-32">
          <SectionHeading
            eyebrow="SECTION 7"
            title="이 수행과제로 충분할까요?"
            lead="쉽게 답이 나오지 않는 사례를 하나 가져왔습니다."
          />

          <div className="my-7 rounded-lg border border-hairline bg-canvas-parchment px-6 py-7">
            <p className="text-fine font-semibold uppercase tracking-[0.08em] text-ink-48">수행과제</p>
            <p className="mt-2 text-lead text-ink">"{AMBIGUOUS_TASK.title}"</p>
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
            <div className="appear space-y-6">
              <div className="space-y-2">
                <Label htmlFor="taskJudgeReason">왜 그렇게 판단하셨나요?</Label>
                <Textarea
                  id="taskJudgeReason"
                  rows={2}
                  value={design.taskJudgeReason}
                  placeholder="한 줄이면 충분합니다."
                  onChange={(e) => update({ taskJudgeReason: e.target.value })}
                />
              </div>

              <div className="rounded-lg border border-hairline bg-canvas-parchment px-5 py-5 sm:px-6">
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

              <DiscussionTimer seconds={60} label="다르게 판단한 분과 이야기하기" />

              <Block kind="teacher" title="양쪽 다 근거가 있습니다">
                <ul className="space-y-2">
                  {AMBIGUOUS_TASK.why.map((w, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="mt-[10px] h-1 w-1 shrink-0 rounded-pill bg-ink-48" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
                <p className="pt-2 font-semibold text-ink">{AMBIGUOUS_TASK.verdict}</p>
                <p>{AMBIGUOUS_TASK.fix}</p>
              </Block>

              <TermCard id="performance" />
            </div>
          )}

          <PresenterTip>
            <p>이번 사례는 YES가 꽤 나옵니다. 그게 정상입니다 — 일부러 애매하게 만든 과제입니다.</p>
            <p>
              "YES로 보신 분, 그럼 이 과제로 A학생과 B학생을 어떻게 구분하시겠어요?"라고 물으면 판단의 근거가
              드러납니다. 정답을 알려 주는 대신 이 질문을 던지세요.
            </p>
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

        {/* ── ACTIVITY 4 · G와 P 먼저 ────────────────────────── */}
        <ActivityCard
          id="a4"
          no="ACTIVITY 4"
          title="나의 수행과제 만들기"
          minutes={12}
          done={a4done}
          prompt={
            <>
              여섯 칸을 한 번에 채우지 않습니다. 먼저{" "}
              <strong>G(무엇을 해결하는가)</strong>와 <strong>P(무엇을 보여줘야 하는가)</strong> 두 칸만
              제대로 씁니다. 이 둘이 분명하면 나머지는 따라옵니다.
            </>
          }
          footer={
            <div className="w-full space-y-4">
              <ShareBar
                activityId="a4"
                canShare={isFilled(design.graspsG)}
                content={() => ({
                  단원: design.unitName,
                  "영속적 이해": design.enduringUnderstanding,
                  "G 목표": design.graspsG,
                  "P 산출물": design.graspsP,
                  "S 상황": design.graspsS,
                })}
              />
              <AiCoach task="task" note="성취기준·남길 이해와 과제가 정렬되는지를 중심으로 봅니다." />
            </div>
          }
        >
          <CarryOver
            title="이 과제가 드러내야 할 것"
            fields={[
              { field: "enduringUnderstanding", label: "남길 한 문장" },
              { field: "standardCoreAction", label: "학생이 보여야 할 행동" },
              { field: "keyInquiry", label: "핵심 탐구질문" },
            ]}
            className="my-0"
            hint="아래 두 칸을 채운 뒤, 이 세 가지가 과제 안에서 실제로 드러나는지 확인해 보세요."
          />

          {/* STEP 1 · G */}
          <div className="rounded-lg border border-action/35 bg-canvas px-5 py-5">
            <p className="mb-3 text-fine font-semibold uppercase tracking-[0.1em] text-action">STEP 1</p>
            <div className="grid gap-3 sm:grid-cols-[44px_1fr] sm:gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-action text-tagline text-white">
                G
              </span>
              <AutoField
                field="graspsG"
                label="무엇을 해결해야 하는가?"
                rows={3}
                help="학생이 해결해야 할 문제나 도전을 한 문장으로."
                hint1="'조사한다'로 끝나면 아직 과제가 아닙니다. '판단한다 / 제안한다 / 결정한다'로 끝나게 바꿔 보세요."
                hint2="내가 정한 핵심 행동(설명한다·표현한다 등)이 이 문장 안에 들어 있는지 확인해 보세요."
                example="어린이보호구역 제한속도를 낮출지 정지거리 자료를 근거로 판단해 제안한다."
              />
            </div>
          </div>

          {/* STEP 2 · P */}
          <div className="rounded-lg border border-action/35 bg-canvas px-5 py-5">
            <p className="mb-3 text-fine font-semibold uppercase tracking-[0.1em] text-action">STEP 2</p>
            <div className="grid gap-3 sm:grid-cols-[44px_1fr] sm:gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-action text-tagline text-white">
                P
              </span>
              <AutoField
                field="graspsP"
                label="학생이 무엇을 실제로 보여줘야 하는가?"
                rows={3}
                help="산출물의 형태와 분량. 구체적일수록 좋습니다."
                hint1="'발표'만으로는 부족합니다. 그 안에 무엇이 반드시 들어가야 하는지까지 적어 보세요."
                example="A4 한 장 제안서 + 3분 구두 설명 (근거로 삼은 자료의 특정 부분을 반드시 지목할 것)"
              />
            </div>
          </div>

          <Note tone="action">
            G와 P가 분명해졌다면 나머지 맥락을 붙여 봅니다. 시간이 부족하면 <strong>S(상황)</strong> 하나만
            더 채워도 과제는 섭니다.
          </Note>

          <Disclosure title="나머지 맥락 붙이기 · R / A / S / Standards" tone="parchment">
            <div className="grid gap-5 pt-1">
              {CONTEXT_FIELDS.map((g) => (
                <div key={g.field} className="grid gap-3 sm:grid-cols-[44px_1fr] sm:gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-canvas-parchment text-tagline text-ink-80">
                    {g.letter}
                  </span>
                  <AutoField
                    field={g.field}
                    label={g.label}
                    help={g.help}
                    hint1={g.hint1}
                    example={g.example}
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </Disclosure>
        </ActivityCard>

        {/* ── RED TEAM ───────────────────────────────────────── */}
        <ActivityCard
          id="r1"
          no="RED TEAM"
          title="개념 없이 풀어보기"
          minutes={8}
          done={r1done}
          prompt={
            <>
              좋은 수행과제인지 확인하는 가장 빠른 방법은 <strong>반대로 공격해 보는 것</strong>입니다.
              지금부터는 내 과제를 만든 사람이 아니라, 그 과제를 뚫으려는 학생의 입장에서 봅니다.
            </>
          }
        >
          <RedTeam />
          <BeforeAfter />

          <PresenterTip>
            <p>여기서 시간을 넉넉히 주세요. 오늘 연수에서 가장 많이 배우는 지점입니다.</p>
            <p>
              "구멍이 하나도 없다"고 하신 분께는 "그럼 가장 게으른 학생은 이 과제를 어떻게 통과할까요?"를
              물어보세요. 대개 그때 하나가 나옵니다.
            </p>
          </PresenterTip>
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
              것 2~3개만 고르세요.
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
          title="평가요소 3개, 그중 하나만 깊게"
          minutes={6}
          done={a5done}
          prompt={
            <>
              평가요소는 최대 3개까지 고르되, <strong>가장 중요한 하나</strong>에만 상·중·하를 자세히 씁니다.
              나머지는 이름만 남겨도 설계안은 완성됩니다.
            </>
          }
          footer={
            <ShareBar
              activityId="a5"
              canShare={a5done}
              content={() =>
                Object.fromEntries(
                  design.assessmentElements
                    .filter((e) => e.name.trim())
                    .map((e, i) => [
                      `${i === (design.keyAssessmentIndex ?? 0) ? "★ " : ""}${e.name}`,
                      e.high ? `상: ${e.high}\n중: ${e.mid}\n하: ${e.low}` : "(이름만 정함)",
                    ]),
                )
              }
            />
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
              마지막 단계입니다. 활동을 나열하는 것이 아니라,{" "}
              <strong>각 활동이 어떤 평가 증거를 준비시키는지</strong>까지 함께 적습니다.
            </>
          }
          footer={
            <ShareBar
              activityId="a6"
              canShare={a6done}
              content={() =>
                Object.fromEntries(
                  (design.learningExperiences ?? [])
                    .filter((e) => e.what.trim())
                    .map((e, i) => [`경험 ${i + 1}`, `${e.what}\n→ ${e.evidence || "(증거 미연결)"}`]),
                )
              }
            />
          }
        >
          {/* 마지막에 보여줘야 할 것 + 가장 중요하게 볼 것 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-hairline bg-canvas-parchment px-5 py-4">
              <p className="text-fine font-semibold uppercase tracking-[0.06em] text-ink-48">
                학생이 마지막에 보여줘야 할 것
              </p>
              <p className="mt-2 text-body-sm leading-[1.65] text-ink">
                {design.performanceTaskAfter?.trim() || design.graspsP?.trim() || "아직 정하지 않았습니다."}
              </p>
            </div>
            <div className="rounded-lg border border-action/40 bg-canvas px-5 py-4">
              <p className="text-fine font-semibold uppercase tracking-[0.06em] text-action">
                가장 중요하게 볼 것
              </p>
              <p className="mt-2 text-body-sm leading-[1.65] text-ink">
                {keyElement?.name?.trim() || "아직 정하지 않았습니다."}
              </p>
            </div>
          </div>

          <Block kind="teacher" className="my-0">
            <p>
              스스로에게 이렇게 물어보세요. "학생이 이 과제를 해내려면, 그전에 무엇을 한 번은 해 봤어야
              할까?" 그 답이 곧 수업 활동입니다.
            </p>
          </Block>

          <LearningExperiences />

          <Disclosure title="차시별 메모로 적고 싶다면 (선택)" tone="parchment">
            <AutoField
              field="learningActivities"
              label="핵심 학습 활동 메모"
              rows={4}
              placeholder={"1차시 …\n2차시 …\n3차시 …"}
              help="위의 카드로 충분하다면 비워 두셔도 됩니다."
            />
          </Disclosure>
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
              hint1="방금 정한 '가장 중요한 평가요소'를 학생의 말로 바꿔 보세요."
              example="이번 과제에서 볼 것은 세 가지예요. 개념이 정확한지, 자료를 제대로 읽었는지, 주장과 근거가 연결되는지."
            />
            <AutoField
              field="feedBack"
              label="Feed Back · 현재 어디까지 왔는가?"
              rows={2}
              placeholder="현재 위치를 알려 주는 한 문장"
              hint1="잘잘못이 아니라 기준에 비추어 지금 어디쯤인지를 말합니다."
              example="자료는 잘 찾았어요. 다만 그 표의 어느 숫자를 근거로 삼았는지가 아직 글에 없어요."
            />
            <AutoField
              field="feedForward"
              label="Feed Forward · 다음에는 무엇을 해야 하는가?"
              rows={2}
              placeholder="바로 실행할 수 있는 다음 한 걸음"
              hint1="고칠 곳을 하나만 짚어 주는 편이 실제로 더 잘 고쳐집니다."
              example="다음 수정본에서는 '표의 40km/h 줄을 보면'처럼 근거를 한 문장으로 콕 집어 넣어 보세요."
            />
          </div>

          <AiCoach task="align" note="지금까지 쓰신 설계안 전체가 한 방향을 보고 있는지 점검합니다." />

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
