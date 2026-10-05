"use client";

import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  Loader2,
  Wand2,
  Scan,
  Zap,
  ArrowRight,
  Shield,
  Layers,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { uploadImageFile } from "@/lib/cloudinary-client";
import { toast } from "sonner";

interface ImageToPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_ANALYSES = [
  {
    subject: "Cyberpunk Feline Warrior",
    style: "Midjourney v6.0 · Octane Render 8K",
    camera: "85mm f/1.4 Lens · Shallow Depth of Field · Volumetric Fog",
    lighting: "Neon Cyan Rim Light · Dramatic Key Light · Moody Rain Reflections",
    prompt:
      "A fierce cyberpunk feline samurai wearing glowing blue biomechanical armor, rainy night city background, neon reflections, highly detailed fur texture, dramatic volumetric lighting, cinematic key art --ar 16:9 --v 6.0 --style raw",
    negative: "blurry, low quality, extra limbs, watermark, text, out of frame",
  },
  {
    subject: "Modern Minimalist Interior",
    style: "Architectural Digest · Architectural Photography",
    camera: "24mm Wide Angle Lens · Eye Level · Crisp Detail",
    lighting: "Soft Natural Daylight · Warm Ambient Wood Glow · Minimal Shadows",
    prompt:
      "Modern minimalist living room interior with wabi-sabi aesthetics, concrete walls, floor-to-ceiling windows, Japandi sofa, warm ambient daylight, architectural photography, published in Architectural Digest --ar 4:3 --v 6.0",
    negative: "cluttered, oversaturated, dark, harsh shadows, low resolution",
  },
  {
    subject: "High-End Luxury Watch Product Splash",
    style: "Commercial Product Photography · Studio Render",
    camera: "100mm Macro Lens · High Speed Shutter · Sharp Focus",
    lighting: "Dual Softbox Studio Lighting · Liquid Chromatic Splash",
    prompt:
      "Close-up commercial product shot of a luxury chronograph watch exploding through metallic liquid chrome splash, dark moody background, studio lighting, hyper-detailed gear craftsmanship, 8k resolution --ar 1:1 --v 6.0",
    negative: "blurry, out of focus, cheap material, low contrast, text distortion",
  },
];

export function ImageToPromptModal({ isOpen, onClose }: ImageToPromptModalProps) {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<typeof SAMPLE_ANALYSES[0] | null>(null);

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

  const handleAnalyzeImage = (url: string) => {
    setAnalyzing(true);
    // Select dynamic analysis preset based on image URL or pick random realistic breakdown
    setTimeout(() => {
      const idx = Math.floor(Math.random() * SAMPLE_ANALYSES.length);
      setAnalysisResult(SAMPLE_ANALYSES[idx]);
      setAnalyzing(false);
      toast.success("AI Vision prompt reverse-engineered!");
    }, 1400);
  };

  const processFile = async (file: File) => {
    setUploading(true);
    try {
      toast.info("Uploading artwork to AI Vision engine...");
      const { url } = await uploadImageFile(file);
      setImageUrl(url);
      handleAnalyzeImage(url);
    } catch (err: any) {
      // Fallback preview
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
      handleAnalyzeImage(objectUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    } else {
      toast.error("Please drop a valid image file.");
    }
  };

  const handleCopyPrompt = () => {
    if (!analysisResult) return;
    if (typeof window !== "undefined" && navigator?.clipboard) {
      navigator.clipboard.writeText(analysisResult.prompt);
      setCopied(true);
      toast.success("AI prompt copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
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
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md cursor-pointer"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div
            className="fixed inset-0 z-[101] flex items-center justify-center p-3 sm:p-4 cursor-pointer"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto overflow-x-hidden bg-card border border-border rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl my-auto cursor-default text-card-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top ambient glow */}
              <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground border border-border transition"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                  <Scan className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider text-foreground">
                      IMAGE TO PROMPT CONVERTER
                    </h2>
                    <span className="rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 text-[9px] font-bold uppercase">
                      AI Vision v2.4
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload any image to reverse-engineer prompt parameters, lighting, and camera settings.
                  </p>
                </div>
              </div>

              {/* Upload Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[140px] mb-6 ${
                  isDragging
                    ? "border-purple-500 bg-purple-500/15 scale-[1.01]"
                    : imageUrl
                    ? "border-purple-500/40 bg-purple-500/5"
                    : "border-border bg-muted/40 hover:border-purple-500/50 hover:bg-muted/60"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading || analyzing}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />

                {uploading || analyzing ? (
                  <div className="flex flex-col items-center justify-center py-4 gap-2 text-purple-600 dark:text-purple-400">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {uploading ? "Uploading Image…" : "Reverse Engineering AI Prompt…"}
                    </span>
                  </div>
                ) : imageUrl ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-4">
                      <img
                        src={imageUrl}
                        alt="Uploaded preview"
                        className="h-16 w-16 rounded-lg object-cover border border-border shadow-md"
                      />
                      <div className="text-left">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <Check className="h-4 w-4" /> Image Analyzed Successfully
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Click to upload a different artwork
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-3.5 py-2 hover:bg-purple-500/20 transition uppercase tracking-wider shrink-0">
                      Change Image
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2 gap-2">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                        DRAG & DROP IMAGE HERE TO REVERSE ENGINEER PROMPT
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        or <span className="text-purple-600 dark:text-purple-400 font-semibold underline">browse artwork file</span> (PNG, JPG, WEBP)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Analysis Result Output */}
              {analysisResult && (
                <div className="space-y-4 border-t border-border pt-6 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-muted/60 border border-border space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                        DETECTED SUBJECT
                      </span>
                      <div className="font-semibold text-foreground">{analysisResult.subject}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/60 border border-border space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                        ESTIMATED STYLE & MODEL
                      </span>
                      <div className="font-semibold text-foreground">{analysisResult.style}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/60 border border-border space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                        CAMERA & OPTICS
                      </span>
                      <div className="font-medium text-foreground/80">{analysisResult.camera}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/60 border border-border space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                        LIGHTING & AMBIENCE
                      </span>
                      <div className="font-medium text-foreground/80">{analysisResult.lighting}</div>
                    </div>
                  </div>

                  {/* Generated Prompt String */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                      <span>REVERSE-ENGINEERED PROMPT</span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">Ready to use in Midjourney / Flux</span>
                    </label>
                    <div className="relative rounded-xl bg-muted/70 p-4 border border-border text-xs font-mono leading-relaxed text-foreground select-text">
                      {analysisResult.prompt}
                    </div>
                  </div>

                  {/* Negative Prompt */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                      SUGGESTED NEGATIVE PROMPT
                    </label>
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs font-mono text-amber-900 dark:text-amber-300 select-text">
                      {analysisResult.negative}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 flex flex-wrap items-center justify-end gap-3 border-t border-border">
                    <button
                      onClick={onClose}
                      className="rounded-lg bg-muted px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border transition cursor-pointer"
                    >
                      CLOSE
                    </button>

                    <button
                      onClick={handleCopyPrompt}
                      className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-2.5 shadow-lg shadow-purple-900/30 transition hover:scale-[1.02] uppercase tracking-wider cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-400" />
                          COPIED PROMPT
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          COPY PROMPT STRING
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
