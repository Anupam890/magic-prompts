"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Download,
  Sparkles,
  Zap,
  CheckCircle2,
  Globe,
  Layers,
  ArrowRight,
  Shield,
  Heart,
  Cpu,
  Laptop,
  Check,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { toast } from "sonner";

export default function AboutPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Listen for PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if already running in standalone PWA mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast.success("Thank you for installing Magic Prompts!");
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isInstalled) {
      toast.info("Magic Prompts App is already installed on your device!");
    } else {
      // Direct instructions fallback
      toast.info("Install Magic Prompts as App", {
        description: "Click the browser menu (⋮ or ⬆) and select 'Install Magic Prompts' or 'Add to Home Screen'.",
      });
    }
  };

  const STATS = [
    { value: "10,000+", label: "Curated AI Prompts", icon: Sparkles },
    { value: "15+", label: "AI Models Supported", icon: Cpu },
    { value: "50k+", label: "Active Creators", icon: Globe },
    { value: "99.9%", label: "Verified Quality", icon: CheckCircle2 },
  ];

  const FEATURES = [
    {
      title: "Hand-Crafted Lighting & Style Triggers",
      desc: "Every prompt in our library is tested for volumetric lighting, 8k textures, and precise camera composition.",
      icon: Zap,
    },
    {
      title: "Pinterest-Style Personal Collections",
      desc: "Save your favorite prompts and organize them into visual boards for quick access during creative workflows.",
      icon: Layers,
    },
    {
      title: "Universal Model Compatibility",
      desc: "Optimized prompt structures for Midjourney V6, Flux.1, DALL-E 3, Stable Diffusion XL, and Leonardo AI.",
      icon: Cpu,
    },
    {
      title: "Community & Admin Moderation",
      desc: "Submit your own visual prompts. Every submission is reviewed by expert moderators to maintain high quality.",
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-purple-500/30">
      <Nav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-28 pb-20 space-y-20">
        {/* -------------------------------------------------------------
            HERO SHOWCASE SECTION
            ------------------------------------------------------------- */}
        <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-6">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-purple-400 border border-purple-500/20 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>About Magic Prompts</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
            Empowering Creators to Master <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-fuchsia-400">
              AI Image Generation
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Magic Prompts is the world’s premier open library of curated, production-ready AI image prompts. We help designers, artists, and marketers turn ideas into breathtaking visual masterpieces.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/#gallery"
              className="inline-flex items-center gap-2 rounded-2xl bg-white text-black font-bold text-sm px-6 py-3.5 hover:bg-white/90 transition shadow-xl hover:scale-[1.02]"
            >
              <span>Explore Prompt Library</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              onClick={handleInstallApp}
              className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm px-6 py-3.5 shadow-xl shadow-purple-900/30 transition hover:scale-[1.02] cursor-pointer"
            >
              <Download className="h-4.5 w-4.5" />
              <span>{isInstalled ? "App Installed" : "Install App"}</span>
            </button>
          </div>
        </section>

        {/* -------------------------------------------------------------
            STATS COUNTERS SECTION
            ------------------------------------------------------------- */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="relative overflow-hidden rounded-3xl glass p-6 border border-black/5 dark:border-white/10 text-center space-y-2"
              >
                <div className="h-10 w-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-display text-3xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
              </div>
            );
          })}
        </section>

        {/* -------------------------------------------------------------
            PLATFORM FEATURES GRID
            ------------------------------------------------------------- */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Why Creators Choose Magic Prompts</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Everything you need to craft high-impact AI imagery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-3xl glass p-8 border border-black/5 dark:border-white/10 hover:border-purple-500/40 transition space-y-4"
                >
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-900/30">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* -------------------------------------------------------------
            PWA INSTALL APP BANNER SECTION
            ------------------------------------------------------------- */}
        <section className="relative overflow-hidden rounded-3xl glass p-8 md:p-12 border border-purple-500/30 shadow-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-background">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 text-xs font-semibold">
                <Laptop className="h-3.5 w-3.5" />
                <span>Progressive Web App</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                Install Magic Prompts directly on your device
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Enjoy instant access, offline library support, and single-click prompt copying right from your desktop or phone home screen.
              </p>
            </div>

            <div className="shrink-0">
              <button
                onClick={handleInstallApp}
                className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base px-8 py-4 shadow-2xl shadow-purple-900/40 transition hover:scale-105 cursor-pointer"
              >
                <Download className="h-5 w-5" />
                <span>{isInstalled ? "App Installed ✓" : "Install App Now"}</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
