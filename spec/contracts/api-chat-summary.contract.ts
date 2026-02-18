// 📜 Mandu Contract - api-chat-summary
// Pattern: /api/chat/summary
// Generate AI summary of recent chat messages in a room

import { z } from "zod";
import { Mandu } from "@mandujs/core";

// ============================================
// 📜 Contract Definition
// ============================================

export default Mandu.contract({
  description: "Generate an AI-powered summary of recent chat messages in a room",
  tags: ["chat", "summary", "ai"],

  request: {
    GET: {
      query: z.object({
        roomId: z.string().describe("The chat room ID to summarize"),
        limit: z.coerce.number().int().min(1).max(100).optional().describe("Number of recent messages to summarize (default: 50, max: 100)"),
      }),
    },
  },

  response: {
    200: z.object({
      summary: z.string().describe("AI-generated summary of the conversation"),
      messageCount: z.number().describe("Number of messages included in the summary"),
      generatedAt: z.string().describe("ISO timestamp when the summary was generated"),
      cachedUntil: z.string().describe("ISO timestamp until which the summary is cached"),
    }),
    400: z.object({
      error: z.string(),
    }),
    500: z.object({
      error: z.string(),
    }),
  },
});
