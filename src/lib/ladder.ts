/**
 * 사다리타기 계산 — 순수 함수만 둔다.
 *
 * 이 파일에는 React도, Firestore도, Math.random()도 없다.
 * 씨앗(seed) 문자열 하나만 같으면 강사 화면과 모든 연수생 화면이
 * 글자 그대로 똑같은 사다리를 그린다. 그것이 이 기능의 전부다.
 */
import type { LadderRung } from "./types";

/* ── 결정적 난수 ─────────────────────────────────────────────────────────── */

/** FNV-1a — 짧은 문자열을 32비트로 접는다 */
function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — 씨앗이 같으면 항상 같은 수열 */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── 사다리 만들기 ───────────────────────────────────────────────────────── */

/**
 * 가로줄 층수. 열이 적으면 그래도 여러 번 움직이도록 넉넉히 주고,
 * 열이 많아지면 화면이 뭉개지지 않게 상한을 둔다.
 */
export function ladderRows(cols: number): number {
  return Math.min(26, Math.max(9, cols * 2));
}

/**
 * 가로줄 배치.
 *
 * 규칙
 *  - 인접한 두 세로선 사이에만 연결한다 (left ↔ left+1).
 *  - 같은 층에서 가로줄이 붙어 있지 않게 한다 → 한 세로선이 같은 높이에서
 *    좌우 양쪽과 동시에 연결되는 일이 없다.
 *  - 한 번도 움직이지 않는 세로선이 남지 않게 마지막에 보정한다.
 */
export function buildRungs(seed: string, cols: number, rows: number): LadderRung[] {
  const out: LadderRung[] = [];
  if (cols < 2 || rows < 1) return out;

  const rand = rng(hash32(`${seed}|rungs|${cols}`));
  // 열이 많을수록 층마다 성기게 — 안 그러면 화면이 빗금으로 보인다
  const density = cols <= 3 ? 0.58 : cols <= 8 ? 0.46 : 0.34;

  const taken: Set<number>[] = Array.from({ length: rows }, () => new Set<number>());
  const place = (row: number, left: number) => {
    taken[row].add(left);
    out.push({ row, left });
  };
  /** 같은 층에서 좌우로 붙지 않는가 */
  const free = (row: number, left: number) =>
    left >= 0 &&
    left <= cols - 2 &&
    !taken[row].has(left) &&
    !taken[row].has(left - 1) &&
    !taken[row].has(left + 1);

  for (let row = 0; row < rows; row++) {
    let i = 0;
    while (i <= cols - 2) {
      if (rand() < density) {
        place(row, i);
        i += 2; // 바로 옆 칸은 비운다
      } else {
        i += 1;
      }
    }
  }

  // 아무 가로줄도 만나지 않는 세로선은 사다리가 아니다 — 최소 한 번은 움직이게 한다
  for (let c = 0; c < cols; c++) {
    const touched = out.some((r) => r.left === c || r.left === c - 1);
    if (touched) continue;
    const want = c === cols - 1 ? c - 1 : c;
    for (let attempt = 0; attempt < rows * 4; attempt++) {
      const row = Math.floor(rand() * rows);
      if (free(row, want)) {
        place(row, want);
        break;
      }
    }
  }

  return out;
}

/** 층 → 그 층의 가로줄 왼쪽 인덱스 집합 */
export function indexRungs(rungs: LadderRung[]): Map<number, Set<number>> {
  const m = new Map<number, Set<number>>();
  for (const r of rungs) {
    let s = m.get(r.row);
    if (!s) m.set(r.row, (s = new Set()));
    s.add(r.left);
  }
  return m;
}

/**
 * 시작 위치에서 내려가며 지나는 열을 층마다 기록한다.
 * 반환 길이는 rows + 1 — 마지막 값이 하단 도착 위치다.
 */
export function tracePath(start: number, rungs: LadderRung[], rows: number): number[] {
  const idx = indexRungs(rungs);
  const path: number[] = [start];
  let col = start;
  for (let row = 0; row < rows; row++) {
    const here = idx.get(row);
    if (here) {
      if (here.has(col)) col += 1;
      else if (here.has(col - 1)) col -= 1;
    }
    path.push(col);
  }
  return path;
}

/** 하단 도착 위치만 필요할 때 */
export function traceLadder(start: number, rungs: LadderRung[], rows: number): number {
  return tracePath(start, rungs, rows)[rows];
}

/**
 * 하단 「발표!」 두 칸.
 * 참가자가 둘뿐이면 두 사람 모두 발표다.
 */
export function pickPresentSlots(seed: string, cols: number): number[] {
  if (cols <= 2) return Array.from({ length: cols }, (_, i) => i);
  const rand = rng(hash32(`${seed}|present|${cols}`));
  const pool = Array.from({ length: cols }, (_, i) => i);
  // Fisher–Yates — 씨앗이 같으면 결과도 같다
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 2).sort((a, b) => a - b);
}

/* ── 개발용 검증 ─────────────────────────────────────────────────────────── */

/**
 * 사다리가 사다리인지 확인한다. 화면과 무관하게 언제든 돌릴 수 있다.
 *  - 모든 시작점이 서로 다른 하단 칸에 정확히 하나씩 도착하는가 (전단사)
 *  - 같은 층에서 가로줄이 붙어 있지 않은가
 *  - 「발표!」에 도착하는 사람이 정확히 두 명인가 (2명 이하 세션은 전원)
 */
export function verifyLadder(seed: string, cols: number): { ok: boolean; problems: string[] } {
  const problems: string[] = [];
  const rows = ladderRows(cols);
  const rungs = buildRungs(seed, cols, rows);

  for (const r of rungs) {
    if (r.left < 0 || r.left > cols - 2) problems.push(`가로줄이 범위를 벗어남 (row ${r.row}, left ${r.left})`);
  }
  for (const [row, set] of indexRungs(rungs)) {
    for (const left of set) {
      if (set.has(left + 1)) problems.push(`같은 층에서 가로줄이 붙음 (row ${row}, left ${left})`);
    }
  }

  const arrived = new Set<number>();
  for (let s = 0; s < cols; s++) {
    const end = traceLadder(s, rungs, rows);
    if (end < 0 || end >= cols) problems.push(`도착 위치가 범위를 벗어남 (start ${s} → ${end})`);
    if (arrived.has(end)) problems.push(`도착 위치가 겹침 (${end})`);
    arrived.add(end);
  }
  if (arrived.size !== cols) problems.push(`도착 칸 수가 맞지 않음 (${arrived.size}/${cols})`);

  const present = pickPresentSlots(seed, cols);
  const expected = Math.min(2, cols);
  if (present.length !== expected) problems.push(`발표 칸 수가 ${present.length}개`);
  const winners = Array.from({ length: cols }, (_, s) => traceLadder(s, rungs, rows)).filter((e) =>
    present.includes(e),
  );
  if (winners.length !== expected) problems.push(`발표자가 ${winners.length}명`);

  return { ok: problems.length === 0, problems };
}
