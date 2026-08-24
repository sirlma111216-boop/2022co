/**
 * AI 동료 점검 — 공용 코어.
 *
 * Cloudflare Pages Functions(`functions/api/ai-review.ts`)와
 * Firebase Cloud Functions(`firebase-functions/src/index.ts`)가 이 파일 하나를 공유한다.
 *
 * ── 반드시 지켜야 하는 것 ────────────────────────────────────────────────
 * 1) 엣지(Cloudflare)에서는 `generativelanguage.googleapis.com`(AI Studio)을 쓰지 않는다.
 *    아웃바운드가 미지원 지역(홍콩 등)을 경유하면
 *    `400 FAILED_PRECONDITION "User location is not supported"`가 간헐적으로 발생하고,
 *    재시도나 결제로는 해결되지 않는다. → Vertex AI(`aiplatform.googleapis.com`)를 쓴다.
 *    Vertex는 GCP 기업용 API라 호출자 위치 검사가 없다. 요청/응답 형식은 AI Studio와 같다.
 * 2) 오류도 HTTP 200 + JSON으로 돌려준다.
 *    함수가 5xx를 던지면 Cloudflare 엣지가 본문을 평문 "error code: 502"로 덮어써
 *    진짜 원인이 보이지 않는다.
 * 3) 모델명을 하드코딩하지 않는다. `GEN_AI_MODEL` 환경변수로 바꿀 수 있게 한다.
 * 4) 키는 서버 전용 환경변수. 클라이언트 번들에 절대 들어가지 않는다(VITE_ 접두사 금지).
 * ─────────────────────────────────────────────────────────────────────────
 */

const DEFAULT_MODEL = "gemini-2.5-flash-lite";

export interface Env {
  GCP_SERVICE_ACCOUNT?: string;
  GEMINI_API_KEY?: string;
  GEN_AI_MODEL?: string;
  GEMINI_MODEL?: string;
  AI_RATE_PER_MIN?: string;
}

export type Task = "standard" | "enduring" | "inquiry" | "task" | "align";

export interface ReviewBody {
  task: Task;
  subject?: string;
  schoolLevel?: string;
  payload?: Record<string, string>;
}

/* ══════════════════════════════════════════════════════════════════════════
   프롬프트
   ══════════════════════════════════════════════════════════════════════════ */

const BASE_SYSTEM = `당신은 2022 개정 교육과정과 백워드 설계에 익숙한 동료 교사입니다.
지금 한 선생님이 자신의 수업·평가 설계 초안을 보여 주며 점검을 부탁했습니다.

지켜야 할 원칙:
- 사용자의 교과와 학교급을 고려해 그 교과의 언어로 말합니다.
- 입력된 성취기준을 임의로 바꾸거나 새로 만들어내지 않습니다. 주어진 문장을 기준으로 판단합니다.
- 활동이 화려한지가 아니라, 목표(남길 이해) - 평가(증거) - 수업이 정렬되는지를 먼저 봅니다.
- 어려운 교육학 용어를 쓰지 않습니다. 꼭 필요하면 한 번 풀어서 설명합니다.
- 정답을 명령하지 않습니다. "이렇게 하세요"가 아니라 "이런 방향도 있습니다"로 제안합니다.
- 선생님의 문장을 존중합니다. 통째로 갈아엎지 말고, 살릴 부분은 살립니다.
- 학생 개인정보나 실명은 다루지 않습니다.

출력 형식(반드시 이 형식만 사용, 다른 머리말·인사말 금지):
GOOD: (좋은 점 한 가지)
GOOD: (좋은 점 한 가지 — 최대 2개)
THINK: (생각해볼 점 한 가지)
THINK: (생각해볼 점 한 가지 — 최대 3개)
SUGGEST: (수정 예시 — 선생님이 그대로 붙여 쓸 수 있는 완성된 문장이나 문단 하나)

각 줄은 2~3문장을 넘기지 않습니다. 한국어로 씁니다.`;

