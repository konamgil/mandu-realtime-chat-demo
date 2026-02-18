/**
 * Chat Types
 *
 * 클라이언트/서버 공유 타입 정의. 단일 진실 소스.
 */

import { z } from "zod";

// ============================================
// Branded Types
// ============================================

export type MessageId = string & { readonly __brand: "MessageId" };

export function toMessageId(id: string): MessageId {
  return id as MessageId;
}

// ============================================
// Chat Role Types
// ============================================

export type ChatRole = "user" | "ai" | "agent";

export const ChatRoleEnum = z.enum(["user", "ai", "agent"]);

// ============================================
// Chat Message Types
// ============================================

export interface ChatMessage {
  id: string;
  role: ChatRole;
  author: string;
  text: string;
  createdAt: string;
}

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: ChatRoleEnum,
  author: z.string(),
  text: z.string(),
  createdAt: z.string(),
});

// ============================================
// Error Code Types
// ============================================

export const ChatErrorCodeEnum = z.enum(["EMPTY_TEXT", "TEXT_TOO_LONG"]);
export type ChatErrorCode = z.infer<typeof ChatErrorCodeEnum>;

// 기존 코드 호환성 유지
export const ChatErrorCode = ChatErrorCodeEnum.enum;

// ============================================
// Sentiment Types
// ============================================

export type SentimentLabel =
  | "positive"
  | "negative"
  | "neutral"
  | "humor"
  | "angry"
  | "surprise"
  | "sad";

export const SentimentLabelEnum = z.enum([
  "positive",
  "negative",
  "neutral",
  "humor",
  "angry",
  "surprise",
  "sad",
]);

export const SENTIMENT_DISPLAY: Record<SentimentLabel, string> = {
  positive: "긍정",
  negative: "부정",
  neutral: "중립",
  humor: "유머",
  angry: "분노",
  surprise: "놀람",
  sad: "슬픔",
};

export interface SentimentResult {
  emoji: string;
  label: SentimentLabel;
  score: number;
  keywords: string[];
}

export const SentimentResultSchema = z.object({
  emoji: z.string(),
  label: SentimentLabelEnum,
  score: z.number(),
  keywords: z.array(z.string()),
});

// ============================================
// Reaction Types
// ============================================

export interface ReactionGroup {
  emoji: string;
  count: number;
  users: string[];
  hasReacted?: boolean;
}

// ============================================
// Poll Types
// ============================================

export interface PollOption {
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  roomId: string;
  question: string;
  options: PollOption[];
  anonymous: boolean;
  createdAt: string;
  createdBy: string;
}

// ============================================
// Suggestion Types
// ============================================

export type SuggestionTone = "friendly" | "formal" | "brief";

export interface Suggestion {
  text: string;
  tone: SuggestionTone;
}

export const SUGGESTION_TONE_LABEL: Record<SuggestionTone, string> = {
  friendly: "친근하게",
  formal: "격식체",
  brief: "짧게",
};

export const SUGGESTION_TONE_COLOR: Record<SuggestionTone, string> = {
  friendly: "#4f46e5",
  formal: "#0f766e",
  brief: "#92400e",
};

// ============================================
// Slow Mode Types
// ============================================

export const SLOW_MODE_OPTIONS = [0, 5, 10, 30, 60] as const;
export type SlowModeSeconds = (typeof SLOW_MODE_OPTIONS)[number];
