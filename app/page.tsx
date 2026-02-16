/**
 * Home Page SSR shell
 *
 * Hydration entry is resolved from `app/page.island.tsx` by FS Routes scanner.
 * Keep this component framework-agnostic and always render meaningful SSR markup.
 */
export default function HomePage() {
  return (
    <main style={{ maxWidth: 520, margin: "80px auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1>🥟 Mandu Chat Demo</h1>
      <p>로그인 화면을 준비하고 있습니다...</p>
      <noscript>이 데모는 JavaScript가 필요합니다.</noscript>
    </main>
  );
}
