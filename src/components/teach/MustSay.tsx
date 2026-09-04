import { Megaphone } from "lucide-react";
import { MUST_SAY_MAP } from "@/content/mustSay";
import { useSession } from "@/lib/session-context";
import { cn } from "@/lib/utils";

/**
 * 「반드시 소리 내어 읽어야 하는 문장」.
 *
 * 연수생 화면에서는 그냥 강조된 핵심 문장으로 보이고,
 * 발표 모드(강사)에서만 빨간 표식과 '왜 빼면 안 되는가'가 함께 뜬다.
 * 프로젝터를 미러링해도 강사용 메모가 학생에게 노출되지 않는다.
 *
 * 여덟 개뿐이다. 늘리면 강조가 강조가 아니게 된다.
 */
export function MustSay({ id, className }: { id: string; className?: string }) {
  const { presentMode } = useSession();
  const line = MUST_SAY_MAP[id];
  if (!line) return null;

  return (
    <blockquote
      className={cn(
        "my-9 overflow-hidden rounded-lg border-l-[5px] bg-canvas-parchment",
        presentMode ? "border-[#c0392b]" : "border-action",
        className,
      )}
    >
      {presentMode && (
        <p className="flex items-center gap-2 bg-[#c0392b] px-5 py-2 text-fine font-semibold uppercase tracking-[0.1em] text-white">
          <Megaphone className="h-3.5 w-3.5" aria-hidden />
          반드시 짚고 갈 문장
        </p>
      )}
      <p className="px-6 py-7 text-[1.35rem] font-semibold leading-[1.5] tracking-[-0.015em] text-ink sm:px-8 sm:text-[1.6rem]">
        {line.text}
      </p>
      {presentMode && (
        <p className="border-t border-hairline bg-canvas px-6 py-3 text-caption leading-[1.6] text-ink-80 sm:px-8">
          <strong className="font-semibold text-[#c0392b]">빼면 안 되는 이유 · </strong>
          {line.why}
        </p>
      )}
    </blockquote>
  );
}
