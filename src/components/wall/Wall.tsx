import { useEffect, useMemo, useState } from "react";
import { Heart, MessageSquare, Pin, Send, Share2, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { repo } from "@/lib/repo";
import { useSession } from "@/lib/session-context";
import { ACTIVITY_LABEL, type ActivityId, type Post } from "@/lib/types";
import { cn, relativeTime } from "@/lib/utils";

type SortKey = "recent" | "likes" | "pinned";

/**
 * 담벼락 구독 훅 — 활동별로 실시간 카드 목록을 준다.
 * 강사 대시보드는 참가자로 입장하지 않은 채 다른 세션을 보므로 sessionId를 직접 넘길 수 있다.
 */
function useWall(activityId: ActivityId, enabled = true, sessionIdOverride?: string) {
  const { sessionId: ctxSessionId } = useSession();
  const sessionId = sessionIdOverride ?? ctxSessionId;
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    if (!sessionId || !enabled) return;
    return repo.watchPosts(sessionId, activityId, setPosts);
  }, [sessionId, activityId, enabled]);
  return posts;
}

/** 활동 하단 버튼 줄: [공유하기] [다른 선생님들의 생각 보기] */
export function ShareBar({
  activityId,
  content,
  canShare,
  hint,
}: {
  activityId: ActivityId;
  content: () => Record<string, string>;
  canShare: boolean;
  hint?: string;
}) {
  const { sessionId, uid, profile } = useSession();
  const posts = useWall(activityId);
  const [open, setOpen] = useState(false);
  const [shared, setShared] = useState(false);

  const mine = posts.find((p) => p.uid === uid);

  const share = async () => {
    if (!sessionId || !uid || !profile) return;
    await repo.addPost(sessionId, {
      uid,
      nickname: profile.nickname,
      subject: profile.subject,
      schoolLevel: profile.schoolLevel,
      activityId,
      content: content(),
    });
    setShared(true);
    window.setTimeout(() => setShared(false), 2600);
  };

  return (
    <>
      <div className="flex w-full flex-wrap items-center gap-3">
        <Button variant="primary" size="sm" onClick={share} disabled={!canShare}>
          <Share2 className="h-4 w-4" />
          {mine ? "다시 공유하기" : "공유하기"}
        </Button>
        <Button variant="pearl" size="sm" onClick={() => setOpen(true)}>
          <Users className="h-4 w-4" />
          다른 선생님들의 생각 보기
          {posts.length > 0 && <span className="tabular text-ink-48">{posts.length}</span>}
        </Button>
        <span className="text-fine text-ink-48">
          {shared ? "담벼락에 올렸습니다." : !canShare ? (hint ?? "내용을 먼저 작성해 주세요.") : ""}
        </span>
      </div>

      <WallDialog activityId={activityId} open={open} onOpenChange={setOpen} />
    </>
  );
}

