"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthSession } from "../lib/auth";
import type { ChatMessage } from "../../src/shared/types/chat";

export function useChat(
  session: AuthSession | null,
  roomId: string,
  snapshotLimit: number,
  onNewMessage?: (msg: ChatMessage) => void,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const latestIdRef = useRef<string | undefined>(undefined);

  const upsertMessages = useCallback((incoming: ChatMessage[]) => {
    setMessages((prev) => {
      if (!incoming.length) return prev;
      const seen = new Set(prev.map((m) => m.id));
      const next = [...prev];
      for (const m of incoming) {
        if (seen.has(m.id)) continue;
        seen.add(m.id);
        next.push(m);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!session) {
      setConnected(false);
      return;
    }

    setMessages([]);
    latestIdRef.current = undefined;

    const syncMessages = async () => {
      const qs = new URLSearchParams();
      latestIdRef.current
        ? qs.set("sinceId", latestIdRef.current)
        : qs.set("limit", String(snapshotLimit));
      const r = await fetch(`/api/chat/messages?${qs}`);
      const d = await r.json();
      const incoming = (d.messages ?? []) as ChatMessage[];
      if (incoming.length) latestIdRef.current = incoming[incoming.length - 1].id;
      upsertMessages(incoming);
      incoming.forEach((m) => onNewMessage?.(m));
    };

    syncMessages().catch(() => {});

    const es = new EventSource("/api/chat/stream");
    es.addEventListener("ready", () => {
      setConnected(true);
      syncMessages().catch(() => {});
    });
    es.addEventListener("message", (e) => {
      const m = JSON.parse((e as MessageEvent).data) as ChatMessage;
      latestIdRef.current = m.id;
      upsertMessages([m]);
      onNewMessage?.(m);
    });
    es.onerror = () => setConnected(false);

    return () => es.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, snapshotLimit, upsertMessages]);

  return { messages, connected, setMessages };
}
