import { useMemo } from "react";

export interface FloatingNote {
  id: string;
  text: string;
  /** 색을 정하는 값 — 같은 사람은 늘 같은 색이 된다. 화면에 보이지 않는다. */
  nick: string;
  /** 쪽지 아래에 실제로 찍히는 말 (익명 연수에서는 `익명 · 3분 전`) */
  who?: string;
}

/** 닉네임 글자 코드 합 → 같은 사람은 늘 같은 색이 된다(다시 그려도 안 바뀐다) */
function tintOf(nick: string) {
  let s = 0;
  const t = String(nick || "");
  for (let i = 0; i < t.length; i++) s += t.charCodeAt(i);
  return s % 6;
}

function Card({ note }: { note: FloatingNote }) {
  return (
    <div className={`note-card tint-${tintOf(note.nick)}`}>
      <p className="nc-text">{note.text}</p>
      <p className="nc-who">{note.who ?? "익명"}</p>
    </div>
  );
}

/**
 * 양옆으로 흐르는 포스트잇 벽.
 *
 * 지켜야 하는 것 네 가지 (전부 이유가 있다)
 *  1. 같은 묶음을 두 번 넣고 -50% 만 움직인다 → 한 바퀴 돌 때 빈 구간이 안 생긴다.
 *  2. 지속시간을 개수에 비례시킨다 → 사람이 늘어도 읽는 속도가 유지된다.
 *  3. 넓은 화면에서만 띄우고(CSS), 좁으면 아래 목록으로 대체한다 → 본문을 덮지 않는다.
 *  4. 마우스를 올리면 멈춘다 → 읽으려는 순간 지나가 버리면 기능이 아니다.
 *
 * 내가 쓴 글은 이미 화면 위에 있으므로 벽에서는 뺀다 — 같은 문장을 쓴 동료까지
 * 사라지지 않도록, 글자가 아니라 id 로 가려낸다.
 */
export function FloatingNotes({
  notes,
  excludeId,
  flatTitle = "지금까지 올라온 문장",
}: {
  notes: FloatingNote[];
  /** 내 글의 id — 벽에서 제외한다 */
  excludeId?: string;
  flatTitle?: string;
}) {
  const others = useMemo(
    () => notes.filter((n) => n.text?.trim() && n.id !== excludeId),
    [notes, excludeId],
  );

  const [left, right] = useMemo(() => {
    const a: FloatingNote[] = [];
    const b: FloatingNote[] = [];
    others.forEach((n, i) => (i % 2 ? b : a).push(n));
    return [a, b.length ? b : a.slice()];
  }, [others]);

  // 한 장이 혼자 도는 것은 어색하다
  if (others.length < 2) {
    return others.length === 1 ? (
      <div className="notes-flat mt-6">
        <p className="mb-3 text-caption font-semibold text-ink-48">{flatTitle}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((n) => (
            <Card key={n.id} note={n} />
          ))}
        </div>
      </div>
    ) : null;
  }

  const dur = (n: number) => `${Math.max(24, n * 9)}s`;

  return (
    <>
      {/* 넓은 화면 — 양옆으로 흐른다. 같은 내용이 아래 목록에도 있으므로 낭독은 그쪽에 맡긴다 */}
      <div className="notes-wall" aria-hidden="true">
        <div className="nw-col nw-up" style={{ animationDuration: dur(left.length) }}>
          {[0, 1].map((pass) =>
            left.map((n) => <Card key={`l${pass}-${n.id}`} note={n} />),
          )}
        </div>
        <div className="nw-col nw-down" style={{ animationDuration: dur(right.length) }}>
          {[0, 1].map((pass) =>
            right.map((n) => <Card key={`r${pass}-${n.id}`} note={n} />),
          )}
        </div>
      </div>

      {/* 좁은 화면·인쇄 — 흐르지 않고 그냥 늘어놓는다 */}
      <div className="notes-flat mt-6">
        <p className="mb-3 text-caption font-semibold text-ink-48">
          {flatTitle} · {others.length}개
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((n) => (
            <Card key={n.id} note={n} />
          ))}
        </div>
      </div>
    </>
  );
}
