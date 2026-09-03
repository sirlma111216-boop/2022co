/** 150분 진행 타임라인 — 강사 대시보드와 발표 모드에서 사용한다. */
export interface TimeSlot {
  from: number;
  to: number;
  screen: string;
  path: string;
  what: string;
  tip: string;
}

export interface Period {
  id: "p1" | "p2" | "p3";
  name: string;
  subtitle: string;
  slots: TimeSlot[];
}

export const TIMELINE: Period[] = [
  {
    id: "p1",
    name: "1교시 (50분)",
    subtitle: "교육과정을 읽다",
    slots: [
      {
        from: 0,
        to: 5,
        screen: "입장",
        path: "/join",
        what: "연수 코드 · 닉네임 · 교과 · 학교급 입력",
        tip: "연수 코드를 칠판에 크게 적어 주세요. 실명은 쓰지 않는다고 한 번 안내합니다.",
      },
      {
        from: 5,
        to: 14,
        screen: "수업 부검실",
        path: "/start",
        what: "수업 A·B·C 중 먼저 고칠 것 선택 + 이유 + 실시간 분포",
        tip: "정답을 말하지 마세요. 소수 쪽을 먼저 지목해 이유를 물으면 대화가 열립니다. 60초 타이머 사용.",
      },
      {
        from: 14,
        to: 18,
        screen: "내 수업 기록",
        path: "/start",
        what: "오늘 다시 설계할 실제 단원 + 가장 공들였던 활동과 그 이유",
        tip: "여기 적은 활동을 마지막 FINAL에서 다시 꺼냅니다. 대충 적지 않게 한 번 강조하세요.",
      },
      {
        from: 18,
        to: 26,
        screen: "SECTION 1",
        path: "/s1#s1-direction",
        what: "2022 개정의 방향 · 깊이 있는 학습 · 전이",
        tip: "\"많이 가르치는 것이 깊이 있는 학습은 아닙니다\"를 소리 내어 읽어 주세요.",
      },
      {
        from: 26,
        to: 34,
        screen: "SECTION 2",
        path: "/s1#s1-read",
        what: "성취기준 해부 데모 [9과10-01]",
        tip: "칩을 눌러 지식·이해 / 과정·기능을 하나씩 띄우며 함께 읽습니다.",
      },
      {
        from: 34,
        to: 37,
        screen: "주의",
        path: "/s1#s1-caution",
        what: "세 차원을 억지로 만들어내지 않기",
        tip: "가능하면 실제 교과 내용 체계표(PDF)를 옆 창에 함께 띄워 주세요.",
      },
      {
        from: 37,
        to: 50,
        screen: "ACTIVITY 1",
        path: "/s1#a1",
        what: "성취기준 해부 + 「핵심 행동」 하나 고르기 · 담벼락 공유",
        tip: "핵심 행동은 3교시 RED TEAM에서 다시 씁니다. 반드시 한 칸 채우게 하세요.",
      },
    ],
  },
  {
    id: "p2",
    name: "2교시 (50분)",
    subtitle: "무엇을 남길 것인가",
    slots: [
      {
        from: 0,
        to: 3,
        screen: "되돌아보기",
        path: "/s2",
        what: "1교시 산출물 카드 확인",
        tip: "30초만 각자 자기 카드를 다시 읽게 합니다.",
      },
      {
        from: 3,
        to: 10,
        screen: "SECTION 3",
        path: "/s2#s2-keyidea",
        what: "핵심 아이디어 — 복사·붙여넣기의 함정",
        tip: "\"문서 문장을 그대로 쓰면 왜 안 될까요?\"를 먼저 물어보세요.",
      },
      {
        from: 10,
        to: 20,
        screen: "MISSION",
        path: "/s2#s2-delete",
        what: "30% 삭제 도전 — 덜어내고, 남긴 이유와 공통점 쓰기",
        tip: "\"안 가르친다가 아니라 이번에는 덜 다룬다\"로 풀어 주세요. 가장 망설인 항목을 물으면 좋습니다.",
      },
      {
        from: 20,
        to: 26,
        screen: "SECTION 4",
        path: "/s2#s2-enduring",
        what: "영속적 이해 비교 카드",
        tip: "왼쪽/오른쪽 차이를 옆 선생님과 30초 이야기하게 하세요.",
      },
      {
        from: 26,
        to: 34,
        screen: "ACTIVITY 2",
        path: "/s2#a2",
        what: "남긴 것들을 한 문장으로 · 자기 점검 4항목",
        tip: "40자 내외, 완결된 문장으로. 단어만 적은 분을 찾아 도와주세요.",
      },
      {
        from: 34,
        to: 40,
        screen: "좋은 질문 판별",
        path: "/s2#s2-inquiry",
        what: "A~D 중 가장 오래 생각하게 할 질문 고르기 + 이유",
        tip: "C와 D가 갈립니다. 둘 다 좋은 질문이고 하는 일이 다르다는 점을 짚어 주세요.",
      },
      {
        from: 40,
        to: 47,
        screen: "ACTIVITY 3",
        path: "/s2#a3",
        what: "가장 강한 탐구질문 하나 + 자기 점검 (3단계 확장은 선택)",
        tip: "세 개를 다 쓰라고 하지 마세요. 하나를 제대로 만드는 것이 목표입니다.",
      },
      {
        from: 47,
        to: 50,
        screen: "MINI GAME",
        path: "/s2#s2-game",
        what: "순서를 뒤집어라! + 「내 활동은 어디에 놓이는가」",
        tip: "2분 안에 끝내세요. 후속 질문의 답을 함께 읽고 3교시를 예고합니다.",
      },
    ],
  },
  {
    id: "p3",
    name: "3교시 (50분)",
    subtitle: "어떻게 확인할 것인가",
    slots: [
      {
        from: 0,
        to: 4,
        screen: "SECTION 6",
        path: "/s3#s3-backward",
        what: "백워드 설계 3단계 + 오해 바로잡기",
        tip: "\"시험 문제부터 만드는 것이 아니다\"를 반드시 짚고 넘어갑니다.",
      },
      {
        from: 4,
        to: 10,
        screen: "SECTION 7",
        path: "/s3#s3-badtask",
        what: "YES / NOT ENOUGH 투표",
        tip: "소수 의견 쪽을 먼저 들어보세요. 왜 그렇게 보았는지가 좋은 재료가 됩니다.",
      },
      {
        from: 10,
        to: 16,
        screen: "GRASPS",
        path: "/s3#s3-grasps",
        what: "GRASPS 읽기 + 과학 완성 사례",
        tip: "맥락이 화려한 것과 좋은 과제는 다르다는 점을 사례로 보여 주세요.",
      },
      {
        from: 16,
        to: 26,
        screen: "ACTIVITY 4",
        path: "/s3#a4",
        what: "GRASPS — G와 P 먼저, 나머지는 접어 두고",
        tip: "G와 P만 제대로 쓰게 하세요. R/A/S는 시간이 남는 분만 펼칩니다.",
      },
      {
        from: 26,
        to: 34,
        screen: "RED TEAM",
        path: "/s3#r1",
        what: "내 과제를 직접 공격해 구멍 찾기 → 수정 전/후 남기기",
        tip: "오늘 가장 많이 배우는 지점입니다. 시간을 넉넉히 주세요. \"가장 게으른 학생은 어떻게 통과할까요?\"",
      },
      {
        from: 34,
        to: 38,
        screen: "SECTION 8",
        path: "/s3#s3-rubric",
        what: "루브릭과 평가요소",
        tip: "나쁜 평가요소 3개를 같이 웃으며 읽으면 기억에 오래 남습니다.",
      },
      {
        from: 38,
        to: 42,
        screen: "ACTIVITY 5",
        path: "/s3#a5",
        what: "평가요소 최대 3개 · ★ 하나만 상·중·하",
        tip: "전부 쓰지 말라고 분명히 말해 주세요. 별표 하나만 깊게 쓰면 됩니다.",
      },
      {
        from: 42,
        to: 46,
        screen: "ACTIVITY 6 · SECTION 9",
        path: "/s3#a6",
        what: "학습 경험 3~5개 + 각각이 준비시키는 평가 증거 · 피드백 세 문장",
        tip: "활동만 적고 증거 칸을 비우면 이 활동의 의미가 사라집니다. 짝지어 적게 하세요.",
      },
      {
        from: 46,
        to: 50,
        screen: "FINAL MISSION",
        path: "/reflect",
        what: "처음의 활동과 다시 만나기 → STOP / START → 한 문장 → A4 출력",
        tip: "STOP/START 담벼락을 띄우고 몇 개를 소리 내어 읽으며 마무리합니다.",
      },
    ],
  },
];
