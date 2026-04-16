"use client";

import { useLibraryStats } from "@/hooks/useLibrary";
import { BarChart3 } from "lucide-react";

const STATUS_CONFIG = [
  { key: "completed", label: "Completed", color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.18)"  },
  { key: "playing",   label: "Playing",   color: "#60a5fa", bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.18)"  },
  { key: "backlog",   label: "Backlog",   color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.18)"  },
  { key: "wishlist",  label: "Wishlist",  color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.18)" },
] as const;

export default function ProfileStats() {
  const { stats } = useLibraryStats();
  const total = stats?.total ?? 0;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgb(14,15,24)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className="flex items-center gap-2.5 px-5 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(135,86,241,0.15)", border: "1px solid rgba(135,86,241,0.2)" }}
        >
          <BarChart3 size={14} style={{ color: "var(--backlog-purple)" }} />
        </div>
        <span
          className="text-sm font-bold text-white/80"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Library Stats
        </span>
      </div>

      <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-[10px] text-white/28 uppercase tracking-[0.14em] font-semibold mb-1">Total games</p>
        <p
          className="text-5xl font-black text-white leading-none"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          {total}
        </p>

        {total > 0 && (
          <div className="mt-4 flex h-2 rounded-full overflow-hidden gap-0.5">
            {STATUS_CONFIG.map((s) => {
              const val = stats?.[s.key] ?? 0;
              if (!val) return null;
              return (
                <div
                  key={s.key}
                  title={`${s.label}: ${val}`}
                  style={{ flex: val, background: s.color, boxShadow: `0 0 6px ${s.color}60` }}
                  className="h-full rounded-full"
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1.5">
        {STATUS_CONFIG.map((s) => {
          const val = stats?.[s.key] ?? 0;
          const pct = total > 0 ? Math.round((val / total) * 100) : 0;
          return (
            <div
              key={s.key}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-none"
                style={{ background: s.color, boxShadow: `0 0 5px ${s.color}` }}
              />
              <span className="flex-1 text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>{s.label}</span>
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>{pct}%</span>
              <span className="font-bold text-base w-7 text-right" style={{ color: s.color }}>{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
