import { NextResponse } from "next/server";
import { testGeminiConnection } from "@/lib/gemini";

/** Gemini API 연결 테스트 및 성공률 확인 */
export async function GET() {
  const result = await testGeminiConnection();
  return NextResponse.json({
    gemini: {
      ok: result.ok,
      latencyMs: result.latencyMs,
      error: result.error,
      model: result.model,
      apiKeyConfigured: !!(process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    },
    timestamp: new Date().toISOString(),
  });
}
