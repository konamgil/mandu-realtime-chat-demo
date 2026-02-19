/**
 * Home Page SSR shell
 *
 * SSR에서는 session 여부를 알 수 없으므로 null(빈 화면)을 렌더링.
 * 클라이언트 hydration 후 즉시 localStorage 확인 → FOUC 없음.
 */

import HomePageIsland from "./page.island";
import HomePageClient from "./page.client";

void HomePageIsland; // island 등록 유지

export default function HomePage() {
  return <HomePageClient />;
}
