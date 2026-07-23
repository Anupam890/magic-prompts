"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getModels, fetchPromptsPage, type Prompt, type SortKey } from "@/lib/prompts-data";
import { PromptCard } from "./prompt-card";
import { PromptDetail } from "./prompt-detail";
import { AdsterraAd } from "./adsterra-ad";
import { Filter, Flame, Clock, Copy, Heart, Loader2, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const SORTS = [
  { key: "trending", label: "Trending", Icon: Flame },
  { key: "newest", label: "Newest", Icon: Clock },
  { key: "copied", label: "Most Copied", Icon: Copy },
  { key: "liked", label: "Most Liked", Icon: Heart },
] as const;

const SKELETON_RATIOS = [1.25, 1.35, 0.9, 1.4, 1.1, 1.28, 1.2, 1.32];

function SkeletonCard({ index }: { index: number }) {
  const ratio = SKELETON_RATIOS[index % SKELETON_RATIOS.length];
  return (
    <div className="mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-zinc-800/10 dark:bg-white/5 border border-black/5 dark:border-white/5">
      <div className="skeleton w-full" style={{ paddingBottom: `${ratio * 100}%` }} />
    </div>
  );
}

export function Gallery({ activeCategory }: { activeCategory: string }) {
  const [model, setModel] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("trending");
  const [active, setActive] = useState<Prompt | null>(null);

  // Dynamic States
  const [items, setItems] = useState<Prompt[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState<boolean>(false);
  const [models, setModels] = useState<string[]>([]);

  // Model Dropdown Hover State
  const [modelOpen, setModelOpen] = useState(false);
  const modelTimer = useRef<any>(null);

  // Infinite Scroll Ref
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleModelEnter = () => {
    if (modelTimer.current) clearTimeout(modelTimer.current);
    setModelOpen(true);
  };

  const handleModelLeave = () => {
    modelTimer.current = setTimeout(() => {
      setModelOpen(false);
    }, 300);
  };

  // Load models from database
  useEffect(() => {
    getModels().then(setModels);
  }, []);

  // Fetch initial page on filter changes
  useEffect(() => {
    let activeQuery = true;
    setIsLoading(true);
    fetchPromptsPage({ page: 0, category: activeCategory, model, sort })
      .then((res) => {
        if (!activeQuery) return;
        setItems(res.items);
        setTotal(res.total);
        setNextPage(res.nextPage);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Network issue loading live prompts. Loaded offline prompts.");
        if (activeQuery) setIsLoading(false);
      });

    return () => {
      activeQuery = false;
    };
  }, [activeCategory, model, sort]);

  // Paginated load handler
  const fetchNextPage = useCallback(async () => {
    if (nextPage === null || isFetchingNextPage) return;
    setIsFetchingNextPage(true);
    try {
      const res = await fetchPromptsPage({ page: nextPage, category: activeCategory, model, sort });
      setItems((prev) => [...prev, ...res.items]);
      setNextPage(res.nextPage);
    } catch (err) {
      console.error("Failed to load paginated prompts:", err);
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [nextPage, isFetchingNextPage, activeCategory, model, sort]);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPage !== null && !isFetchingNextPage && !isLoading) {
          fetchNextPage();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [fetchNextPage, nextPage, isFetchingNextPage, isLoading]);

  return (
    <section id="gallery" className="relative py-12 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-6">
        {/* Header: title + filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-6 md:mb-10">
          <div>
            <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 md:mb-3">
              Gallery {total > 0 && <span className="ml-2 text-foreground/70">· {total}</span>}
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight">
              The prompt library
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Sort pills */}
            <div className="flex items-center gap-1 rounded-2xl glass p-1 overflow-x-auto hide-scrollbar">
              {SORTS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition whitespace-nowrap shrink-0 ${
                    sort === key
                      ? "bg-white text-black dark:bg-white dark:text-black shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3 w-3" /> {label}
                </button>
              ))}
            </div>

            {/* Model select — Redesigned Glass DropdownMenu with Auto-Open on Hover */}
            <div
              onMouseEnter={handleModelEnter}
              onMouseLeave={handleModelLeave}
              className="relative inline-block"
            >
              <DropdownMenu open={modelOpen} onOpenChange={setModelOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-between gap-2.5 w-full sm:w-auto rounded-2xl glass px-4 py-2 text-xs font-medium outline-none cursor-pointer hover:bg-white/[0.08] transition text-foreground shrink-0 border border-black/5 dark:border-white/10 select-none">
                    <div className="flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5 text-purple-500" />
                      <span>{model === "All" ? "All models" : model}</span>
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground opacity-60 transition-transform duration-200 ${modelOpen ? "rotate-180" : ""}`} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48"
                  onMouseEnter={handleModelEnter}
                  onMouseLeave={handleModelLeave}
                >
                  <DropdownMenuLabel>Filter by Model</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setModel("All");
                      setModelOpen(false);
                    }}
                    className="flex items-center justify-between font-medium cursor-pointer"
                  >
                    <span>All models</span>
                    {model === "All" && <Check className="h-3.5 w-3.5 text-purple-500 stroke-[2.5]" />}
                  </DropdownMenuItem>
                  {models.map((m) => (
                    <DropdownMenuItem
                      key={m}
                      onClick={() => {
                        setModel(m);
                        setModelOpen(false);
                      }}
                      className="flex items-center justify-between font-medium cursor-pointer"
                    >
                      <span>{m}</span>
                      {model === m && <Check className="h-3.5 w-3.5 text-purple-500 stroke-[2.5]" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Masonry via CSS columns — responsive, no dividing animations */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {isLoading &&
            Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={`s-${i}`} index={i} />)}

          {!isLoading &&
            items.map((p, i) => (
              <div key={p.id} className="break-inside-avoid">
                <PromptCard prompt={p} onOpen={setActive} index={i} />
                {/* Insert Native Adsterra Banner Every 8 Items */}
                {i > 0 && i % 8 === 0 && (
                  <div className="mb-4 break-inside-avoid">
                    <AdsterraAd type="native" className="my-2" />
                  </div>
                )}
              </div>
            ))}

          {isFetchingNextPage &&
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`sn-${i}`} index={i + 3} />)}
        </div>

        {!isLoading && items.length === 0 && (
          <div className="text-center py-16 md:py-24 text-muted-foreground">
            No prompts match these filters.
          </div>
        )}

        {/* Infinite Scroll Trigger & Automatic Loading Indicator */}
        <div ref={observerTarget} className="mt-4 py-2 text-center text-xs text-muted-foreground min-h-[20px]">
          {isFetchingNextPage && (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" /> Loading more prompts…
            </span>
          )}
        </div>
      </div>

      <PromptDetail prompt={active} onClose={() => setActive(null)} />
    </section>
  );
}
