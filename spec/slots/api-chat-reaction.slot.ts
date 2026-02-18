import { Mandu } from "@mandujs/core";

interface ReactionGroup {
  emoji: string;
  count: number;
  users: string[];
  hasReacted?: boolean;
}

// messageId → emoji → users Set
const reactionStore = new Map<string, Map<string, Set<string>>>();

function getReactions(messageId: string, currentUserId?: string): ReactionGroup[] {
  const emojiMap = reactionStore.get(messageId);
  if (!emojiMap) return [];
  return Array.from(emojiMap.entries())
    .filter(([, users]) => users.size > 0)
    .map(([emoji, users]) => ({
      emoji,
      count: users.size,
      users: Array.from(users),
      hasReacted: currentUserId ? users.has(currentUserId) : undefined,
    }));
}

function ensureStores(messageId: string, emoji: string): Set<string> {
  if (!reactionStore.has(messageId)) {
    reactionStore.set(messageId, new Map());
  }
  const emojiMap = reactionStore.get(messageId)!;
  if (!emojiMap.has(emoji)) {
    emojiMap.set(emoji, new Set());
  }
  return emojiMap.get(emoji)!;
}

export default Mandu.filling()
  .purpose("메시지 리액션 토글 및 조회 API")
  .get(async (ctx) => {
    const { messageId, userId } = ctx.query;
    if (!messageId) {
      return Response.json({ error: "messageId required" }, { status: 400 });
    }
    return Response.json({ reactions: getReactions(messageId, userId) });
  })
  .post(async (ctx) => {
    const body = await ctx.body<{ messageId: string; emoji: string; userId: string }>();
    const { messageId, emoji, userId } = body;

    if (!messageId || !emoji || !userId) {
      return Response.json({ error: "messageId, emoji, userId 필수" }, { status: 400 });
    }

    const users = ensureStores(messageId, emoji);
    const wasPresent = users.has(userId);
    if (wasPresent) {
      users.delete(userId);
    } else {
      users.add(userId);
    }
    return Response.json({
      success: true,
      toggled: !wasPresent,
      reactions: getReactions(messageId, userId),
    });
  })
  .delete(async (ctx) => {
    const body = await ctx.body<{ messageId: string; emoji: string; userId: string }>();
    const { messageId, emoji, userId } = body;

    if (!messageId || !emoji || !userId) {
      return Response.json({ error: "messageId, emoji, userId 필수" }, { status: 400 });
    }

    const users = ensureStores(messageId, emoji);
    users.delete(userId);
    return Response.json({ success: true, reactions: getReactions(messageId, userId) });
  });
