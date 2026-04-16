import { ENDPOINTS } from "./config";

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface User {
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
}

export interface ApiResponse<T> {
  user?: T;
  error?: string;
}

async function fetchCSRF(): Promise<string> {
  const res = await fetch(ENDPOINTS.CSRF, { credentials: "include" });
  const data = (await res.json()) as { csrfToken: string };
  return data.csrfToken;
}

async function apiPost<T>(url: string, body: object): Promise<ApiResponse<T>> {
  const csrfToken = await fetchCSRF();
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<ApiResponse<T>>;
}

export const register = (data: RegisterData) => apiPost<User>(ENDPOINTS.REGISTER, data);
export const login = (data: LoginData) => apiPost<User>(ENDPOINTS.LOGIN, data);
export const logout = () => apiPost<null>(ENDPOINTS.LOGOUT, {});
export const getMe = async (): Promise<ApiResponse<User>> => {
  const res = await fetch(ENDPOINTS.ME, { credentials: "include" });
  return res.json() as Promise<ApiResponse<User>>;
};

export async function searchGames(query: string) {
  const res = await fetch(`/api/games?q=${encodeURIComponent(query)}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getGameDetails(slug: string) {
  if (!slug) return null;
  const res = await fetch(`/api/games/${slug}`);
  if (!res.ok) return null;
  return res.json();
}

export async function addToLibrary(
  gameId: number,
  status: string,
  rating?: number,
  gameMeta?: { game_name?: string; game_slug?: string; game_image?: string; game_metacritic?: number | null },
) {
  const res = await fetch("/api/games/library", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game_id: gameId, status, rating, ...gameMeta }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function removeFromLibrary(userGameId: number) {
  const res = await fetch(`/api/games/library/${userGameId}`, { method: "DELETE" });
  if (!res.ok) return null;
  return res.json();
}

export async function updateLibraryEntry(userGameId: number, data: Record<string, unknown>) {
  const res = await fetch(`/api/games/library/${userGameId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  return res.json();
}