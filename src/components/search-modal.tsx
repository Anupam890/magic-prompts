"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Command, X, Sparkles, ArrowRight, CornerDownLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getAllPromptsFromSupabase, type Prompt } from "@/lib/prompts-data";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (p: Prompt) => void;
}

export function SearchModal({ isOpen, onClose, onSelectPrompt }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load prompts on mount / open
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getAllPromptsFromSupabase().then((data) => {
        setAllPrompts(data);
        setLoading(false);
      });

      // Auto-focus input
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Global Keyboard Shortcuts (Ctrl+K / Cmd+K / Win+K / Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle search on Ctrl+K, Cmd+K, or Win+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }

      // Close on Escape
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered results based on search query
  const results = query.trim()
    ? allPrompts.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.prompt.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.model.toLowerCase().includes(query.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : allPrompts.slice(0, 5); // Show top 5 recommended prompts when query is empty

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (Clicking outside closes modal) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-16 md:pt-24 px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0f0b1e] border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Bar Header */}
              <div className="relative flex items-center border-b border-black/5 dark:border-white/10 px-5 py-4">
                <Search className="h-5 w-5 text-purple-500 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search prompts by title, keywords, model (Ctrl+K)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent pl-3 pr-10 text-sm md:text-base outline-none text-foreground placeholder:text-muted-foreground font-medium"
                />
                {query ? (
                  <button
                    onClick={() => setQuery("")}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground border border-black/10 dark:border-white/10 rounded-lg px-2 py-1">
                    ESC
                  </span>
                )}
              </div>

              {/* Search Results List */}
              <div className="overflow-y-auto flex-1 p-3 space-y-1.5 min-h-[220px] max-h-[450px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                    <span className="text-xs">Searching AI prompts…</span>
                  </div>
                ) : results.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground space-y-2">
                    <Sparkles className="h-8 w-8 text-purple-500/50 mx-auto" />
                    <p className="text-sm font-semibold">No prompts found for "{query}"</p>
                    <p className="text-xs">Try searching for keywords like "portrait", "cyberpunk", or "Midjourney"</p>
                  </div>
                ) : (
                  <>
                    <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                      <span>{query ? `Search Results (${results.length})` : "Recommended Prompts"}</span>
                      <span>Press Enter to select</span>
                    </div>

                    {results.map((p) => {
                      const imgSrc =
                        typeof p.image === "string" ? p.image : (p.image as any)?.src || "";
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            onSelectPrompt(p);
                            onClose();
                          }}
                          className="group flex items-center justify-between p-3 rounded-2xl hover:bg-purple-500/10 dark:hover:bg-purple-500/20 transition cursor-pointer border border-transparent hover:border-purple-500/30"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {imgSrc && (
                              <img
                                src={imgSrc}
                                alt={p.title}
                                className="h-11 w-11 rounded-none object-cover border border-white/10 shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <h4 className="font-display text-sm font-bold text-foreground group-hover:text-purple-400 transition truncate">
                                {p.title}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate max-w-sm">
                                {p.description || p.prompt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="rounded-full bg-black/10 dark:bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                              {p.model}
                            </span>
                            <ArrowRight className="h-4 w-4 text-purple-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="border-t border-black/5 dark:border-white/10 px-5 py-2.5 bg-black/5 dark:bg-white/[0.02] flex items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-black/10 dark:bg-white/10 px-1.5 py-0.5 font-sans text-[10px] font-bold">Esc</kbd> Close
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-black/10 dark:bg-white/10 px-1.5 py-0.5 font-sans text-[10px] font-bold">Ctrl + K</kbd> Toggle
                  </span>
                </div>
                <span className="text-purple-400 font-semibold">Magic Prompts</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
