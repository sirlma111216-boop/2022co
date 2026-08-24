# 2022 개정 교육과정 연수 웹앱 — 설계 문서 (PRD)

> **한 줄 정의**
> 교수자는 이 웹앱 하나만 띄우고 150분 연수를 진행하고, 연수생은 이 웹앱만 따라가면서
> 「A4 한 장짜리 2022 개정 교육과정 기반 수업·평가 설계안」을 완성해 나가는 워크숍 도구.

프로젝트 코드네임: **backward-lab**
대상: 중·고등학교 교사 (교과 무관, 사례는 과학 중심)
형태: 3차시 × 50분 = 150분 대면 연수 (프로젝터 + 연수생 개인 기기)

---

## 0. 설계 대원칙

| # | 원칙 | 구현에 미치는 영향 |
|---|---|---|
| 1 | **슬라이드 뷰어가 아니다** | 모든 장(章)은 `설명 → 예시 → 생각하기 → 직접 작성 → 다른 사람과 비교 → 다음 단계 연결` 6단 구조를 유지한다 |
| 2 | **하나의 설계안이 계속 자란다** | 앞 단계 산출물을 뒤 단계 화면 상단에 항상 다시 보여준다(`<CarryOver />`) |
| 3 | **사전 지식 0을 가정한다** | 모든 핵심 용어는 5단 구조(정의 / 쉬운 설명 / 과학 예 / 오해 / 한 문장) 카드로 제공 |
| 4 | **막지는 않는다** | 입력은 강하게 권장하되 필수 검증으로 진행을 차단하지 않는다 (경고 배지만 표시) |
| 5 | **사람이 먼저, AI는 동료** | AI 버튼은 사용자가 초안을 쓴 뒤에만 활성화. AI는 절대 자동으로 내용을 덮어쓰지 않는다 |
| 6 | **오프라인 / 무설정에서도 굴러간다** | Firebase 미설정 시 자동으로 `local` 저장소 모드로 동작 (연수 당일 사고 방지) |
| 7 | **프로젝터 + 스마트폰 동시 대응** | 본문 17px 기준, 발표 모드에서 1.35배 확대. 완전 반응형 |

---

## 1. 정보구조 (IA)

```
/                                  진입 → 세션 상태에 따라 리다이렉트
├── /join                          START · 입장 (연수 코드 / 닉네임 / 교과 / 학교급)
├── /start                         START · 아이스브레이킹 "나는 수업을 어디서부터 만들까?"
│
├── /s1  1교시 · 교육과정을 읽다              (50분)
│   ├── s1-intro                   1교시에서 할 일
│   ├── s1-direction    SECTION 1  2022 개정 교육과정, 무엇이 달라졌나
│   ├── s1-deep                    깊이 있는 학습과 전이
│   ├── s1-read         SECTION 2  성취기준을 읽는 법 (색 분해 데모)
│   ├── s1-three                   지식·이해 / 과정·기능 / 가치·태도
│   ├── s1-caution                 주의: 세 차원을 억지로 만들어내지 않기 (내용 체계)
│   └── s1-act1         ACTIVITY 1 성취기준 해부하기  → 담벼락 공유 + AI 점검
│
├── /s2  2교시 · 무엇을 남길 것인가            (50분)
│   ├── s2-intro                   1교시 산출물 되돌아보기
│   ├── s2-keyidea      SECTION 3  핵심 아이디어 — 복사·붙여넣기의 함정
│   ├── s2-enduring     SECTION 4  영속적 이해 (비교 카드 4쌍)
│   ├── s2-act2         ACTIVITY 2 "한 문장만 남는다면?"  → 담벼락 + AI
│   ├── s2-inquiry      SECTION 5  탐구질문 3단계 (확인 / 연결 / 확장·논쟁)
│   ├── s2-act3         ACTIVITY 3 질문 업그레이드      → 담벼락 + AI
│   └── s2-game         MINI GAME  "순서를 뒤집어라!" (드래그앤드롭)
│
├── /s3  3교시 · 어떻게 확인할 것인가          (50분)
│   ├── s3-intro                   2교시 산출물 되돌아보기
│   ├── s3-backward     SECTION 6  백워드 설계 3단계 + 흔한 오해
│   ├── s3-badtask      SECTION 7  이 수행과제로 충분할까? (YES / NOT ENOUGH 투표)
│   ├── s3-grasps                  GRASPS 쉽게 읽기 + 과학 완성 사례
│   ├── s3-act4         ACTIVITY 4 나의 수행과제 만들기 → 담벼락 + AI
│   ├── s3-rubric       SECTION 8  루브릭과 평가요소
│   ├── s3-act5         ACTIVITY 5 평가요소 3개만 고르기 + 수행수준
│   ├── s3-act6         ACTIVITY 6 학습 경험 설계 (증거에서 거꾸로)
│   └── s3-feedback     SECTION 9  과정 중심 피드백 (Feed Up / Back / Forward)
│
├── /final                         FINAL · 나의 단원 설계 한 장 (A4 미리보기 / 인쇄 / PDF)
├── /reflect                       마지막 성찰 + 전체 한 문장 워드클라우드
│
└── /presenter                     강사 대시보드 (진행률 · 응답 · 공유글 · 단계 제어 · 타임라인)
```

