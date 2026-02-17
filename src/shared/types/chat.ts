/**
 * Chat Types
 *
 * Shared type definitions for chat messages across client and server
 */

import { z } from "zod";

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

// Zod schema for validation and Contract usage
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

export const ChatErrorCode = {
  EMPTY_TEXT: "EMPTY_TEXT",
  TEXT_TOO_LONG: "TEXT_TOO_LONG",
} as const;

export type ChatErrorCodeType = (typeof ChatErrorCode)[keyof typeof ChatErrorCode];
