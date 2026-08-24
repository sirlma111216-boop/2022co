# 거꾸로 설계 연수실

**2022 개정 교육과정 기반 수업·평가 설계 교사 연수 웹앱** (3차시 × 50분 = 150분)

교수자는 이 웹앱 하나만 띄우고 연수를 진행하고, 연수생은 이 웹앱만 따라가면서
**「A4 한 장짜리 단원 수업·평가 설계안」**을 완성해 나갑니다. 별도의 PPT도, 교재도 필요하지 않습니다.

```
성취기준 → 이해 → 질문 → 평가 → 수업 → 피드백
```

---

## 목차

1. [무엇을 하는 앱인가](#1-무엇을-하는-앱인가)
2. [5분 만에 실행해 보기](#2-5분-만에-실행해-보기)
3. [Firebase 연결하기 (실시간 공유·강사 대시보드)](#3-firebase-연결하기)
4. [AI 동료 점검 연결하기](#4-ai-동료-점검-연결하기)
5. [배포하기](#5-배포하기)
6. [연수 당일 운영 가이드](#6-연수-당일-운영-가이드)
7. [프로젝트 구조](#7-프로젝트-구조)
8. [자주 겪는 문제](#8-자주-겪는-문제)

---

## 1. 무엇을 하는 앱인가

| 화면 | 내용 |
|---|---|
| **START** | 입장(닉네임만) → 아이스브레이킹 "나는 수업을 어디서부터 만들까?" 실시간 투표 |
| **1교시 · 교육과정을 읽다** | 2022 개정의 방향 · 깊이 있는 학습 · 성취기준 색 분해 → **ACTIVITY 1 성취기준 해부하기** |
| **2교시 · 무엇을 남길 것인가** | 핵심 아이디어 · 영속적 이해 · 탐구질문 3단계 → **ACTIVITY 2·3** + 미니게임 「순서를 뒤집어라!」 |
| **3교시 · 어떻게 확인할 것인가** | 백워드 설계 · GRASPS · 루브릭 · 과정 중심 피드백 → **ACTIVITY 4·5·6** |
| **FINAL** | 지금까지 쓴 내용이 자동으로 모인 **A4 한 장 설계안** (인쇄 / PDF / 공유) |
| **성찰** | 3문항 + "오늘의 연수를 한 문장으로" → 전체 워드클라우드 |
| **강사 대시보드** | 참여 인원 · 활동별 작성 현황 · 투표 결과 · 담벼락 관리 · 단계 제어 · 150분 타임라인과 진행 팁 |

설계 의도와 전체 정보구조는 **[docs/PRD.md](docs/PRD.md)** 에 정리되어 있습니다.

**개인정보를 수집하지 않습니다.** 실명·학교명·학생 정보를 묻지 않고, 담벼락에는 닉네임·교과·학교급만 표시됩니다.

---

## 2. 5분 만에 실행해 보기

Firebase 설정 없이도 앱 전체가 동작합니다(**로컬 저장 모드**).
개인 작성·자동 저장·A4 출력은 모두 정상이고, 담벼락과 실시간 투표만 "내 것"만 보입니다.

### 준비물

- **Node.js 20 이상** — [nodejs.org](https://nodejs.org) 에서 LTS 버전 설치
- 터미널(명령 프롬프트, PowerShell, 터미널 앱 아무거나)

### 실행

프로젝트 폴더에서 차례대로 입력합니다.

```bash
npm install
```

```bash
npm run dev
```

터미널에 뜨는 주소(보통 `http://localhost:5173`)를 브라우저에서 엽니다.
연수 코드는 `DEMO` 그대로 두고 닉네임만 적으면 바로 시작됩니다.

### 그 밖의 명령

```bash
npm run build
```

```bash
npm run preview
```

```bash
npm run lint
```

```bash
npm run typecheck
```

> `npm run build` 결과는 `dist/` 폴더에 정적 파일로 생성됩니다. 서버 없이 어디에나 올릴 수 있습니다.

---

## 3. Firebase 연결하기

실시간 담벼락 · 투표 집계 · 강사 대시보드를 쓰려면 Firebase가 필요합니다.
**한 번만 설정하면 이후 연수마다 그대로 재사용합니다.**

### 3-1. 프로젝트 만들기

1. [console.firebase.google.com](https://console.firebase.google.com) 접속 → **프로젝트 추가**
2. 프로젝트 이름 입력(예: `backward-lab`) → Google 애널리틱스는 **사용 안 함**으로 두어도 됩니다.
3. 프로젝트가 만들어지면 왼쪽 위 **⚙️ 프로젝트 설정** → 아래로 스크롤 → **내 앱** → **웹(`</>`)** 아이콘 클릭
4. 앱 닉네임 입력 → **앱 등록** → 화면에 나오는 `firebaseConfig` 값을 복사해 둡니다.

### 3-2. 인증 켜기

왼쪽 메뉴 **빌드 → Authentication → 시작하기**

- **Sign-in method** 탭에서 두 가지를 사용 설정합니다.
  - **익명** — 연수생용 (필수)
  - **Google** — 강사용 (강사 대시보드를 쓸 경우)

### 3-3. Firestore 만들기

왼쪽 메뉴 **빌드 → Firestore Database → 데이터베이스 만들기**

1. 위치는 `asia-northeast3 (서울)` 권장
2. 시작 모드는 **프로덕션 모드**를 선택합니다(규칙은 아래에서 올립니다).

### 3-4. 환경변수 넣기

프로젝트 폴더에서 `.env.example` 을 복사해 `.env.local` 을 만들고, 3-1에서 복사한 값을 채웁니다.

```bash
cp .env.example .env.local
```

```dotenv
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=backward-lab.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=backward-lab
VITE_FIREBASE_STORAGE_BUCKET=backward-lab.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
```

> 이 여섯 개 값은 브라우저에 노출되어도 안전한 값입니다. 실제 보안은 아래 Firestore 규칙이 담당합니다.
> `.env.local` 은 git에 올라가지 않습니다.

`npm run dev` 를 다시 실행하면 화면 오른쪽 위 표시가 **로컬 저장 → 실시간 공유** 로 바뀝니다.

### 3-5. 보안 규칙과 인덱스 올리기

Firebase CLI를 설치하고 로그인합니다.

```bash
npm install -g firebase-tools
```

```bash
firebase login
```

```bash
firebase use --add
```

(목록에서 방금 만든 프로젝트를 선택하고, 별칭은 `default` 로 둡니다.)

규칙과 인덱스를 올립니다.

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### 3-6. 강사 계정 등록하기

강사 권한은 **클라이언트가 아니라 Firestore 데이터**로 판정합니다. 콘솔에서 직접 등록해야 합니다.

1. 앱에서 `/presenter` 로 들어가 **Google로 로그인** 합니다.
2. 화면에 표시되는 **UID** 를 복사합니다.
3. Firebase 콘솔 → Firestore → **컬렉션 시작** → 컬렉션 ID `instructors`
4. 문서 ID에 복사한 **UID** 를 붙여 넣고, 필드 `email`(문자열)에 이메일을 적고 저장합니다.
5. 앱을 새로고침하면 강사 대시보드가 열립니다.

---

## 4. AI 동료 점검 연결하기

「AI 동료에게 점검받기」 버튼은 **서버 함수를 통해서만** 생성형 AI를 호출합니다.
브라우저에서 직접 호출하지 않으므로 API 키가 노출되지 않습니다.

> **왜 Vertex AI인가**
> Cloudflare 같은 엣지 플랫폼에서는 나가는 IP가 매번 달라져서, AI Studio API
> (`generativelanguage.googleapis.com`)를 쓰면 `400 User location is not supported` 오류가
> **간헐적으로** 발생합니다. 재시도나 결제로 해결되지 않습니다.
> Vertex AI(`aiplatform.googleapis.com`)는 호출자 위치를 검사하지 않으므로 이 문제가 구조적으로 없습니다.
> 로컬 개발에서는 편의를 위해 AI Studio 키(`GEMINI_API_KEY`)로도 동작하게 해 두었습니다.

### 4-1. (권장) Vertex AI 서비스 계정 만들기

Google Cloud 콘솔에서 **순서대로** 진행합니다. 하나라도 빠지면 마지막에 403이 납니다.

1. **결제 연결** — Google Cloud 프로젝트에 결제 계정을 연결합니다(Vertex는 결제 필수).
2. **API 사용 설정** —
   `https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project={프로젝트ID}`
   에 접속해 **사용 설정** 을 누릅니다.
3. **서비스 계정 생성** — IAM 및 관리자 → 서비스 계정 → 만들기
4. **역할 부여** — 검색창에 `aiplatform.user` 로 검색해 나오는 역할
   (콘솔 표기는 "Agent Platform User" / "에이전트 플랫폼 사용자")을 부여합니다.
   ⚠️ 이름에 **"서비스 에이전트"** 가 붙은 역할은 고르지 마세요(구글 내부용입니다).
5. **JSON 키 생성** — 서비스 계정 → 키 → 새 키 → JSON → 다운로드
6. 다운로드한 **JSON 파일 내용 전체**를 환경변수 `GCP_SERVICE_ACCOUNT` 에 넣습니다.

설정 후 1~2분 정도 전파 시간이 있습니다. 바로 403이 나더라도 잠시 후 다시 시도해 보세요.

### 4-2. 로컬에서 테스트하기 (간단한 방법)

한국에서 개발 중이라면 AI Studio 키로 충분합니다.

1. [aistudio.google.com/apikey](https://aistudio.google.com/apikey) 에서 API 키 발급
2. `.env.local` 에 추가:

```dotenv
GEMINI_API_KEY=발급받은키
GEN_AI_MODEL=gemini-2.5-flash-lite
```

3. Vite 개발 서버는 서버 함수를 실행하지 않으므로, 함수까지 함께 띄우려면
   Cloudflare의 로컬 실행기를 사용합니다.

```bash
npm run build
```

```bash
npx wrangler pages dev dist
```

> `VITE_` 접두사를 **절대 붙이지 마세요.** 붙이면 키가 브라우저 번들에 그대로 들어갑니다.

### 4-3. 모델 바꾸기

모델 이름은 코드에 하드코딩되어 있지 않습니다. `GEN_AI_MODEL` 환경변수로 바꿉니다.
기본값은 빠르고 저렴한 `gemini-2.5-flash-lite` 입니다.

배포 전에 쓰려는 모델이 실제로 동작하는지 한 번 확인해 두면 좋습니다(무료 할당량이 0인 모델이 있습니다).

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST -H "Content-Type: application/json" -H "x-goog-api-key: $KEY" -d '{"contents":[{"role":"user","parts":[{"text":"hi"}]}]}' "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent"
```

### 4-4. 사용량 제한

- 클라이언트: 버튼 **10초 쿨다운**, 브라우저당 **연수 1회 20회**
- 서버: IP 기준 **1분 6회** (`AI_RATE_PER_MIN` 로 조정)

---

## 5. 배포하기

### 5-A. Cloudflare Pages (권장)

정적 사이트 + 서버 함수를 한 번에 올릴 수 있고, `functions/` 폴더가 자동으로 API가 됩니다.

1. 이 저장소를 GitHub에 올립니다.
2. Cloudflare 대시보드 → **Workers & Pages → Create → Pages → Connect to Git**
3. 빌드 설정
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
   Node 버전은 저장소의 `.node-version`(20)을 따라갑니다. 따로 설정하지 않아도 됩니다.

4. **Settings → 환경변수(Variables and Secrets)** 에 값을 등록합니다.
   **빌드 시점에 필요한 값과 런타임(서버 함수)에 필요한 값이 다릅니다.** 여기서 가장 많이 막힙니다.

   **빌드용** — `vite build` 가 읽어 번들에 넣습니다. 없으면 배포본이 계속 "로컬 저장 모드"로 뜹니다.

   | 이름 | 타입 |
   |---|---|
   | `VITE_FIREBASE_API_KEY` | Variable |
   | `VITE_FIREBASE_AUTH_DOMAIN` | Variable |
   | `VITE_FIREBASE_PROJECT_ID` | Variable |
   | `VITE_FIREBASE_STORAGE_BUCKET` | Variable |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Variable |
   | `VITE_FIREBASE_APP_ID` | Variable |

   **런타임용** — 서버 함수(`functions/api/ai-review.ts`)만 읽습니다. 브라우저로 나가지 않습니다.

   | 이름 | 타입 | 값 |
   |---|---|---|
   | `GCP_SERVICE_ACCOUNT` | **Secret** | 서비스 계정 JSON 전체 |
   | `GEN_AI_MODEL` | Variable | `gemini-2.5-flash-lite` |
   | `AI_RATE_PER_MIN` | Variable | `6` |

   > ⚠️ `GCP_SERVICE_ACCOUNT` 는 반드시 **Secret** 타입으로 등록하세요.
   > Production / Preview 양쪽에 모두 넣고, **변수를 추가한 뒤에는 재배포(Retry deployment)** 를 눌러야
   > 빌드용 변수가 반영됩니다.

5. Deploy를 누르면 2~5분 뒤 주소가 나옵니다.

### 배포 직후 반드시 해야 하는 두 가지

이걸 빠뜨리면 배포는 됐는데 기능만 조용히 실패합니다.

1. **Firebase 승인된 도메인 추가** — Firebase 콘솔 → Authentication → Settings → 승인된 도메인에
   `<프로젝트>.pages.dev`(와 커스텀 도메인)를 추가합니다. 안 하면 강사 Google 로그인이 실패합니다.
2. **Firestore 규칙·인덱스 배포** — [3-5](#3-5-보안-규칙과-인덱스-올리기) 를 아직 안 했다면 지금 합니다.
   안 하면 담벼락 읽기·쓰기가 전부 거부됩니다.

### 배포 확인

1. `/s1` 을 주소창에 직접 입력했을 때 404가 아닌지 (SPA 라우팅)
2. 화면 오른쪽 위가 **"실시간 공유"** 인지 (아니면 `VITE_FIREBASE_*` 미반영 → 재배포)
3. AI 버튼을 **간격을 두고 4회 이상** — 로컬에서 되는 것과 엣지에서 되는 것은 다른 문제입니다.
   실패 시 화면 메시지 끝에 원인 요약(`HTTP 403 …`)이 함께 나오니 그것으로 진단하세요.

### 5-B. Firebase Hosting + Cloud Functions

동일한 AI 로직(`shared/ai-core.ts`)을 Cloud Functions로도 배포할 수 있습니다.

```bash
cd firebase-functions && npm install && cd ..
```

```bash
firebase functions:secrets:set GCP_SERVICE_ACCOUNT
```

```bash
npm run build
```

```bash
firebase deploy
```

`firebase.json` 의 rewrite 규칙이 `/api/ai-review` 요청을 `aiReview` 함수로 넘겨 줍니다.

### 5-C. 정적 호스팅만 (AI 없이)

`npm run build` 후 `dist/` 폴더를 그대로 올리면 됩니다.
AI 점검 버튼을 누르면 "아직 연결되지 않았습니다" 안내가 뜨고, 나머지 기능은 모두 정상 동작합니다.

---

## 6. 연수 당일 운영 가이드

### 시작 전 (10분)

1. 배포 주소를 열고 **`/presenter`** 로 이동 → 강사 로그인
2. **[새 세션 만들기]** 를 눌러 코드를 발급받습니다(예: `K7M2P`).
3. 화면에 크게 뜨는 코드를 **칠판이나 슬라이드에 적어** 둡니다.
4. 상단 **[발표 모드]** 를 켭니다 → 글자가 커지고 **교수자 진행 팁**이 화면에 나타납니다.

### 진행 중

- 오른쪽 **150분 타임라인** 패널에 시간대별 화면·내용·진행 팁이 있습니다. 각 항목의 `화면 열기`로 바로 이동합니다.
- **[현재 진행 단계]** 버튼으로 단계를 옮기면 연수생 화면 위에 안내 배너가 뜹니다(강제 이동은 아닙니다).
- **활동별 작성 현황** 에서 `성취기준 해부 24/28` 처럼 진행률을 보고 시간을 조절합니다.
- **담벼락 열기** → 좋은 사례에 **[함께 보기]** 를 눌러 고정하면 모든 참가자 담벼락 맨 위에 올라갑니다.

### 마무리

- `/final` 에서 **[인쇄]** 또는 **[PDF로 저장]** 을 함께 눌러 봅니다.
  (PDF 저장은 인쇄 대화상자에서 대상을 'PDF로 저장'으로 바꾸면 됩니다.)
- `/reflect` 의 워드클라우드를 프로젝터에 띄우고 몇 문장을 소리 내어 읽으며 닫습니다.

### 사고 대비

인터넷이나 Firebase에 문제가 생겨도 **연수는 멈추지 않습니다.**
환경변수가 없거나 연결이 끊기면 앱은 자동으로 로컬 저장 모드로 동작하고,
작성 내용은 브라우저에 계속 저장되어 A4 출력까지 정상적으로 진행됩니다.

---

## 7. 프로젝트 구조

```
.
├── docs/PRD.md              설계 문서 (IA · 흐름 · 스키마 · 타임라인 · 개발 단계)
├── index.html
├── public/_redirects        SPA 라우팅 (Cloudflare Pages)
│
├── src/
│   ├── content/             ★ 강의 콘텐츠 — 교육 내용은 대부분 여기에 있습니다
│   │   ├── terms.ts         용어 사전 17종 (한 줄 정의 / 쉬운 설명 / 과학 예 / 오해 / 한 문장)
│   │   ├── examples.ts      과학 사례 (성취기준 · 영속적 이해 · 질문 · GRASPS · 루브릭 · 피드백)
│   │   └── timeline.ts      150분 타임라인 + 교수자 진행 팁
│   ├── lib/
│   │   ├── types.ts         DesignDoc 등 모든 데이터 모양
│   │   ├── firebase.ts      환경변수 없으면 null → 로컬 모드
│   │   ├── repo.ts          데이터 계층 (firestore | local 두 구현)
│   │   ├── session-store.tsx / session-context.ts   설계안 상태 + 자동 저장
│   │   ├── ai.ts            /api/ai-review 호출 + 쿨다운·횟수 제한
│   │   └── utils.ts
│   ├── components/
│   │   ├── ui/              버튼 · 배지 · 입력 · 다이얼로그 · 진행바 · 접기펼치기 (shadcn 방식)
│   │   ├── layout/          전역 내비 · 스텝 내비 · 교시 레이아웃 · 목차
│   │   ├── teach/           설명 블록 5종 · 용어 카드 · 비교 카드 · 오해 카드 · 성취기준 색 분해
│   │   ├── activity/        활동 껍데기 · 자동저장 입력 · 앞 단계 되보기 · AI 코치 · 루브릭 편집기
│   │   ├── wall/            공유 담벼락 (Masonry · 공감 · 댓글 · 고정)
│   │   ├── poll/            실시간 막대그래프
│   │   ├── game/            「순서를 뒤집어라!」 드래그앤드롭
│   │   └── sheet/           A4 한 장 설계안
│   └── pages/               Join · Start · Session1~3 · Final · Reflect · Presenter
│
├── shared/ai-core.ts        AI 프롬프트 + Vertex 인증 + 호출 (두 런타임 공용)
├── functions/api/ai-review.ts        Cloudflare Pages Function
├── firebase-functions/src/index.ts   Firebase Cloud Functions (대안)
│
├── firestore.rules          보안 규칙
├── firestore.indexes.json   복합 인덱스
└── firebase.json
```

### 콘텐츠를 고치고 싶다면

- **용어 설명** → `src/content/terms.ts` (5단 구조를 유지해 주세요)
- **과학 사례를 다른 교과로** → `src/content/examples.ts`
- **진행 팁·시간 배분** → `src/content/timeline.ts`
- **강의 서술(교수자 설명 문장)** → `src/pages/Session1~3.tsx` 안의 `<Block>` 블록
- **AI가 무엇을 볼지** → `shared/ai-core.ts` 의 `TASK_SYSTEM`

---

## 8. 자주 겪는 문제

| 증상 | 원인과 해결 |
|---|---|
| 오른쪽 위가 계속 **"로컬 저장"** | `.env.local` 의 `VITE_FIREBASE_*` 6개 중 하나라도 비어 있으면 로컬 모드입니다. 값을 채우고 `npm run dev` 를 다시 시작하세요. |
| 담벼락이 비어 있음 | 같은 **연수 코드**로 들어왔는지 확인하세요. 코드가 다르면 서로의 글이 보이지 않도록 설계되어 있습니다. |
| 담벼락 로딩 중 오류 | Firestore 복합 인덱스가 없는 경우입니다. `firebase deploy --only firestore:indexes` 를 실행하세요. |
| 강사 대시보드에서 로그인만 반복됨 | `instructors/{내 UID}` 문서를 만들지 않았습니다. [3-6](#3-6-강사-계정-등록하기) 참고. |
| AI 버튼이 회색 | 대상 칸이 비어 있습니다. 초안을 먼저 쓰면 활성화됩니다(의도된 동작입니다). |
| "AI 점검 기능이 아직 연결되지 않았습니다" | 서버 함수가 배포되지 않은 정적 호스팅입니다. [5-A](#5-a-cloudflare-pages-권장) 또는 [5-B](#5-b-firebase-hosting--cloud-functions) 참고. |
| AI가 **400 User location is not supported** | AI Studio API의 지역 차단입니다. 재시도·결제로는 해결되지 않습니다. `GCP_SERVICE_ACCOUNT` 를 등록해 Vertex AI로 전환하세요. |
| AI가 **403 API has not been used** | Google Cloud에서 `aiplatform.googleapis.com` 을 사용 설정하지 않았습니다. [4-1](#4-1-권장-vertex-ai-서비스-계정-만들기) 2번 참고. |
| AI가 **429** | 그 모델의 무료 할당량이 0이거나 분당 한도를 넘었습니다. 20~30초 뒤 재시도하거나 결제를 연결하세요. |
| 인쇄하면 2페이지가 됨 | 학습 활동 줄 수가 많은 경우입니다. 차시를 4줄 이내로 줄이거나, 인쇄 대화상자에서 배율을 95%로 낮추세요. |
| 한글이 네모로 보임 | Pretendard 폰트를 CDN에서 불러옵니다. 폐쇄망이라면 폰트 파일을 `public/` 에 두고 `index.html` 의 링크를 교체하세요. |

---

## 라이선스 및 사용

교사 연수 목적으로 자유롭게 사용·수정할 수 있습니다.
교과 사례를 바꾸어 쓰실 때는 `src/content/` 안의 파일만 손보면 됩니다.
