"use client";

import { useState } from "react";

interface GameCardProps {
  game: {
    title: string;
    cover: any;
    rating?: number;
  };
}

export default function ProfileGameCard({ game }: GameCardProps) {
  const [imgError, setImgError] = useState(false);

  const src = imgError
    ? null
    : typeof game.cover === "string"
    ? game.cover
    : game.cover?.src ?? null;

  return (
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
      {src ? (
        <img
          src={src}
          alt={game.title}
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--backlog-purple)]/20 to-transparent" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {game.rating != null && (
        <div
          className="
            absolute top-2.5 right-2.5
            px-2.5 py-1 rounded-full
            bg-[var(--backlog-purple)]/70 backdrop-blur-md
            border border-white/20
            text-white text-sm font-semibold
            flex items-center gap-1
            shadow-[0_0_10px_var(--backlog-purple)]
            group-hover:bg-[var(--backlog-purple)]
            transition
          "
        >
          ★ {game.rating}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white text-sm font-semibold leading-tight line-clamp-2 drop-shadow-md">
          {game.title}
        </p>
      </div>
    </div>
  );
}
