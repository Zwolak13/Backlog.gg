"use client";

import { Gamepad2, Star } from "lucide-react";
import Link from "next/link";
import { useRecentGames, useFavouriteGames, LibraryGame } from "@/hooks/useLibrary";

const STATUS_COLORS: Record<string, string> = {
  playing:   "#60a5fa",
  completed: "#34d399",
  backlog:   "#fbbf24",
  wishlist:  "#a78bfa",
};

export default function ProfileGameList() {
  const { games: recentGames,    loading: recentLoading } = useRecentGames();
  const { games: favouriteGames, loading: favLoading    } = useFavouriteGames();

  return (
    <div className="flex flex-col gap-10">
      <GameSection
        icon={<Gamepad2 size={14} />}
        title="Recent Activity"
        games={recentGames}
        loading={recentLoading}
      />
      <GameSection
        icon={<Star size={14} />}
        title="Favourite Games"
        games={favouriteGames}
        loading={favLoading}
      />
    </div>
  );
}

function GameSection({
  icon, title, games, loading,
}: {
  icon: React.ReactNode;
  title: string;
  games: LibraryGame[];
  loading: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(135,86,241,0.15)", border: "1px solid rgba(135,86,241,0.2)", color: "var(--backlog-purple)" }}
        >
          {icon}
        </div>
        <h2
          className="text-sm font-bold text-white/90 uppercase tracking-widest"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          {title}
        </h2>
        {!loading && games.length > 0 && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "rgba(135,86,241,0.12)", color: "rgba(167,139,250,0.8)", border: "1px solid rgba(135,86,241,0.2)" }}
          >
            {games.length}
          </span>
        )}
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(135,86,241,0.15), transparent)" }} />
      </div>

      {loading ? (
        <div
          className="flex gap-3"
          style={{ overflowX: "auto", overflowY: "clip", paddingTop: 12, paddingBottom: 16 }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex-none rounded-xl animate-pulse"
              style={{ width: 260, height: 156, background: "rgba(255,255,255,0.04)" }}
            />
          ))}
        </div>
      ) : games.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-14 gap-3 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}
        >
          <p className="text-white/25 text-sm">No games here yet.</p>
        </div>
      ) : (
        <div
          className="flex gap-3"
          style={{
            overflowX: "auto",
            overflowY: "clip",
            paddingTop: 12,
            paddingBottom: 16,
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(135,86,241,0.25) transparent",
          }}
        >
          {games.map((ug) => (
            <div key={ug.id} className="flex-none">
              <GameCard userGame={ug} />
            </div>
          ))}
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
        style={{
          width: 260,
          transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-8px)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
      >
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            height: 156,
            background: "rgb(18,20,32)",
            transition: "box-shadow 0.25s ease, border-color 0.25s ease",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = `${statusColor}70`;
            (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px rgba(0,0,0,0.75), 0 0 0 1px ${statusColor}40`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.5)";
          }}
        >
          {game.background_image ? (
            <img
              src={game.background_image}
              alt={game.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, rgba(135,86,241,0.3) 0%, rgba(85,54,218,0.1) 100%)" }}
            />
          )}

          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.05) 100%)" }}
          />

          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: 2, background: statusColor, opacity: 0.7, boxShadow: `0 0 8px ${statusColor}` }}
          />

          {is_favourite && (
            <div
              className="absolute top-2.5 left-2.5 w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.65)", border: "1px solid rgba(251,191,36,0.5)", backdropFilter: "blur(6px)" }}
            >
              <Star size={11} fill="#fbbf24" color="#fbbf24" />
            </div>
          )}

          {rating != null && (
            <div
              className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
              style={{
                background: "rgba(0,0,0,0.65)",
                border: "1px solid rgba(251,191,36,0.4)",
                color: "#fbbf24",
                backdropFilter: "blur(6px)",
              }}
            >
              <Star size={9} fill="currentColor" />
              {rating}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8">
            <p className="text-white text-sm font-semibold leading-snug line-clamp-1 mb-1.5">
              {game.name}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2.5 px-1">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-none"
              style={{ background: statusColor, boxShadow: `0 0 5px ${statusColor}` }}
            />
            <span className="text-xs font-medium capitalize" style={{ color: "rgba(255,255,255,0.45)" }}>
              {status}
            </span>
          </div>
          {rating != null && (
            <span className="text-xs font-semibold" style={{ color: "rgba(251,191,36,0.7)" }}>
              ★ {rating}/10
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
