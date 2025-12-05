import React from 'react';

export default function Index() {
  return (
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>FRUM Onboarding</title>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --bg-main: #000000; --text-primary: #ffffff; --accent-color: #E70012; --font-main: 'Pretendard', sans-serif; }
          body { margin: 0; background-color: var(--bg-main); color: var(--text-primary); font-family: var(--font-main); }
        `}} />
      </head>
      <body>
        <div id="root"></div>
        {/* ▼ 점(.) 필수 확인 */}
        <script type="module" src="/src/index.tsx"></script>
      </body>
    </html>
  );
}