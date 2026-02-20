#!/usr/bin/env npx tsx
/**
 * Gemini API 연결 성공률 체크 스크립트
 * 사용법: npx tsx scripts/check-gemini-success-rate.ts [횟수]
 * 예: npx tsx scripts/check-gemini-success-rate.ts 10  → 10회 요청 후 성공률 출력
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

const RUNS = parseInt(process.argv[2] ?? "5", 10);

async function main() {
  const { testGeminiConnection } = await import("../lib/gemini");

  console.log(`\n🔗 Gemini API 연결 테스트 (${RUNS}회)\n`);

  let success = 0;
  const latencies: number[] = [];

  for (let i = 0; i < RUNS; i++) {
    const result = await testGeminiConnection();
    if (result.ok) {
      success++;
      latencies.push(result.latencyMs ?? 0);
      process.stdout.write("✓");
    } else {
      process.stdout.write("✗");
      if (i === 0) console.log("\n에러:", result.error);
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  const rate = ((success / RUNS) * 100).toFixed(1);
  const avgLatency =
    latencies.length > 0
      ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(0)
      : "-";

  console.log(`\n\n📊 결과: ${success}/${RUNS} 성공 (${rate}%)`);
  console.log(`⏱️  평균 지연: ${avgLatency}ms\n`);
}

main().catch(console.error);
