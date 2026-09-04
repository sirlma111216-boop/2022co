/**
 * 데이터 접근 계층.
 *
 * 두 가지 구현을 같은 인터페이스 뒤에 둔다.
 *  - `firestore` : Firebase 환경변수가 모두 설정된 경우 (담벼락·실시간 투표·강사 대시보드 동작)
 *  - `local`     : 그렇지 않은 경우 localStorage. 개인 작성·자동저장·A4 출력은 그대로 동작한다.
 *
 * UI는 어떤 구현이 붙어 있는지 알 필요가 없다. `repo.mode`만 보고 안내 문구를 바꾼다.
 */
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  runTransaction,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from "firebase/firestore";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getAuthOrNull, getDbOrNull, firebaseConfigured } from "./firebase";
import {
  DEFAULT_POLL,
  DEFAULT_TASK_POLL,
  EMPTY_DESIGN,
  type ActivityId,
  type DesignDoc,
  type LadderGameId,
  type LadderState,
  type Participant,
  type Post,
  type Reflection,
  type SessionDoc,
  type StepId,
  type TaskPollKey,
} from "./types";
import { ladderSeatKey } from "./types";
import { safeJson } from "./utils";

export type Unsub = () => void;

export interface JoinProfile {
  nickname: string;
  subject: string;
  schoolLevel: string;
}

export interface Repo {
  readonly mode: "firestore" | "local";
  signInParticipant(): Promise<string>;
  joinSession(code: string, profile: JoinProfile): Promise<{ sessionId: string; uid: string }>;
  watchSession(sessionId: string, cb: (s: SessionDoc | null) => void): Unsub;
  loadDesign(sessionId: string, uid: string): Promise<DesignDoc | null>;
  saveDesign(sessionId: string, uid: string, patch: Partial<DesignDoc>): Promise<void>;
  markProgress(sessionId: string, uid: string, activityId: ActivityId): Promise<void>;
  setParticipantStep(sessionId: string, uid: string, step: StepId): Promise<void>;
  /**
   * 선택형 활동 집계 — key 는 pollResults map 안의 키 (예: 'A', 'autopsy_B').
   * prevKey 를 주면 그 칸을 1 줄이고 새 칸을 1 올린다(선택을 바꾼 경우).
   */
  vote(sessionId: string, key: string, prevKey?: string): Promise<void>;
  voteTask(sessionId: string, key: TaskPollKey, prevKey?: TaskPollKey): Promise<void>;
  watchPosts(sessionId: string, activityId: ActivityId, cb: (posts: Post[]) => void): Unsub;
  addPost(sessionId: string, post: Omit<Post, "id" | "createdAt" | "likes" | "likedBy" | "isPinned" | "comments">): Promise<void>;
  toggleLike(sessionId: string, postId: string, uid: string, liked: boolean): Promise<void>;
  addComment(sessionId: string, postId: string, uid: string, nickname: string, text: string): Promise<void>;
  pinPost(sessionId: string, postId: string, pinned: boolean): Promise<void>;
  deletePost(sessionId: string, postId: string): Promise<void>;
  /** AI 호출 1회 기록 — 브라우저 카운터와 별개로 세션 단위 사용량을 남긴다 */
  bumpAiUsage(sessionId: string, uid: string): Promise<void>;
  saveReflection(sessionId: string, uid: string, r: Omit<Reflection, "uid" | "createdAt">): Promise<void>;
  watchReflections(sessionId: string, cb: (r: Reflection[]) => void): Unsub;
  watchParticipants(sessionId: string, cb: (p: Participant[]) => void): Unsub;
  /** 교과만 바꾼다 — 설계안은 건드리지 않는다 */
  updateProfileSubject(sessionId: string, uid: string, subject: string): Promise<void>;
  // ── 사다리타기 발표자 뽑기 ────────────────────────────────────
  /** 이번 라운드에 참가 신청 (자기 참가자 문서에만 쓴다) */
  joinLadder(sessionId: string, uid: string, game: LadderGameId, round: number): Promise<void>;
  /**
   * 자리 예약. 두 사람이 같은 자리를 동시에 눌러도 한 명만 성공해야 하므로
   * 세션 문서 하나를 놓고 compare-and-set 한다.
   * @returns 예약에 성공했으면 true, 이미 다른 사람이 가져갔으면 false
   */
  claimLadderSeat(
    sessionId: string,
    uid: string,
    game: LadderGameId,
    round: number,
    seat: number,
    prevSeat: number | null,
  ): Promise<boolean>;
  /** 게임 상태 갱신 — 강사만 호출한다 */
  setLadder(sessionId: string, game: LadderGameId, next: LadderState): Promise<void>;
  // ── 강사용 ────────────────────────────────────────────────
  watchInstructor(cb: (user: User | null, isInstructor: boolean) => void): Unsub;
  signInInstructor(): Promise<void>;
  signOutInstructor(): Promise<void>;
  createSession(title: string, code: string, ownerUid: string): Promise<SessionDoc>;
  listMySessions(ownerUid: string): Promise<SessionDoc[]>;
  setSessionStep(sessionId: string, step: StepId): Promise<void>;
}

