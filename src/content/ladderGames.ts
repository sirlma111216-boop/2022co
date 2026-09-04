/**
 * 사다리 판 두 개.
 *
 * 고른 기준은 두 가지다 — 판단이 실제로 갈리는 자리인가, 그리고 그 자리에서
 * 말을 시키는 것이 흐름에 도움이 되는가.
 *
 *  start    150분의 문을 여는 자리. 아직 아무도 말을 안 꺼냈을 때 두 사람을 지목한다.
 *  question 2교시 중반. 본문이 이미 "C와 D가 많이 갈렸을 겁니다"라고 말하는 지점이고,
 *           시간상으로도 집중이 한 번 풀리는 구간이라 환기가 필요하다.
 *
 * 판마다 라운드·자리·사다리가 완전히 따로 논다. 앞판 결과는 뒷판에 영향을 주지 않는다.
 */
import { AUTOPSY_CASES, QUESTION_JUDGE_OPTIONS } from "./examples";
import type { DesignField, LadderGameId } from "@/lib/types";

export interface LadderGameDef {
  id: LadderGameId;
  /** 강사 화면 탭 이름 */
  tab: string;
  /** 연수생 화면 버튼 위에 붙는 문구 */
  lead: string;
  hint: string;
  /** 결과 카드에서 다시 보여 줄 응답 */
  choiceField: DesignField;
  reasonField: DesignField;
  options: { key: string; title: string }[];
  choiceLabel: string;
  /** 결과 카드 맨 아래 — 발표자에게 무엇을 말하라고 할 것인가 */
  askLine: string;
  /** 강사 화면 결과 아래 */
  presenterAsk: string;
}

export const LADDER_GAMES: Record<LadderGameId, LadderGameDef> = {
  start: {
    id: "start",
    tab: "START · 수업 부검실",
    lead: "같은 수업을 보고도 판단은 갈릴 수 있습니다.\n선생님 두 분의 의견을 직접 들어보겠습니다.",
    hint: "자리를 하나 골라 주세요. 사다리 끝에서 발표자가 결정됩니다.",
    choiceField: "autopsyChoice",
    reasonField: "autopsyReason",
    options: AUTOPSY_CASES,
    choiceLabel: "내 선택",
    askLine: "두 선생님께서 조금 전에 선택하신 수업과 그 이유를 들려주세요.",
    presenterAsk: "두 분께 조금 전 선택과 그 이유를 물어봐 주세요.",
  },
  question: {
    id: "question",
    tab: "2교시 · 좋은 질문 판별",
    lead: "여기서 판단이 가장 크게 갈립니다.\n선생님 두 분의 이유를 직접 들어보겠습니다.",
    hint: "자리를 하나 골라 주세요. 사다리 끝에서 발표자가 결정됩니다.",
    choiceField: "questionJudgeChoice",
    reasonField: "questionJudgeReason",
    options: QUESTION_JUDGE_OPTIONS,
    choiceLabel: "내가 고른 질문",
    askLine: "두 선생님께서 고르신 질문과, 그 질문이 오래 생각하게 만든다고 보신 이유를 들려주세요.",
    presenterAsk: "두 분께 고른 질문과 그 이유를 물어봐 주세요.",
  },
};

export const LADDER_GAME_LIST = [LADDER_GAMES.start, LADDER_GAMES.question];