> **발표 모드**는 별도 라우트를 두지 않는다. 상단 바의 토글 하나로 전역 상태를 바꾸면
> 모든 연수생 화면에서 본문이 1.28배로 커지고 `<PresenterTip>` 이 함께 나타난다.
> 프로젝터에 띄우는 화면과 연수생이 보는 화면이 "같은 페이지"여야 진행이 어긋나지 않기 때문이다.

### 상단 스텝 내비게이션 (항상 노출)

```
 START ─ 1교시 교육과정을 읽다 ─ 2교시 무엇을 남길 것인가 ─ 3교시 어떻게 확인할 것인가 ─ FINAL 나의 설계안
```

* 현재 단계는 Action Blue 밑줄 + 굵게, 완료 단계는 체크, 미방문 단계는 회색.
* 모바일에서는 현재 단계명 + 진행률 바(예: `2교시 · 4/7`)로 축약.
* 각 페이지 안에서는 우측 고정 목차(데스크톱) / 상단 섹션 칩(모바일).

---

## 2. 페이지 · 컴포넌트 구조

```
src/
├── main.tsx                     라우터 + Provider 부트스트랩
├── App.tsx                      라우트 정의, AppShell
├── index.css                    디자인 토큰 + 인쇄 CSS
│
├── content/                     ★ 재사용 콘텐츠 데이터 (코드와 섞지 않음)
│   ├── terms.ts                 용어 사전 17종 (5단 구조)
│   ├── examples.ts              과학 사례 (성취기준 / 영속적 이해 / 질문 / GRASPS / 루브릭 / 피드백)
│   └── timeline.ts              150분 타임라인 + 교수자 진행 팁
│   ※ 교수자 서술문(인라인 용어 칩·강조가 섞인 산문)은 pages/Session1~3.tsx 의
│     <Block> 안에 둔다 — 데이터로 빼면 JSX 조각을 문자열로 다뤄야 해서 오히려 고치기 어렵다.
│
├── lib/
│   ├── types.ts                 DesignDoc, Participant, Post, Reflection, Session
│   ├── firebase.ts              lazy init. env 없으면 null 반환 → local 모드
│   ├── repo.ts                  데이터 접근 추상화 (firestore | local 두 구현)
│   ├── session-store.tsx        React Context Provider: 참가자 · 설계안 · 자동저장(700ms)
│   ├── session-context.ts       Context 객체 + useSession() 훅
│   ├── ai.ts                    /api/ai-review 호출 클라이언트 + rate limit
│   └── utils.ts                 cn(), 글자 수, 날짜 포맷, 워드클라우드 빈도
│
├── components/
│   ├── ui/                      shadcn 스타일 원자 컴포넌트
│   │   button · card · input · textarea · label · badge · accordion
│   │   dialog · progress · separator · toast
│   ├── layout/
│   │   AppShell · StepNav · SectionRail · PageNav · SaveIndicator
│   ├── teach/
│   │   Block            [함께 읽어보기] [교수자 설명] [과학 수업에서 보면]
│   │                    [잠깐 생각해보기] [한 문장으로 정리] 5종 블록
│   │   TermCard         용어 5단 구조 카드 (접기 / 펼치기)
│   │   CompareCards     좌: 흔한 방식 / 우: 더 깊은 방식 비교
│   │   MisconceptionCard  ✕ 오해 → ○ 실제
│   │   MoreInfo         '더 알아보기' (개념 렌즈 · 스트랜드 등 고급 용어 격리)
│   │   PresenterTip     발표 모드 / 강사 모드에서만 보이는 진행 팁
│   │   StandardDissect  성취기준 문장을 지식 / 기능 / 태도로 색 분해
│   ├── activity/
│   │   ActivityCard     활동 래퍼(번호 · 제목 · 안내 · 저장상태 · 공유버튼)
│   │   AutoField        자동저장 input / textarea + 도움말 + 글자 수
│   │   CarryOver        앞 단계 산출물 재노출 카드
│   │   AiCoach          [AI 동료에게 점검받기] + 👍 / 🔍 / 💡 + [이 제안 적용]
│   │   GraspsForm       G · R · A · S · P · S 6칸
│   │   RubricBuilder    평가요소 3개 × 수행수준(상 / 중 / 하)
│   ├── wall/
│   │   ShareBar · WallDialog · WallCard (공감 · 댓글 · 고정)
│   ├── poll/
│   │   PollChoice · PollBars (CSS 막대, 실시간)
│   ├── game/
│   │   ReverseOrderGame (dnd-kit)
│   ├── sheet/
│   │   DesignSheet      A4 1장 설계안 (화면 · 인쇄 공용)
│   └── presenter/
│       ProgressPanel · WallModeration · StepController · TimelinePanel
│
└── pages/
    Join · Start · Session1 · Session2 · Session3 · Final · Reflect
    Presenter(대시보드 + 발표 모드 토글) · NotFound
```

