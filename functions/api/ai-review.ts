/**
 * Cloudflare Pages Function — POST /api/ai-review
 *
 * 실제 로직은 `shared/ai-core.ts`에 있다 (Firebase Cloud Functions 구현과 공유).
 * 이 파일은 요청/응답 껍데기만 담당한다.
 *
 * ★ 응답은 성공이든 실패든 항상 HTTP 200 + JSON이다.
 *   함수가 5xx를 던지면 Cloudflare 엣지가 본문을 평문 "error code: 502"로 덮어써
 *   진짜 원인이 화면에서도 로그에서도 보이지 않게 된다.
 */
import { handleReview, type Env } from "../../shared/ai-core";

function json(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

interface Ctx {
  request: Request;
  env: Env;
}

export async function onRequestPost(ctx: Ctx): Promise<Response> {
  let body: unknown = null;
  try {
    body = await ctx.request.json();
  } catch {
    return json({ ok: false, message: "요청을 읽지 못했습니다. 새로고침 후 다시 시도해 주세요." });
  }
  const ip = ctx.request.headers.get("CF-Connecting-IP") ?? "anon";
  return json(await handleReview(body, ctx.env, ip));
}

export async function onRequestGet(): Promise<Response> {
  return json({ ok: false, message: "POST로 요청해 주세요." });
}
