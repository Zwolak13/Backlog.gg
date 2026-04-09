"use client";

import { BarChart2 } from "lucide-react";
import { useLibraryStats } from "@/hooks/useLibrary";

const STATUS_CONFIG = [
  { key: "completed", label: "Completed", color: "text-emerald-400", bar: "bg-emerald-400" },
  { key: "playing",   label: "Playing",   color: "text-blue-400",    bar: "bg-blue-400" },
  { key: "backlog",   label: "Backlog",   color: "text-yellow-400",  bar: "bg-yellow-400" },
  { key: "wishlist",  label: "Wishlist",  color: "text-[var(--backlog-purple)]", bar: "bg-[var(--backlog-purple)]" },
] as const;

export default function ProfileStats() {
  const { stats } = useLibraryStats();

  const total = stats?.total ?? 0;

  return (
    <div className="rounded-xl border border-white/10 bg-[rgba(20,22,35,0.6)] backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 text-white/80 font-semibold text-sm">
        <BarChart2 size={15} />
        Game Stats
      </div>

      <div className="px-4 pt-4 pb-2">
        {total > 0 ? (
          <div className="flex h-2 rounded-full overflow-hidden gap-px">
            {STATUS_CONFIG.map((s) => {
              const val = stats?.[s.key] ?? 0;
              if (val === 0) return null;
              return (
                <div
                  key={s.key}
                  title={`${s.label}: ${val}`}
                  style={{ flex: val }}
                  className={`h-full ${s.bar}`}
                />
              );
            })}
          </div>
        ) : (
          <div className="h-2 rounded-full bg-white/10" />
        )}
        <p className="text-white/30 text-xs mt-2 text-right">{total} games total</p>
      </div>

      <div className="px-3 pb-3 flex flex-col gap-0.5">
        {STATUS_CONFIG.map((s) => (
          <div
            key={s.key}
            className="flex justify-between items-center px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <span className="text-white/60 text-sm">{s.label}</span>
            <span className={`font-bold text-base ${s.color}`}>{stats?.[s.key] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
