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

async function readJson<T>(response: Response, fallback: T): Promise<T> {
  const text = await response.text();
  if (!text) return fallback;

  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

function publicLibraryPath(username: string, suffix = "") {
  const encodedUsername = encodeURIComponent(username);
  return `/api/games/library/public/${encodedUsername}${suffix}`;
}

export function useRecentGames(username?: string) {
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = username
      ? publicLibraryPath(username, "/recent")
      : "/api/games/library/recent";

    fetch(url)
      .then((r) => readJson<{ games?: LibraryGame[] }>(r, { games: [] }))
      .then((d) => {
        setGames(d.games ?? []);
        setLoading(false);
      })
      .catch(() => {
        setGames([]);
        setLoading(false);
      });
  }, [username]);

  return { games, loading };
}

export function useFavouriteGames(username?: string) {
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = username
      ? publicLibraryPath(username, "/favourites")
      : "/api/games/library/favourites";

    fetch(url)
      .then((r) => readJson<{ games?: LibraryGame[] }>(r, { games: [] }))
      .then((d) => {
        setGames(d.games ?? []);
        setLoading(false);
      })
      .catch(() => {
        setGames([]);
        setLoading(false);
      });
  }, [username]);

  return { games, loading };
}

export function useLibrary(status?: string, username?: string) {
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const baseUrl = username
      ? publicLibraryPath(username)
      : "/api/games/library";
    const url = status ? `${baseUrl}?status=${encodeURIComponent(status)}` : baseUrl;

    fetch(url)
      .then((r) => readJson<{ games?: LibraryGame[] }>(r, { games: [] }))
      .then((d) => {
        setGames(d.games ?? []);
        setLoading(false);
      })
      .catch(() => {
        setGames([]);
        setLoading(false);
      });
  }, [status, username]);

  return { games, loading };
}

export function useLibraryStats(username?: string) {
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = username
      ? publicLibraryPath(username, "/stats")
      : "/api/games/library/stats";

    fetch(url)
      .then((r) => readJson<LibraryStats | null>(r, null))
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch(() => {
        setStats(null);
        setLoading(false);
      });
  }, [username]);

  return { stats, loading };
}
