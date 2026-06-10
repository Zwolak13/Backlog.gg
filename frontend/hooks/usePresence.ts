"use client";

import { useEffect, useRef, useState } from "react";
import { WS_BACKEND_URL } from "@/lib/config";

export function usePresence(): Set<string> {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${WS_BACKEND_URL}/ws/presence/`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.online) {
          setOnlineUsers(new Set(data.online));
        }
      } catch {
        // ignore malformed presence frames
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
