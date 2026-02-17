// 📜 Mandu Contract - api-chat-send
// Pattern: /api/chat/send
// Send a chat message and receive AI/agent responses

import { z } from "zod";
import { Mandu } from "@mandujs/core";
import { ChatMessageSchema, ChatErrorCode } from "../../src/shared/types/chat";

// ============================================
// 📜 Contract Definition
// ============================================

export default Mandu.contract({
  description: "Send a chat message and receive AI/agent responses",
  tags: ["chat", "messaging"],

  request: {
    POST: {
      body: z.object({
        text: z.string().min(1, "Message text is required").max(500, "Message must be <= 500 characters"),
      }),
    },
  },

  response: {
    200: z.object({
      ok: z.literal(true),
      user: ChatMessageSchema,
      ai: ChatMessageSchema,
      agent: ChatMessageSchema,
    }),
    400: z.object({
      error: z.string(),
      code: z.literal(ChatErrorCode.EMPTY_TEXT),
    }),
    422: z.object({
      error: z.string(),
      code: z.literal(ChatErrorCode.TEXT_TOO_LONG),
    }),
  },
});
