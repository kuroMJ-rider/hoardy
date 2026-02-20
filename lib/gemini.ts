import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY =
  process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export function getGeminiClient() {
  if (!API_KEY) {
    throw new Error(
      "Gemini API 키가 없어. .env.local에 GEMINI_API_KEY를 설정해줘."
    );
  }
  return new GoogleGenerativeAI(API_KEY);
}

/** 연결 테스트용 간단한 요청 (토큰 최소화) */
export async function testGeminiConnection(): Promise<{
  ok: boolean;
  latencyMs?: number;
  error?: string;
  model?: string;
}> {
  const start = Date.now();
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    });
    const result = await model.generateContent("1");
    const response = await result.response;
    const text = response.text();
    const latencyMs = Date.now() - start;
    return {
      ok: !!text,
      latencyMs,
      model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    };
  } catch (err) {
    const latencyMs = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      latencyMs,
      error: message,
    };
  }
}
