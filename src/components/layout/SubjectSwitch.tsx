import { useState } from "react";
import { BookMarked } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSession } from "@/lib/session-context";
import { SUBJECT_CHOICES, getSubjectLabel } from "@/lib/subject";
import { cn } from "@/lib/utils";

/**
 * 상단 바의 「교과」 칩. 눌러서 교과를 바꾼다.
 *
 * 바뀌는 것은 예시와 AI 점검 맥락뿐이다. 작성한 답변은 손대지 않는다 —
 * 잘못 고른 채로 150분을 버티게 하는 것보다, 언제든 바꿀 수 있게 하는 편이 낫다.
 */
export function SubjectSwitch() {
  const { profile, setSubject, lectureSubject } = useSession();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!profile) return null;

  const current = profile.subject;
  const pick = async (name: string) => {
    if (name === current) return setOpen(false);
    setBusy(true);
    await setSubject(name);
    setBusy(false);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="교과를 바꾸면 예시만 바뀝니다. 작성한 내용은 그대로 남습니다."
        className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-white/10 px-2.5 py-1 text-fine text-white/80 transition-transform hover:bg-white/20 active:scale-95"
      >
        <BookMarked className="h-3.5 w-3.5" />
        <span className="whitespace-nowrap">{getSubjectLabel(current)}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>담당 교과를 선택해 주세요</DialogTitle>
            <DialogDescription>
              교과를 변경하면 예시만 변경됩니다. 지금까지 작성한 내용은 유지됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto px-6 py-6">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SUBJECT_CHOICES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  disabled={busy}
                  onClick={() => void pick(s.name)}
                  className={cn(
                    "rounded-md border px-3 py-2.5 text-body-sm transition-transform active:scale-[0.97] disabled:opacity-50",
                    s.name === current
                      ? "border-action bg-action text-white"
                      : "border-hairline bg-canvas text-ink-80 hover:border-action hover:text-action",
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {lectureSubject && (
              <p className="mt-5 rounded-md bg-[#fdf4e3] px-4 py-3 text-caption text-warn">
                지금 이 브라우저는 강사용 「강의 예시 교과 ·{" "}
                {getSubjectLabel(lectureSubject)}」로 고정되어 있습니다. 화면의 예시는 그쪽을 따릅니다.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
