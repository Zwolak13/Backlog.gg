"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Bot, ExternalLink, Gamepad2, Menu, Plus, Send, Sparkles, Trash2, X } from "lucide-react";

interface ChatGame {
  name: string;
  reason: string;
  steam_appid: number;
  background_image: string | null;
  slug: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  games?: ChatGame[];
}

interface ChatSession {
  id: number;
  title: string;
  updated_at: string;
  last_message: string | null;
}

const SUGGESTIONS = [
  "What should I play next?",
  "Recommend a hidden gem on Steam",
  "Best co-op games for me",
  "Underrated RPGs I'd enjoy",
];

function ChatGameCard({ game }: { game: ChatGame }) {
  const card = (
    <div
      className="relative overflow-hidden rounded-xl flex transition-all duration-200"
      style={{ background: "rgb(13,14,22)", border: "1px solid rgba(255,255,255,0.07)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(135,86,241,0.28)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
    >
      <div className="relative w-[72px] shrink-0 self-stretch min-h-[88px]">
        {game.background_image ? (
          <Image src={game.background_image} alt={game.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgb(20,22,34)" }}>
            <Gamepad2 size={18} className="text-white/15" />
          </div>
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 45%, rgb(13,14,22) 100%)" }} />
      </div>
      <div className="flex-1 p-3 min-w-0">
        <p className="text-white font-bold text-[13px] leading-snug truncate">{game.name}</p>
        <p className="text-white/45 text-[11px] mt-1 leading-relaxed line-clamp-2">{game.reason}</p>
        <div
          className="mt-2 flex items-center gap-1"
          style={{ color: "var(--backlog-purple)", filter: "drop-shadow(0 0 4px var(--backlog-purple))" }}
        >
          <span className="text-[11px] font-semibold">Open in app</span>
          <ExternalLink size={10} />
        </div>
      </div>
    </div>
  );

  if (game.steam_appid > 0) {
    return (
      <a href={`/dashboard/games/${game.steam_appid}`} target="_blank" rel="noopener noreferrer" className="block mt-2">
        {card}
      </a>
    );
  }
  return <div className="mt-2">{card}</div>;
}

export default function AIChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/games/recommendations/sessions/")
      .then((r) => r.json())
      .then((d: { sessions?: ChatSession[] }) => setSessions(d.sessions ?? []));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    return () => { if (typingRef.current) clearInterval(typingRef.current); };
  }, []);

  const loadSession = async (id: number) => {
    setActiveSessionId(id);
    setMessages([]);
    const res = await fetch(`/api/games/recommendations/sessions/${id}/`);
    const data = (await res.json()) as { messages?: Message[] };
    setMessages(data.messages ?? []);
  };

  const newChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
  };

  const deleteSession = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/games/recommendations/sessions/${id}/`, { method: "DELETE" });
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) newChat();
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (typingRef.current) clearInterval(typingRef.current);

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await fetch("/api/games/recommendations/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: activeSessionId }),
      });
      const data = (await res.json()) as {
        reply?: string;
        games?: ChatGame[];
        session_id?: number;
        title?: string;
        error?: string;
      };
      if (data.error) throw new Error(data.error);

      const fullReply = data.reply ?? "";
      const pendingGames = data.games ?? [];

      if (data.session_id) {
        const sid = data.session_id;
        const title = data.title ?? "New Chat";
        setActiveSessionId(sid);
        setSessions((prev) => {
          const exists = prev.find((s) => s.id === sid);
          if (exists) {
            return [
              { ...exists, title, updated_at: new Date().toISOString() },
              ...prev.filter((s) => s.id !== sid),
            ];
          }
          return [
            { id: sid, title, updated_at: new Date().toISOString(), last_message: text.slice(0, 80) },
            ...prev,
          ];
        });
      }

      setLoading(false);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let i = 0;
      typingRef.current = setInterval(() => {
        i += 3;
        const chunk = fullReply.slice(0, i);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: chunk };
          return updated;
        });
        if (i >= fullReply.length) {
          clearInterval(typingRef.current!);
          typingRef.current = null;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: fullReply,
              games: pendingGames.length > 0 ? pendingGames : undefined,
            };
            return updated;
          });
        }
      }, 16);
    } catch {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const fillSuggestion = (text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const isNewChat = activeSessionId === null && messages.length === 0;

  return (
    <div className="-m-6 md:m-0 flex h-screen text-white overflow-hidden" style={{ background: "rgb(18,19,24)" }}>
      <aside
        className="relative w-64 shrink-0 border-r border-white/10 backdrop-blur-2xl hidden md:flex flex-col"
        style={{ background: "rgba(20,20,35,0.55)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--backlog-purple)]/20 to-transparent pointer-events-none z-0" />

        <div className="relative z-10 p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5 mb-3">
            <span
              className="flex items-center justify-center w-6 h-6 rounded-md shrink-0"
              style={{ background: "rgba(135,86,241,0.15)", color: "var(--backlog-purple)", filter: "drop-shadow(0 0 6px var(--backlog-purple))" }}
            >
              <Sparkles size={12} />
            </span>
            <h2
              className="text-xs font-bold text-white uppercase tracking-wider"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              AI Advisor
            </h2>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.1), transparent)" }} />
          </div>

          <button
            onClick={newChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/10"
            style={{ color: "var(--backlog-purple)", border: "1px solid rgba(135,86,241,0.2)", background: "rgba(135,86,241,0.08)" }}
          >
            <Plus size={13} style={{ filter: "drop-shadow(0 0 4px var(--backlog-purple))" }} />
            New Chat
          </button>
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto p-2 space-y-0.5">
          {sessions.length === 0 && (
            <p className="text-[11px] text-white/20 text-center mt-6 px-3">No sessions yet</p>
          )}
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => loadSession(session.id)}
              className="group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-white/10"
              style={
                activeSessionId === session.id
                  ? { background: "rgba(135,86,241,0.12)", border: "1px solid rgba(135,86,241,0.2)" }
                  : { border: "1px solid transparent" }
              }
            >
              <span className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: activeSessionId === session.id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}
                >
                  {session.title}
                </p>
              </span>
              <button
                onClick={(e) => deleteSession(session.id, e)}
                className="opacity-0 group-hover:opacity-100 shrink-0 transition-opacity"
                style={{ color: "rgba(255,255,255,0.25)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(248,113,113,0.85)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(135,86,241,0.07) 0%, transparent 70%)", filter: "blur(48px)" }}
          />
        </div>

        <header className="relative z-10 shrink-0 px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ background: "rgba(135,86,241,0.1)", color: "var(--backlog-purple)", border: "1px solid rgba(135,86,241,0.15)" }}
            >
              <Menu size={14} />
            </button>
            <span
              className="flex items-center justify-center w-6 h-6 rounded-md shrink-0"
              style={{ background: "rgba(135,86,241,0.15)", color: "var(--backlog-purple)", filter: "drop-shadow(0 0 6px var(--backlog-purple))" }}
            >
              <Sparkles size={12} />
            </span>
            <h1
              className="text-sm font-bold text-white uppercase tracking-wider"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              GameMatch AI
            </h1>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.1), transparent)" }} />
            <span className="text-xs shrink-0" style={{ color: "rgba(255,255,255,0.22)" }}>
              Personalised picks
            </span>
          </div>
        </header>

        <div className="relative z-10 flex-1 overflow-y-auto">
          {isNewChat ? (
            <div className="h-full flex flex-col items-center justify-center px-6 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "rgba(135,86,241,0.12)", color: "var(--backlog-purple)", filter: "drop-shadow(0 0 20px rgba(135,86,241,0.25))", border: "1px solid rgba(135,86,241,0.18)" }}
              >
                <Sparkles size={24} />
              </div>
              <h2
                className="text-xl font-bold text-white/80 mb-2"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                What should you play next?
              </h2>
              <p className="text-sm max-w-sm mb-8" style={{ color: "rgba(255,255,255,0.28)" }}>
                Ask me anything about games. I know your library and I'll find your next obsession.
              </p>
              <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => fillSuggestion(s)}
                    className="text-left px-3.5 py-3 rounded-xl text-xs leading-snug transition-all duration-150"
                    style={{ background: "rgb(13,14,22)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(135,86,241,0.08)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(135,86,241,0.22)";
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.78)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgb(13,14,22)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)";
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto px-6 py-6 space-y-4 pb-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mb-0.5"
                      style={{ background: "rgba(135,86,241,0.15)", color: "var(--backlog-purple)", filter: "drop-shadow(0 0 6px rgba(135,86,241,0.4))" }}
                    >
                      <Bot size={14} />
                    </div>
                  )}
                  <div className={`flex flex-col ${msg.role === "user" ? "items-end max-w-[78%]" : "items-start max-w-[78%]"}`}>
                    <div
                      className="rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap w-full"
                      style={
                        msg.role === "user"
                          ? { background: "rgba(135,86,241,0.18)", border: "1px solid rgba(135,86,241,0.25)", color: "rgba(255,255,255,0.9)", borderBottomRightRadius: 4 }
                          : { background: "rgb(13,14,22)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.82)", borderBottomLeftRadius: 4 }
                      }
                    >
                      {msg.content}
                    </div>
                    {msg.role === "assistant" && msg.games && msg.games.length > 0 && (
                      <div className="w-full space-y-0 mt-1">
                        {msg.games.map((game) => (
                          <ChatGameCard key={game.name} game={game} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-end gap-2.5 justify-start">
                  <div
                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(135,86,241,0.15)", color: "var(--backlog-purple)", filter: "drop-shadow(0 0 6px rgba(135,86,241,0.4))" }}
                  >
                    <Bot size={14} />
                  </div>
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{ background: "rgb(13,14,22)", border: "1px solid rgba(255,255,255,0.07)", borderBottomLeftRadius: 4 }}
                  >
                    <div className="flex gap-1.5 items-center h-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="relative z-10 shrink-0 px-6 pb-6 pt-3">
          <div className="max-w-2xl mx-auto">
            <div
              className="flex gap-3 items-end rounded-xl p-3"
              style={{ background: "rgb(13,14,22)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={isNewChat ? "What kind of game are you looking for?" : "Ask a follow-up..."}
                rows={1}
                className="flex-1 bg-transparent resize-none text-sm outline-none leading-relaxed placeholder:text-white/25"
                style={{ color: "rgba(255,255,255,0.9)" }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl transition-all disabled:opacity-30"
                style={{ background: "rgba(135,86,241,0.2)", color: "var(--backlog-purple)", border: "1px solid rgba(135,86,241,0.2)", filter: "drop-shadow(0 0 6px var(--backlog-purple))" }}
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-center text-xs mt-2" style={{ color: "rgba(255,255,255,0.12)" }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden flex"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            className="relative w-72 h-full border-r border-white/10 flex flex-col"
            style={{ background: "rgba(15,15,28,0.98)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--backlog-purple)]/20 to-transparent pointer-events-none" />

            <div className="relative z-10 p-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-md shrink-0"
                  style={{ background: "rgba(135,86,241,0.15)", color: "var(--backlog-purple)", filter: "drop-shadow(0 0 6px var(--backlog-purple))" }}
                >
                  <Sparkles size={12} />
                </span>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: "var(--font-syne)" }}>
                  Sessions
                </h2>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.06)" }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="relative z-10 p-3">
              <button
                onClick={() => { newChat(); setMobileSidebarOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/10"
                style={{ color: "var(--backlog-purple)", border: "1px solid rgba(135,86,241,0.2)", background: "rgba(135,86,241,0.08)" }}
              >
                <Plus size={13} style={{ filter: "drop-shadow(0 0 4px var(--backlog-purple))" }} />
                New Chat
              </button>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto p-2 space-y-0.5">
              {sessions.length === 0 && (
                <p className="text-[11px] text-white/20 text-center mt-6 px-3">No sessions yet</p>
              )}
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => { loadSession(session.id); setMobileSidebarOpen(false); }}
                  className="group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-white/10"
                  style={
                    activeSessionId === session.id
                      ? { background: "rgba(135,86,241,0.12)", border: "1px solid rgba(135,86,241,0.2)" }
                      : { border: "1px solid transparent" }
                  }
                >
                  <span className="flex-1 min-w-0">
                    <p
                      className="text-xs font-medium truncate"
                      style={{ color: activeSessionId === session.id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}
                    >
                      {session.title}
                    </p>
                  </span>
                  <button
                    onClick={(e) => deleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 shrink-0 transition-opacity"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(248,113,113,0.85)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
