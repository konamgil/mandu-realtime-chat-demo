import { z } from "zod";
import { defineContract } from "@mandujs/core";

export default defineContract({
  POST: {
    request: z.object({
      body: z.object({
        messageId: z.string(),
        expireInSeconds: z.number().min(5).max(86400), // 5초~24시간
      }),
    }),
    response: z.object({
      success: z.boolean(),
      messageId: z.string(),
      expiresAt: z.string(),
    }),
  },
  DELETE: {
    request: z.object({
      body: z.object({
        messageId: z.string(),
      }),
    }),
    response: z.object({
      success: z.boolean(),
    }),
  },
  GET: {
    request: z.object({
      query: z.object({
        roomId: z.string().optional(),
      }),
    }),
    response: z.object({
      expiring: z.array(
        z.object({
          messageId: z.string(),
          expiresAt: z.string(),
          remainingSeconds: z.number(),
        })
      ),
    }),
  },
});
