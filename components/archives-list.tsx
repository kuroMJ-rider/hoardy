"use client";

import { useState } from "react";
import { formatDateKST } from "@/lib/utils/date";
import { ArchiveModal } from "@/components/archive-modal";

export interface Archive {
  id: string;
  url: string;
  title: string | null;
  summary: string | null;
  site_name: string | null;
  favicon_url: string | null;
  created_at: string;
  drawer_id: string | null;
  drawers?: { name: string; icon: string | null } | { name: string; icon: string | null }[] | null;
}

interface ArchivesListProps {
  archives: Archive[];
  loading: boolean;
  searchQuery: string;
  /** 데이터가 있으나 필터 결과가 비었을 때 true */
  isFilteredEmpty?: boolean;
  onDelete?: (id: string) => void;
}

/** 검색어를 하이라이트한 텍스트 (민트색) */
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) {
    return <>{text}</>;
  }
  const lowerQuery = query.toLowerCase().trim();
  const lowerText = text.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return <>{text}</>;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return (
    <>
      {before}
      <mark className="bg-mint/30 text-mint rounded px-0.5">{match}</mark>
      <HighlightText text={after} query={query} />
    </>
  );
}

export function ArchivesList({
  archives,
  loading,
  searchQuery,
  isFilteredEmpty = false,
  onDelete,
}: ArchivesListProps) {
  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-400" />
      </div>
    );
  }

  if (archives.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-zinc-500">
        {isFilteredEmpty ? "찾으시는 지식이 호디의 배 속에 없어요!" : "아직 저장한 링크가 없어요."}
      </p>
    );
  }

  const getDrawerDisplay = (a: Archive) => {
    const d = a.drawers;
    if (!d) return null;
    const drawer = Array.isArray(d) ? d[0] : d;
    if (!drawer?.name) return null;
    return { name: drawer.name, icon: drawer.icon ?? "📁" };
  };

  return (
    <>
      <div
        className="grid grid-cols-1 place-items-center gap-4 sm:place-items-stretch sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6"
        role="list"
      >
        {archives.map((a) => {
          const drawerBadge = getDrawerDisplay(a);
          return (
            <div key={a.id} className="w-full max-w-sm sm:max-w-none" role="listitem">
            <article>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedArchive(a)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedArchive(a);
                  }
                }}
                className="group flex cursor-pointer flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-mint/40 hover:shadow-md overflow-hidden"
              >
                <div className="mb-3 flex items-center gap-2">
                  {a.favicon_url ? (
                    <img
                      src={a.favicon_url}
                      alt=""
                      className="h-5 w-5 shrink-0 rounded-sm object-contain"
                    />
                  ) : (
                    <span className="text-xl" aria-hidden>🦖</span>
                  )}
                  <span className="truncate text-xs font-medium text-zinc-500">
                    {a.site_name ? (
                      <HighlightText text={a.site_name} query={searchQuery} />
                    ) : (
                      "알 수 없는 출처"
                    )}
                  </span>
                </div>

                <h3 className="mb-2 line-clamp-2 text-lg font-bold text-zinc-100 group-hover:text-mint transition-colors">
                  <HighlightText text={a.title || a.url} query={searchQuery} />
                </h3>

                {a.summary && (
                  <p className="mb-4 line-clamp-3 flex-grow text-sm leading-relaxed text-zinc-400">
                    <HighlightText text={a.summary} query={searchQuery} />
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-zinc-800/80 pt-3">
                  <span className="text-xs text-zinc-500">
                    {formatDateKST(a.created_at)}
                  </span>
                  {drawerBadge && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-400">
                      <span aria-hidden>{drawerBadge.icon}</span>
                      {drawerBadge.name}
                    </span>
                  )}
                </div>
              </div>
            </article>
            </div>
          );
        })}
      </div>

      {selectedArchive && (
        <ArchiveModal
          archive={selectedArchive}
          onClose={() => setSelectedArchive(null)}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
