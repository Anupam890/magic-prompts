"use client";

import { useState } from "react";
import {
  ArrowRight,
  Search,
  Sparkles,
  TrendingUp,
  Copy,
  Check,
  Flame,
  Wand2,
  Scan,
  Compass,
  Heart,
  Camera,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import Link from "next/link";
import { AuroraBg } from "./aurora-bg";

import heroImg from "@/assets/hero.jpg";
import p12Img from "@/assets/p12.jpg";
import p1Img from "@/assets/p1.jpg";

interface ShowcasePrompt {
  id: string;
  title: string;
  badge: string;
  model: string;
  category: string;
  aspect: string;
  engineParams: string;
  prompt: string;
  image: any;
  likes: string;
  copies: string;
  lighting: string;
}

const SHOWCASE_PROMPTS: ShowcasePrompt[] = [
  {
    id: "samurai",
    title: "Cyberpunk Neon Samurai",
    badge: "✦ Featured Masterpiece",
    model: "Midjourney v6.1",
    category: "Character Design",
    aspect: "16:9",
    engineParams: "--ar 16:9 --v 6.1 --stylize 250",
    prompt:
      "Cyberpunk neon samurai standing in heavy torrential rain, glowing holographic visor, intricate carbon-fiber armor, reflections of neon Tokyo billboards, volumetric rim light, 85mm anamorphic cinematic bokeh, hyper-detailed 8k octane render",
    image: p12Img,
    likes: "2,840",
    copies: "14.2k",
    lighting: "Anamorphic 85mm Rim Light",
  },
  {
    id: "cosmic",
    title: "Cosmic Crystal Starlight Sphere",
    badge: "★ Editor's Choice",
    model: "FLUX.1 [dev]",
    category: "Visual Effects",
    aspect: "1:1",
    engineParams: "--steps 35 --guidance 4.5",
    prompt:
      "Macro studio photograph of a levitating iridescent crystal sphere containing a swirling purple and magenta nebula, internal refraction, chromatic aberration, micro stardust particles, dark velvet backdrop, pristine 8k depth of field",
    image: heroImg,
    likes: "3,120",
    copies: "18.5k",
    lighting: "Studio Softbox & Micro Refraction",
  },
  {
    id: "watch",
    title: "Royal Gold Chronograph",
    badge: "⚡ Commercial Ready",
    model: "ChatGPT DALL-E 3",
    category: "E-commerce",
    aspect: "4:5",
    engineParams: "--quality hd --vivid",
    prompt:
      "High-end commercial product photography of an 18k solid gold luxury chronograph watch resting on black vein marble, crisp water droplet reflections, golden hour warm rim illumination, commercial advertising grade, 100mm macro f/2.8",
    image: p1Img,
    likes: "1,950",
    copies: "9.8k",
    lighting: "Dual Diffused Studio Light",
  },
];

const TRENDING_PILLS = [
  { label: "Cyberpunk Samurai", icon: Flame },
  { label: "Luxury Watch 8K", icon: Sparkles },
  { label: "Wabi-Sabi Interior", icon: Wand2 },
  { label: "Studio Ghibli", icon: Sparkles },
  { label: "Nano Banana 3D", icon: TrendingUp },
];

const SUPPORTED_MODELS = [
  { name: "Midjourney v6.1", dot: "bg-purple-400" },
  { name: "FLUX.1", dot: "bg-cyan-400" },
  { name: "DALL-E 3", dot: "bg-emerald-400" },
  { name: "Leonardo AI", dot: "bg-amber-400" },
  { name: "Ideogram v2", dot: "bg-pink-400" },
  { name: "Stable Diffusion", dot: "bg-blue-400" },
];

export function Hero({ onSelectCategory }: { onSelectCategory?: (category: string) => void }) {
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentPrompt = SHOWCASE_PROMPTS[activeShowcase];

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Prompt copied to clipboard!", {
      description: "Ready to paste directly into Midjourney, Flux, or DALL-E 3",
    });
    setTimeout(() => setCopied(false), 2200);
  };

  const triggerSearch = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
  };

  const getImageSrc = (img: any) => {
    return typeof img === "string" ? img : img?.src || "";
  };

  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
      {/* Background Aurora glow and subtle mesh */}
      <AuroraBg />

      {/* Cybernetic ambient radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-purple-600/10 via-pink-500/10 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Value Proposition & Interactive Command */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            {/* Top Super-Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full glass px-3.5 py-1.5 text-xs text-muted-foreground mb-5 w-fit border border-white/10 shadow-sm backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--aurora-3)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--aurora-3)]" />
              </span>
              <span className="font-medium text-foreground/90">
                Next-Gen AI Prompt Engine
              </span>
              <span className="text-white/20">|</span>
              <span className="text-[11px] text-purple-400 font-semibold tracking-wide">
                12,400+ Calibrated Prompts
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-[clamp(2.4rem,5.5vw,4.25rem)] leading-[1.04] tracking-tight font-semibold text-foreground">
              Craft Masterpiece Art with{" "}
              <span className="text-gradient-aurora block sm:inline">
                Nano Banana & AI Prompts
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
              Stop guessing prompts. Access thousands of production-calibrated prompts for{" "}
              <strong className="text-foreground font-medium">Midjourney v6, Flux Schnell, ChatGPT DALL-E 3</strong>, and Stable Diffusion — complete with camera settings, lighting recipes, and 1-click copying.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#gallery"
                className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white text-black font-semibold px-6 py-3.5 text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_35px_rgba(255,255,255,0.18)]"
              >
                <span>Explore Prompts Library</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <Link
                href="/tools/image-to-prompt"
                className="inline-flex items-center justify-center gap-2 rounded-2xl glass font-medium px-5 py-3.5 text-sm hover:bg-white/[0.08] hover:border-purple-500/40 text-foreground transition-all border border-white/10"
              >
                <Scan className="h-4 w-4 text-purple-400" />
                <span>Image to Prompt AI</span>
                <span className="rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                  New
                </span>
              </Link>

              <Link
                href="/categories"
                className="inline-flex items-center justify-center gap-2 rounded-2xl glass font-medium px-5 py-3.5 text-sm hover:bg-white/[0.08] text-muted-foreground hover:text-foreground transition-all border border-white/10"
              >
                <Compass className="h-4 w-4 text-cyan-400" />
                <span>Categories</span>
              </Link>
            </div>

            {/* Search Command Bar */}
            <div className="mt-8 max-w-2xl">
              <div
                onClick={triggerSearch}
                className="relative group cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="Open search dialog"
              >
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-aurora opacity-30 group-hover:opacity-75 blur-md transition-opacity duration-300" />
                <div className="relative flex items-center gap-3 rounded-2xl glass-strong px-4 py-3.5 border border-white/10 bg-background/80 backdrop-blur-2xl">
                  <Search className="h-4 w-4 text-purple-400 shrink-0" />
                  <span className="flex-1 text-sm text-muted-foreground font-medium truncate">
                    Search 12,400+ prompts (e.g., &quot;hyperrealistic portrait&quot;, &quot;cyberpunk&quot;)...
                  </span>
                  <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-muted-foreground rounded-lg border border-white/10 bg-white/5 px-2 py-1">
                    <span>Ctrl</span>
                    <span>+</span>
                    <span>K</span>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:scale-[1.02] transition"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Trending Quick Chips */}
              <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground font-medium text-[11px]">
                  <TrendingUp className="h-3 w-3 text-purple-400" />
                  Trending:
                </span>
                {TRENDING_PILLS.map((pill) => {
                  const Icon = pill.icon;
                  return (
                    <button
                      key={pill.label}
                      onClick={triggerSearch}
                      className="group inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-purple-500/40 hover:bg-white/[0.06] transition cursor-pointer border border-white/5"
                    >
                      <Icon className="h-3 w-3 text-purple-400/80 group-hover:text-purple-400" />
                      <span>{pill.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Supported AI Engines Strip */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-wrap items-center gap-y-2 gap-x-4">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
                Calibrated For:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {SUPPORTED_MODELS.map((m) => (
                  <span
                    key={m.name}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-foreground/80"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
                    {m.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Community Stats Bar */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { value: "12,400+", label: "Verified Prompts" },
                { value: "9", label: "AI Engines Supported" },
                { value: "180k+", label: "Global Creators" },
                { value: "4.9 ★", label: "Community Rating" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {s.value}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

          </motion.div>

          {/* RIGHT COLUMN: Interactive Masterpiece Showcase Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            {/* Ambient Card Backlight */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-purple-600/25 via-pink-600/20 to-cyan-500/25 rounded-3xl blur-2xl opacity-70 pointer-events-none" />

            {/* Floating Top Badge */}
            <div className="absolute -top-3.5 left-6 z-20 inline-flex items-center gap-2 rounded-full bg-zinc-950/90 border border-purple-500/40 px-3.5 py-1 text-[11px] font-semibold text-purple-300 shadow-lg backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
              <span>Prompt of the Day</span>
            </div>

            {/* Floating Bottom Quality Badge */}
            <div className="absolute -bottom-3 right-6 z-20 hidden sm:inline-flex items-center gap-2 rounded-full bg-zinc-950/90 border border-emerald-500/40 px-3.5 py-1 text-[11px] font-medium text-emerald-300 shadow-lg backdrop-blur-xl">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>100% Photorealistic · 8K Octane</span>
            </div>

            {/* Main Showcase Container */}
            <div className="relative rounded-3xl glass-strong border border-white/15 overflow-hidden shadow-2xl bg-zinc-950/80">
              
              {/* Card Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {currentPrompt.model}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {currentPrompt.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Heart className="h-3 w-3 text-rose-400 fill-rose-400/20" />
                    {currentPrompt.likes}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Copy className="h-3 w-3 text-purple-400" />
                    {currentPrompt.copies}
                  </span>
                </div>
              </div>

              {/* Artwork Display */}
              <div className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentPrompt.id}
                    src={getImageSrc(currentPrompt.image)}
                    alt={currentPrompt.title}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </AnimatePresence>

                {/* Subtle gradient vignette over image bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />

                {/* Title overlay on bottom of image */}
                <div className="absolute bottom-3 left-4 right-4 z-10 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-purple-300">
                      {currentPrompt.badge}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white drop-shadow-md">
                      {currentPrompt.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] text-white/90 border border-white/10 font-mono">
                    <Camera className="h-3 w-3 text-purple-400" />
                    <span>{currentPrompt.aspect}</span>
                  </div>
                </div>
              </div>

              {/* Prompt Text & 1-Click Copy Box */}
              <div className="p-4 sm:p-5 bg-zinc-900/60 border-t border-white/10">
                <div className="relative rounded-2xl bg-black/50 border border-white/10 p-3.5 group/prompt">
                  <p className="text-xs text-foreground/90 font-mono leading-relaxed line-clamp-3 select-all">
                    {currentPrompt.prompt}
                  </p>
                  
                  <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {currentPrompt.engineParams}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyPrompt(currentPrompt.prompt)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                        copied
                          ? "bg-emerald-500 text-white shadow-emerald-500/25"
                          : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white hover:scale-105 shadow-purple-600/30"
                      }`}
                      aria-label="Copy featured prompt"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Prompt Switcher Thumbnails */}
                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Preview Prompts:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {SHOWCASE_PROMPTS.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActiveShowcase(idx);
                          setCopied(false);
                        }}
                        className={`group relative h-9 px-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition cursor-pointer ${
                          activeShowcase === idx
                            ? "bg-white/15 border-purple-400 text-white shadow-md shadow-purple-900/30 ring-1 ring-purple-400/50"
                            : "bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <span className="text-[10px] font-mono opacity-60">0{idx + 1}</span>
                        <span className="truncate max-w-[80px] sm:max-w-[100px] text-[11px]">
                          {p.title.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* Bottom fade transition */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent to-background pointer-events-none" />
    </section>
  );
}
