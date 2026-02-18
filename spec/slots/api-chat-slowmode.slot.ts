// roomId → intervalSeconds (0 = disabled)
export const slowModeSettings = new Map<string, number>();
// `${roomId}:${userId}` → lastSentAt (timestamp ms)
export const lastSentTime = new Map<string, number>();

export function checkSlowMode(
  roomId: string,
  userId: string,
): { allowed: boolean; retryAfterSeconds?: number } {
  const interval = slowModeSettings.get(roomId) ?? 0;
  if (interval === 0) return { allowed: true };

  const lastSent = lastSentTime.get(`${roomId}:${userId}`) ?? 0;
  const elapsed = (Date.now() - lastSent) / 1000;

  if (elapsed < interval) {
    return { allowed: false, retryAfterSeconds: Math.ceil(interval - elapsed) };
  }
  return { allowed: true };
}

export function recordSent(roomId: string, userId: string): void {
  lastSentTime.set(`${roomId}:${userId}`, Date.now());
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const roomId = url.searchParams.get("roomId") ?? "";

  if (!roomId) {
    return Response.json({ error: "roomId is required" }, { status: 400 });
  }

  const intervalSeconds = slowModeSettings.get(roomId) ?? 0;
  return Response.json({
    roomId,
    intervalSeconds,
    enabled: intervalSeconds > 0,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { roomId, intervalSeconds } = body as {
    roomId?: unknown;
    intervalSeconds?: unknown;
  };

  if (typeof roomId !== "string" || !roomId) {
    return Response.json({ error: "roomId is required" }, { status: 400 });
  }

  if (typeof intervalSeconds !== "number" || intervalSeconds < 0 || intervalSeconds > 3600) {
    return Response.json(
      { error: "intervalSeconds must be a number between 0 and 3600" },
      { status: 400 },
    );
  }

  slowModeSettings.set(roomId, intervalSeconds);
  return Response.json({ success: true as const, roomId, intervalSeconds });
}
