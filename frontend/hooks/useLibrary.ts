"use client";

import { useEffect, useState } from "react";

export interface LibraryGame {
  id: number;
  status: string;
  rating: number | null;
  is_favourite: boolean;
  hours_played: number | null;
  created_at: string;
  updated_at: string;
  game: {
    id: number;
    slug: string;
    name: string;
    background_image: string | null;
    metacritic: number | null;
    released: string | null;
  };
}

export interface LibraryStats {
  backlog: number;
  playing: number;
  completed: number;
  wishlist: number;
  total: number;
}

export function useRecentGames() {
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/games/library/recent")
      .then((r) => r.json())
      .then((d) => {
        setGames(d.games ?? []);
        setLoading(false);
      });
  }, []);

  return { games, loading };
}

export function useFavouriteGames() {
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/games/library/favourites")
      .then((r) => r.json())
      .then((d) => {
        setGames(d.games ?? []);
        setLoading(false);
      });
  }, []);

  return { games, loading };
}

export function useLibrary(status?: string) {
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = status ? `/api/games/library?status=${status}` : "/api/games/library";
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setGames(d.games ?? []);
        setLoading(false);
      });
  }, [status]);

  return { games, loading };
}

export function useLibraryStats() {
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/games/library/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      });
  }, []);

  return { stats, loading };
}
