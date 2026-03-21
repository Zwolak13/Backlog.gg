"use client";

import { useEffect, useState } from "react";

export interface Profile {
  username: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/user/me", { method: "GET" });
      const data = await res.json();
      setProfile(data);
      setLoading(false);
    };

    load();
  }, []);

  return { profile, loading };
}
