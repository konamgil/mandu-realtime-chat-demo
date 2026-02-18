import { z } from "zod";
import { defineContract } from "@mandujs/core";

const SentimentResult = z.object({
  emoji: z.string(),
  label: z.enum(["긍정", "부정", "중립", "유머", "분노", "놀람", "슬픔"]),
  score: z.number().min(-1).max(1), // -1(매우부정) ~ 1(매우긍정)
  keywords: z.array(z.string()),
});

export default defineContract({
  POST: {
    request: z.object({
      body: z.object({
        text: z.string().min(1).max(500),
        messageId: z.string().optional(),
      }),
    }),
    response: SentimentResult,
  },
  GET: {
    request: z.object({
      query: z.object({
        messageId: z.string(),
      }),
    }),
    response: z.union([SentimentResult, z.object({ error: z.string() })]),
  },
});
