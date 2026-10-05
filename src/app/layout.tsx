import type { Metadata } from "next";
import { Providers } from "./providers";
import { AdsterraGlobalLoader } from "@/components/adsterra-global-loader";
import "../styles.css";

export const metadata: Metadata = {
  title: "Magic Prompts — Nano Banana Prompts & AI Image Generation Prompts",
  description: "Discover curated Nano Banana prompts, Midjourney, ChatGPT DALL-E 3, and Stable Diffusion prompts for photorealistic AI image generation.",
  keywords: [
    "Nano Banana prompts",
    "AI image prompts",
    "ChatGPT image generation prompts",
    "Midjourney prompts",
    "DALL-E 3 prompts",
    "Stable Diffusion prompts",
    "AI art prompt generator",
    "photorealistic prompts",
    "AI prompts library",
  ],
  authors: [{ name: "Magic Prompts Team" }],
  openGraph: {
    title: "Magic Prompts — Nano Banana Prompts & AI Image Prompts",
    description: "Explore thousands of high-converting Nano Banana, ChatGPT DALL-E 3, and Midjourney prompts for stunning AI image generation.",
    siteName: "Magic Prompts",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Magic Prompts — Nano Banana Prompts & AI Image Generation Prompts",
    description: "Curated Nano Banana prompts & ChatGPT DALL-E 3 prompts for creators and designers.",
  },
};

import { AnnouncementBanner } from "@/components/announcement-banner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth overflow-x-hidden">
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
        {/* Monetag Vignette Banner Script (Zone 11962668) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(s){s.dataset.zone='11962668',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (var r of registrations) { r.unregister(); }
                  });
                } else {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').catch(function(err) {});
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body className="antialiased bg-background text-foreground overflow-x-hidden min-h-screen">
        <Providers>
          <AnnouncementBanner />
          {children}
        </Providers>
        <AdsterraGlobalLoader />
      </body>
    </html>
  );
}
