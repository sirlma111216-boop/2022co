import { useEffect, useMemo, useRef, useState } from "react";
import { tracePath } from "@/lib/ladder";
import type { LadderRung, LadderSlot } from "@/lib/types";
import { cn } from "@/lib/utils";

/** 카운트다운 3·2·1·출발 → 경로 이동 → 결과. 전부 합쳐 7초 남짓이면 충분하다. */
export const COUNTDOWN_MS = 2800;
export const TRACE_MS = 4200;
export const LADDER_TOTAL_MS = COUNTDOWN_MS + TRACE_MS;

const COL_GAP = 84;
const ROW_GAP = 16;
const DOT_R = 5;

type Pt = [number, number];

/** 한 사람이 내려가는 길을 꺾은선으로 편다 */
function polyline(path: number[], rows: number): Pt[] {
  const x = (c: number) => c * COL_GAP + COL_GAP / 2;
  const pts: Pt[] = [[x(path[0]), 0]];
  for (let r = 0; r < rows; r++) {
    const y = (r + 1) * ROW_GAP;
    pts.push([x(path[r]), y]);
    if (path[r + 1] !== path[r]) pts.push([x(path[r + 1]), y]);
  }
  pts.push([x(path[rows]), (rows + 1) * ROW_GAP]);
  return pts;
}

function pointAt(pts: Pt[], lens: number[], total: number, t: number): Pt {
  const want = total * Math.max(0, Math.min(1, t));
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = lens[i - 1];
    if (acc + seg >= want || i === pts.length - 1) {
      const k = seg === 0 ? 0 : (want - acc) / seg;
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
    }
    acc += seg;
  }
  return pts[pts.length - 1];
}

const d = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");

/**
 * 사다리 판.
 *
 * 자리를 고르는 동안(mode="seating")에는 세로선만 그리고 가로줄은 감춘다 —
 * 경로를 미리 세어 보고 발표를 피하는 일이 없어야 하기 때문이다.
 * 결과를 볼 때(mode="result")는 저장된 씨앗으로 만든 똑같은 가로줄을 모두가 본다.
 */
