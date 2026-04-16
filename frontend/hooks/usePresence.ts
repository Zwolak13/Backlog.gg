"use client";

import { useEffect, useRef, useState } from "react";

export function usePresence(): Set<string> {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/presence/");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.online) {
        setOnlineUsers(new Set(data.online));
      }
    };

    ws.onclose = () => {
      setOnlineUsers(new Set());
    };

    return () => {
      ws.close();
    };
  }, []);

  return onlineUsers;
}
