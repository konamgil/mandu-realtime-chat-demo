// 📜 Mandu Contract - api-chat-messages
// Pattern: /api/chat/messages
// Retrieve chat messages with optional filtering

import { z } from "zod";
import { Mandu } from "@mandujs/core";
import { ChatMessageSchema } from "../../src/shared/types/chat";

// ============================================
// 📜 Contract Definition
// ============================================

export default Mandu.contract({
  description: "Retrieve chat messages with optional filtering by ID and limit",
  tags: ["chat", "messages"],

  request: {
    GET: {
      query: z.object({
        sinceId: z.string().optional().describe("Fetch messages created after this message ID"),
        limit: z.coerce.number().int().min(1).max(200).optional().describe("Limit number of messages returned (1-200)"),
      }),
    },
  },

  response: {
    200: z.object({
      messages: z.array(ChatMessageSchema),
    }),
  },
});

// 💡 Contract 사용법:
// 1. 위의 스키마를 실제 데이터 구조에 맞게 정의하세요
// 2. mandu generate를 실행하면 타입이 자동으로 Slot에 연결됩니다
// 3. OpenAPI 문서가 자동으로 생성됩니다
