import { useEffect, useMemo, useState } from "react";
import { Dices, Lock, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Disclosure } from "@/components/ui/disclosure";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LadderBoard, COUNTDOWN_MS, LADDER_TOTAL_MS } from "@/components/activity/LadderBoard";
import { LADDER_GAMES, LADDER_GAME_LIST } from "@/content/ladderGames";
import { repo } from "@/lib/repo";
import {
  countdownLabel,
  deriveLadder,
  emergencyLadder,
  makeSeed,
  resetLadder,
  startLadder,
} from "@/lib/ladder-game";
import type { LadderGameId, Participant, SessionDoc } from "@/lib/types";
import { cn } from "@/lib/utils";

/** 발표자 두 사람이 부검실에서 무엇을 골랐는지 — 강사가 바로 물어볼 수 있게 */
interface PickedAnswer {
  uid: string;
  choice: string;
  reason: string;
}

/**
 * 사다리는 연수 중 두 번 돈다. 두 판이 한 화면에 같이 있으면 어느 쪽 버튼인지
 * 헷갈려서 사고가 난다 — 탭으로 하나만 보여 준다.
 */
export function LadderPanel({
  sessionId,
  session,
  participants,
}: {
  sessionId: string;
  session: SessionDoc | null;
  participants: Participant[];
}) {
  const [tab, setTab] = useState<LadderGameId>("start");

  return (
    <div className="rounded-lg border border-hairline bg-canvas p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-tagline">
        <Dices className="h-4 w-4 text-action" aria-hidden />
        사다리타기 발표자 뽑기
      </h3>

      <div className="mt-4 flex flex-wrap gap-2">
        {LADDER_GAME_LIST.map((g) => {
          const st = session?.ladders?.[g.id]?.status;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setTab(g.id)}
              className={cn(
                "rounded-pill border px-3.5 py-1.5 text-caption transition-transform active:scale-95",
                tab === g.id
                  ? "border-action bg-action text-white"
                  : "border-hairline bg-canvas text-ink-80",
              )}
            >
              {g.tab}
              {st === "running" && <span className="ml-1.5 text-fine opacity-70">· 공개됨</span>}
            </button>
          );
        })}
      </div>

      <LadderRound key={tab} gameId={tab} sessionId={sessionId} session={session} participants={participants} />
    </div>
  );
}