const TASK_SYSTEM: Record<Task, string> = {
  standard: `이번 점검 대상은 「성취기준 해부」입니다.
- 지식·이해 / 과정·기능 / 가치·태도 분류가 입력된 성취기준 문장과 실제로 맞는지 봅니다.
- 지식·이해에 단어만 나열되어 있으면, 개념 사이의 관계를 문장으로 적도록 제안합니다.
- 과정·기능에 '모둠 활동', '발표'처럼 활동 형태가 적혀 있으면, 교과 고유의 사고(예: 모형으로 표현하기)로 바꾸도록 제안합니다.
- 가치·태도가 비어 있는 것은 잘못이 아닙니다. 억지로 채우라고 하지 말고, 내용 체계표에서 가져오는 방법을 알려 줍니다.
- 가치·태도에 '성실성', '협동심'처럼 생활 태도가 적혀 있으면 교과의 태도로 바꾸도록 제안합니다.
SUGGEST에는 세 칸 중 가장 손볼 곳 하나를 골라 고쳐 쓴 문장을 제시합니다.`,

  enduring: `이번 점검 대상은 「영속적 이해(학생에게 남길 한 문장)」입니다.
- 완결된 문장인지 봅니다. 단원명이나 개념어만 적혀 있으면 문장으로 바꾸도록 제안합니다.
- 사실 하나인지, 개념들의 관계를 말하는지 봅니다.
- 이 단원 밖의 다른 상황에도 적용되는 문장인지 봅니다.
- 너무 넓어서(국가 수준 그대로) 이번 단원에서 확인할 수 없는 문장이면 좁히도록 제안합니다.
- 40자 내외로 간결한지도 함께 봅니다.
SUGGEST에는 선생님의 문장을 살리면서 고친 완성 문장 하나만 제시합니다.`,

  inquiry: `이번 점검 대상은 「탐구질문 3단계」입니다.
- 확인 질문 / 연결 질문 / 확장·논쟁 질문이 실제로 서로 다른 단계인지 봅니다.
- 한 단어로 답이 끝나는 질문(정답 맞히기)이 섞여 있으면 지적합니다.
- 확장·논쟁 질문이 약하면 '만약 ~라면?', '~을 정한다면 무엇을 근거로?' 형태를 제안합니다.
- 세 질문이 앞서 정한 영속적 이해와 이어지는지 봅니다.
SUGGEST에는 가장 약한 질문 하나를 골라 고쳐 쓴 질문을 제시합니다.`,

  task: `이번 점검 대상은 「GRASPS 수행과제」입니다.
- 가장 중요한 기준: 배운 개념을 쓰지 않고도 과제가 완성될 수 있는가? 그렇다면 그것을 분명히 지적합니다.
- 맥락(역할·상황)이 화려한 것 자체는 장점이 아닙니다. 이해가 드러나게 하는지로 판단합니다.
- 산출물(P)이 구체적인지(형태·분량), 기준(S)이 평가요소로 이어질 만한지 봅니다.
- 성취기준과 영속적 이해가 이 과제에서 실제로 드러나는지 확인합니다.
SUGGEST에는 과제를 한 단계 낫게 만드는 수정 문장(주로 G나 S 상황)을 제시합니다.`,

  align: `이번 점검 대상은 「설계안 전체의 정렬」입니다.
- 성취기준 → 남길 이해 → 탐구질문 → 수행과제 → 평가요소 → 학습 활동 → 피드백이 한 방향인지 봅니다.
- 끊어진 고리를 구체적으로 하나만 짚습니다(예: "평가요소에 자료 해석이 있는데 학습 활동에 자료를 다루는 장면이 없습니다").
- 평가요소가 성취기준과 무관하거나 4개 이상이면 줄이도록 제안합니다.
- 학습 활동이 증거에서 거꾸로 세워졌는지 봅니다.
SUGGEST에는 가장 먼저 손보면 좋을 한 부분과 그 수정 예시를 제시합니다.`,
};

const FIELD_LABEL: Record<string, string> = {
  unit: "단원",
  standard: "성취기준",
  knowledge: "지식·이해",
  process: "과정·기능",
  value: "가치·태도",
  keyIdea: "단원 수준 핵심 아이디어",
  enduring: "영속적 이해(남길 한 문장)",
  original: "처음 떠오른 질문",
  fact: "확인 질문",
  concept: "연결 질문",
  debate: "확장·논쟁 질문",
  g: "GRASPS · Goal 목표",
  r: "GRASPS · Role 역할",
  a: "GRASPS · Audience 대상",
  s: "GRASPS · Situation 상황",
  p: "GRASPS · Product 산출물",
  s2: "GRASPS · Standards 기준",
  inquiry: "탐구질문",
  task: "수행과제",
  elements: "평가요소와 수행수준",
  activities: "핵심 학습 활동",
  feedback: "피드백(Feed Up / Back / Forward)",
};