export function LadderBoard({
  cols,
  rows,
  rungs,
  slots,
  presentSlots,
  seatOwner,
  myUid,
  onPickSeat,
  disabledSeats,
  mode,
  /** 결과 애니메이션 시작 시각(ms). null 이면 정지 화면 */
  traceStart,
}: {
  cols: number;
  rows: number;
  rungs: LadderRung[];
  /** 결과 화면에서 열 순서대로의 참가자 */
  slots?: LadderSlot[];
  presentSlots?: number[];
  /** 자리 고르는 중일 때 그 자리의 주인 */
  seatOwner?: (seat: number) => LadderSlot | null;
  myUid?: string | null;
  onPickSeat?: (seat: number) => void;
  disabledSeats?: boolean;
  mode: "seating" | "result";
  traceStart?: number | null;
}) {
  const width = Math.max(cols, 1) * COL_GAP;
  const height = (rows + 1) * ROW_GAP;

  const paths = useMemo(() => {
    if (mode !== "result") return [];
    return Array.from({ length: cols }, (_, i) => {
      const pts = polyline(tracePath(i, rungs, rows), rows);
      const lens = pts.slice(1).map((p, k) => Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]));
      return { pts, lens, total: lens.reduce((a, b) => a + b, 0), end: tracePath(i, rungs, rows)[rows] };
    });
  }, [cols, rows, rungs, mode]);

  const dotsRef = useRef<(SVGCircleElement | null)[]>([]);
  const [done, setDone] = useState(traceStart == null);

  /* 경로 이동은 React 상태를 거치지 않는다 — 30명이 60fps로 다시 그려지면 화면이 버벅인다 */
  useEffect(() => {
    if (mode !== "result") return;
    if (traceStart == null) {
      setDone(true);
      return;
    }
    let raf = 0;
    const tick = () => {
      const t = (Date.now() - traceStart) / TRACE_MS;
      paths.forEach((p, i) => {
        const dot = dotsRef.current[i];
        if (!dot) return;
        const [x, y] = pointAt(p.pts, p.lens, p.total, t);
        dot.setAttribute("cx", String(x));
        dot.setAttribute("cy", String(y));
      });
      if (t >= 1) {
        setDone(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    setDone(false);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paths, traceStart, mode]);

  const isPresent = (i: number) => (presentSlots ?? []).includes(i);
  const winners = useMemo(
    () => paths.map((p, i) => ({ i, end: p.end })).filter((p) => isPresent(p.end)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paths, presentSlots],
  );

  return (
    <div className="overflow-x-auto pb-1">
      <div style={{ width, minWidth: "100%" }}>
        {/* ── 상단: 자리 / 이름 ─────────────────────────────── */}
        <div className="flex">
          {Array.from({ length: cols }, (_, i) => {
            const owner = mode === "seating" ? seatOwner?.(i) ?? null : slots?.[i] ?? null;
            const mine = !!owner && owner.uid === myUid;
            const clickable = mode === "seating" && !!onPickSeat && !disabledSeats && !owner;
            return (
              <div key={i} style={{ width: COL_GAP }} className="flex justify-center px-1">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={clickable ? () => onPickSeat?.(i) : undefined}
                  title={owner?.nick ?? `${i + 1}번 자리`}
                  className={cn(
                    "w-full rounded-md border px-1 py-2 text-center text-fine leading-tight transition-transform",
                    clickable && "border-hairline bg-canvas text-ink-80 hover:border-action hover:text-action active:scale-[0.96]",
                    !clickable && !owner && "cursor-default border-dashed border-hairline bg-canvas text-ink-48",
                    owner && !mine && "cursor-default border-transparent bg-canvas-parchment font-semibold text-ink",
                    mine && "cursor-default border-action bg-action/10 font-semibold text-action",
                  )}
                >
                  <span className="block truncate">{owner ? owner.nick : i + 1}</span>
                  {mine && <span className="mt-0.5 block text-[0.62rem] font-normal">내 자리</span>}
                </button>
              </div>
            );
          })}
        </div>

        {/* ── 사다리 ─────────────────────────────────────────── */}
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="mt-2 block"
          aria-hidden="true"
        >
          {/* 세로선 */}
          {Array.from({ length: cols }, (_, i) => (
            <line
              key={i}
              x1={i * COL_GAP + COL_GAP / 2}
              y1={0}
              x2={i * COL_GAP + COL_GAP / 2}
              y2={height}
              stroke="#d8d8dd"
              strokeWidth={2}
              strokeLinecap="round"
            />
          ))}

          {/* 가로줄 — 자리를 고르는 동안에는 그리지 않는다 */}
          {mode === "result" &&
            rungs.map((r, k) => (
              <line
                key={k}
                x1={r.left * COL_GAP + COL_GAP / 2}
                y1={(r.row + 1) * ROW_GAP}
                x2={(r.left + 1) * COL_GAP + COL_GAP / 2}
                y2={(r.row + 1) * ROW_GAP}
                stroke="#d8d8dd"
                strokeWidth={2}
                strokeLinecap="round"
              />
            ))}

          {/* 다 내려온 뒤 발표자 두 경로만 진하게 */}
          {mode === "result" &&
            done &&
            winners.map((w) => (
              <path
                key={w.i}
                d={d(paths[w.i].pts)}
                fill="none"
                stroke="#0066cc"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

          {/* 내려가는 점 — 발표자로 결정될 두 점만 파랗다 */}
          {mode === "result" &&
            paths.map((p, i) => (
              <circle
                key={i}
                ref={(el) => {
                  dotsRef.current[i] = el;
                }}
                cx={p.pts[0][0]}
                cy={p.pts[0][1]}
                r={isPresent(p.end) ? DOT_R + 1 : DOT_R - 1}
                fill={isPresent(p.end) ? "#0066cc" : "#b9b9c0"}
              />
            ))}
        </svg>

        {/* ── 하단: 발표! / 경청! ────────────────────────────── */}
        <div className="mt-2 flex">
          {Array.from({ length: cols }, (_, i) => (
            <div key={i} style={{ width: COL_GAP }} className="px-1">
              <div
                className={cn(
                  "rounded-md px-1 py-2 text-center text-fine font-semibold",
                  mode === "seating" && "border border-dashed border-hairline text-ink-48",
                  mode === "result" && isPresent(i) && "bg-action text-white",
                  mode === "result" && !isPresent(i) && "bg-canvas-parchment text-ink-48",
                )}
              >
                {mode === "seating" ? "?" : isPresent(i) ? "발표!" : "경청!"}
              </div>
            </div>
          ))}
        </div>

        {mode === "seating" && (
          <p className="mt-3 text-center text-caption text-ink-48">
            사다리 준비 중… 가로줄은 강사가 결과를 열 때 만들어집니다.
          </p>
        )}
      </div>
    </div>
  );
}
