import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useSession } from "@/lib/session-context";
import { SCHOOL_LEVELS } from "@/lib/types";
import { SUBJECT_CHOICES } from "@/lib/subject";
import { cn } from "@/lib/utils";
import { normalizeCode } from "@/lib/utils";

/**
 * 입장 실패 원인을 한국어로 풀어 준다.
 *
 * 일반화된 "입장하지 못했습니다"만 보여 주면 연수 당일에 원인을 찾을 수 없다.
 * Firebase 설정 실수는 대부분 아래 몇 가지 코드로 나타나므로, 무엇을 고쳐야 하는지까지 적는다.
 */
function explainJoinError(e: unknown): string {
  const code = typeof e === "object" && e && "code" in e ? String((e as { code: unknown }).code) : "";
  const map: Record<string, string> = {
    "auth/admin-restricted-operation":
      "Firebase 콘솔에서 익명 로그인이 꺼져 있습니다. Authentication → Sign-in method → '익명'을 사용 설정해 주세요.",
    "auth/operation-not-allowed":
      "Firebase 콘솔에서 익명 로그인이 꺼져 있습니다. Authentication → Sign-in method → '익명'을 사용 설정해 주세요.",
    "auth/configuration-not-found":
      "Firebase 프로젝트에 Authentication이 아직 설정되지 않았습니다. 콘솔에서 Authentication → 시작하기를 눌러 주세요.",
    "auth/unauthorized-domain":
      "이 주소가 Firebase의 승인된 도메인 목록에 없습니다. Authentication → Settings → 승인된 도메인에 추가해 주세요.",
    "auth/network-request-failed": "네트워크에 연결하지 못했습니다. 인터넷 상태를 확인해 주세요.",
    "permission-denied":
      "Firestore 보안 규칙이 접근을 막고 있습니다. `firebase deploy --only firestore:rules` 로 규칙을 올려 주세요.",
    unavailable:
      "Firestore 데이터베이스에 연결하지 못했습니다. 콘솔에서 Firestore Database가 생성되어 있는지 확인해 주세요.",
    "failed-precondition":
      "Firestore 데이터베이스가 아직 만들어지지 않았습니다. 콘솔에서 Firestore Database → 데이터베이스 만들기를 눌러 주세요.",
  };
  if (map[code]) return map[code];
  const raw = e instanceof Error ? e.message : String(e);
  return `입장하지 못했습니다. 잠시 후 다시 시도해 주세요. (원인: ${code || raw.slice(0, 120)})`;
}

