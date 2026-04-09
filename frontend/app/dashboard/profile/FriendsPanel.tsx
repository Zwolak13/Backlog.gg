"use client";

import { Users, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Friend {
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

export default function FriendsPanel() {
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    fetch("/api/user/friends")
      .then((r) => r.json())
      .then((d) => setFriends(d.friends ?? []));
  }, []);

  return (
    <div className="rounded-xl border border-white/10 bg-[rgba(20,22,35,0.6)] backdrop-blur-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-white/80 font-semibold text-sm">
          <Users size={15} />
          Friends
          <span className="text-white/30 font-normal">({friends.length})</span>
        </div>
        <button className="text-white/40 hover:text-[var(--backlog-purple)] transition-colors">
          <UserPlus size={15} />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-1 min-h-[80px]">
        {friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
            <Users size={28} className="text-white/15" />
            <p className="text-white/30 text-xs">No friends yet.</p>
            <p className="text-white/20 text-xs">Add people to see them here.</p>
          </div>
        ) : (
          friends.map((f) => (
            <Link
              key={f.username}
              href={`/dashboard/profile/${f.username}`}
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <img
                src={f.avatar_url ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${f.username}`}
                className="w-8 h-8 rounded object-cover bg-white/10 shrink-0"
                alt={f.username}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-white/80 text-sm font-medium truncate">{f.username}</span>
                {f.bio && (
                  <span className="text-white/30 text-xs truncate">{f.bio}</span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
