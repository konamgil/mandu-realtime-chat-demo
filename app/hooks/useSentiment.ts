"use client";

import { useCallback, useRef, useState } from "react";
import { SentimentResultSchema } from "../../src/shared/types/chat";
import type { ChatMessage, SentimentResult } from "../../src/shared/types/chat";

export function useSentiment() {
  const [sentiments, setSentiments] = useState<Record<string, SentimentResult>>({});
  const analyzedRef = useRef<Set<string>>(new Set());

  const analyze = useCallback(async (msg: ChatMessage) => {
    if (analyzedRef.current.has(msg.id)) return;
    analyzedRef.current.add(msg.id);

    try {
      const res = await fetch("/api/chat/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg.text, messageId: msg.id }),
      });
      if (!res.ok) return;

      const parsed = SentimentResultSchema.safeParse(await res.json());
      if (parsed.success) {
        setSentiments((prev) => ({ ...prev, [msg.id]: parsed.data }));
      }
    } catch {
      analyzedRef.current.delete(msg.id);
    }
  }, []);

  return { sentiments, analyze };
}