서버 측:

```
shared/ai-core.ts                 AI 프롬프트 · Vertex 인증 · generateContent 호출 (공용)
functions/api/ai-review.ts        Cloudflare Pages Function (얇은 껍데기)
firebase-functions/src/index.ts   Firebase Cloud Functions (같은 코어를 재사용하는 대안)
```

### 핵심 컴포넌트 계약

**`<Block kind="teacher-note">`** — 5종 블록. 배경 / 아이콘 / 라벨만 다르고 본문은 children.
`read`(함께 읽어보기) · `teacher-note`(교수자 설명) · `science`(과학 수업에서 보면) · `think`(잠깐 생각해보기) · `oneline`(한 문장으로 정리)

**`<AutoField field="enduringUnderstanding">`** — `session-store`의 설계안 문서 필드 하나에 바인딩.
입력 → 700ms debounce → `repo.saveDesign(patch)` → SaveIndicator("저장됨 · 방금").

**`<AiCoach task="enduring" />`** — 대상 필드가 비어 있으면 disabled + "먼저 초안을 작성해 주세요".
응답은 `{ good: string[], think: string[], suggestion: string }`으로 파싱해 3블록 렌더.
`[이 제안 적용]`을 눌러야만 `suggestion`이 필드에 반영된다(적용 후 `[되돌리기]` 제공).

---

## 3. 사용자 흐름

### 3.1 연수생 (참가자)

```
① /join
   연수 코드 입력(없으면 'DEMO') · 닉네임(필수) · 교과 · 학교급
   → 익명 인증 → participants/{uid} upsert → localStorage에 uid · sessionId 캐시
② /start  아이스브레이킹 A~D 선택 → 실시간 막대그래프 → "왜 거꾸로 가는 걸까요?"
③ /s1 … /s3  각 섹션: 읽기 → 예시 → 생각 → 작성(자동저장) → 공유 → 담벼락 비교
④ /final  자동 취합된 A4 설계안 확인 → [인쇄] [PDF로 저장] [공유하기]
⑤ /reflect  성찰 3문항 + 한 문장 → 전체 워드클라우드
```

*재접속*: localStorage의 `{sessionId, uid}`로 자동 복귀. 기기를 바꾸면 같은 코드로 재입장(새 uid, 새 문서 — 안내 문구 표시).

