"use client";

import { useEffect, useState } from "react";
import { DEFAULT_DRAWERS, type Drawer } from "@/lib/constants";

export type { Drawer };

interface ContextChipsProps {
  selectedDrawerId: string | null;
  onSelect: (drawerId: string | null) => void;
  onInteraction?: () => void;
  disabled?: boolean;
  drawerCounts?: Record<string, number>;
}

const DEFAULT_ICON = "📁";

export function ContextChips({
  selectedDrawerId,
  onSelect,
  onInteraction,
  disabled,
  drawerCounts,
}: ContextChipsProps) {
  const [drawers, setDrawers] = useState<Drawer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/drawers")
      .then((res) => res.ok ? res.json() : { drawers: [] })
      .then((data) => {
        const list = data?.drawers ?? [];
        setDrawers(list.length > 0 ? list : DEFAULT_DRAWERS);
      })
      .catch(() => setDrawers(DEFAULT_DRAWERS))
      .finally(() => setLoading(false));
  }, []);

  const handleClick = (id: string) => {
    if (disabled) return;
    onInteraction?.();
    onSelect(selectedDrawerId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex w-full min-h-[2rem] flex-wrap justify-center gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 w-20 shrink-0 animate-pulse rounded-full bg-zinc-700/50"
            aria-hidden
          />
        ))}
      </div>
    );
  }

  const displayDrawers = drawers.length > 0 ? drawers : DEFAULT_DRAWERS;

  return (
    <div className="flex w-full min-h-[2rem] flex-wrap justify-center gap-1.5">
      {displayDrawers.map((d) => {
        const isSelected = selectedDrawerId === d.id;
        const count = drawerCounts?.[d.id] ?? 0;
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => handleClick(d.id)}
            disabled={disabled}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-pink/50 disabled:cursor-not-allowed disabled:opacity-50 ${
              isSelected
                ? "border border-pink bg-pink text-white"
                : "border border-zinc-600 bg-zinc-800/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"
            }`}
            aria-pressed={isSelected}
            aria-label={`서랍 ${d.name} ${count}개 ${isSelected ? "선택됨" : "선택"}`}
          >
            <span className="text-sm" aria-hidden>
              {d.icon || DEFAULT_ICON}
            </span>
            <span>{d.name}</span>
            {count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                  isSelected ? "bg-white/20" : "bg-zinc-700/80"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
