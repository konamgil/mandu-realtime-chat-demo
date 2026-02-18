/**
 * Login Page SSR
 *
 * LoginScreen을 서버에서도 동일하게 렌더링해 hydration 초기 DOM 불일치를 방지합니다.
 */

import LoginPageIsland from "./page.island";

export default function LoginPage() {
  return <LoginPageIsland />;
}
