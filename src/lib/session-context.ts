import { createContext, useContext } from "react";
import type { JoinProfile } from "./repo";
import type {
  ActivityId,
  DesignDoc,
  PollKey,
  SessionDoc,
  StepId,
  TaskPollKey,
} from "./types";
import { EMPTY_DESIGN } from "./types";

export type SaveState = "idle" | "saving" | "saved";

export interface SessionState {
  /** 초기 복구(로컬 캐시 읽기 + 인증)까지 끝났는가 */
  ready: boolean;
  mode: "firestore" | "local";
  sessionId: string | null;
  uid: string | null;
  profile: JoinProfile | null;
  session: SessionDoc | null;
  design: DesignDoc;
  saveState: SaveState;
  /** 발표 모드 — 교수자 진행 팁이 보이고 글자가 커진다 */
  presentMode: boolean;

  joined: boolean;
  join: (code: string, profile: JoinProfile) => Promise<void>;
  leave: () => void;
  update: (patch: Partial<DesignDoc>) => void;
  markProgress: (activityId: ActivityId) => void;
  setStep: (step: StepId) => void;
  setPresentMode: (on: boolean) => void;

  votedPoll: PollKey | null;
  castPoll: (key: PollKey) => Promise<void>;
  votedTask: TaskPollKey | null;
  castTaskPoll: (key: TaskPollKey) => Promise<void>;

  /**
   * 새로 추가된 선택형 활동들(수업 부검실, 좋은 질문 판별 …)의 내 선택.
   * pollId → 고른 보기. 한 번 고르면 바뀌지 않는다.
   */
  votes: Record<string, string>;
  castVote: (pollId: string, option: string) => Promise<void>;
}

export const SessionContext = createContext<SessionState>({
  ready: false,
  mode: "local",
  sessionId: null,
  uid: null,
  profile: null,
  session: null,
  design: EMPTY_DESIGN,
  saveState: "idle",
  presentMode: false,
  joined: false,
  join: async () => {},
  leave: () => {},
  update: () => {},
  markProgress: () => {},
  setStep: () => {},
  setPresentMode: () => {},
  votedPoll: null,
  castPoll: async () => {},
  votedTask: null,
  castTaskPoll: async () => {},
  votes: {},
  castVote: async () => {},
});

export function useSession() {
  return useContext(SessionContext);
}
