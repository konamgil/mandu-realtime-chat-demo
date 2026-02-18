"use client";

import { useEffect, useRef, useState } from "react";
import LoginScreen from "./components/login-screen";
import { clearStoredSession, getStoredSession, type AuthSession } from "./lib/auth";
import type {
  ChatMessage,
  ChatRole,
  Poll,
  ReactionGroup,
  SentimentResult,
  SuggestionTone,
  Suggestion,
  SlowModeSeconds,
} from "../src/shared/types/chat";
import {
  SUGGESTION_TONE_LABEL,
  SUGGESTION_TONE_COLOR,
  SLOW_MODE_OPTIONS,
} from "../src/shared/types/chat";
import { useChat } from "./hooks/useChat";
import { useSentiment } from "./hooks/useSentiment";
import { useReactions } from "./hooks/useReactions";
import { usePinnedMessages } from "./hooks/usePinnedMessages";
import { usePolls } from "./hooks/usePolls";
import { useSlowMode } from "./hooks/useSlowMode";

// ─── Constants ────────────────────────────────────────────

const ROOM_ID = "default";
const QUICK_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🎉"];

// ─── Icons ────────────────────────────────────────────────

const ic = { display: "inline-block", verticalAlign: "middle", flexShrink: 0 } as const;

function IconMandu({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={ic}>
      <ellipse cx="16" cy="19" rx="13" ry="9" fill="rgba(255,255,255,0.95)" />
      <path d="M3 19 C3 9 9 5 16 5 C23 5 29 9 29 19" fill="rgba(255,255,255,0.95)" />
      <path d="M6 17 Q16 11 26 17" stroke="#e8967a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <ellipse cx="16" cy="19" rx="13" ry="9" stroke="#d97706" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function IconPin({ size = 13, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={ic}>
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
  );
}

function IconTimer({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={ic}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M9 3h6" />
      <path d="M12 3v2" />
    </svg>
  );
}

