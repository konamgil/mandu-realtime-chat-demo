"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthSession } from "../lib/auth";
import { SLOW_MODE_OPTIONS } from "../../src/shared/types/chat";
import type { SlowModeSeconds } from "../../src/shared/types/chat";

export { SLOW_MODE_OPTIONS };

export function useSlowMode(roomId: string, session: AuthSession | null) {
  const [intervalSeconds, setIntervalSeconds] = useState<SlowModeSeconds>(0);
  const [retryAfter, setRetryAfter] = useState(0);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/chat/slowmode?roomId=${roomId}`)
      .then((r) => r.json())
      .then((d) => {
        const val = d.intervalSeconds ?? 0;
        if ((SLOW_MODE_OPTIONS as readonly number[]).includes(val)) {
          setIntervalSeconds(val as SlowModeSeconds);
        }
      })
      .catch(() => {});
  }, [session, roomId]);

  const setMode = useCallback(
    async (seconds: SlowModeSeconds) => {
      const res = await fetch("/api/chat/slowmode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, intervalSeconds: seconds }),
      });
      if (res.ok) setIntervalSeconds(seconds);
    },
    [roomId],
  );

  const startRetryCountdown = useCallback((seconds: number) => {
    setRetryAfter(seconds);
    const tick = setInterval(() => {
      setRetryAfter((v) => {
        if (v <= 1) {
          clearInterval(tick);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }, []);

  return { intervalSeconds, retryAfter, setMode, startRetryCountdown };
}