### 3.2 교수자 (강사)

```
① /presenter  Google 로그인 → instructors/{uid} 화이트리스트 확인
② 세션 생성 / 선택 → 참가 코드를 화면에 크게 표시
③ 진행: [현재 단계 변경] → 참가자 화면 상단에 "강사가 2교시로 이동했습니다" 배너
④ 실시간: 참여 인원 · 활동별 작성 현황(24/28) · 아이스브레이킹 응답 · 담벼락
⑤ 좋은 사례 [함께 보기] 고정 → 참가자 담벼락 최상단 노출
⑥ /present 전체 화면 발표 모드 (연수생 화면 + 교수자 진행 팁)
```

### 3.3 상태 전이

`currentStep`: `join → start → s1 → s2 → s3 → final → reflect`
강사의 `session.currentStep`은 **권유**이지 강제가 아니다(참가자는 자유 이동 가능, 배너로만 안내).

---

## 4. Firestore 스키마

```
sessions/{sessionId}
  title           string    "2022 개정 교육과정 수업·평가 설계 연수"
  joinCode        string    대문자 4~6자, 문서 ID로 사용 (유니크 보장)
  ownerUid        string    강사 uid
  createdAt       timestamp
  currentStep     string    'join'|'start'|'s1'|'s2'|'s3'|'final'|'reflect'
  isActive        boolean
  pollResults     map       { A:0, B:0, C:0, D:0 }        (increment)
  taskPollResults map       { yes:0, notEnough:0 }        (increment)

sessions/{sessionId}/participants/{uid}
  nickname     string  (필수)
  subject      string  '과학' 등
  schoolLevel  string  '중학교' | '고등학교' | '초등학교' | '기타'
  joinedAt     timestamp
  lastSeenAt   timestamp
  currentStep  string
  progress     map     { a1:true, a2:true, ... }   ← 대시보드 집계용

sessions/{sessionId}/participants/{uid}/design/current
  unitName               string   단원명
  achievementStandard    string
  knowledgeUnderstanding string
  processSkill           string
  valueAttitude          string
  keyIdea                string
  enduringUnderstanding  string
  inquiryOriginal        string
  inquiryFact            string   확인 질문
  inquiryConcept         string   연결 질문
  inquiryDebate          string   확장 · 논쟁 질문
  graspsG..graspsS2      string   6칸
  assessmentElements     array    [{ name, high, mid, low }] (최대 3)
  learningActivities     string
  feedUp / feedBack / feedForward   string
  updatedAt              timestamp

sessions/{sessionId}/posts/{postId}
  uid, nickname, subject, schoolLevel
  activityId  'a1'|'a2'|'a3'|'a4'|'a5'
  content     map      활동별 구조화 내용 (a1: {standard,k,p,v} 등)
  likes       number
  likedBy     array<uid>          (자기 공감 1회 제한)
  isPinned    boolean             강사 [함께 보기]
  comments    array<{uid,nickname,text,createdAt}>  (한 줄 댓글, 최대 20)
  createdAt / updatedAt

sessions/{sessionId}/reflections/{uid}
  newLearning, changeToTry, nextRevision, oneSentence, nickname, createdAt

sessions/{sessionId}/aiUsage/{uid}
  count       number     세션 내 누적 호출 수 (상한 20)
  lastCallAt  timestamp  (쿨다운 10초)

instructors/{uid}
  email, displayName, createdAt      ← 강사 화이트리스트 (콘솔에서 수동 생성)
```

### 인덱스
* `posts`: `activityId ASC, isPinned DESC, createdAt DESC`
* `posts`: `activityId ASC, isPinned DESC, likes DESC`

---

## 5. Firebase Security Rules 설계

원칙 5가지:

