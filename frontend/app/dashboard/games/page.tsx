"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, ChevronLeft, ChevronRight,
  TrendingUp, Sparkles, Tag, Clock, ArrowRight, X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GameSkeleton from "@/components/dashboard/GameSkeleton";

interface Game {
  id: number;
  slug: string;
  name: string;
  background_image: string;
  metacritic: number | null;
}
interface Section { id: string; title: string; games: Game[] }

const ICONS: Record<string, React.ReactNode> = {
  top_sellers:  <TrendingUp size={13} />,
  new_releases: <Sparkles   size={13} />,
  specials:     <Tag        size={13} />,
  coming_soon:  <Clock      size={13} />,
};

async function fetchBrowse(safe: boolean) {
  const r = await fetch(`/api/games?safe=${safe ? "1" : "0"}`); if (!r.ok) return null;
  return r.json() as Promise<{ mode: "browse"; sections: Section[] }>;
}
async function fetchSearch(q: string, page: number, safe: boolean) {
  const r = await fetch(`/api/games?${new URLSearchParams({ q, page: String(page), safe: safe ? "1" : "0" })}`);
  if (!r.ok) return null;
  return r.json() as Promise<{ mode: "search"; results: Game[]; has_more: boolean }>;
}

function useDrag() {
  const ref   = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  const down  = (e: React.PointerEvent) => {
    if (!ref.current) return;
    moved.current = false;
    const sx = e.clientX, ss = ref.current.scrollLeft;
    ref.current.style.cursor = "grabbing";
    const mv = (ev: PointerEvent) => {
      const dx = ev.clientX - sx;
      if (Math.abs(dx) > 4) moved.current = true;
      if (ref.current) ref.current.scrollLeft = ss - dx;
    };
    const up = () => {
      if (ref.current) ref.current.style.cursor = "grab";
      document.removeEventListener("pointermove", mv);
      document.removeEventListener("pointerup", up);
    };
    document.addEventListener("pointermove", mv);
    document.addEventListener("pointerup", up);
  };
  return { ref, moved, down };
}

function LandscapeCard({ game, dragging }: { game: Game; dragging?: React.MutableRefObject<boolean> }) {
  const router = useRouter();
  return (
    <div
      className="group cursor-pointer flex-shrink-0"
      onClick={() => { if (!dragging?.current) router.push(`/dashboard/games/${game.id}`); }}
    >
      <div
        className="relative overflow-hidden rounded-lg"
        style={{ width: 292, height: 136 }}
      >
        <Image
          src={game.background_image} alt={game.name} fill draggable={false}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="292px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div
          className="absolute inset-0 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
          style={{ boxShadow: "inset 0 0 0 1.5px rgba(135,86,241,0.7)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5">
          <p className="text-white text-xs font-semibold leading-tight line-clamp-1 select-none">
            {game.name}
          </p>
          {game.metacritic && (
            <p className="text-white/40 text-[10px] mt-0.5 select-none">{game.metacritic} Metacritic</p>
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturedCarousel({ games }: { games: Game[] }) {
  const unique = games.filter((g, i, arr) => arr.findIndex((x) => x.id === g.id) === i);
  const [idx, setIdx] = useState(0);
  const game = unique[idx];

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % unique.length), 6000);
    return () => clearInterval(t);
  }, [unique.length]);

  if (!game) return null;

  return (
    <div className="mb-14">
      <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: 420 }}>
        <Image
          key={game.id}
          src={game.background_image} alt={game.name} fill
          className="object-cover object-center"
          sizes="100vw" priority
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(18,19,24,0.92) 0%, rgba(18,19,24,0.55) 45%, rgba(18,19,24,0.15) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,19,24,0.7) 0%, transparent 40%)" }} />

        {/* left content */}
        <div className="absolute inset-0 flex flex-col justify-center px-10 max-w-xl">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "var(--backlog-purple)" }}>
            Featured · Top Seller
          </p>
          <h2
            className="text-4xl md:text-5xl font-black text-white leading-tight mb-5 truncate"
            style={{ fontFamily: "var(--font-syne)", maxWidth: "100%" }}
          >
            {game.name}
          </h2>
          <Link
            href={`/dashboard/games/${game.id}`}
            className="inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, var(--backlog-purple), var(--backlog-indigo))",
              boxShadow: "0 4px 20px rgba(135,86,241,0.35)",
            }}
          >
            View Game <ArrowRight size={14} />
          </Link>
        </div>

        {/* prev/next */}
        {unique.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => (i - 1 + unique.length) % unique.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <ChevronLeft size={18} className="text-white/70" />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % unique.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <ChevronRight size={18} className="text-white/70" />
            </button>
          </>
        )}

        {/* dot indicators */}
        <div className="absolute bottom-5 left-10 flex gap-1.5">
          {unique.slice(0, 10).map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === idx ? 20 : 6, height: 6,
                background: i === idx ? "var(--backlog-purple)" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>
      </div>

      {/* thumbnail strip */}
      <div className="mt-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {unique.slice(0, 10).map((g, i) => (
          <button
            key={g.id}
            onClick={() => setIdx(i)}
            className="relative flex-none rounded-lg overflow-hidden transition-all duration-200"
            style={{
              width: 100, height: 47,
              outline: i === idx ? "2px solid var(--backlog-purple)" : "2px solid transparent",
              outlineOffset: 2,
              opacity: i === idx ? 1 : 0.5,
            }}
          >
            <Image src={g.background_image} alt={g.name} fill className="object-cover" sizes="100px" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Shelf (horizontal landscape cards) ───────────────────────────────────────
function Shelf({ section }: { section: Section }) {
  const { ref, moved, down } = useDrag();
  const icon = ICONS[section.id];

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2.5 mb-4">
        {icon && (
          <span className="flex items-center justify-center w-6 h-6 rounded-md" style={{ background: "rgba(135,86,241,0.15)", color: "var(--backlog-purple)" }}>
            {icon}
          </span>
        )}
        <h2 className="text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: "var(--font-syne)" }}>
          {section.title}
        </h2>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.08), transparent)" }} />
        <span className="text-xs text-white/20">{section.games.length}</span>
      </div>

      <div className="relative">
        <div
          ref={ref}
          className="overflow-x-auto"
          style={{ scrollbarWidth: "none", cursor: "grab", userSelect: "none", WebkitUserSelect: "none", paddingBottom: 4 }}
          onPointerDown={down}
        >
          <div className="flex gap-2.5" style={{ width: "max-content" }}>
            {section.games.map((game) => (
              <LandscapeCard key={game.id} game={game} dragging={moved} />
            ))}
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-1 w-16 pointer-events-none z-10" style={{ background: "linear-gradient(to left, rgb(18,19,24), transparent)" }} />
      </div>
    </div>
  );
}

