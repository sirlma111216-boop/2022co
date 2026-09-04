import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dices, Loader2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LadderBoard, COUNTDOWN_MS, LADDER_TOTAL_MS } from "./LadderBoard";
import { repo } from "@/lib/repo";
import { countdownLabel, deriveLadder } from "@/lib/ladder-game";
import { useSession } from "@/lib/session-context";
import { LADDER_GAMES } from "@/content/ladderGames";
import type { LadderGameId, Participant } from "@/lib/types";
import { cn } from "@/lib/utils";

/** 결과가 흐르는 동안에만 도는 시계 — 다 끝나면 스스로 멈춘다 */
function useTicker(active: boolean) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => force((n) => n + 1), 200);
    return () => clearInterval(id);
  }, [active]);
}

/**
 * 발표자 뽑기. 연수 중 두 곳(START 수업 부검실 · 2교시 좋은 질문 판별)에
 * 같은 컴포넌트를 gameId 만 바꿔 붙인다. 두 판은 서로를 모른다.
 *
 * 참가자 목록은 모달이 열려 있을 때만 구독한다. 다만 강사가 결과를 열면
 * 모달이 닫혀 있어도 자동으로 열린다 — 연수 현장에서 "다시 눌러 주세요"라고
 * 안내하는 시간이 아깝기 때문이다.
 */
