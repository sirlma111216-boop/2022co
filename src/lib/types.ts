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
export type ActivityId = "p0" | "u0" | "a1" | "m1" | "a2" | "a3" | "a4" | "r1" | "a5" | "a6";

/** 담벼락(공유 카드)이 있는 활동만 — 강사 화면에서 '담벼락 열기'를 이 활동에만 보여 준다 */
export const ACTIVITIES_WITH_WALL: ActivityId[] = ["a1", "m1", "a2", "a3", "a4", "r1", "a5", "a6"];

export const ACTIVITY_LABEL: Record<ActivityId, string> = {
  p0: "수업 부검실",
  u0: "내 수업 기록",
  a1: "성취기준 해부하기",
  m1: "30% 삭제 도전",
  a2: "한 문장만 남는다면",
  a3: "질문 업그레이드",
  a4: "나의 수행과제",
  r1: "RED TEAM 과제 공격",
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

/** 「30% 삭제 도전」에서 쓰는 단원 내용 카드 */
export interface UnitItem {
  id: string;
  text: string;
  /** true면 '이번에는 덜 다루기'로 옮긴 것 */
  dropped: boolean;
}

/** 학습 경험 1개 + 그것이 준비시키는 평가 증거 */
export interface LearningExperience {
  what: string;
  evidence: string;
}

/** RED TEAM 자기 점검 문항 — 하나라도 '그렇다'면 과제에 구멍이 있다 */
export const RED_TEAM_CHECKS: { id: string; question: string; hint: string }[] = [
  {
    id: "search",
    question: "인터넷 검색과 자료 정리만으로 과제를 완성할 수 있는가?",
    hint: "개념을 몰라도 검색으로 채워지는 과제라면, 보이는 것은 검색 능력입니다.",
  },
  {
    id: "presentation",
    question: "발표를 잘하는 학생이 개념 이해가 부족해도 높은 평가를 받을 수 있는가?",
    hint: "말솜씨가 점수를 가르면 개념 이해는 가려집니다.",
  },
  {
    id: "design",
    question: "결과물을 예쁘게 만드는 능력이 점수를 좌우하는가?",
    hint: "꾸미기 실력은 대개 성취기준과 무관합니다.",
  },
  {
    id: "invisible",
    question: "내가 정한 영속적 이해가 결과물 안에서 눈에 보이지 않는가?",
    hint: "남길 이해가 결과물에 드러나지 않으면, 그것을 확인할 방법이 없습니다.",
  },
  {
    id: "noaction",
    question: "성취기준의 핵심 행동을 학생이 하지 않고도 과제가 끝나는가?",
    hint: "1교시에 고른 그 행동(설명한다·표현한다 등)이 과제 안에 없다면 정렬이 깨진 것입니다.",
  },
];

/** 연수생이 150분 동안 키워 나가는 단 하나의 문서 */
export interface DesignDoc {
  unitName: string;

  // START — 수업 부검실 / 오늘 다시 설계할 나의 실제 수업
  autopsyChoice: string; // 'A' | 'B' | 'C' | ''
  autopsyReason: string;
  initialActivity: string; // 이 단원에서 가장 공들여 준비했던 활동
  initialActivityReason: string; // 왜 그 활동을 중요하게 생각했는가

  // 1교시
  achievementStandard: string;
  knowledgeUnderstanding: string;
  processSkill: string;
  valueAttitude: string;
  standardCoreAction: string; // 성취기준이 요구하는 가장 중요한 '행동'

  // 2교시
  keyIdea: string;
  unitItems: UnitItem[]; // 30% 삭제 도전 카드
  retainReason: string; // 끝까지 남긴 이유
  commonThread: string; // 남은 것들에 공통으로 흐르는 하나의 생각
  enduringUnderstanding: string;
  questionJudgeChoice: string; // 좋은 질문 판별 'A'|'B'|'C'|'D'|''
  questionJudgeReason: string;
  keyInquiry: string; // 가장 강한 탐구질문 하나
  inquiryOriginal: string;
  inquiryFact: string;
  inquiryConcept: string;
  inquiryDebate: string;
  backwardPlacement: string; // 'goal'|'evidence'|'activity'|''

  // 3교시
  taskJudgeReason: string; // YES / NOT ENOUGH 판단 이유
  graspsG: string;
  graspsR: string;
  graspsA: string;
  graspsS: string;
  graspsP: string;
  graspsS2: string;
  performanceTaskBefore: string; // RED TEAM 직전의 과제 요약(수정 전)
  redTeamFindings: string[]; // RED_TEAM_CHECKS 중 '그렇다'로 표시한 id
  redTeamComment: string; // 어떤 방식으로 개념 없이 완성될 수 있는가
  performanceTaskAfter: string; // 수정 후 과제
  assessmentElements: AssessmentElement[];
  keyAssessmentIndex: number; // 가장 중요한 평가요소의 위치
  learningExperiences: LearningExperience[];
  learningActivities: string;
  feedUp: string;
  feedBack: string;
  feedForward: string;

  // FINAL MISSION — 처음의 내 수업과 다시 만나기
  finalActivityDecision: string; // 'keep'|'repurpose'|'revise'|'drop'|''
  finalActivityDecisionReason: string;

  updatedAt?: number;
}

/** AutoField 로 바인딩할 수 있는 '문자열' 필드만 추린다 */
export type DesignField = Exclude<
  keyof DesignDoc,
  | "assessmentElements"
  | "updatedAt"
  | "unitItems"
  | "redTeamFindings"
  | "keyAssessmentIndex"
  | "learningExperiences"
>;

export const EMPTY_ELEMENT: AssessmentElement = { name: "", high: "", mid: "", low: "" };

export const EMPTY_DESIGN: DesignDoc = {
  unitName: "",
  autopsyChoice: "",
  autopsyReason: "",
  initialActivity: "",
  initialActivityReason: "",
  achievementStandard: "",
  knowledgeUnderstanding: "",
  processSkill: "",
  valueAttitude: "",
  standardCoreAction: "",
  keyIdea: "",
  unitItems: [],
  retainReason: "",
  commonThread: "",
  enduringUnderstanding: "",
  questionJudgeChoice: "",
  questionJudgeReason: "",
  keyInquiry: "",
  inquiryOriginal: "",
  inquiryFact: "",
  inquiryConcept: "",
  inquiryDebate: "",
  backwardPlacement: "",
  taskJudgeReason: "",
  graspsG: "",
  graspsR: "",
  graspsA: "",
  graspsS: "",
  graspsP: "",
  graspsS2: "",
  performanceTaskBefore: "",
  redTeamFindings: [],
  redTeamComment: "",
  performanceTaskAfter: "",
  assessmentElements: [{ ...EMPTY_ELEMENT }],
  keyAssessmentIndex: 0,
  learningExperiences: [],
  learningActivities: "",
  feedUp: "",
  feedBack: "",
  feedForward: "",
  finalActivityDecision: "",
  finalActivityDecisionReason: "",
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
  /** FINAL MISSION — 앞으로 덜 할 것 / 먼저 할 것 (익명 담벼락에 함께 표시) */
  stopDoing: string;
  startDoing: string;
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
  /**
   * 모든 선택형 활동의 집계를 한 map 안에 담는다.
   * 아이스브레이킹은 'A'~'D', 그 밖의 활동은 `${pollId}_${option}` 키를 쓴다
   * (예: 'autopsy_A', 'question_C'). 이렇게 하면 보안 규칙을 바꾸지 않고도
   * 새 선택 활동을 얼마든지 추가할 수 있다.
   */
  pollResults: Record<string, number>;
  taskPollResults: Record<TaskPollKey, number>;
}

/** 새로 추가된 선택형 활동들 */
export const POLL_AUTOPSY = "autopsy";
export const POLL_QUESTION = "question";

export const DEFAULT_POLL: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
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
  /** AI가 마지막으로 되묻는 질문 — 답 대신 다시 생각하게 만드는 자리 */
  ask: string;
  raw: string;
}

export interface AiError {
  ok: false;
  message: string;
}

export type AiResponse = AiResult | AiError;