// ─── Search results ───────────────────────────────────────────────────────────
function SearchCard({ game }: { game: Game }) {
  return (
    <Link href={`/dashboard/games/${game.id}`} className="group flex items-center gap-3 p-2.5 rounded-xl transition-colors" style={{ background: "rgba(255,255,255,0)" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")} onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0)")}>
      <div className="relative flex-none rounded-lg overflow-hidden" style={{ width: 120, height: 56 }}>
        <Image src={game.background_image} alt={game.name} fill className="object-cover" sizes="120px" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{game.name}</p>
        {game.metacritic && <p className="text-white/35 text-xs mt-0.5">{game.metacritic} Metacritic</p>}
      </div>
      <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors flex-none" />
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function BrowseSkeleton() {
  return (
    <div>
      <div className="w-full rounded-2xl bg-white/[0.05] animate-pulse mb-3" style={{ height: 420 }} />
      <div className="flex gap-2 mb-14">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex-none rounded-lg bg-white/[0.05] animate-pulse" style={{ width: 100, height: 47 }} />
        ))}
      </div>
      {[0, 1, 2].map((si) => (
        <div key={si} className="mb-12">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-6 h-6 rounded-md bg-white/[0.07] animate-pulse" />
            <div className="h-3.5 w-24 rounded bg-white/[0.07] animate-pulse" />
          </div>
          <div className="flex gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-none rounded-lg bg-white/[0.06] animate-pulse" style={{ width: 292, height: 136 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GamesPage() {
  const [query, setQuery]                   = useState("");
  const [sections, setSections]             = useState<Section[]>([]);
  const [searchResults, setSearchResults]   = useState<Game[]>([]);
  const [page, setPage]                     = useState(1);
  const [hasMore, setHasMore]               = useState(false);
  const [searchLoading, setSearchLoading]   = useState(false);
  const [browseLoading, setBrowseLoading]   = useState(true);
  const [searchOpen, setSearchOpen]         = useState(false);
  const [safeMode, setSafeMode]             = useState(true);
  const inputRef                            = useRef<HTMLInputElement>(null);
  const sentinelRef                         = useRef<HTMLDivElement>(null);
  const queryRef                            = useRef(query);
  const safeModeRef                         = useRef(safeMode);
  queryRef.current   = query;
  safeModeRef.current = safeMode;

  // Read safe mode preference set in Settings
  useEffect(() => {
    const stored = localStorage.getItem("backlog_safe_mode");
    if (stored !== null) setSafeMode(stored !== "0");
  }, []);

  useEffect(() => {
    fetchBrowse(safeMode).then((d) => { if (d?.mode === "browse") setSections(d.sections); setBrowseLoading(false); });
  }, [safeMode]);

  const loadSearch = useCallback(async (q: string, p: number, replace: boolean) => {
    setSearchLoading(true);
    const d = await fetchSearch(q, p, safeModeRef.current);
    if (d?.mode === "search") {
      setSearchResults((prev) => replace ? d.results : [...prev, ...d.results]);
      setHasMore(d.has_more);
    }
    setSearchLoading(false);
  }, []);

  useEffect(() => {
    if (!query) return;
    setSearchResults([]); setPage(1); setHasMore(false);
    const t = setTimeout(() => loadSearch(query, 1, true), 350);
    return () => clearTimeout(t);
  }, [query, loadSearch]);

  useEffect(() => { if (page > 1 && query) loadSearch(queryRef.current, page, false); }, [page, loadSearch]);

  useEffect(() => {
    const el = sentinelRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && hasMore && !searchLoading) setPage((p) => p + 1); }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, [hasMore, searchLoading]);

  const openSearch = () => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 50); };
  const closeSearch = () => { setSearchOpen(false); setQuery(""); };
  const isSearching = query.length > 0;

  const topSellers      = sections.find((s) => s.id === "top_sellers");
  const shelves         = sections.filter((s) => s.id !== "top_sellers");

  return (
    <div className="relative min-h-screen text-white">
      {/* subtle ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute" style={{ top: 0, left: "20%", width: 800, height: 600, background: "radial-gradient(ellipse, rgba(135,86,241,0.07) 0%, transparent 60%)", filter: "blur(40px)" }} />
      </div>

      <div className="relative z-10 px-6 md:px-10 pt-8 pb-16">

        {/* ── Header row ── */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight" style={{ fontFamily: "var(--font-syne)", background: "linear-gradient(100deg,#fff 40%,rgba(255,255,255,0.4))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Discover
            </h1>
            <p className="text-white/25 text-xs mt-1">Trending on Steam</p>
          </div>

          {/* controls */}
          <div className="flex items-center gap-2">
            {/* search toggle */}
            {searchOpen ? (
              <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(135,86,241,0.1)", border: "1px solid rgba(135,86,241,0.35)", width: 280 }}>
                <Search size={14} style={{ color: "var(--backlog-purple)", flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Steam…"
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-white/25 focus:outline-none"
                />
                <button onClick={closeSearch}><X size={14} className="text-white/30 hover:text-white/70 transition-colors" /></button>
              </div>
            ) : (
              <button
                onClick={openSearch}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm text-white/40 hover:text-white/70 transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <Search size={14} />
                <span className="text-xs">Search</span>
              </button>
            )}
          </div> {/* end controls */}
        </div>

        {/* ── Browse ── */}
        {!isSearching && (
          browseLoading ? <BrowseSkeleton /> : (
            <>
              {topSellers && <FeaturedCarousel games={topSellers.games} />}
              {shelves.map((s) => <Shelf key={s.id} section={s} />)}
            </>
          )
        )}

        {/* ── Search results ── */}
        {isSearching && (
          <div>
            <p className="text-xs text-white/30 mb-4 uppercase tracking-wider">
              {searchLoading ? "Searching…" : `Results for "${query}"`}
            </p>
            {searchLoading && searchResults.length === 0 ? (
              <div className="space-y-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5">
                    <div className="flex-none rounded-lg bg-white/[0.07] animate-pulse" style={{ width: 120, height: 56 }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-2/3 rounded bg-white/[0.07] animate-pulse" />
                      <div className="h-3 w-1/4 rounded bg-white/[0.05] animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 && !searchLoading ? (
              <p className="text-white/25 py-16 text-center text-sm">No games found for "{query}"</p>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                {searchResults.map((game) => <SearchCard key={game.id} game={game} />)}
                <div ref={sentinelRef} className="flex items-center justify-center py-4">
                  {searchLoading && <div className="w-4 h-4 rounded-full border-2 border-[var(--backlog-purple)] border-t-transparent animate-spin" />}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
