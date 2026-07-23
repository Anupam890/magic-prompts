import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Copy, Heart, Bookmark, Share2, Eye, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { incrementPromptCopies, incrementPromptLikes, type Prompt } from "@/lib/prompts-data";

export function PromptDetail({ prompt, onClose }: { prompt: Prompt | null; onClose: () => void }) {
  if (!prompt) return null;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
    if (label === "Prompt") {
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

            <div className="mt-6 flex items-center gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {prompt.views.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5" />
                {prompt.likes.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Copy className="h-3.5 w-3.5" />
                {prompt.copies.toLocaleString()}
              </span>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> Prompt
                </div>
                <button
                  onClick={() => copy(prompt.prompt, "Prompt")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white text-black px-2.5 py-1 text-xs font-medium hover:bg-white/90"
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
              <div className="rounded-2xl glass p-4 text-sm leading-relaxed font-mono text-foreground/90">
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
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Copy
                  </button>
                </div>
                <div className="rounded-2xl glass p-4 text-sm font-mono text-muted-foreground">
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

            <div className="mt-8 flex gap-2">
              <button className="flex-1 rounded-2xl bg-gradient-aurora px-4 py-3 text-sm font-medium">
                Save to collection
              </button>
              <button
                onClick={() => {
                  toast.success("Liked");
                  incrementPromptLikes(prompt.id);
                }}
                aria-label="Like"
                className="rounded-2xl glass p-3 hover:bg-white/10 transition"
              >
                <Heart className="h-4 w-4" />
              </button>
              <button
                onClick={() => toast.success("Bookmarked")}
                aria-label="Bookmark"
                className="rounded-2xl glass p-3 hover:bg-white/10 transition"
              >
                <Bookmark className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied");
                }}
                aria-label="Share"
                className="rounded-2xl glass p-3 hover:bg-white/10 transition"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
