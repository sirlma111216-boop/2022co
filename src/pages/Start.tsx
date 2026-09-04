import { useEffect } from "react";
import { MustSay } from "@/components/teach/MustSay";
import { Block, PullQuote } from "@/components/teach/Block";
import { PresenterTip } from "@/components/teach/elements";
import { Bars, ChoiceList } from "@/components/poll/Poll";
import { ChoicePoll } from "@/components/activity/ChoicePoll";
import { DiscussionTimer } from "@/components/activity/DiscussionTimer";
import { LadderGame } from "@/components/activity/LadderGame";
import { AutoField } from "@/components/activity/AutoField";
import { Disclosure } from "@/components/ui/disclosure";
import { PageNav } from "@/components/layout/PageParts";
import { AUTOPSY_CASES, ICEBREAK_OPTIONS } from "@/content/examples";
import { useSession } from "@/lib/session-context";
import { isFilled } from "@/lib/utils";
import { POLL_AUTOPSY, type PollKey } from "@/lib/types";

export default function Start() {
  const { session, votedPoll, castPoll, mode, design, profile, votes, markProgress } = useSession();
  const results = session?.pollResults ?? {};
  const chose = votes[POLL_AUTOPSY] || design.autopsyChoice;

  // START 활동도 강사 화면의 「활동별 작성 현황」에 잡히게 한다.
  // 이 두 가지는 ActivityCard 를 쓰지 않아 지금까지 집계에서 통째로 빠져 있었다.
  const autopsyDone = !!chose && isFilled(design.autopsyReason);
  const unitDone = isFilled(design.unitName) && isFilled(design.initialActivity);
  useEffect(() => {
    if (autopsyDone) markProgress("p0");
  }, [autopsyDone, markProgress]);
  useEffect(() => {
    if (unitDone) markProgress("u0");
  }, [unitDone, markProgress]);

  const icebreakData = ICEBREAK_OPTIONS.map((o) => ({
    key: o.key,
    label: `${o.key}. ${o.label}`,
    value: results[o.key] ?? 0,
    highlight: votedPoll === o.key,
  }));

  return (
    <>
      {/* ── START MISSION · 수업 부검실 ───────────────────────────── */}
      <section className="bg-canvas py-14 sm:py-[72px]">
        <div className="reading">
          <p className="text-fine font-semibold uppercase tracking-[0.16em] text-action">START MISSION</p>
          <h1 className="mt-3 text-[2.25rem] leading-[1.12] tracking-[-0.022em] sm:text-[3rem]">수업 부검실</h1>
          <p className="mt-5 text-lead-airy text-ink-80">
            세 수업 모두 실제 학교에서 충분히 일어날 법합니다. 한 학기 동안 딱 하나만 먼저 고친다면
            어느 수업을 선택하시겠습니까?
          </p>

          <ChoicePoll
            pollId={POLL_AUTOPSY}
            question="가장 먼저 고쳐야 할 수업은 무엇이라고 생각하십니까?"
            options={AUTOPSY_CASES}
            choiceField="autopsyChoice"
            reasonField="autopsyReason"
            reasonPlaceholder="예: 활동은 좋은데 평가가 따로 놀아서요."
            afterVote={
              <>
                <div className="rounded-lg border-l-[3px] border-action bg-canvas-parchment px-5 py-4">
                  <p className="text-body-sm leading-[1.7] text-ink">
                    같은 수업을 보고도 판단은 갈릴 수 있습니다.
                    <br />
                    선생님 두 분의 의견을 직접 들어보겠습니다.
                  </p>
                  {/* 두 분을 어떻게 고르는가 — 지목보다 사다리가 훨씬 편하게 말문을 연다 */}
                  <LadderGame />
                </div>
                <DiscussionTimer seconds={60} label="선택 이유 비교하기" />
              </>
            }
          />

          <PresenterTip>
            <p>분포를 읽어 주되 어느 쪽이 정답인지 말하지 마세요. 갈린 것 자체가 오늘의 출발점입니다.</p>
            <p>
              소수 쪽을 먼저 지목해 "왜 그렇게 보셨어요?"라고 물으면 대화가 열립니다. B를 고른 분이 적다면
              그 이유를 특히 들어 보세요.
            </p>
          </PresenterTip>
        </div>
      </section>

      {chose && (
        <>
          {/* ── 교수자 설명 ─────────────────────────────────────── */}
          <section className="bg-tile-1 py-14 text-white sm:py-[72px]">
            <div className="reading text-center">
              <p className="pull-quote mx-auto max-w-[30ch] text-white">
                오늘 우리가 배우려는 것은 재미있는 수업과 재미없는 수업을 가르는 방법이 아닙니다.
              </p>
              <p className="mx-auto mt-6 max-w-[30ch] text-[1.5rem] font-semibold leading-[1.45] tracking-[-0.018em] text-white sm:text-[1.75rem]">
                학생이 무엇을 배우고 있는지가 보이는 수업과 그렇지 않은 수업을 구분하는 방법입니다.
              </p>
            </div>
          </section>

          {/* 강사용 — 위 두 문장을 반드시 소리 내어 읽게 한다 */}
          <section className="bg-canvas pt-10">
            <div className="reading">
              <MustSay id="autopsy-frame" className="my-0" />
            </div>
          </section>

          {/* ── 오늘 다시 설계할 나의 실제 수업 ──────────────────── */}
          <section className="bg-canvas py-14 sm:py-[72px]">
            <div className="reading">
              <p className="text-fine font-semibold uppercase tracking-[0.1em] text-action">
                오늘의 재료 고르기
              </p>
              <h2 className="mt-3 text-display-md">오늘 다시 설계할 나의 실제 수업</h2>
              <p className="mt-4 text-body text-ink-80">
                최근 실제로 가르쳤거나 앞으로 곧 가르칠 단원 하나를 떠올려 주세요. 오늘의 모든 활동은
                가능하면 이 단원을 계속 사용합니다.
              </p>

              <div className="my-8 space-y-6 rounded-lg border border-hairline bg-canvas p-5 sm:p-7">
                <div className="rounded-md bg-canvas-parchment px-4 py-3">
                  <p className="text-caption text-ink-48">
                    교과 · <strong className="font-semibold text-ink">{profile?.subject || "미기재"}</strong>
                    <span className="mx-2 text-ink-48">/</span>
                    학교급 · <strong className="font-semibold text-ink">{profile?.schoolLevel || "미기재"}</strong>
                    <span className="ml-2 text-fine">(입장할 때 고르신 값입니다)</span>
                  </p>
                </div>

                <AutoField
                  field="unitName"
                  label="단원명"
                  single
                  placeholder="예: 중2 과학 · 빛과 파동"
                  help="교과서 단원명 그대로도 좋고, 선생님이 부르시는 이름도 좋습니다."
                />

                <AutoField
                  field="initialActivity"
                  label="이 단원에서 내가 가장 공들여 준비했던 활동은 무엇인가?"
                  single
                  placeholder="예: 실험, 토론, 게임, 영상, 프로젝트, 문제풀이 등"
                />

                <AutoField
                  field="initialActivityReason"
                  label="나는 왜 이 활동을 중요하게 생각했을까?"
                  rows={2}
                  placeholder="1~2문장이면 충분합니다."
                  hint1="학생들의 반응 때문이었나요, 아니면 그 활동이 아니면 가르칠 수 없는 무언가가 있었나요?"
                />
              </div>

              <Block kind="teacher">
                <p>
                  방금 적으신 이 활동을, 오늘 마지막 시간에 다시 꺼내 볼 겁니다. 그때 이 활동을 버릴지
                  남길지 직접 결정하시게 됩니다.
                </p>
                <p>
                  미리 말씀드리면, 오늘의 목적은 좋은 활동을 버리자는 것이 아닙니다. 그 활동이 무엇을 위한
                  것이었는지를 분명히 하려는 것입니다.
                </p>
              </Block>

              {/* ── 축소된 기존 아이스브레이킹 ────────────────────── */}
              <Disclosure
                className="my-8"
                tone="parchment"
                title="짧게 하나만 더 · 나는 수업을 어디서부터 만들까?"
              >
                <p className="mb-4 text-caption text-ink-48">
                  30초짜리 설문입니다. 새로운 단원을 맡았을 때 평소 가장 먼저 하시는 것을 고르세요.
                </p>
                <ChoiceList
                  options={ICEBREAK_OPTIONS}
                  selected={votedPoll as PollKey | null}
                  onSelect={(k) => void castPoll(k)}
                />
                {votedPoll && (
                  <div className="appear mt-6 rounded-lg border border-hairline bg-canvas px-5 py-5">
                    <p className="mb-4 text-caption font-semibold text-ink-48">
                      지금까지의 응답 {mode === "local" && "· 로컬 모드에서는 내 응답만 집계됩니다"}
                    </p>
                    <Bars data={icebreakData} />
                    <p className="mt-5 border-t border-hairline pt-4 text-body-sm text-ink">
                      오늘 우리는 <strong className="font-semibold">D</strong>에서 출발하여{" "}
                      <strong className="font-semibold">C</strong>를 거쳐{" "}
                      <strong className="font-semibold">A</strong>로 가보려고 합니다.
                    </p>
                  </div>
                )}
              </Disclosure>

              <PullQuote>많이 가르치는 것이 깊이 있는 학습은 아닙니다.</PullQuote>

              <Block kind="read" title="오늘 150분 동안 하게 될 일">
                <ol className="space-y-2.5">
                  {[
                    "1교시 · 내 교과의 성취기준 하나를 골라 세 차원으로 해부합니다.",
                    "2교시 · 다룰 내용의 30%를 덜어내고, 남은 것을 한 문장으로 묶습니다.",
                    "3교시 · 수행과제를 만들고, 그 과제를 직접 공격해 구멍을 찾아 고칩니다.",
                    "마지막 · 처음에 적으신 그 활동과 다시 만납니다.",
                  ].map((t, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="tabular mt-0.5 text-caption font-semibold text-action">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ol>
              </Block>

              <PageNav next={{ to: "/s1", label: "1교시 · 교육과정을 읽다" }} />
            </div>
          </section>
        </>
      )}
    </>
  );
}
