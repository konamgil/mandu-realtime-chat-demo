"use client";

import { useCallback, useState } from "react";
import type { Poll } from "../../src/shared/types/chat";

export function usePolls(roomId: string) {
  const [polls, setPolls] = useState<Poll[]>([]);

  const load = useCallback(async () => {
    const r = await fetch(`/api/chat/poll?roomId=${roomId}`).catch(() => null);
    if (r?.ok) {
      const d = await r.json();
      setPolls(d.polls ?? []);
    }
  }, [roomId]);

  const create = useCallback(
    async (params: {
      question: string;
      options: string[];
      anonymous: boolean;
      createdBy: string;
    }): Promise<Poll | null> => {
      const res = await fetch("/api/chat/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, ...params }),
      });
      if (res.ok) {
        const poll = (await res.json()) as Poll;
        setPolls((prev) => [...prev, poll]);
        return poll;
      }
      return null;
    },
    [roomId],
  );

  const vote = useCallback(async (pollId: string, optionIndex: number, userId: string) => {
    const res = await fetch("/api/chat/poll", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollId, optionIndex, userId }),
    });
    if (res.ok) {
      const data = await res.json();
      setPolls((prev) => prev.map((p) => (p.id === data.poll?.id ? data.poll : p)));
    }
  }, []);

  return { polls, setPolls, load, create, vote };
}
