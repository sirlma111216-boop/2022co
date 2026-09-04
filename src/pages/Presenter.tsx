import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { User } from "firebase/auth";
import { ArrowLeft, LogIn, LogOut, Play, Presentation, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bars } from "@/components/poll/Poll";
import { WallDialog } from "@/components/wall/Wall";
import { TIMELINE } from "@/content/timeline";
import { MUST_SAY } from "@/content/mustSay";
import { AUTOPSY_CASES, ICEBREAK_OPTIONS, QUESTION_JUDGE_OPTIONS } from "@/content/examples";
import { repo } from "@/lib/repo";
import { useSession } from "@/lib/session-context";
import {
  ACTIVITIES_WITH_WALL,
  ACTIVITY_LABEL,
  POLL_AUTOPSY,
  POLL_QUESTION,
  STEPS,
  type ActivityId,
  type Participant,
  type SessionDoc,
  type StepId,
} from "@/lib/types";
import { cn, makeCode, normalizeCode, relativeTime } from "@/lib/utils";

const ACTIVITIES: ActivityId[] = ["p0", "u0", "a1", "m1", "a2", "a3", "a4", "r1", "a5", "a6"];

export default function Presenter() {
  const { setPresentMode, presentMode } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const [code, setCode] = useState("DEMO");
  const [watching, setWatching] = useState<string | null>(null);
  const [session, setSession] = useState<SessionDoc | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [wallOpen, setWallOpen] = useState<ActivityId | null>(null);

  useEffect(() => {
    return repo.watchInstructor((u, ok) => {
      setUser(u);
      setIsInstructor(ok);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!watching) return;
    const a = repo.watchSession(watching, setSession);
    const b = repo.watchParticipants(watching, setParticipants);
    return () => {
      a();
      b();
    };
  }, [watching]);

  const counts = useMemo(() => {
    const total = participants.length;
    const per = Object.fromEntries(
      ACTIVITIES.map((a) => [a, participants.filter((p) => p.progress?.[a]).length]),
    ) as Record<ActivityId, number>;
    return { total, per };
  }, [participants]);

  const polls = session?.pollResults ?? {};

  // 아이스브레이킹은 예전부터 'A'~'D' 키를 그대로 쓰고,
  // 이후 추가된 선택 활동은 `${pollId}_${보기}` 키를 쓴다.
  const icebreakData = ICEBREAK_OPTIONS.map((o) => ({
    key: o.key,
    label: `${o.key}. ${o.label}`,
    value: polls[o.key] ?? 0,
  }));
  const autopsyData = AUTOPSY_CASES.map((c) => ({
    key: c.key,
    label: c.title,
    value: polls[`${POLL_AUTOPSY}_${c.key}`] ?? 0,
  }));
  const questionData = QUESTION_JUDGE_OPTIONS.map((o) => ({
    key: o.key,
    label: `${o.key}. ${o.title}`,
    value: polls[`${POLL_QUESTION}_${o.key}`] ?? 0,
  }));

  if (!authReady) {
    return <Center>불러오는 중…</Center>;
  }

  if (repo.mode === "firestore" && !isInstructor) {
    return (
      <div className="mx-auto max-w-[520px] px-5 py-20">
        <Link to="/" className="inline-flex items-center gap-1.5 text-caption text-action">
          <ArrowLeft className="h-3.5 w-3.5" /> 연수생 화면으로
        </Link>
        <h1 className="mt-6 text-display-md">강사 로그인</h1>
        <p className="mt-3 text-body-sm leading-[1.7] text-ink-80">
          강사 대시보드는 미리 등록된 계정만 사용할 수 있습니다. Google 계정으로 로그인한 뒤,
          Firestore의 <code className="rounded-xs bg-canvas-parchment px-1.5 py-0.5">instructors</code> 컬렉션에
          해당 UID 문서를 만들어 주세요.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => void repo.signInInstructor()}>
            <LogIn className="h-4 w-4" /> Google로 로그인
          </Button>
          {/* 익명 계정(= 연수생으로 입장한 상태)에는 로그아웃을 노출하지 않는다.
              누르면 참가자 신원이 사라져 작성 중이던 설계안과 연결이 끊긴다. */}
          {user && !user.isAnonymous && (
            <Button variant="quiet" onClick={() => void repo.signOutInstructor()}>
              <LogOut className="h-4 w-4" /> 로그아웃
            </Button>
          )}
        </div>

        {/* instructors 에 등록해야 하는 UID는 'Google 계정의 UID'다.
            연수생으로 입장했을 때 생기는 익명 UID를 여기 보여 주면 그것을 등록하게 되고,
            그 문서는 영원히 매칭되지 않는다. 그래서 익명 계정은 UID를 아예 표시하지 않는다. */}
        {user && !user.isAnonymous ? (
          <div className="mt-5 rounded-md bg-canvas-parchment px-4 py-3 text-caption text-ink-80">
            <p>
              현재 로그인: <strong className="font-semibold text-ink">{user.email ?? user.uid}</strong>
            </p>
            <p className="mt-1 text-ink-48">
              아래 UID를 Firestore <code className="rounded-xs bg-canvas px-1">instructors</code> 컬렉션의
              문서 ID로 만들어 주세요.
            </p>
            <code className="mt-2 block select-all break-all rounded-sm bg-canvas px-3 py-2 text-ink">
              {user.uid}
            </code>
          </div>
        ) : (
          <p className="mt-5 rounded-md bg-canvas-parchment px-4 py-3 text-caption text-ink-48">
            아직 Google 계정으로 로그인하지 않았습니다.
            {user?.isAnonymous && " (지금은 연수생으로 입장한 상태입니다.)"}
            <br />
            로그인하면 등록해야 할 UID가 여기에 표시됩니다.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-wide px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center gap-3 border-b border-hairline pb-5">
        <Link to="/" className="inline-flex items-center gap-1.5 text-caption text-action">
          <ArrowLeft className="h-3.5 w-3.5" /> 연수생 화면
        </Link>
        <h1 className="text-tagline">강사 대시보드</h1>
        {repo.mode === "local" && <Badge tone="warn">로컬 모드 — 실시간 집계 없음</Badge>}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            variant={presentMode ? "dark" : "pearl"}
            size="sm"
            onClick={() => setPresentMode(!presentMode)}
          >
            <Presentation className="h-4 w-4" /> 발표 모드 {presentMode ? "끄기" : "켜기"}
          </Button>
          {user && (
            <Button variant="quiet" size="sm" onClick={() => void repo.signOutInstructor()}>
              <LogOut className="h-3.5 w-3.5" /> 로그아웃
            </Button>
          )}
        </div>
      </header>

      {/* 세션 선택 / 생성 */}
      <section className="mt-6 rounded-lg border border-hairline bg-canvas-parchment px-5 py-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40 space-y-1.5">
            <Label htmlFor="code">연수 코드</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="tabular tracking-[0.12em]"
            />
          </div>
          <Button size="sm" onClick={() => setWatching(normalizeCode(code) || "DEMO")}>
            <Play className="h-4 w-4" /> 이 세션 열기
          </Button>
          <Button
            variant="pearl"
            size="sm"
            onClick={async () => {
              const c = makeCode(5);
              setCode(c);
              await repo
                .createSession("2022 개정 교육과정 수업·평가 설계 연수", c, user?.uid ?? "local")
                .catch(() => {});
              setWatching(c);
            }}
          >
            <RefreshCw className="h-4 w-4" /> 새 세션 만들기
          </Button>
          {watching && (
            <p className="ml-auto text-caption text-ink-48">
              참가자에게 안내할 코드 ·{" "}
              <strong className="tabular text-[1.5rem] font-semibold tracking-[0.1em] text-ink">
                {watching}
              </strong>
            </p>
          )}
        </div>
      </section>

      {!watching ? (
        <Center>세션 코드를 입력하고 [이 세션 열기]를 눌러 주세요.</Center>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* 진행 단계 제어 */}
            <Panel title="현재 진행 단계" sub="참가자 화면 상단에 안내 배너가 뜹니다(강제 이동은 아닙니다).">
              <div className="flex flex-wrap gap-2">
                {STEPS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => void repo.setSessionStep(watching, s.id as StepId)}
                    className={cn(
                      "rounded-pill border px-3.5 py-1.5 text-caption transition-transform active:scale-95",
                      session?.currentStep === s.id
                        ? "border-action bg-action text-white"
                        : "border-hairline bg-canvas text-ink-80",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Panel>

            {/* 작성 현황 */}
            <Panel title="활동별 작성 현황" sub={`참여 인원 ${counts.total}명`}>
              <ul className="space-y-3">
                {ACTIVITIES.map((a) => (
                  <li key={a}>
                    <div className="mb-1.5 flex items-baseline gap-3">
                      <span className="flex-1 text-body-sm text-ink-80">{ACTIVITY_LABEL[a]}</span>
                      <span className="tabular text-caption font-semibold text-ink">
                        {counts.per[a]} / {counts.total}
                      </span>
                      {/* START 활동에는 공유 담벼락이 없다 — 빈 창이 열리지 않게 한다 */}
                      {ACTIVITIES_WITH_WALL.includes(a) ? (
                        <button
                          type="button"
                          onClick={() => setWallOpen(a)}
                          className="text-fine text-action"
                        >
                          담벼락 열기
                        </button>
                      ) : (
                        <span className="text-fine text-ink-48">담벼락 없음</span>
                      )}
                    </div>
                    <Progress value={counts.per[a]} max={Math.max(1, counts.total)} />
                  </li>
                ))}
              </ul>
            </Panel>

            {/* 선택 활동 응답 — 연수생 화면에 나오는 순서 그대로 */}
            <Panel
              title="선택 활동 응답"
              sub="연수생 화면 순서대로 · 정답은 표시하지 않습니다"
            >
              <div className="space-y-6">
                <PollBlock
                  step="START"
                  title="수업 부검실"
                  question="가장 먼저 고쳐야 할 수업은?"
                  data={autopsyData}
                />
                <PollBlock
                  step="START"
                  title="아이스브레이킹"
                  question="나는 수업을 어디서부터 만들까?"
                  data={icebreakData}
                />
                <PollBlock
                  step="2교시"
                  title="좋은 질문 판별"
                  question="가장 오래 생각하게 만들 질문은?"
                  data={questionData}
                />
                <PollBlock
                  step="3교시"
                  title="이 수행과제로 충분할까?"
                  question="YES / NOT ENOUGH"
                  data={[
                    { key: "yes", label: "YES · 판단할 수 있다", value: session?.taskPollResults?.yes ?? 0 },
                    {
                      key: "notEnough",
                      label: "NOT ENOUGH · 부족하다",
                      value: session?.taskPollResults?.notEnough ?? 0,
                    },
                  ]}
                />
              </div>
            </Panel>

            {/* 참가자 목록 */}
            <Panel title="참가자" sub="실명은 수집하지 않습니다.">
              {participants.length === 0 ? (
                <p className="text-caption text-ink-48">아직 입장한 참가자가 없습니다.</p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {participants
                    .slice()
                    .sort((a, b) => b.joinedAt - a.joinedAt)
                    .map((p) => (
                      <li
                        key={p.uid}
                        className="flex items-baseline gap-2 rounded-md border border-hairline px-3 py-2"
                      >
                        <span className="text-body-sm text-ink">{p.nickname}</span>
                        <span className="text-fine text-ink-48">
                          {[p.schoolLevel, p.subject].filter(Boolean).join(" · ")}
                        </span>
                        <span className="tabular ml-auto text-fine text-ink-48">
                          {Object.values(p.progress ?? {}).filter(Boolean).length}/6 ·{" "}
                          {relativeTime(p.joinedAt)}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </Panel>
          </div>

          {/* 타임라인 + 진행 팁 */}
          <aside className="space-y-6">
            <Panel title="반드시 짚고 갈 문장" sub="이 여덟 개만은 빼지 마세요">
              <ol className="space-y-4">
                {MUST_SAY.map((m, i) => (
                  <li key={m.id} className="border-l-[3px] border-[#c0392b] pl-3">
                    <p className="flex flex-wrap items-baseline gap-2">
                      <span className="tabular text-fine font-semibold text-[#c0392b]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="rounded-pill bg-canvas-parchment px-2 py-0.5 text-fine text-ink-48">
                        {m.step}
                      </span>
                      <span className="text-fine text-ink-48">{m.where}</span>
                    </p>
                    <p className="mt-1.5 text-caption font-semibold leading-[1.6] text-ink">{m.text}</p>
                    <p className="mt-1 text-fine leading-[1.55] text-ink-48">{m.why}</p>
                  </li>
                ))}
              </ol>
            </Panel>

            <Panel title="150분 타임라인" sub="교수자 진행 팁 포함">
              <div className="space-y-6">
                {TIMELINE.map((p) => (
                  <div key={p.id}>
                    <p className="text-caption font-semibold text-ink">
                      {p.name} · {p.subtitle}
                    </p>
                    <ul className="mt-2 space-y-2.5">
                      {p.slots.map((s, i) => (
                        <li key={i} className="border-l-2 border-hairline pl-3">
                          <p className="tabular text-fine text-ink-48">
                            {s.from}–{s.to}분 · {s.screen}
                          </p>
                          <p className="mt-0.5 text-caption text-ink-80">{s.what}</p>
                          <p className="mt-1 text-fine leading-[1.6] text-action">{s.tip}</p>
                          <Link to={s.path} className="mt-1 inline-block text-fine text-ink-48 underline">
                            화면 열기
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Panel>
          </aside>
        </div>
      )}

      {wallOpen && (
        <WallDialog
          activityId={wallOpen}
          open={!!wallOpen}
          onOpenChange={(v) => !v && setWallOpen(null)}
          moderate
          sessionId={watching ?? undefined}
        />
      )}
    </div>
  );
}

function PollBlock({
  step,
  title,
  question,
  data,
}: {
  step: string;
  title: string;
  question: string;
  data: { key: string; label: string; value: number }[];
}) {
  const total = data.reduce((a, b) => a + b.value, 0);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline gap-2">
        <span className="rounded-pill bg-canvas-parchment px-2 py-0.5 text-fine font-semibold text-ink-48">
          {step}
        </span>
        <span className="text-caption font-semibold text-ink">{title}</span>
        <span className="text-fine text-ink-48">{question}</span>
        {total === 0 && <span className="ml-auto text-fine text-ink-48">아직 응답 없음</span>}
      </div>
      <Bars data={data} />
    </div>
  );
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-hairline bg-canvas">
      <header className="border-b border-hairline px-5 py-3.5">
        <h2 className="text-body-sm font-semibold text-ink">{title}</h2>
        {sub && <p className="mt-0.5 text-fine text-ink-48">{sub}</p>}
      </header>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="py-24 text-center text-caption text-ink-48">{children}</div>;
}
