"use client";

import { use, useState, useEffect } from "react";
import { getGameDetails } from "@/lib/api";
import Image from "next/image";

export default function GameDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params); // poprawne rozpakowanie

  const [game, setGame] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const data = await getGameDetails(slug);
      setGame(data);
    };
    load();
  }, [slug]);

  if (!game) return <p className="text-white p-10">Loading...</p>;

  return (
    <div className="p-10 text-white max-w-4xl mx-auto">
      <div className="relative w-full h-80 rounded-xl overflow-hidden mb-6">
        {game.background_image && (
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            className="object-cover"
          />
        )}
      </div>

      <h1 className="text-4xl font-bold mb-4">{game.name}</h1>

      {game.metacritic && (
        <p className="text-lg text-white/60 mb-4">
          Metacritic Score: {game.metacritic}
        </p>
      )}

      {game.description_raw && (
        <p className="text-white/70 leading-relaxed mb-6">
          {game.description_raw}
        </p>
      )}

      <h2 className="text-2xl font-semibold mt-8 mb-3">Platforms</h2>
      <ul className="list-disc ml-6 text-white/70">
        {game.platforms?.map((p: any) => (
          <li key={p.platform?.id || p.id}>{p.platform?.name || p.name}</li>
        ))}
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Genres</h2>
      <ul className="list-disc ml-6 text-white/70">
        {game.genres?.map((g: any) => (
          <li key={g.id}>{g.name}</li>
        ))}
      </ul>
    </div>
  );
}
