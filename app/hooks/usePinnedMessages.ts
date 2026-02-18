"use client";

import { useCallback, useState } from "react";

export function usePinnedMessages(roomId: string) {
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    const r = await fetch(`/api/chat/pin?roomId=${roomId}&messageId=_`).catch(() => null);
    if (r?.ok) {
      const d = await r.json();
      setPinnedIds(d.pinnedIds ?? []);
    }
  }, [roomId]);

  const pin = useCallback(
    async (messageId: string): Promise<string | null> => {
      const r = await fetch("/api/chat/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, messageId }),
      });
      if (r.ok) {
        const d = await r.json();
        setPinnedIds(d.pinnedIds);
        return null;
      }
      const d = await r.json();
      return d.error ?? "핀 추가 실패";
    },
    [roomId],
  );

  const unpin = useCallback(
    async (messageId: string) => {
      const r = await fetch("/api/chat/pin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, messageId }),
      });
      if (r.ok) {
        const d = await r.json();
        setPinnedIds(d.pinnedIds);
      }
    },
    [roomId],
  );

  return { pinnedIds, load, pin, unpin };
}
