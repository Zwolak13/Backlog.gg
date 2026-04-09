"use client";

import { useProfile } from "@/hooks/useProfile";
import { Settings } from "lucide-react";
import Link from "next/link";

const TABS = ["Games", "Activity", "Library"] as const;

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function ProfileHeader({ activeTab, onTabChange }: Props) {
  const { profile } = useProfile();

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : null;

  return (
    <div className="w-full">
      <div
        className="relative w-full h-48 md:h-56 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #120d2e 0%, #2a1660 35%, #1a0d3e 65%, #0e0b24 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(135,86,241,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(135,86,241,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgb(18,19,24)]" />

        <Link
          href="/dashboard/settings"
          className="
            absolute top-4 right-4
            flex items-center gap-2 px-4 py-2 rounded-lg
            bg-black/50 hover:bg-black/70
            border border-white/10 hover:border-white/20
            text-white/70 hover:text-white text-sm font-medium
            transition-all backdrop-blur-sm
          "
        >
          <Settings size={14} />
          Edit Profile
        </Link>
      </div>

      <div className="relative px-6 md:px-10 -mt-14 flex flex-col sm:flex-row items-start gap-5 z-10">
        <img
          src={
            profile?.avatar_url ||
            `https://api.dicebear.com/7.x/identicon/svg?seed=${profile?.username}`
          }
          alt="avatar"
          className="
            w-28 h-28 rounded object-cover shrink-0
            border-4 border-[rgb(18,19,24)]
            shadow-[0_4px_24px_rgba(0,0,0,0.7)]
            bg-[rgb(30,32,42)]
          "
        />

        <div className="pt-14 sm:pt-16 flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {profile?.username ?? "Loading…"}
            </h1>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              Online
            </span>
          </div>

          <p className="text-white/55 text-sm max-w-lg leading-relaxed">
            {profile?.bio || "No bio yet."}
          </p>

          {joinDate && (
            <p className="text-white/30 text-xs mt-0.5">Member since {joinDate}</p>
          )}
        </div>
      </div>

      <div className="mt-5 border-b border-white/10 px-6 md:px-10">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`
                px-5 py-3 text-sm font-medium transition-all
                border-b-2 -mb-px
                ${
                  activeTab === tab
                    ? "text-white border-[var(--backlog-purple)]"
                    : "text-white/50 border-transparent hover:text-white/80 hover:border-white/20"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
