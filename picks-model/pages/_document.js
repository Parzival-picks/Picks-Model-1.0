import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Modelo estadístico de predicción de fútbol basado en Dixon-Coles. Mundial 2026." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>
      <body style={{ margin: 0, padding: 0, background: "#050d1a" }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
