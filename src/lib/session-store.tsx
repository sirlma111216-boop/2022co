import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { repo, type JoinProfile } from "./repo";
import { SessionContext, type SaveState, type SessionState } from "./session-context";
import {
  EMPTY_DESIGN,
  type ActivityId,
  type DesignDoc,
  type PollKey,
  type SessionDoc,
  type StepId,
  type TaskPollKey,
} from "./types";
import { safeJson } from "./utils";

const CACHE_KEY = "bl.cache.v1";
const DESIGN_MIRROR = (sid: string, uid: string) => `bl.mirror.${sid}.${uid}`;
const POLL_KEY = (sid: string) => `bl.voted.poll.${sid}`;
const TASK_POLL_KEY = (sid: string) => `bl.voted.task.${sid}`;
const VOTES_KEY = (sid: string) => `bl.votes.${sid}`;

interface Cache {
  sessionId: string | null;
  uid: string | null;
  profile: JoinProfile | null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<JoinProfile | null>(null);
  const [session, setSession] = useState<SessionDoc | null>(null);
  const [design, setDesign] = useState<DesignDoc>({ ...EMPTY_DESIGN });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [presentMode, setPresentModeState] = useState(false);
  const [votedPoll, setVotedPoll] = useState<PollKey | null>(null);
  const [votedTask, setVotedTask] = useState<TaskPollKey | null>(null);
  const [votes, setVotes] = useState<Record<string, string>>({});

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<Partial<DesignDoc>>({});

