"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Heart, Library, MessageSquare, Gamepad2 } from "lucide-react";
import { ratingColor } from "@/lib/utils";

interface ActivityGame {
  id: number;
  slug: string;
  title: string;
  cover_image: string | null;
}

type ActivityType =
  | "rated_game"
  | "added_to_wishlist"
  | "added_to_favourites"
  | "added_to_library"
  | "wrote_review";

interface ActivityItem {
  id: string;
  username: string;
  avatar_url: string | null;
  type: ActivityType;
  timestamp: string;
  game: ActivityGame;
  extra: { rating?: number; status?: string; review_text?: string };
}

const STATUS_COLORS: Record<string, string> = {
  playing:   "#60a5fa",
  completed: "#34d399",
  backlog:   "#fbbf24",
  wishlist:  "#a78bfa",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function actionMeta(item: ActivityItem): { icon: React.ReactNode; label: string; color: string; meta?: string } {
  switch (item.type) {
    case "rated_game":
      return { icon: <Star size={13} fill="currentColor" />, label: "rated", color: ratingColor(item.extra.rating ?? 5), meta: item.extra.rating != null ? `${item.extra.rating}/10` : undefined };
    case "added_to_wishlist":
      return { icon: <Heart size={13} />, label: "wishlisted", color: "#a78bfa" };
    case "added_to_favourites":
      return { icon: <Star size={13} fill="currentColor" />, label: "favourited", color: "#fbbf24" };
    case "added_to_library":
      return { icon: <Library size={13} />, label: "added to library", color: "#60a5fa", meta: item.extra.status };
    case "wrote_review":
      return { icon: <MessageSquare size={13} />, label: "reviewed", color: "#c084fc", meta: item.extra.rating != null ? `${item.extra.rating}/10` : undefined };
  }
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const action = actionMeta(item);
  return (
    <div
      className="flex gap-4 p-4 rounded-2xl"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {item.game.cover_image ? (
        <Link href={`/dashboard/games/${item.game.id}`} className="shrink-0">
          <img
            src={item.game.cover_image}
            alt={item.game.title}
            className="w-16 h-10 rounded-lg object-cover"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          />
        </Link>
      ) : (
        <div className="w-16 h-10 rounded-lg shrink-0 flex items-center justify-center" style={{ background: "rgba(135,86,241,0.12)", border: "1px solid rgba(135,86,241,0.15)" }}>
          <Gamepad2 size={16} style={{ color: "rgba(135,86,241,0.5)" }} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm leading-snug">
            <Link href={`/dashboard/games/${item.game.id}`} className="font-semibold text-white hover:text-[var(--backlog-purple)] transition-colors">
              {item.game.title}
            </Link>
          </p>
          <span className="text-[10px] shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>{timeAgo(item.timestamp)}</span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: `${action.color}14`, color: action.color, border: `1px solid ${action.color}30` }}
          >
            {action.icon}
            <span className="capitalize">{action.label}</span>
            {action.meta && <span className="opacity-70">· {action.meta}</span>}
          </div>
          {item.extra.status && item.type !== "added_to_library" && (
            <span className="text-xs capitalize" style={{ color: STATUS_COLORS[item.extra.status] ?? "rgba(255,255,255,0.3)" }}>
              {item.extra.status}
            </span>
          )}
        </div>

        {item.type === "wrote_review" && item.extra.review_text && (
          <p className="text-xs mt-2 leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.45)" }}>
            "{item.extra.review_text}"
          </p>
        )}
      </div>
    </div>
  );
}

export default function ProfileActivity({ username }: { username?: string }) {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = username
      ? `/api/games/activity/user/${username}`
      : "/api/games/activity/me";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setActivity(d.activity ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div
        className="h-full min-h-0 overflow-y-auto pr-1 flex flex-col gap-3"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(135,86,241,0.25) transparent" }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
        ))}
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(135,86,241,0.1)", border: "1px solid rgba(135,86,241,0.2)" }}>
          <Gamepad2 size={26} style={{ color: "var(--backlog-purple)" }} />
        </div>
        <div className="text-center">
          <p className="text-white/50 font-semibold mb-1">No activity yet</p>
          <p className="text-white/25 text-sm max-w-xs">Games added, rated, or reviewed will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full min-h-0 overflow-y-auto pr-1 flex flex-col gap-3"
      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(135,86,241,0.25) transparent" }}
    >
      {activity.map((item) => <ActivityRow key={item.id} item={item} />)}
    </div>
  );
}
