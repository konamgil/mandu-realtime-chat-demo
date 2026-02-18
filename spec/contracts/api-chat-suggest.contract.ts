// 📜 Mandu Contract - api-chat-suggest
// Pattern: /api/chat/suggest
// Generate AI-powered reply suggestions for the latest chat messages

import { z } from "zod";
import { Mandu } from "@mandujs/core";

// ============================================
// 📜 Contract Definition
// ============================================

export default Mandu.contract({
  description: "Generate AI-powered reply suggestions based on recent chat messages",
  tags: ["chat", "suggest", "ai"],

  request: {
    GET: {
      query: z.object({
        roomId: z.string().describe("The chat room ID to generate suggestions for"),
        limit: z.coerce.number().int().min(1).max(20).optional().describe("Number of recent messages to consider (default: 10, max: 20)"),
      }),
    },
  },

  response: {
    200: z.object({
      suggestions: z.array(z.object({
        text: z.string().describe("Suggested reply text"),
        tone: z.enum(["friendly", "formal", "brief"]).describe("Tone of the suggestion"),
      })).describe("List of suggested replies"),
      basedOn: z.string().describe("Preview of the last message used for context"),
    }),
    400: z.object({
      error: z.string(),
    }),
    500: z.object({
      error: z.string(),
    }),
  },
});
