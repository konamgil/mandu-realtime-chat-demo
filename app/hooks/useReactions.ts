"use client";

import { useCallback, useState } from "react";
import type { ReactionGroup } from "../../src/shared/types/chat";

export function useReactions() {
  const [reactions, setReactions] = useState<Record<string, ReactionGroup[]>>({});

  const update = useCallback((messageId: string, updated: ReactionGroup[]) => {
    setReactions((prev) => ({ ...prev, [messageId]: updated }));
  }, []);

  const toggle = useCallback(
    async (messageId: string, emoji: string, userId: string) => {
      const res = await fetch("/api/chat/reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, emoji, userId }),
      });
      if (res.ok) {
        const data = await res.json();
        update(messageId, data.reactions ?? []);
      }
    },
    [update],
  );

  return { reactions, update, toggle };
}