function LadderRound({
  gameId,
  sessionId,
  session,
  participants,
}: {
  gameId: LadderGameId;
  sessionId: string;
  session: SessionDoc | null;
  participants: Participant[];
}) {
  const def = LADDER_GAMES[gameId];
  const view = useMemo(
    () => deriveLadder(session, participants, gameId),
    [session, participants, gameId],
  );
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [answers, setAnswers] = useState<PickedAnswer[]>([]);
  const [, force] = useState(0);

  const startedAt = view.state.startedAt;
  const running = view.status === "running";
  const elapsed = startedAt ? Date.now() - startedAt : 0;
  const revealed = running && elapsed >= LADDER_TOTAL_MS;

  // 카운트다운·경로가 흐르는 동안에만 다시 그린다
  useEffect(() => {
    if (!running || elapsed >= LADDER_TOTAL_MS + 400) return;
    const id = setInterval(() => force((n) => n + 1), 200);
    return () => clearInterval(id);
  }, [running, elapsed]);

  // 발표자가 정해지면 두 사람의 부검실 응답을 읽어 온다 (강사만 읽을 수 있다)
  useEffect(() => {
    if (!revealed || view.presenters.length === 0) {
      setAnswers([]);
      return;
    }
    let alive = true;
    void Promise.all(
      view.presenters.map(async (p) => {
        const d = await repo.loadDesign(sessionId, p.uid).catch(() => null);
        return {
          uid: p.uid,
          choice: (d?.[def.choiceField] as string) ?? "",
          reason: (d?.[def.reasonField] as string) ?? "",
        };
      }),
    ).then((rows) => {
      if (alive) setAnswers(rows);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, sessionId, gameId, view.presenters.map((p) => p.uid).join(",")]);

  const run = async (next: Parameters<typeof repo.setLadder>[2]) => {
    setBusy(true);
    await repo.setLadder(sessionId, gameId, next).catch(() => {});
    setBusy(false);
  };

  const enough = view.seated.length >= 2;

  return (
    <div className="mt-5 border-t border-hairline pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-caption font-semibold text-ink">{def.tab}</p>
        <Badge tone={running ? "action" : view.status === "locked" ? "warn" : "neutral"}>
          {running ? "결과 공개" : view.status === "locked" ? "자리 마감" : "자리 선택 중"} · {view.round}회차
        </Badge>
      </div>

      <p className="mt-3 text-body-sm text-ink-80">
        <strong className="font-semibold text-ink">{view.joined.length}명</strong> 참여 ·{" "}
        <strong className="font-semibold text-ink">{view.seated.length}</strong> / {view.joined.length}명 자리 선택
        완료
      </p>

      {/* ── 진행자 컨트롤 ─────────────────────────────────────── */}
      <div className="mt-4 flex flex-wrap gap-2">
        {!running && (
          <>
            <Button
              size="sm"
              variant="pearl"
              onClick={() => run({ ...view.state, status: "locked" })}
              disabled={busy || view.status === "locked"}
            >
              <Lock className="h-3.5 w-3.5" aria-hidden />
              자리 선택 마감
            </Button>
            <Button size="sm" onClick={() => run(startLadder(view, makeSeed()))} disabled={busy || !enough}>
              <Play className="h-3.5 w-3.5" aria-hidden />
              결과 보기!
            </Button>
          </>
        )}
        {running && (
          <Button
            size="sm"
            variant="pearl"
            onClick={() => run({ ...view.state, startedAt: Date.now() })}
            disabled={busy}
          >
            <Play className="h-3.5 w-3.5" aria-hidden />
            결과 다시 보기
          </Button>
        )}
        <Button size="sm" variant="quiet" onClick={() => setConfirmReset(true)} disabled={busy}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          게임 초기화
        </Button>
      </div>

      {!enough && !running && (
        <p className="mt-3 text-caption text-ink-48">발표자를 뽑으려면 두 분 이상 참여해야 합니다.</p>
      )}

      {/* ── 판 ────────────────────────────────────────────────── */}
      <div className="mt-6">
        {running ? (
          elapsed < COUNTDOWN_MS ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <p className="text-[4rem] font-semibold leading-none tracking-[-0.03em] text-action">
                {countdownLabel(elapsed, COUNTDOWN_MS)}
              </p>
            </div>
          ) : view.state.emergencyPresenters?.length ? (
            <p className="rounded-md bg-canvas-parchment px-4 py-3 text-caption text-ink-80">
              사다리 대신 즉석 추첨으로 뽑았습니다.
            </p>
          ) : (
            <LadderBoard
              mode="result"
              cols={view.slots.length}
              rows={view.rows}
              rungs={view.rungs}
              slots={view.slots}
              presentSlots={view.presentSlots}
              traceStart={startedAt + COUNTDOWN_MS}
            />
          )
        ) : (
          <LadderBoard
            mode="seating"
            cols={Math.max(view.seatCount, 1)}
            rows={9}
            rungs={[]}
            seatOwner={view.seatOwner}
          />
        )}
      </div>

      {/* ── 결과 ──────────────────────────────────────────────── */}
      {revealed && view.presenters.length > 0 && (
        <div className="mt-6 rounded-lg border border-action/35 bg-canvas px-5 py-5">
          <p className="text-caption font-semibold text-action">발표자</p>
          <ol className="mt-3 space-y-4">
            {view.presenters.map((p, i) => {
              const a = answers.find((x) => x.uid === p.uid);
              const c = def.options.find((x) => x.key === a?.choice);
              return (
                <li key={p.uid} className="border-t border-hairline pt-3 first:border-0 first:pt-0">
                  <p className="text-body font-semibold text-ink">
                    {i + 1}. {p.nick}
                    {c && <span className="ml-2 font-normal text-ink-80">— {c.title}</span>}
                  </p>
                  {a?.reason?.trim() && (
                    <p className="mt-1 whitespace-pre-wrap text-body-sm leading-[1.65] text-ink-80">
                      “{a.reason.trim()}”
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-caption text-ink-48">
            {def.presenterAsk}
          </p>
        </div>
      )}

      {/* ── 비상구 — 기본 화면에서는 눈에 띄지 않게 ─────────────── */}
      <Disclosure className="mt-5" tone="parchment" title="추첨에 문제가 있나요?">
        <p className="text-caption leading-[1.7] text-ink-80">
          사다리가 그려지지 않거나 화면이 멈춘 경우에만 사용하세요. 자리를 고른 분들 중 두 분을 그 자리에서
          무작위로 뽑고, 결과는 모든 화면에 똑같이 저장됩니다.
        </p>
        <Button
          size="sm"
          variant="pearl"
          className="mt-3"
          disabled={busy || !enough}
          onClick={() => run(emergencyLadder(view, makeSeed()))}
        >
          간단 랜덤 추첨으로 발표자 2명 선정
        </Button>
      </Disclosure>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>게임을 초기화할까요?</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-6">
            <p className="text-body-sm text-ink-80">현재 선택과 결과가 모두 초기화됩니다. 다시 시작하시겠습니까?</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="quiet" size="sm" onClick={() => setConfirmReset(false)}>
                취소
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  setConfirmReset(false);
                  await run(resetLadder(view));
                }}
              >
                초기화
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
