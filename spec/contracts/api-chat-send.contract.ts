// 📜 Mandu Contract - api-chat-send
// Pattern: /api/chat/send
// 이 파일에서 API 스키마를 정의하세요.

import { z } from "zod";
import { Mandu } from "@mandujs/core";

// ============================================
// 🥟 Schema Definitions
// ============================================

const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "ai", "agent"]),
  author: z.string(),
  text: z.string(),
  createdAt: z.string(),
});

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
      code: z.literal("EMPTY_TEXT"),
    }),
    422: z.object({
      error: z.string(),
      code: z.literal("TEXT_TOO_LONG"),
    }),
  },
});

// 💡 Contract 사용법:
// 1. 위의 스키마를 실제 데이터 구조에 맞게 정의하세요
// 2. mandu generate를 실행하면 타입이 자동으로 Slot에 연결됩니다
// 3. OpenAPI 문서가 자동으로 생성됩니다
