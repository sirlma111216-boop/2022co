import { MustSay } from "@/components/teach/MustSay";
import { Block, PullQuote } from "@/components/teach/Block";
import {
  CompareCards,
  Misconception,
  MoreInfo,
  Note,
  PresenterTip,
  SectionHeading,
} from "@/components/teach/elements";
import { TermCard, TermChip } from "@/components/teach/TermCard";
import { StandardDissect } from "@/components/teach/StandardDissect";
import { PageNav, SessionHero, SessionLayout } from "@/components/layout/PageParts";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { AutoField } from "@/components/activity/AutoField";
import { AiCoach } from "@/components/activity/AiCoach";
import { ShareBar } from "@/components/wall/Wall";
import { DIMENSION_CAUTION, LIGHT_STANDARD } from "@/content/examples";
import { useSession } from "@/lib/session-context";
import { isFilled } from "@/lib/utils";

const SECTIONS = [
  { id: "s1-intro", label: "1교시에서 할 일" },
  { id: "s1-direction", label: "무엇이 달라졌나" },
  { id: "s1-deep", label: "깊이 있는 학습" },
  { id: "s1-read", label: "성취기준 읽는 법" },
  { id: "s1-three", label: "세 가지 차원" },
  { id: "s1-caution", label: "억지로 만들지 않기" },
  { id: "a1", label: "ACTIVITY 1" },
];

