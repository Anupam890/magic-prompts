"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/app/providers";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p12 from "@/assets/p12.jpg";

const SLIDES = [
  {
    image: p12,
    title: "Dive into the Ultimate",
    highlight: "Prompt Experience",
    subtitle:
      "Join thousands of creators and master the art of AI image generation with curated, production-ready prompts.",
  },
  {
    image: p2,
    title: "Master High-Fashion &",
    highlight: "Holographic Aesthetics",
    subtitle:
      "Explore luxury portraits, futuristic character designs, and detailed prompt structures for Midjourney & Flux.",
  },
  {
    image: p1,
    title: "Unlock Studio Quality",
    highlight: "Cinematic & Product Shots",
    subtitle:
      "Transform simple ideas into hyper-realistic photography with specialized lighting and composition modifiers.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const { theme, setTheme } = useTheme();

  // Automatic sliding carousel timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[activeSlide];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05030a] text-slate-900 dark:text-white flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans selection:bg-purple-500/30 transition-colors duration-300">
      {/* Background ambient radial purple glow */}
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-purple-500/10 dark:bg-purple-700/20 blur-[140px] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-700/15 blur-[140px] pointer-events-none" />

      {/* Main card container */}
      <div className="w-full max-w-5xl rounded-[28px] md:rounded-[36px] bg-white dark:bg-[#0c0919] border border-slate-200/80 dark:border-purple-900/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_80px_-15px_rgba(112,26,238,0.25)] overflow-hidden relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] p-3 md:p-4 gap-4 md:gap-8 transition-colors duration-300">
        
        {/* Left Side: Animated Art Showcase Poster */}
        <div className="relative rounded-[22px] md:rounded-[28px] overflow-hidden min-h-[340px] lg:min-h-[580px] flex flex-col justify-between p-6 md:p-8 bg-zinc-950">
          {/* Automatic Image Slider */}
          <AnimatePresence mode="wait">
            <motion.img
              key={activeSlide}
              src={
                typeof slide.image === "string"
                  ? slide.image
                  : (slide.image as { src: string })?.src || ""
              }
              alt="AI Art Showcase"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.8, scale: 1.05 }}
              exit={{ opacity: 0, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </AnimatePresence>

          {/* Atmospheric overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0919] via-purple-950/40 to-purple-900/20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0919]/60 via-transparent to-[#0c0919]/60 pointer-events-none" />

          {/* Top branding inside poster */}
          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="inline-block group">
              <span className="font-serif italic font-bold tracking-wide text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-300 drop-shadow">
                Magic Prompts
              </span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back home
            </Link>
          </div>

          {/* Bottom text overlay with auto transition */}
          <div className="relative z-10 mt-auto pt-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-white leading-tight drop-shadow-md">
                  {slide.title} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-indigo-300">
                    {slide.highlight}
                  </span>
                </h2>
                <p className="mt-2.5 text-xs md:text-sm text-purple-200/80 max-w-sm leading-relaxed">
                  {slide.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Interactive Carousel Dots */}
            <div className="mt-6 flex items-center gap-2">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                    idx === activeSlide
                      ? "w-7 bg-purple-400 shadow-sm shadow-purple-400/50"
                      : "w-2 bg-purple-400/30 hover:bg-purple-400/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Form Area */}
        <div className="relative flex flex-col justify-center px-4 md:px-8 py-6 md:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
