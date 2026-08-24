/**
 * Firebase Cloud Functions 배포용 엔트리포인트.
 *
 * Cloudflare Pages 대신 Firebase Hosting + Functions로 배포할 때 사용한다.
 * 로직은 `shared/ai-core.ts` 하나를 Cloudflare 구현과 공유한다.
 *
 * 시크릿 등록:
 *   firebase functions:secrets:set GCP_SERVICE_ACCOUNT
 *   firebase functions:secrets:set GEMINI_API_KEY      # (선택) 로컬/폴백용
 *
 * firebase.json 의 hosting rewrites 가 /api/ai-review → aiReview 로 연결한다.
 */
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import { handleReview } from "../../shared/ai-core";

const gcpServiceAccount = defineSecret("GCP_SERVICE_ACCOUNT");
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const genAiModel = defineString("GEN_AI_MODEL", { default: "gemini-2.5-flash-lite" });
const ratePerMin = defineString("AI_RATE_PER_MIN", { default: "6" });

export const aiReview = onRequest(
  {
    region: "asia-northeast3",
    secrets: [gcpServiceAccount, geminiApiKey],
    cors: true,
    memory: "256MiB",
    timeoutSeconds: 60,
    maxInstances: 5,
  },
  async (req, res) => {
    // 실패해도 200 + JSON. 클라이언트는 항상 { ok, ... } 만 본다.
    if (req.method !== "POST") {
      res.status(200).json({ ok: false, message: "POST로 요청해 주세요." });
      return;
    }
    const ip = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ?? "anon";
    const result = await handleReview(req.body, {
      GCP_SERVICE_ACCOUNT: gcpServiceAccount.value() || undefined,
      GEMINI_API_KEY: geminiApiKey.value() || undefined,
      GEN_AI_MODEL: genAiModel.value(),
      AI_RATE_PER_MIN: ratePerMin.value(),
    }, ip);
    res.set("Cache-Control", "no-store");
    res.status(200).json(result);
  },
);
