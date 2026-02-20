"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { ContextChips } from "@/components/context-chips";

interface LinkInputProps {
  onSubmit: (url: string, options?: { drawer_id?: string }) => Promise<void>;
  selectedDrawerId: string | null;
  onDrawerSelect: (drawerId: string | null) => void;
  onDrawerInteraction?: () => void;
  drawerCounts?: Record<string, number>;
}

interface PreviewData {
  title: string;
  site_name: string;
  favicon_url: string;
}

const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

const DEBOUNCE_MS = 700;

export function LinkInput({
  onSubmit,
  selectedDrawerId,
  onDrawerSelect,
  onDrawerInteraction,
  drawerCounts,
}: LinkInputProps) {
  const [url, setUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isValidUrl = URL_REGEX.test(url.trim());

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    const trimmed = url.trim();
    if (!trimmed || !URL_REGEX.test(trimmed)) {
      setPreview(null);
      setPreviewLoading(false);
      return;
    }

    setPreviewLoading(true);

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch("/api/scraper", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed }),
          signal: controller.signal,
        });
        const json = await res.json();
        if (!controller.signal.aborted && json.success) {
          setPreview({
            title: json.data.title ?? "",
            site_name: json.data.site_name ?? "",
            favicon_url: json.data.favicon_url ?? "",
          });
        }
      } catch {
        if (!controller.signal.aborted) setPreview(null);
      } finally {
        if (!controller.signal.aborted) setPreviewLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError("링크를 붙여넣어 줘.");
      return;
    }
    if (!URL_REGEX.test(trimmedUrl)) {
      setError("올바른 URL 형식이야. https:// 로 시작하는지 확인해.");
      return;
    }

    startTransition(async () => {
      try {
        const drawerId =
          selectedDrawerId?.startsWith("demo-") || selectedDrawerId?.startsWith("template-")
            ? undefined
            : selectedDrawerId || undefined;
        await onSubmit(trimmedUrl, {
          drawer_id: drawerId,
        });
        setUrl("");
        setPreview(null);
        onDrawerSelect(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "앗, 뭔가 잘못됐어. 다시 시도해봐.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col items-center gap-4">
      <div className="flex w-full flex-col items-center gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          disabled={isPending}
          className="w-full rounded-2xl border-2 border-mint/50 bg-black/30 px-5 py-4 text-lg text-foreground placeholder:text-zinc-500 focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/30 transition-all"
          autoComplete="url"
          aria-label="저장할 링크 URL"
        />
        {(previewLoading || preview) && (
          <div className="w-full overflow-hidden rounded-xl border border-zinc-800 bg-white/5">
            {previewLoading && !preview ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-zinc-700" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="h-3.5 w-3/4 animate-pulse rounded bg-zinc-700" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-700/60" />
                </div>
              </div>
            ) : preview ? (
              <div className="flex items-start gap-3 px-4 py-3">
                {preview.favicon_url ? (
                  <img
                    src={preview.favicon_url}
                    alt=""
                    className="mt-0.5 h-5 w-5 shrink-0 rounded-sm object-contain"
                  />
                ) : (
                  <span className="mt-0.5 text-base" aria-hidden>🔗</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-200">
                    {preview.title}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {preview.site_name}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-zinc-600">미리보기</span>
              </div>
            ) : null}
          </div>
        )}

        <div className="flex w-full flex-col items-center gap-1.5">
          <span className="text-xs font-medium text-zinc-500">서랍 선택</span>
          <ContextChips
            selectedDrawerId={selectedDrawerId}
            onSelect={onDrawerSelect}
            onInteraction={onDrawerInteraction}
            disabled={isPending}
            drawerCounts={drawerCounts}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-pink" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !isValidUrl}
        className="rounded-2xl bg-mint px-6 py-4 text-lg font-semibold text-black transition-all hover:bg-mint/90 focus:outline-none focus:ring-2 focus:ring-mint disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-mint"
      >
        {isPending ? "먹는 중..." : "호디한테 넘겨"}
      </button>

      <p className="text-center text-sm text-zinc-500">
        서랍을 고르면 그쪽으로 넣어둘게. 안 고르면 AI가 분류해줘.
      </p>
    </form>
  );
}
