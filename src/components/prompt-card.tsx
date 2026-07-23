import { Copy, Heart, Bookmark, Eye, Share2 } from "lucide-react";
import {
  incrementPromptCopies,
  incrementPromptViews,
  saveLocalPromptId,
  getLocalSavedPromptIds,
  type Prompt,
} from "@/lib/prompts-data";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export function PromptCard({
  prompt,
  onOpen,
  onClick,
  index,
}: {
  prompt: Prompt;
  onOpen?: (p: Prompt) => void;
  onClick?: (p: Prompt) => void;
  index?: number;
}) {
  const [loaded, setLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedIds = getLocalSavedPromptIds();
    setIsSaved(savedIds.includes(prompt.id));
  }, [prompt.id]);

  const handleCardClick = () => {
    if (onClick) onClick(prompt);
    else if (onOpen) onOpen(prompt);
    incrementPromptViews(prompt.id);
  };

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nowSaved = saveLocalPromptId(prompt.id);
    setIsSaved(nowSaved);
    if (nowSaved) {
      toast.success("Saved to profile!", { description: "Added to your saved collection." });
    } else {
      toast.info("Removed from saved prompts.");
    }
  };

  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.prompt);
    toast.success("Prompt copied", { description: prompt.title });
    incrementPromptCopies(prompt.id);
  };

  const imgSrc =
    typeof prompt.image === "string"
      ? prompt.image
      : (prompt.image as { src: string })?.src || "";

  return (
    <article
      onClick={handleCardClick}
      className="group relative mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-none card-hover"
    >
      {/* Gradient border glow on hover */}
      <div className="" />

      <div className="relative overflow-hidden rounded-none bg-zinc-900/50">
        {/* Natural aspect ratio image */}
        <img
          src={imgSrc}
          alt={prompt.title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full h-auto block transition-all duration-700 group-hover:scale-[1.03] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Skeleton placeholder while loading */}
        {!loaded && (
          <div
            className="w-full skeleton"
            style={{ paddingBottom: `${prompt.ratio * 100}%` }}
          />
        )}

        {/* Top-right: Copy & Bookmark buttons — hover only */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 touch-show transition-opacity duration-300">
          <button
            onClick={toggleSave}
            aria-label="Bookmark prompt"
            className={`rounded-xl backdrop-blur-md border border-white/10 p-2.5 hover:scale-105 transition-all min-w-[38px] min-h-[38px] flex items-center justify-center ${
              isSaved
                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                : "bg-black/40 text-white hover:bg-black/60"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-white" : ""}`} />
          </button>
          <button
            onClick={copy}
            aria-label="Copy prompt"
            className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 hover:bg-black/60 hover:scale-105 transition-all min-w-[38px] min-h-[38px] flex items-center justify-center"
          >
            <Copy className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Top-left: Model badge — hover only */}
        <div className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 touch-show transition-opacity duration-300">
          <span className="rounded-full bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-white">
            {prompt.model}
          </span>
        </div>

        {/* Bottom: title + description — hover overlay */}
        <div className="absolute inset-x-0 bottom-0 z-20 opacity-0 group-hover:opacity-100 touch-show transition-opacity duration-300">
          <div className="px-4 pb-4 pt-16 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            <h3 className="font-display text-sm md:text-base font-semibold text-white leading-snug line-clamp-1">
              {prompt.title}
            </h3>
            <p className="mt-1 text-[11px] md:text-xs text-white/60 line-clamp-2 leading-relaxed">
              {prompt.description}
            </p>

            {/* Bottom row: stats + tag */}
            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-white/50">
                <span className="flex items-center gap-1" title="Views">
                  <Eye className="h-3 w-3" />
                  {prompt.views >= 1000 ? `${(prompt.views / 1000).toFixed(1)}k` : prompt.views}
                </span>
                <span className="flex items-center gap-1" title="Likes">
                  <Heart className="h-3 w-3" />
                  {prompt.likes >= 1000 ? `${(prompt.likes / 1000).toFixed(1)}k` : prompt.likes}
                </span>
                <span className="flex items-center gap-1" title="Copies">
                  <Copy className="h-3 w-3" />
                  {prompt.copies >= 1000 ? `${(prompt.copies / 1000).toFixed(1)}k` : prompt.copies}
                </span>
              </div>
              <span className="rounded-full bg-white/10 backdrop-blur-sm px-2 py-0.5 text-[9px] font-medium text-white/70">
                {prompt.category}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
