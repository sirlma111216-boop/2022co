/** 연수 진행 단계 */
export type StepId = "join" | "start" | "s1" | "s2" | "s3" | "final" | "reflect";

export const STEPS: { id: StepId; label: string; short: string; path: string }[] = [
  { id: "start", label: "START", short: "START", path: "/start" },
  { id: "s1", label: "1교시 · 교육과정을 읽다", short: "1교시", path: "/s1" },
  { id: "s2", label: "2교시 · 무엇을 남길 것인가", short: "2교시", path: "/s2" },
  { id: "s3", label: "3교시 · 어떻게 확인할 것인가", short: "3교시", path: "/s3" },
  { id: "final", label: "FINAL · 나의 설계안", short: "FINAL", path: "/final" },
];

/** 활동 식별자 — 담벼락·진행률 집계 키 */
export type ActivityId = "a1" | "a2" | "a3" | "a4" | "a5" | "a6";

export const ACTIVITY_LABEL: Record<ActivityId, string> = {
  a1: "성취기준 해부하기",
  a2: "한 문장만 남는다면",
  a3: "질문 업그레이드",
  a4: "나의 수행과제",
  a5: "평가요소와 수행수준",
  a6: "학습 경험 설계",
};

/** 평가요소 1개 + 수행수준 */
export interface AssessmentElement {
  name: string;
  high: string;
  mid: string;
  low: string;
}

/** 연수생이 150분 동안 키워 나가는 단 하나의 문서 */
export interface DesignDoc {
  unitName: string;

  // 1교시
  achievementStandard: string;
  knowledgeUnderstanding: string;
  processSkill: string;
  valueAttitude: string;

  // 2교시
  keyIdea: string;
  enduringUnderstanding: string;
  inquiryOriginal: string;
  inquiryFact: string;
  inquiryConcept: string;
  inquiryDebate: string;

  // 3교시
  graspsG: string;
  graspsR: string;
  graspsA: string;
  graspsS: string;
  graspsP: string;
  graspsS2: string;
  assessmentElements: AssessmentElement[];
  learningActivities: string;
  feedUp: string;
  feedBack: string;
  feedForward: string;

  updatedAt?: number;
}

export type DesignField = Exclude<keyof DesignDoc, "assessmentElements" | "updatedAt">;

export const EMPTY_ELEMENT: AssessmentElement = { name: "", high: "", mid: "", low: "" };

export const EMPTY_DESIGN: DesignDoc = {
  unitName: "",
  achievementStandard: "",
  knowledgeUnderstanding: "",
  processSkill: "",
  valueAttitude: "",
  keyIdea: "",
  enduringUnderstanding: "",
  inquiryOriginal: "",
  inquiryFact: "",
  inquiryConcept: "",
  inquiryDebate: "",
  graspsG: "",
  graspsR: "",
  graspsA: "",
  graspsS: "",
  graspsP: "",
  graspsS2: "",
  assessmentElements: [{ ...EMPTY_ELEMENT }],
  learningActivities: "",
  feedUp: "",
  feedBack: "",
  feedForward: "",
};

export interface Participant {
  uid: string;
  nickname: string;
  subject: string;
  schoolLevel: string;
  joinedAt: number;
  currentStep: StepId;
  progress: Partial<Record<ActivityId, boolean>>;
}

export interface WallComment {
  uid: string;
  nickname: string;
  text: string;
  createdAt: number;
}

export interface Post {
  id: string;
  uid: string;
  nickname: string;
  subject: string;
  schoolLevel: string;
  activityId: ActivityId;
  content: Record<string, string>;
  likes: number;
  likedBy: string[];
  isPinned: boolean;
  comments: WallComment[];
  createdAt: number;
}

export interface Reflection {
  uid: string;
  nickname: string;
  newLearning: string;
  changeToTry: string;
  nextRevision: string;
  oneSentence: string;
  createdAt: number;
}

export type PollKey = "A" | "B" | "C" | "D";
export type TaskPollKey = "yes" | "notEnough";

export interface SessionDoc {
  id: string;
  title: string;
  joinCode: string;
  ownerUid: string;
  createdAt: number;
  currentStep: StepId;
  isActive: boolean;
  pollResults: Record<PollKey, number>;
  taskPollResults: Record<TaskPollKey, number>;
}

export const DEFAULT_POLL: Record<PollKey, number> = { A: 0, B: 0, C: 0, D: 0 };
export const DEFAULT_TASK_POLL: Record<TaskPollKey, number> = { yes: 0, notEnough: 0 };

export const SUBJECTS = [
  "과학",
  "국어",
  "수학",
  "영어",
  "사회",
  "역사",
  "도덕",
  "기술·가정",
  "정보",
  "체육",
  "음악",
  "미술",
  "한문",
  "제2외국어",
  "진로·통합",
  "기타",
] as const;

export const SCHOOL_LEVELS = ["초등학교", "중학교", "고등학교", "기타"] as const;

/** AI 점검 태스크 */
export type AiTask = "standard" | "enduring" | "inquiry" | "task" | "align";

export interface AiResult {
  ok: true;
  good: string[];
  think: string[];
  suggestion: string;
  raw: string;
}

export interface AiError {
  ok: false;
  message: string;
}

export type AiResponse = AiResult | AiError;