function buildPrompt(body: ReviewBody): string {
  const lines: string[] = [];
  lines.push(`교과: ${sanitize(body.subject) || "미기재"}`);
  lines.push(`학교급: ${sanitize(body.schoolLevel) || "미기재"}`);
  lines.push("");
  lines.push("선생님이 작성한 내용:");
  for (const [k, v] of Object.entries(body.payload ?? {})) {
    const text = sanitize(v);
    if (!text) continue;
    lines.push(`- ${FIELD_LABEL[k] ?? k}: ${text}`);
  }
  lines.push("");
  lines.push("위 내용을 지정된 출력 형식으로 점검해 주세요.");
  return lines.join("\n");
}

/** 프롬프트 주입 방지 + 길이 제한 */
function sanitize(v: unknown): string {
  if (typeof v !== "string") return "";
  return (
    v
      // eslint-disable-next-line no-control-regex -- 제어문자를 지우는 것이 이 정규식의 목적이다
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1200)
  );
}

function parseResult(raw: string) {
  const good: string[] = [];
  const think: string[] = [];
  const suggest: string[] = [];
  let mode: "good" | "think" | "suggest" | null = null;

  for (const line of raw.split("\n")) {
    const t = line.trim().replace(/^[-*•]\s*/, "");
    if (!t) continue;
    const m = /^(GOOD|THINK|SUGGEST)\s*[:：]\s*(.*)$/i.exec(t);
    if (m) {
      mode = m[1].toLowerCase() as "good" | "think" | "suggest";
      const rest = m[2].trim();
      if (rest) (mode === "good" ? good : mode === "think" ? think : suggest).push(rest);
      continue;
    }
    if (mode === "suggest") suggest.push(t);
    else if (mode === "good" && good.length) good[good.length - 1] += " " + t;
    else if (mode === "think" && think.length) think[think.length - 1] += " " + t;
  }

  // 형식을 지키지 않은 응답도 버리지 않는다 — 통째로 '생각해볼 점'에 넣는다.
  if (!good.length && !think.length && !suggest.length) {
    return { good: [], think: [raw.trim().slice(0, 1200)], suggestion: "" };
  }
  return { good: good.slice(0, 3), think: think.slice(0, 4), suggestion: suggest.join("\n").trim() };
}

/* ══════════════════════════════════════════════════════════════════════════
   Vertex AI 인증 (서비스 계정 → OAuth 액세스 토큰)
   WebCrypto만 사용하므로 외부 라이브러리가 필요 없다.
   ══════════════════════════════════════════════════════════════════════════ */

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

