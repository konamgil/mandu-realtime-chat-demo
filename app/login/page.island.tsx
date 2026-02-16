"use client";

import { useEffect } from "react";
import LoginScreen from "../components/login-screen";
import { getStoredSession } from "../lib/auth";

// NOTE: *.island.tsx 는 hydration clientModule 엔트리입니다.
// 여기서는 React 컴포넌트를 직접 export 해야 SSR/runtime 타입 불일치가 나지 않습니다.
export default function LoginPageIsland() {
  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      window.location.replace("/");
    }
  }, []);

  return <LoginScreen />;
}
