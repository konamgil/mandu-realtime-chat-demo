export type ChatRole = "user" | "ai" | "agent";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  author: string;
  text: string;
  createdAt: string;
}

interface ChatStore {
  messages: ChatMessage[];
  listeners: Set<(message: ChatMessage) => void>;
}

interface ListMessagesOptions {
  sinceId?: string;
  limit?: number;
}

declare global {
  var __manduChatStore__: ChatStore | undefined;
}

function createStore(): ChatStore {
  return {
    messages: [
      {
        id: crypto.randomUUID(),
        role: "agent",
        author: "system-agent",
        text: "채팅 데모 준비 완료. 메시지를 보내보세요!",
        createdAt: new Date().toISOString(),
      },
    ],
    listeners: new Set(),
  };
}

export function getChatStore(): ChatStore {
  if (!globalThis.__manduChatStore__) {
    globalThis.__manduChatStore__ = createStore();
  }
  return globalThis.__manduChatStore__;
}

export function addMessage(message: Omit<ChatMessage, "id" | "createdAt">): ChatMessage {
  const store = getChatStore();
  const next: ChatMessage = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...message,
  };
  store.messages.push(next);
  for (const listener of store.listeners) listener(next);
  return next;
}

function applyLimit(messages: ChatMessage[], limit?: number): ChatMessage[] {
  if (!limit || Number.isNaN(limit)) return messages;
  const normalized = Math.min(Math.max(Math.trunc(limit), 1), 200);
  return messages.slice(-normalized);
}

export function listMessages(options: ListMessagesOptions = {}): ChatMessage[] {
  const store = getChatStore();

  if (!options.sinceId) {
    return applyLimit([...store.messages], options.limit);
  }

  const sinceIndex = store.messages.findIndex((message) => message.id === options.sinceId);
  if (sinceIndex < 0) {
    return applyLimit([...store.messages], options.limit);
  }

  return applyLimit(store.messages.slice(sinceIndex + 1), options.limit);
}

export function subscribe(listener: (message: ChatMessage) => void): () => void {
  const store = getChatStore();
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}
