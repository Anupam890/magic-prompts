import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Copy, Heart, Bookmark, Share2, Eye, Sparkles, Plus } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  incrementPromptCopies,
  incrementPromptLikes,
  saveLocalPromptId,
  getLocalSavedPromptIds,
  getUserBoards,
  addPromptToBoard,
  type UserBoard,
  type Prompt,
} from "@/lib/prompts-data";

export function PromptDetail({ prompt, onClose }: { prompt: Prompt | null; onClose: () => void }) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [userBoards, setUserBoards] = useState<UserBoard[]>([]);
  const [showBoardSelector, setShowBoardSelector] = useState(false);

  // Live real-time counter metrics state
  const [liveViews, setLiveViews] = useState(0);
  const [liveLikes, setLiveLikes] = useState(0);
  const [liveCopies, setLiveCopies] = useState(0);

  useEffect(() => {
    if (prompt) {
      const savedIds = getLocalSavedPromptIds();
      setIsSaved(savedIds.includes(prompt.id));
      setUserBoards(getUserBoards());

      // Auto-increment live view count on open
      const initialViews = (prompt.views || 0) + 1;
      setLiveViews(initialViews);
      setLiveLikes(prompt.likes || 0);
      setLiveCopies(prompt.copies || 0);

      // Check if user already liked
      try {
        const likedIds = JSON.parse(localStorage.getItem("magic_liked_prompt_ids") || "[]");
        setIsLiked(likedIds.includes(prompt.id));
      } catch (e) {}
    }
  }, [prompt?.id]);

  if (!prompt) return null;

  const handleSaveToSpecificBoard = (boardId: string, boardName: string) => {
    const imgSrc = typeof prompt.image === "string" ? prompt.image : prompt.image?.src;
    addPromptToBoard(boardId, prompt.id, imgSrc);
    setIsSaved(true);
    setShowBoardSelector(false);
    toast.success(`Saved to "${boardName}" board!`);
  };

  const toggleSave = () => {
    const nowSaved = saveLocalPromptId(prompt.id);
    setIsSaved(nowSaved);
    if (nowSaved) {
      toast.success("Saved to profile!", { description: "Added to your saved collection." });
    } else {
      toast.info("Removed from saved prompts.");
    }
  };

  const handleLike = () => {
    try {
      const likedIds = JSON.parse(localStorage.getItem("magic_liked_prompt_ids") || "[]");
      const alreadyLiked = likedIds.includes(prompt.id);
      let updated: string[];

      if (alreadyLiked) {
        updated = likedIds.filter((id: string) => id !== prompt.id);
        setIsLiked(false);
        setLiveLikes((prev) => Math.max(0, prev - 1));
        toast.info("Removed like.");
      } else {
        updated = [...likedIds, prompt.id];
        setIsLiked(true);
        setLiveLikes((prev) => prev + 1);
        toast.success("Liked prompt!");
        incrementPromptLikes(prompt.id);
      }
      localStorage.setItem("magic_liked_prompt_ids", JSON.stringify(updated));
    } catch (e) {
      setIsLiked(true);
      setLiveLikes((prev) => prev + 1);
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
    if (label === "Prompt") {
      setLiveCopies((prev) => prev + 1);
      incrementPromptCopies(prompt.id);
    }
  };

  return (
    <Dialog open={!!prompt} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden glass-strong border-white/10 rounded-3xl max-h-[92vh]">
        <div className="grid md:grid-cols-[1.1fr_1fr] max-h-[92vh]">
          <div className="relative bg-black overflow-hidden">
            <img
              src={
                typeof prompt.image === "string"
                  ? prompt.image
                  : (prompt.image as { src: string })?.src || ""
              }
              alt={prompt.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="overflow-y-auto p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="rounded-full glass px-2.5 py-1 text-[10px] font-medium">
                {prompt.model}
              </span>
              <span className="rounded-full glass px-2.5 py-1 text-[10px] text-muted-foreground">
                {prompt.category}
              </span>
              <span className="rounded-full glass px-2.5 py-1 text-[10px] text-muted-foreground">
                {prompt.aspect}
              </span>
            </div>

            <h2 className="font-display text-3xl font-medium tracking-tight leading-tight">
              {prompt.title}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">{prompt.description}</p>

            <div className="mt-6 flex items-center gap-5 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1.5" title="Views">
                <Eye className="h-3.5 w-3.5 text-purple-400" />
                {liveViews.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5" title="Likes">
                <Heart className="h-3.5 w-3.5 text-pink-400" />
                {liveLikes.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5" title="Copies">
                <Copy className="h-3.5 w-3.5 text-indigo-400" />
                {liveCopies.toLocaleString()}
              </span>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> Prompt
                </div>
                <button
                  onClick={() => copy(prompt.prompt, "Prompt")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white text-black px-2.5 py-1 text-xs font-medium hover:bg-white/90 cursor-pointer"
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
              <div className="rounded-2xl glass p-4 text-sm leading-relaxed font-mono text-foreground/90 max-h-48 overflow-y-auto select-text scrollbar-thin scrollbar-thumb-purple-500/30">
                {prompt.prompt}
              </div>
            </div>

            {prompt.negative && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    Negative prompt
                  </div>
                  <button
                    onClick={() => copy(prompt.negative!, "Negative prompt")}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <div className="rounded-2xl glass p-4 text-sm font-mono text-muted-foreground max-h-36 overflow-y-auto select-text scrollbar-thin scrollbar-thumb-purple-500/30">
                  {prompt.negative}
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Tags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {prompt.tags.map((t) => (
                  <span key={t} className="rounded-full glass px-2.5 py-1 text-[11px]">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-[30px]">
              <div className="flex gap-2">
                <button
                  onClick={toggleSave}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition shadow-lg cursor-pointer ${
                    isSaved
                      ? "bg-purple-600 text-white shadow-purple-900/30"
                      : "bg-gradient-aurora text-white hover:scale-[1.01]"
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? "fill-white" : ""}`} />
                  <span>{isSaved ? "Saved to Profile" : "Save to Collection"}</span>
                </button>
                <button
                  onClick={() => {
                    setShowBoardSelector((prev) => !prev);
                  }}
                  aria-label="Add to specific board"
                  className="rounded-2xl glass p-3 hover:bg-white/10 transition text-purple-400 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                  title="Choose Board"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={handleLike}
                  aria-label="Like prompt"
                  className={`rounded-2xl border p-3 transition hover:scale-105 cursor-pointer ${
                    isLiked
                      ? "bg-pink-500/20 text-pink-500 border-pink-500/40 shadow-lg shadow-pink-900/30"
                      : "glass text-pink-400 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-pink-500 text-pink-500" : ""}`} />
                </button>
              </div>

              {/* Board Selector Popover */}
              {showBoardSelector && (
                <div className="mt-3 p-3 rounded-2xl glass border border-white/10 space-y-2 bg-black/40">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground px-1">
                    Select Pinterest Board to Save
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {userBoards.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleSaveToSpecificBoard(b.id, b.name)}
                        className="w-full text-left flex items-center justify-between p-2 rounded-xl hover:bg-purple-500/20 text-xs text-foreground transition cursor-pointer"
                      >
                        <span className="font-semibold">{b.name}</span>
                        <span className="text-[10px] text-muted-foreground">{b.promptIds.length} items</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