export default function Join() {
  const navigate = useNavigate();
  const { join, joined, profile, mode, leave } = useSession();

  const [code, setCode] = useState("DEMO");
  const [nickname, setNickname] = useState("");
  // 기본값을 과학으로 두지 않는다. 고르지 않으면 시작할 수 없다.
  const [subject, setSubject] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("중학교");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject) {
      setError("담당 교과를 선택해 주세요. 이후 예시가 그 교과로 바뀝니다.");
      return;
    }
    if (!nickname.trim()) {
      setError("닉네임을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await join(normalizeCode(code) || "DEMO", {
        nickname: nickname.trim().slice(0, 20),
        subject,
        schoolLevel,
      });
      navigate("/start");
    } catch (e) {
      setError(explainJoinError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* 히어로 — 흰 면에서 시작한다 */}
      <section className="bg-canvas pt-16 sm:pt-24">
        <div className="content-w text-center">
          <p className="text-fine font-semibold uppercase tracking-[0.16em] text-action">
            2022 개정 교육과정 · 교사 연수
          </p>
          <h1 className="mx-auto mt-4 max-w-[16ch] text-[2.5rem] leading-[1.08] tracking-[-0.024em] sm:text-[3.5rem]">
            수업을 거꾸로 설계합니다.
          </h1>
          <p className="mx-auto mt-6 max-w-[46ch] text-lead-airy text-ink-80">
            활동에서 시작하지 않습니다. 학생에게 무엇이 남아야 하는지에서 출발해,
            그것을 확인할 증거를 정하고, 마지막에 수업을 세웁니다.
          </p>
          <p className="mx-auto mt-5 max-w-[44ch] text-body-sm text-ink-48">
            150분 뒤, 선생님의 교과와 단원으로 만든
            <br className="hidden sm:block" /> A4 한 장짜리 수업·평가 설계안을 가지고 나가시게 됩니다.
          </p>
        </div>
      </section>

      {/* 진행 흐름 미리보기 */}
      <section className="bg-canvas py-12">
        <div className="content-w">
          <ol className="grid gap-px overflow-hidden rounded-lg bg-hairline sm:grid-cols-3">
            {[
              { n: "1교시", t: "교육과정을 읽다", d: "성취기준을 세 차원으로 해부합니다." },
              { n: "2교시", t: "무엇을 남길 것인가", d: "남길 이해와 탐구질문을 만듭니다." },
              { n: "3교시", t: "어떻게 확인할 것인가", d: "수행과제·루브릭·피드백을 설계합니다." },
            ].map((s) => (
              <li key={s.n} className="bg-canvas px-6 py-7">
                <p className="text-fine font-semibold uppercase tracking-[0.1em] text-action">{s.n}</p>
                <p className="mt-2 text-tagline">{s.t}</p>
                <p className="mt-1.5 text-caption leading-[1.6] text-ink-48">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 입장 폼 — 파치먼트 면으로 전환해 구분한다 */}
      <section className="bg-canvas-parchment py-14 sm:py-[72px]">
        <div className="mx-auto w-full max-w-[520px] px-5">
          <h2 className="text-display-md">입장하기</h2>
          <p className="mt-2 text-body-sm text-ink-48">
            회원가입은 없습니다. 닉네임만 있으면 시작할 수 있습니다.
          </p>

          {joined && profile && (
            <div className="mt-6 rounded-lg border border-action/35 bg-canvas px-5 py-4">
              <p className="text-body-sm text-ink">
                이미 <strong className="font-semibold">{profile.nickname}</strong> 님으로 입장해 있습니다.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => navigate("/start")}>
                  이어서 진행하기
                </Button>
                <Button variant="quiet" size="sm" onClick={leave}>
                  다른 사람으로 입장
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-5 rounded-lg border border-hairline bg-canvas p-6">
            <div className="space-y-2">
              <Label htmlFor="code">연수 코드</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="강사가 알려 준 코드"
                autoComplete="off"
                className="tabular tracking-[0.12em]"
              />
              <p className="text-fine text-ink-48">
                코드를 받지 못하셨다면 <strong>DEMO</strong> 그대로 두고 시작하셔도 됩니다.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nick">
                닉네임 <span className="text-action">필수</span>
              </Label>
              <Input
                id="nick"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: 빛나는과학샘"
                maxLength={20}
                autoComplete="off"
              />
              <p className="text-fine text-ink-48">실명 대신 편한 별명을 적어 주세요.</p>
            </div>

            {/* 교과는 이후 150분 동안 보게 될 모든 예시를 결정한다 — 눈에 띄게 고르게 한다 */}
            <div className="space-y-2">
              <Label>
                담당 교과를 선택해 주세요 <span className="text-action">필수</span>
              </Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {SUBJECT_CHOICES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSubject(s.name)}
                    aria-pressed={subject === s.name}
                    className={cn(
                      "rounded-md border px-3 py-2.5 text-body-sm transition-transform active:scale-[0.97]",
                      subject === s.name
                        ? "border-action bg-action text-white"
                        : "border-hairline bg-canvas text-ink-80 hover:border-action hover:text-action",
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              <p className="text-fine text-ink-48">
                이후 화면의 모든 예시가 선택하신 교과로 바뀝니다. 나중에 상단에서 바꿀 수 있습니다.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">학교급</Label>
              <Select id="level" value={schoolLevel} onChange={(e) => setSchoolLevel(e.target.value)}>
                {SCHOOL_LEVELS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>

            {error && <p className="text-caption text-bad">{error}</p>}

            <Button type="submit" className="w-full" size="md" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              연수 시작하기
            </Button>

            <p className="flex items-start gap-2 border-t border-hairline pt-4 text-fine leading-[1.65] text-ink-48">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                실명·학교명·학생 정보는 묻지 않습니다. 담벼락에는 닉네임·교과·학교급만 표시됩니다.
                {mode === "local" && " 지금은 이 기기에만 저장되는 로컬 모드입니다."}
              </span>
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
