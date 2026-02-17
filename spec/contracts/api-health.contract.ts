// 📜 Mandu Contract - api-health
// Pattern: /api/health
// Health check endpoint

import { z } from "zod";
import { Mandu } from "@mandujs/core";

// ============================================
// 📜 Contract Definition
// ============================================

export default Mandu.contract({
  description: "Health check endpoint - returns service status",
  tags: ["health", "monitoring"],

  request: {
    GET: {
      // No query parameters required
    },
  },

  response: {
    200: z.object({
      status: z.literal("ok"),
      timestamp: z.string().describe("ISO 8601 timestamp"),
      framework: z.literal("Mandu"),
    }),
  },
});