1. **참가자는 자기 문서만 쓴다.** `design`, `reflections/{uid}`는 `request.auth.uid == uid`일 때만 write.
2. **같은 세션 안에서만 읽는다.** 모든 하위 컬렉션 read 조건에 "해당 세션의 `participants/{uid}` 문서가 존재할 것"을 요구 → 연수 코드가 다르면 접근 불가.
3. **글은 작성자만 수정 / 삭제.** 단 `likes` / `likedBy`는 다른 참가자도 ±1 한 번만 가능하도록 필드 단위로 검증.
4. **강사 권한은 서버 데이터로 판정.** 클라이언트 boolean 금지 → `exists(/databases/$(db)/documents/instructors/$(request.auth.uid))`로만 판정.
5. **세션 문서 자체는 강사만 생성 / 수정.** 단 `pollResults`, `taskPollResults`는 참가자가 increment만 가능(다른 필드 불변 검증).

핵심 헬퍼:

```
function isSignedIn()      { return request.auth != null; }
function isSelf(uid)       { return isSignedIn() && request.auth.uid == uid; }
function isMember(sid)     { return exists(/databases/$(database)/documents/sessions/$(sid)/participants/$(request.auth.uid)); }
function isInstructor()    { return exists(/databases/$(database)/documents/instructors/$(request.auth.uid)); }
function onlyChanged(keys) { return request.resource.data.diff(resource.data).affectedKeys().hasOnly(keys); }
```

전체 규칙은 `firestore.rules` 참조.

---

## 6. AI 기능 구조

### 6.1 원칙

> **"사람이 먼저 생각하고, AI가 동료처럼 점검한다."**

* AI 버튼은 **초안 작성 후에만 활성화**. 페이지 진입 시 자동 호출 절대 금지(과금 사고 방지).
* 응답은 항상 `👍 좋은 점 / 🔍 생각해볼 점 / 💡 수정 예시` 3블록.
* 수정안은 사용자가 `[이 제안 적용]`을 눌러야만 반영. 적용 후 `[되돌리기]` 제공.
* 실명 · 학교명 · 학생 정보는 애초에 수집하지 않으므로 프롬프트에 포함될 여지가 없다(닉네임도 미전송).

### 6.2 5개 점검 태스크

| task | 대상 | 점검 관점 |
|---|---|---|
| `standard` | 성취기준 해부 | 지식·이해 / 과정·기능 / 가치·태도 분류가 성취기준 문장과 맞는가 |
| `enduring` | 영속적 이해 | 사실 나열인가 전이 가능한 이해인가, 단원 수준으로 구체적인가 |
| `inquiry`  | 탐구질문 3종 | 확인 / 연결 / 확장 단계가 실제로 구분되는가, 정답 맞히기 질문은 아닌가 |
| `task`     | 수행과제 GRASPS | 목표 - 이해 - 과제가 정렬되는가, 맥락이 화려하기만 한 건 아닌가 |
| `align`    | 전체 설계안 | 성취기준 → 이해 → 질문 → 평가 → 수업 → 피드백의 연결 고리 점검 |

### 6.3 호출 경로 (핵심 결정)

```
브라우저 ──POST /api/ai-review──▶ 서버 함수 ──▶ Vertex AI (aiplatform.googleapis.com)
                                     │           서비스 계정 OAuth, 호출자 위치 검사 없음
                                     └──(로컬 dev, GCP_SERVICE_ACCOUNT 없을 때)──▶ AI Studio
```

* **브라우저에서 직접 호출하지 않는다.** 키는 서버 전용 환경변수. `VITE_` 접두사 금지.
* **Cloudflare Pages Functions에서는 `generativelanguage.googleapis.com`을 쓰지 않는다.**
  엣지 아웃바운드가 미지원 지역(홍콩 등)을 경유하면 `400 User location is not supported`가
  간헐 발생한다(재시도 · 결제로 해결되지 않음). → **Vertex AI 사용.**
* **함수는 오류도 HTTP 200 + JSON으로 반환한다.** Pages가 5xx 본문을 평문 `error code: 502`로
  덮어써 진짜 원인을 가리기 때문.
* 모델명은 하드코딩하지 않고 `GEN_AI_MODEL` 환경변수. 기본값 `gemini-2.5-flash-lite`.
* 배포 대안으로 Firebase Cloud Functions 구현(`firebase-functions/`)을 동일 계약으로 제공.

### 6.4 요청 / 응답 계약

