"use client";

import { useState } from "react";
import { DEMO_ACCOUNTS, authenticate, persistSession, type AuthSession } from "../lib/auth";

type LoginScreenProps = {
  title?: string;
  description?: string;
  onLogin?: (session: AuthSession) => void;
};

export default function LoginScreen({
  title = "🥟 Mandu Chat",
  description = "로그인 후 실시간 AI 채팅 데모를 사용할 수 있습니다.",
  onLogin,
}: LoginScreenProps) {
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0]?.email ?? "");
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0]?.password ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      const session = authenticate(email, password);
      setLoading(false);

      if (!session) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      persistSession(session);
      onLogin?.(session);

      if (!onLogin) {
        window.location.href = "/";
      }
    }, 400);
  }

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(135deg, #ede9fe 0%, #e0e7ff 50%, #f0f9ff 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* 로고 영역 */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64,
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            borderRadius: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32,
            margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(79,70,229,0.3)",
          }}>🥟</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>{title}</h1>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 8, marginBottom: 0 }}>{description}</p>
        </div>

        {/* 카드 */}
        <div style={{
          background: "#fff",
          borderRadius: 20,
          padding: 32,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
          border: "1px solid rgba(255,255,255,0.8)",
        }}>
          {/* 테스트 계정 안내 */}
          <div style={{
            background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
            border: "1px solid #ddd6fe",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#7c3aed", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <span>💡</span> 테스트 계정
            </div>
            <div style={{ fontSize: 12, color: "#6d28d9", lineHeight: 1.8 }}>
              <div>이메일: <code style={{ background: "#fff", padding: "1px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 11 }}>{DEMO_ACCOUNTS[0].email}</code></div>
              <div>비밀번호: <code style={{ background: "#fff", padding: "1px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 11 }}>{DEMO_ACCOUNTS[0].password}</code></div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* 이메일 입력 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@mandu.dev"
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize: 14,
                  color: "#0f172a",
                  outline: "none",
                  transition: "border-color 0.15s",
                  boxSizing: "border-box",
                  background: "#fafafa",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.background = "#fff"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#fafafa"; }}
              />
            </div>

            {/* 비밀번호 입력 */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize: 14,
                  color: "#0f172a",
                  outline: "none",
                  transition: "border-color 0.15s",
                  boxSizing: "border-box",
                  background: "#fafafa",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.background = "#fff"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#fafafa"; }}
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div style={{
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 10,
                fontSize: 13,
                color: "#dc2626",
                marginBottom: 16,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                border: "none",
                background: loading ? "#a5b4fc" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 12px rgba(79,70,229,0.3)",
                transition: "all 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {loading ? (
                <>
                  <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                  로그인 중...
                </>
              ) : "로그인"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 20 }}>
          Mandu Framework · Real-time Chat Demo
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