export function WallDialog({
  activityId,
  open,
  onOpenChange,
  moderate = false,
  sessionId,
}: {
  activityId: ActivityId;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  moderate?: boolean;
  sessionId?: string;
}) {
  const posts = useWall(activityId, open, sessionId);
  const [sort, setSort] = useState<SortKey>("pinned");

  const sorted = useMemo(() => {
    const arr = [...posts];
    if (sort === "recent") arr.sort((a, b) => b.createdAt - a.createdAt);
    if (sort === "likes") arr.sort((a, b) => b.likes - a.likes || b.createdAt - a.createdAt);
    if (sort === "pinned")
      arr.sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.createdAt - a.createdAt);
    return arr;
  }, [posts, sort]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent wide className="h-[86vh]">
        <DialogHeader>
          <DialogTitle>다른 선생님들의 생각 · {ACTIVITY_LABEL[activityId]}</DialogTitle>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {(
              [
                ["pinned", "강사 추천"],
                ["recent", "최신순"],
                ["likes", "공감순"],
              ] as [SortKey, string][]
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setSort(k)}
                className={cn(
                  "rounded-pill border px-3.5 py-1.5 text-caption transition-transform active:scale-95",
                  sort === k
                    ? "border-action bg-action text-white"
                    : "border-hairline bg-canvas text-ink-80",
                )}
              >
                {label}
              </button>
            ))}
            <span className="ml-auto tabular text-fine text-ink-48">{posts.length}개</span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-canvas-parchment px-5 py-5 sm:px-6">
          {sorted.length === 0 ? (
            <p className="py-16 text-center text-body-sm text-ink-48">
              아직 올라온 카드가 없습니다. 먼저 공유해 보세요.
            </p>
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
              {sorted.map((p) => (
                <WallCard key={p.id} post={p} moderate={moderate} sessionId={sessionId} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function WallCard({
  post,
  moderate = false,
  sessionId: sessionIdOverride,
}: {
  post: Post;
  moderate?: boolean;
  sessionId?: string;
}) {
  const { sessionId: ctxSessionId, uid, profile } = useSession();
  const sessionId = sessionIdOverride ?? ctxSessionId;
  const [comment, setComment] = useState("");
  const liked = !!uid && post.likedBy.includes(uid);

  const toggle = () => {
    if (!sessionId || !uid) return;
    void repo.toggleLike(sessionId, post.id, uid, !liked);
  };

  const send = () => {
    if (!sessionId || !uid || !profile || !comment.trim()) return;
    void repo.addComment(sessionId, post.id, uid, profile.nickname, comment.trim().slice(0, 60));
    setComment("");
  };

  const entries = Object.entries(post.content).filter(([, v]) => v && v.trim());

  return (
    <article
      className={cn(
        "break-inside-avoid rounded-lg border bg-canvas p-4",
        post.isPinned ? "border-action" : "border-hairline",
      )}
    >
      {post.isPinned && (
        <Badge tone="action" className="mb-2">
          <Pin className="h-3 w-3" /> 함께 보기
        </Badge>
      )}

      <div className="mb-2 flex flex-wrap items-baseline gap-2">
        <span className="text-caption font-semibold text-ink">{post.nickname}</span>
        <span className="text-fine text-ink-48">
          {[post.schoolLevel, post.subject].filter(Boolean).join(" · ")}
        </span>
        <span className="ml-auto text-fine text-ink-48">{relativeTime(post.createdAt)}</span>
      </div>

      <dl className="space-y-2">
        {entries.map(([k, v]) => (
          <div key={k}>
            <dt className="text-fine font-semibold text-ink-48">{k}</dt>
            <dd className="whitespace-pre-line text-body-sm leading-[1.6] text-ink-80">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 flex items-center gap-2 border-t border-hairline pt-3">
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-caption transition-transform active:scale-95",
            liked ? "bg-action/10 text-action" : "text-ink-48 hover:bg-canvas-parchment",
          )}
        >
          <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
          <span className="tabular">{post.likes}</span>
        </button>
        <span className="inline-flex items-center gap-1.5 text-caption text-ink-48">
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="tabular">{post.comments.length}</span>
        </span>

        {moderate && sessionId && (
          <span className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => void repo.pinPost(sessionId, post.id, !post.isPinned)}
              className="rounded-md px-2 py-1 text-fine text-action hover:bg-action/5"
            >
              {post.isPinned ? "고정 해제" : "함께 보기"}
            </button>
            <button
              type="button"
              onClick={() => void repo.deletePost(sessionId, post.id)}
              className="rounded-md p-1.5 text-ink-48 hover:bg-canvas-parchment"
              aria-label="삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
      </div>

      {post.comments.length > 0 && (
        <ul className="mt-2 space-y-1">
          {post.comments.slice(-4).map((c, i) => (
            <li key={i} className="text-fine leading-[1.55] text-ink-80">
              <span className="font-semibold text-ink">{c.nickname}</span> {c.text}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex items-center gap-1.5">
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="한 줄 댓글"
          className="px-3 py-1.5 text-caption"
          maxLength={60}
        />
        <Button variant="quiet" size="sm" onClick={send} aria-label="댓글 등록" className="shrink-0 px-2">
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </article>
  );
}
