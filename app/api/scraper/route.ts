import { extractMetadata } from "@/lib/extract";
import { NextRequest, NextResponse } from "next/server";

const VALID_URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL이 필요해요." },
        { status: 400 }
      );
    }

    if (!VALID_URL_REGEX.test(url)) {
      return NextResponse.json(
        { success: false, error: "유효한 URL 형식이 아니에요. http:// 또는 https:// 로 시작하는지 확인해 주세요." },
        { status: 400 }
      );
    }

    const meta = await extractMetadata(url);

    return NextResponse.json({
      success: true,
      data: {
        url: meta.url,
        title: meta.title,
        summary: meta.description,
        site_name: meta.site_name,
        favicon_url: meta.favicon_url,
      },
    });
  } catch (err) {
    console.error("🔥 scraper 에러:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.",
      },
      { status: 500 }
    );
  }
}