```jsonc
// POST /api/ai-review
{ "task": "enduring", "subject": "과학", "schoolLevel": "중학교",
  "payload": { "standard": "...", "enduring": "..." } }

// 200 OK (성공)
{ "ok": true, "good": ["..."], "think": ["..."], "suggestion": "...", "raw": "..." }
// 200 OK (실패도 200)
{ "ok": false, "message": "AI 호출에 실패했습니다. … (원인: HTTP 429 …)" }
```

### 6.5 Rate limit

* 클라이언트: 버튼 10초 쿨다운 + 세션당 20회 카운터(localStorage, Firestore `aiUsage` 동기화).
* 서버: IP 기준 메모리 카운터(1분 6회). 초과 시 `ok:false` + 한국어 안내.

### 6.6 시스템 프롬프트 요지

사용자 교과 · 학교급 반영 / 입력된 성취기준을 임의 변조 금지 / 활동의 화려함보다 목표-평가 정렬 우선 /
어려운 교육학 용어 지양 / 명령이 아니라 대안 제시 / 반드시 `GOOD:` `THINK:` `SUGGEST:` 마커로 출력.

---

## 7. 150분 강의 타임라인

### 1교시 (50분) — 교육과정을 읽다

| 시간 | 화면 | 내용 | 교수자 진행 팁 |
|---|---|---|---|
| 0–5 | /join | 입장 · 닉네임 | 코드를 칠판에 크게. 실명 금지 안내 |
| 5–12 | /start | 아이스브레이킹 A~D + 실시간 그래프 | 결과를 읽어주되 정답을 말하지 말 것 |
| 12–22 | s1-direction | 2022 개정의 방향, 깊이 있는 학습 | "많이 가르치는 것 ≠ 깊이" 한 번 더 |
| 22–32 | s1-read | 성취기준 해부 데모 (9과10-01) | 색 분해를 함께 소리 내어 읽기 |
| 32–36 | s1-caution | 세 차원을 억지로 만들지 않기 | 내용 체계표를 함께 띄우기 |
| 36–48 | s1-act1 | ACTIVITY 1 작성 + 공유 | 12분 타이머. 2~3개 골라 함께 비교 |
| 48–50 | — | 1교시 정리 | "내일 수업이 아니라 단원을 봅니다" |

### 2교시 (50분) — 무엇을 남길 것인가

| 시간 | 화면 | 내용 | 교수자 진행 팁 |
|---|---|---|---|
| 0–3 | s2-intro | 1교시 산출물 되돌아보기 | 각자 카드 확인 30초 |
| 3–12 | s2-keyidea | 핵심 아이디어 복사·붙여넣기의 함정 | "그대로 쓰면 왜 안 되나" 먼저 묻기 |
| 12–20 | s2-enduring | 영속적 이해 비교 카드 | 옆 선생님과 30초 대화 |
| 20–30 | s2-act2 | ACTIVITY 2 한 문장 | 40자 내외 권장, 완결된 문장으로 |
| 30–38 | s2-inquiry | 탐구질문 3단계 | 나쁜 질문을 먼저 고쳐보게 하기 |
| 38–46 | s2-act3 | ACTIVITY 3 질문 업그레이드 | 확장 질문이 가장 어려움 — 예시 제공 |
| 46–50 | s2-game | 미니게임 "순서를 뒤집어라!" | 정답 확인 후 백워드 설계 선언 |

### 3교시 (50분) — 어떻게 확인할 것인가

| 시간 | 화면 | 내용 | 교수자 진행 팁 |
|---|---|---|---|
| 0–4 | s3-backward | 백워드 3단계 + 오해 바로잡기 | "시험문제부터"가 아님을 반드시 |
| 4–10 | s3-badtask | YES / NOT ENOUGH 투표 | 소수 의견을 먼저 들어보기 |
| 10–16 | s3-grasps | GRASPS + 과학 완성 사례 | 화려함 ≠ 좋은 과제 |
| 16–28 | s3-act4 | ACTIVITY 4 수행과제 | 12분. AI 점검을 여기서 한 번 시연 |
| 28–34 | s3-rubric | 루브릭 · 평가요소 | 나쁜 평가요소 3개 함께 웃으며 |
| 34–40 | s3-act5 | ACTIVITY 5 평가요소 3개 | 2~3개면 충분하다고 못 박기 |
| 40–44 | s3-act6 · s3-feedback | 학습 경험 + 피드백 3문장 | 증거에서 거꾸로 세우기 |
| 44–50 | /final · /reflect | A4 출력 + 성찰 한 문장 | 워드클라우드 띄우고 마무리 |

