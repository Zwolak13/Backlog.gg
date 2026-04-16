"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GameCard({
  game,
  dragging,
}: {
  game: any;
  dragging?: React.MutableRefObject<boolean>;
}) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (dragging?.current) {
      e.preventDefault();
      return;
    }
    router.push(`/dashboard/games/${game.id}`);
  };

  return (
    <div
      className="block group cursor-pointer"
      onClick={handleClick}
    >
      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{ aspectRatio: "2 / 3" }}
      >
        <Image
          src={game.background_image || "/placeholder.jpg"}
          alt={game.name}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          sizes="150px"
          draggable={false}
        />

        {/* bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

        {/* hover tint */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "rgba(135,86,241,0.10)" }}
        />

        {/* border */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/6 group-hover:ring-[var(--backlog-purple)]/50 transition-all duration-300" />

        {/* name */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="text-white text-[11px] font-semibold leading-snug line-clamp-2 select-none">
            {game.name}
          </p>
        </div>
      </div>
    </div>
  );
}
