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
