"use client";

import { useEffect, useMemo, useState } from "react";
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
  if (typeof window === "undefined") {
    // SSR에서는 localStorage에 접근할 수 없으므로 로그인 화면을 기본 쉘로 렌더링한다.
    return null;
  }
  return getStoredSession();
}

export default function HomePageClient() {
  const [session, setSession] = useState<AuthSession | null>(getInitialSession);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshotLimit, setSnapshotLimit] = useState<number>(50);

  const upsertMessages = (incoming: ChatMessage[]) => {
    setMessages((prev) => {
      if (!incoming.length) return prev;
      const seen = new Set(prev.map((message) => message.id));
      const next = [...prev];

      for (const message of incoming) {
        if (seen.has(message.id)) continue;
        seen.add(message.id);
        next.push(message);
      }
      return next;
    });
  };

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

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
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
    } finally {
      setSending(false);
    }
  }

  const status = useMemo(() => (connected ? "연결됨" : "연결중"), [connected]);
  const remainingChars = 500 - text.length;

  if (!session) {
    return (
      <LoginScreen
        title="🥟 Mandu Chat Demo 로그인"
        description="로그인 후 실시간 채팅 데모를 사용할 수 있습니다."
        onLogin={(nextSession) => setSession(nextSession)}
      />
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🥟 Mandu Real-time Chat Demo</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>상태: <span className={`font-medium ${connected ? 'text-green-600' : 'text-amber-600'}`}>{status}</span></span>
          <span>·</span>
          <span>사용자: <span className="font-medium">{session.name}</span> ({session.email})</span>
          <span>·</span>
          <span>API: <code className="px-1.5 py-0.5 bg-secondary rounded text-xs">/api/chat/*</code></span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-secondary/50 rounded-lg">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium">초기 로드:</span>
          <select
            value={snapshotLimit}
            onChange={(e) => setSnapshotLimit(Number(e.target.value))}
            className="px-3 py-1.5 border rounded-md bg-background text-sm"
          >
            <option value={20}>20개</option>
            <option value={50}>50개</option>
            <option value={100}>100개</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            clearStoredSession();
            setSession(null);
            setMessages([]);
            setText("");
          }}
          className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          로그아웃
        </button>
        <small className="text-xs text-muted-foreground">값 변경 시 스트림 재연결</small>
      </div>

      <div className="border rounded-lg h-[420px] overflow-y-auto p-4 mb-4 bg-white shadow-sm">
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-lg ${
                m.role === 'user' ? 'bg-primary text-primary-foreground ml-12' :
                m.role === 'ai' ? 'bg-secondary mr-12' :
                'bg-muted text-sm italic'
              }`}
            >
              <div className="font-semibold text-xs mb-1 opacity-80">
                [{m.role}] {m.author}
              </div>
              <div>{m.text}</div>
              <div className="text-xs opacity-70 mt-1">
                {new Date(m.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-3 p-2 bg-red-50 rounded">{error}</p>}

      <form onSubmit={sendMessage} className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              void sendMessage(e);
            }
          }}
          placeholder="메시지를 입력하세요 (Ctrl+Enter로 전송)"
          className="flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <small className={`text-xs min-w-[60px] text-right ${remainingChars < 0 ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
          {remainingChars}자
        </small>
        <button
          disabled={sending || remainingChars < 0}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {sending ? "전송중..." : "전송"}
        </button>
      </form>
    </main>
  );
}
