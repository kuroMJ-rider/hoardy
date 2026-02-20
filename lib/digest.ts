import type { SupabaseClient } from "@supabase/supabase-js";
import { extractMetadata, type ExtractedMetadata } from "@/lib/extract";
import { createServiceClient } from "@/lib/supabase/server";
import { getGeminiClient } from "@/lib/gemini";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

/** DB 조회용 서랍 타입 */
interface DrawerRow {
  id: string;
  name: string;
  instruction: string | null;
}

/** 메타데이터를 AI 프롬프트용 맥락 문자열로 변환 */
function buildContextFromMetadata(meta: ExtractedMetadata): string {
  const lines = [`URL: ${meta.url}`];
  if (meta.title) lines.push(`제목: ${meta.title}`);
  if (meta.description) lines.push(`설명: ${meta.description}`);
  if (meta.site_name) lines.push(`사이트: ${meta.site_name}`);
  if (meta.favicon_url) lines.push(`파비콘: ${meta.favicon_url}`);
  return lines.join("\n");
}

/** Gemini가 분석한 결과 */
interface DigestResult {
  title: string;
  summary: string;
  site_name: string;
  favicon_url: string;
  drawer_id: string;
}

/** URL에서 favicon 기본 경로 유추 (Fallback) */
function guessFaviconUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}/favicon.ico`;
  } catch {
    return "";
  }
}

/** URL에서 site_name 유추 (Fallback: hostname) */
function guessSiteName(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    return host.split(".").slice(-2, -1)[0] ?? host;
  } catch {
    return "";
  }
}

/** 사용자 서랍 목록을 AI 프롬프트용 문자열로 변환 */
function formatDrawersForPrompt(drawers: DrawerRow[]): string {
  return drawers
    .map((d) => `[ID: ${d.id}, 이름: ${d.name}, 가이드: ${d.instruction ?? "(없음)"}]`)
    .join("\n");
}

/** AI로 메타데이터 기반 분석 수행 */
async function analyzeWithGemini(
  url: string,
  meta: ExtractedMetadata,
  drawers: DrawerRow[]
): Promise<DigestResult> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: MODEL });

  const hasDrawers = drawers.length > 0;
  const drawerSection = hasDrawers
    ? `사용자의 서랍 목록:
${formatDrawersForPrompt(drawers)}

유저의 서랍 가이드를 읽고, 이 링크와 가장 잘 어울리는 서랍의 **UUID**를 drawer_id 필드에 담아 JSON으로 반환해줘.
drawer_id는 반드시 아래 UUID 중 정확히 하나만 사용: ${drawers.map((d) => d.id).join(", ")}`
    : `drawer_id는 빈 문자열 ""로 둬줘.`;

  const context = buildContextFromMetadata(meta);

  const prompt = `추출된 메타데이터(제목/설명)를 바탕으로 이 링크가 유저에게 어떤 가치를 줄 수 있는지 분석해줘.
본문이 없어도 메타 정보를 활용해 핵심 가치를 추론해줘.

다음 JSON 형식으로만 답해:
{
  "title": "페이지 제목(최대 100자, 메타데이터 기반)",
  "summary": "유저에게 이 링크가 주는 가치를 3줄 요약(줄바꿈 \\n으로 구분, 최대 500자)",
  "site_name": "웹사이트 이름",
  "favicon_url": "파비콘 URL(있으면 그대로)",
  "drawer_id": "UUID 또는 빈문자열"
}

${drawerSection}

추출된 메타데이터:
${context}

JSON만 출력해줘.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = jsonMatch
    ? (JSON.parse(jsonMatch[0]) as Partial<DigestResult>)
    : {};

  const validUuid = hasDrawers && drawers.some((d) => d.id === parsed.drawer_id)
    ? parsed.drawer_id!
    : "";

  return {
    title: String(parsed.title ?? "").slice(0, 200) || url,
    summary: String(parsed.summary ?? "").slice(0, 500) || "",
    site_name: String(parsed.site_name ?? "").slice(0, 100) || "",
    favicon_url: String(parsed.favicon_url ?? "").slice(0, 500) || "",
    drawer_id: validUuid,
  };
}

/** 서랍 목록에서 Fallback용 UUID 선택 (인류학자 > 일반 > 첫 번째) */
function pickFallbackDrawerId(drawers: DrawerRow[]): string | null {
  if (drawers.length === 0) return null;
  const 일반 = drawers.find((d) => d.name.includes("일반"));
  if (일반) return 일반.id;
  return drawers[0].id;
}

/** archives 행에 AI 소화 결과를 적용 */
export async function digestLink(
  supabase: SupabaseClient,
  archiveId: string,
  url: string,
  existingDrawerId: string | null,
  userId: string
): Promise<void> {
  let drawers: DrawerRow[] = [];

  try {
    const serviceClient = createServiceClient();
    const { data } = await serviceClient
      .from("drawers")
      .select("id, name, instruction")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true });

    drawers = (data ?? []) as DrawerRow[];

    const meta = await extractMetadata(url);
    const result = await analyzeWithGemini(url, meta, drawers);

    let finalDrawerId = existingDrawerId ?? result.drawer_id;

    if (!finalDrawerId && drawers.length > 0) {
      finalDrawerId = pickFallbackDrawerId(drawers);
    }

    const validUuids = new Set(drawers.map((d) => d.id));
    const drawerIdToUse =
      finalDrawerId && validUuids.has(finalDrawerId) ? finalDrawerId : null;

    // Fallback: AI > 메타데이터 > URL 추론
    const title = result.title || meta.title || url;
    const siteName =
      result.site_name || meta.site_name || guessSiteName(url);
    const faviconUrl =
      result.favicon_url || meta.favicon_url || guessFaviconUrl(url);

    const updatePayload: Record<string, unknown> = {
      title: title.slice(0, 200),
      summary: result.summary,
      site_name: siteName || null,
      favicon_url: faviconUrl || null,
      extraction_status: "success",
      ...(drawerIdToUse ? { drawer_id: drawerIdToUse } : {}),
    };

    const { error } = await supabase
      .from("archives")
      .update(updatePayload)
      .eq("id", archiveId);

    if (error) {
      console.error("🔥 digest update 에러:", error.message);
    } else {
      console.log("✅ Digest Update Success:", archiveId);
    }
  } catch (err) {
    console.error("🔥 digest 실패 (archiveId:", archiveId, "):", err);

    const fallbackId = pickFallbackDrawerId(drawers);
    const fallbackPayload: Record<string, unknown> = {
      extraction_status: "failed",
      ...(fallbackId ? { drawer_id: fallbackId } : {}),
    };

    await supabase
      .from("archives")
      .update(fallbackPayload)
      .eq("id", archiveId);
  }
}
