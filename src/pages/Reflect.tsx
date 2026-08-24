import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SectionHeading } from "@/components/teach/elements";
import { Block } from "@/components/teach/Block";
import { repo } from "@/lib/repo";
import { useSession } from "@/lib/session-context";
import type { Reflection } from "@/lib/types";
import { cn, relativeTime, safeJson, wordFrequency } from "@/lib/utils";

const DRAFT = (sid: string) => `bl.reflect.draft.${sid}`;

const QUESTIONS = [
  {
    key: "newLearning" as const,
    label: "1. 오늘 가장 새롭게 이해한 것은 무엇인가요?",
    placeholder: "예: 성취기준을 도착점으로 읽는다는 말의 의미를 처음으로 알 것 같습니다.",
  },
  {
    key: "changeToTry" as const,
    label: "2. 내가 평소 수업을 설계하던 방식에서 바꾸어보고 싶은 것은 무엇인가요?",
    placeholder: "예: 활동부터 정하지 않고, 이번 단원에서 남길 한 문장을 먼저 적어 보겠습니다.",
  },
  {
    key: "nextRevision" as const,
    label: "3. 오늘 만든 설계안에서 학교로 돌아가 가장 먼저 수정하고 싶은 부분은 무엇인가요?",
    placeholder: "예: 수행과제의 상황이 아직 막연합니다. 실제 자료를 찾아 붙이겠습니다.",
  },
];

export default function Reflect() {
  const { sessionId, uid, profile, mode } = useSession();
  const [form, setForm] = useState({ newLearning: "", changeToTry: "", nextRevision: "", oneSentence: "" });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [all, setAll] = useState<Reflection[]>([]);

  useEffect(() => {
    if (!sessionId) return;
    const draft = safeJson(localStorage.getItem(DRAFT(sessionId)), null as typeof form | null);
    if (draft) setForm(draft);
    return repo.watchReflections(sessionId, setAll);
  }, [sessionId]);

  const set = (k: keyof typeof form, v: string) => {
    const next = { ...form, [k]: v };
    setForm(next);
    setSaved(false);
    if (sessionId) localStorage.setItem(DRAFT(sessionId), JSON.stringify(next));
  };

  const submit = async () => {
    if (!sessionId || !uid) return;
    setBusy(true);
    await repo
      .saveReflection(sessionId, uid, { ...form, nickname: profile?.nickname ?? "익명" })
      .catch(() => {});
    setBusy(false);
    setSaved(true);
  };

  const sentences = useMemo(
    () => all.map((r) => r.oneSentence).filter((s) => s && s.trim().length > 1),
    [all],
  );
  const cloud = useMemo(() => wordFrequency(sentences, 36), [sentences]);
  const maxCount = Math.max(1, ...cloud.map((c) => c.count));

  return (
    <>
      <section className="bg-tile-1 py-14 text-white sm:py-[72px]">
        <div className="reading">
          <p className="text-fine font-semibold uppercase tracking-[0.14em] text-white/55">마지막 성찰</p>
          <h1 className="mt-3 text-[2.25rem] leading-[1.14] tracking-[-0.022em] text-white sm:text-[3rem]">
            수업을 다시 앞에서 바라보다
          </h1>
          <p className="mt-5 max-w-reading text-lead-airy text-white/80">
            설계안 한 장을 만들었습니다. 이제 오늘 무엇이 달라졌는지, 학교에 돌아가 무엇을 먼저 바꿀지
            짧게 적어 봅니다.
          </p>
        </div>
      </section>

      <section className="bg-canvas py-14 sm:py-[72px]">
        <div className="reading">
          <div className="space-y-6">
            {QUESTIONS.map((q) => (
              <div key={q.key} className="space-y-2">
                <Label htmlFor={q.key}>{q.label}</Label>
                <Textarea
                  id={q.key}
                  rows={3}
                  value={form[q.key]}
                  placeholder={q.placeholder}
                  onChange={(e) => set(q.key, e.target.value)}
                />
              </div>
            ))}

            <div className="space-y-2 rounded-lg border border-action/35 bg-canvas px-5 py-5">
              <Label htmlFor="one">오늘의 연수를 한 문장으로 남긴다면?</Label>
              <p className="text-caption text-ink-48">
                이 문장만 익명으로 함께 보여집니다. 나머지 답변은 공유되지 않습니다.
              </p>
              <Input
                id="one"
                value={form.oneSentence}
                onChange={(e) => set("oneSentence", e.target.value)}
                placeholder="예: 활동보다 먼저 정해야 할 것이 있다는 걸 배웠습니다."
                maxLength={80}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={submit} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
                {saved ? "제출했습니다" : "성찰 제출하기"}
              </Button>
              <span className="text-fine text-ink-48">
                {mode === "local"
                  ? "로컬 모드에서는 내 성찰만 표시됩니다."
                  : "제출하면 마지막 문장이 익명으로 함께 표시됩니다."}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 워드클라우드 + 익명 카드 */}
      <section className="bg-canvas-parchment py-14 sm:py-[72px]">
        <div className="content-w">
          <SectionHeading eyebrow="함께 보기" title="오늘 우리가 남긴 문장들" />

          {cloud.length === 0 ? (
            <p className="mt-8 text-body-sm text-ink-48">아직 제출된 문장이 없습니다.</p>
          ) : (
            <>
              <div className="mt-8 flex flex-wrap items-baseline justify-center gap-x-5 gap-y-2 rounded-lg border border-hairline bg-canvas px-6 py-10">
                {cloud.map((w) => {
                  // 제출이 1건뿐이면 모든 단어의 빈도가 같다 — 전부 최대 크기로 튀지 않게 낮춘다.
                  const t = maxCount <= 1 ? 0.3 : w.count / maxCount;
                  return (
                    <span
                      key={w.word}
                      className={cn(
                        "font-display leading-none tracking-[-0.02em]",
                        t > 0.66 ? "text-action" : t > 0.33 ? "text-ink" : "text-ink-48",
                      )}
                      style={{ fontSize: `${0.95 + t * 2.2}rem`, fontWeight: t > 0.5 ? 600 : 400 }}
                      title={`${w.count}회`}
                    >
                      {w.word}
                    </span>
                  );
                })}
              </div>

              <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
                {all
                  .filter((r) => r.oneSentence?.trim())
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((r) => (
                    <blockquote
                      key={r.uid}
                      className="break-inside-avoid rounded-lg border border-hairline bg-canvas px-5 py-4"
                    >
                      <p className="text-body-sm leading-[1.65] text-ink">"{r.oneSentence}"</p>
                      <p className="mt-2 text-fine text-ink-48">익명 · {relativeTime(r.createdAt)}</p>
                    </blockquote>
                  ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="bg-canvas py-14">
        <div className="reading">
          <Block kind="oneline">
            오늘 하신 일은 성취기준에서 출발해 이해와 증거를 정하고, 그다음에 수업을 세운 것입니다.
            순서 하나를 바꾼 것뿐이지만, 그 순서가 수업을 바꿉니다.
          </Block>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/final"
              className="inline-flex items-center gap-2 rounded-pill border border-hairline px-5 py-3 text-body-sm text-ink-80"
            >
              ← 설계안 다시 보기
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
