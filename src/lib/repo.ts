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
  onSnapshot,
  orderBy,
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
  type Participant,
  type PollKey,
  type Post,
  type Reflection,
  type SessionDoc,
  type StepId,
  type TaskPollKey,
} from "./types";
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
  vote(sessionId: string, key: PollKey): Promise<void>;
  voteTask(sessionId: string, key: TaskPollKey): Promise<void>;
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

  async vote(sessionId, key) {
    const skey = LS.session(sessionId);
    const s = read<SessionDoc>(skey, makeLocalSession(sessionId));
    write(skey, { ...s, pollResults: { ...s.pollResults, [key]: (s.pollResults[key] ?? 0) + 1 } });
  },

  async voteTask(sessionId, key) {
    const skey = LS.session(sessionId);
    const s = read<SessionDoc>(skey, makeLocalSession(sessionId));
    write(skey, {
      ...s,
      taskPollResults: { ...s.taskPollResults, [key]: (s.taskPollResults[key] ?? 0) + 1 },
    });
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

  async vote(sessionId, key) {
    await updateDoc(sessionDoc(sessionId), { [`pollResults.${key}`]: increment(1) });
  },

  async voteTask(sessionId, key) {
    await updateDoc(sessionDoc(sessionId), { [`taskPollResults.${key}`]: increment(1) });
  },

  watchPosts(sessionId, activityId, cb) {
    const q = query(
      postsCol(sessionId),
      where("activityId", "==", activityId),
      orderBy("createdAt", "desc"),
      limit(200),
    );
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
