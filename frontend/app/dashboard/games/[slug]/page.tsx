"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getGameDetails } from "@/lib/api";
import Image from "next/image";
import { toastSuccess, toastError } from "@/lib/toast";
import {
  Clock, Gamepad2, CheckCircle2, Heart,
  ExternalLink, ChevronLeft, Plus, Star,
  ChevronDown, Trash2, RefreshCw, BookMarked, Users,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "backlog",   label: "Backlog",    icon: <BookMarked   size={14} />, color: "#fbbf24" },
  { value: "playing",   label: "Playing",    icon: <Gamepad2     size={14} />, color: "#60a5fa" },
  { value: "completed", label: "Completed",  icon: <CheckCircle2 size={14} />, color: "#34d399" },
  { value: "wishlist",  label: "Wishlist",   icon: <Heart        size={14} />, color: "#a78bfa" },
] as const;

type StatusValue = typeof STATUS_OPTIONS[number]["value"];

interface LibraryEntry {
  id: number;
  status: StatusValue;
  rating: number | null;
  is_favourite: boolean;
}

interface FriendRating {
  username: string;
  avatar_url: string | null;
  rating: number | null;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  playing:   "#60a5fa",
  completed: "#34d399",
  backlog:   "#fbbf24",
  wishlist:  "#a78bfa",
};

function MetaScore({ score }: { score: number }) {
  const c =
    score >= 75 ? { bg: "rgba(59,185,100,0.15)", border: "rgba(59,185,100,0.5)", text: "#3bb964" }
    : score >= 50 ? { bg: "rgba(255,185,0,0.15)", border: "rgba(255,185,0,0.5)", text: "#ffb900" }
    : { bg: "rgba(220,60,60,0.15)", border: "rgba(220,60,60,0.5)", text: "#dc3c3c" };
  return (
    <div
      className="flex flex-col items-center justify-center w-14 h-14 rounded-xl font-black text-xl"
      style={{ background: c.bg, border: `1.5px solid ${c.border}`, color: c.text, fontFamily: "var(--font-syne)" }}
    >
      {score}
    </div>
  );
}

