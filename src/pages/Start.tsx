import { Block, PullQuote } from "@/components/teach/Block";
import { PresenterTip } from "@/components/teach/elements";
import { Bars, ChoiceList } from "@/components/poll/Poll";
import { PageNav } from "@/components/layout/PageParts";
import { ICEBREAK_OPTIONS } from "@/content/examples";
import { useSession } from "@/lib/session-context";
import type { PollKey } from "@/lib/types";

export default function Start() {
  const { session, votedPoll, castPoll, mode } = useSession();
  const results = session?.pollResults ?? { A: 0, B: 0, C: 0, D: 0 };

  const data = ICEBREAK_OPTIONS.map((o) => ({
    key: o.key,
    label: `${o.key}. ${o.label}`,
    value: results[o.key] ?? 0,
    highlight: votedPoll === o.key,
  }));

  return (
    <>
      <section className="bg-canvas py-14 sm:py-[72px]">
        <div className="reading">
          <p className="text-fine font-semibold uppercase tracking-[0.16em] text-action">START</p>
          <h1 className="mt-3 text-[2.25rem] leading-[1.12] tracking-[-0.022em] sm:text-[3rem]">
            나는 수업을 어디서부터 만들까?
          </h1>
          <p className="mt-5 text-lead-airy text-ink-80">
            새로운 단원을 맡았습니다. 여러분은 가장 먼저 무엇을 하시나요?
          </p>
          <p className="mt-3 text-caption text-ink-48">
            정답이 있는 질문이 아닙니다. 평소에 실제로 하시는 것을 고르시면 됩니다.
          </p>

          <div className="mt-8">
            <ChoiceList
              options={ICEBREAK_OPTIONS}
              selected={votedPoll as PollKey | null}
              onSelect={(k) => void castPoll(k)}
            />
          </div>

          {votedPoll && (
            <div className="appear mt-10 rounded-lg border border-hairline bg-canvas-parchment px-5 py-6 sm:px-7">
              <p className="mb-5 text-caption font-semibold text-ink-48">
                지금까지의 응답 {mode === "local" && "· 로컬 모드에서는 내 응답만 집계됩니다"}
              </p>
              <Bars data={data} />
              <p className="mt-5 border-t border-hairline pt-4 text-fine text-ink-48">
                개별 응답은 누구의 것인지 표시되지 않습니다.
              </p>
            </div>
          )}
        </div>
      </section>

      {votedPoll && (
        <>
          <section className="bg-tile-1 py-14 text-white sm:py-[72px]">
            <div className="reading text-center">
              <p className="pull-quote mx-auto max-w-[24ch] text-white">
                오늘 우리는 D에서 출발하여 C를 거쳐 A로 가보려고 합니다.
              </p>
              <div className="mx-auto mt-8 flex max-w-[520px] items-center justify-between gap-2 text-caption text-white/70">
                <span className="rounded-pill bg-white/10 px-3 py-2">D 남길 이해</span>
                <span aria-hidden>→</span>
                <span className="rounded-pill bg-white/10 px-3 py-2">C 평가 증거</span>
                <span aria-hidden>→</span>
                <span className="rounded-pill bg-white/10 px-3 py-2">A 학습 활동</span>
              </div>
              <p className="mt-10 text-[1.75rem] font-semibold leading-[1.3] tracking-[-0.018em] text-white sm:text-[2rem]">
                왜 거꾸로 가는 걸까요?
              </p>
            </div>
          </section>

          <section className="bg-canvas py-14 sm:py-[72px]">
            <div className="reading">
              <Block kind="teacher">
                <p>
                  방금 고르신 것 중에 틀린 답은 하나도 없습니다. 재미있는 활동을 찾는 것도, 교과서를 펴는 것도
                  모두 실제 교실에서 필요한 일입니다.
                </p>
                <p>
                  다만 활동에서 시작하면 이런 일이 자주 생깁니다. 수업은 활기찼는데, 단원이 끝난 뒤
                  "그래서 학생에게 무엇이 남았나요?"라는 질문에 답하기가 어렵습니다. 평가도 수업과 따로
                  준비되어, 결국 외운 것을 묻는 문제로 돌아가곤 합니다.
                </p>
                <p>
                  그래서 오늘은 순서를 한 번 뒤집어 봅니다. 학생에게 남길 것을 먼저 정하고, 그것을 어떻게
                  확인할지 정하고, 마지막에 그 증거가 나오도록 수업을 세웁니다.
                </p>
              </Block>

              <Block kind="read" title="오늘 150분 동안 하게 될 일">
                <ol className="space-y-2.5">
                  {[
                    "1교시 · 내 교과의 성취기준 하나를 골라 세 차원으로 해부합니다.",
                    "2교시 · 그 단원이 끝난 뒤 학생에게 남길 한 문장과 탐구질문을 만듭니다.",
                    "3교시 · 그 이해가 드러날 수행과제와 평가요소, 피드백까지 설계합니다.",
                    "마지막 · 지금까지 쓴 것이 A4 한 장 설계안으로 자동으로 모입니다.",
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

              <PullQuote>많이 가르치는 것이 깊이 있는 학습은 아닙니다.</PullQuote>

              <PresenterTip>
                <p>결과 그래프를 읽어 주되, 어느 것이 정답인지는 말하지 마세요.</p>
                <p>
                  A를 고른 분이 많다면 "가장 현실적인 선택입니다"라고 인정한 뒤, "그런데 그 활동이
                  무엇을 남기는지 어떻게 확인하시나요?"로 넘어가면 자연스럽습니다.
                </p>
              </PresenterTip>

              <PageNav next={{ to: "/s1", label: "1교시 · 교육과정을 읽다" }} />
            </div>
          </section>
        </>
      )}

      {!votedPoll && (
        <section className="bg-canvas-parchment py-12">
          <div className="reading text-center text-caption text-ink-48">
            하나를 선택하면 다음 이야기가 열립니다.
          </div>
        </section>
      )}
    </>
  );
}
