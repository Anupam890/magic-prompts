import type { Metadata } from "next";
import { Providers } from "./providers";
import { AdsterraGlobalLoader } from "@/components/adsterra-global-loader";
import "../styles.css";

export const metadata: Metadata = {
  title: "Magic Prompts — Discover. Copy. Create.",
  description: "The ultimate library of premium AI image prompts.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Magic Prompts — Discover. Copy. Create.",
    description: "The ultimate library of premium AI image prompts.",
    siteName: "Magic Prompts",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&f[]=satoshi@400,500,700&display=swap"
        />
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
        <AdsterraGlobalLoader />
      </body>
    </html>
  );
}
