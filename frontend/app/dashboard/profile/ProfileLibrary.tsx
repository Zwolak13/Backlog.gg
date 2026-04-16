"use client";

import { useState } from "react";
import { useLibrary, LibraryGame } from "@/hooks/useLibrary";
import Link from "next/link";
import { Star, Trash2 } from "lucide-react";

const STATUSES = ["all", "playing", "completed", "backlog", "wishlist"] as const;

export default function ProfileLibrary() {
  const [filter, setFilter] = useState<string>("all");
  const { games, loading } = useLibrary(filter === "all" ? undefined : filter);

  const handleRemove = async (id: number) => {
    await fetch(`/api/games/library/${id}`, { method: "DELETE" });
    window.location.reload();
  };

  const handleToggleFavourite = async (ug: LibraryGame) => {
    await fetch(`/api/games/library/${ug.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_favourite: !ug.is_favourite }),
    });
    window.location.reload();
  };

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all capitalize"
            style={filter === s
              ? { background: "linear-gradient(135deg, var(--backlog-purple), var(--backlog-indigo))", color: "white", boxShadow: "0 2px 12px rgba(135,86,241,0.35)" }
              : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }
            }
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-white/30 text-sm">Loading…</p>
      ) : games.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 gap-3 text-center rounded-2xl"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}
        >
          <p className="text-white/35 font-medium">No games here yet</p>
          <p className="text-white/20 text-sm max-w-xs">Browse games and add them to your library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {games.map((ug) => (
            <LibraryCard
              key={ug.id}
              userGame={ug}
              onRemove={() => handleRemove(ug.id)}
              onToggleFavourite={() => handleToggleFavourite(ug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LibraryCard({
  userGame,
  onRemove,
  onToggleFavourite,
}: {
  userGame: LibraryGame;
  onRemove: () => void;
  onToggleFavourite: () => void;
}) {
  const { game, status, rating, is_favourite } = userGame;

  return (
    <div className="group relative rounded-lg overflow-hidden border border-white/[0.07] hover:border-white/20 transition-all duration-300 bg-[rgb(28,30,40)] aspect-[3/4]">
      {game.background_image ? (
        <img
          src={game.background_image}
          alt={game.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--backlog-purple)]/20 to-transparent" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onToggleFavourite}
          className={`p-1.5 rounded-lg backdrop-blur-md border transition ${is_favourite ? "bg-yellow-500/80 border-yellow-400/50 text-white" : "bg-black/50 border-white/20 text-white/60 hover:text-yellow-400"}`}
        >
          <Star size={13} fill={is_favourite ? "currentColor" : "none"} />
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 text-white/60 hover:text-red-400 transition"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <Link href={`/dashboard/games/${game.id}`}>
          <p className="text-white text-sm font-semibold leading-tight line-clamp-2 drop-shadow-md hover:text-[var(--backlog-purple)] transition-colors">
            {game.name}
          </p>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-white/40 text-xs capitalize">{status}</span>
          {rating != null && (
            <span className="text-yellow-400 text-xs">★ {rating}</span>
          )}
        </div>
      </div>
    </div>
  );
}
