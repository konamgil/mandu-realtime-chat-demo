import { z } from "zod";
import { defineContract } from "@mandujs/core";

const ReactionGroup = z.object({
  emoji: z.string(),
  count: z.number(),
  users: z.array(z.string()),
  hasReacted: z.boolean().optional(),
});

export default defineContract({
  POST: {
    request: z.object({
      body: z.object({
        messageId: z.string(),
        emoji: z.string().min(1).max(10),
        userId: z.string(),
      }),
    }),
    response: z.object({
      success: z.boolean(),
      toggled: z.boolean(),
      reactions: z.array(ReactionGroup),
    }),
  },
  GET: {
    request: z.object({
      query: z.object({
        messageId: z.string(),
        userId: z.string().optional(),
      }),
    }),
    response: z.object({
      reactions: z.array(ReactionGroup),
    }),
  },
  DELETE: {
    request: z.object({
      body: z.object({
        messageId: z.string(),
        emoji: z.string(),
        userId: z.string(),
      }),
    }),
    response: z.object({
      success: z.boolean(),
      reactions: z.array(ReactionGroup),
    }),
  },
});
