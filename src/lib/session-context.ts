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
  /**
   * 설계안 갱신.
   * 배열처럼 「이전 값을 읽어 새 값을 만드는」 갱신은 반드시 함수형으로 넘긴다.
   * 객체를 넘기면 렌더 시점의 값을 기준으로 계산하게 되어, 같은 틱에 두 번 갱신하면
   * 앞의 변경이 덮여 사라진다(칩을 빠르게 두 번 누르면 하나만 들어가던 문제).
   */
  update: (patch: Partial<DesignDoc> | ((prev: DesignDoc) => Partial<DesignDoc>)) => void;
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

  /**
   * 강사 전용 「강의 예시 교과」. 값이 있으면 이 브라우저의 모든 예시가 그 교과로 보인다.
   * 이 브라우저에만 저장되므로 연수생 화면에는 영향이 없다.
   */
  lectureSubject: string;
  setLectureSubject: (subject: string) => void;
  /** 교과만 바꾼다 — 작성한 내용은 건드리지 않는다 */
  setSubject: (subject: string) => Promise<void>;
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
  lectureSubject: "",
  setLectureSubject: () => {},
  setSubject: async () => {},
});

export function useSession() {
  return useContext(SessionContext);
}
