"use client";

import { useProfile } from "@/hooks/useProfile";
import { useLibraryStats } from "@/hooks/useLibrary";
import { Settings, Calendar } from "lucide-react";
import Link from "next/link";

const TABS = ["Games", "Activity", "Library"] as const;

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function ProfileHeader({ activeTab, onTabChange }: Props) {
  const { profile } = useProfile();
  const { stats } = useLibraryStats();

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : null;

  return (
    <div className="w-full">
      {/* ── Banner ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: 280, background: "linear-gradient(155deg, #0e0b22 0%, #09091a 45%, #080912 100%)" }}
      >
        {/* vivid left glow */}
        <div
          className="absolute"
          style={{
            top: -80, left: -60,
            width: 600, height: 500,
            background: "radial-gradient(ellipse, rgba(100,55,255,0.4) 0%, transparent 60%)",
          }}
        />
        {/* center purple glow */}
        <div
          className="absolute"
          style={{
            top: 0, left: "40%", transform: "translateX(-50%)",
            width: 800, height: 400,
            background: "radial-gradient(ellipse, rgba(135,86,241,0.25) 0%, transparent 58%)",
          }}
        />
        {/* right pink accent */}
        <div
          className="absolute"
          style={{
            top: -50, right: -80,
            width: 500, height: 420,
            background: "radial-gradient(ellipse, rgba(255,38,132,0.14) 0%, transparent 58%)",
          }}
        />

        {/* dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 90% 100% at 50% 0%, black 30%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 100% at 50% 0%, black 30%, transparent 100%)",
          }}
        />

        {/* top accent line */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: 2,
            background: "linear-gradient(to right, transparent 0%, rgba(135,86,241,1) 25%, rgba(167,139,250,1) 50%, rgba(135,86,241,1) 75%, transparent 100%)",
          }}
        />

        {/* bottom fade into identity bar */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0b0c18]" />

        <Link
          href="/dashboard/settings"
          className="absolute top-5 right-5 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:brightness-125"
          style={{
            background: "rgba(135,86,241,0.14)",
            border: "1px solid rgba(135,86,241,0.4)",
            color: "rgba(185,160,255,1)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Settings size={13} />
          Edit Profile
        </Link>
      </div>

      {/* ── Identity bar ── */}
      <div style={{ background: "#0b0c18", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-8 md:px-12">

          {/* avatar + name row */}
          <div className="flex items-end gap-6 -mt-14 pb-6">
            {/* avatar */}
            <div className="relative shrink-0 z-10">
              <div
                className="rounded-xl"
                style={{
                  padding: 3,
                  background: "linear-gradient(135deg, #9b6ff5, #5536da, #c084fc)",
                  boxShadow: "0 0 0 4px #0b0c18, 0 16px 48px rgba(135,86,241,0.55), 0 4px 20px rgba(0,0,0,0.9)",
                }}
              >
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile?.username}`}
                  alt="avatar"
                  className="block rounded-[9px] object-cover"
                  style={{ width: 116, height: 116, background: "rgb(20,22,34)" }}
                />
              </div>
              <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
                style={{
                  background: "#0a1a14",
                  border: "1px solid rgba(52,211,153,0.5)",
                  color: "#34d399",
                  boxShadow: "0 0 12px rgba(52,211,153,0.3)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#34d399", boxShadow: "0 0 6px #34d399" }} />
                Online
              </div>
            </div>

            {/* name + bio */}
            <div className="pb-1 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1
                  className="text-[2rem] font-black text-white leading-none"
                  style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.025em" }}
                >
                  {profile?.username ?? "Loading…"}
                </h1>
                {joinDate && (
                  <span
                    className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                    style={{
                      color: "rgba(255,255,255,0.38)",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <Calendar size={10} />
                    Joined {joinDate}
                  </span>
                )}
              </div>
              <p
                className="text-sm leading-relaxed max-w-xl"
                style={{ color: "rgba(255,255,255,0.42)" }}
              >
                {profile?.bio || "No bio set yet."}
              </p>
            </div>
          </div>

          {/* stat strip */}
          <div
            className="flex"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginLeft: "-2rem", marginRight: "-2rem" }}
          >
            {[
              { label: "Games",     value: stats?.total     ?? 0, color: "#c4b5fd" },
              { label: "Playing",   value: stats?.playing   ?? 0, color: "#60a5fa" },
              { label: "Completed", value: stats?.completed ?? 0, color: "#34d399" },
              { label: "Backlog",   value: stats?.backlog   ?? 0, color: "#fbbf24" },
              { label: "Wishlist",  value: stats?.wishlist  ?? 0, color: "#a78bfa" },
            ].map((s, i) => (
              <div
                key={s.label}
                className="flex flex-col items-center py-4 flex-1 select-none"
                style={{ borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
              >
                <span
                  className="text-[1.6rem] font-black leading-none mb-1"
                  style={{ fontFamily: "var(--font-syne)", color: s.color }}
                >
                  {s.value}
                </span>
                <span className="text-[11px] font-medium tracking-wide" style={{ color: "rgba(255,255,255,0.28)" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div
        className="px-8 md:px-12 border-b sticky top-0 z-20"
        style={{
          background: "rgba(8,9,16,0.92)",
          borderColor: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className="relative px-5 py-4 text-sm font-semibold transition-all duration-200"
              style={{ color: activeTab === tab ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.3)" }}
            >
              {tab}
              {activeTab === tab && (
                <span
                  className="absolute bottom-0 left-2 right-2 rounded-full"
                  style={{
                    height: 2,
                    background: "linear-gradient(to right, #5536da, #8756f1, #a78bfa)",
                    boxShadow: "0 0 10px rgba(135,86,241,0.9)",
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
