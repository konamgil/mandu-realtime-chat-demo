// Mandu Contract - api-chat-slowmode
// Pattern: /api/chat/slowmode
// Get or set slow mode settings for a chat room

import { z } from "zod";
import { Mandu } from "@mandujs/core";

// ============================================
// Contract Definition
// ============================================

export default Mandu.contract({
  description: "Get or set slow mode settings for a chat room",
  tags: ["chat", "moderation"],

  request: {
    GET: {
      query: z.object({
        roomId: z.string().min(1, "roomId is required"),
      }),
    },
    POST: {
      body: z.object({
        roomId: z.string().min(1, "roomId is required"),
        intervalSeconds: z
          .number()
          .int()
          .min(0, "intervalSeconds must be >= 0")
          .max(3600, "intervalSeconds must be <= 3600"),
      }),
    },
  },

  response: {
    200: z.union([
      // GET response
      z.object({
        roomId: z.string(),
        intervalSeconds: z.number(),
        enabled: z.boolean(),
      }),
      // POST response
      z.object({
        success: z.literal(true),
        roomId: z.string(),
        intervalSeconds: z.number(),
      }),
    ]),
    400: z.object({
      error: z.string(),
    }),
    405: z.object({
      error: z.string(),
    }),
  },
});
