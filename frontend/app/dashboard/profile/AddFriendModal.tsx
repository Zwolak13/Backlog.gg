"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, UserPlus, Check, UserCheck, Clock, Users } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";

interface UserResult {
  username: string;
  avatar_url: string | null;
  bio: string | null;
  relation: "friend" | "request_sent" | "request_received" | "none";
}

interface FriendReq {
  id: number;
  from_user?: { username: string; avatar_url: string | null; bio: string | null };
  to_user?: { username: string; avatar_url: string | null; bio: string | null };
  created_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onFriendsChanged: () => void;
}

export default function AddFriendModal({ open, onClose, onFriendsChanged }: Props) {
  const [tab, setTab] = useState<"search" | "requests">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [requests, setRequests] = useState<{ incoming: FriendReq[]; outgoing: FriendReq[] }>({ incoming: [], outgoing: [] });
  const [pendingActions, setPendingActions] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      loadRequests();
    } else {
      setQuery("");
      setResults([]);
      setTab("search");
    }
  }, [open]);

  const loadRequests = async () => {
    const r = await fetch("/api/user/friends/requests");
    if (r.ok) {
      const d = await r.json();
      setRequests(d);
    }
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); setSearching(false); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/user/search?q=${encodeURIComponent(query)}`);
        if (r.ok) {
          const d = await r.json();
          setResults(d.users ?? []);
        }
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const sendRequest = async (username: string) => {
    setPendingActions(p => ({ ...p, [username]: true }));
    const r = await fetch("/api/user/friends/request/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const d = await r.json();
    if (d.error) {
      toastError(d.error);
    } else {
      toastSuccess(`Friend request sent to ${username}`);
      setResults(prev => prev.map(u => u.username === username ? { ...u, relation: "request_sent" as const } : u));
    }
    setPendingActions(p => ({ ...p, [username]: false }));
  };

  const acceptRequest = async (id: number, fromUsername: string) => {
    setPendingActions(p => ({ ...p, [`req_${id}`]: true }));
    const r = await fetch(`/api/user/friends/requests/${id}/accept`, { method: "POST" });
    if (r.ok) {
      toastSuccess(`Now friends with ${fromUsername}`);
      setRequests(prev => ({ ...prev, incoming: prev.incoming.filter(x => x.id !== id) }));
      onFriendsChanged();
    } else {
      toastError("Failed to accept request");
    }
    setPendingActions(p => ({ ...p, [`req_${id}`]: false }));
  };

  const declineRequest = async (id: number) => {
    setPendingActions(p => ({ ...p, [`dec_${id}`]: true }));
    const r = await fetch(`/api/user/friends/requests/${id}/decline`, { method: "POST" });
    if (r.ok) {
      setRequests(prev => ({ ...prev, incoming: prev.incoming.filter(x => x.id !== id) }));
    } else {
      toastError("Failed to decline request");
    }
    setPendingActions(p => ({ ...p, [`dec_${id}`]: false }));
  };

  if (!open) return null;

  const pendingCount = requests.incoming.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "rgb(13,14,22)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(135,86,241,0.1)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 pt-5 pb-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(135,86,241,0.15)", border: "1px solid rgba(135,86,241,0.2)" }}
            >
              <Users size={15} style={{ color: "var(--backlog-purple)" }} />
            </div>
            <span className="font-bold text-white/90" style={{ fontFamily: "var(--font-syne)" }}>Friends</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {(["search", "requests"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-3 text-sm font-semibold transition-all relative"
              style={{ color: tab === t ? "var(--backlog-purple)" : "rgba(255,255,255,0.35)" }}
            >
              {t === "requests" && pendingCount > 0 && (
                <span
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold mr-1.5"
                  style={{ background: "rgba(135,86,241,0.8)", color: "white" }}
                >
                  {pendingCount}
                </span>
              )}
              {t === "search" ? "Find Friends" : "Requests"}
              {tab === t && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: "var(--backlog-purple)" }}
                />
              )}
            </button>
          ))}
        </div>

        <div style={{ minHeight: 320 }}>
          {tab === "search" && (
            <div className="p-4">
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by username..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/25 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(135,86,241,0.5)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>

              {searching && (
                <div className="flex items-center justify-center py-10 gap-2 text-white/30 text-sm">
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/50 animate-spin" />
                  Searching...
                </div>
              )}

              {!searching && query.length >= 2 && results.length === 0 && (
                <div className="flex flex-col items-center py-10 gap-2">
                  <p className="text-white/30 text-sm">No users found.</p>
                </div>
              )}

              {!searching && results.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {results.map((u) => (
                    <div
                      key={u.username}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <img
                        src={u.avatar_url ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`}
                        className="w-9 h-9 rounded-xl object-cover flex-none"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                        alt={u.username}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white/85 text-sm font-medium truncate">{u.username}</p>
                        {u.bio && <p className="text-white/30 text-xs truncate">{u.bio}</p>}
                      </div>
                      <RelationButton
                        relation={u.relation}
                        username={u.username}
                        onSend={sendRequest}
                        pending={!!pendingActions[u.username]}
                      />
                    </div>
                  ))}
                </div>
              )}

              {!searching && query.length < 2 && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(135,86,241,0.07)", border: "1px solid rgba(135,86,241,0.12)" }}
                  >
                    <Search size={24} style={{ color: "rgba(135,86,241,0.4)" }} />
                  </div>
                  <p className="text-white/30 text-sm">Type 2+ characters to search</p>
                </div>
              )}
            </div>
          )}

          {tab === "requests" && (
            <div className="p-4">
              {requests.incoming.length === 0 && requests.outgoing.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(135,86,241,0.07)", border: "1px solid rgba(135,86,241,0.12)" }}
                  >
                    <UserPlus size={24} style={{ color: "rgba(135,86,241,0.4)" }} />
                  </div>
                  <p className="text-white/30 text-sm">No pending requests</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {requests.incoming.length > 0 && (
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2.5 px-1">Incoming</p>
                      <div className="flex flex-col gap-1.5">
                        {requests.incoming.map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <img
                              src={r.from_user?.avatar_url ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${r.from_user?.username}`}
                              className="w-9 h-9 rounded-xl object-cover flex-none"
                              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                              alt={r.from_user?.username}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-white/85 text-sm font-medium truncate">{r.from_user?.username}</p>
                              <p className="text-white/25 text-xs">wants to be friends</p>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => acceptRequest(r.id, r.from_user?.username ?? "")}
                                disabled={!!pendingActions[`req_${r.id}`]}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                                style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "rgba(52,211,153,0.22)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "rgba(52,211,153,0.12)")}
                              >
                                <Check size={13} />
                              </button>
                              <button
                                onClick={() => declineRequest(r.id)}
                                disabled={!!pendingActions[`dec_${r.id}`]}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,80,80,0.1)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                              >
                                <X size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {requests.outgoing.length > 0 && (
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2.5 px-1">Sent</p>
                      <div className="flex flex-col gap-1.5">
                        {requests.outgoing.map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <img
                              src={r.to_user?.avatar_url ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${r.to_user?.username}`}
                              className="w-9 h-9 rounded-xl object-cover flex-none"
                              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                              alt={r.to_user?.username}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-white/85 text-sm font-medium truncate">{r.to_user?.username}</p>
                              <p className="text-white/25 text-xs">request pending</p>
                            </div>
                            <Clock size={13} style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RelationButton({
  relation, username, onSend, pending,
}: {
  relation: UserResult["relation"];
  username: string;
  onSend: (u: string) => void;
  pending: boolean;
}) {
  if (relation === "friend") {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex-none"
        style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}
      >
        <UserCheck size={11} />
        Friends
      </div>
    );
  }
  if (relation === "request_sent") {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex-none"
        style={{ background: "rgba(135,86,241,0.1)", color: "rgba(167,139,250,0.8)", border: "1px solid rgba(135,86,241,0.2)" }}
      >
        <Clock size={11} />
        Sent
      </div>
    );
  }
  if (relation === "request_received") {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex-none"
        style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}
      >
        <Clock size={11} />
        Incoming
      </div>
    );
  }
  return (
    <button
      onClick={() => onSend(username)}
      disabled={pending}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 flex-none"
      style={{ background: "rgba(135,86,241,0.15)", color: "rgba(192,168,255,0.9)", border: "1px solid rgba(135,86,241,0.3)" }}
      onMouseEnter={e => { if (!pending) (e.currentTarget as HTMLElement).style.background = "rgba(135,86,241,0.25)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(135,86,241,0.15)"; }}
    >
      {pending
        ? <div className="w-3 h-3 rounded-full border border-purple-400/30 border-t-purple-400 animate-spin" />
        : <UserPlus size={11} />}
      Add
    </button>
  );
}
