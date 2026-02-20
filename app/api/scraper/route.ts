import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";

const VALID_URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

function getGoogleFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

function resolveUrl(base: string, relative: string): string {
  try {
    if (relative.startsWith("//")) {
      return `https:${relative}`;
    }
    if (relative.startsWith("http://") || relative.startsWith("https://")) {
      return relative;
    }
    const baseUrl = new URL(base);
    return new URL(relative, base).toString();
  } catch {
    return "";
  }
}

function isValidFaviconUrl(href: string, pageUrl: string): boolean {
  if (!href || !href.trim()) return false;
  const resolved = resolveUrl(pageUrl, href.trim());
  if (!resolved) return false;
  try {
    const parsed = new URL(resolved);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

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

    let html: string;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        return NextResponse.json(
          { success: false, error: `페이지를 가져오지 못했어요. (HTTP ${res.status})` },
          { status: 400 }
        );
      }

      html = await res.text();
    } catch (fetchErr) {
      const msg =
        fetchErr instanceof Error ? fetchErr.message : "페이지 fetch 실패";
      return NextResponse.json(
        { success: false, error: `페이지를 불러오는 데 실패했어요: ${msg}` },
        { status: 400 }
      );
    }

    const $ = cheerio.load(html);
    const baseUrl = new URL(url);
    const domain = baseUrl.hostname;

    const ogTitle = $('meta[property="og:title"]').attr("content");
    const pageTitle = $("title").first().text();
    const title =
      (ogTitle ?? pageTitle ?? domain).trim() || domain;

    const ogDesc = $('meta[property="og:description"]').attr("content");
    const metaDesc = $('meta[name="description"]').attr("content");
    const summary =
      (ogDesc ?? metaDesc ?? "")
        .trim()
        .slice(0, 300) ?? "";

    const ogSiteName = $('meta[property="og:site_name"]').attr("content");
    const siteName = (ogSiteName ?? domain).trim() || domain;

    let faviconUrl = "";
    const iconSelectors = [
      'link[rel="apple-touch-icon"][href]',
      'link[rel="icon"][href]',
      'link[rel="shortcut icon"][href]',
    ];
    for (const sel of iconSelectors) {
      const href = $(sel).first().attr("href");
      if (href && isValidFaviconUrl(href, url)) {
        faviconUrl = resolveUrl(url, href);
        break;
      }
    }
    if (!faviconUrl) {
      faviconUrl = getGoogleFaviconUrl(domain);
    }

    return NextResponse.json({
      success: true,
      data: {
        url,
        title,
        summary,
        site_name: siteName,
        favicon_url: faviconUrl,
      },
    });
  } catch (err) {
    console.error("🔥 scraper 에러:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.",
      },
      { status: 500 }
    );
  }
}
