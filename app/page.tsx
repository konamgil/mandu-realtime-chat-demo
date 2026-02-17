/**
 * Home Page SSR shell
 *
 * HomePageClient를 직접 SSR 렌더링하여 클라이언트 hydration과 DOM 구조를 일치시킴.
 * Hydration entry is resolved from `app/page.island.tsx` by FS Routes scanner.
 */

// Island 등록을 위한 import (Mandu island 무결성 체크)
import HomePageIsland from "./page.island";
import HomePageClient from "./page.client";

export default function HomePage() {
  // HomePageClient를 SSR로 렌더링 → 클라이언트 hydrateRoot와 동일한 DOM 구조 생성
  // (session=null이므로 LoginScreen이 렌더링됨, 클라이언트 초기 render와 일치)
  void HomePageIsland; // island 등록 유지
  return <HomePageClient />;
}
