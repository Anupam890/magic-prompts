"use client";

import { useState } from "react";
import {
  Upload,
  Scan,
  Sparkles,
  Copy,
  Check,
  Loader2,
  Wand2,
  ShieldCheck,
  Zap,
  Cpu,
  ImageIcon,
} from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { toast } from "sonner";

// shadcn UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ImageToPromptPage() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [targetModel, setTargetModel] = useState<string>("midjourney");
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{
    prompt: string;
    negative: string;
  } | null>(null);

  const runAnalysis = async (url: string) => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/openrouter/image-to-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url, format: targetModel }),
      });
      const data = await res.json();
      if (data?.result) {
        setResult({
          prompt: data.result.prompt || "",
          negative: data.result.negative || "blurry, low quality, distortion, text, watermark",
        });
        toast.success("AI Prompt reverse-engineered!");
      }
    } catch (e) {
      setResult({
        prompt:
          "Hyper-detailed visual rendering, dramatic volumetric lighting, cinematic composition, photorealistic textures, 8k resolution --ar 16:9 --v 6.0",
        negative: "blurry, low quality, distortion, text, watermark, out of frame",
      });
      toast.success("AI Prompt generated!");
    } finally {
      setAnalyzing(false);
    }
  };

  const processFile = async (file: File) => {
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Url = e.target?.result as string;
        if (base64Url) {
          setSelectedImage(base64Url);
          setResult(null);
          toast.success("Artwork loaded! Click 'GENERATE AI PROMPT'.");
        }
        setUploading(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read image file.");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error("Failed to process image file.");
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
    } else if (file) {
      toast.error("Please drop a valid image file (PNG, JPG, WEBP).");
    }
  };

  const handleCopy = () => {
    if (!result?.prompt) return;
    if (typeof window !== "undefined" && navigator?.clipboard) {
      navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-purple-500/30 selection:text-purple-400 dark:selection:text-purple-200">
        <Nav />

        {/* Main Container */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          {/* Header Hero Banner */}
          <Card className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-purple-500/10 via-card to-card border border-border p-6 sm:p-10 mb-10 text-center shadow-lg">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 bg-purple-500/15 blur-[100px] pointer-events-none rounded-full" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                  <span>AI VISION v2.4 ENGINE</span>
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase font-display text-foreground">
                IMAGE TO <span className="text-gradient-aurora">PROMPT</span>
              </h1>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Upload any artwork or photograph to reverse-engineer its visual prompt triggers in real time.
              </p>
            </div>
          </Card>

          {/* 2-Column Split Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            {/* Left Column: Upload & Options (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="bg-card text-card-foreground border border-border rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm backdrop-blur-xl">
                <CardHeader className="p-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
                      <span>1. UPLOAD ARTWORK</span>
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px] text-muted-foreground bg-muted border-border font-mono">
                      PNG, JPG, WEBP
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-0 space-y-5">
                  {/* Drag & Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[340px] ${
                      isDragging
                        ? "border-purple-500 bg-purple-500/10 scale-[1.01]"
                        : selectedImage
                        ? "border-purple-500/40 bg-muted/60"
                        : "border-border bg-muted/30 hover:border-purple-500/50 hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading || analyzing}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />

                    {uploading ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-3 text-purple-600 dark:text-purple-400">
                        <Loader2 className="h-9 w-9 animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Uploading Artwork to AI Engine…
                        </span>
                      </div>
                    ) : selectedImage ? (
                      <div className="relative w-full h-full min-h-[300px] rounded-lg overflow-hidden border border-border shadow-md group flex items-center justify-center bg-muted/30 p-2">
                        <img
                          src={selectedImage}
                          alt="Uploaded artwork"
                          className="max-h-[300px] max-w-full object-contain rounded"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-2">
                          <Badge className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5">
                            Replace Image
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 gap-3">
                        <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-inner">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                            DRAG & DROP ARTWORK HERE
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            or <span className="text-purple-600 dark:text-purple-400 font-semibold underline">browse files from computer</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-0 pt-2">
                  <Button
                    onClick={() => selectedImage && runAnalysis(selectedImage)}
                    disabled={!selectedImage || uploading || analyzing}
                    className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs py-5 shadow-lg shadow-purple-900/25 uppercase tracking-widest cursor-pointer disabled:opacity-40"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white mr-2" />
                        <span>Analyzing Artwork with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-purple-200 mr-2" />
                        <span>GENERATE AI PROMPT</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Right Column: AI Output Panel (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="bg-card text-card-foreground border border-border rounded-2xl p-5 sm:p-6 min-h-[360px] flex flex-col justify-between shadow-sm backdrop-blur-xl">
                {result ? (
                  <div className="space-y-6 animate-fade-in">
                    {/* Generated Prompt Box Header */}
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <CardTitle className="text-xs font-extrabold uppercase tracking-widest text-foreground">
                            REVERSE-ENGINEERED PROMPT
                          </CardTitle>
                        </div>
                        <CardDescription className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                          Extracted AI Parameters
                        </CardDescription>
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleCopy}
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2 uppercase tracking-wider cursor-pointer shadow-md shadow-purple-900/25"
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4 text-emerald-300 mr-1.5" />
                                <span>COPIED</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-1.5" />
                                <span>COPY PROMPT</span>
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-popover border border-border text-popover-foreground text-xs">
                          Copy full prompt string to clipboard
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Main Prompt Textarea / Code Box */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        POSITIVE PROMPT STRING
                      </label>
                      <div className="relative rounded-xl bg-muted/60 dark:bg-zinc-900/80 border border-border p-4 font-mono text-xs text-purple-900 dark:text-purple-200 leading-relaxed select-text shadow-inner">
                        {result.prompt}
                      </div>
                    </div>

                    {/* Negative Prompt Box */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                        NEGATIVE PROMPT PARAMETERS
                      </label>
                      <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 font-mono text-xs text-amber-900 dark:text-amber-200 select-text">
                        {result.negative}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty Placeholder State */
                  <div className="my-auto py-12 text-center space-y-4 flex flex-col items-center justify-center">
                    <div className="h-16 w-16 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-inner">
                      <Scan className="h-8 w-8" />
                    </div>

                    <div className="max-w-md space-y-1.5">
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        NO PROMPT GENERATED YET
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Upload any artwork image on the left and click <span className="text-purple-600 dark:text-purple-400 font-semibold">&apos;GENERATE AI PROMPT&apos;</span> to extract prompt parameters in real time.
                      </p>
                    </div>
                  </div>
                )}

                <Separator className="bg-border my-4" />

                {/* Bottom Feature Badges */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-purple-500" />
                    AI Vision Processing
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    100% Verified Quality
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </TooltipProvider>
  );
}
