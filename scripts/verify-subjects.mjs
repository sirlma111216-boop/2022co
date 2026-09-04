/**
 * 교과별 예시 전수 점검 — `npm run verify:subjects`
 *
 * 화면을 열지 않고 데이터만 본다. 확인하는 것은 네 가지다.
 *  1. 13개 교과가 모두 같은 스키마를 빠짐없이 채웠는가
 *  2. 과학이 아닌 교과 화면에 과학 낱말이 새어 들어가지 않았는가
 *  3. 교과끼리 문장을 복사해 돌려쓰지 않았는가 (같은 문장이 두 교과에 있으면 안 된다)
 *  4. 성취기준 코드를 임의로 지어내지 않았는가 (실제 코드는 과학 하나뿐)
 */
import { SUBJECT_EXAMPLES, SUBJECT_NAME_TO_ID } from "../src/content/subjectExamples.ts";

let failed = 0;
const ok = (cond, label, extra = "") => {
  if (!cond) failed++;
  console.log(`${cond ? "  PASS" : "  FAIL"}  ${label}${extra ? ` — ${extra}` : ""}`);
};

/** 반드시 채워져 있어야 하는 자리 */
const REQUIRED = [
  ["name", (s) => s.name],
  ["unit", (s) => s.unit],
  ["lens", (s) => s.lens],
  ["assessLens", (s) => s.assessLens],
  ["deep.title", (s) => s.deep.title],
  ["deep.shallow", (s) => s.deep.shallow],
  ["deep.deep", (s) => s.deep.deep],
  ["standard.code", (s) => s.standard.code],
  ["standard.notes.k", (s) => s.standard.notes.k],
  ["standard.notes.p", (s) => s.standard.notes.p],
  ["standard.notes.v", (s) => s.standard.notes.v],
  ["standard.reading.therefore", (s) => s.standard.reading.therefore],
  ["standard.dims.k", (s) => s.standard.dims.k],
  ["standard.dims.p", (s) => s.standard.dims.p],
  ["standard.dims.v", (s) => s.standard.dims.v],
  ["standard.placeholder", (s) => s.standard.placeholder],
  ["standard.coreAction", (s) => s.standard.coreAction],
  ["keyIdea.national", (s) => s.keyIdea.national],
  ["keyIdea.narrowed", (s) => s.keyIdea.narrowed],
  ["enduring.simple", (s) => s.enduring.simple],
  ["enduring.understanding", (s) => s.enduring.understanding],
  ["inquiry.factual", (s) => s.inquiry.factual],
  ["inquiry.conceptual", (s) => s.inquiry.conceptual],
  ["inquiry.debatable", (s) => s.inquiry.debatable],
  ["badGood.bad", (s) => s.badGood.bad],
  ["badGood.good", (s) => s.badGood.good],
  ["task.weak", (s) => s.task.weak],
  ["task.ambiguous", (s) => s.task.ambiguous],
  ["task.ambiguousFix", (s) => s.task.ambiguousFix],
  ["task.improved", (s) => s.task.improved],
  ["grasps.g", (s) => s.grasps.g],
  ["grasps.r", (s) => s.grasps.r],
  ["grasps.a", (s) => s.grasps.a],
  ["grasps.s", (s) => s.grasps.s],
  ["grasps.p", (s) => s.grasps.p],
  ["grasps.standards", (s) => s.grasps.standards],
  ["rubric.element", (s) => s.rubric.element],
  ["rubric.high", (s) => s.rubric.high],
  ["rubric.mid", (s) => s.rubric.mid],
  ["rubric.low", (s) => s.rubric.low],
  ["feedback.up", (s) => s.feedback.up],
  ["feedback.back", (s) => s.feedback.back],
  ["feedback.forward", (s) => s.feedback.forward],
  ["redTeam", (s) => s.redTeam],
];