---

## 8. 개발 단계

| 단계 | 범위 | 완료 기준 |
|---|---|---|
| **1** | 프로젝트 골격 + 디자인 토큰 + 전체 연수 콘텐츠 + 내비게이션 | Firebase 없이도 3차시 전체를 처음부터 끝까지 진행 가능 |
| **2** | 개인 작성 + 자동 저장 + 앞 단계 산출물 재노출 | 새로고침해도 입력이 보존되고 /final에 자동 취합됨 |
| **3** | Firebase Auth(익명) + Firestore 동기화 + 담벼락 + 실시간 투표 | 두 브라우저에서 같은 코드로 들어가 서로의 카드가 보임 |
| **4** | 강사 대시보드 + 발표 모드 + 단계 제어 + 카드 고정 | 강사 화면에서 작성 현황 n/N과 응답 분포가 실시간 |
| **5** | AI 동료 점검 (Vertex AI 서버 함수 + rate limit + 제안 적용) | 5개 태스크 모두 👍 / 🔍 / 💡 3블록으로 응답 |
| **6** | A4 인쇄 CSS + PDF 저장 + 성찰 / 워드클라우드 + 문서화 | A4 세로 1장에 6개 영역이 모두 들어감 |

각 단계 종료 시 `npm run build`, `npm run lint`, `npm run typecheck` 통과를 확인한다.

---

## 9. 기술 스택 및 배포

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | React 18 + TypeScript + Vite | 정적 빌드 산출물 `dist/` |
| 스타일 | Tailwind CSS + shadcn/ui 방식 컴포넌트 | Apple 디자인 토큰을 CSS 변수로 |
| 폰트 | Pretendard(본문) + system-ui(SF Pro) | 한글 화면에서 SF Pro의 조판 감각 재현 |
| 상태 | React Context + localStorage + Firestore onSnapshot | 별도 상태 라이브러리 없음 |
| 인증 | Firebase Auth (참가자 익명 / 강사 Google) | |
| DB | Firestore | |
| DnD | @dnd-kit/core, @dnd-kit/sortable | 터치 지원 |
| 차트 | 자체 CSS 막대 컴포넌트 | 의존성 최소화, 프로젝터 가독성 우선 |
| AI | Cloudflare Pages Functions → Vertex AI | Firebase Functions 구현도 동봉 |
| 배포 | Cloudflare Pages(권장) / Firebase Hosting | `dist` 정적 + `functions/` |

> **로컬 저장소 모드**: `VITE_FIREBASE_*` 환경변수가 하나라도 비면 앱은 자동으로 `local` 모드로
> 동작한다. 개인 작성 · 자동 저장 · A4 출력은 모두 정상 동작하고, 담벼락 / 투표는 "내 카드"만 보인다.
> 연수 당일 네트워크 사고에 대비한 안전장치다.

---

## 10. 디자인 시스템 요약 (Apple 톤)

* 단일 강조색 **Action Blue `#0066cc`** 하나만 인터랙션에 사용. 두 번째 브랜드 색을 만들지 않는다.
* 배경은 흰색 `#ffffff` ↔ 파치먼트 `#f5f5f7` ↔ 근검정 타일 `#272729`의 교대. **면 전환이 곧 구분선.**
* 본문 17px / 1.47, 제목 600 weight + 음수 자간. weight 500은 쓰지 않는다.
* 그림자는 시스템 전체에서 사실상 사용하지 않는다(카드 · 버튼 · 텍스트 금지).
  깊이는 면 색 전환과 헤어라인(`#e0e0e0`)으로만 만든다.
* 반경: 유틸리티 8px / 카드 18px / 액션은 pill(9999px).
* 버튼 누름 상태는 `transform: scale(0.95)` 하나로 통일.
