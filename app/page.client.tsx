"use client";

import { useEffect, useRef, useState } from "react";
import LoginScreen from "./components/login-screen";
import { clearStoredSession, getStoredSession, type AuthSession } from "./lib/auth";

type ChatRole = "user" | "ai" | "agent";

type ChatMessage = {
  id: string;
  role: ChatRole;
  author: string;
  text: string;
  createdAt: string;
};

function getInitialSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  return getStoredSession();
}

const roleConfig: Record<ChatRole, { label: string; emoji: string; initials: string }> = {
  user: { label: "User", emoji: "👤", initials: "U" },
  ai:   { label: "AI",   emoji: "🤖", initials: "AI" },
  agent:{ label: "Agent",emoji: "🛠️", initials: "AG" },
};

function Avatar({ role }: { role: ChatRole }) {
  const cfg = roleConfig[role];
  const bg = role === "ai" ? "bg-indigo-600" : role === "agent" ? "bg-violet-600" : "bg-slate-600";
  return (
    <div className={`flex-shrink-0 w-8 h-8 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold select-none`}>
      {cfg.initials}
    </div>
  );
}

function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  const time = new Date(message.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

  if (isOwn) {
    return (
      <div className="flex items-end justify-end gap-2 group">
        <div className="flex flex-col items-end gap-1 max-w-[72%]">
          <span className="text-xs text-slate-400 px-1">{time}</span>
          <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-br-sm shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
          </div>
        </div>
        <Avatar role={message.role} />
      </div>
    );
  }

  if (message.role === "agent") {
    return (
      <div className="flex items-end gap-2">
        <Avatar role="agent" />
        <div className="flex flex-col gap-1 max-w-[72%]">
          <span className="text-xs text-slate-400 px-1">에이전트 · {time}</span>
          <div className="bg-violet-50 border border-violet-200 text-violet-900 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words italic">{message.text}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <Avatar role="ai" />
      <div className="flex flex-col gap-1 max-w-[72%]">
        <span className="text-xs text-slate-400 px-1">AI · {time}</span>
        <div className="bg-white border border-slate-200 text-slate-800 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePageClient() {
  const [session, setSession] = useState<AuthSession | null>(getInitialSession);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshotLimit, setSnapshotLimit] = useState<number>(50);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const upsertMessages = (incoming: ChatMessage[]) => {
    setMessages((prev) => {
      if (!incoming.length) return prev;
      const seen = new Set(prev.map((m) => m.id));
      const next = [...prev];
      for (const m of incoming) {
        if (seen.has(m.id)) continue;
        seen.add(m.id);
        next.push(m);
      }
      return next;
    });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!session) {
      setConnected(false);
      return;
    }

    setMessages([]);
    let latestMessageId: string | undefined;

    const syncMissedMessages = async () => {
      const search = new URLSearchParams();
      if (latestMessageId) {
        search.set("sinceId", latestMessageId);
      } else {
        search.set("limit", String(snapshotLimit));
      }
      const qs = search.toString();
      const response = await fetch(`/api/chat/messages${qs ? `?${qs}` : ""}`);
      const data = await response.json();
      const incoming = (data.messages ?? []) as ChatMessage[];
      if (incoming.length > 0) {
        latestMessageId = incoming[incoming.length - 1].id;
      }
      upsertMessages(incoming);
    };

    syncMissedMessages().catch(() => undefined);

    const es = new EventSource("/api/chat/stream");
    es.addEventListener("ready", () => {
      setConnected(true);
      syncMissedMessages().catch(() => undefined);
    });
    es.addEventListener("message", (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as ChatMessage;
      latestMessageId = payload.id;
      upsertMessages([payload]);
    });
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, [session, snapshotLimit]);

  async function sendMessage() {
    const trimmed = text.trim();
    if (!trimmed || sending || trimmed.length > 500 || !session) return;

    setSending(true);
    setError(null);
    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload?.error ?? "메시지 전송 실패");
        return;
      }
      setText("");
      inputRef.current?.focus();
    } finally {
      setSending(false);
    }
  }

  const remainingChars = 500 - text.length;
  const isOverLimit = remainingChars < 0;
  const canSend = text.trim().length > 0 && !sending && !isOverLimit && !!session;

  if (!session) {
    return (
      <LoginScreen
        title="🥟 Mandu Chat"
        description="로그인 후 실시간 AI 채팅 데모를 사용할 수 있습니다."
        onLogin={(nextSession) => setSession(nextSession)}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", maxWidth: 760, margin: "0 auto" }}>
      {/* 헤더 */}
      <header style={{
        backgroundColor: "#fff",
        borderBottom: "1px solid #e2e8f0",
        padding: "0 20px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18
          }}>🥟</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Mandu Chat</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
              <span style={{
                display: "inline-block",
                width: 7, height: 7,
                borderRadius: "50%",
                backgroundColor: connected ? "#22c55e" : "#f59e0b",
              }} />
              <span style={{ color: connected ? "#16a34a" : "#d97706", fontWeight: 500 }}>
                {connected ? "실시간 연결됨" : "연결 중..."}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32,
              borderRadius: "50%",
              background: "#e0e7ff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#4f46e5"
            }}>
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontSize: 13 }}>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>{session.name}</div>
              <div style={{ color: "#94a3b8", fontSize: 11 }}>{session.email}</div>
            </div>
          </div>
          <button
            onClick={() => {
              clearStoredSession();
              setSession(null);
              setMessages([]);
              setText("");
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#fff",
              color: "#64748b",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 메시지 영역 */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}>
        {messages.length === 0 ? (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 12,
            color: "#94a3b8", textAlign: "center", padding: "40px 20px"
          }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <div style={{ fontWeight: 600, fontSize: 16, color: "#64748b" }}>대화를 시작해보세요</div>
            <div style={{ fontSize: 13 }}>메시지를 보내면 AI와 에이전트가 응답합니다</div>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble key={m.id} message={m} isOwn={m.role === "user"} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* 에러 */}
      {error && (
        <div style={{
          margin: "0 20px 8px",
          padding: "10px 14px",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 10,
          fontSize: 13,
          color: "#dc2626",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* 입력 영역 */}
      <div style={{
        backgroundColor: "#fff",
        borderTop: "1px solid #e2e8f0",
        padding: "12px 20px 16px",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
          background: "#f8fafc",
          border: "1.5px solid #e2e8f0",
          borderRadius: 16,
          padding: "10px 14px",
          transition: "border-color 0.15s",
        }}>
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                void sendMessage();
              }
              if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="메시지 입력 (Enter 전송, Shift+Enter 줄바꿈)"
            rows={1}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 14,
              color: "#0f172a",
              resize: "none",
              lineHeight: 1.5,
              maxHeight: 120,
              overflowY: "auto",
              fontFamily: "inherit",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{
              fontSize: 11,
              color: isOverLimit ? "#dc2626" : "#94a3b8",
              fontWeight: isOverLimit ? 600 : 400,
              minWidth: 48,
              textAlign: "right",
            }}>
              {remainingChars}/500
            </span>
            <button
              onClick={() => void sendMessage()}
              disabled={!canSend}
              style={{
                width: 36, height: 36,
                borderRadius: 10,
                border: "none",
                background: canSend ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "#e2e8f0",
                color: canSend ? "#fff" : "#94a3b8",
                cursor: canSend ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              {sending ? (
                <span style={{ fontSize: 12, fontWeight: 600 }}>...</span>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, paddingLeft: 4 }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>스냅샷 최대</span>
          <select
            value={snapshotLimit}
            onChange={(e) => setSnapshotLimit(Number(e.target.value))}
            style={{
              fontSize: 11, color: "#64748b",
              border: "1px solid #e2e8f0", borderRadius: 6,
              padding: "2px 6px", background: "#fff", cursor: "pointer"
            }}
          >
            <option value={20}>20개</option>
            <option value={50}>50개</option>
            <option value={100}>100개</option>
          </select>
          <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>
            총 {messages.length}개 메시지
          </span>
        </div>
      </div>
    </div>
  );
}