function Screenshots({ urls }: { urls: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const moved = useRef(false);
  const [active, setActive] = useState<string | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!ref.current) return;
    moved.current = false;
    startX.current = e.clientX;
    startScroll.current = ref.current.scrollLeft;
    ref.current.style.cursor = "grabbing";
    const handleMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX.current;
      if (Math.abs(dx) > 4) moved.current = true;
      if (ref.current) ref.current.scrollLeft = startScroll.current - dx;
    };
    const handleUp = () => {
      if (ref.current) ref.current.style.cursor = "grab";
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleUp);
    };
    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerup", handleUp);
  };

  return (
    <>
      <div
        ref={ref}
        className="overflow-x-auto"
        style={{ scrollbarWidth: "none", cursor: "grab", userSelect: "none", WebkitUserSelect: "none" }}
        onPointerDown={onPointerDown}
      >
        <div className="flex gap-3" style={{ width: "max-content", paddingBottom: 6 }}>
          {urls.map((url, i) => (
            <div
              key={i}
              className="relative rounded-lg overflow-hidden flex-none cursor-pointer group"
              style={{ width: 280, height: 158 }}
              onClick={() => !moved.current && setActive(url)}
            >
              <Image src={url} alt={`Screenshot ${i + 1}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" draggable={false} sizes="280px" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
          ))}
        </div>
      </div>
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.88)" }} onClick={() => setActive(null)}>
          <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden">
            <Image src={active} alt="Screenshot" fill className="object-contain" sizes="100vw" />
          </div>
        </div>
      )}
    </>
  );
}

function Skeleton() {
  return (
    <div className="min-h-screen text-white animate-pulse">
      <div className="w-full h-72 md:h-[420px] bg-white/[0.06]" />
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex gap-10">
        <div className="flex-1 space-y-4">
          <div className="h-8 w-2/3 rounded bg-white/[0.07]" />
          <div className="h-4 w-full rounded bg-white/[0.05]" />
          <div className="h-4 w-5/6 rounded bg-white/[0.05]" />
        </div>
        <div className="hidden md:block w-72 space-y-3">
          <div className="h-10 rounded bg-white/[0.07]" />
          <div className="h-10 rounded bg-white/[0.05]" />
        </div>
      </div>
    </div>
  );
}

function StatusDropdown({ value, onChange }: { value: StatusValue; onChange: (v: StatusValue) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = STATUS_OPTIONS.find((s) => s.value === value)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150"
        style={{
          background: `${current.color}12`,
          border: `1px solid ${current.color}40`,
        }}
      >
        <span style={{ color: current.color }}>{current.icon}</span>
        <span className="flex-1 text-left text-sm font-semibold" style={{ color: current.color }}>
          {current.label}
        </span>
        <ChevronDown
          size={14}
          style={{ color: current.color, opacity: 0.7, transform: open ? "rotate(180deg)" : "", transition: "transform 0.2s" }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-30"
          style={{ background: "rgb(16,17,28)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 16px 48px rgba(0,0,0,0.6)" }}
        >
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => { onChange(s.value); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left"
              style={{
                background: s.value === value ? `${s.color}12` : "transparent",
                borderLeft: s.value === value ? `2px solid ${s.color}` : "2px solid transparent",
              }}
              onMouseEnter={e => { if (s.value !== value) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { if (s.value !== value) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="text-sm font-medium" style={{ color: s.value === value ? s.color : "rgba(255,255,255,0.65)" }}>
                {s.label}
              </span>
              {s.value === value && (
                <CheckCircle2 size={13} className="ml-auto" style={{ color: s.color }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GameDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const appid = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const [game, setGame]               = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [entry, setEntry]             = useState<LibraryEntry | null>(null);
  const [checkDone, setCheckDone]     = useState(false);

  const [status, setStatus]           = useState<StatusValue>("backlog");
  const [isFavourite, setIsFavourite] = useState(false);
  const [rating, setRating]           = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [saving, setSaving]           = useState(false);
  const [removing, setRemoving]       = useState(false);
  const [friendRatings, setFriendRatings] = useState<FriendRating[]>([]);

  useEffect(() => {
    if (!appid) return;
    getGameDetails(appid).then((data) => { setGame(data); setLoading(false); });
  }, [appid]);

  useEffect(() => {
    if (!appid) return;
    fetch(`/api/games/library/check/${appid}`)
      .then((r) => {
        if (!r.ok) return { in_library: false, entry: null };
        return r.json();
      })
      .then((d) => {
        if (d?.in_library && d.entry) {
          setEntry(d.entry);
          setStatus(d.entry.status as StatusValue);
          setIsFavourite(d.entry.is_favourite);
          setRating(d.entry.rating);
        }
        setCheckDone(true);
      })
      .catch(() => setCheckDone(true));
    fetch(`/api/games/library/friends-ratings/${appid}`)
      .then((r) => r.ok ? r.json() : { ratings: [] })
      .then((d) => setFriendRatings(d.ratings ?? []))
      .catch(() => {});
  }, [appid]);

  const handleSave = async () => {
    if (!game || saving) return;
    setSaving(true);
    const body: Record<string, unknown> = {
      game_id: game.id,
      status,
      is_favourite: isFavourite,
      rating: rating,
      game_name: game.name,
      game_slug: game.slug,
      game_image: game.background_image,
      game_metacritic: game.metacritic,
    };
    const res  = await fetch("/api/games/library", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.error) { toastError(data.error); }
    else {
      setEntry(data);
      setStatus(data.status);
      setIsFavourite(data.is_favourite);
      setRating(data.rating);
      toastSuccess(entry ? "Library updated!" : `Added to ${status}!`);
    }
    setSaving(false);
  };

  const handleRemove = async () => {
    if (!entry || removing) return;
    setRemoving(true);
    const res = await fetch(`/api/games/library/${entry.id}`, { method: "DELETE" });
    if (res.ok) {
      setEntry(null);
      setStatus("backlog");
      setIsFavourite(false);
      setRating(null);
      toastSuccess("Removed from library.");
    } else {
      toastError("Failed to remove.");
    }
    setRemoving(false);
  };

  const handleFavouriteToggle = async () => {
    if (!entry) return;
    const next = !isFavourite;
    setIsFavourite(next);
    const res  = await fetch(`/api/games/library/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_favourite: next }),
    });
    const data = await res.json();
    if (data.error) { setIsFavourite(!next); toastError(data.error); }
    else setEntry(data);
  };

  if (loading) return <Skeleton />;
  if (!game)   return <p className="text-white/40 p-10">Game not found.</p>;

  const inLibrary = !!entry;
  const currentStatus = STATUS_OPTIONS.find((s) => s.value === status)!;

  return (
    <div className="relative min-h-screen text-white">
      {/* ── Hero ── */}
      <div className="relative w-full h-64 md:h-[420px] overflow-hidden">
        <Image src={game.background_image} alt="" fill className="object-cover scale-110 blur-md opacity-25" aria-hidden />
        <Image src={game.background_image} alt={game.name} fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(18,19,24)] via-[rgb(18,19,24)]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgb(18,19,24)]/60 to-transparent" />
        <button
          onClick={() => router.back()}
          className="absolute top-5 left-5 md:left-10 flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row gap-10 -mt-16 md:-mt-24 relative z-10">

          {/* ── Left column ── */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-2" style={{ fontFamily: "var(--font-syne)" }}>
                {game.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/40">
                {game.released && <span>{game.released}</span>}
                {game.developers?.[0] && (
                  <><span className="w-1 h-1 rounded-full bg-white/20" /><span>{game.developers[0]}</span></>
                )}
              </div>
            </div>

            {game.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {game.genres.map((g: any) => (
                  <span
                    key={g.id}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: "rgba(135,86,241,0.12)", border: "1px solid rgba(135,86,241,0.25)", color: "rgba(200,170,255,0.9)" }}
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {game.description_raw && (
              <div className="mb-10">
                <p className="text-white/60 leading-relaxed text-sm">{game.description_raw}</p>
              </div>
            )}

            {game.screenshots?.length > 0 && (
              <div className="mb-10">
                <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4" style={{ fontFamily: "var(--font-syne)" }}>Screenshots</h2>
                <Screenshots urls={game.screenshots} />
              </div>
            )}

            {game.platforms?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3" style={{ fontFamily: "var(--font-syne)" }}>Platforms</h2>
                <div className="flex flex-wrap gap-2">
                  {game.platforms.map((p: any, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-lg text-xs text-white/50" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      {p.platform?.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div className="w-full md:w-72 shrink-0 flex flex-col gap-4">
            <div className="rounded-2xl overflow-visible md:sticky md:top-6" style={{ background: "rgb(13,14,22)", border: "1px solid rgba(255,255,255,0.08)" }}>

              {/* Price + metacritic */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <div>
                  <p className="text-[10px] text-white/30 mb-0.5 uppercase tracking-wider">Price</p>
                  <p className="text-xl font-black" style={{ fontFamily: "var(--font-syne)", color: game.is_free ? "#34d399" : "white" }}>
                    {game.is_free ? "Free" : (game.price || "—")}
                  </p>
                </div>
                {game.metacritic && (
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider">Metacritic</p>
                    <MetaScore score={game.metacritic} />
                  </div>
                )}
              </div>

              {/* Library actions */}
              <div className="p-5 space-y-4">

                {/* In-library badge */}
                {inLibrary && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: `${currentStatus.color}0e`, border: `1px solid ${currentStatus.color}30` }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: currentStatus.color, boxShadow: `0 0 5px ${currentStatus.color}` }} />
                    <span className="text-xs font-semibold" style={{ color: currentStatus.color }}>In your library</span>
                  </div>
                )}

                {/* Status dropdown */}
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">
                    {inLibrary ? "Status" : "Add as"}
                  </p>
                  {checkDone ? (
                    <StatusDropdown value={status} onChange={setStatus} />
                  ) : (
                    <div className="h-11 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
                  )}
                </div>

                {/* Rating — only when in library */}
                {inLibrary && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">Your Rating</p>
                      {(hoverRating ?? rating) != null ? (
                        <span
                          className="text-base font-black leading-none"
                          style={{ fontFamily: "var(--font-syne)", color: "#fbbf24" }}
                        >
                          {hoverRating ?? rating}
                          <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.25)" }}>/10</span>
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Not rated</span>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[1,2,3,4,5,6,7,8,9,10].map((n) => {
                        const active = (hoverRating ?? rating) != null && n <= (hoverRating ?? rating)!;
                        return (
                          <button
                            key={n}
                            onClick={() => setRating(rating === n ? null : n)}
                            onMouseEnter={() => setHoverRating(n)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="h-9 rounded-lg text-sm font-bold transition-all duration-100"
                            style={active
                              ? { background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "rgb(10,9,18)", boxShadow: "0 2px 8px rgba(251,191,36,0.35)" }
                              : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.07)" }
                            }
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Favourite — only when in library */}
                {inLibrary && (
                  <button
                    onClick={handleFavouriteToggle}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                    style={
                      isFavourite
                        ? { background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.35)", color: "#fbbf24" }
                        : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }
                    }
                  >
                    <Star size={15} fill={isFavourite ? "currentColor" : "none"} />
                    <span className="text-sm font-semibold">
                      {isFavourite ? "In Favourites" : "Add to Favourites"}
                    </span>
                  </button>
                )}

                {/* Add / Update button */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-60"
                  style={{
                    fontFamily: "var(--font-syne)",
                    background: "linear-gradient(135deg, var(--backlog-purple), var(--backlog-indigo))",
                    boxShadow: "0 4px 20px rgba(135,86,241,0.3)",
                    color: "white",
                  }}
                >
                  {saving ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : inLibrary ? (
                    <><RefreshCw size={14} /> Update</>
                  ) : (
                    <><Plus size={14} /> Add to Library</>
                  )}
                </button>

                {/* Remove — only when in library */}
                {inLibrary && (
                  <button
                    onClick={handleRemove}
                    disabled={removing}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all duration-200 disabled:opacity-50"
                    style={{ color: "rgba(255,80,80,0.6)", border: "1px solid rgba(255,80,80,0.12)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,80,80,0.07)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,80,80,0.9)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,80,80,0.6)"; }}
                  >
                    {removing ? <div className="w-3 h-3 rounded-full border-2 border-red-400/30 border-t-red-400 animate-spin" /> : <Trash2 size={13} />}
                    Remove from library
                  </button>
                )}
              </div>

              {/* Meta info */}
              <div className="px-5 pb-5 space-y-3 text-sm border-t" style={{ borderColor: "rgba(255,255,255,0.07)", paddingTop: "1.25rem" }}>
                {game.developers?.length > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-white/30 shrink-0">Developer</span>
                    <span className="text-white/70 text-right text-xs leading-relaxed">{game.developers.join(", ")}</span>
                  </div>
                )}
                {game.publishers?.length > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-white/30 shrink-0">Publisher</span>
                    <span className="text-white/70 text-right text-xs leading-relaxed">{game.publishers.join(", ")}</span>
                  </div>
                )}
                {game.released && (
                  <div className="flex justify-between gap-3">
                    <span className="text-white/30 shrink-0">Released</span>
                    <span className="text-white/70 text-xs">{game.released}</span>
                  </div>
                )}
                {game.website && (
                  <a
                    href={game.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors pt-1"
                  >
                    <ExternalLink size={12} />
                    Official website
                  </a>
                )}
              </div>
            </div>

            {friendRatings.length > 0 && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "rgb(13,14,22)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="flex items-center gap-2.5 px-5 py-4 border-b"
                  style={{ borderColor: "rgba(255,255,255,0.07)" }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(135,86,241,0.15)", border: "1px solid rgba(135,86,241,0.2)" }}
                  >
                    <Users size={13} style={{ color: "var(--backlog-purple)" }} />
                  </div>
                  <span className="text-sm font-bold text-white/80" style={{ fontFamily: "var(--font-syne)" }}>
                    Friends
                  </span>
                </div>
                <div className="p-3 flex flex-col gap-1.5">
                  {friendRatings.map((fr) => {
                    const statusColor = STATUS_COLORS[fr.status] ?? "rgba(255,255,255,0.4)";
                    return (
                      <div
                        key={fr.username}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.02)" }}
                      >
                        <img
                          src={fr.avatar_url ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${fr.username}`}
                          className="w-8 h-8 rounded-lg object-cover flex-none"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                          alt={fr.username}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-sm font-medium truncate">{fr.username}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-none"
                              style={{ background: statusColor }}
                            />
                            <span className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.35)" }}>
                              {fr.status}
                            </span>
                          </div>
                        </div>
                        {fr.rating != null && (
                          <span
                            className="text-sm font-black flex-none"
                            style={{ fontFamily: "var(--font-syne)", color: "#fbbf24" }}
                          >
                            {fr.rating}
                            <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.2)" }}>/10</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      <div className="h-16" />
    </div>
  );
}
