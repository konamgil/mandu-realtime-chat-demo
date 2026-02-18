import { getChatStore } from "../../src/server/chat/store";

// messageId → expiresAt(timestamp ms)
const expiryMap = new Map<string, number>();
// messageId → timer handle
const timerMap = new Map<string, ReturnType<typeof setTimeout>>();

function deleteExpiredMessage(messageId: string) {
  const store = getChatStore();
  const idx = store.messages.findIndex((m) => m.id === messageId);
  if (idx !== -1) {
    store.messages.splice(idx, 1);
    // SSE 이벤트 전파 — 삭제 알림
    for (const listener of [...store.listeners]) {
      try {
        listener({
          id: messageId,
          role: "agent",
          author: "system",
          text: `[메시지가 만료되어 삭제되었습니다]`,
          createdAt: new Date().toISOString(),
        });
      } catch {}
    }
  }
  expiryMap.delete(messageId);
  timerMap.delete(messageId);
}

function scheduleExpiry(messageId: string, expiresAt: number) {
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) {
    deleteExpiredMessage(messageId);
    return;
  }
  const timer = setTimeout(() => deleteExpiredMessage(messageId), remaining);
  timerMap.set(messageId, timer);
}

export async function GET(_request: Request) {
  const now = Date.now();
  const expiring = Array.from(expiryMap.entries()).map(([messageId, expiresAt]) => ({
    messageId,
    expiresAt: new Date(expiresAt).toISOString(),
    remainingSeconds: Math.max(0, Math.round((expiresAt - now) / 1000)),
  }));
  return Response.json({ expiring });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { messageId?: string; expireInSeconds?: number };
  const { messageId, expireInSeconds } = body;

  if (!messageId || !expireInSeconds) {
    return Response.json({ error: "messageId, expireInSeconds 필수" }, { status: 400 });
  }

  // 기존 타이머 취소
  const existing = timerMap.get(messageId);
  if (existing) clearTimeout(existing);

  const expiresAt = Date.now() + expireInSeconds * 1000;
  expiryMap.set(messageId, expiresAt);
  scheduleExpiry(messageId, expiresAt);

  return Response.json({
    success: true,
    messageId,
    expiresAt: new Date(expiresAt).toISOString(),
  });
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => ({})) as { messageId?: string };
  const { messageId } = body;

  if (!messageId) {
    return Response.json({ error: "messageId 필수" }, { status: 400 });
  }

  const timer = timerMap.get(messageId);
  if (timer) clearTimeout(timer);
  expiryMap.delete(messageId);
  timerMap.delete(messageId);

  return Response.json({ success: true });
}
