import { z } from "zod";
import { defineContract } from "@mandujs/core";

const PollOption = z.object({
  text: z.string(),
  votes: z.number().default(0),
});

const Poll = z.object({
  id: z.string(),
  roomId: z.string(),
  question: z.string(),
  options: z.array(PollOption),
  anonymous: z.boolean(),
  createdAt: z.string(),
  createdBy: z.string(),
  expiresAt: z.string().optional(),
});

export default defineContract({
  POST: {
    request: z.object({
      body: z.object({
        roomId: z.string(),
        question: z.string().min(1).max(200),
        options: z.array(z.string().min(1)).min(2).max(6),
        anonymous: z.boolean().default(true),
        createdBy: z.string(),
        expiresInMinutes: z.number().optional(),
      }),
    }),
    response: Poll,
  },
  GET: {
    request: z.object({
      query: z.object({
        roomId: z.string(),
      }),
    }),
    response: z.object({
      polls: z.array(Poll),
    }),
  },
  PUT: {
    request: z.object({
      body: z.object({
        pollId: z.string(),
        optionIndex: z.number().min(0),
        userId: z.string(),
      }),
    }),
    response: z.object({
      success: z.boolean(),
      poll: Poll,
    }),
  },
});
