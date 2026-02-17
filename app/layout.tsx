/**
 * Root Layout
 *
 * NOTE: Mandu의 renderToHTML이 이미 <html><head><body> 구조를 생성하므로
 * layout.tsx에서 중복 HTML 태그를 사용하면 이중 중첩 버그가 발생합니다.
 * Issue: https://github.com/konamgil/mandu/issues/109
 */

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return <>{children}</>;
}
