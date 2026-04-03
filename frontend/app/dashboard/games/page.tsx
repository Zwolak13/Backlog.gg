"use client";

import { useState, useEffect } from "react";
import { searchGames } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

export default function GamesPage() {
  const [query, setQuery] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load all games on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await searchGames("");
      setGames(data.results || []);
      setLoading(false);
    };
    load();
  }, []);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      const data = await searchGames(query);
      setGames(data.results || []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Browse Games</h1>

      <input
        type="text"
        placeholder="Search games..."
        className="w-full p-3 rounded bg-white/10 border border-white/20 mb-8"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p className="text-white/50">Loading...</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {games.map((game: any) => (
          <Link
            key={game.slug}
            href={`/games/${game.slug}`}
            className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition"
          >
            <div className="relative w-full h-40">
              {game.background_image ? (
                <Image
                  src={game.background_image}
                  alt={game.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/40">
                  No image
                </div>
              )}
            </div>

            <div className="p-3">
              <h2 className="font-semibold">{game.name}</h2>
              {game.metacritic && (
                <p className="text-sm text-white/50">Metacritic: {game.metacritic}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
