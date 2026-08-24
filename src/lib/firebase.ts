/**
 * Firebase 지연 초기화.
 *
 * 환경변수가 하나라도 비어 있으면 `null`을 돌려주고, 앱은 자동으로 '로컬 저장소 모드'로
 * 동작한다. 연수 당일 네트워크/설정 사고로 강의 자체가 멈추는 일을 막기 위한 안전장치다.
 */
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(cfg).every(
  (v) => typeof v === "string" && v.trim().length > 0,
);

let app: FirebaseApp | null = null;
let authRef: Auth | null = null;
let dbRef: Firestore | null = null;

function ensure() {
  if (!firebaseConfigured) return false;
  if (!app) {
    app = initializeApp(cfg as Required<typeof cfg>);
    authRef = getAuth(app);
    dbRef = getFirestore(app);
  }
  return true;
}

export function getAuthOrNull(): Auth | null {
  return ensure() ? authRef : null;
}

export function getDbOrNull(): Firestore | null {
  return ensure() ? dbRef : null;
}
