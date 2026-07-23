"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PromptCard } from "@/components/prompt-card";
import { PromptDetail } from "@/components/prompt-detail";
import { Toaster } from "@/components/ui/sonner";
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
  Search,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { fetchPromptsPage, getCategories, type Prompt } from "@/lib/prompts-data";

const ICONS: Record<string, any> = {
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

interface BananaClientProps {
  initialCategory: string;
  initialCategorySlug: string;
  initialData: { items: Prompt[]; nextPage?: number | null; total: number };
}

export function BananaClient({
  initialCategory,
  initialCategorySlug,
  initialData,
}: BananaClientProps) {
  const [search, setSearch] = useState("");
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);

  // Dynamic state hooks replacing React Query
  const [categories, setCategories] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<Prompt[]>(initialData.items);
  const [nextPage, setNextPage] = useState<number | null>(initialData.nextPage ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState<boolean>(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch categories once
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Fetch category prompts when initialCategory changes
  useEffect(() => {
    let activeQuery = true;
    setIsLoading(true);
    fetchPromptsPage({
      page: 0,
      category: initialCategory,
      model: "All",
      sort: "trending",
    })
      .then((res) => {
        if (!activeQuery) return;
        setAllItems(res.items);
        setNextPage(res.nextPage);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (activeQuery) setIsLoading(false);
      });

    return () => {
      activeQuery = false;
    };
  }, [initialCategory]);

  // Paginated load triggers
  const fetchNextPageFn = useCallback(async () => {
    if (nextPage === null || isFetchingNextPage) return;
    setIsFetchingNextPage(true);
    try {
      const res = await fetchPromptsPage({
        page: nextPage,
        category: initialCategory,
        model: "All",
        sort: "trending",
      });
      setAllItems((prev) => [...prev, ...res.items]);
      setNextPage(res.nextPage);
    } catch (err) {
      console.error("Failed to load more category prompts:", err);
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [nextPage, isFetchingNextPage, initialCategory]);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPage !== null && !isFetchingNextPage && !isLoading) {
          fetchNextPageFn();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [fetchNextPageFn, nextPage, isFetchingNextPage, isLoading]);

  const hasNextPage = nextPage !== null;

  // Client-side search filtration
  const filteredItems = allItems.filter((p) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.prompt.toLowerCase().includes(query) ||
      p.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  const categoryDesc = categories.find((c) => c.slug === initialCategorySlug)?.description || "";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-20 md:pt-24 selection:bg-purple-500/30">
      <Nav />

      <main className="flex-1 w-full max-w-7xl mx-auto px-5 md:px-6 py-6 md:py-10">
        {/* Category Header */}
        <div className="mb-6 md:mb-10 max-w-3xl">
          <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold mb-2 flex items-center gap-1.5">
            Banana Prompts <ChevronRight className="h-3 w-3 text-zinc-600" /> {initialCategory}
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-white leading-tight">
            {initialCategory} Prompts
          </h1>
          <p className="mt-2 md:mt-2.5 text-sm text-zinc-400 leading-relaxed">{categoryDesc}</p>
        </div>

        {/* Mobile: horizontal category pills */}
        <div className="flex md:hidden overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-2 pb-4 -mx-5 px-5">
          {categories.map((cat) => {
            const Icon = ICONS[cat.icon] || Sparkles;
            const isActive = cat.slug === initialCategorySlug;
            return (
              <Link
                key={cat.slug}
                href={cat.slug === "all" ? "/categories" : `/categories/${cat.slug}`}
                className={`flex items-center gap-2 rounded-xl glass px-3.5 py-2.5 text-xs font-medium whitespace-nowrap snap-start shrink-0 transition ${
                  isActive
                    ? "ring-2 ring-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-400"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop: two-column layout */}
        <div className="grid md:grid-cols-[260px_1fr] gap-6 md:gap-8 items-start">
          {/* Sticky Left Sidebar Categories — desktop only */}
          <aside className="hidden md:block md:sticky md:top-28 space-y-1 bg-zinc-950/20 border border-white/5 p-3 rounded-2xl">
            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-3 mb-2">
              Browse Categories
            </div>
            {categories.map((cat) => {
              const Icon = ICONS[cat.icon] || Sparkles;
              const isActive = cat.slug === initialCategorySlug;
              return (
                <Link
                  key={cat.slug}
                  href={cat.slug === "all" ? "/categories" : `/categories/${cat.slug}`}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition duration-200 select-none ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-transparent text-emerald-400 border-l-2 border-emerald-500 font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                  {cat.name}
                </Link>
              );
            })}
          </aside>

          {/* Right Main Content Area */}
          <div className="space-y-4 md:space-y-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search within category..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 md:py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-white/20 transition"
              />
            </div>

            {/* Grid display */}
            {isLoading && allItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 md:py-20 gap-3 text-zinc-400">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                <span className="text-xs">Fetching visual assets…</span>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                {filteredItems.map((p, i) => (
                  <PromptCard key={p.id} prompt={p} onOpen={setActivePrompt} index={i} />
                ))}
              </div>
            )}

            {!isLoading && filteredItems.length === 0 && (
              <div className="text-center py-16 md:py-20 text-sm text-zinc-500">
                No prompts match your current filters.
              </div>
            )}

            {/* Infinite Scroll Trigger & Automatic Loading Indicator */}
            <div ref={observerTarget} className="mt-4 py-2 text-center text-xs text-muted-foreground min-h-[20px]">
              {isFetchingNextPage && (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400" /> Loading Prompts…
                </span>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal Dialog Details */}
      <PromptDetail prompt={activePrompt} onClose={() => setActivePrompt(null)} />
      <Toaster />
    </div>
  );
}