  /* ── 최초 복구: 로컬 캐시 → (있으면) 원격 설계안 로드 ─────────────────── */
  useEffect(() => {
    let alive = true;
    (async () => {
      const cache = safeJson<Cache>(localStorage.getItem(CACHE_KEY), {
        sessionId: null,
        uid: null,
        profile: null,
      });
      if (!cache.sessionId || !cache.profile) {
        if (alive) setReady(true);
        return;
      }
      try {
        // 익명 인증은 매 세션 새 uid가 나올 수 있으므로 캐시 uid를 우선 신뢰한다.
        const freshUid = await repo.signInParticipant().catch(() => cache.uid);
        const finalUid = cache.uid ?? freshUid ?? null;
        if (!alive) return;
        setSessionId(cache.sessionId);
        setUid(finalUid);
        setProfile(cache.profile);

        const mirror = finalUid
          ? safeJson<DesignDoc | null>(localStorage.getItem(DESIGN_MIRROR(cache.sessionId, finalUid)), null)
          : null;
        if (mirror && alive) setDesign({ ...EMPTY_DESIGN, ...mirror });

        if (finalUid) {
          const remote = await repo.loadDesign(cache.sessionId, finalUid).catch(() => null);
          if (remote && alive) {
            const remoteAt = remote.updatedAt ?? 0;
            const localAt = mirror?.updatedAt ?? 0;
            setDesign({ ...EMPTY_DESIGN, ...(remoteAt >= localAt ? remote : mirror ?? remote) });
          }
        }
        setVotedPoll(localStorage.getItem(POLL_KEY(cache.sessionId)) as PollKey | null);
        setVotedTask(localStorage.getItem(TASK_POLL_KEY(cache.sessionId)) as TaskPollKey | null);
        setVotes(safeJson<Record<string, string>>(localStorage.getItem(VOTES_KEY(cache.sessionId)), {}));
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* ── 세션 문서 구독 (강사의 단계 이동, 투표 집계) ─────────────────────── */
  useEffect(() => {
    if (!sessionId) return;
    return repo.watchSession(sessionId, setSession);
  }, [sessionId]);

  /* ── 발표 모드일 때 글자 확대 ─────────────────────────────────────────── */
  useEffect(() => {
    document.documentElement.style.setProperty("--reading-scale", presentMode ? "1.28" : "1");
  }, [presentMode]);

  const flush = useCallback(async () => {
    if (!sessionId || !uid) return;
    const patch = pending.current;
    pending.current = {};
    if (Object.keys(patch).length === 0) return;
    setSaveState("saving");
    try {
      await repo.saveDesign(sessionId, uid, patch);
      setSaveState("saved");
    } catch {
      // 원격 저장이 실패해도 로컬 미러는 남는다 → 연수가 멈추지 않는다.
      setSaveState("saved");
    }
  }, [sessionId, uid]);

  const update = useCallback(
    (patchOrFn: Partial<DesignDoc> | ((prev: DesignDoc) => Partial<DesignDoc>)) => {
      setDesign((prev) => {
        // 함수형 갱신은 항상 '최신' prev 를 받는다 → 같은 틱에 두 번 눌러도 앞의 변경이 살아남는다.
        const patch = typeof patchOrFn === "function" ? patchOrFn(prev) : patchOrFn;
        const next = { ...prev, ...patch, updatedAt: Date.now() };
        if (sessionId && uid) {
          localStorage.setItem(DESIGN_MIRROR(sessionId, uid), JSON.stringify(next));
        }
        // 같은 patch 로 두 번 병합해도 결과가 같으므로 StrictMode 이중 호출에도 안전하다.
        pending.current = { ...pending.current, ...patch };
        return next;
      });
      setSaveState("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void flush(), 700);
    },
    [flush, sessionId, uid],
  );

  // 페이지를 떠날 때 남은 변경을 즉시 밀어 넣는다.
  useEffect(() => {
    const onHide = () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      void flush();
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [flush]);

  const join = useCallback(async (code: string, p: JoinProfile) => {
    const { sessionId: sid, uid: newUid } = await repo.joinSession(code, p);
    setSessionId(sid);
    setUid(newUid);
    setProfile(p);
    localStorage.setItem(CACHE_KEY, JSON.stringify({ sessionId: sid, uid: newUid, profile: p }));

    const mirror = safeJson<DesignDoc | null>(localStorage.getItem(DESIGN_MIRROR(sid, newUid)), null);
    const remote = await repo.loadDesign(sid, newUid).catch(() => null);
    setDesign({ ...EMPTY_DESIGN, ...(remote ?? mirror ?? {}) });
    setVotedPoll(localStorage.getItem(POLL_KEY(sid)) as PollKey | null);
    setVotedTask(localStorage.getItem(TASK_POLL_KEY(sid)) as TaskPollKey | null);
    setVotes(safeJson<Record<string, string>>(localStorage.getItem(VOTES_KEY(sid)), {}));
  }, []);

  const leave = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setSessionId(null);
    setUid(null);
    setProfile(null);
    setSession(null);
    setDesign({ ...EMPTY_DESIGN });
  }, []);

  const markProgress = useCallback(
    (activityId: ActivityId) => {
      if (!sessionId || !uid) return;
      void repo.markProgress(sessionId, uid, activityId).catch(() => {});
    },
    [sessionId, uid],
  );

  const setStep = useCallback(
    (step: StepId) => {
      if (!sessionId || !uid) return;
      void repo.setParticipantStep(sessionId, uid, step).catch(() => {});
    },
    [sessionId, uid],
  );

  const castPoll = useCallback(
    async (key: PollKey) => {
      // 선택은 언제든 바꿀 수 있다. 집계는 이전 칸에서 새 칸으로 옮긴다.
      if (!sessionId || votedPoll === key) return;
      const prev = votedPoll ?? undefined;
      setVotedPoll(key);
      localStorage.setItem(POLL_KEY(sessionId), key);
      await repo.vote(sessionId, key, prev).catch(() => {});
    },
    [sessionId, votedPoll],
  );

  const castTaskPoll = useCallback(
    async (key: TaskPollKey) => {
      if (!sessionId || votedTask === key) return;
      const prev = votedTask ?? undefined;
      setVotedTask(key);
      localStorage.setItem(TASK_POLL_KEY(sessionId), key);
      await repo.voteTask(sessionId, key, prev).catch(() => {});
    },
    [sessionId, votedTask],
  );

  /**
   * 새 선택형 활동 공통 투표.
   * 집계는 기존 pollResults map 안에 `${pollId}_${option}` 키로 쌓는다 —
   * 이렇게 하면 Firestore 보안 규칙을 손대지 않고도 활동을 늘릴 수 있다.
   */
  const castVote = useCallback(
    async (pollId: string, option: string) => {
      if (!sessionId || votes[pollId] === option) return;
      const prev = votes[pollId];
      const next = { ...votes, [pollId]: option };
      setVotes(next);
      localStorage.setItem(VOTES_KEY(sessionId), JSON.stringify(next));
      await repo
        .vote(sessionId, `${pollId}_${option}`, prev ? `${pollId}_${prev}` : undefined)
        .catch(() => {});
    },
    [sessionId, votes],
  );

  const value = useMemo<SessionState>(
    () => ({
      ready,
      mode: repo.mode,
      sessionId,
      uid,
      profile,
      session,
      design,
      saveState,
      presentMode,
      joined: !!sessionId && !!profile,
      join,
      leave,
      update,
      markProgress,
      setStep,
      setPresentMode: setPresentModeState,
      votedPoll,
      castPoll,
      votedTask,
      castTaskPoll,
      votes,
      castVote,
    }),
    [
      ready,
      sessionId,
      uid,
      profile,
      session,
      design,
      saveState,
      presentMode,
      join,
      leave,
      update,
      markProgress,
      setStep,
      votedPoll,
      castPoll,
      votedTask,
      castTaskPoll,
      votes,
      castVote,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
