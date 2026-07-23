import { motion } from "motion/react";
import { MODELS } from "@/lib/prompts-data";

export function ModelsStrip() {
  return (
    <section id="models" className="relative py-12 md:py-20 border-y border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-5 md:px-6">
        <div className="text-center mb-6 md:mb-10">
          <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 md:mb-3">
            Compatible with
          </div>
          <h2 className="font-display text-2xl md:text-4xl font-medium tracking-tight">
            Every major <span className="text-gradient-aurora">AI model</span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-2.5">
          {MODELS.map((m, i) => (
            <motion.span
              key={m}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="rounded-full glass px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-foreground/90 hover:bg-white/[0.08] transition"
            >
              {m}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