function IconBot({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={ic}>
      <rect width="18" height="10" x="3" y="11" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <circle cx="8" cy="16" r="1" fill="currentColor" />
      <circle cx="16" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

function IconFileText({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={ic}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <line x1="10" y1="12" x2="14" y2="12" />
      <line x1="8" y1="16" x2="16" y2="16" />
    </svg>
  );
}

function IconSparkles({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={ic}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" /><path d="M22 5h-4" />
      <path d="M4 17v2" /><path d="M5 18H3" />
    </svg>
  );
}

function IconBarChart({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={ic}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function IconClock({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={ic}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconMessageCircle({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={ic}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function IconAlertTriangle({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={ic}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  );
}

// ─── Avatar ───────────────────────────────────────────────

function Avatar({ role, name }: { role: ChatRole; name?: string }) {
  const bg = role === "ai" ? "#4f46e5" : role === "agent" ? "#7c3aed" : "#475569";
  const initials = name ? name.charAt(0).toUpperCase() : (role === "ai" ? "AI" : role === "agent" ? "AG" : "U");
  return (
    <div style={{
      flexShrink: 0, width: 32, height: 32, borderRadius: "50%",
      background: bg, display: "flex", alignItems: "center",
      justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, userSelect: "none",
    }}>
      {initials}
    </div>
  );
}

// ─── Reaction Bar ─────────────────────────────────────────

function ReactionBar({
  messageId, userId, reactions, onUpdate,
}: {
  messageId: string;
  userId: string;
  reactions: ReactionGroup[];
  onUpdate: (id: string, reactions: ReactionGroup[]) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPicker]);

  const toggle = async (emoji: string) => {
    setShowPicker(false);
    const res = await fetch("/api/chat/reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, emoji, userId }),
    });
    if (res.ok) {
      const data = await res.json();
      onUpdate(messageId, data.reactions);
    }
  };

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
      {reactions.map((r) => (
        <button key={r.emoji} onClick={() => toggle(r.emoji)} style={{
          display: "flex", alignItems: "center", gap: 3,
          padding: "2px 8px", borderRadius: 12,
          border: `1.5px solid ${r.hasReacted ? "#c7d2fe" : "#e2e8f0"}`,
          background: r.hasReacted ? "#eef2ff" : "#f8fafc",
          cursor: "pointer", fontSize: 13,
          fontWeight: r.hasReacted ? 700 : 400,
          color: r.hasReacted ? "#4f46e5" : "#64748b",
          transition: "all 0.1s",
        }}>
          {r.emoji} <span style={{ fontSize: 11 }}>{r.count}</span>
        </button>
      ))}
      <button onClick={() => setShowPicker((p) => !p)} style={{
        width: 24, height: 24, borderRadius: 12,
        border: "1.5px solid #e2e8f0", background: "#f8fafc",
        cursor: "pointer", fontSize: 13, display: "flex",
        alignItems: "center", justifyContent: "center", color: "#94a3b8",
      }}>
        +
      </button>
      {showPicker && (
        <div ref={pickerRef} style={{
          position: "absolute", bottom: 30, left: 0, display: "flex", gap: 4,
          background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
          padding: "6px 8px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 20,
        }}>
          {QUICK_EMOJIS.map((e) => (
            <button key={e} onClick={() => toggle(e)} style={{
              fontSize: 20, background: "none", border: "none",
              cursor: "pointer", padding: "2px 4px", borderRadius: 6, lineHeight: 1,
            }}>
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Expire Timer ─────────────────────────────────────────

function ExpireTimer({ expiresAt }: { expiresAt: number }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.round((expiresAt - Date.now()) / 1000)));

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => {
      const r = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setRemaining(r);
      if (r <= 0) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [expiresAt, remaining]);

  if (remaining <= 0) return <span style={{ fontSize: 10, color: "#dc2626" }}>만료됨</span>;
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const color = remaining < 30 ? "#dc2626" : remaining < 60 ? "#d97706" : "#94a3b8";
  return (
    <span style={{ fontSize: 10, color, fontFeatureSettings: "'tnum'", display: "inline-flex", alignItems: "center", gap: 2 }}>
      <IconTimer size={10} /> {m > 0 ? `${m}분 ` : ""}{s}초
    </span>
  );
}

// ─── Message Bubble ───────────────────────────────────────

function MessageBubble({
  message, isOwn, isPinned, reactions, userId, sentiment,
  expiresAt, onPin, onUnpin, onReactionUpdate, onSetExpire, domRef,
}: {
  message: ChatMessage;
  isOwn: boolean;
  isPinned: boolean;
  reactions: ReactionGroup[];
  userId: string;
  sentiment?: SentimentResult;
  expiresAt?: number;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
  onReactionUpdate: (id: string, r: ReactionGroup[]) => void;
  onSetExpire: (id: string) => void;
  domRef?: (el: HTMLDivElement | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const time = new Date(message.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

  const bubbleBg = isOwn ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : message.role === "agent" ? "#f5f3ff" : "#fff";
  const bubbleBorder = isOwn ? "none" : message.role === "agent" ? "1px solid #ddd6fe" : "1px solid #e2e8f0";
  const textColor = isOwn ? "#fff" : message.role === "agent" ? "#5b21b6" : "#0f172a";

  return (
    <div
      ref={domRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: isOwn ? "row-reverse" : "row",
        alignItems: "flex-start", gap: 8, position: "relative",
      }}
    >
      <Avatar role={message.role} name={isOwn ? undefined : message.author} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: isOwn ? "flex-end" : "flex-start", maxWidth: "70%", gap: 2 }}>
        <span style={{ fontSize: 11, color: "#94a3b8", padding: isOwn ? "0 2px 0 0" : "0 0 0 2px", display: "flex", alignItems: "center", gap: 4 }}>
          {!isOwn && <>{message.author} · </>}{time}
          {isPinned && <span style={{ color: "#d97706", display: "inline-flex", alignItems: "center" }}><IconPin size={11} filled /></span>}
          {sentiment && <span title={`${sentiment.label} (${sentiment.keywords.join(", ") || "키워드 없음"})`}>{sentiment.emoji}</span>}
          {expiresAt && expiresAt > Date.now() && <ExpireTimer expiresAt={expiresAt} />}
        </span>
        <div style={{
          background: bubbleBg, border: bubbleBorder,
          borderRadius: 18,
          borderBottomRightRadius: isOwn ? 4 : 18,
          borderBottomLeftRadius: isOwn ? 18 : 4,
          padding: "10px 14px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: textColor, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {message.text}
          </p>
        </div>
        {(reactions.length > 0 || hovered) && (
          <ReactionBar
            messageId={message.id} userId={userId}
            reactions={reactions.map((r) => ({ ...r, hasReacted: r.users.includes(userId) }))}
            onUpdate={onReactionUpdate}
          />
        )}
      </div>

      {hovered && (
        <div style={{
          position: "absolute", top: 0,
          [isOwn ? "left" : "right"]: 0,
          display: "flex", gap: 4,
        }}>
          <button
            onClick={() => isPinned ? onUnpin(message.id) : onPin(message.id)}
            title={isPinned ? "핀 해제" : "메시지 고정"}
            style={{
              background: isPinned ? "#fef3c7" : "#fff",
              border: "1px solid #e2e8f0", borderRadius: 8,
              padding: "3px 8px", fontSize: 12, cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              color: isPinned ? "#d97706" : "#64748b",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <IconPin size={12} filled={isPinned} />
            {isPinned ? "해제" : "고정"}
          </button>
          <button
            onClick={() => onSetExpire(message.id)}
            title="만료 시간 설정"
            style={{
              background: "#fff", border: "1px solid #e2e8f0",
              borderRadius: 8, padding: "3px 8px", fontSize: 12,
              cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              color: "#64748b", display: "flex", alignItems: "center",
            }}
          >
            <IconTimer size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Pinned Banner ────────────────────────────────────────

function PinnedBanner({
  pinnedIds, messages, onUnpin, onScrollTo,
}: {
  pinnedIds: string[];
  messages: ChatMessage[];
  onUnpin: (id: string) => void;
  onScrollTo: (id: string) => void;
}) {
  if (pinnedIds.length === 0) return null;
  const pinned = pinnedIds.map((id) => messages.find((m) => m.id === id)).filter(Boolean) as ChatMessage[];
  return (
    <div style={{
      background: "#fffbeb", borderBottom: "1px solid #fde68a",
      padding: "8px 20px", display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", display: "flex", alignItems: "center", gap: 5 }}>
        <IconPin size={12} filled /> 고정된 메시지
      </div>
      {pinned.map((m) => (
        <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => onScrollTo(m.id)}
            style={{
              flex: 1, background: "none", border: "none", cursor: "pointer",
              textAlign: "left", padding: 0, fontSize: 12, color: "#78350f",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
          >
            <strong>{m.author}</strong>: {m.text.slice(0, 70)}{m.text.length > 70 ? "…" : ""}
          </button>
          <button onClick={() => onUnpin(m.id)} style={{
            background: "none", border: "none", cursor: "pointer", color: "#d97706", fontSize: 16, flexShrink: 0,
          }}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Summary Modal ────────────────────────────────────────

type SummaryData = { summary: string; messageCount: number; cachedUntil: string };

function SummaryModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SummaryData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/chat/summary?roomId=${ROOM_ID}`)
      .then((r) => r.json())
      .then((d: SummaryData & { error?: string }) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 16, padding: 24,
        maxWidth: 480, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", display: "flex", alignItems: "center", gap: 7 }}>
            <IconBot size={18} /> AI 대화 요약
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#94a3b8", lineHeight: 1 }}>×</button>
        </div>
        {loading && <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>요약 생성 중...</div>}
        {err && <div style={{ color: "#dc2626", fontSize: 14 }}>오류: {err}</div>}
        {data && (
          <>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "#334155", margin: "0 0 16px" }}>{data.summary}</p>
            <div style={{ fontSize: 11, color: "#94a3b8", borderTop: "1px solid #f1f5f9", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <IconFileText size={11} /> {data.messageCount}개 메시지 기준
              </span>
              <span>캐시 만료 {new Date(data.cachedUntil).toLocaleTimeString("ko-KR")}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Suggest Panel ────────────────────────────────────────

function SuggestPanel({
  onSelect, onClose,
}: {
  onSelect: (text: string) => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [basedOn, setBasedOn] = useState("");

  useEffect(() => {
    fetch(`/api/chat/suggest?roomId=${ROOM_ID}`)
      .then((r) => r.json())
      .then((d: { suggestions?: Suggestion[]; basedOn?: string }) => {
        setSuggestions(d.suggestions ?? []);
        setBasedOn(d.basedOn ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{
      margin: "0 20px 8px", background: "#f0fdf4",
      border: "1.5px solid #86efac", borderRadius: 14, padding: 14,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: "#166534", display: "flex", alignItems: "center", gap: 5 }}>
          <IconSparkles size={14} /> AI 답변 제안
        </span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      {basedOn && (
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, fontStyle: "italic" }}>
          "{basedOn}" 기반
        </div>
      )}
      {loading ? (
        <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>제안 생성 중...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => { onSelect(s.text); onClose(); }}
              style={{
                textAlign: "left", padding: "8px 12px", borderRadius: 10,
                border: "1px solid #d1fae5", background: "#fff",
                cursor: "pointer", fontSize: 13, color: "#0f172a",
                display: "flex", alignItems: "flex-start", gap: 8,
                transition: "background 0.1s",
              }}
            >
              <span style={{
                flexShrink: 0, fontSize: 10, fontWeight: 700,
                color: "#fff", background: SUGGESTION_TONE_COLOR[s.tone],
                borderRadius: 4, padding: "2px 5px", marginTop: 2,
              }}>
                {SUGGESTION_TONE_LABEL[s.tone]}
              </span>
              <span>{s.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Slow Mode Banner ─────────────────────────────────────

function SlowModeBanner({
  intervalSeconds, retryAfter,
}: {
  intervalSeconds: SlowModeSeconds;
  retryAfter?: number;
}) {
  if (intervalSeconds === 0) return null;
  return (
    <div style={{
      margin: "0 20px 6px", padding: "7px 14px",
      background: "#fffbeb", border: "1px solid #fde68a",
      borderRadius: 10, fontSize: 12, color: "#92400e",
      display: "flex", alignItems: "center", gap: 6,
    }}>
      <IconClock size={13} />
      <span>느린 모드</span>
      <span style={{ color: "#b45309" }}>
        {retryAfter && retryAfter > 0
          ? `${retryAfter}초 후에 전송 가능`
          : `메시지 간 ${intervalSeconds}초 간격 필요`}
      </span>
    </div>
  );
}

// ─── Expire Modal ─────────────────────────────────────────

const EXPIRE_OPTIONS = [
  { label: "30초", value: 30 },
  { label: "1분", value: 60 },
  { label: "5분", value: 300 },
  { label: "10분", value: 600 },
  { label: "1시간", value: 3600 },
] as const;

function ExpireModal({
  messageId, onSet, onCancel,
}: {
  messageId: string;
  onSet: (id: string, expiresAt: number) => void;
  onCancel: () => void;
}) {
  const [seconds, setSeconds] = useState<number>(30);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    const res = await fetch("/api/chat/expire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, expireInSeconds: seconds }),
    });
    setSubmitting(false);
    if (res.ok) {
      const data = await res.json();
      onSet(messageId, new Date(data.expiresAt).getTime());
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 16, padding: 24,
        maxWidth: 360, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
      }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
          <IconTimer size={16} /> 메시지 만료 시간 설정
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {EXPIRE_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setSeconds(o.value)}
              style={{
                padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${seconds === o.value ? "#4f46e5" : "#e2e8f0"}`,
                background: seconds === o.value ? "#eef2ff" : "#f8fafc",
                color: seconds === o.value ? "#4f46e5" : "#64748b",
                fontSize: 13, fontWeight: seconds === o.value ? 700 : 400, cursor: "pointer",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer" }}>
            취소
          </button>
          <button onClick={submit} disabled={submitting} style={{
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: "#4f46e5", color: "#fff", fontSize: 13, fontWeight: 600,
            cursor: "pointer", opacity: submitting ? 0.6 : 1,
          }}>
            {submitting ? "설정 중..." : "설정"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Poll Form ────────────────────────────────────────────

function PollForm({
  userId, onCreated, onClose,
}: {
  userId: string;
  onCreated: (poll: Poll) => void;
  onClose: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [anonymous, setAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!question.trim() || options.some((o) => !o.trim())) return;
    setSubmitting(true);
    const res = await fetch("/api/chat/poll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: ROOM_ID, question: question.trim(), options: options.map((o) => o.trim()), anonymous, createdBy: userId }),
    });
    setSubmitting(false);
    if (res.ok) { onCreated(await res.json()); onClose(); }
  };

  return (
    <div style={{
      margin: "0 20px 12px", background: "#f8faff",
      border: "1.5px solid #c7d2fe", borderRadius: 14, padding: 16,
    }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: "#3730a3", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IconBarChart size={15} /> 투표 만들기
        </span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      <input
        value={question} onChange={(e) => setQuestion(e.target.value)}
        placeholder="투표 질문 입력..."
        style={{
          width: "100%", border: "1px solid #e0e7ff", borderRadius: 8,
          padding: "7px 10px", fontSize: 13, marginBottom: 8, boxSizing: "border-box", outline: "none",
        }}
      />
      {options.map((o, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <input
            value={o} onChange={(e) => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
            placeholder={`옵션 ${i + 1}`}
            style={{ flex: 1, border: "1px solid #e0e7ff", borderRadius: 8, padding: "6px 10px", fontSize: 13, outline: "none" }}
          />
          {options.length > 2 && (
            <button onClick={() => setOptions(options.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18 }}>×</button>
          )}
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {options.length < 6 && (
            <button onClick={() => setOptions([...options, ""])} style={{ fontSize: 12, color: "#6366f1", background: "none", border: "1px solid #c7d2fe", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>
              + 옵션 추가
            </button>
          )}
          <label style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            익명
          </label>
        </div>
        <button
          onClick={submit}
          disabled={submitting || !question.trim() || options.some((o) => !o.trim())}
          style={{
            padding: "6px 16px", borderRadius: 8, border: "none",
            background: "#4f46e5", color: "#fff", fontSize: 13, fontWeight: 600,
            cursor: "pointer", opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? "생성 중..." : "만들기"}
        </button>
      </div>
    </div>
  );
}

// ─── Poll Card ────────────────────────────────────────────

function PollCard({ poll, userId, onVote }: { poll: Poll; userId: string; onVote: (p: Poll) => void }) {
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);
  const total = poll.options.reduce((s, o) => s + o.votes, 0);

  const vote = async (optionIndex: number) => {
    if (voting || voted) return;
    setVoting(true);
    const res = await fetch("/api/chat/poll", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollId: poll.id, optionIndex, userId }),
    });
    setVoting(false);
    if (res.ok) { setVoted(true); onVote((await res.json()).poll); }
  };

  return (
    <div style={{ background: "#f8faff", border: "1.5px solid #c7d2fe", borderRadius: 14, padding: "14px 16px", maxWidth: "70%" }}>
      <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
        <IconBarChart size={12} /> 투표{poll.anonymous ? " · 익명" : ""}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e1b4b", marginBottom: 10 }}>{poll.question}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {poll.options.map((opt, i) => {
          const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
          return (
            <button key={i} onClick={() => vote(i)} disabled={voting || voted} style={{
              position: "relative", textAlign: "left",
              border: "1px solid #e0e7ff", borderRadius: 8,
              padding: "8px 12px", background: "#fff",
              cursor: voted ? "default" : "pointer",
              overflow: "hidden", fontSize: 13,
            }}>
              <div style={{
                position: "absolute", inset: 0, background: "#eef2ff",
                width: `${pct}%`, borderRadius: 8, transition: "width 0.4s",
              }} />
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#3730a3" }}>{opt.text}</span>
                <span style={{ color: "#818cf8", fontWeight: 700 }}>{pct}%</span>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>총 {total}표</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────

export default function HomePageClient() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshotLimit, setSnapshotLimit] = useState(50);
  const [showSummary, setShowSummary] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [expireTimes, setExpireTimes] = useState<Record<string, number>>({});
  const [expireModalId, setExpireModalId] = useState<string | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [showSlowModeMenu, setShowSlowModeMenu] = useState(false);

  const { sentiments, analyze } = useSentiment();
  const { reactions, update: updateReaction } = useReactions();
  const { pinnedIds, load: loadPins, pin: pinMessage, unpin: unpinMessage } = usePinnedMessages(ROOM_ID);
  const { polls, setPolls, load: loadPolls } = usePolls(ROOM_ID);
  const { intervalSeconds: slowModeInterval, retryAfter: slowRetryAfter, setMode: setSlowMode, startRetryCountdown } = useSlowMode(ROOM_ID, session);

  const { messages, connected } = useChat(session, ROOM_ID, snapshotLimit, analyze);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const msgRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const slowModeMenuRef = useRef<HTMLDivElement>(null);

  // 마운트 후 세션 로드 (SSR hydration mismatch 방지)
  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, polls]);

  // 느린 모드 메뉴 외부 클릭 닫기
  useEffect(() => {
    if (!showSlowModeMenu) return;
    const handler = (e: MouseEvent) => {
      if (slowModeMenuRef.current && !slowModeMenuRef.current.contains(e.target as Node)) {
        setShowSlowModeMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSlowModeMenu]);

  useEffect(() => { if (session) { loadPins(); loadPolls(); } }, [session]);

  const scrollToMessage = (id: string) => {
    msgRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleExpireSet = (id: string, expiresAt: number) => {
    setExpireTimes((prev) => ({ ...prev, [id]: expiresAt }));
    setExpireModalId(null);
  };

  const handlePin = async (messageId: string) => {
    const err = await pinMessage(messageId);
    if (err) setError(err);
  };

  async function sendMessage() {
    const trimmed = text.trim();
    if (!trimmed || sending || trimmed.length > 500 || !session) return;

    setSending(true); setError(null);
    try {
      const r = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, userId: session.email }),
      });
      if (!r.ok) {
        const errData = await r.json().catch(() => ({})) as { retryAfterSeconds?: number; error?: string };
        if (errData.retryAfterSeconds) startRetryCountdown(errData.retryAfterSeconds);
        setError(errData.error ?? "전송 실패");
        return;
      }
      setText(""); inputRef.current?.focus();
    } finally { setSending(false); }
  }

  const remainingChars = 500 - text.length;
  const isOverLimit = remainingChars < 0;
  const canSend = text.trim().length > 0 && !sending && !isOverLimit && !!session && slowRetryAfter === 0;

  if (!session) {
    return (
      <LoginScreen
        title="Mandu Chat"
        description="로그인 후 실시간 AI 채팅 데모를 사용할 수 있습니다."
        onLogin={(s) => setSession(s)}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", maxWidth: 760, margin: "0 auto" }}>

      {/* 헤더 */}
      <header style={{
        backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0",
        padding: "0 20px", height: 60, display: "flex", alignItems: "center",
        justifyContent: "space-between", flexShrink: 0,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IconMandu size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Mandu Chat</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
              <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", backgroundColor: connected ? "#22c55e" : "#f59e0b" }} />
              <span style={{ color: connected ? "#16a34a" : "#d97706", fontWeight: 500 }}>
                {connected ? "실시간 연결됨" : "연결 중..."}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => setShowSummary(true)} title="AI 대화 요약" style={{
            padding: "6px 10px", borderRadius: 8, border: "1px solid #e0e7ff",
            background: "#eef2ff", color: "#4f46e5", fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <IconBot size={14} /> 요약
          </button>

          <button onClick={() => setShowPollForm((p) => !p)} title="투표 만들기" style={{
            padding: "6px 10px", borderRadius: 8, border: "1px solid #e0e7ff",
            background: showPollForm ? "#c7d2fe" : "#eef2ff", color: "#4f46e5",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <IconBarChart size={14} /> 투표
          </button>

          <div style={{ position: "relative" }} ref={slowModeMenuRef}>
            <button
              onClick={() => setShowSlowModeMenu((p) => !p)}
              title="느린 모드 설정"
              style={{
                padding: "6px 10px", borderRadius: 8, border: "1px solid #e0e7ff",
                background: slowModeInterval > 0 ? "#fef3c7" : "#eef2ff",
                color: slowModeInterval > 0 ? "#92400e" : "#4f46e5",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <IconClock size={14} />
              {slowModeInterval > 0 ? `${slowModeInterval}s` : "느린모드"}
            </button>
            {showSlowModeMenu && (
              <div style={{
                position: "absolute", top: "100%", right: 0, marginTop: 4,
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 30, padding: 8, minWidth: 140,
              }}>
                <div style={{ fontSize: 11, color: "#94a3b8", padding: "4px 8px 8px", fontWeight: 600 }}>메시지 간격</div>
                {SLOW_MODE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setShowSlowModeMenu(false); void setSlowMode(s); }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "7px 10px", borderRadius: 8, border: "none",
                      background: slowModeInterval === s ? "#eef2ff" : "none",
                      color: slowModeInterval === s ? "#4f46e5" : "#374151",
                      fontSize: 13, fontWeight: slowModeInterval === s ? 700 : 400,
                      cursor: "pointer",
                    }}
                  >
                    {s === 0 ? "끄기" : `${s}초`}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "#e0e7ff", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#4f46e5",
          }}>
            {session.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.4 }}>
            <div style={{ fontWeight: 600, color: "#0f172a" }}>{session.name}</div>
            <div style={{ color: "#94a3b8", fontSize: 11 }}>{session.email}</div>
          </div>
          <button
            onClick={() => { clearStoredSession(); setSession(null); setText(""); }}
            style={{
              padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0",
              background: "#fff", color: "#64748b", fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}
          >
            로그아웃
          </button>
        </div>
      </header>

      <PinnedBanner
        pinnedIds={pinnedIds}
        messages={messages}
        onUnpin={unpinMessage}
        onScrollTo={scrollToMessage}
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && polls.length === 0 ? (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 12,
            color: "#94a3b8", textAlign: "center", padding: "40px 20px",
          }}>
            <IconMessageCircle size={48} />
            <div style={{ fontWeight: 600, fontSize: 16, color: "#64748b" }}>대화를 시작해보세요</div>
            <div style={{ fontSize: 13 }}>메시지를 보내거나 투표를 만들어보세요</div>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                isOwn={m.role === "user"}
                isPinned={pinnedIds.includes(m.id)}
                reactions={reactions[m.id] ?? []}
                userId={session.email}
                sentiment={sentiments[m.id]}
                expiresAt={expireTimes[m.id]}
                onPin={handlePin}
                onUnpin={unpinMessage}
                onReactionUpdate={(id, r) => updateReaction(id, r)}
                onSetExpire={(id) => setExpireModalId(id)}
                domRef={(el) => { msgRefs.current[m.id] = el; }}
              />
            ))}
            {polls.map((poll) => (
              <div key={poll.id} style={{ display: "flex", justifyContent: "flex-start" }}>
                <PollCard
                  poll={poll}
                  userId={session.email}
                  onVote={(updated) => setPolls((prev) => prev.map((p) => p.id === updated.id ? updated : p))}
                />
              </div>
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div style={{
          margin: "0 20px 8px", padding: "10px 14px",
          background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 10, fontSize: 13, color: "#dc2626",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <IconAlertTriangle size={14} /> {error}
          </span>
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      )}

      <SlowModeBanner intervalSeconds={slowModeInterval} retryAfter={slowRetryAfter} />

      {showSuggest && (
        <SuggestPanel
          onSelect={(t) => { setText(t); inputRef.current?.focus(); }}
          onClose={() => setShowSuggest(false)}
        />
      )}

      {showPollForm && (
        <PollForm
          userId={session.email}
          onCreated={(poll) => { setPolls((prev) => [...prev, poll]); }}
          onClose={() => setShowPollForm(false)}
        />
      )}

      <div style={{ backgroundColor: "#fff", borderTop: "1px solid #e2e8f0", padding: "12px 20px 16px", flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "flex-end", gap: 10,
          background: "#f8fafc", border: "1.5px solid #e2e8f0",
          borderRadius: 16, padding: "10px 14px",
        }}>
          <button
            onClick={() => setShowSuggest((p) => !p)}
            title="AI 답변 제안"
            style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: 8,
              border: `1.5px solid ${showSuggest ? "#86efac" : "#e2e8f0"}`,
              background: showSuggest ? "#f0fdf4" : "#fff",
              color: showSuggest ? "#16a34a" : "#94a3b8",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconSparkles size={15} />
          </button>
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.key === "Enter" && !e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key === "Enter")) {
                e.preventDefault(); void sendMessage();
              }
            }}
            placeholder={slowRetryAfter > 0 ? `느린 모드: ${slowRetryAfter}초 후 전송 가능` : "메시지 입력 (Enter 전송, Shift+Enter 줄바꿈)"}
            rows={1}
            disabled={slowRetryAfter > 0}
            style={{
              flex: 1, border: "none", outline: "none", background: "transparent",
              fontSize: 14, color: slowRetryAfter > 0 ? "#94a3b8" : "#0f172a",
              resize: "none", lineHeight: 1.5,
              maxHeight: 120, overflowY: "auto", fontFamily: "inherit",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: isOverLimit ? "#dc2626" : "#94a3b8", fontWeight: isOverLimit ? 600 : 400, minWidth: 48, textAlign: "right" }}>
              {remainingChars}/500
            </span>
            <button
              onClick={() => void sendMessage()} disabled={!canSend}
              style={{
                width: 36, height: 36, borderRadius: 10, border: "none",
                background: canSend ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "#e2e8f0",
                color: canSend ? "#fff" : "#94a3b8", cursor: canSend ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {sending ? <span style={{ fontSize: 12, fontWeight: 600 }}>...</span> : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
            style={{ fontSize: 11, color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 6, padding: "2px 6px", background: "#fff", cursor: "pointer" }}
          >
            <option value={20}>20개</option>
            <option value={50}>50개</option>
            <option value={100}>100개</option>
          </select>
          <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>
            총 {messages.length}개 메시지 · 투표 {polls.length}개
          </span>
        </div>
      </div>

      {showSummary && <SummaryModal onClose={() => setShowSummary(false)} />}

      {expireModalId && (
        <ExpireModal
          messageId={expireModalId}
          onSet={handleExpireSet}
          onCancel={() => setExpireModalId(null)}
        />
      )}
    </div>
  );
}
