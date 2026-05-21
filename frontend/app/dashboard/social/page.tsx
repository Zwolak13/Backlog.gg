"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe, Lock, Star, Search, Users, MessageSquare, X } from "lucide-react";
import { ratingColor } from "@/lib/utils";

interface SocialReview {
  username: string;
  avatar_url: string | null;
  rating: number | null;
  review_text: string;
  review_visibility: "global" | "friends";
  status: string;
  updated_at: string;
  game: {
    id: number;
    name: string;
    slug: string;
    background_image: string | null;
  };
}

interface SocialUser {
  username: string;
  avatar_url: string | null;
  bio: string;
  created_at: string;
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
  return `${Math.floor(h / 24)}d ago`;
}

const STEAM_CDN = "https://cdn.akamai.steamstatic.com/steam/apps";

function ReviewCard({ r }: { r: SocialReview }) {
  const [expanded, setExpanded] = useState(false);
  const long = r.review_text.length > 200;

  const sources = r.game.id ? [
    `${STEAM_CDN}/${r.game.id}/library_hero.jpg`,
    `${STEAM_CDN}/${r.game.id}/capsule_616x353.jpg`,
    r.game.background_image,
  ].filter(Boolean) as string[] : [r.game.background_image].filter(Boolean) as string[];

  const [imgIdx, setImgIdx] = useState(0);
  const img = sources[imgIdx] ?? null;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: "rgb(13,14,22)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {img && (
        <div className="relative h-28 overflow-hidden">
          <Image
            src={img!}
            alt={r.game.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 600px"
            quality={90}
            onError={() => { if (imgIdx < sources.length - 1) setImgIdx(i => i + 1); }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgb(13,14,22)] via-[rgb(13,14,22)]/40 to-transparent" />
          <div className="absolute bottom-3 left-4">
            <Link
              href={`/dashboard/games/${r.game.id}`}
              className="text-sm font-bold text-white hover:text-purple-300 transition-colors"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {r.game.name}
            </Link>
          </div>
        </div>
      )}

      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/profile/${r.username}`}>
            <img
              src={r.avatar_url ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${r.username}`}
              alt={r.username}
              className="w-9 h-9 rounded-xl object-cover flex-none"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/dashboard/profile/${r.username}`} className="text-sm font-semibold text-white hover:text-purple-300 transition-colors">
              {r.username}
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-[10px] capitalize px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  color: STATUS_COLORS[r.status] ?? "rgba(255,255,255,0.4)",
                  background: `${STATUS_COLORS[r.status] ?? "rgba(255,255,255,0.1)"}18`,
                }}
              >
                {r.status}
              </span>
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                {timeAgo(r.updated_at)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-none">
            {r.rating != null && (
              <span className="flex items-center gap-1 text-sm font-bold tabular-nums" style={{ color: ratingColor(r.rating) }}>
                <Star size={12} fill="currentColor" />
                {r.rating}
                <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.25)" }}>/10</span>
              </span>
            )}
            {r.review_visibility === "friends"
              ? <Lock size={11} style={{ color: "rgba(255,255,255,0.2)" }} />
              : <Globe size={11} style={{ color: "rgba(255,255,255,0.2)" }} />
            }
          </div>
        </div>

        <div>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            {long && !expanded ? `${r.review_text.slice(0, 200)}…` : r.review_text}
          </p>
          {long && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs mt-1 transition-colors"
              style={{ color: "rgba(135,86,241,0.8)" }}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function UserCard({ u }: { u: SocialUser }) {
  return (
    <Link href={`/dashboard/profile/${u.username}`} className="block">
      <div
        className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-150 hover:brightness-125"
        style={{ background: "rgb(13,14,22)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <img
          src={u.avatar_url ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`}
          alt={u.username}
          className="w-12 h-12 rounded-xl object-cover flex-none"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{u.username}</p>
          <p className="text-xs truncate mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {u.bio || "No bio yet."}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function SocialPage() {
  const [reviews, setReviews]       = useState<SocialReview[]>([]);
  const [newestUsers, setNewestUsers] = useState<SocialUser[]>([]);
  const [searchResults, setSearchResults] = useState<SocialUser[]>([]);
  const [query, setQuery]           = useState("");
  const [focused, setFocused]       = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [searchLoading, setSearchLoading]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSearching = focused || query.length > 0;

  useEffect(() => {
    fetch("/api/social/reviews")
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => {})
      .finally(() => setReviewsLoading(false));

    fetch("/api/social/users")
      .then((r) => r.json())
      .then((d) => setNewestUsers(d.users ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!query) { setSearchResults([]); return; }
      setSearchLoading(true);
      fetch(`/api/social/users?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((d) => setSearchResults(d.users ?? []))
        .catch(() => {})
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const clearSearch = () => {
    setQuery("");
    setFocused(false);
    inputRef.current?.blur();
  };

  return (
    <div className="min-h-screen text-white px-6 md:px-10 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-3xl font-black"
          style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.02em" }}
        >
          Social
        </h1>
      </div>

      {/* Search bar — always visible, prominent */}
      <div className="mb-8">
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300"
          style={{
            background: isSearching ? "rgb(16,17,28)" : "rgba(255,255,255,0.04)",
            border: isSearching ? "1px solid rgba(135,86,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
            boxShadow: isSearching ? "0 0 0 3px rgba(135,86,241,0.1)" : "none",
          }}
        >
          <Search size={18} style={{ color: isSearching ? "rgba(135,86,241,0.9)" : "rgba(255,255,255,0.3)", transition: "color 0.2s" }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search players…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 bg-transparent text-base text-white placeholder:text-white/30 outline-none"
          />
          {query && (
            <button onClick={clearSearch} className="p-1 rounded-lg transition-colors hover:bg-white/10">
              <X size={15} style={{ color: "rgba(255,255,255,0.4)" }} />
            </button>
          )}
        </div>
      </div>

      {/* SEARCH RESULTS — full screen when active */}
      {isSearching && (
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            {query ? `Results for "${query}"` : "Newest Players"}
          </p>
          {searchLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
              ))}
            </div>
          ) : (query ? searchResults : newestUsers).length === 0 ? (
            <div className="text-center py-20">
              <Users size={32} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.15)" }} />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No players found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(query ? searchResults : newestUsers).map((u) => (
                <UserCard key={u.username} u={u} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* NORMAL LAYOUT — reviews + newest players side by side */}
      {!isSearching && (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Reviews feed */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-5">
              <MessageSquare size={15} style={{ color: "var(--backlog-purple)" }} />
              <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                Recent Reviews
              </h2>
            </div>
            {reviewsLoading ? (
              <div className="flex flex-col gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-52 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div
                className="rounded-2xl px-8 py-16 text-center"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <MessageSquare size={28} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.2)" }} />
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map((r, i) => <ReviewCard key={`${r.username}-${r.game.slug}-${i}`} r={r} />)}
              </div>
            )}
          </div>

          {/* Newest players sidebar */}
          <div className="w-full lg:w-72 shrink-0">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgb(13,14,22)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2.5 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <Users size={13} style={{ color: "var(--backlog-purple)" }} />
                <h2 className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-syne)" }}>
                  Newest Players
                </h2>
              </div>
              <div className="p-2 flex flex-col gap-1">
                {newestUsers.length === 0 ? (
                  <p className="text-xs text-center py-6" style={{ color: "rgba(255,255,255,0.25)" }}>No players yet.</p>
                ) : (
                  newestUsers.slice(0, 8).map((u) => (
                    <Link key={u.username} href={`/dashboard/profile/${u.username}`} className="block">
                      <div
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/5"
                      >
                        <img
                          src={u.avatar_url ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`}
                          alt={u.username}
                          className="w-8 h-8 rounded-lg object-cover flex-none"
                          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{u.username}</p>
                          <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>
                            {u.bio || "No bio yet."}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
