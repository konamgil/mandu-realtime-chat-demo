"use client";

import HomePageClient from "./page.client";

// NOTE: *.island.tsx 는 hydration clientModule 엔트리입니다.
// 여기서는 React 컴포넌트를 직접 export 해야 SSR/runtime 타입 불일치가 나지 않습니다.
export default HomePageClient;
