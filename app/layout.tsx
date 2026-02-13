/**
 * Root Layout (Minimal)
 */

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>mandu-chat-demo</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
