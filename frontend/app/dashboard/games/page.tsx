"use client";

import { useState, useEffect } from "react";
import { searchGames } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import GameTile from "@/components/dashboard/GameTile";

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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-10">
        {games.map((game) => (
            <GameTile key={game.id} game={game} />
        ))}
        </div>

    </div>
  );
}
