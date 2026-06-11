"use client";

import { useEffect, useState } from "react";

export interface Profile {
  id: number;
  username: string;
  email?: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

type ProfilePayload = Profile | { user?: Profile; error?: string };

async function readJson<T>(response: Response, fallback: T): Promise<T> {
  const text = await response.text();
  if (!text) return fallback;

  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

function normalizeProfile(data: ProfilePayload): Profile | null {
  if ("user" in data && data.user) return data.user;
  if ("error" in data && data.error) return null;
  return data as Profile;
}

export function useProfile(username?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const url = username
          ? `/api/user/profile/${encodeURIComponent(username)}`
          : "/api/user/me";
        const res = await fetch(url, { method: "GET" });
        const data = await readJson<ProfilePayload>(res, { error: "Unable to load profile" });
        if (res.ok) {
          setProfile(normalizeProfile(data));
        } else {
          setProfile(null);
          setNotFound(res.status === 404);
        }
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [username]);

  return { profile, loading, notFound };
}
