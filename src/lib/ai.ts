/**
 * AI 동료 점검 — 클라이언트.
 *
 * 브라우저는 절대 생성형 API를 직접 호출하지 않는다. 항상 `/api/ai-review` 서버 함수를 거친다.
 * 서버 함수는 실패해도 HTTP 200 + `{ok:false, message}` 로 응답한다
 * (Cloudflare 엣지가 5xx 본문을 평문으로 덮어써 진짜 원인을 가리기 때문).
 */
import type { AiResponse, AiTask, DesignDoc } from "./types";

const COOLDOWN_MS = 10_000;
const SESSION_LIMIT = 20;
const USAGE_KEY = "bl.ai.usage";

interface Usage {
  count: number;
  lastAt: number;
}

function readUsage(): Usage {
  try {
    return JSON.parse(localStorage.getItem(USAGE_KEY) ?? "") as Usage;
  } catch {
    return { count: 0, lastAt: 0 };
  }
}

function writeUsage(u: Usage) {
  localStorage.setItem(USAGE_KEY, JSON.stringify(u));
}

export function aiUsageLeft() {
  return Math.max(0, SESSION_LIMIT - readUsage().count);
}

/** 지금 호출할 수 있는지. 불가하면 사용자에게 보여줄 한국어 사유를 돌려준다. */
export function aiGate(): { ok: true } | { ok: false; message: string; retryInMs?: number } {
  const u = readUsage();
  if (u.count >= SESSION_LIMIT) {
    return { ok: false, message: `AI 점검은 연수 1회당 ${SESSION_LIMIT}번까지 사용할 수 있습니다.` };
  }
  const wait = COOLDOWN_MS - (Date.now() - u.lastAt);
  if (wait > 0) {
    return { ok: false, message: `잠시만요. ${Math.ceil(wait / 1000)}초 뒤에 다시 눌러 주세요.`, retryInMs: wait };
  }
  return { ok: true };
}

export const AI_TASK_LABEL: Record<AiTask, string> = {
  standard: "성취기준 분석 점검",
  enduring: "영속적 이해 문장 점검",
  inquiry: "탐구질문의 질 점검",
  task: "수행과제와 목표의 정렬 점검",
  align: "설계안 전체 정렬 점검",
};

/** 태스크별로 서버에 보낼 payload를 만든다. 개인정보(닉네임 등)는 절대 담지 않는다. */
export function buildPayload(task: AiTask, d: DesignDoc): Record<string, string> {
  switch (task) {
    case "standard":
      return {
        unit: d.unitName,
        standard: d.achievementStandard,
        knowledge: d.knowledgeUnderstanding,
        process: d.processSkill,
        value: d.valueAttitude,
      };
    case "enduring":
      return {
        unit: d.unitName,
        standard: d.achievementStandard,
        keyIdea: d.keyIdea,
        enduring: d.enduringUnderstanding,
      };
    case "inquiry":
      return {
        standard: d.achievementStandard,
        enduring: d.enduringUnderstanding,
        original: d.inquiryOriginal,
        fact: d.inquiryFact,
        concept: d.inquiryConcept,
        debate: d.inquiryDebate,
      };
    case "task":
      return {
        standard: d.achievementStandard,
        enduring: d.enduringUnderstanding,
        g: d.graspsG,
        r: d.graspsR,
        a: d.graspsA,
        s: d.graspsS,
        p: d.graspsP,
        s2: d.graspsS2,
      };
    case "align":
      return {
        unit: d.unitName,
        standard: d.achievementStandard,
        knowledge: d.knowledgeUnderstanding,
        process: d.processSkill,
        value: d.valueAttitude,
        enduring: d.enduringUnderstanding,
        inquiry: [d.inquiryFact, d.inquiryConcept, d.inquiryDebate].filter(Boolean).join(" / "),
        task: [d.graspsG, d.graspsR, d.graspsA, d.graspsS, d.graspsP, d.graspsS2]
          .filter(Boolean)
          .join(" | "),
        elements: d.assessmentElements
          .filter((e) => e.name.trim())
          .map((e) => `${e.name}(상:${e.high} / 중:${e.mid} / 하:${e.low})`)
          .join(" | "),
        activities: d.learningActivities,
        feedback: [d.feedUp, d.feedBack, d.feedForward].filter(Boolean).join(" / "),
      };
  }
}

/** 이 태스크를 실행할 만큼 초안이 준비되었는가 */
export function taskReady(task: AiTask, d: DesignDoc): boolean {
  const has = (s: string) => s.trim().length >= 5;
  switch (task) {
    case "standard":
      return has(d.achievementStandard) && (has(d.knowledgeUnderstanding) || has(d.processSkill));
    case "enduring":
      return has(d.enduringUnderstanding);
    case "inquiry":
      return has(d.inquiryFact) || has(d.inquiryConcept) || has(d.inquiryDebate);
    case "task":
      return has(d.graspsG) && has(d.graspsP);
    case "align":
      return has(d.achievementStandard) && has(d.enduringUnderstanding);
  }
}

export async function requestAiReview(
  task: AiTask,
  design: DesignDoc,
  subject: string,
  schoolLevel: string,
): Promise<AiResponse> {
  const gate = aiGate();
  if (!gate.ok) return { ok: false, message: gate.message };

  const u = readUsage();
  writeUsage({ count: u.count + 1, lastAt: Date.now() });

  try {
    const res = await fetch("/api/ai-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, subject, schoolLevel, payload: buildPayload(task, design) }),
    });

    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      // 서버 함수가 배포되지 않은 환경(정적 호스팅만)에서는 index.html이 돌아온다.
      return {
        ok: false,
        message:
          "AI 점검 기능이 아직 연결되지 않았습니다. 서버 함수(/api/ai-review) 배포와 환경변수 설정을 확인해 주세요.",
      };
    }
    const parsed = json as Partial<AiResponse> & { message?: string };
    if (parsed && parsed.ok === true) {
      const r = parsed as { good?: string[]; think?: string[]; suggestion?: string; raw?: string };
      return {
        ok: true,
        good: r.good ?? [],
        think: r.think ?? [],
        suggestion: r.suggestion ?? "",
        raw: r.raw ?? "",
      };
    }
    return { ok: false, message: parsed?.message ?? "AI 응답을 이해하지 못했습니다." };
  } catch (e) {
    return {
      ok: false,
      message: `AI 서버에 연결하지 못했습니다. 네트워크를 확인한 뒤 [다시 시도]를 눌러 주세요. (원인: ${String(e).slice(0, 120)})`,
    };
  }
}