function base64UrlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToBytes(pem: string): Uint8Array {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function getVertexAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt - 300 > now) return cachedToken.token;

  const enc = new TextEncoder();
  const header = base64UrlEncode(enc.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const claims = base64UrlEncode(
    enc.encode(
      JSON.stringify({
        iss: sa.client_email,
        scope: "https://www.googleapis.com/auth/cloud-platform",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      }),
    ),
  );
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToBytes(sa.private_key).buffer as ArrayBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(`${header}.${claims}`)),
  );
  const jwt = `${header}.${claims}.${base64UrlEncode(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${jwt}`,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI 인증 토큰 발급에 실패했습니다. (${res.status}: ${t.slice(0, 160)})`);
  }
  const json = (await res.json()) as { access_token: string; expires_in?: number };
  cachedToken = { token: json.access_token, expiresAt: now + (json.expires_in ?? 3600) };
  return json.access_token;
}

/* ══════════════════════════════════════════════════════════════════════════
   generateContent 호출 (Vertex / AI Studio 공통 형식)
   ══════════════════════════════════════════════════════════════════════════ */

interface GenerateContentResponse {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
}

function extractText(json: GenerateContentResponse): string {
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  // thinking 계열 모델은 thought:true 파트를 섞어 보낸다 — 걸러내고 text만 합친다.
  return parts
    .filter((p) => p.thought !== true && typeof p.text === "string")
    .map((p) => p.text)
    .join("")
    .trim();
}

async function callGenerateContent(
  url: string,
  headers: Record<string, string>,
  system: string,
  prompt: string,
): Promise<string> {
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 1400 },
  });

  let lastError = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body,
      });
    } catch (e) {
      lastError = `network: ${String(e).slice(0, 160)}`;
      continue; // 네트워크 오류만 1회 재시도
    }
    const text = await res.text();
    if (res.ok) {
      try {
        const out = extractText(JSON.parse(text) as GenerateContentResponse);
        if (out) return out;
        lastError = "AI가 빈 응답을 반환했습니다.";
      } catch {
        lastError = "AI 응답을 해석하지 못했습니다.";
      }
      continue;
    }
    lastError = `HTTP ${res.status}: ${text.slice(0, 220)}`;
    console.error("[ai-review]", lastError);
    if (res.status === 429) {
      throw new Error("지금 AI 사용량이 몰려 잠시 한도에 걸렸습니다. 20~30초 뒤에 [다시 시도]를 눌러 주세요.");
    }
    if (res.status < 500) break; // 4xx는 재시도해도 같다
  }
  // 원인 요약을 메시지에 남긴다 — 이것 덕분에 배포 후 디버깅이 가능해진다. 빼지 말 것.
  throw new Error(`AI 호출에 실패했습니다. 잠시 후 다시 시도해 주세요. (원인: ${lastError.slice(0, 180)})`);
}

async function runAi(env: Env, system: string, prompt: string): Promise<string> {
  const model = (env.GEN_AI_MODEL || env.GEMINI_MODEL || "").trim() || DEFAULT_MODEL;

  const saRaw = env.GCP_SERVICE_ACCOUNT;
  if (saRaw) {
    let sa: ServiceAccount;
    try {
      sa = JSON.parse(saRaw) as ServiceAccount;
    } catch {
      throw new Error("GCP_SERVICE_ACCOUNT 값이 올바른 JSON 형식이 아닙니다.");
    }
    if (!sa.client_email || !sa.private_key || !sa.project_id) {
      throw new Error("GCP_SERVICE_ACCOUNT JSON에 필수 필드(client_email, private_key, project_id)가 없습니다.");
    }
    const token = await getVertexAccessToken(sa);
    const url = `https://aiplatform.googleapis.com/v1/projects/${sa.project_id}/locations/global/publishers/google/models/${model}:generateContent`;
    return callGenerateContent(url, { Authorization: `Bearer ${token}` }, system, prompt);
  }

  // 로컬 개발 전용 폴백. 지원 지역의 고정 IP에서만 안정적으로 동작한다.
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AI 설정이 아직 없습니다. 배포 환경에 GCP_SERVICE_ACCOUNT(권장) 또는 로컬에 GEMINI_API_KEY를 설정해 주세요.",
    );
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  return callGenerateContent(url, { "x-goog-api-key": apiKey }, system, prompt);
}

/* ══════════════════════════════════════════════════════════════════════════
   rate limit (isolate 메모리 기준 — 완벽한 방어가 아니라 사고 방지용)
   ══════════════════════════════════════════════════════════════════════════ */

const hits = new Map<string, number[]>();

function rateLimited(ip: string, perMin: number): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 500) hits.clear();
  return arr.length > perMin;
}

/* ══════════════════════════════════════════════════════════════════════════
   공용 핸들러 — 두 런타임이 이 함수 하나만 호출한다.
   어떤 실패도 예외로 던지지 않고 { ok: false, message } 로 돌려준다.
   ══════════════════════════════════════════════════════════════════════════ */

export type ReviewResult =
  | { ok: true; good: string[]; think: string[]; suggestion: string; raw: string }
  | { ok: false; message: string };

export async function handleReview(body: unknown, env: Env, ip: string): Promise<ReviewResult> {
  try {
    const perMin = Number(env.AI_RATE_PER_MIN ?? "6") || 6;
    if (rateLimited(ip, perMin)) {
      return { ok: false, message: "요청이 조금 빠릅니다. 20초쯤 뒤에 다시 눌러 주세요." };
    }

    const b = (body ?? {}) as ReviewBody;
    if (!b.task || !TASK_SYSTEM[b.task]) {
      return { ok: false, message: "알 수 없는 점검 항목입니다." };
    }
    const filled = Object.values(b.payload ?? {}).filter((v) => typeof v === "string" && v.trim());
    if (filled.length === 0) {
      return { ok: false, message: "먼저 초안을 작성해 주세요. 작성된 내용이 있어야 점검할 수 있습니다." };
    }

    const raw = await runAi(env, `${BASE_SYSTEM}

${TASK_SYSTEM[b.task]}`, buildPrompt(b));
    return { ok: true, ...parseResult(raw), raw };
  } catch (e) {
    const message = e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
    console.error("[ai-review] fatal", message);
    return { ok: false, message };
  }
}
