import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Disclosure } from "@/components/ui/disclosure";
import { SectionHeading } from "@/components/teach/elements";
import { Block } from "@/components/teach/Block";
import { MustSay } from "@/components/teach/MustSay";
import { BeforeAfter } from "@/components/activity/RedTeam";
import { FloatingNotes } from "@/components/activity/FloatingNotes";
import { repo } from "@/lib/repo";
import { useSession } from "@/lib/session-context";
import type { Reflection } from "@/lib/types";
import { cn, objectParticle, relativeTime, safeJson } from "@/lib/utils";

const DRAFT = (sid: string) => `bl.reflect.draft.v2.${sid}`;

interface DraftForm {
  newLearning: string;
  changeToTry: string;
  nextRevision: string;
  oneSentence: string;
  stopDoing: string;
  startDoing: string;
  sentA: string;
  sentB: string;
}

const EMPTY_FORM: DraftForm = {
  newLearning: "",
  changeToTry: "",
  nextRevision: "",
  oneSentence: "",
  stopDoing: "",
  startDoing: "",
  sentA: "",
  sentB: "",
};

const DECISIONS = [
  { key: "keep", label: "그대로 유지한다", note: "지금도 이 활동이 목적에 맞다" },
  { key: "repurpose", label: "목적을 바꾸어 사용한다", note: "활동은 두되 무엇을 볼지 바꾼다" },
  { key: "revise", label: "많이 수정한다", note: "형태를 상당히 손봐야 한다" },
  { key: "drop", label: "과감히 뺀다", note: "이번 단원에서는 덜 다룬다" },
];

const OLD_QUESTIONS = [
  { key: "newLearning" as const, label: "오늘 가장 새롭게 이해한 것은 무엇인가요?" },
  { key: "changeToTry" as const, label: "평소 수업을 설계하던 방식에서 바꾸어보고 싶은 것은 무엇인가요?" },
  { key: "nextRevision" as const, label: "오늘 만든 설계안에서 가장 먼저 수정하고 싶은 부분은 무엇인가요?" },
];

