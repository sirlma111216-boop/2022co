/**
 * 「지금 이 화면이 어느 교과의 예시를 보여 줘야 하는가」를 한 곳에서 정한다.
 *
 * 두 가지 출처가 있고 우선순위가 다르다.
 *  1. 강의 예시 교과 (강사가 대시보드에서 고른 것) — 이 브라우저에만 저장된다.
 *     프로젝터에 특정 교과 사례를 띄우고 싶을 때 쓴다.
 *  2. 내 교과 (입장할 때 고른 것)
 * 둘 다 없으면 과학이 아니라 general 이다. 교과를 안 고른 사람에게
 * 과학 사례가 기본값으로 튀어나오면 안 된다.
 */
import { useSession } from "./session-context";
import {
  SUBJECT_EXAMPLES,
  SUBJECT_EXAMPLE_MAP,
  SUBJECT_NAME_TO_ID,
  type SubjectExample,
  type SubjectId,
} from "@/content/subjectExamples";

/** 입장 화면에 늘어놓는 교과 — 여기 순서가 곧 버튼 순서다 */
export const SUBJECT_CHOICES: { id: SubjectId; name: string }[] = [
  { id: "korean", name: "국어" },
  { id: "math", name: "수학" },
  { id: "english", name: "영어" },
  { id: "social", name: "사회" },
  { id: "history", name: "역사" },
  { id: "ethics", name: "도덕" },
  { id: "science", name: "과학" },
  { id: "techHome", name: "기술·가정" },
  { id: "information", name: "정보" },
  { id: "pe", name: "체육" },
  { id: "music", name: "음악" },
  { id: "art", name: "미술" },
  { id: "general", name: "기타 교과" },
];

/** 저장된 한글 교과명(또는 id)으로 예시 한 벌을 찾는다. 못 찾으면 general. */
export function getSubjectExample(subject?: string | null): SubjectExample {
  if (!subject) return SUBJECT_EXAMPLE_MAP.general;
  const byId = SUBJECT_EXAMPLE_MAP[subject as SubjectId];
  if (byId) return byId;
  return SUBJECT_EXAMPLE_MAP[SUBJECT_NAME_TO_ID[subject] ?? "general"];
}

export function getSubjectLabel(subject?: string | null): string {
  return getSubjectExample(subject).name;
}

/** 화면에서 쓰는 훅 — 강사의 강의 교과가 있으면 그것이 이긴다 */
export function useSubjectExample(): SubjectExample {
  const { profile, lectureSubject } = useSession();
  return getSubjectExample(lectureSubject || profile?.subject);
}

/** 참고로 곁들일 다른 교과 한 벌 — 늘 과학을 들이밀지 않는다 */
export function otherSubject(mine: SubjectId): SubjectExample {
  return SUBJECT_EXAMPLES.find((s) => s.id !== mine && s.id !== "general") ?? SUBJECT_EXAMPLE_MAP.korean;
}

/**
 * 「다른 교과에서는?」 — 내 교과를 뺀 나머지에서 단순 지식 / 영속적 이해 짝을 뽑는다.
 * 네 개만 보여 준다. 전부 펼치면 비교가 아니라 목록이 된다.
 */
export function OTHER_SUBJECT_PAIRS(mine: SubjectId) {
  return SUBJECT_EXAMPLES.filter((s) => s.id !== mine && s.id !== "general")
    .slice(0, 4)
    .map((s) => ({
      left: s.enduring.simple,
      right: s.enduring.understanding,
      note: `${s.name} · ${s.unit}`,
    }));
}

/**
 * 용어 사전 ③번 칸(예시)을 선택 교과로 바꾼다.
 *
 * 용어 설명 자체(①②④⑤)는 이론이라 교과와 무관하다. 그래서 13벌로 복사하지 않는다.
 * 바꾸는 것은 예시 한 줄뿐이고, 그 재료는 이미 교과 데이터에 다 있다.
 * 여기 없는 용어는 원래의 과학 예시를 그대로 쓴다 — 그때는 라벨이 「예시 (과학)」이다.
 */
export function subjectTermExample(termId: string, ex: SubjectExample): string | null {
  const m: Record<string, () => string> = {
    standard: () => `${ex.standard.code} — ${ex.standard.reading.therefore}`,
    "key-idea": () => `국가 수준: ${ex.keyIdea.national} → 단원 수준으로 좁히면: ${ex.keyIdea.narrowed}`,
    knowledge: () => `${ex.unit} 단원의 지식·이해: ${ex.standard.dims.k}`,
    process: () => `${ex.unit} 단원의 과정·기능: ${ex.standard.dims.p}`,
    value: () => `${ex.unit} 단원의 가치·태도: ${ex.standard.dims.v}`,
    "content-system": () =>
      `「${ex.unit}」 영역의 내용 체계에는 지식·이해 칸에 "${ex.standard.dims.k}", 과정·기능 칸에 "${ex.standard.dims.p}", 가치·태도 칸에 "${ex.standard.dims.v}" 같은 항목이 들어갑니다. 성취기준 문장에 태도가 한 글자도 없어도, 이 표를 보면 단서를 얻습니다.`,
    backward: () =>
      `"${ex.enduring.understanding}"가 남길 이해라면, 증거는 "${ex.task.improved}"가 됩니다. 수업은 그 증거가 나오도록 마지막에 짭니다.`,
    "deep-learning": () => `${ex.deep.title} — ${ex.deep.deep}`,
    transfer: () => `${ex.inquiry.debatable} 처음 보는 이 상황에서도 배운 것을 꺼내 쓸 수 있다면 전이가 일어난 것입니다.`,
    enduring: () => `단순 지식: "${ex.enduring.simple}" → 영속적 이해: "${ex.enduring.understanding}"`,
    inquiry: () =>
      `확인: ${ex.inquiry.factual} / 연결: ${ex.inquiry.conceptual} / 확장·논쟁: ${ex.inquiry.debatable}`,
    evidence: () => `${ex.task.improved} — 이 결과물이 곧 "${ex.enduring.understanding}"를 확인할 증거가 됩니다.`,
    performance: () => `부족한 과제: "${ex.task.weak}" → 고쳐 쓴 과제: "${ex.task.improved}"`,
    grasps: () => `G ${ex.grasps.g} / R ${ex.grasps.r} / A ${ex.grasps.a} / S ${ex.grasps.s} / P ${ex.grasps.p}`,
    element: () => `${ex.name}에서 쓸 만한 평가요소: ${ex.elements.map((e) => e.name).join(" · ")}`,
    rubric: () => `평가요소 「${ex.rubric.element}」 — 상: ${ex.rubric.high} / 중: ${ex.rubric.mid} / 하: ${ex.rubric.low}`,
    alignment: () =>
      `성취기준의 핵심 행동 "${ex.standard.coreAction}"이 수행과제 "${ex.task.improved}" 안에 그대로 들어 있는지 확인합니다.`,
  };
  return m[termId]?.() ?? null;
}
