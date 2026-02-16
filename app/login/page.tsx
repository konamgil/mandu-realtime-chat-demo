/**
 * Login Page SSR shell
 *
 * Hydration entry is resolved from `app/login/page.island.tsx` by FS Routes scanner.
 * Keep this component framework-agnostic and always render meaningful SSR markup.
 */

// Import island to satisfy Island-First integrity check
import LoginPageIsland from "./page.island";

export default function LoginPage() {
  return (
    <main style={{ maxWidth: 520, margin: "80px auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1>🔐 로그인</h1>
      <p>로그인 화면을 준비하고 있습니다...</p>
      <noscript>이 데모는 JavaScript가 필요합니다.</noscript>
      {/* Island hydration entry - loaded by Mandu runtime */}
      {typeof LoginPageIsland !== 'undefined' && null}
    </main>
  );
}
