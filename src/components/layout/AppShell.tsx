import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, Cloud, CloudOff, Loader2, Monitor, Presentation } from "lucide-react";
import { useSession } from "@/lib/session-context";
import { STEPS, type StepId } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const bare = pathname.startsWith("/present") || pathname.startsWith("/presenter");

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      {!bare && <GlobalNav />}
      {!bare && <StepNav />}
      {!bare && <InstructorBanner />}
      <main className="flex-1">{children}</main>
      {!bare && <SiteFooter />}
    </div>
  );
}

function GlobalNav() {
  const { profile, mode, presentMode, setPresentMode } = useSession();
  return (
    <div className="sticky top-0 z-40 h-11 bg-black text-white no-print">
      <div className="mx-auto flex h-full max-w-wide items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="text-fine font-semibold tracking-[-0.01em] text-white">
          거꾸로 설계 연수실
        </Link>
        <span className="hidden text-fine text-white/45 sm:inline">
          2022 개정 교육과정 · 수업과 평가를 함께 설계하기
        </span>

        <div className="ml-auto flex items-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 text-fine text-white/55"
            title={mode === "firestore" ? "실시간 공유 연결됨" : "로컬 저장 모드 (이 기기에만 저장)"}
          >
            {mode === "firestore" ? <Cloud className="h-3.5 w-3.5" /> : <CloudOff className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{mode === "firestore" ? "실시간 공유" : "로컬 저장"}</span>
          </span>

          <button
            type="button"
            onClick={() => setPresentMode(!presentMode)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-fine transition-transform active:scale-95",
              presentMode ? "bg-white text-ink" : "bg-white/10 text-white/80 hover:bg-white/20",
            )}
            title="발표 모드: 글자가 커지고 교수자 진행 팁이 보입니다"
          >
            <Presentation className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">발표 모드</span>
          </button>

          <Link
            to="/presenter"
            className="inline-flex items-center gap-1.5 rounded-sm bg-white/10 px-2.5 py-1 text-fine text-white/80 transition-transform hover:bg-white/20 active:scale-95"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">강사</span>
          </Link>

          {profile && <span className="text-fine text-white/70">{profile.nickname}</span>}
        </div>
      </div>
    </div>
  );
}

function StepNav() {
  const { pathname } = useLocation();
  // /reflect 는 FINAL 의 연장이다 — 별도 스텝을 만들지 않고 FINAL 을 켜 둔다.
  const current =
    pathname.startsWith("/reflect")
      ? "final"
      : (STEPS.find((s) => pathname.startsWith(s.path))?.id ?? "start");
  const idx = STEPS.findIndex((s) => s.id === current);

  return (
    <nav className="sticky top-11 z-30 border-b border-hairline bg-canvas-parchment/85 backdrop-blur-[20px] backdrop-saturate-150 no-print">
      <div className="mx-auto flex max-w-wide items-center gap-1 overflow-x-auto px-4 py-2.5 sm:gap-2 sm:px-6">
        {STEPS.map((s, i) => {
          const active = s.id === current;
          const done = i < idx;
          return (
            <Link
              key={s.id}
              to={s.path}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-pill px-3 py-1.5 text-caption transition-transform active:scale-95",
                active ? "bg-action text-white" : done ? "text-ink-80" : "text-ink-48",
              )}
            >
              {done && <Check className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.short}</span>
            </Link>
          );
        })}
        <div className="ml-auto shrink-0 pl-3">
          <SaveIndicator />
        </div>
      </div>
    </nav>
  );
}

export function SaveIndicator() {
  const { saveState } = useSession();
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (saveState === "saving") setLabel("저장 중…");
    if (saveState === "saved") {
      setLabel("저장됨");
      const t = setTimeout(() => setLabel(""), 2200);
      return () => clearTimeout(t);
    }
  }, [saveState]);

  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-fine text-ink-48">
      {saveState === "saving" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
      {label}
    </span>
  );
}

/**
 * 강사가 단계를 옮기면 참가자 화면 위에 조용히 안내한다(강제 이동은 하지 않는다).
 * 접속 시점의 단계는 안내하지 않는다 — 페이지를 열 때마다 배너가 뜨면 잔소리가 된다.
 */
function InstructorBanner() {
  const { session } = useSession();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState<StepId | null>(null);
  const baseline = useRef<StepId | null>(null);

  const target = session?.currentStep ?? null;

  useEffect(() => {
    if (target && baseline.current === null) baseline.current = target;
  }, [target]);

  const targetStep = STEPS.find((s) => s.id === target);
  const onTarget = !!targetStep && pathname.startsWith(targetStep.path);
  const isInitial = baseline.current === null || baseline.current === target;

  if (!targetStep || onTarget || isInitial || dismissed === target) return null;

  return (
    <div className="border-b border-hairline bg-action/[0.06] no-print">
      <div className="mx-auto flex max-w-wide flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
        <p className="flex-1 text-caption text-ink-80">
          강사가 <strong className="font-semibold text-ink">{targetStep.label}</strong> 로 이동했습니다.
        </p>
        <button
          type="button"
          onClick={() => navigate(targetStep.path)}
          className="rounded-pill bg-action px-3.5 py-1.5 text-fine font-semibold text-white transition-transform active:scale-95"
        >
          따라가기
        </button>
        <button
          type="button"
          onClick={() => setDismissed(target ?? null)}
          className="text-fine text-ink-48"
        >
          계속 보기
        </button>
      </div>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-hairline bg-canvas-parchment no-print">
      <div className="mx-auto max-w-wide px-4 py-10 sm:px-6">
        <p className="text-caption font-semibold text-ink">거꾸로 설계 연수실</p>
        <p className="mt-1.5 max-w-reading text-fine leading-[1.7] text-ink-48">
          2022 개정 교육과정 기반 수업·평가 설계 교사 연수용 웹앱입니다. 실명·학교명 등 개인정보를 수집하지
          않으며, 작성하신 설계안은 연수 세션 안에서만 공유됩니다.
        </p>
        <p className="mt-4 text-fine text-ink-48">
          성취기준 → 이해 → 질문 → 평가 → 수업 → 피드백
        </p>
      </div>
    </footer>
  );
}
