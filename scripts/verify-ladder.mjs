/**
 * 사다리 계산 검증 — `npm run verify:ladder`
 *
 * 화면 없이 계산만 확인한다. 확인하는 것은 네 가지다.
 *  1. 모든 시작 위치가 서로 다른 하단 칸에 정확히 하나씩 도착하는가 (중복·유실 없음)
 *  2. 같은 층에서 가로줄이 붙어 있지 않은가
 *  3. 발표자가 정확히 두 명인가 (2명 이하 세션은 전원)
 *  4. 저장한 씨앗으로 다시 계산해도 결과가 같은가 (새로고침해도 같은 사다리)
 */
import { buildRungs, ladderRows, pickPresentSlots, traceLadder, verifyLadder } from "../src/lib/ladder.ts";

let failed = 0;
const ok = (cond, label, extra = "") => {
  if (!cond) failed++;
  console.log(`${cond ? "  PASS" : "  FAIL"}  ${label}${extra ? ` — ${extra}` : ""}`);
};

const SIZES = [2, 3, 4, 5, 8, 10, 12, 17, 20, 24, 30];
const SEEDS = Array.from({ length: 40 }, (_, i) => `seed-${i}-${(i * 7919) % 101}`);

console.log("\n[1] 인원별 사다리 정합성 (씨앗 40개씩)");
for (const cols of SIZES) {
  const bad = [];
  for (const seed of SEEDS) {
    const r = verifyLadder(seed, cols);
    if (!r.ok) bad.push(`${seed}: ${r.problems[0]}`);
  }
  ok(bad.length === 0, `${String(cols).padStart(2)}명`, bad[0] ?? "");
}

console.log("\n[2] 발표자 수");
for (const cols of SIZES) {
  const seed = "presenter-count";
  const rows = ladderRows(cols);
  const rungs = buildRungs(seed, cols, rows);
  const present = pickPresentSlots(seed, cols);
  const winners = Array.from({ length: cols }, (_, s) => traceLadder(s, rungs, rows)).filter((e) =>
    present.includes(e),
  );
  ok(winners.length === Math.min(2, cols), `${String(cols).padStart(2)}명 → 발표자 ${winners.length}명`);
}

console.log("\n[3] 같은 씨앗 = 같은 결과 (새로고침 후에도 동일)");
for (const cols of [5, 17, 30]) {
  const seed = "stable-seed-42";
  const rows = ladderRows(cols);
  const a = Array.from({ length: cols }, (_, s) => traceLadder(s, buildRungs(seed, cols, rows), rows));
  const b = Array.from({ length: cols }, (_, s) => traceLadder(s, buildRungs(seed, cols, rows), rows));
  const p1 = pickPresentSlots(seed, cols).join(",");
  const p2 = pickPresentSlots(seed, cols).join(",");
  ok(a.join(",") === b.join(",") && p1 === p2, `${String(cols).padStart(2)}명 재계산 일치`);
}

console.log("\n[4] 다른 씨앗은 다른 사다리 (매번 같은 사람이 걸리지 않는다)");
for (const cols of [8, 17]) {
  const seen = new Set(
    SEEDS.map((seed) => {
      const rows = ladderRows(cols);
      const rungs = buildRungs(seed, cols, rows);
      const present = pickPresentSlots(seed, cols);
      return Array.from({ length: cols }, (_, s) => traceLadder(s, rungs, rows))
        .map((e, s) => (present.includes(e) ? s : null))
        .filter((s) => s !== null)
        .join("-");
    }),
  );
  ok(seen.size > SEEDS.length * 0.5, `${cols}명 · 발표자 조합 ${seen.size}/${SEEDS.length}가지`);
}

console.log("\n[5] 좌우 이동이 실제로 일어나는가 (사다리답게 섞이는가)");
for (const cols of [5, 10, 20]) {
  let moved = 0;
  for (const seed of SEEDS) {
    const rows = ladderRows(cols);
    const rungs = buildRungs(seed, cols, rows);
    moved += Array.from({ length: cols }, (_, s) => traceLadder(s, rungs, rows)).filter(
      (e, s) => e !== s,
    ).length;
  }
  const rate = moved / (SEEDS.length * cols);
  ok(rate > 0.7, `${String(cols).padStart(2)}명 · 자리가 바뀐 비율 ${(rate * 100).toFixed(0)}%`);
}

console.log(failed === 0 ? "\n전부 통과\n" : `\n실패 ${failed}건\n`);
process.exit(failed === 0 ? 0 : 1);
