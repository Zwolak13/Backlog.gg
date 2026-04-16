"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, BarChart3, Users, Gamepad2, Star, Clock4, UserMinus, UserPlus, Clock } from "lucide-react";
import { usePresence } from "@/hooks/usePresence";
import { toastSuccess, toastError } from "@/lib/toast";

interface PublicProfile {
  username: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

interface LibraryStats {
  backlog: number;
  playing: number;
  completed: number;
  wishlist: number;
  total: number;
}

interface LibraryGame {
  id: number;
  status: string;
  rating: number | null;
  is_favourite: boolean;
  game: {
    id: number;
    slug: string;
    name: string;
    background_image: string | null;
    metacritic: number | null;
  };
}

interface Friend {
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

const TABS = ["Games", "Activity", "Library"] as const;
const STATUSES = ["all", "playing", "completed", "backlog", "wishlist"] as const;

const STATUS_COLORS: Record<string, string> = {
  playing:   "#60a5fa",
  completed: "#34d399",
  backlog:   "#fbbf24",
  wishlist:  "#a78bfa",
};

const STATS_CONFIG = [
  { key: "completed" as const, label: "Completed", color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.18)"  },
  { key: "playing"   as const, label: "Playing",   color: "#60a5fa", bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.18)"  },
  { key: "backlog"   as const, label: "Backlog",   color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.18)"  },
  { key: "wishlist"  as const, label: "Wishlist",  color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.18)" },
];

export default function FriendProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [recentGames, setRecentGames] = useState<LibraryGame[]>([]);
  const [favouriteGames, setFavouriteGames] = useState<LibraryGame[]>([]);
  const [libraryGames, setLibraryGames] = useState<LibraryGame[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Games");
  const [libraryFilter, setLibraryFilter] = useState("all");
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [removingFriend, setRemovingFriend] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const onlineUsers = usePresence();
  const isOnline = onlineUsers.has(username);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.username === username) {
          setIsOwnProfile(true);
        } else {
          fetch("/api/user/friends")
            .then((r) => r.json())
            .then((fd) => {
              const friendUsernames = (fd.friends ?? []).map((f: Friend) => f.username);
              setIsFriend(friendUsernames.includes(username));
            })
            .catch(() => {});
          fetch("/api/user/friends/requests")
            .then((r) => r.json())
            .then((rd) => {
              const sent = (rd.outgoing ?? []).some((req: { to_user: { username: string } }) => req.to_user?.username === username);
              setRequestSent(sent);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    fetch(`/api/user/profile/${username}`)
      .then((r) => { if (!r.ok) { setNotFound(true); return null; } return r.json(); })
      .then((d) => { if (d) setProfile(d); })
      .catch(() => setNotFound(true));

    fetch(`/api/games/library/public/${username}/stats`)
      .then((r) => r.json()).then(setStats).catch(() => {});

    fetch(`/api/games/library/public/${username}/recent`)
      .then((r) => r.json())
      .then((d) => { setRecentGames(d.games ?? []); setRecentLoading(false); })
      .catch(() => setRecentLoading(false));

    fetch(`/api/games/library/public/${username}/favourites`)
      .then((r) => r.json())
      .then((d) => { setFavouriteGames(d.games ?? []); setFavLoading(false); })
      .catch(() => setFavLoading(false));

    fetch(`/api/user/profile/${username}/friends`)
      .then((r) => r.json())
      .then((d) => setFriends(d.friends ?? []))
      .catch(() => {});
  }, [username]);

  useEffect(() => {
    setLibraryLoading(true);
    const url = libraryFilter === "all"
      ? `/api/games/library/public/${username}`
      : `/api/games/library/public/${username}?status=${libraryFilter}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => { setLibraryGames(d.games ?? []); setLibraryLoading(false); })
      .catch(() => setLibraryLoading(false));
  }, [username, libraryFilter]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white gap-4">
        <p className="text-white/50">User not found.</p>
        <Link href="/dashboard/profile" className="text-[var(--backlog-purple)] hover:underline text-sm">Go back</Link>
      </div>
    );
  }

  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen text-white/40 text-sm">Loading…</div>;
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" });
  const total = stats?.total ?? 0;

  const handleSendRequest = async () => {
    setSendingRequest(true);
    try {
      const res = await fetch("/api/user/friends/request/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const d = await res.json();
      if (d.error) {
        toastError(d.error);
      } else {
        setRequestSent(true);
        toastSuccess(`Friend request sent to ${username}`);
      }
    } catch {
      toastError("Failed to send request");
    }
    setSendingRequest(false);
  };

  const handleRemoveFriend = async () => {
    setRemovingFriend(true);
    try {
      const res = await fetch(`/api/user/friends/${username}`, { method: "DELETE" });
      if (res.ok) {
        setIsFriend(false);
        toastSuccess(`Removed ${username} from friends`);
      } else {
        toastError("Failed to remove friend");
      }
    } catch {
      toastError("Failed to remove friend");
    }
    setRemovingFriend(false);
  };

  return (
    <div className="w-full min-h-screen text-white" style={{ background: "rgb(10,11,17)" }}>

      <div
        className="relative w-full overflow-hidden"
        style={{ height: 280, background: "linear-gradient(155deg, #0e0b22 0%, #09091a 45%, #080912 100%)" }}
      >
        <div className="absolute" style={{ top: -80, left: -60, width: 600, height: 500, background: "radial-gradient(ellipse, rgba(100,55,255,0.4) 0%, transparent 60%)" }} />
        <div className="absolute" style={{ top: 0, left: "40%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(135,86,241,0.25) 0%, transparent 58%)" }} />
        <div className="absolute" style={{ top: -50, right: -80, width: 500, height: 420, background: "radial-gradient(ellipse, rgba(255,38,132,0.14) 0%, transparent 58%)" }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 90% 100% at 50% 0%, black 30%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 100% at 50% 0%, black 30%, transparent 100%)",
          }}
        />
        <div className="absolute top-0 left-0 right-0" style={{ height: 2, background: "linear-gradient(to right, transparent 0%, rgba(135,86,241,1) 25%, rgba(167,139,250,1) 50%, rgba(135,86,241,1) 75%, transparent 100%)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0b0c18]" />

        <Link
          href="/dashboard/profile"
          className="absolute top-5 left-5 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:brightness-125"
          style={{ background: "rgba(135,86,241,0.14)", border: "1px solid rgba(135,86,241,0.4)", color: "rgba(185,160,255,1)", backdropFilter: "blur(8px)" }}
        >
          <ArrowLeft size={13} />
          Back
        </Link>

      </div>

      <div style={{ background: "#0b0c18", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-8 md:px-12">
          <div className="flex items-end gap-6 -mt-14 pb-6">
            <div className="relative shrink-0 z-10">
              <div
                className="rounded-xl"
                style={{ padding: 3, background: "linear-gradient(135deg, #9b6ff5, #5536da, #c084fc)", boxShadow: "0 0 0 4px #0b0c18, 0 16px 48px rgba(135,86,241,0.55), 0 4px 20px rgba(0,0,0,0.9)" }}
              >
                <img
                  src={profile.avatar_url ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username}`}
                  alt="avatar"
                  className="block rounded-[9px] object-cover"
                  style={{ width: 116, height: 116, background: "rgb(20,22,34)" }}
                />
              </div>
              <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
                style={isOnline
                  ? { background: "#0a1a14", border: "1px solid rgba(52,211,153,0.5)", color: "#34d399", boxShadow: "0 0 12px rgba(52,211,153,0.3)" }
                  : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }
                }
              >
                <span className="w-1.5 h-1.5 rounded-full" style={isOnline ? { background: "#34d399", boxShadow: "0 0 6px #34d399" } : { background: "rgba(255,255,255,0.25)" }} />
                {isOnline ? "Online" : "Offline"}
              </div>
            </div>

            <div className="pb-1 flex-1 min-w-0">
              <span
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full mb-2"
                style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Calendar size={9} />
                Joined {joinDate}
              </span>
              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                <h1 className="text-[2rem] font-black text-white leading-none" style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.025em" }}>
                  {profile.username}
                </h1>
                {!isOwnProfile && isFriend && (
                  <button
                    onClick={handleRemoveFriend}
                    disabled={removingFriend}
                    title="Remove friend"
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:brightness-125 disabled:opacity-50"
                    style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "rgba(252,165,165,0.9)" }}
                  >
                    {removingFriend
                      ? <div className="w-3 h-3 rounded-full border border-red-300/30 border-t-red-300/70 animate-spin" />
                      : <UserMinus size={13} />}
                  </button>
                )}
                {!isOwnProfile && !isFriend && requestSent && (
                  <div
                    title="Friend request sent"
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(135,86,241,0.1)", border: "1px solid rgba(135,86,241,0.22)", color: "rgba(167,139,250,0.7)" }}
                  >
                    <Clock size={13} />
                  </div>
                )}
                {!isOwnProfile && !isFriend && !requestSent && (
                  <button
                    onClick={handleSendRequest}
                    disabled={sendingRequest}
                    title="Add friend"
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:brightness-125 disabled:opacity-50"
                    style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.28)", color: "#34d399" }}
                  >
                    {sendingRequest
                      ? <div className="w-3 h-3 rounded-full border border-green-300/30 border-t-green-300/70 animate-spin" />
                      : <UserPlus size={13} />}
                  </button>
                )}
              </div>
              <p className="text-sm leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.42)" }}>
                {profile.bio || "No bio set yet."}
              </p>
            </div>
          </div>

          <div className="flex" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginLeft: "-2rem", marginRight: "-2rem" }}>
            {[
              { label: "Games",     value: stats?.total     ?? 0, color: "#c4b5fd" },
              { label: "Playing",   value: stats?.playing   ?? 0, color: "#60a5fa" },
              { label: "Completed", value: stats?.completed ?? 0, color: "#34d399" },
              { label: "Backlog",   value: stats?.backlog   ?? 0, color: "#fbbf24" },
              { label: "Wishlist",  value: stats?.wishlist  ?? 0, color: "#a78bfa" },
            ].map((s, i) => (
              <div key={s.label} className="flex flex-col items-center py-4 flex-1 select-none" style={{ borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <span className="text-[1.6rem] font-black leading-none mb-1" style={{ fontFamily: "var(--font-syne)", color: s.color }}>{s.value}</span>
                <span className="text-[11px] font-medium tracking-wide" style={{ color: "rgba(255,255,255,0.28)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="px-8 md:px-12 border-b sticky top-0 z-20"
        style={{ background: "rgba(8,9,16,0.92)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
      >
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-5 py-4 text-sm font-semibold transition-all duration-200"
              style={{ color: activeTab === tab ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.3)" }}
            >
              {tab}
              {activeTab === tab && (
                <span
                  className="absolute bottom-0 left-2 right-2 rounded-full"
                  style={{ height: 2, background: "linear-gradient(to right, #5536da, #8756f1, #a78bfa)", boxShadow: "0 0 10px rgba(135,86,241,0.9)" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 px-8 md:px-12 py-8 w-full">
        <div className="flex-1 min-w-0">

          {activeTab === "Games" && (
            <div className="flex flex-col gap-10">
              <GameSection icon={<Gamepad2 size={14} />} title="Recent Activity" games={recentGames} loading={recentLoading} />
              <GameSection icon={<Star size={14} />} title="Favourite Games" games={favouriteGames} loading={favLoading} />
            </div>
          )}

          {activeTab === "Activity" && (
            <div
              className="flex flex-col items-center justify-center py-28 gap-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(135,86,241,0.1)", border: "1px solid rgba(135,86,241,0.2)" }}>
                <Clock4 size={26} style={{ color: "var(--backlog-purple)" }} />
              </div>
              <div className="text-center">
                <p className="text-white/50 font-semibold mb-1">No activity yet</p>
                <p className="text-white/25 text-sm max-w-xs">Recent game sessions will appear here.</p>
              </div>
            </div>
          )}

          {activeTab === "Library" && (
            <div>
              <div className="flex gap-2 mb-6 flex-wrap">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setLibraryFilter(s)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-all capitalize"
                    style={libraryFilter === s
                      ? { background: "linear-gradient(135deg, var(--backlog-purple), var(--backlog-indigo))", color: "white", boxShadow: "0 2px 12px rgba(135,86,241,0.35)" }
                      : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>

              {libraryLoading ? (
                <p className="text-white/30 text-sm">Loading…</p>
              ) : libraryGames.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-center rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}>
                  <p className="text-white/35 font-medium">No games here yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {libraryGames.map((ug) => (
                    <Link
                      key={ug.id}
                      href={`/dashboard/games/${ug.game.id}`}
                      className="group relative rounded-lg overflow-hidden border border-white/[0.07] hover:border-white/20 transition-all duration-300 bg-[rgb(28,30,40)] aspect-[3/4]"
                    >
                      {ug.game.background_image
                        ? <img src={ug.game.background_image} alt={ug.game.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        : <div className="absolute inset-0 bg-gradient-to-br from-[var(--backlog-purple)]/20 to-transparent" />
                      }
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-sm font-semibold leading-tight line-clamp-2 drop-shadow-md group-hover:text-[var(--backlog-purple)] transition-colors">{ug.game.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-white/40 text-xs capitalize">{ug.status}</span>
                          {ug.rating != null && <span className="text-yellow-400 text-xs">★ {ug.rating}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">

          <div className="rounded-2xl overflow-hidden" style={{ background: "rgb(14,15,24)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2.5 px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(135,86,241,0.15)", border: "1px solid rgba(135,86,241,0.2)" }}>
                <BarChart3 size={14} style={{ color: "var(--backlog-purple)" }} />
              </div>
              <span className="text-sm font-bold text-white/80" style={{ fontFamily: "var(--font-syne)" }}>Library Stats</span>
            </div>

            <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] text-white/28 uppercase tracking-[0.14em] font-semibold mb-1">Total games</p>
              <p className="text-5xl font-black text-white leading-none" style={{ fontFamily: "var(--font-syne)" }}>{total}</p>
              {total > 0 && (
                <div className="mt-4 flex h-2 rounded-full overflow-hidden gap-0.5">
                  {STATS_CONFIG.map((s) => {
                    const val = stats?.[s.key] ?? 0;
                    if (!val) return null;
                    return <div key={s.key} title={`${s.label}: ${val}`} style={{ flex: val, background: s.color, boxShadow: `0 0 6px ${s.color}60` }} className="h-full rounded-full" />;
                  })}
                </div>
              )}
            </div>

            <div className="p-3 flex flex-col gap-1.5">
              {STATS_CONFIG.map((s) => {
                const val = stats?.[s.key] ?? 0;
                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                return (
                  <div key={s.key} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                    <div className="w-2.5 h-2.5 rounded-full flex-none" style={{ background: s.color, boxShadow: `0 0 5px ${s.color}` }} />
                    <span className="flex-1 text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>{s.label}</span>
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>{pct}%</span>
                    <span className="font-bold text-base w-7 text-right" style={{ color: s.color }}>{val}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: "rgb(14,15,24)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2.5 px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(135,86,241,0.15)", border: "1px solid rgba(135,86,241,0.2)" }}>
                <Users size={13} style={{ color: "var(--backlog-purple)" }} />
              </div>
              <span className="text-sm font-bold text-white/80" style={{ fontFamily: "var(--font-syne)" }}>Friends</span>
              {friends.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(135,86,241,0.18)", color: "rgba(192,168,255,0.95)", border: "1px solid rgba(135,86,241,0.25)" }}>
                  {friends.length}
                </span>
              )}
            </div>

            <div className="p-3">
              {friends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2.5 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1" style={{ background: "rgba(135,86,241,0.07)", border: "1px solid rgba(135,86,241,0.12)" }}>
                    <Users size={22} style={{ color: "rgba(135,86,241,0.4)" }} />
                  </div>
                  <p className="text-white/40 text-sm font-semibold">No friends yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {friends.map((f) => (
                    <Link
                      key={f.username}
                      href={`/dashboard/profile/${f.username}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                      style={{ color: "inherit" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(135,86,241,0.07)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={f.avatar_url ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${f.username}`}
                          className="w-9 h-9 rounded-xl object-cover"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                          alt={f.username}
                        />
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                          style={{
                            background: onlineUsers.has(f.username) ? "#34d399" : "rgba(255,255,255,0.15)",
                            border: "2px solid rgb(14,15,24)",
                            boxShadow: onlineUsers.has(f.username) ? "0 0 5px #34d399" : "none",
                          }}
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-white/85 text-sm font-medium truncate">{f.username}</span>
                        {f.bio && <span className="text-white/28 text-xs truncate">{f.bio}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GameSection({ icon, title, games, loading }: { icon: React.ReactNode; title: string; games: LibraryGame[]; loading: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(135,86,241,0.15)", border: "1px solid rgba(135,86,241,0.2)", color: "var(--backlog-purple)" }}>
          {icon}
        </div>
        <h2 className="text-sm font-bold text-white/90 uppercase tracking-widest" style={{ fontFamily: "var(--font-syne)" }}>{title}</h2>
        {!loading && games.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(135,86,241,0.12)", color: "rgba(167,139,250,0.8)", border: "1px solid rgba(135,86,241,0.2)" }}>
            {games.length}
          </span>
        )}
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(135,86,241,0.15), transparent)" }} />
      </div>

      {loading ? (
        <div className="flex gap-3" style={{ overflowX: "auto", overflowY: "clip", paddingTop: 12, paddingBottom: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-none rounded-xl animate-pulse" style={{ width: 260, height: 156, background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}>
          <p className="text-white/25 text-sm">No games here yet.</p>
        </div>
      ) : (
        <div className="flex gap-3" style={{ overflowX: "auto", overflowY: "clip", paddingTop: 12, paddingBottom: 16, scrollbarWidth: "thin", scrollbarColor: "rgba(135,86,241,0.25) transparent" }}>
          {games.map((ug) => <div key={ug.id} className="flex-none"><GameCard userGame={ug} /></div>)}
        </div>
      )}
    </div>
  );
}

function GameCard({ userGame }: { userGame: LibraryGame }) {
  const { game, rating, status, is_favourite } = userGame;
  const statusColor = STATUS_COLORS[status] ?? "rgba(255,255,255,0.4)";

  return (
    <Link href={`/dashboard/games/${game.id}`}>
      <div
        className="group cursor-pointer select-none"
        style={{ width: 260, transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-8px)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
      >
        <div
          className="relative rounded-xl overflow-hidden"
          style={{ height: 156, background: "rgb(18,20,32)", transition: "box-shadow 0.25s ease, border-color 0.25s ease", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${statusColor}70`; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px rgba(0,0,0,0.75), 0 0 0 1px ${statusColor}40`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.5)"; }}
        >
          {game.background_image
            ? <img src={game.background_image} alt={game.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            : <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(135,86,241,0.3) 0%, rgba(85,54,218,0.1) 100%)" }} />
          }
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.05) 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0" style={{ height: 2, background: statusColor, opacity: 0.7, boxShadow: `0 0 8px ${statusColor}` }} />

          {is_favourite && (
            <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,0,0,0.65)", border: "1px solid rgba(251,191,36,0.5)", backdropFilter: "blur(6px)" }}>
              <Star size={11} fill="#fbbf24" color="#fbbf24" />
            </div>
          )}
          {rating != null && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold" style={{ background: "rgba(0,0,0,0.65)", border: "1px solid rgba(251,191,36,0.4)", color: "#fbbf24", backdropFilter: "blur(6px)" }}>
              <Star size={9} fill="currentColor" />
              {rating}
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8">
            <p className="text-white text-sm font-semibold leading-snug line-clamp-1 mb-1.5">{game.name}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2.5 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-none" style={{ background: statusColor, boxShadow: `0 0 5px ${statusColor}` }} />
            <span className="text-xs font-medium capitalize" style={{ color: "rgba(255,255,255,0.45)" }}>{status}</span>
          </div>
          {rating != null && <span className="text-xs font-semibold" style={{ color: "rgba(251,191,36,0.7)" }}>★ {rating}/10</span>}
        </div>
      </div>
    </Link>
  );
}