/* ══════════════════════════════════════════════════════════════════════════
   local 구현
   ══════════════════════════════════════════════════════════════════════════ */

const LS = {
  uid: "bl.uid",
  session: (id: string) => `bl.session.${id}`,
  design: (id: string, uid: string) => `bl.design.${id}.${uid}`,
  posts: (id: string) => `bl.posts.${id}`,
  reflections: (id: string) => `bl.reflect.${id}`,
  participants: (id: string) => `bl.participants.${id}`,
};

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function emit(key: string) {
  listeners.get(key)?.forEach((fn) => fn());
}

function subscribe(key: string, fn: Listener): Unsub {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === key) fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.get(key)?.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

function read<T>(key: string, fallback: T): T {
  return safeJson<T>(localStorage.getItem(key), fallback);
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  emit(key);
}

function makeLocalSession(id: string): SessionDoc {
  return {
    id,
    title: "2022 개정 교육과정 수업·평가 설계 연수",
    joinCode: id,
    ownerUid: "local",
    createdAt: Date.now(),
    currentStep: "start",
    isActive: true,
    pollResults: { ...DEFAULT_POLL },
    taskPollResults: { ...DEFAULT_TASK_POLL },
  };
}

const localRepo: Repo = {
  mode: "local",

  async signInParticipant() {
    let uid = localStorage.getItem(LS.uid);
    if (!uid) {
      uid = `local-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(LS.uid, uid);
    }
    return uid;
  },

  async joinSession(code, profile) {
    const uid = await localRepo.signInParticipant();
    const key = LS.session(code);
    const existing = read<SessionDoc | null>(key, null);
    if (!existing) write(key, makeLocalSession(code));

    const pkey = LS.participants(code);
    const list = read<Participant[]>(pkey, []);
    const me: Participant = {
      uid,
      ...profile,
      joinedAt: Date.now(),
      currentStep: "start",
      progress: list.find((p) => p.uid === uid)?.progress ?? {},
    };
    write(pkey, [...list.filter((p) => p.uid !== uid), me]);
    return { sessionId: code, uid };
  },

  watchSession(sessionId, cb) {
    const key = LS.session(sessionId);
    const push = () => cb(read<SessionDoc | null>(key, null) ?? makeLocalSession(sessionId));
    push();
    return subscribe(key, push);
  },

  async loadDesign(sessionId, uid) {
    return read<DesignDoc | null>(LS.design(sessionId, uid), null);
  },

  async saveDesign(sessionId, uid, patch) {
    const key = LS.design(sessionId, uid);
    const cur = read<DesignDoc>(key, { ...EMPTY_DESIGN });
    write(key, { ...cur, ...patch, updatedAt: Date.now() });
  },

  async markProgress(sessionId, uid, activityId) {
    const pkey = LS.participants(sessionId);
    const list = read<Participant[]>(pkey, []);
    write(
      pkey,
      list.map((p) => (p.uid === uid ? { ...p, progress: { ...p.progress, [activityId]: true } } : p)),
    );
  },

  async setParticipantStep(sessionId, uid, step) {
    const pkey = LS.participants(sessionId);
    const list = read<Participant[]>(pkey, []);
    write(pkey, list.map((p) => (p.uid === uid ? { ...p, currentStep: step } : p)));
  },

  async vote(sessionId, key, prevKey) {
    if (prevKey === key) return;
    const skey = LS.session(sessionId);
    const s = read<SessionDoc>(skey, makeLocalSession(sessionId));
    const next = { ...s.pollResults, [key]: (s.pollResults[key] ?? 0) + 1 };
    if (prevKey) next[prevKey] = Math.max(0, (s.pollResults[prevKey] ?? 0) - 1);
    write(skey, { ...s, pollResults: next });
  },

  async voteTask(sessionId, key, prevKey) {
    if (prevKey === key) return;
    const skey = LS.session(sessionId);
    const s = read<SessionDoc>(skey, makeLocalSession(sessionId));
    const next = { ...s.taskPollResults, [key]: (s.taskPollResults[key] ?? 0) + 1 };
    if (prevKey) next[prevKey] = Math.max(0, (s.taskPollResults[prevKey] ?? 0) - 1);
    write(skey, { ...s, taskPollResults: next });
  },

  watchPosts(sessionId, activityId, cb) {
    const key = LS.posts(sessionId);
    const push = () => {
      const all = read<Post[]>(key, []);
      cb(
        all
          .filter((p) => p.activityId === activityId)
          .sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.createdAt - a.createdAt),
      );
    };
    push();
    return subscribe(key, push);
  },

  async addPost(sessionId, post) {
    const key = LS.posts(sessionId);
    const all = read<Post[]>(key, []);
    const next: Post = {
      ...post,
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      likes: 0,
      likedBy: [],
      isPinned: false,
      comments: [],
      createdAt: Date.now(),
    };
    // 같은 활동에 이미 올린 글이 있으면 교체(연수 중 중복 카드 방지)
    write(key, [...all.filter((p) => !(p.uid === post.uid && p.activityId === post.activityId)), next]);
  },

  async toggleLike(sessionId, postId, uid, liked) {
    const key = LS.posts(sessionId);
    write(
      key,
      read<Post[]>(key, []).map((p) =>
        p.id === postId
          ? {
              ...p,
              likes: Math.max(0, p.likes + (liked ? 1 : -1)),
              likedBy: liked ? [...p.likedBy, uid] : p.likedBy.filter((u) => u !== uid),
            }
          : p,
      ),
    );
  },

  async addComment(sessionId, postId, uid, nickname, text) {
    const key = LS.posts(sessionId);
    write(
      key,
      read<Post[]>(key, []).map((p) =>
        p.id === postId
          ? { ...p, comments: [...p.comments, { uid, nickname, text, createdAt: Date.now() }].slice(-20) }
          : p,
      ),
    );
  },

  async pinPost(sessionId, postId, pinned) {
    const key = LS.posts(sessionId);
    write(key, read<Post[]>(key, []).map((p) => (p.id === postId ? { ...p, isPinned: pinned } : p)));
  },

  async deletePost(sessionId, postId) {
    const key = LS.posts(sessionId);
    write(key, read<Post[]>(key, []).filter((p) => p.id !== postId));
  },

  async bumpAiUsage() {
    /* 로컬 모드에는 서버가 없다 — 브라우저 카운터(ai.ts)만으로 충분하다 */
  },

  async saveReflection(sessionId, uid, r) {
    const key = LS.reflections(sessionId);
    const all = read<Reflection[]>(key, []);
    write(key, [...all.filter((x) => x.uid !== uid), { ...r, uid, createdAt: Date.now() }]);
  },

  watchReflections(sessionId, cb) {
    const key = LS.reflections(sessionId);
    const push = () => cb(read<Reflection[]>(key, []));
    push();
    return subscribe(key, push);
  },

  async updateProfileSubject(sessionId, uid, subject) {
    const pkey = LS.participants(sessionId);
    const list = read<Participant[]>(pkey, []);
    write(pkey, list.map((p) => (p.uid === uid ? { ...p, subject } : p)));
  },

  async joinLadder(sessionId, uid, game, round) {
    const pkey = LS.participants(sessionId);
    const list = read<Participant[]>(pkey, []);
    write(
      pkey,
      list.map((p) =>
        p.uid === uid
          ? { ...p, ladderSeats: { ...p.ladderSeats, [game]: { round, seat: null } } }
          : p,
      ),
    );
  },

  async claimLadderSeat(sessionId, uid, game, round, seat) {
    // 로컬 모드는 한 브라우저 안이라 경쟁이 없다. 그래도 규칙은 같게 지킨다.
    const pkey = LS.participants(sessionId);
    const list = read<Participant[]>(pkey, []);
    const taken = list.some((p) => {
      const mine = p.ladderSeats?.[game];
      return p.uid !== uid && mine?.round === round && mine?.seat === seat;
    });
    if (taken) return false;
    write(
      pkey,
      list.map((p) =>
        p.uid === uid ? { ...p, ladderSeats: { ...p.ladderSeats, [game]: { round, seat } } } : p,
      ),
    );
    return true;
  },

  async setLadder(sessionId, game, next) {
    const skey = LS.session(sessionId);
    const s = read<SessionDoc>(skey, makeLocalSession(sessionId));
    write(skey, { ...s, ladders: { ...s.ladders, [game]: next } });
  },

  watchParticipants(sessionId, cb) {
    const key = LS.participants(sessionId);
    const push = () => cb(read<Participant[]>(key, []));
    push();
    return subscribe(key, push);
  },

  watchInstructor(cb) {
    // 로컬 모드에서는 누구나 강사 화면을 볼 수 있다(오프라인 리허설용).
    cb(null, true);
    return () => {};
  },
  async signInInstructor() {
    /* 로컬 모드에는 로그인이 없다 */
  },
  async signOutInstructor() {
    /* noop */
  },
  async createSession(title, code) {
    const s = { ...makeLocalSession(code), title };
    write(LS.session(code), s);
    return s;
  },
  async listMySessions() {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith("bl.session."))
      .map((k) => read<SessionDoc | null>(k, null))
      .filter((s): s is SessionDoc => !!s);
  },
  async setSessionStep(sessionId, step) {
    const key = LS.session(sessionId);
    const s = read<SessionDoc>(key, makeLocalSession(sessionId));
    write(key, { ...s, currentStep: step });
  },
};

/* ══════════════════════════════════════════════════════════════════════════
   firestore 구현
   ══════════════════════════════════════════════════════════════════════════ */

function db(): Firestore {
  const d = getDbOrNull();
  if (!d) throw new Error("Firestore가 초기화되지 않았습니다.");
  return d;
}

function ts(v: unknown): number {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "toMillis" in v) {
    return (v as { toMillis(): number }).toMillis();
  }
  return Date.now();
}

const sessionsCol = () => collection(db(), "sessions");
const sessionDoc = (id: string) => doc(db(), "sessions", id);
const participantsCol = (id: string) => collection(db(), "sessions", id, "participants");
const designDoc = (id: string, uid: string) =>
  doc(db(), "sessions", id, "participants", uid, "design", "current");
const postsCol = (id: string) => collection(db(), "sessions", id, "posts");
const reflectionsCol = (id: string) => collection(db(), "sessions", id, "reflections");

const fsRepo: Repo = {
  mode: "firestore",

  async signInParticipant() {
    const auth = getAuthOrNull()!;
    if (auth.currentUser) return auth.currentUser.uid;
    const cred = await signInAnonymously(auth);
    return cred.user.uid;
  },

  async joinSession(code, profile) {
    const uid = await fsRepo.signInParticipant();
    const snap = await getDoc(sessionDoc(code));
    if (!snap.exists()) {
      // 강사가 아직 세션을 만들지 않았어도 연수가 멈추면 안 된다 → 참가자가 만들 수 있게 허용.
      await setDoc(
        sessionDoc(code),
        {
          title: "2022 개정 교육과정 수업·평가 설계 연수",
          joinCode: code,
          ownerUid: "",
          createdAt: serverTimestamp(),
          currentStep: "start",
          isActive: true,
          pollResults: DEFAULT_POLL,
          taskPollResults: DEFAULT_TASK_POLL,
        },
        { merge: true },
      );
    }
    await setDoc(
      doc(participantsCol(code), uid),
      { ...profile, joinedAt: serverTimestamp(), lastSeenAt: serverTimestamp(), currentStep: "start" },
      { merge: true },
    );
    return { sessionId: code, uid };
  },

  watchSession(sessionId, cb) {
    return onSnapshot(
      sessionDoc(sessionId),
      (snap) => {
        if (!snap.exists()) return cb(null);
        const d = snap.data();
        cb({
          id: snap.id,
          title: d.title ?? "",
          joinCode: d.joinCode ?? snap.id,
          ownerUid: d.ownerUid ?? "",
          createdAt: ts(d.createdAt),
          currentStep: (d.currentStep ?? "start") as StepId,
          isActive: d.isActive ?? true,
          pollResults: { ...DEFAULT_POLL, ...(d.pollResults ?? {}) },
          taskPollResults: { ...DEFAULT_TASK_POLL, ...(d.taskPollResults ?? {}) },
          ladders: (d.ladders as SessionDoc["ladders"]) ?? undefined,
        });
      },
      () => cb(null),
    );
  },

  async loadDesign(sessionId, uid) {
    const snap = await getDoc(designDoc(sessionId, uid));
    if (!snap.exists()) return null;
    return { ...EMPTY_DESIGN, ...(snap.data() as Partial<DesignDoc>) };
  },

  async saveDesign(sessionId, uid, patch) {
    await setDoc(designDoc(sessionId, uid), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
  },

  async markProgress(sessionId, uid, activityId) {
    await setDoc(
      doc(participantsCol(sessionId), uid),
      { progress: { [activityId]: true }, lastSeenAt: serverTimestamp() },
      { merge: true },
    );
  },

  async setParticipantStep(sessionId, uid, step) {
    await setDoc(
      doc(participantsCol(sessionId), uid),
      { currentStep: step, lastSeenAt: serverTimestamp() },
      { merge: true },
    );
  },

  async vote(sessionId, key, prevKey) {
    if (prevKey === key) return;
    const patch: Record<string, ReturnType<typeof increment>> = { [`pollResults.${key}`]: increment(1) };
    if (prevKey) patch[`pollResults.${prevKey}`] = increment(-1);
    await updateDoc(sessionDoc(sessionId), patch);
  },

  async voteTask(sessionId, key, prevKey) {
    if (prevKey === key) return;
    const patch: Record<string, ReturnType<typeof increment>> = { [`taskPollResults.${key}`]: increment(1) };
    if (prevKey) patch[`taskPollResults.${prevKey}`] = increment(-1);
    await updateDoc(sessionDoc(sessionId), patch);
  },

  watchPosts(sessionId, activityId, cb) {
    // orderBy 를 쓰지 않는다. 등호 필터만 쓰면 Firestore의 자동 단일 필드 인덱스로 처리되어
    // 복합 인덱스를 따로 배포할 필요가 없다 — 연수 당일 "인덱스가 없습니다" 사고를 없애기 위한 선택.
    // 정렬(고정 글 우선 → 최신순)은 어차피 아래에서 클라이언트가 다시 한다. 한 세션 규모가 수십 명이라 문제없다.
    const q = query(postsCol(sessionId), where("activityId", "==", activityId), limit(300));
    return onSnapshot(
      q,
      (snap) => {
        const posts = snap.docs.map((d) => {
          const v = d.data();
          return {
            id: d.id,
            uid: v.uid,
            nickname: v.nickname ?? "익명",
            subject: v.subject ?? "",
            schoolLevel: v.schoolLevel ?? "",
            activityId: v.activityId,
            content: v.content ?? {},
            likes: v.likes ?? 0,
            likedBy: v.likedBy ?? [],
            isPinned: v.isPinned ?? false,
            comments: (v.comments ?? []).map((c: Record<string, unknown>) => ({
              uid: String(c.uid ?? ""),
              nickname: String(c.nickname ?? "익명"),
              text: String(c.text ?? ""),
              createdAt: ts(c.createdAt),
            })),
            createdAt: ts(v.createdAt),
          } as Post;
        });
        posts.sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.createdAt - a.createdAt);
        cb(posts);
      },
      () => cb([]),
    );
  },

  async addPost(sessionId, post) {
    // 같은 활동에 이미 올린 글은 지우고 새로 올린다(담벼락 중복 방지).
    const dup = await getDocs(
      query(postsCol(sessionId), where("uid", "==", post.uid), where("activityId", "==", post.activityId)),
    );
    await Promise.all(dup.docs.map((d) => deleteDoc(d.ref)));
    await addDoc(postsCol(sessionId), {
      ...post,
      likes: 0,
      likedBy: [],
      isPinned: false,
      comments: [],
      createdAt: serverTimestamp(),
    });
  },

  async toggleLike(sessionId, postId, uid, liked) {
    await updateDoc(doc(postsCol(sessionId), postId), {
      likes: increment(liked ? 1 : -1),
      likedBy: liked ? arrayUnion(uid) : arrayRemove(uid),
    });
  },

  async addComment(sessionId, postId, uid, nickname, text) {
    await updateDoc(doc(postsCol(sessionId), postId), {
      comments: arrayUnion({ uid, nickname, text, createdAt: Date.now() }),
    });
  },

  async pinPost(sessionId, postId, pinned) {
    await updateDoc(doc(postsCol(sessionId), postId), { isPinned: pinned });
  },

  async deletePost(sessionId, postId) {
    await deleteDoc(doc(postsCol(sessionId), postId));
  },

  async bumpAiUsage(sessionId, uid) {
    await setDoc(
      doc(db(), "sessions", sessionId, "aiUsage", uid),
      { count: increment(1), lastCallAt: serverTimestamp() },
      { merge: true },
    );
  },

  async saveReflection(sessionId, uid, r) {
    await setDoc(doc(reflectionsCol(sessionId), uid), { ...r, createdAt: serverTimestamp() }, { merge: true });
  },

  watchReflections(sessionId, cb) {
    return onSnapshot(
      reflectionsCol(sessionId),
      (snap) =>
        cb(
          snap.docs.map((d) => {
            const v = d.data();
            return {
              uid: d.id,
              nickname: v.nickname ?? "익명",
              stopDoing: v.stopDoing ?? "",
              startDoing: v.startDoing ?? "",
              newLearning: v.newLearning ?? "",
              changeToTry: v.changeToTry ?? "",
              nextRevision: v.nextRevision ?? "",
              oneSentence: v.oneSentence ?? "",
              createdAt: ts(v.createdAt),
            };
          }),
        ),
      () => cb([]),
    );
  },

  async updateProfileSubject(sessionId, uid, subject) {
    await setDoc(
      doc(participantsCol(sessionId), uid),
      { subject, lastSeenAt: serverTimestamp() },
      { merge: true },
    );
  },

  async joinLadder(sessionId, uid, game, round) {
    // merge 는 map 안쪽까지 병합하므로 다른 판의 자리는 그대로 남는다
    await setDoc(
      doc(participantsCol(sessionId), uid),
      { ladderSeats: { [game]: { round, seat: null } }, lastSeenAt: serverTimestamp() },
      { merge: true },
    );
  },

  /**
   * 자리 예약.
   *
   * 참가자는 보안 규칙상 세션 문서에서 pollResults 말고는 건드릴 수 없다.
   * 그래서 자리 잠금도 그 map 안에 `lad<라운드>_<자리>` 키로 넣는다.
   * 트랜잭션이 재시도까지 해 주므로 두 사람이 같은 순간에 눌러도 한 명만 1을 쓴다.
   * 이름은 각자 자기 참가자 문서에 쓴다 — 잠금과 표시를 분리해 두면
   * 규칙을 한 줄도 바꾸지 않고 중복을 막을 수 있다.
   */
  async claimLadderSeat(sessionId, uid, game, round, seat, prevSeat) {
    const ref = sessionDoc(sessionId);
    const key = ladderSeatKey(game, round, seat);
    const won = await runTransaction(db(), async (tx) => {
      const snap = await tx.get(ref);
      const polls = (snap.data()?.pollResults ?? {}) as Record<string, number>;
      if ((polls[key] ?? 0) > 0) return false;
      const patch: Record<string, number> = { [`pollResults.${key}`]: 1 };
      // 자리를 옮기는 경우 예전 자리는 즉시 풀어 준다
      if (prevSeat !== null && prevSeat !== seat)
        patch[`pollResults.${ladderSeatKey(game, round, prevSeat)}`] = 0;
      tx.update(ref, patch);
      return true;
    });
    if (!won) return false;

    try {
      await setDoc(
        doc(participantsCol(sessionId), uid),
        { ladderSeats: { [game]: { round, seat } }, lastSeenAt: serverTimestamp() },
        { merge: true },
      );
    } catch (e) {
      // 이름을 못 남겼는데 잠금만 남으면 아무도 못 쓰는 자리가 된다 → 되돌린다
      await updateDoc(ref, { [`pollResults.${key}`]: 0 }).catch(() => {});
      throw e;
    }
    return true;
  },

  async setLadder(sessionId, game, next) {
    // undefined 가 하나라도 섞이면 Firestore 가 쓰기를 통째로 거부한다
    await updateDoc(sessionDoc(sessionId), {
      [`ladders.${game}`]: JSON.parse(JSON.stringify(next)),
    });
  },

  watchParticipants(sessionId, cb) {
    return onSnapshot(
      participantsCol(sessionId),
      (snap) =>
        cb(
          snap.docs.map((d) => {
            const v = d.data();
            return {
              uid: d.id,
              nickname: v.nickname ?? "익명",
              subject: v.subject ?? "",
              schoolLevel: v.schoolLevel ?? "",
              joinedAt: ts(v.joinedAt),
              currentStep: (v.currentStep ?? "start") as StepId,
              progress: v.progress ?? {},
              ladderSeats: v.ladderSeats ?? undefined,
            };
          }),
        ),
      () => cb([]),
    );
  },

  watchInstructor(cb) {
    const auth = getAuthOrNull()!;
    return onAuthStateChanged(auth, async (user) => {
      if (!user || user.isAnonymous) return cb(user, false);
      try {
        const snap = await getDoc(doc(db(), "instructors", user.uid));
        cb(user, snap.exists());
      } catch {
        cb(user, false);
      }
    });
  },

  async signInInstructor() {
    const auth = getAuthOrNull()!;
    await signInWithPopup(auth, new GoogleAuthProvider());
  },

  async signOutInstructor() {
    const auth = getAuthOrNull()!;
    await signOut(auth);
  },

  async createSession(title, code, ownerUid) {
    await setDoc(sessionDoc(code), {
      title,
      joinCode: code,
      ownerUid,
      createdAt: serverTimestamp(),
      currentStep: "start",
      isActive: true,
      pollResults: DEFAULT_POLL,
      taskPollResults: DEFAULT_TASK_POLL,
    });
    return {
      id: code,
      title,
      joinCode: code,
      ownerUid,
      createdAt: Date.now(),
      currentStep: "start",
      isActive: true,
      pollResults: { ...DEFAULT_POLL },
      taskPollResults: { ...DEFAULT_TASK_POLL },
    };
  },

  async listMySessions(ownerUid) {
    const snap = await getDocs(query(sessionsCol(), where("ownerUid", "==", ownerUid), limit(50)));
    return snap.docs.map((d) => {
      const v = d.data();
      return {
        id: d.id,
        title: v.title ?? "",
        joinCode: v.joinCode ?? d.id,
        ownerUid: v.ownerUid ?? "",
        createdAt: ts(v.createdAt),
        currentStep: (v.currentStep ?? "start") as StepId,
        isActive: v.isActive ?? true,
        pollResults: { ...DEFAULT_POLL, ...(v.pollResults ?? {}) },
        taskPollResults: { ...DEFAULT_TASK_POLL, ...(v.taskPollResults ?? {}) },
      };
    });
  },

  async setSessionStep(sessionId, step) {
    await updateDoc(sessionDoc(sessionId), { currentStep: step });
  },
};

export const repo: Repo = firebaseConfigured ? fsRepo : localRepo;
export const isLocalMode = repo.mode === "local";
