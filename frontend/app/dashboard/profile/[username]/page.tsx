"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PublicProfile {
  username: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export default function FriendProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/user/profile/${username}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((d) => { if (d) setProfile(d); });
  }, [username]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white gap-4">
        <p className="text-white/50">User not found.</p>
        <Link href="/dashboard/profile" className="text-[var(--backlog-purple)] hover:underline text-sm">
          Go back
        </Link>
      </div>
    );
  }

  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen text-white/40 text-sm">Loading…</div>;
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" });

  return (
    <div className="min-h-screen text-white">
      <div
        className="relative w-full h-48 md:h-56 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #120d2e 0%, #2a1660 35%, #1a0d3e 65%, #0e0b24 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(135,86,241,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(135,86,241,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgb(18,19,24)]" />

        <Link
          href="/dashboard/profile"
          className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-black/50 hover:bg-black/70 border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-all backdrop-blur-sm"
        >
          <ArrowLeft size={14} />
          Back
        </Link>
      </div>

      <div className="relative px-6 md:px-10 -mt-14 flex flex-col sm:flex-row items-start gap-5 z-10">
        <img
          src={profile.avatar_url ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username}`}
          alt="avatar"
          className="w-28 h-28 rounded object-cover shrink-0 border-4 border-[rgb(18,19,24)] shadow-[0_4px_24px_rgba(0,0,0,0.7)] bg-[rgb(30,32,42)]"
        />
        <div className="pt-14 sm:pt-16 flex flex-col gap-1.5">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{profile.username}</h1>
          <p className="text-white/55 text-sm max-w-lg leading-relaxed">{profile.bio || "No bio yet."}</p>
          <p className="text-white/30 text-xs mt-0.5">Member since {joinDate}</p>
        </div>
      </div>
    </div>
  );
}
