"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import GameTile from "@/components/dashboard/GameTile";

async function fetchGames(query: string, page: number) {
  const params = new URLSearchParams({ page: String(page) });
  if (query) params.set("q", query);
  const res = await fetch(`/api/games?${params}`);
  return res.json() as Promise<{ results: any[]; has_more: boolean }>;
}

export default function GamesPage() {
  const [query, setQuery] = useState("");
  const [games, setGames] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef(query);
  queryRef.current = query;

  const load = useCallback(async (q: string, p: number, replace: boolean) => {
    setLoading(true);
    const data = await fetchGames(q, p);
    setGames((prev) => (replace ? data.results : [...prev, ...data.results]));
    setHasMore(data.has_more);
    setLoading(false);
    setInitialLoad(false);
  }, []);

  useEffect(() => {
    setGames([]);
    setPage(1);
    setHasMore(false);
    setInitialLoad(true);

    const timeout = setTimeout(() => {
      load(query, 1, true);
    }, query ? 350 : 0);

    return () => clearTimeout(timeout);
  }, [query, load]);

  useEffect(() => {
    if (page === 1) return;
    load(queryRef.current, page, false);
  }, [page, load]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <div className="p-6 md:p-10 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Browse Games</h1>

      <input
        type="text"
        placeholder="Search Steam games…"
        className="w-full p-3 rounded-lg bg-white/10 border border-white/20 mb-8 focus:outline-none focus:border-[var(--backlog-purple)]/50 transition-colors"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {initialLoad ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--backlog-purple)] border-t-transparent animate-spin" />
        </div>
      ) : games.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-white/40 font-medium">No games found.</p>
          <p className="text-white/25 text-sm">Try a different search term.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {games.map((game) => (
              <GameTile key={game.id} game={game} />
            ))}
          </div>

          <div ref={sentinelRef} className="flex items-center justify-center py-10">
            {loading && (
              <div className="w-7 h-7 rounded-full border-2 border-[var(--backlog-purple)] border-t-transparent animate-spin" />
            )}
            {!loading && !hasMore && games.length > 0 && (
              <p className="text-white/20 text-sm">All games loaded</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
