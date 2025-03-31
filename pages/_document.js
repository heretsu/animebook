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
        <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
