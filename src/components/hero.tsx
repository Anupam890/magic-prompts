import { ArrowRight, Search, Sparkles, Mic, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import heroImg from "@/assets/hero.jpg";
import { AuroraBg } from "./aurora-bg";

const trending = [
  "cinematic portrait",
  "wabi-sabi interior",
  "cyberpunk",
  "product splash",
  "ghibli landscape",
];

export function Hero() {
  return (
    <section className="relative pt-28 md:pt-36 pb-12 md:pb-20 overflow-hidden">
      <AuroraBg />

      {/* Hero orb — hidden on mobile */}
      <div className="absolute right-[-15%] top-[10%] w-[900px] max-w-[70%] pointer-events-none opacity-90 animate-glow-pulse hidden md:block">
        <img
          src={typeof heroImg === "string" ? heroImg : (heroImg as { src: string })?.src || ""}
          alt=""
          width={1600}
          height={1200}
          className="w-full h-auto"
          style={{ maskImage: "radial-gradient(circle, black 40%, transparent 75%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 md:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[10px] sm:text-xs text-muted-foreground mb-4 md:mb-6">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--aurora-3)] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--aurora-3)]" />
            </span>
            New · 2,400+ curated prompts added this week
          </div>

          <h1 className="font-display text-[clamp(2rem,7vw,4.5rem)] leading-[0.98] tracking-tighter font-medium text-white">
            Discover Premium <br className="hidden sm:block" />
            <span className="text-gradient-aurora">AI Image Prompts</span>
          </h1>

          <p className="mt-4 md:mt-6 max-w-xl text-sm md:text-base text-muted-foreground leading-relaxed">
            Explore thousands of professionally crafted prompts for ChatGPT Images, Gemini,
            Midjourney, Flux, Leonardo AI, Ideogram, Stable Diffusion, Adobe Firefly, and more.
          </p>

          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href="#gallery"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-black px-6 py-3 text-sm font-medium hover:scale-[1.02] transition-all shadow-[0_8px_30px_rgba(255,255,255,0.15)]"
            >
              Explore Prompts
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
            </a>
            <a
              href="#categories"
              className="inline-flex items-center justify-center gap-2 rounded-2xl glass px-6 py-3 text-sm font-medium hover:bg-white/[0.08] transition"
            >
              Browse Categories
            </a>
          </div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 md:mt-12 max-w-xl"
          >
            <div className="relative group">
              <div className="absolute -inset-px rounded-2xl bg-gradient-aurora opacity-40 blur-md group-focus-within:opacity-80 transition" />
              <div className="relative flex items-center gap-2 md:gap-3 rounded-2xl glass-strong px-3 md:px-4 py-3 md:py-3.5">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Try 'cinematic luxury watch'..."
                  className="flex-1 min-w-0 bg-transparent text-sm placeholder:text-muted-foreground outline-none"
                />
                <button
                  aria-label="Voice search"
                  className="hidden sm:block rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
                >
                  <Mic className="h-4 w-4" />
                </button>
                <button className="rounded-xl bg-gradient-aurora px-3 py-1.5 text-xs font-medium shrink-0">
                  Search
                </button>
              </div>
            </div>

            <div className="mt-3 md:mt-4 flex flex-wrap items-center gap-1.5 md:gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Trending:
              </span>
              {trending.map((t) => (
                <button
                  key={t}
                  className="rounded-full glass px-2.5 py-1 text-muted-foreground hover:text-foreground transition text-[11px] md:text-xs"
                >
                  {t}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mt-10 md:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-x-6 md:gap-x-10 gap-y-4">
            {[
              { v: "12,400+", l: "Curated prompts" },
              { v: "9", l: "AI models" },
              { v: "180k", l: "Creators" },
              { v: "4.9", l: "Avg. rating", i: <Sparkles className="h-3 w-3" /> },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-xl md:text-2xl font-semibold flex items-center gap-1.5">
                  {s.v}
                  {s.i}
                </div>
                <div className="text-[11px] md:text-xs text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-background pointer-events-none" />
    </section>
  );
}
