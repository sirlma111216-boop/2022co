import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 공백을 뺀 실질 글자 수 */
export function countChars(s: string) {
  return s.replace(/\s/g, "").length;
}

export function isFilled(s: string | undefined | null, min = 2) {
  return !!s && countChars(s) >= min;
}

/** "방금", "3분 전" 같은 상대 시간 */
export function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "방금"; // "0분 전"이 나오지 않게 한다
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

/** 6자리 대문자 코드 (혼동 문자 제외) */
export function makeCode(len = 5) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export function normalizeCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s/g, "").slice(0, 12);
}

/** 배열을 무작위로 섞는다 (미니게임 카드 초기 배치) */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  let t: ReturnType<typeof setTimeout> | undefined;
  const wrapped = (...args: A) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
  wrapped.cancel = () => t && clearTimeout(t);
  wrapped.flush = (...args: A) => {
    if (t) clearTimeout(t);
    fn(...args);
  };
  return wrapped;
}

export function safeJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** 한 문장 성찰 → 워드클라우드용 단어 빈도 */
const STOPWORDS = new Set([
  "그리고","하지만","그러나","것을","것이","수업","오늘","연수","때문","정말","조금","다시","가장","우리","저는","제가","많이","보다","위해","통해","대한","있는","있다","한다","된다","했다","해야","같다","같은","이런","저런","그런","좀더","무엇","어떻게","그것","이것",
]);

export function wordFrequency(sentences: string[], limit = 40) {
  const freq = new Map<string, number>();
  for (const s of sentences) {
    const tokens = s
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 2 && !STOPWORDS.has(w));
    for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

/**
 * 받침 여부에 따라 목적격 조사(을/를)를 고른다.
 * 문장 틀에 사용자가 쓴 단어를 끼워 넣을 때 "문장를"처럼 어색해지는 것을 막는다.
 * 한글이 아닌 글자로 끝나면 '를'로 둔다(외래어·숫자에서 대체로 자연스럽다).
 */
export function objectParticle(word: string) {
  const w = word.trim();
  if (!w) return "를";
  const code = w.charCodeAt(w.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return "를";
  return code % 28 === 0 ? "를" : "을";
}