export default function Reflect() {
  const { sessionId, uid, profile, mode, design, update } = useSession();
  const [form, setForm] = useState<DraftForm>(EMPTY_FORM);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  // 기본은 자유 서술. 틀은 막힐 때 꺼내 쓰는 보조 장치일 뿐이다.
  const [useTemplate, setUseTemplate] = useState(false);
  const [all, setAll] = useState<Reflection[]>([]);

  useEffect(() => {
    if (!sessionId) return;
    const draft = safeJson<DraftForm | null>(localStorage.getItem(DRAFT(sessionId)), null);
    if (draft) setForm({ ...EMPTY_FORM, ...draft });
    return repo.watchReflections(sessionId, setAll);
  }, [sessionId]);

  const set = (patch: Partial<DraftForm>) => {
    const next = { ...form, ...patch };
    // 문장 틀을 쓰는 동안에는 조각에서 한 문장을 자동으로 만든다.
    if (useTemplate && ("sentA" in patch || "sentB" in patch)) {
      next.oneSentence =
        next.sentA || next.sentB
          ? `오늘 나는 수업 설계에서 ${next.sentA || "○○"}보다 ${next.sentB || "○○"}${objectParticle(next.sentB || "○○")} 먼저 생각해 보려고 한다.`
          : "";
    }
    setForm(next);
    setSaved(false);
    if (sessionId) localStorage.setItem(DRAFT(sessionId), JSON.stringify(next));
  };

  const submit = async () => {
    if (!sessionId || !uid) return;
    setBusy(true);
    await repo
      .saveReflection(sessionId, uid, {
        nickname: profile?.nickname ?? "익명",
        newLearning: form.newLearning,
        changeToTry: form.changeToTry,
        nextRevision: form.nextRevision,
        oneSentence: form.oneSentence,
        stopDoing: form.stopDoing,
        startDoing: form.startDoing,
      })
      .catch(() => {});
    setBusy(false);
    setSaved(true);
  };

  const stops = useMemo(() => all.filter((r) => r.stopDoing?.trim()), [all]);
  const starts = useMemo(() => all.filter((r) => r.startDoing?.trim()), [all]);
  const notes = useMemo(
    () =>
      all
        .filter((r) => r.oneSentence?.trim())
        .sort((a, b) => b.createdAt - a.createdAt)
        // 색은 uid 에서 뽑아 사람마다 고정하되, 화면에는 이름을 쓰지 않는다
        .map((r) => ({
          id: r.uid,
          text: r.oneSentence.trim(),
          nick: r.uid,
          who: `익명 · ${relativeTime(r.createdAt)}`,
        })),
    [all],
  );
  const keyElement = design.assessmentElements[design.keyAssessmentIndex ?? 0];
  const experiences = (design.learningExperiences ?? []).filter((e) => e.what.trim());

  return (
    <>
      {/* ── 히어로 ─────────────────────────────────────────── */}
      <section className="bg-tile-1 py-14 text-white sm:py-[72px]">
        <div className="reading">
          <p className="text-fine font-semibold uppercase tracking-[0.14em] text-white/55">FINAL MISSION</p>
          <h1 className="mt-3 text-[2.25rem] leading-[1.14] tracking-[-0.022em] text-white sm:text-[3rem]">
            처음의 내 수업과 다시 만나기
          </h1>
          <p className="mt-5 max-w-reading text-lead-airy text-white/80">
            150분 전에 적으셨던 그 활동을 다시 꺼냅니다. 지금의 설계 옆에 나란히 놓고, 그 활동을 어떻게 할지
            직접 결정해 보세요.
          </p>
        </div>
      </section>

      {/* ── 그때의 나 vs 지금의 나 ─────────────────────────── */}
      <section className="bg-canvas py-14 sm:py-[72px]">
        <div className="content-w">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-hairline bg-canvas-parchment px-6 py-6">
              <p className="text-fine font-semibold uppercase tracking-[0.08em] text-ink-48">
                연수 시작 때의 나
              </p>
              <dl className="mt-4 space-y-4">
                <Row label="내가 선택한 단원" value={design.unitName} />
                <Row label="가장 공들였던 활동" value={design.initialActivity} strong />
                <Row label="그 활동을 중요하게 생각한 이유" value={design.initialActivityReason} />
              </dl>
            </div>

            <div className="rounded-lg border border-action/40 bg-canvas px-6 py-6">
              <p className="text-fine font-semibold uppercase tracking-[0.08em] text-action">지금의 나</p>
              <dl className="mt-4 space-y-4">
                <Row label="남길 이해" value={design.enduringUnderstanding} strong />
                <Row
                  label="평가 증거 · 수행과제"
                  value={design.performanceTaskAfter?.trim() || design.graspsP || design.graspsG}
                />
                <Row label="가장 중요한 평가요소" value={keyElement?.name ?? ""} />
                <Row
                  label="필요한 학습 경험"
                  value={experiences.map((e) => e.what).join(" / ") || design.learningActivities}
                />
              </dl>
            </div>
          </div>

          {/* RED TEAM 수정 전 → 수정 후 */}
          {(design.performanceTaskBefore?.trim() || design.performanceTaskAfter?.trim()) && (
            <div className="mt-8">
              <p className="mb-3 text-caption font-semibold text-ink-48">
                RED TEAM 이후 · 내 과제는 이렇게 달라졌습니다
              </p>
              <BeforeAfter compact />
            </div>
          )}
        </div>
      </section>

      {/* ── 질문 1 ─────────────────────────────────────────── */}
      <section className="bg-canvas-parchment py-14 sm:py-[72px]">
        <div className="reading">
          <SectionHeading eyebrow="질문 1" title="그 활동, 지금도 그대로 유지하고 싶습니까?" />
          {design.initialActivity?.trim() && (
            <p className="mt-4 rounded-md border border-hairline bg-canvas px-4 py-3 text-body-sm text-ink">
              내가 적었던 활동 · <strong className="font-semibold">{design.initialActivity}</strong>
            </p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {DECISIONS.map((d) => {
              const on = design.finalActivityDecision === d.key;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => update({ finalActivityDecision: d.key })}
                  className={cn(
                    "rounded-lg border px-5 py-4 text-left transition-transform active:scale-[0.98]",
                    on ? "border-action bg-action/[0.06]" : "border-hairline bg-canvas hover:border-ink-48/40",
                  )}
                >
                  <span className="block text-body-sm font-semibold text-ink">{d.label}</span>
                  <span className="mt-1 block text-fine text-ink-48">{d.note}</span>
                </button>
              );
            })}
          </div>

          {design.finalActivityDecision && (
            <div className="appear mt-6 space-y-2">
              <Label htmlFor="decisionReason">왜 그렇게 결정하셨나요?</Label>
              <Textarea
                id="decisionReason"
                rows={2}
                value={design.finalActivityDecisionReason}
                placeholder="한 줄이면 충분합니다."
                onChange={(e) => update({ finalActivityDecisionReason: e.target.value })}
              />
            </div>
          )}

          <Block kind="teacher">
            <p>
              좋은 활동을 버리자는 것이 아닙니다. 무엇을 남길지 먼저 정하고, 그것을 증명할 수 있을 때
              좋은 활동은 더 좋은 수업이 됩니다.
            </p>
          </Block>
        </div>
      </section>

      {/* ── 질문 2·3 STOP / START ──────────────────────────── */}
      <section className="bg-canvas py-14 sm:py-[72px]">
        <div className="reading">
          <SectionHeading eyebrow="질문 2 · 3" title="앞으로 무엇을 덜 하고, 무엇을 먼저 하시겠습니까?" />

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <div className="rounded-lg border-l-[3px] border-bad bg-canvas px-5 py-5">
              <p className="text-fine font-semibold uppercase tracking-[0.1em] text-bad">STOP</p>
              <Label htmlFor="stopDoing" className="mt-2 block">
                앞으로 덜 하고 싶은 것
              </Label>
              <Textarea
                id="stopDoing"
                className="mt-2"
                rows={3}
                value={form.stopDoing}
                placeholder="예: 재미있는 활동부터 찾기"
                onChange={(e) => set({ stopDoing: e.target.value })}
              />
            </div>

            <div className="rounded-lg border-l-[3px] border-action bg-canvas px-5 py-5">
              <p className="text-fine font-semibold uppercase tracking-[0.1em] text-action">START</p>
              <Label htmlFor="startDoing" className="mt-2 block">
                대신 가장 먼저 해보고 싶은 것
              </Label>
              <Textarea
                id="startDoing"
                className="mt-2"
                rows={3}
                value={form.startDoing}
                placeholder="예: 학생에게 남길 한 문장부터 적기"
                onChange={(e) => set({ startDoing: e.target.value })}
              />
            </div>
          </div>

          {/* ── 한 문장 ─────────────────────────────────────── */}
          <div className="mt-8 rounded-lg border border-action/35 bg-canvas px-5 py-5">
            <Label htmlFor="oneSentence">오늘의 연수를 한 문장으로 남긴다면?</Label>
            <p className="mt-1 text-caption text-ink-48">
              정해진 형식은 없습니다. 오늘 느낀 그대로 자유롭게 적어 주세요. 이 문장만 익명으로 함께
              보여집니다. 나머지 답변은 공유되지 않습니다.
            </p>

            <Textarea
              id="oneSentence"
              className="mt-4"
              rows={3}
              value={form.oneSentence}
              onChange={(e) => set({ oneSentence: e.target.value })}
              placeholder="오늘 나에게 남은 생각을 그대로 적어 주세요"
              maxLength={160}
            />

            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <p className="text-fine text-ink-48">{form.oneSentence.length}/160</p>
              <button
                type="button"
                onClick={() => setUseTemplate((v) => !v)}
                className="text-fine text-action underline underline-offset-2"
              >
                {useTemplate ? "문장 틀 접기" : "막막하다면 문장 틀 쓰기"}
              </button>
            </div>

            {/* 틀은 어디까지나 시동을 거는 장치다 — 여기서 만든 문장도 위에서 그대로 고칠 수 있다 */}
            {useTemplate && (
              <div className="mt-4 rounded-lg bg-canvas-parchment px-4 py-4">
                <p className="text-fine text-ink-48">
                  빈칸을 채우면 위 칸에 문장이 만들어집니다. 그대로 두어도 되고, 위에서 마음대로 고쳐
                  써도 됩니다.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-body-sm text-ink">
                  <span>오늘 나는 수업 설계에서</span>
                  <Input
                    aria-label="덜 먼저 생각할 것"
                    value={form.sentA}
                    onChange={(e) => set({ sentA: e.target.value })}
                    placeholder="활동"
                    className="w-[150px] px-3 py-1.5 text-body-sm"
                    maxLength={24}
                  />
                  <span>보다</span>
                  <Input
                    aria-label="먼저 생각할 것"
                    value={form.sentB}
                    onChange={(e) => set({ sentB: e.target.value })}
                    placeholder="남길 한 문장"
                    className="w-[150px] px-3 py-1.5 text-body-sm"
                    maxLength={24}
                  />
                  <span>{objectParticle(form.sentB)} 먼저 생각해 보려고 한다.</span>
                </div>
              </div>
            )}
          </div>

          {/* 기존 성찰 3문항 — 보존하되 선택으로 */}
          <Disclosure className="mt-6" tone="parchment" title="조금 더 돌아보기 (선택)">
            <div className="space-y-5">
              {OLD_QUESTIONS.map((q) => (
                <div key={q.key} className="space-y-2">
                  <Label htmlFor={q.key}>{q.label}</Label>
                  <Textarea
                    id={q.key}
                    rows={2}
                    value={form[q.key]}
                    onChange={(e) => set({ [q.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </Disclosure>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button onClick={submit} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
              {saved ? "제출했습니다" : "성찰 제출하기"}
            </Button>
            <span className="text-fine text-ink-48">
              {mode === "local"
                ? "로컬 모드에서는 내 성찰만 표시됩니다."
                : "제출하면 STOP / START와 한 문장이 익명으로 함께 표시됩니다."}
            </span>
          </div>
        </div>
      </section>

      {/* ── 익명 담벼락 ─────────────────────────────────────── */}
      <section className="bg-canvas-parchment py-14 sm:py-[72px]">
        <div className="content-w">
          <SectionHeading eyebrow="함께 보기" title="우리가 바꾸기로 한 것들" />

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <WallColumn
              tone="stop"
              title="STOP · 앞으로 덜 할 것"
              items={stops.map((r) => ({ id: r.uid, text: r.stopDoing, at: r.createdAt }))}
            />
            <WallColumn
              tone="start"
              title="START · 앞으로 먼저 할 것"
              items={starts.map((r) => ({ id: r.uid, text: r.startDoing, at: r.createdAt }))}
            />
          </div>

          {/*
            남긴 문장은 좌우 여백으로 흘려 보낸다. 넓은 화면에서만 흐르고,
            좁은 화면·인쇄에서는 컴포넌트가 알아서 목록으로 바꾼다.
          */}
          <FloatingNotes notes={notes} excludeId={uid ?? undefined} flatTitle="오늘 우리가 남긴 문장들" />
        </div>
      </section>

      {/* ── 마무리 ─────────────────────────────────────────── */}
      <section className="bg-tile-1 py-14 text-white sm:py-[72px]">
        <div className="reading text-center">
          <p className="pull-quote mx-auto max-w-[32ch] text-white">
            좋은 활동을 버리자는 것이 아닙니다. 무엇을 남길지 먼저 정하고, 그것을 증명할 수 있을 때 좋은
            활동은 더 좋은 수업이 됩니다.
          </p>
        </div>
      </section>

      {/* 강사용 — 위 문장을 반드시 소리 내어 읽게 한다 */}
      <section className="bg-canvas pt-10">
        <div className="reading">
          <MustSay id="closing" className="my-0" />
        </div>
      </section>

      <section className="bg-canvas py-14">
        <div className="reading">
          <Block kind="oneline">
            순서 하나를 바꾼 것뿐이지만, 그 순서가 수업을 바꿉니다.
          </Block>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/final"
              className="inline-flex items-center gap-2 rounded-pill bg-action px-5 py-3 text-body-sm text-white transition-transform active:scale-[0.97]"
            >
              A4 설계안 보기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/s1"
              className="inline-flex items-center gap-2 rounded-pill border border-hairline px-5 py-3 text-body-sm text-ink-80"
            >
              1교시부터 다시 읽기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const v = (value ?? "").trim();
  return (
    <div>
      <dt className="text-fine font-semibold text-ink-48">{label}</dt>
      <dd
        className={cn(
          "mt-1 whitespace-pre-line text-body-sm leading-[1.65]",
          v ? (strong ? "font-semibold text-ink" : "text-ink") : "text-ink-48",
        )}
      >
        {v || "아직 비어 있습니다."}
      </dd>
    </div>
  );
}

function WallColumn({
  tone,
  title,
  items,
}: {
  tone: "stop" | "start";
  title: string;
  items: { id: string; text: string; at: number }[];
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-canvas px-5 py-5",
        tone === "stop" ? "border-bad/35" : "border-action/35",
      )}
    >
      <p
        className={cn(
          "text-fine font-semibold uppercase tracking-[0.08em]",
          tone === "stop" ? "text-bad" : "text-action",
        )}
      >
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-4 text-caption text-ink-48">아직 올라온 문장이 없습니다.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items
            .slice()
            .sort((a, b) => b.at - a.at)
            .slice(0, 30)
            .map((it) => (
              <li
                key={it.id}
                className="rounded-md border border-hairline bg-canvas-parchment px-4 py-3 text-body-sm leading-[1.6] text-ink"
              >
                {it.text}
                <span className="ml-2 text-fine text-ink-48">익명</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
