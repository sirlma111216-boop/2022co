/**
 * 사다리 게임의 「지금 상태」를 한 곳에서 계산한다.
 *
 * 강사 화면과 연수생 화면이 같은 것을 보아야 하므로, 화면마다 따로 판단하지 않고
 * 세션 문서 + 참가자 목록이라는 같은 입력을 같은 함수에 넣는다.
 */
import { buildRungs, ladderRows, pickPresentSlots, traceLadder } from "./ladder";
import { EMPTY_LADDER, type LadderRung, type LadderSlot, type LadderState, type Participant, type SessionDoc } from "./types";

export interface LadderPresenter extends LadderSlot {
  /** 사다리 위에서의 열 (비상 추첨이면 -1) */
  col: number;
}

export interface LadderView {
  state: LadderState;
  round: number;
  status: LadderState["status"];
  /** 이번 라운드에 「사다리에 참여하기」를 누른 사람 */
  joined: Participant[];
  /** 그중 자리까지 고른 사람 */
  seated: Participant[];
  /** 상단 자리 개수 — 참가 신청자 수만큼 만든다 */
  seatCount: number;
  seatOwner: (seat: number) => LadderSlot | null;
  /** 결과 화면의 열 순서 (running 이후에만 채워진다) */
  slots: LadderSlot[];
  rungs: LadderRung[];
  rows: number;
  presentSlots: number[];
  presenters: LadderPresenter[];
  /** 이 사람이 발표자인가 — 아직 결과가 없으면 null */
  outcomeOf: (uid: string) => "present" | "listen" | null;
}

export function deriveLadder(
  session: SessionDoc | null,
  participants: Participant[],
): LadderView {
  const state = session?.ladder ?? EMPTY_LADDER;
  const round = state.round;

  const joined = participants
    .filter((p) => p.ladderRound === round)
    .slice()
    .sort((a, b) => a.joinedAt - b.joinedAt);
  const seated = joined.filter((p) => typeof p.ladderSeat === "number");

  // 자리 수는 참가 신청자 수. 늦게 들어온 사람 때문에 늘기만 하므로
  // 이미 고른 자리 번호가 무효가 되는 일은 없다.
  const seatCount = Math.max(joined.length, ...seated.map((p) => (p.ladderSeat ?? 0) + 1), 0);

  const seatOwner = (seat: number): LadderSlot | null => {
    const p = seated.find((x) => x.ladderSeat === seat);
    return p ? { uid: p.uid, nick: p.nickname } : null;
  };

  const running = state.status === "running";
  const slots = running ? state.slots : [];
  const cols = slots.length;
  const rows = running ? state.rows || ladderRows(cols) : 0;
  const rungs = running && cols >= 2 ? buildRungs(state.seed, cols, rows) : [];
  const presentSlots = running ? state.presentSlots : [];

  let presenters: LadderPresenter[] = [];
  if (running) {
    if (state.emergencyPresenters?.length) {
      presenters = state.emergencyPresenters
        .map((uid) => slots.find((s) => s.uid === uid))
        .filter((s): s is LadderSlot => !!s)
        .map((s) => ({ ...s, col: -1 }));
    } else {
      presenters = slots
        .map((s, i) => ({ ...s, col: i, end: traceLadder(i, rungs, rows) }))
        .filter((s) => presentSlots.includes(s.end))
        .map(({ uid, nick, col }) => ({ uid, nick, col }));
    }
  }

  const presenterIds = new Set(presenters.map((p) => p.uid));
  const outcomeOf = (uid: string): "present" | "listen" | null => {
    if (!running) return null;
    if (!slots.some((s) => s.uid === uid)) return null;
    return presenterIds.has(uid) ? "present" : "listen";
  };

  return {
    state,
    round,
    status: state.status,
    joined,
    seated,
    seatCount,
    seatOwner,
    slots,
    rungs,
    rows,
    presentSlots,
    presenters,
    outcomeOf,
  };
}

/**
 * 강사가 「결과 보기」를 누를 때 만들어지는 단 하나의 사다리.
 * 여기서만 무작위가 개입하고, 그 결과는 곧바로 세션에 저장된다.
 */
export function startLadder(view: LadderView, seed: string): LadderState {
  // 자리를 고른 사람만 열이 된다 — 빈 열이 있으면 발표자가 두 명이 안 나온다
  const slots: LadderSlot[] = view.seated
    .slice()
    .sort((a, b) => (a.ladderSeat ?? 0) - (b.ladderSeat ?? 0))
    .map((p) => ({ uid: p.uid, nick: p.nickname }));
  const cols = slots.length;
  const next: LadderState = {
    ...view.state,
    status: "running",
    seed,
    rows: ladderRows(cols),
    slots,
    presentSlots: pickPresentSlots(seed, cols),
    startedAt: Date.now(),
  };
  // Firestore 는 undefined 를 거부한다 — 키 자체를 지운다
  delete next.emergencyPresenters;
  return next;
}

/** 사다리 그리기에 문제가 생겼을 때만 쓰는 비상 추첨 */
export function emergencyLadder(view: LadderView, seed: string): LadderState {
  const base = startLadder(view, seed);
  const pool = base.slots.slice();
  // 씨앗을 쓰지 않고 그 자리에서 섞는다 — 어차피 결과를 그대로 저장한다
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return { ...base, emergencyPresenters: pool.slice(0, Math.min(2, pool.length)).map((s) => s.uid) };
}

/** 라운드를 하나 올리면 이전 자리·잠금·결과가 전부 무효가 된다 */
export function resetLadder(view: LadderView): LadderState {
  return {
    ...EMPTY_LADDER,
    round: view.round + 1,
  };
}

/** 카운트다운 3 → 2 → 1 → 출발!. 시작 시각만 있으면 어느 화면에서나 같은 숫자가 보인다. */
export function countdownLabel(elapsed: number, countdownMs: number): string {
  const i = Math.floor(elapsed / (countdownMs / 4));
  return ["3", "2", "1", "출발!"][Math.min(3, Math.max(0, i))];
}

export function makeSeed(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
