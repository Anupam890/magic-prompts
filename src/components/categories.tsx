import {
  Sparkles,
  ShoppingBag,
  Aperture,
  User,
  Swords,
  Star,
  Palette,
  Sofa,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { getCategories, getAllPromptsFromSupabase } from "@/lib/prompts-data";

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  ShoppingBag,
  Aperture,
  User,
  Swords,
  Star,
  Palette,
  Sofa,
  Wand2,
};

const GRADIENTS = [
  "from-violet-500/40 to-fuchsia-500/40",
  "from-blue-500/40 to-cyan-500/40",
  "from-pink-500/40 to-rose-500/40",
  "from-amber-500/40 to-orange-500/40",
  "from-emerald-500/40 to-teal-500/40",
  "from-indigo-500/40 to-purple-500/40",
  "from-sky-500/40 to-blue-500/40",
  "from-fuchsia-500/40 to-pink-500/40",
  "from-red-500/40 to-orange-500/40",
];

type Props = {
  active: string;
  onChange: (c: string) => void;
};

export function Categories({ active, onChange }: Props) {
  const [categories, setCategories] = useState<{ name: string; icon: string; description?: string }[]>([]);
  const [allPrompts, setAllPrompts] = useState<any[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
    getAllPromptsFromSupabase().then(setAllPrompts);
  }, []);

  return (
    <section id="categories" className="relative py-12 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-12 gap-2">
          <div>
            <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 md:mb-3">
              Categories
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight">
              Explore by <span className="text-gradient-aurora">craft</span>
            </h2>
          </div>
          <p className="hidden md:block max-w-sm text-sm text-muted-foreground">
            From cinematic product shots to anime characters — every category is curated by working
            artists.
          </p>
        </div>

        {/* Mobile: horizontal scroll strip */}
        <div className="flex md:hidden overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-2 pb-2 -mx-5 px-5">
          {categories.map((c, i) => {
            const Icon = ICONS[c.icon] || Sparkles;
            const count =
              c.name === "All"
                ? allPrompts.length
                : allPrompts.filter((p) => p.category === c.name).length;
            const isActive = active === c.name;
            return (
              <button
                key={c.name}
                onClick={() => onChange(c.name)}
                className={`flex items-center gap-2 rounded-xl glass px-3.5 py-2.5 text-xs font-medium whitespace-nowrap snap-start shrink-0 transition ${
                  isActive ? "ring-2 ring-[color:var(--aurora-1)] bg-white/[0.08]" : ""
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{c.name}</span>
                <span className="text-muted-foreground text-[10px]">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((c, i) => {
            const Icon = ICONS[c.icon] || Sparkles;
            const count =
              c.name === "All"
                ? allPrompts.length
                : allPrompts.filter((p) => p.category === c.name).length;
            const isActive = active === c.name;
            return (
              <motion.button
                key={c.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                onClick={() => onChange(c.name)}
                className={`group relative overflow-hidden rounded-2xl glass card-hover text-left p-5 min-h-32 ${
                  isActive ? "ring-2 ring-[color:var(--aurora-1)]" : ""
                }`}
              >
                <div
                  className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} blur-2xl opacity-60 group-hover:opacity-100 transition`}
                />
                <div className="relative">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl glass mb-4">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{count} prompts</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
