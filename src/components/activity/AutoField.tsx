import { useEffect, useRef, useState } from "react";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ProgressiveHelp } from "./ProgressiveHelp";
import { useSession } from "@/lib/session-context";
import type { DesignField } from "@/lib/types";
import { cn, countChars } from "@/lib/utils";

/**
 * 설계안 문서의 필드 하나에 묶인 자동저장 입력칸.
 * 입력 → 700ms 뒤 저장. 저장 상태는 화면 우상단 SaveIndicator가 한 곳에서만 알린다
 * (칸마다 "저장됨"이 깜빡이면 시선이 산만해진다).
 */
export function AutoField({
  field,
  label,
  help,
  placeholder,
  rows = 3,
  single = false,
  recommend,
  hint1,
  hint2,
  example,
  className,
}: {
  field: DesignField;
  label: string;
  help?: string;
  placeholder?: string;
  rows?: number;
  single?: boolean;
  /** 권장 글자 수 (넘어가면 부드럽게 안내만 한다 — 막지 않는다) */
  recommend?: number;
  /** 1차 힌트 — [조금 막혔어요] 를 눌렀을 때만 열린다 */
  hint1?: string;
  /** 2차 힌트 */
  hint2?: string;
  /** 실제 예시 — [예시 보기] 를 눌렀을 때만 열린다 */
  example?: string;
  className?: string;
}) {
  const { design, update } = useSession();
  const remote = (design[field] as string) ?? "";
  const [value, setValue] = useState(remote);
  const dirty = useRef(false);

  // AI 제안 적용 등 외부에서 값이 바뀐 경우에만 따라간다.
  useEffect(() => {
    if (!dirty.current && remote !== value) setValue(remote);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remote]);

  const onChange = (v: string) => {
    dirty.current = true;
    setValue(v);
    update({ [field]: v });
    window.setTimeout(() => (dirty.current = false), 900);
  };

  const chars = countChars(value);
  const over = recommend !== undefined && chars > recommend;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Label htmlFor={`f-${field}`}>{label}</Label>
        {recommend !== undefined && (
          <span className={cn("tabular text-fine", over ? "text-warn" : "text-ink-48")}>
            {chars}자 {over ? `· 권장 ${recommend}자 내외` : `/ 권장 ${recommend}자`}
          </span>
        )}
      </div>

      {help && <p className="text-caption leading-[1.6] text-ink-48">{help}</p>}

      {single ? (
        <Input
          id={`f-${field}`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Textarea
          id={`f-${field}`}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      <ProgressiveHelp hint1={hint1} hint2={hint2} example={example} />
    </div>
  );
}
