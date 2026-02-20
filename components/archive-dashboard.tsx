"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { ArchivesList } from "@/components/archives-list";
import { WeeklyReport } from "@/components/weekly-report";
import { formatDateKST } from "@/lib/utils/date";

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

interface Drawer {
  id: string;
  name: string;
  icon: string | null;
}

interface ArchiveDashboardProps {
  archives: Archive[];
  loading: boolean;
  onDelete?: (id: string) => void;
}

export function ArchiveDashboard({ archives, loading, onDelete }: ArchiveDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrawer, setSelectedDrawer] = useState<string | null>(null);
  const [drawers, setDrawers] = useState<Drawer[]>([]);

  useEffect(() => {
    fetch("/api/drawers")
      .then((res) => (res.ok ? res.json() : { drawers: [] }))
      .then((data) => setDrawers(data?.drawers ?? []))
      .catch(() => setDrawers([]));
  }, []);

  const drawerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of archives) {
      const id = a.drawer_id ?? "__none__";
      counts[id] = (counts[id] ?? 0) + 1;
    }
    return counts;
  }, [archives]);

  const filteredArchives = useMemo(() => {
    let result = archives;

    if (selectedDrawer) {
      result = result.filter((a) =>
        selectedDrawer === "__none__" ? a.drawer_id == null : a.drawer_id === selectedDrawer
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((a) => {
        const title = (a.title ?? "").toLowerCase();
        const summary = (a.summary ?? "").toLowerCase();
        const siteName = (a.site_name ?? "").toLowerCase();
        return title.includes(q) || summary.includes(q) || siteName.includes(q);
      });
    }

    return result;
  }, [archives, selectedDrawer, searchQuery]);

  const handleExportCsv = useCallback(() => {
    if (archives.length === 0) return;

    const headers = ["제목", "URL", "요약", "출처", "서랍", "저장일"];

    const escape = (val: string | null | undefined) => {
      const s = (val ?? "").replace(/"/g, '""');
      return `"${s}"`;
    };

    const getDrawerName = (a: Archive) => {
      const d = a.drawers;
      if (!d) return "";
      const drawer = Array.isArray(d) ? d[0] : d;
      return drawer?.name ?? "";
    };

    const rows = archives.map((a) =>
      [
        escape(a.title),
        escape(a.url),
        escape(a.summary),
        escape(a.site_name),
        escape(getDrawerName(a)),
        escape(formatDateKST(a.created_at)),
      ].join(",")
    );

    const csv = "\ufeff" + headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    link.href = url;
    link.download = `hoardy_archive_${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [archives]);

  const hasUncategorized = (drawerCounts["__none__"] ?? 0) > 0;
  const displayDrawers: Drawer[] = [
    ...drawers,
    ...(hasUncategorized ? [{ id: "__none__", name: "미분류", icon: "📁" as string | null }] : []),
  ];

  return (
    <section
      className="mx-auto mt-12 w-full max-w-7xl border-t border-zinc-800 px-4 pt-8 sm:px-6 lg:px-8"
      aria-label="호디의 서랍"
    >
      <WeeklyReport onExportCsv={archives.length > 0 ? handleExportCsv : undefined} />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-zinc-100">
          🗄️ 호디의 서랍
        </h2>
        <div className="relative w-full sm:w-72">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-4 w-4 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제목, 요약, 사이트로 검색..."
            aria-label="아카이브 검색"
            className="w-full rounded-full border border-zinc-800 bg-zinc-900/50 py-2 pl-10 pr-4 text-sm text-zinc-100 transition-all placeholder:text-zinc-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-mint"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedDrawer(null)}
          className={`rounded-full px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-mint/50 ${
            selectedDrawer === null
              ? "border border-mint bg-mint/20 text-mint"
              : "border border-zinc-600 bg-zinc-800/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"
          }`}
          aria-pressed={selectedDrawer === null}
        >
          전체
        </button>
        {displayDrawers.map((d) => {
          const isSelected = selectedDrawer === d.id;
          const count = drawerCounts[d.id] ?? 0;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedDrawer(isSelected ? null : d.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-mint/50 ${
                isSelected
                  ? "border border-mint bg-mint/20 text-mint"
                  : "border border-zinc-600 bg-zinc-800/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"
              }`}
              aria-pressed={isSelected}
              aria-label={`서랍 ${d.name} ${count}개 ${isSelected ? "선택됨" : "선택"}`}
            >
              <span className="text-sm" aria-hidden>
                {d.icon ?? "📁"}
              </span>
              <span>{d.name}</span>
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                    isSelected ? "bg-mint/30" : "bg-zinc-700/80"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <ArchivesList
        archives={filteredArchives}
        loading={loading}
        searchQuery={searchQuery}
        isFilteredEmpty={archives.length > 0 && filteredArchives.length === 0}
        onDelete={onDelete}
      />
    </section>
  );
}
