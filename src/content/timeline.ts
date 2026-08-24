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
        to: 12,
        screen: "아이스브레이킹",
        path: "/start",
        what: "\"나는 수업을 어디서부터 만들까?\" A~D 선택 + 실시간 그래프",
        tip: "결과를 읽어 주되 정답을 말하지 마세요. \"오늘은 D에서 출발해 봅니다\"까지만.",
      },
      {
        from: 12,
        to: 22,
        screen: "SECTION 1",
        path: "/s1#s1-direction",
        what: "2022 개정의 방향 · 깊이 있는 학습 · 전이",
        tip: "\"많이 가르치는 것이 깊이 있는 학습은 아닙니다\"를 소리 내어 읽어 주세요.",
      },
      {
        from: 22,
        to: 32,
        screen: "SECTION 2",
        path: "/s1#s1-read",
        what: "성취기준 해부 데모 [9과10-01]",
        tip: "칩을 눌러 지식·이해 / 과정·기능을 하나씩 띄우며 함께 읽습니다.",
      },
      {
        from: 32,
        to: 36,
        screen: "주의",
        path: "/s1#s1-caution",
        what: "세 차원을 억지로 만들어내지 않기",
        tip: "가능하면 실제 교과 내용 체계표(PDF)를 옆 창에 함께 띄워 주세요.",
      },
      {
        from: 36,
        to: 48,
        screen: "ACTIVITY 1",
        path: "/s1#a1",
        what: "성취기준 해부하기 · 담벼락 공유",
        tip: "12분 타이머. 끝나면 2~3개를 골라 성취기준과 정렬되는지 함께 비교합니다.",
      },
      {
        from: 48,
        to: 50,
        screen: "정리",
        path: "/s1",
        what: "1교시 마무리",
        tip: "\"우리는 내일 수업이 아니라 단원 전체를 보고 있습니다\"로 닫습니다.",
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
        to: 12,
        screen: "SECTION 3",
        path: "/s2#s2-keyidea",
        what: "핵심 아이디어 — 복사·붙여넣기의 함정",
        tip: "\"문서 문장을 그대로 쓰면 왜 안 될까요?\"를 먼저 물어보세요.",
      },
      {
        from: 12,
        to: 20,
        screen: "SECTION 4",
        path: "/s2#s2-enduring",
        what: "영속적 이해 비교 카드",
        tip: "왼쪽/오른쪽 차이를 옆 선생님과 30초 이야기하게 하세요.",
      },
      {
        from: 20,
        to: 30,
        screen: "ACTIVITY 2",
        path: "/s2#a2",
        what: "\"한 문장만 남는다면?\"",
        tip: "40자 내외, 반드시 완결된 문장으로. 단어만 적은 분을 찾아 도와주세요.",
      },
      {
        from: 30,
        to: 38,
        screen: "SECTION 5",
        path: "/s2#s2-inquiry",
        what: "탐구질문 3단계",
        tip: "나쁜 질문 예시를 먼저 함께 고쳐 봅니다. 정답을 주지 말고 기다리세요.",
      },
      {
        from: 38,
        to: 46,
        screen: "ACTIVITY 3",
        path: "/s2#a3",
        what: "질문 업그레이드",
        tip: "확장·논쟁 질문이 가장 어렵습니다. 예시 3개를 함께 읽어 주세요.",
      },
      {
        from: 46,
        to: 50,
        screen: "MINI GAME",
        path: "/s2#s2-game",
        what: "순서를 뒤집어라!",
        tip: "정답을 맞힌 뒤 \"이것이 백워드 설계입니다\"로 3교시를 예고합니다.",
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
        to: 28,
        screen: "ACTIVITY 4",
        path: "/s3#a4",
        what: "나의 수행과제 만들기",
        tip: "12분. 여기서 [AI 동료에게 점검받기]를 한 번 시연해 보이면 좋습니다.",
      },
      {
        from: 28,
        to: 34,
        screen: "SECTION 8",
        path: "/s3#s3-rubric",
        what: "루브릭과 평가요소",
        tip: "나쁜 평가요소 3개를 같이 웃으며 읽으면 기억에 오래 남습니다.",
      },
      {
        from: 34,
        to: 40,
        screen: "ACTIVITY 5",
        path: "/s3#a5",
        what: "평가요소 3개만 고르기",
        tip: "\"2~3개면 충분합니다\"를 못 박아 주세요. 늘리려는 분이 꼭 계십니다.",
      },
      {
        from: 40,
        to: 44,
        screen: "ACTIVITY 6 · SECTION 9",
        path: "/s3#a6",
        what: "학습 경험 + 피드백 세 문장",
        tip: "활동을 나열하지 말고 증거에서 거꾸로 세우게 안내합니다.",
      },
      {
        from: 44,
        to: 50,
        screen: "FINAL · 성찰",
        path: "/final",
        what: "A4 설계안 출력 + 한 문장 성찰",
        tip: "워드클라우드를 프로젝터에 띄우고 몇 개를 소리 내어 읽으며 마무리합니다.",
      },
    ],
  },
];
