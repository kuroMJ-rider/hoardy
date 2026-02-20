import * as cheerio from "cheerio";

/** 추출된 메타데이터 (추출 실패 시에도 URL 정보는 포함) */
export interface ExtractedMetadata {
  url: string;
  title: string;
  description: string;
  site_name: string;
  favicon_url: string;
}

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const TIMEOUT_MS = 10_000;

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function guessSiteName(url: string): string {
  const host = getHostname(url);
  return host.split(".").slice(-2, -1)[0] ?? host;
}

function googleFaviconFallback(url: string): string {
  const host = getHostname(url);
  return host
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`
    : "";
}

function resolveHref(href: string, baseUrl: string): string {
  if (!href || !href.trim()) return "";
  try {
    if (href.startsWith("//")) return `https:${href}`;
    if (href.startsWith("http://") || href.startsWith("https://")) return href;
    return new URL(href, baseUrl).href;
  } catch {
    return "";
  }
}

/**
 * Cheerio 기반 메타데이터 스크래퍼
 * title, description, site_name, favicon_url 추출
 */
export async function extractMetadata(url: string): Promise<ExtractedMetadata> {
  const fallback: ExtractedMetadata = {
    url,
    title: "",
    description: "",
    site_name: guessSiteName(url),
    favicon_url: googleFaviconFallback(url),
  };

  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return fallback;
    html = await res.text();
  } catch {
    return fallback;
  }

  try {
    const $ = cheerio.load(html);

    const ogTitle = $('meta[property="og:title"]').attr("content");
    const pageTitle = $("title").first().text();
    const hostname = getHostname(url);
    const title = (ogTitle ?? pageTitle ?? hostname).trim() || hostname;

    const ogDesc = $('meta[property="og:description"]').attr("content");
    const metaDesc = $('meta[name="description"]').attr("content");
    const description = (ogDesc ?? metaDesc ?? "").trim();

    const ogSiteName = $('meta[property="og:site_name"]').attr("content");
    const site_name =
      (ogSiteName ?? "").trim() || guessSiteName(url);

    let favicon_url = "";
    const iconSelectors = [
      'link[rel="apple-touch-icon"][href]',
      'link[rel="icon"][href]',
      'link[rel="shortcut icon"][href]',
    ];
    for (const sel of iconSelectors) {
      const href = $(sel).first().attr("href");
      if (href) {
        const resolved = resolveHref(href, url);
        if (resolved) {
          favicon_url = resolved;
          break;
        }
      }
    }
    if (!favicon_url) {
      favicon_url = googleFaviconFallback(url);
    }

    return {
      url,
      title: title.slice(0, 200),
      description: description.slice(0, 500),
      site_name: site_name.slice(0, 100),
      favicon_url,
    };
  } catch {
    return fallback;
  }
}
