import { z } from "zod";
import { defineContract } from "@mandujs/core";

export default defineContract({
  POST: {
    request: z.object({
      body: z.object({
        roomId: z.string(),
        messageId: z.string(),
      }),
    }),
    response: z.object({
      success: z.boolean(),
      pinnedIds: z.array(z.string()),
    }),
  },
  DELETE: {
    request: z.object({
      body: z.object({
        roomId: z.string(),
        messageId: z.string(),
      }),
    }),
    response: z.object({
      success: z.boolean(),
      pinnedIds: z.array(z.string()),
    }),
  },
});