export function LadderGame({ gameId }: { gameId: LadderGameId }) {
  const { sessionId, uid, session, design } = useSession();
  const def = LADDER_GAMES[gameId];
  const [open, setOpen] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [busy, setBusy] = useState(false);
  const [moving, setMoving] = useState(false);
  const [notice, setNotice] = useState("");
  const autoOpened = useRef(0);

  const game = session?.ladders?.[gameId];
  const status = game?.status ?? "seating";
  const round = game?.round ?? 1;
  const startedAt = game?.startedAt ?? 0;

  // 결과가 열리면 저절로 펼쳐 준다 (같은 라운드에 한 번만)
  useEffect(() => {
    if (status === "running" && autoOpened.current !== round) {
      autoOpened.current = round;
      setOpen(true);
    }
  }, [status, round]);

  // 판이 바뀌면 자동 열기 기록도 판별로 새로 센다
  useEffect(() => {
    autoOpened.current = 0;
  }, [gameId]);

  useEffect(() => {
    if (!open || !sessionId) return;
    return repo.watchParticipants(sessionId, setParticipants);
  }, [open, sessionId]);

  const view = useMemo(() => deriveLadder(session, participants, gameId), [session, participants, gameId]);
  const me = view.joined.find((p) => p.uid === uid) ?? null;
  const mine = me?.ladderSeats?.[gameId];
  const mySeat = typeof mine?.seat === "number" ? mine.seat : null;

  const elapsed = startedAt ? Date.now() - startedAt : 0;
  const running = view.status === "running";
  useTicker(open && running && elapsed < LADDER_TOTAL_MS + 400);
  const revealed = running && elapsed >= LADDER_TOTAL_MS;

  const join = useCallback(async () => {
    if (!sessionId || !uid) return;
    setBusy(true);
    setNotice("");
    try {
      await repo.joinLadder(sessionId, uid, gameId, round);
    } catch {
      setNotice("참여 등록에 실패했습니다. 잠시 뒤 다시 눌러 주세요.");
    }
    setBusy(false);
  }, [sessionId, uid, gameId, round]);

  const pickSeat = useCallback(
    async (seat: number) => {
      if (!sessionId || !uid || busy) return;
      setBusy(true);
      setNotice("");
      try {
        const won = await repo.claimLadderSeat(sessionId, uid, gameId, round, seat, mySeat);
        if (!won) setNotice("방금 다른 선생님이 그 자리를 가져갔습니다. 다른 자리를 골라 주세요.");
        else setMoving(false);
      } catch {
        setNotice("자리 예약에 실패했습니다. 다시 시도해 주세요.");
      }
      setBusy(false);
    },
    [sessionId, uid, gameId, round, mySeat, busy],
  );

  const myOutcome = uid ? view.outcomeOf(uid) : null;
  const myPick = def.options.find((c) => c.key === (design[def.choiceField] as string));
  const myReason = (design[def.reasonField] as string) ?? "";

  return (
    <>
      <div className="mt-4">
        <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
          <Dices className="h-4 w-4" aria-hidden />
          사다리타기로 발표자 뽑기
        </Button>
        <p className="mt-2 text-caption text-ink-48">{def.hint}</p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent wide>
          <DialogHeader>
            <DialogTitle>발표자는 누구?</DialogTitle>
            <DialogDescription>
              위에서 내 자리를 하나 골라 주세요. 두 분은 발표, 나머지 선생님은 경청입니다.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto px-6 py-6">
            {/* ── 결과 ─────────────────────────────────────── */}
            {running ? (
              <>
                {elapsed < COUNTDOWN_MS ? (
                  <div className="flex min-h-[220px] items-center justify-center">
                    <p className="text-[4rem] font-semibold leading-none tracking-[-0.03em] text-action">
                      {countdownLabel(elapsed, COUNTDOWN_MS)}
                    </p>
                  </div>
                ) : view.state.emergencyPresenters?.length ? (
                  <p className="rounded-lg bg-canvas-parchment px-5 py-4 text-body-sm text-ink-80">
                    사다리 대신 즉석 추첨으로 두 분을 뽑았습니다.
                  </p>
                ) : view.slots.length < 2 ? (
                  <p className="rounded-lg bg-canvas-parchment px-5 py-4 text-body-sm text-ink-80">
                    발표자를 뽑으려면 두 분 이상 참여해야 합니다.
                  </p>
                ) : (
                  <LadderBoard
                    mode="result"
                    cols={view.slots.length}
                    rows={view.rows}
                    rungs={view.rungs}
                    slots={view.slots}
                    presentSlots={view.presentSlots}
                    myUid={uid}
                    traceStart={startedAt + COUNTDOWN_MS}
                  />
                )}

                {revealed && view.presenters.length > 0 && (
                  <div className="mt-7 rounded-lg border border-action/35 bg-canvas px-5 py-6 text-center sm:px-8">
                    <p className="flex items-center justify-center gap-2 text-caption font-semibold text-action">
                      <Mic className="h-4 w-4" aria-hidden />
                      오늘 의견을 들려주실 두 분은
                    </p>
                    <p className="mt-3 text-[1.6rem] font-semibold leading-[1.35] tracking-[-0.018em] text-ink sm:text-[2rem]">
                      {view.presenters.map((p) => p.nick).join(" · ")}
                    </p>
                    <p className="mt-2 text-body-sm text-ink-80">입니다!</p>

                    {myOutcome === "present" ? (
                      <div className="mt-6 rounded-lg bg-action/8 px-5 py-5 text-left">
                        <p className="text-body-sm font-semibold text-action">🎤 발표자로 선정되셨습니다!</p>
                        <div className="mt-3 space-y-2 text-body-sm text-ink">
                          <p>
                            <span className="text-caption text-ink-48">{def.choiceLabel} · </span>
                            {myPick ? myPick.title : "아직 고르지 않았습니다"}
                          </p>
                          <p className="whitespace-pre-wrap">
                            <span className="text-caption text-ink-48">내가 적은 이유 · </span>
                            {myReason.trim() || "적어 두신 이유가 없습니다"}
                          </p>
                        </div>
                        <p className="mt-3 text-caption text-ink-48">
                          이 내용을 중심으로 짧게 이야기해 주세요.
                        </p>
                      </div>
                    ) : (
                      <p className="mt-6 text-body-sm text-ink-80">
                        오늘은 경청! 두 분의 생각을 들어봅니다.
                      </p>
                    )}

                    <p className="mt-6 text-caption text-ink-48">
                      {def.askLine}
                    </p>
                  </div>
                )}

                {revealed && !view.slots.some((s) => s.uid === uid) && (
                  <p className="mt-5 rounded-md bg-canvas-parchment px-4 py-3 text-caption text-ink-80">
                    이번 사다리는 이미 시작되었습니다. 결과를 함께 확인해 주세요.
                  </p>
                )}
              </>
            ) : !me ? (
              /* ── 아직 참여 전 ─────────────────────────── */
              <div className="py-6 text-center">
                <p className="text-body text-ink-80">
                  지금 <strong className="font-semibold text-ink">{view.joined.length}명</strong>이 참여 중입니다.
                </p>
                <Button className="mt-5" size="lg" onClick={join} disabled={busy || view.status === "locked"}>
                  {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  사다리에 참여하기
                </Button>
                {view.status === "locked" && (
                  <p className="mt-3 text-caption text-ink-48">자리 선택이 마감되었습니다.</p>
                )}
              </div>
            ) : (
              /* ── 자리 고르기 ──────────────────────────── */
              <>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-body-sm text-ink-80">
                    현재 <strong className="font-semibold text-ink">{view.joined.length}명</strong> 참여 중 ·{" "}
                    <strong className="font-semibold text-ink">{view.seated.length}명</strong> 자리 선택 완료
                  </p>
                  {mySeat !== null && view.status === "seating" && (
                    <button
                      type="button"
                      onClick={() => setMoving((v) => !v)}
                      className="text-fine text-action underline underline-offset-2"
                    >
                      {moving ? "자리 바꾸기 취소" : "자리 바꾸기"}
                    </button>
                  )}
                </div>

                <p className="mb-4 text-body-sm text-ink">
                  {view.status === "locked"
                    ? "게임이 시작되어 자리를 변경할 수 없습니다."
                    : mySeat === null
                      ? "마음에 드는 자리를 골라 주세요."
                      : moving
                        ? "옮길 자리를 골라 주세요. 지금 자리는 자동으로 풀립니다."
                        : `내 자리 · ${mySeat + 1}번`}
                </p>

                <LadderBoard
                  mode="seating"
                  cols={Math.max(view.seatCount, 1)}
                  rows={9}
                  rungs={[]}
                  seatOwner={view.seatOwner}
                  myUid={uid}
                  onPickSeat={pickSeat}
                  disabledSeats={busy || view.status === "locked" || (mySeat !== null && !moving)}
                />

                {view.joined.length < 2 && (
                  <p className="mt-4 rounded-md bg-canvas-parchment px-4 py-3 text-caption text-ink-80">
                    발표자를 뽑으려면 두 분 이상 참여해야 합니다.
                  </p>
                )}
              </>
            )}

            {notice && (
              <p className={cn("mt-4 rounded-md bg-[#fdf4e3] px-4 py-3 text-caption text-warn")}>{notice}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
