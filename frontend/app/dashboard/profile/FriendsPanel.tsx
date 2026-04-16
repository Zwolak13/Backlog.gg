"use client";

import { Users, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import AddFriendModal from "./AddFriendModal";
import { usePresence } from "@/hooks/usePresence";

interface Friend {
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

export default function FriendsPanel() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const onlineUsers = usePresence();

  const loadFriends = () => {
    fetch("/api/user/friends")
      .then((r) => r.json())
      .then((d) => setFriends(d.friends ?? []));
  };

  useEffect(() => {
    loadFriends();
  }, []);

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgb(14,15,24)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(135,86,241,0.15)", border: "1px solid rgba(135,86,241,0.2)" }}
            >
              <Users size={13} style={{ color: "var(--backlog-purple)" }} />
            </div>
            <span className="text-sm font-bold text-white/80" style={{ fontFamily: "var(--font-syne)" }}>
              Friends
            </span>
            {friends.length > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: "rgba(135,86,241,0.18)", color: "rgba(192,168,255,0.95)", border: "1px solid rgba(135,86,241,0.25)" }}
              >
                {friends.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:brightness-125"
            style={{ background: "rgba(135,86,241,0.12)", border: "1px solid rgba(135,86,241,0.22)", color: "rgba(167,139,250,0.8)" }}
            title="Add friend"
          >
            <UserPlus size={13} />
          </button>
        </div>

        <div className="p-3">
          {friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2.5 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
                style={{ background: "rgba(135,86,241,0.07)", border: "1px solid rgba(135,86,241,0.12)" }}
              >
                <Users size={22} style={{ color: "rgba(135,86,241,0.4)" }} />
              </div>
              <p className="text-white/40 text-sm font-semibold">No friends yet</p>
              <p className="text-white/20 text-xs">Add people to see them here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {friends.map((f) => (
                <Link
                  key={f.username}
                  href={`/dashboard/profile/${f.username}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                  style={{ color: "inherit" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(135,86,241,0.07)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="relative shrink-0">
                    <img
                      src={f.avatar_url ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${f.username}`}
                      className="w-9 h-9 rounded-xl object-cover"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                      alt={f.username}
                    />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                      style={{
                        background: onlineUsers.has(f.username) ? "#34d399" : "rgba(255,255,255,0.15)",
                        border: "2px solid rgb(14,15,24)",
                        boxShadow: onlineUsers.has(f.username) ? "0 0 5px #34d399" : "none",
                      }}
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-white/85 text-sm font-medium truncate">{f.username}</span>
                    {f.bio && <span className="text-white/28 text-xs truncate">{f.bio}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddFriendModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onFriendsChanged={loadFriends}
      />
    </>
  );
}
