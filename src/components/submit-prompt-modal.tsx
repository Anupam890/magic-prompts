"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Upload, Image as ImageIcon, Send, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CATEGORIES, MODELS, submitUserPrompt } from "@/lib/prompts-data";
import { uploadImageFile } from "@/lib/cloudinary-client";
import { toast } from "sonner";

interface SubmitPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitPromptModal({ isOpen, onClose }: SubmitPromptModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("E-commerce");
  const [model, setModel] = useState<string>("Midjourney");
  const [aspect, setAspect] = useState<string>("4:5");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [negative, setNegative] = useState("");
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [tagInputBuffer, setTagInputBuffer] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageRatio, setImageRatio] = useState<number>(1.25);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const processFile = async (file: File) => {
    setUploadingImage(true);
    try {
      toast.info("Uploading image...");
      const { url, ratio } = await uploadImageFile(file);
      setImageUrl(url);
      setImageRatio(ratio);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    } else if (file) {
      toast.error("Please drop a valid image file (PNG, JPG, WEBP).");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !prompt.trim() || !imageUrl.trim()) {
      toast.error("Please fill in all required fields (Title, Image URL, and Prompt)");
      return;
    }

    setLoading(true);
    try {
      const finalTags = Array.from(new Set([...tagsList, tagInputBuffer.trim().replace(/^#/, "")].filter(Boolean)));

      let ratio = 1.25;
      if (aspect === "16:9") ratio = 0.56;
      else if (aspect === "1:1") ratio = 1.0;
      else if (aspect === "9:16") ratio = 1.77;

      await submitUserPrompt({
        title,
        category,
        model,
        aspect,
        description: description || title,
        prompt,
        negative,
        tags: finalTags.length > 0 ? finalTags : ["community", category.toLowerCase()],
        image: imageUrl,
        ratio,
      });

      toast.success("Prompt submitted successfully!", {
        description: "Your submission is in review and will appear live once approved by an admin.",
      });

      // Reset & Close
      setTitle("");
      setPrompt("");
      setNegative("");
      setDescription("");
      setImageUrl("");
      setTagsList([]);
      setTagInputBuffer("");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit prompt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md cursor-pointer"
            onClick={onClose}
          />

          {/* Modal Dialog Container */}
          <div
            className="fixed inset-0 z-[101] flex items-center justify-center p-3 sm:p-4 cursor-pointer"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto overflow-x-hidden bg-zinc-950 border border-white/10 rounded-sm p-4 sm:p-6 md:p-8 shadow-2xl my-auto cursor-default text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top ambient glow */}
              <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-2xl glass hover:bg-white/[0.08] transition text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    Submit AI Prompt
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Share your visual trigger with the community. Requires admin review.
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
                    PROMPT TITLE *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Neon Cyberpunk Samurai Portrait"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-sm bg-zinc-900 px-4 py-2.5 text-xs outline-none border border-white/10 focus:border-purple-500 transition text-white placeholder:text-zinc-600"
                  />
                </div>

                {/* Grid: Category & Model */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
                      CATEGORY *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-sm bg-zinc-900 px-4 py-2.5 text-xs outline-none border border-white/10 focus:border-purple-500 transition text-white cursor-pointer [&>option]:bg-zinc-950 [&>option]:text-white"
                    >
                      {CATEGORIES.filter((c) => c.name !== "All").map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
                      AI MODEL *
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full rounded-sm bg-zinc-900 px-4 py-2.5 text-xs outline-none border border-white/10 focus:border-purple-500 transition text-white cursor-pointer [&>option]:bg-zinc-950 [&>option]:text-white"
                    >
                      {MODELS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Aspect Ratio & Image URL */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
                      ASPECT RATIO
                    </label>
                    <select
                      value={aspect}
                      onChange={(e) => setAspect(e.target.value)}
                      className="w-full rounded-sm bg-zinc-900 px-4 py-2.5 text-xs outline-none border border-white/10 focus:border-purple-500 transition text-white cursor-pointer [&>option]:bg-zinc-950 [&>option]:text-white"
                    >
                      <option value="4:5">4:5 (Portrait)</option>
                      <option value="16:9">16:9 (Landscape)</option>
                      <option value="1:1">1:1 (Square)</option>
                      <option value="9:16">9:16 (Story)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
                      ARTWORK IMAGE *
                    </label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-sm p-4 sm:p-6 text-center transition duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[120px] ${
                        isDragging
                          ? "border-purple-500 bg-purple-500/15 scale-[1.01]"
                          : imageUrl
                          ? "border-purple-500/40 bg-purple-500/5"
                          : "border-white/10 bg-zinc-900/60 hover:border-purple-500/50"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploadingImage}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />

                      {uploadingImage ? (
                        <div className="flex flex-col items-center justify-center py-4 gap-2 text-purple-400">
                          <Loader2 className="h-8 w-8 animate-spin" />
                          <span className="text-xs font-semibold">Uploading artwork to Cloudinary…</span>
                        </div>
                      ) : imageUrl ? (
                        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={imageUrl}
                              alt="Preview"
                              className="h-14 w-14 rounded-sm object-cover border border-white/10 shadow-md"
                            />
                            <div className="text-left">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400">
                                <Check className="h-4 w-4 text-green-400" /> Artwork Uploaded
                              </span>
                              <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1 max-w-[220px]">
                                Ready for submission
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold rounded-sm bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3.5 py-1.5 hover:bg-purple-500/20 transition shrink-0">
                            Change File
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-2 gap-2">
                          <div className="h-10 w-10 rounded-sm bg-purple-500/10 text-purple-400 flex items-center justify-center shadow-inner border border-purple-500/20">
                            <Upload className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">
                              Drag & drop artwork image here
                            </p>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              or <span className="text-purple-400 font-semibold underline">browse file from your computer</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image Preview if provided */}
                {imageUrl && (
                  <div className="relative h-28 w-full rounded-sm overflow-hidden border border-white/10 bg-black/20">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={() => toast.error("Invalid image URL")}
                    />
                    <div className="absolute bottom-2 left-2 rounded-sm bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur-md">
                      Preview
                    </div>
                  </div>
                )}

                {/* Prompt Text */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
                    PROMPT TEXT *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter full detailed AI prompt string..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full rounded-sm bg-zinc-900 p-3.5 text-xs outline-none border border-white/10 focus:border-purple-500 transition resize-none text-white placeholder:text-zinc-600"
                  />
                </div>

                {/* Negative Prompt */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
                    NEGATIVE PROMPT (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder="blurry, low quality, watermark, text"
                    value={negative}
                    onChange={(e) => setNegative(e.target.value)}
                    className="w-full rounded-sm bg-zinc-900 px-4 py-2.5 text-xs outline-none border border-white/10 focus:border-purple-500 transition text-white placeholder:text-zinc-600"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 flex items-center justify-between">
                    <span>TAGS (#TAG + ENTER)</span>
                    <span className="text-[10px] text-purple-400 font-mono">Press Enter or Comma</span>
                  </label>
                  <div className="min-h-[46px] p-2 rounded-sm bg-zinc-900 border border-white/10 focus-within:border-purple-500 flex flex-wrap items-center gap-1.5 transition">
                    {tagsList.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-300 text-xs font-semibold px-2.5 py-1 rounded-sm border border-purple-500/20"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => setTagsList((prev) => prev.filter((_, i) => i !== idx))}
                          className="hover:text-red-500 transition p-0.5 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder={tagsList.length === 0 ? "Type #tag and press Enter..." : "Add tag..."}
                      value={tagInputBuffer}
                      onChange={(e) => setTagInputBuffer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          const cleaned = tagInputBuffer.trim().replace(/^#/, "");
                          if (cleaned && !tagsList.includes(cleaned)) {
                            setTagsList((prev) => [...prev, cleaned]);
                            setTagInputBuffer("");
                          }
                        }
                      }}
                      className="flex-1 bg-transparent px-2 py-1 text-xs outline-none min-w-[140px] text-white placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-sm bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 rounded-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-2.5 shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit for Review
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
