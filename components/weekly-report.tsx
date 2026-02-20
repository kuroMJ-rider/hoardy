"use client";

import { useEffect, useState, useRef } from "react";
import { getRandomReport } from "@/lib/reportMessages";

interface DrawerStat {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface WeeklyData {
  total: number;
  byDrawer: DrawerStat[];
}

function CountUp({ target, duration = 800 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration]);

  return <>{value}</>;
}

interface WeeklyReportProps {
  onExportCsv?: () => void;
}

export function WeeklyReport({ onExportCsv }: WeeklyReportProps) {
  const [data, setData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/stats/weekly")
      .then((res) => (res.ok ? res.json() : { total: 0, byDrawer: [] }))
      .then((d) => setData(d))
      .catch(() => setData({ total: 0, byDrawer: [] }))
      .finally(() => {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      });
  }, []);

  if (loading) {
    return (
      <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex animate-pulse flex-col gap-3">
          <div className="h-4 w-40 rounded bg-zinc-700/50" />
          <div className="h-8 w-20 rounded bg-zinc-700/50" />
          <div className="h-3 w-full rounded bg-zinc-700/30" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const topDrawer = data.byDrawer.length > 0 ? data.byDrawer[0] : null;
  const report = getRandomReport(topDrawer?.name ?? null);

  return (
    <div
      className={`relative mb-8 rounded-2xl border border-mint/20 bg-neutral-900 p-6 transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="absolute -top-3 left-10 animate-bounce rounded-full bg-mint px-3 py-1 text-xs font-bold text-black">
        주간 리포트
      </div>

      <div className="mb-5 mt-2 flex items-end gap-6">
        <div>
          <p className="text-xs text-zinc-500">저장한 링크</p>
          <p className="text-3xl font-bold tabular-nums text-mint">
            <CountUp target={data.total} />
            <span className="ml-1 text-base font-normal text-zinc-500">개</span>
          </p>
        </div>

        {topDrawer && topDrawer.count > 0 && (
          <div className="border-l border-zinc-800 pl-6">
            <p className="text-xs text-zinc-500">가장 활발한 서랍</p>
            <p className="flex items-center gap-1.5 text-lg font-semibold text-zinc-200">
              <span aria-hidden>{topDrawer.icon}</span>
              {topDrawer.name}
              <span className="text-sm font-normal text-zinc-500">
                ({topDrawer.count})
              </span>
            </p>
          </div>
        )}
      </div>

      {data.byDrawer.length > 1 && (
        <div className="mb-5 flex h-2 overflow-hidden rounded-full bg-zinc-800">
          {data.byDrawer.map((d, i) => {
            const pct = data.total > 0 ? (d.count / data.total) * 100 : 0;
            const colors = [
              "bg-mint",
              "bg-pink",
              "bg-amber-400",
              "bg-sky-400",
              "bg-violet-400",
            ];
            return (
              <div
                key={d.id}
                className={`${colors[i % colors.length]} transition-all duration-700`}
                style={{ width: `${pct}%` }}
                title={`${d.icon} ${d.name}: ${d.count}개 (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-bold leading-snug text-mint">
          &ldquo;{report.text}&rdquo;
        </h3>
        <p className="text-sm leading-relaxed text-neutral-400">
          {report.subText}
        </p>
      </div>

      {onExportCsv && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onExportCsv}
            className="text-xs text-neutral-500 transition-colors hover:text-mint"
          >
            내 주간 데이터 내보내기 (CSV) →
          </button>
        </div>
      )}
    </div>
  );
}