export default function Session1() {
  const { design } = useSession();
  // 완료 판정은 「썼는가」만 본다. 길이로 막으면 간결하게 쓴 사람이 손해를 본다.
  const done =
    isFilled(design.achievementStandard) &&
    (isFilled(design.knowledgeUnderstanding) ||
      isFilled(design.processSkill) ||
      isFilled(design.valueAttitude));

  return (
    <>
      <SessionHero
        kicker="1교시 · 50분"
        title="교육과정을 읽다"
        lead="성취기준은 가르칠 내용의 목록이 아닙니다. 수업이 끝났을 때 학생에게서 확인할 도착점입니다. 오늘 첫 시간에는 그 문장을 제대로 읽는 법을 익힙니다."
        minutes={50}
        goals={[
          "2022 개정 교육과정이 수업에 요구하는 방향을 이해한다.",
          "성취기준 한 문장을 지식·이해 / 과정·기능 / 가치·태도로 나누어 읽는다.",
          "내 교과의 성취기준 하나를 골라 직접 해부해 본다.",
        ]}
      />

      <SessionLayout sections={SECTIONS}>
        {/* ── 들어가며 ─────────────────────────────────────────── */}
        <section id="s1-intro" className="scroll-mt-32">
          <SectionHeading
            eyebrow="들어가며"
            title="같은 문장을 다르게 읽습니다"
            lead="많은 선생님이 성취기준을 이미 매일 보고 계십니다. 오늘은 그 문장을 조금 다른 방식으로 읽어 봅니다."
          />
          <Block kind="teacher">
            <p>
              대부분의 학교에서 성취기준은 진도표의 한 칸으로 쓰입니다. 이번 주에 무엇을 다뤄야 하는지
              알려 주는 목록이지요. 그런데 성취기준 문장을 자세히 보면, 그것은 "무엇을 다룰지"가 아니라
              "학생이 어떤 상태가 되어야 하는지"를 적은 문장입니다.
            </p>
            <p>
              이 차이가 중요한 이유는 평가 때문입니다. 다루기만 하면 되는 것이라면 진도만 나가면 끝나지만,
              도착점이라면 "학생이 정말 거기에 도착했는가"를 확인해야 합니다. 그 확인 방법이 곧 평가입니다.
            </p>
          </Block>
        </section>

        {/* ── SECTION 1 ────────────────────────────────────────── */}
        <section id="s1-direction" className="mt-16 scroll-mt-32">
          <SectionHeading
            eyebrow="SECTION 1"
            title="2022 개정 교육과정에서 달라진 수업의 방향"
            lead="문서가 바뀌었다는 이야기가 아니라, 수업에서 무엇을 다르게 하자는 이야기입니다."
          />

          <Block kind="read" title="네 가지 방향">
            <ol className="space-y-3">
              <li>
                <strong className="font-semibold text-ink">깊이 있는 학습.</strong> 많은 내용을 빠르게
                지나가는 대신, 중요한 것을 충분히 다룹니다.
              </li>
              <li>
                <strong className="font-semibold text-ink">전이.</strong> 배운 것을 처음 보는 상황에
                가져다 쓸 수 있어야 이해했다고 봅니다.
              </li>
              <li>
                <strong className="font-semibold text-ink">세 차원을 함께.</strong> 지식만이 아니라
                과정·기능, 가치·태도를 함께 고려합니다.
              </li>
              <li>
                <strong className="font-semibold text-ink">연결.</strong> 성취기준과 수업과 평가가 같은
                곳을 향하도록 정렬합니다.
              </li>
            </ol>
          </Block>

          <MustSay id="less-is-deeper" />

          <Block kind="teacher">
            <p>
              현장에서 가장 자주 듣는 말이 "진도가 안 나가요"입니다. 실제로 다뤄야 할 내용은 많고 시간은
              부족합니다. 그런데 다 다뤘다고 해서 학생에게 남는 것은 아니라는 사실을 우리는 이미 알고
              있습니다. 시험이 끝나면 대부분 사라지지요.
            </p>
            <p>
              그래서 방향을 바꿉니다. 무엇을 <em>덜</em> 다룰지 정하고, 남은 것을 여러 각도에서 충분히
              다룹니다. 덜 가르치기 위해서는 무엇이 중요한지 먼저 정해야 하는데, 그 판단의 기준이 바로
              성취기준과 <TermChip id="key-idea" />입니다.
            </p>
          </Block>
        </section>

        {/* ── 깊이 있는 학습 ───────────────────────────────────── */}
        <section id="s1-deep" className="mt-16 scroll-mt-32">
          <SectionHeading eyebrow="개념" title="깊이 있는 학습과 전이" />

          <TermCard id="deep-learning" />

          <Block kind="science" title="굴절 단원으로 보면">
            <p>
              굴절을 다룰 때 물속의 젓가락, 신기루, 렌즈, 물고기의 위치를 각각 따로 설명하면 학생은 네 개의
              사례를 외웁니다. 시험이 끝나면 네 개 다 사라집니다.
            </p>
            <p>
              대신 "빛이 다른 매질로 들어갈 때 속력이 달라져 경로가 꺾인다"는 하나의 생각으로 네 현상을 모두
              설명해 보게 하면, 학생은 다섯 번째 현상을 만났을 때도 설명해 낼 수 있습니다. 그때 우리는 조금 더
              깊은 이해가 일어났다고 봅니다.
            </p>
          </Block>

          <PullQuote tone="dark">
            학생이 배운 것을 새로운 상황에서 사용할 수 있을 때 우리는 조금 더 깊은 이해가 일어났다고 볼 수
            있습니다.
          </PullQuote>

          <TermCard id="transfer" />

          <Block kind="think">
            <p>선생님의 지난 단원을 하나 떠올려 보세요.</p>
            <p>
              그 단원에서 학생이 배운 것을 <strong>수업에서 다루지 않은 새로운 상황</strong>에 적용해 본 적이
              있나요? 없었다면, 어떤 상황을 하나 넣을 수 있을까요?
            </p>
            <p className="text-white/60">지금 답을 적을 필요는 없습니다. 30초만 생각해 보세요.</p>
          </Block>

          <PresenterTip>
            <p>여기서 바로 다음으로 넘어가지 말고, 옆 선생님과 30초 이야기하게 하세요.</p>
            <p>두세 분께 "어떤 상황을 떠올리셨어요?"만 물어보고 판단은 하지 않습니다.</p>
          </PresenterTip>
        </section>

        {/* ── SECTION 2 ────────────────────────────────────────── */}
        <section id="s1-read" className="mt-16 scroll-mt-32">
          <SectionHeading
            eyebrow="SECTION 2"
            title="성취기준을 읽는 법"
            lead="성취기준 한 문장 안에는 보통 두 가지 질문의 답이 들어 있습니다."
          />

          <Block kind="read">
            <p>성취기준을 읽을 때 던지는 두 가지 질문입니다.</p>
            <ul className="mt-2 space-y-1.5">
              <li>· 학생이 <strong className="font-semibold text-ink">무엇을 알아야</strong> 하는가?</li>
              <li>· 학생이 <strong className="font-semibold text-ink">무엇을 할 수 있어야</strong> 하는가?</li>
            </ul>
            <p className="mt-3">
              아래 문장을 색으로 나누어 보겠습니다. 칩을 눌러 한 쪽씩만 남겨 보세요.
            </p>
          </Block>

          <StandardDissect
            code={LIGHT_STANDARD.code}
            segments={LIGHT_STANDARD.segments}
            notes={LIGHT_STANDARD.notes}
          />

          <Block kind="teacher">
            <p>
              앞부분 "빛의 반사와 굴절의 원리를 이해하고"는 <strong>알아야 할 것</strong>입니다. 뒷부분
              "빛의 경로를 이용하여 표현할 수 있다"는 <strong>할 수 있어야 할 것</strong>이고요.
            </p>
            <p>
              여기서 중요한 것은 뒷부분입니다. 이 성취기준은 "반사 법칙을 안다"로 끝나지 않습니다. 학생이
              직접 <strong>빛의 경로를 그려서</strong> 물체를 보는 과정을 설명해야 도달한 것입니다. 그렇다면
              평가에도 광선을 그리는 장면이 반드시 있어야 하겠지요.
            </p>
            <p>
              성취기준을 이렇게 읽으면, 평가 문항을 따로 고민할 필요가 줄어듭니다. 성취기준이 이미 무엇을
              봐야 하는지 말해 주고 있으니까요.
            </p>
          </Block>

          <MustSay id="standard-is-destination" />

          <TermCard id="standard" />
        </section>

        {/* ── 세 차원 ──────────────────────────────────────────── */}
        <section id="s1-three" className="mt-16 scroll-mt-32">
          <SectionHeading
            eyebrow="세 가지 차원"
            title="지식·이해 / 과정·기능 / 가치·태도"
            lead="2022 개정 교육과정은 한 영역의 내용을 이 세 칸으로 나누어 정리했습니다."
          />

          <div className="my-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                t: "지식·이해",
                q: "무엇을 알아야 하는가",
                d: "개념·원리·사실, 그리고 개념 사이의 관계",
                e: "반사 법칙, 굴절이 일어나는 조건, 본다는 것은 빛이 눈에 들어오는 일이라는 것",
              },
              {
                t: "과정·기능",
                q: "무엇을 할 수 있어야 하는가",
                d: "그 지식을 가지고 실제로 해내는 교과 고유의 사고",
                e: "광선 다이어그램으로 표현하기, 변인을 통제해 실험 설계하기, 자료에서 규칙 찾기",
              },
              {
                t: "가치·태도",
                q: "어떤 태도로 대하는가",
                d: "그 교과를 하는 사람의 마음가짐과 참여 방식",
                e: "증거 없이 단정하지 않기, 자료를 보고 자기 생각을 바꾸기, 안전하게 실험하기",
              },
            ].map((c) => (
              <div key={c.t} className="rounded-lg border border-hairline bg-canvas px-5 py-5">
                <p className="text-tagline">{c.t}</p>
                <p className="mt-1 text-caption font-semibold text-action">{c.q}</p>
                <p className="mt-3 text-body-sm leading-[1.65] text-ink-80">{c.d}</p>
                <p className="mt-3 border-t border-hairline pt-3 text-caption leading-[1.6] text-ink-48">
                  {c.e}
                </p>
              </div>
            ))}
          </div>

          <TermCard id="knowledge" />
          <TermCard id="process" />
          <TermCard id="value" />

          <MoreInfo title="개념 렌즈, 스트랜드 같은 말은 무엇인가요?">
            <p>
              개념 기반 교육과정 문헌에는 개념 렌즈(concept lens), 스트랜드(strand), 일반화(generalization)
              같은 용어가 나옵니다. 오늘 설계에는 필요하지 않아 본문에서 뺐습니다.
            </p>
            <p className="mt-2">
              굳이 연결하자면, 오늘 우리가 만들 "학생에게 남길 한 문장"이 문헌에서 말하는 일반화에 가깝고,
              그 문장을 관통하는 큰 개념(예: 에너지, 상호작용, 변화)이 개념 렌즈에 해당합니다. 용어를 몰라도
              설계는 됩니다.
            </p>
          </MoreInfo>
        </section>

        {/* ── 주의 ─────────────────────────────────────────────── */}
        <section id="s1-caution" className="mt-16 scroll-mt-32">
          <SectionHeading
            eyebrow="주의"
            title="세 가지를 억지로 만들어내지 않습니다"
            lead="가장 자주 나오는 실수입니다."
          />

          <Misconception
            wrong="성취기준 한 문장 안에 지식·이해, 과정·기능, 가치·태도가 모두 들어 있어야 한다."
            right="세 차원이 한 문장에 모두 명시되는 경우는 오히려 드뭅니다."
          >
            <p>
              특히 가치·태도는 성취기준 문장에 나타나지 않는 경우가 많습니다. 그럴 때 억지로 "협동심을
              기른다" 같은 문장을 만들어 넣으면, 나중에 그 태도를 평가할 방법이 없어 곤란해집니다.
            </p>
          </Misconception>

          <Block kind="teacher">
            <p>
              그러면 어떻게 해야 할까요. 성취기준 한 문장만 노려보지 말고, 그 성취기준이 태어난{" "}
              <TermChip id="content-system" /> 표를 함께 펼칩니다. 교육과정 문서에서 각 영역 앞에 붙어 있는
              그 표입니다.
            </p>
            <p>
              표에는 이미 지식·이해 / 과정·기능 / 가치·태도가 칸으로 나뉘어 적혀 있습니다. 이번 단원과 어울리는
              항목을 거기서 골라 오면 됩니다. 없는 것을 만들어내는 것이 아니라, 이미 있는 것에서 고르는 일입니다.
            </p>
          </Block>

          <div className="my-7 space-y-4">
            {DIMENSION_CAUTION.map((c, i) => (
              <div key={i} className="rounded-lg border border-hairline bg-canvas px-5 py-4">
                <p className="text-body-sm text-ink">{c.standard}</p>
                <p className="mt-2 text-caption font-semibold text-action">{c.has}</p>
                <p className="mt-1.5 text-caption leading-[1.65] text-ink-48">{c.comment}</p>
              </div>
            ))}
          </div>

          <TermCard id="content-system" />

          <Note tone="action">
            정리하면 이렇습니다. 세 칸을 다 채우는 것이 목표가 아니라, <strong>이 단원에서 실제로 기를 수
            있고 나중에 확인할 수 있는 것</strong>만 적는 것이 목표입니다. 비워 두어도 괜찮습니다.
          </Note>

          <PresenterTip>
            <p>가능하면 담당 교과의 실제 내용 체계표 PDF를 옆 창에 함께 띄워 주세요.</p>
            <p>연수생 대부분은 이 표를 처음 열어 봅니다. 어디에 있는지 찾는 법부터 보여 주면 좋습니다.</p>
          </PresenterTip>
        </section>

        {/* ── ACTIVITY 1 ───────────────────────────────────────── */}
        <ActivityCard
          id="a1"
          no="ACTIVITY 1"
          title="성취기준 해부하기"
          minutes={12}
          done={done}
          prompt={
            <>
              선생님의 교과에서 <strong>이번 학기에 실제로 가르칠 단원</strong> 하나를 고르고, 그 단원의 성취기준을
              하나만 골라 적어 주세요. 그런 다음 세 차원으로 나누어 봅니다. 없는 칸은 비워 두셔도 됩니다.
            </>
          }
          footer={
            <div className="w-full space-y-4">
              <ShareBar
                activityId="a1"
                canShare={isFilled(design.achievementStandard)}
                content={() => ({
                  단원: design.unitName,
                  성취기준: design.achievementStandard,
                  "지식·이해": design.knowledgeUnderstanding,
                  "과정·기능": design.processSkill,
                  "가치·태도": design.valueAttitude,
                  "핵심 행동": design.standardCoreAction,
                })}
              />
              <AiCoach task="standard" />
            </div>
          }
        >
          <AutoField
            field="unitName"
            label="단원명"
            single
            placeholder="예: 중2 과학 · 빛과 파동"
            help="교과서 단원명 그대로도 좋고, 선생님이 부르시는 이름도 좋습니다."
          />

          <AutoField
            field="achievementStandard"
            label="성취기준"
            rows={3}
            placeholder="예: [9과10-01] 빛의 반사와 굴절의 원리를 이해하고, 물체를 보는 과정을 빛의 경로를 이용하여 표현할 수 있다."
            help="코드와 문장을 함께 적어 주세요. 문장을 그대로 옮기는 것이 중요합니다."
          />

          <div className="grid gap-5 lg:grid-cols-3">
            <AutoField
              field="knowledgeUnderstanding"
              label="지식·이해"
              rows={4}
              placeholder="학생이 알아야 할 개념과 원리, 그리고 개념 사이의 관계"
              help="무엇을 알아야 하는가?"
              example="빛의 직진, 반사 법칙(입사각 = 반사각), 굴절이 일어나는 조건, 물체를 본다는 것은 물체에서 나온 빛이 눈에 들어오는 일이라는 것."
            />
            <AutoField
              field="processSkill"
              label="과정·기능"
              rows={4}
              placeholder="학생이 실제로 해내야 하는 교과 고유의 사고와 절차"
              help="무엇을 할 수 있어야 하는가?"
              example="광선 다이어그램으로 빛의 경로를 표현하기, 관찰한 현상을 모형으로 설명하기, 예측과 결과를 비교하기."
            />
            <AutoField
              field="valueAttitude"
              label="가치·태도"
              rows={4}
              placeholder="문장에 없으면 내용 체계표에서 가져오거나 비워 두세요"
              help="어떤 태도로 대하는가? — 억지로 만들지 않아도 됩니다."
              example="관찰한 증거에 근거해 설명하려는 태도, 자기 설명이 현상과 맞지 않을 때 고쳐 보려는 태도."
            />
          </div>

          <Note>
            세 칸을 다 채우지 못해도 괜찮습니다. 오늘 중요한 것은 완벽한 분석이 아니라,{" "}
            <strong>성취기준을 도착점으로 읽는 연습</strong>입니다.
          </Note>

          {/* ── 핵심 행동 하나 고르기 ─────────────────────────── */}
          <div className="rounded-lg border-l-[3px] border-action bg-canvas-parchment px-5 py-5 sm:px-6">
            <p className="text-fine font-semibold uppercase tracking-[0.08em] text-action">
              마지막 한 칸
            </p>
            <h4 className="mt-2 text-tagline">성취기준이 학생에게 요구하는 가장 중요한 행동은?</h4>
            <p className="mt-2 text-body-sm leading-[1.7] text-ink-80">
              이 성취기준에 도달한 학생이 실제로 반드시 보여줘야 하는 행동 하나를 골라 적어 보세요.
            </p>
            <div className="mt-5">
              <AutoField
                field="standardCoreAction"
                label="반드시 보여줘야 하는 행동 하나"
                single
                placeholder="동사 하나로 적어 주세요."
                hint1="성취기준 문장의 서술어를 다시 보세요. '~할 수 있다' 앞에 있는 말이 대개 그 행동입니다."
                hint2="학생이 그 행동을 하지 않고도 단원을 통과할 수 있다면, 그것은 핵심 행동이 아닙니다."
                example="설명한다 / 비교한다 / 해석한다 / 표현한다 / 설계한다 / 판단한다"
              />
            </div>
            <p className="mt-4 border-t border-hairline pt-4 text-caption text-ink-80">
              이 행동은 뒤에서 <strong className="font-semibold text-ink">평가 증거를 설계할 때 다시
              사용합니다.</strong>
            </p>
          </div>
        </ActivityCard>

        <CompareCards
          leftLabel="이렇게 적으면 아쉽습니다"
          rightLabel="이렇게 바꿔 봅니다"
          items={[
            {
              left: "지식·이해: 빛, 반사, 굴절",
              right: "지식·이해: 빛이 매질을 지날 때 속력이 달라져 경로가 꺾인다.",
              note: "단어 나열은 나중에 평가할 수 없습니다. 관계를 문장으로 적습니다.",
            },
            {
              left: "과정·기능: 모둠 활동, 발표",
              right: "과정·기능: 관찰한 현상을 광선 다이어그램으로 표현한다.",
              note: "활동의 형태가 아니라 학생이 수행하는 교과의 사고를 적습니다.",
            },
            {
              left: "가치·태도: 성실하게 참여한다.",
              right: "가치·태도: 자신의 설명이 관찰과 맞지 않을 때 설명을 수정한다.",
              note: "생활 태도가 아니라 과학을 하는 태도입니다.",
            },
          ]}
        />

        <PageNav
          prev={{ to: "/start", label: "START로 돌아가기" }}
          next={{ to: "/s2", label: "2교시 · 무엇을 남길 것인가" }}
        />
      </SessionLayout>
    </>
  );
}
