"use client";

import { Gamepad2, Heart } from "lucide-react";
import Link from "next/link";
import { useRecentGames, useFavouriteGames, LibraryGame } from "@/hooks/useLibrary";

export default function ProfileGameList() {
  const { games: recentGames, loading: recentLoading } = useRecentGames();
  const { games: favouriteGames, loading: favLoading } = useFavouriteGames();

  return (
    <div className="flex flex-col gap-10">
      <GameSection
        icon={<Gamepad2 size={16} />}
        title="Recent Activity"
        games={recentGames}
        loading={recentLoading}
      />
      <GameSection
        icon={<Heart size={16} />}
        title="Favourite Games"
        games={favouriteGames}
        loading={favLoading}
      />
    </div>
  );
}

function GameSection({
  icon,
  title,
  games,
  loading,
}: {
  icon: React.ReactNode;
  title: string;
  games: LibraryGame[];
  loading: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4 px-1">
        <span className="text-[var(--backlog-purple)]/80">{icon}</span>
        <h2 className="text-sm font-semibold text-white/80 uppercase tracking-widest">{title}</h2>
        <span className="text-white/30 text-xs">({games.length})</span>
        <div className="flex-1 h-px bg-white/8 ml-2" />
      </div>

      {loading ? (
        <p className="text-white/30 text-sm px-1">Loading…</p>
      ) : games.length === 0 ? (
        <p className="text-white/30 text-sm px-1">No games yet.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(135,86,241,0.3) transparent" }}>
          {games.map((ug) => (
            <div key={ug.id} className="flex-shrink-0">
              <LibraryGameCard userGame={ug} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LibraryGameCard({ userGame }: { userGame: LibraryGame }) {
  const { game, rating, status } = userGame;

  return (
    <Link href={`/dashboard/games/${game.id}`}>
      <div
        className="
          group relative
          w-[160px] h-[220px]
          rounded-lg overflow-hidden
          cursor-pointer select-none
          border border-white/[0.07]
          transition-all duration-300
          hover:border-white/20
          hover:scale-[1.03]
          shadow-[0_2px_12px_rgba(0,0,0,0.5)]
          hover:shadow-[0_6px_20px_rgba(0,0,0,0.7)]
          bg-[rgb(28,30,40)]
        "
      >
        {game.background_image ? (
          <img
            src={game.background_image}
            alt={game.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--backlog-purple)]/20 to-transparent" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {rating != null && (
          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[var(--backlog-purple)]/70 backdrop-blur-md border border-white/20 text-white text-sm font-semibold flex items-center gap-1 shadow-[0_0_10px_var(--backlog-purple)] group-hover:bg-[var(--backlog-purple)] transition">
            ★ {rating}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-sm font-semibold leading-tight line-clamp-2 drop-shadow-md">
            {game.name}
          </p>
          <p className="text-white/40 text-xs mt-0.5 capitalize">{status}</p>
        </div>
      </div>
    </Link>
  );
}
