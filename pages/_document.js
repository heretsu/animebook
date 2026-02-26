import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  const setInitialTheme = `
    (function() {
      const darkMode = localStorage.getItem('darkmode') === 'true';
      if (darkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.backgroundColor = '#17181C';
      } else {
        document.documentElement.style.backgroundColor = '#F9F9F9';
      }
    })();
  `;

  return (
    <Html lang="en">
      <Head>
      <meta name="google-site-verification" content="PFe637jZ9zptxTqThdZGSE89b5GDyv0HpZqWB6zrOts" />
        <meta
          name="description"
          content="Discover anime creators, watch live streams, and share your anime journey on Animebook."
        />
        <meta property="og:site_name" content="Animebook" />
        <meta
          property="og:image"
          content="https://animebook.io/og-default.png"
        />
        <meta name="twitter:site" content="@animebook" />
        <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