const ARRAYS = [
  ["task.weakWhy", (s) => s.task.weakWhy, 3],
  ["task.ambiguousWhy", (s) => s.task.ambiguousWhy, 3],
  ["elements", (s) => s.elements, 4],
  ["experiences", (s) => s.experiences, 4],
  ["deleteChallenge", (s) => s.deleteChallenge, 3],
  ["standard.segments", (s) => s.standard.segments, 3],
];

/** 과학 화면에서만 나와야 하는 낱말 */
const SCIENCE_WORDS = [
  "알짜힘", "굴절", "광선", "정지거리", "어린이보호구역", "매질", "반사 법칙",
  "빛의 경로", "광합성", "엽록체", "입사각",
];

console.log(`\n[1] 13개 교과가 모두 채워졌는가 (총 ${SUBJECT_EXAMPLES.length}벌)`);
ok(SUBJECT_EXAMPLES.length === 13, `교과 수 ${SUBJECT_EXAMPLES.length}`);
for (const s of SUBJECT_EXAMPLES) {
  const holes = [];
  for (const [path, get] of REQUIRED) {
    const v = get(s);
    if (typeof v !== "string" || v.trim().length < 2) holes.push(path);
  }
  for (const [path, get, min] of ARRAYS) {
    const a = get(s);
    if (!Array.isArray(a) || a.length < min) holes.push(`${path}(${a?.length ?? 0}<${min})`);
  }
  ok(holes.length === 0, `${s.name.padEnd(6)} · ${s.unit}`, holes.slice(0, 3).join(", "));
}

console.log("\n[2] 과학 낱말이 다른 교과 화면에 새어 들어갔는가");
for (const s of SUBJECT_EXAMPLES) {
  if (s.id === "science") continue;
  const blob = JSON.stringify(s);
  const hits = SCIENCE_WORDS.filter((w) => blob.includes(w));
  ok(hits.length === 0, `${s.name.padEnd(6)} 깨끗함`, hits.join(", "));
}

console.log("\n[3] 교과끼리 문장을 돌려쓰지 않았는가");
const seen = new Map();
let dupes = 0;
for (const s of SUBJECT_EXAMPLES) {
  for (const key of ["enduring.understanding", "inquiry.debatable", "task.improved", "grasps.g", "rubric.high"]) {
    const [a, b] = key.split(".");
    const v = s[a][b];
    const prev = seen.get(v);
    if (prev) {
      dupes++;
      console.log(`  FAIL  ${key}: ${prev} 와 ${s.name} 이 같은 문장`);
    }
    seen.set(v, s.name);
  }
}
ok(dupes === 0, `핵심 문장 ${seen.size}개 모두 서로 다름`);

console.log("\n[4] 성취기준 코드를 지어내지 않았는가");
const coded = SUBJECT_EXAMPLES.filter((s) => /\[\d|\[[가-힣]\d/.test(s.standard.code));
ok(
  coded.length === 1 && coded[0].id === "science",
  `코드가 붙은 교과 ${coded.length}개`,
  coded.map((s) => `${s.name}:${s.standard.code}`).join(" / "),
);
const labelled = SUBJECT_EXAMPLES.filter(
  (s) => s.id === "science" || s.standard.code.includes("예시"),
);
ok(labelled.length === 13, "과학 외 12개 모두 「예시」로 표시됨");

console.log("\n[5] 저장된 교과명이 모두 데이터로 이어지는가");
const names = Object.keys(SUBJECT_NAME_TO_ID);
const unmapped = names.filter((n) => !SUBJECT_EXAMPLES.some((s) => s.id === SUBJECT_NAME_TO_ID[n]));
ok(unmapped.length === 0, `교과명 ${names.length}개 매핑 (한문·제2외국어 등 구버전 포함)`, unmapped.join(", "));
ok(SUBJECT_NAME_TO_ID["한문"] === "general", "미지원 교과는 general 로 (과학이 기본값이 아님)");

console.log(failed === 0 ? "\n전부 통과\n" : `\n실패 ${failed}건\n`);
process.exit(failed === 0 ? 0 : 1);
