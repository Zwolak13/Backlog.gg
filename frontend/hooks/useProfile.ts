"use client";

import { useEffect, useState } from "react";

export interface Profile {
  id: number;
  username: string;
  email: string;
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

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/user/me", { method: "GET" });
        const data = await readJson<ProfilePayload>(res, { error: "Unable to load profile" });
        setProfile(res.ok ? normalizeProfile(data) : null);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { profile, loading };
}
