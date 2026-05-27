"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Plus, Send, Sparkles, Trash2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: number;
  title: string;
  updated_at: string;
  last_message: string | null;
}

export default function AIChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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
        session_id?: number;
        title?: string;
        error?: string;
      };
      if (data.error) throw new Error(data.error);

      const fullReply = data.reply ?? "";

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
            updated[updated.length - 1] = { role: "assistant", content: fullReply };
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

  const isNewChat = activeSessionId === null && messages.length === 0;

  return (
    <div className="h-screen flex text-white" style={{ background: "rgb(10,11,17)" }}>
      {/* Sessions sidebar */}
      <aside
        className="w-60 shrink-0 flex flex-col border-r hidden md:flex"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgb(13,14,22)" }}
      >
        <div className="p-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <button
            onClick={newChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: "rgba(135,86,241,0.12)",
              color: "var(--backlog-purple)",
              border: "1px solid rgba(135,86,241,0.2)",
            }}
          >
            <Plus size={14} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
          {sessions.length === 0 && (
            <p className="text-xs text-white/20 text-center mt-6 px-3">No chats yet</p>
          )}
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => loadSession(session.id)}
              className="w-full group flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer"
              style={
                activeSessionId === session.id
                  ? { background: "rgba(135,86,241,0.12)", border: "1px solid rgba(135,86,241,0.18)" }
                  : { background: "transparent", border: "1px solid transparent" }
              }
            >
              <span className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: activeSessionId === session.id ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)" }}>
                  {session.title}
                </p>
              </span>
              <button
                onClick={(e) => deleteSession(session.id, e)}
                className="opacity-0 group-hover:opacity-100 shrink-0 transition-opacity"
                style={{ color: "rgba(255,255,255,0.25)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(248,113,113,0.9)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="fixed inset-0 pointer-events-none">
          <div
            className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(135,86,241,0.08) 0%, transparent 64%)",
              filter: "blur(36px)",
            }}
          />
        </div>

        <header
          className="relative z-10 shrink-0 px-6 py-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ background: "rgba(135,86,241,0.15)", color: "var(--backlog-purple)" }}
            >
              <Sparkles size={16} />
            </span>
            <div>
              <h1 className="text-base font-bold tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>
                GameMatch AI
              </h1>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                Recommendations based on your library
              </p>
            </div>
          </div>
        </header>

        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6">
          {isNewChat ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "rgba(135,86,241,0.12)", color: "var(--backlog-purple)" }}
              >
                <Sparkles size={24} />
              </div>
              <h2
                className="text-xl font-bold text-white/80 mb-2"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                What should you play next?
              </h2>
              <p className="text-sm max-w-sm" style={{ color: "rgba(255,255,255,0.28)" }}>
                Ask me anything about games. I can see your library and give personalised picks.
              </p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4 pb-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mb-0.5"
                      style={{ background: "rgba(135,86,241,0.15)", color: "var(--backlog-purple)" }}
                    >
                      <Bot size={14} />
                    </div>
                  )}
                  <div
                    className="max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                    style={
                      msg.role === "user"
                        ? {
                            background: "rgba(135,86,241,0.22)",
                            border: "1px solid rgba(135,86,241,0.28)",
                            color: "rgba(255,255,255,0.9)",
                            borderBottomRightRadius: 4,
                          }
                        : {
                            background: "rgb(20,22,34)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            color: "rgba(255,255,255,0.82)",
                            borderBottomLeftRadius: 4,
                          }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-end gap-2 justify-start">
                  <div
                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(135,86,241,0.15)", color: "var(--backlog-purple)" }}
                  >
                    <Bot size={14} />
                  </div>
                  <div
                    className="rounded-2xl px-4 py-3"
                    style={{
                      background: "rgb(20,22,34)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderBottomLeftRadius: 4,
                    }}
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
              className="flex gap-3 items-end rounded-2xl p-3"
              style={{ background: "rgb(20,22,34)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={isNewChat ? "What kind of game are you looking for?" : "Ask a follow-up..."}
                rows={1}
                className="flex-1 bg-transparent resize-none text-sm outline-none leading-relaxed"
                style={{ color: "rgba(255,255,255,0.9)" }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl transition-colors disabled:opacity-30"
                style={{ background: "rgba(135,86,241,0.25)", color: "var(--backlog-purple)" }}
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-center text-xs mt-2" style={{ color: "rgba(255,255,255,0.14)" }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
