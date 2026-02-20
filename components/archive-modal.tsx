"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDateTimeKST } from "@/lib/utils/date";
import type { Archive } from "@/components/archives-list";

interface ArchiveModalProps {
  archive: Archive;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function ArchiveModal({ archive, onClose, onDelete }: ArchiveModalProps) {
  const [deleting, setDeleting] = useState(false);
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const drawerRaw = archive.drawers;
  const drawer = drawerRaw
    ? Array.isArray(drawerRaw)
      ? drawerRaw[0]
      : drawerRaw
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={archive.title ?? "아카이브 상세"}
    >
      <div
        className="relative mx-4 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2 overflow-hidden">
            {archive.favicon_url ? (
              <img
                src={archive.favicon_url}
                alt=""
                className="h-5 w-5 shrink-0 rounded-sm object-contain"
              />
            ) : (
              <span className="text-lg" aria-hidden>🦖</span>
            )}
            <span className="truncate text-sm font-medium text-zinc-400">
              {archive.site_name ?? "알 수 없는 출처"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="닫기"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <h2 className="mb-4 text-xl font-bold leading-snug text-zinc-100">
            {archive.title || archive.url}
          </h2>

          {archive.summary && (
            <p className="mb-5 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
              {archive.summary}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <span>{formatDateTimeKST(archive.created_at)}</span>
            {drawer?.name && (
              <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800/80 px-2 py-0.5">
                <span aria-hidden>{drawer.icon ?? "📁"}</span>
                {drawer.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-zinc-800 px-6 py-4">
          <a
            href={archive.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-mint px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-mint/90"
          >
            원문 보기
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            type="button"
            disabled={deleting}
            onClick={async () => {
              if (!confirm("정말 이 링크를 삭제할까요?")) return;
              setDeleting(true);
              try {
                const res = await fetch(`/api/archives/${archive.id}`, { method: "DELETE" });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                  alert(data.error ?? "삭제에 실패했어요.");
                  setDeleting(false);
                  return;
                }
                onDelete?.(archive.id);
                onClose();
              } catch {
                alert("삭제 중 오류가 발생했어요.");
                setDeleting(false);
              }
            }}
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {deleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
