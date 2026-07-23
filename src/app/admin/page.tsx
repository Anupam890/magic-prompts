"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllPromptsFromSupabase,
  getPendingPromptsFromSupabase,
  approvePromptInSupabase,
  rejectPromptInSupabase,
  type Prompt,
} from "@/lib/prompts-data";
import { Toaster } from "@/components/ui/sonner";
import {
  ArrowLeft,
  Search,
  TrendingUp,
  Eye,
  Heart,
  Copy as CopyIcon,
  Image as ImageIcon,
  Trash2,
  Pencil,
  Plus,
  Sun,
  Moon,
  LogOut,
  X,
  Loader2,
  Sparkles,
  Layers,
  Cpu,
  Check,
  Clock,
  Upload,
  Megaphone,
} from "lucide-react";
import { uploadImageFile } from "@/lib/cloudinary-client";
import { toast } from "sonner";
import { useTheme } from "@/app/providers";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

function formatNum(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

function StatCard({
  label,
  value,
  delta,
  Icon,
}: {
  label: string;
  value: string;
  delta: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl glass p-6">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-aurora opacity-20 blur-2xl" />
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
        <div className="rounded-xl bg-white/[0.06] p-2">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-6 font-display text-4xl font-medium tracking-tight">{value}</div>
      <div className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-400">
        <TrendingUp className="h-3 w-3" /> {delta}
      </div>
    </div>
  );
}

const getImageUrl = (img: unknown): string => {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (img && typeof img === "object" && "src" in img) {
    return (img as { src: string }).src;
  }
  return "";
};

interface DbCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

interface DbModel {
  id: string;
  name: string;
}

export default function Admin() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  
  // Tab control state: prompts | pending | categories | models
  const [activeTab, setActiveTab] = useState<"prompts" | "pending" | "categories" | "models">("prompts");
  
  // Database State loaded from Supabase
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const [pendingPrompts, setPendingPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [models, setModels] = useState<DbModel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch prompts
      const promptsData = await getAllPromptsFromSupabase();
      setAllPrompts(promptsData);

      // Fetch pending review submissions
      const pendingData = await getPendingPromptsFromSupabase();
      setPendingPrompts(pendingData);

      // 2. Fetch categories
      const { data: catData, error: catErr } = await supabase
        .from("categories")
        .select("*")
        .order("id", { ascending: true });
      if (catErr) throw catErr;
      if (catData) setCategories(catData);

      // 3. Fetch models
      const { data: modelData, error: modelErr } = await supabase
        .from("models")
        .select("*")
        .order("id", { ascending: true });
      if (modelErr) throw modelErr;
      if (modelData) setModels(modelData);
      
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to load records from database.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePrompt = async (id: string) => {
    try {
      await approvePromptInSupabase(id);
      toast.success("Prompt approved and published to live gallery!");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Failed to approve prompt.");
    }
  };

  const handleRejectPrompt = async (id: string) => {
    if (!confirm("Are you sure you want to reject and delete this prompt submission?")) return;
    try {
      await rejectPromptInSupabase(id);
      toast.success("Prompt submission rejected.");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Failed to reject prompt.");
    }
  };
  
  // Search & Filter State (Prompts tab)
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedModel, setSelectedModel] = useState("All");
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  // Modal Dialog Form State (Prompts)
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  
  // Modal Dialog Form State (Categories)
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catIcon, setCatIcon] = useState("Sparkles");
  const [catDesc, setCatDesc] = useState("");

  // Modal Dialog Form State (Models)
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [modelName, setModelName] = useState("");

  // Adsterra Ad Unit States (5 Formats)
  const [adsterraPopunder, setAdsterraPopunder] = useState("");
  const [adsterraSmartlink, setAdsterraSmartlink] = useState("");
  const [adsterraNative, setAdsterraNative] = useState("");
  const [adsterraSocialBar, setAdsterraSocialBar] = useState("");
  const [adsterraBanner, setAdsterraBanner] = useState("");
  const [adsEnabled, setAdsEnabled] = useState(true);

  useEffect(() => {
    try {
      setAdsterraPopunder(localStorage.getItem("adsterra_popunder_code") || "");
      setAdsterraSmartlink(localStorage.getItem("adsterra_smartlink_code") || "");
      setAdsterraNative(localStorage.getItem("adsterra_native_code") || "");
      setAdsterraSocialBar(localStorage.getItem("adsterra_socialbar_code") || "");
      setAdsterraBanner(localStorage.getItem("adsterra_banner_code") || "");
      setAdsEnabled(localStorage.getItem("adsterra_ads_enabled") !== "false");
    } catch (e) {}
  }, []);

  const handleSaveAdSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("adsterra_popunder_code", adsterraPopunder);
      localStorage.setItem("adsterra_smartlink_code", adsterraSmartlink);
      localStorage.setItem("adsterra_native_code", adsterraNative);
      localStorage.setItem("adsterra_socialbar_code", adsterraSocialBar);
      localStorage.setItem("adsterra_banner_code", adsterraBanner);
      localStorage.setItem("adsterra_ads_enabled", String(adsEnabled));
      toast.success("All 5 Adsterra Ad Formats saved & published live!");
    } catch (e) {
      toast.error("Failed to save ad settings.");
    }
  };

  const [formLoading, setFormLoading] = useState(false);

  // Prompt Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [formCategory, setFormCategory] = useState("E-commerce");
  const [formModel, setFormModel] = useState("Midjourney");
  const [description, setDescription] = useState("");
  const [promptText, setPromptText] = useState("");
  const [negative, setNegative] = useState("");
  const [tags, setTags] = useState("");
  const [aspect, setAspect] = useState("4:5");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isAdminDragging, setIsAdminDragging] = useState(false);

  const processAdminFile = async (file: File) => {
    setUploadingImage(true);
    try {
      toast.info("Uploading image to Cloudinary...");
      const { url, ratio: calculatedRatio } = await uploadImageFile(file);
      setImageUrl(url);
      setRatio(String(calculatedRatio));
      toast.success("Image uploaded to Cloudinary!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAdminFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAdminFile(file);
  };

  const handleAdminDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdminDragging(true);
  };

  const handleAdminDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdminDragging(false);
  };

  const handleAdminDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdminDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processAdminFile(file);
    } else if (file) {
      toast.error("Please drop a valid image file (PNG, JPG, WEBP).");
    }
  };

  // Fetch all tables from Supabase on mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    }
  };

  // -------------------------------------------------------------
  // PROMPTS CRUD HANDLERS
  // -------------------------------------------------------------
  const openCreatePromptModal = () => {
    setEditingPrompt(null);
    setTitle("");
    setSlug("");
    if (categories.length > 0) {
      setFormCategory(categories[0].name === "All" ? (categories[1]?.name || "E-commerce") : categories[0].name);
    } else {
      setFormCategory("E-commerce");
    }
    if (models.length > 0) {
      setFormModel(models[0].name);
    } else {
      setFormModel("Midjourney");
    }
    setDescription("");
    setPromptText("");
    setNegative("");
    setTags("");
    setAspect("4:5");
    setImageUrl("");
    setRatio("1.25");
    setIsPromptModalOpen(true);
  };

  const openEditPromptModal = (p: Prompt) => {
    setEditingPrompt(p);
    setTitle(p.title);
    setSlug(p.slug);
    setFormCategory(p.category);
    setFormModel(p.model);
    setDescription(p.description);
    setPromptText(p.prompt);
    setNegative(p.negative || "");
    setTags(p.tags.join(", "));
    setAspect(p.aspect);
    setImageUrl(getImageUrl(p.image));
    setRatio(String(p.ratio));
    setIsPromptModalOpen(true);
  };

  const handleSavePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !description || !promptText || !imageUrl) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setFormLoading(true);
    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const promptPayload = {
      slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
      title: title.trim(),
      category: formCategory,
      model: formModel,
      description: description.trim(),
      prompt: promptText.trim(),
      negative: negative.trim() || null,
      tags: parsedTags,
      aspect: aspect.trim(),
      image_url: imageUrl.trim(),
      ratio: parseFloat(ratio) || 1.0,
    };

    try {
      if (editingPrompt) {
        const { error } = await supabase
          .from("prompts")
          .update(promptPayload)
          .eq("id", editingPrompt.id);
        if (error) throw error;
        toast.success("Prompt updated successfully!");
      } else {
        const { error } = await supabase
          .from("prompts")
          .insert({
            id: Math.random().toString(36).substring(2, 15),
            ...promptPayload,
            views: 0,
            likes: 0,
            copies: 0,
          });
        if (error) throw error;
        toast.success("New prompt added successfully!");
      }
      setIsPromptModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save prompt.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePrompt = async (p: Prompt) => {
    if (!confirm(`Are you sure you want to delete "${p.title}"?`)) return;

    try {
      const { error } = await supabase
        .from("prompts")
        .delete()
        .eq("id", p.id);
      if (error) throw error;
      toast.success("Prompt deleted successfully!");
      fetchData();
    } catch (err: any) {
      setHidden((prev) => new Set(prev).add(p.id));
      toast.info("Removed locally.");
    }
  };

  // -------------------------------------------------------------
  // CATEGORIES CRUD HANDLERS
  // -------------------------------------------------------------
  const openCreateCatModal = () => {
    setCatName("");
    setCatSlug("");
    setCatIcon("Sparkles");
    setCatDesc("");
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catSlug || !catIcon) {
      toast.error("Please fill in required fields.");
      return;
    }
    setFormLoading(true);
    try {
      const { error } = await supabase.from("categories").insert({
        name: catName.trim(),
        slug: catSlug.trim().toLowerCase().replace(/\s+/g, "-"),
        icon: catIcon.trim(),
        description: catDesc.trim(),
      });
      if (error) throw error;
      toast.success("Category added successfully!");
      setIsCatModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save category.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (c: DbCategory) => {
    if (c.name === "All") {
      toast.error("The 'All' category is protected and cannot be deleted.");
      return;
    }
    if (!confirm(`Are you sure you want to delete the category "${c.name}"? This could leave prompts uncategorized.`)) return;
    try {
      const { error } = await supabase.from("categories").delete().eq("id", c.id);
      if (error) throw error;
      toast.success("Category deleted successfully!");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category.");
    }
  };

  // -------------------------------------------------------------
  // MODELS CRUD HANDLERS
  // -------------------------------------------------------------
  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName) {
      toast.error("Please enter a model name.");
      return;
    }
    setFormLoading(true);
    try {
      const { error } = await supabase.from("models").insert({
        name: modelName.trim(),
      });
      if (error) throw error;
      toast.success("AI Model registered successfully!");
      setIsModelModalOpen(false);
      setModelName("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save model.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteModel = async (m: DbModel) => {
    if (!confirm(`Are you sure you want to delete the model "${m.name}"?`)) return;
    try {
      const { error } = await supabase.from("models").delete().eq("id", m.id);
      if (error) throw error;
      toast.success("Model deleted successfully!");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete model.");
    }
  };

  // -------------------------------------------------------------
  // DATA FILTER LOGIC (PROMPTS TAB)
  // -------------------------------------------------------------
  const visible = useMemo(() => allPrompts.filter((p) => !hidden.has(p.id)), [allPrompts, hidden]);

  const rows = useMemo(() => {
    return visible.filter((p) => {
      if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
      if (selectedModel !== "All" && p.model !== selectedModel) return false;
      if (q && !`${p.title} ${p.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [visible, q, selectedCategory, selectedModel]);

  const totals = useMemo(() => {
    const views = visible.reduce((s, p) => s + p.views, 0);
    const likes = visible.reduce((s, p) => s + p.likes, 0);
    const copies = visible.reduce((s, p) => s + p.copies, 0);
    return { views, likes, copies };
  }, [visible]);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-purple-500/30">      {/* Main Admin Dashboard Layout */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10">
        {/* Top Navbar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl glass p-2 hover:bg-white/[0.08] transition text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-xl glass p-2 hover:bg-red-500/10 transition text-red-400 cursor-pointer"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>

            {/* Context-aware CTA button */}
            {activeTab === "prompts" && (
              <button
                onClick={openCreatePromptModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 transition cursor-pointer shadow-lg"
              >
                <Plus className="h-4 w-4" /> New prompt
              </button>
            )}
            {activeTab === "categories" && (
              <button
                onClick={openCreateCatModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 transition cursor-pointer shadow-lg"
              >
                <Plus className="h-4 w-4" /> New category
              </button>
            )}
            {activeTab === "models" && (
              <button
                onClick={() => setIsModelModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 transition cursor-pointer shadow-lg"
              >
                <Plus className="h-4 w-4" /> Register Model
              </button>
            )}
          </div>
        </div>
          {/* -------------------------------------------------------------
            2-COLUMN DASHBOARD GRID: LEFT SIDEBAR & RIGHT CONTENT
            ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
          {/* LEFT SIDEBAR NAVIGATION */}
          <aside className="sticky top-24 rounded-3xl glass p-4 border border-white/10 space-y-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold px-3 mb-1">
                Management
              </div>
              <h2 className="font-display text-xl font-bold px-3">Admin Panel</h2>
            </div>

            {/* Sidebar Navigation Items */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("prompts")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                  activeTab === "prompts"
                    ? "bg-white text-black font-bold shadow-lg"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="h-4 w-4" />
                  <span>Prompts</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === "prompts" ? "bg-black/10 text-black font-bold" : "bg-white/10 text-zinc-300"}`}>
                  {visible.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("pending")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                  activeTab === "pending"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-600/30"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4" />
                  <span>Pending Reviews</span>
                </div>
                {pendingPrompts.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-bold animate-pulse">
                    {pendingPrompts.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("categories")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                  activeTab === "categories"
                    ? "bg-white text-black font-bold shadow-lg"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="h-4 w-4" />
                  <span>Categories</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === "categories" ? "bg-black/10 text-black font-bold" : "bg-white/10 text-zinc-300"}`}>
                  {categories.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("models")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                  activeTab === "models"
                    ? "bg-white text-black font-bold shadow-lg"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="h-4 w-4" />
                  <span>AI Models</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === "models" ? "bg-black/10 text-black font-bold" : "bg-white/10 text-zinc-300"}`}>
                  {models.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("ads")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                  activeTab === "ads"
                    ? "bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Megaphone className="h-4 w-4 text-amber-400" />
                  <span>Adsterra Ads</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === "ads" ? "bg-black/20 text-black font-bold" : "bg-amber-400/20 text-amber-300 font-bold"}`}>
                  LIVE
                </span>
              </button>
            </nav>
          </aside>

          {/* RIGHT SIDE DYNAMIC CONTENT VIEW */}
          <main className="space-y-8 min-w-0">
            {/* Stat Cards (only visible on prompts tab for clarity) */}
            {activeTab === "prompts" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  label="Total Prompts"
                  value={loading ? "..." : formatNum(visible.length)}
                  delta="+12% this week"
                  Icon={ImageIcon}
                />
                <StatCard 
                  label="Total views" 
                  value={loading ? "..." : formatNum(totals.views)} 
                  delta="+8.4%" 
                  Icon={Eye} 
                />
                <StatCard 
                  label="Total likes" 
                  value={loading ? "..." : formatNum(totals.likes)} 
                  delta="+14.2%" 
                  Icon={Heart} 
                />
                <StatCard 
                  label="Total copies" 
                  value={loading ? "..." : formatNum(totals.copies)} 
                  delta="+6.1%" 
                  Icon={CopyIcon} 
                />
              </div>
            )}

        {/* -------------------------------------------------------------
            TAB CONTENT: PROMPTS
            ------------------------------------------------------------- */}
        {activeTab === "prompts" && (
          <div className="mt-4 rounded-3xl glass p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search prompts, tags…"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-white/30 transition text-white"
                />
              </div>
              
              {/* Category Select Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm outline-none text-zinc-300 [&>option]:bg-zinc-950 [&>option]:text-white cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.filter(c => c.name !== "All").map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              
              {/* Model Select Filter */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm outline-none text-zinc-300 [&>option]:bg-zinc-950 [&>option]:text-white cursor-pointer"
              >
                <option value="All">All models</option>
                {models.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground ml-auto">
                {rows.length} of {visible.length}
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/5">
              <div className="max-h-[560px] overflow-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <span className="text-xs">Fetching dynamic prompt records…</span>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-zinc-950/90 backdrop-blur text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3.5 font-medium">Prompt Title</th>
                        <th className="px-4 py-3.5 font-medium">Category</th>
                        <th className="px-4 py-3.5 font-medium">Model</th>
                        <th className="px-4 py-3.5 font-medium text-right">Views</th>
                        <th className="px-4 py-3.5 font-medium text-right">Likes</th>
                        <th className="px-4 py-3.5 font-medium text-right">Copies</th>
                        <th className="px-4 py-3.5 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 60).map((p) => (
                        <tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.02] transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={getImageUrl(p.image)}
                                alt=""
                                className="h-10 w-10 rounded-lg object-cover bg-zinc-900 border border-white/10"
                              />
                              <div>
                                <div className="font-medium text-white">{p.title}</div>
                                <div className="text-xs text-zinc-500 font-mono">{p.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-zinc-400">{p.category}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full glass px-2.5 py-1 text-[10px] font-medium text-purple-300">
                              {p.model}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-zinc-300">{formatNum(p.views)}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-zinc-300">{formatNum(p.likes)}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-zinc-300">{formatNum(p.copies)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditPromptModal(p)}
                                className="rounded-lg p-2 hover:bg-white/[0.06] transition text-zinc-400 hover:text-white cursor-pointer"
                                aria-label="Edit"
                                title="Edit prompt"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePrompt(p)}
                                className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                                aria-label="Delete"
                                title="Delete prompt"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {rows.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                            No prompts match these filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB CONTENT: PENDING REVIEWS
            ------------------------------------------------------------- */}
        {activeTab === "pending" && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display">Pending Submissions Queue</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Review user-submitted prompts. Approved prompts appear instantly in the live gallery.
                </p>
              </div>
              <span className="rounded-xl glass px-3 py-1.5 text-xs text-purple-400 font-semibold border border-purple-500/20">
                {pendingPrompts.length} Pending
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <span className="text-xs">Loading pending submissions queue…</span>
              </div>
            ) : pendingPrompts.length === 0 ? (
              <div className="rounded-3xl glass p-12 text-center border border-white/5 space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold">Queue is clear!</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  All user prompt submissions have been reviewed and moderated.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingPrompts.map((p) => (
                  <div
                    key={p.id}
                    className="relative overflow-hidden rounded-3xl glass border border-white/10 p-5 flex flex-col justify-between space-y-4 hover:border-purple-500/30 transition group"
                  >
                    <div>
                      {/* Image Preview & Badges */}
                      <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4 bg-black/40 border border-white/5">
                        <img
                          src={getImageUrl(p.image)}
                          alt={p.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-2 left-2 flex gap-1.5">
                          <span className="rounded-lg bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                            {p.category}
                          </span>
                          <span className="rounded-lg bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                            {p.model}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-display text-base font-bold text-foreground line-clamp-1">{p.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.prompt}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                      <button
                        onClick={() => handleApprovePrompt(p.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 shadow-md shadow-emerald-900/30 transition cursor-pointer"
                      >
                        <Check className="h-4 w-4" />
                        Approve & Publish
                      </button>
                      <button
                        onClick={() => handleRejectPrompt(p.id)}
                        className="flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2.5 transition cursor-pointer border border-red-500/20"
                        title="Reject submission"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB CONTENT: CATEGORIES
            ------------------------------------------------------------- */}
        {activeTab === "categories" && (
          <div className="mt-10 rounded-3xl glass p-4 md:p-6">
            <div className="overflow-hidden rounded-2xl border border-white/5">
              <div className="max-h-[560px] overflow-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <span className="text-xs">Fetching categories record…</span>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-zinc-950/90 backdrop-blur text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3.5 font-medium">Category Name</th>
                        <th className="px-4 py-3.5 font-medium">URL Slug</th>
                        <th className="px-4 py-3.5 font-medium">Lucide Icon</th>
                        <th className="px-4 py-3.5 font-medium">Description</th>
                        <th className="px-4 py-3.5 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c) => (
                        <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.02] transition">
                          <td className="px-4 py-4">
                            <span className="font-semibold text-white">{c.name}</span>
                          </td>
                          <td className="px-4 py-4 text-zinc-400 font-mono text-xs">{c.slug}</td>
                          <td className="px-4 py-4 text-purple-300 text-xs font-mono">{c.icon}</td>
                          <td className="px-4 py-4 text-zinc-400 max-w-sm truncate">{c.description}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => handleDeleteCategory(c)}
                                disabled={c.name === "All"}
                                className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 transition cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent"
                                aria-label="Delete"
                                title="Delete category"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB CONTENT: MODELS
            ------------------------------------------------------------- */}
        {activeTab === "models" && (
          <div className="mt-10 rounded-3xl glass p-4 md:p-6">
            <div className="overflow-hidden rounded-2xl border border-white/5 max-w-xl">
              <div className="max-h-[560px] overflow-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <span className="text-xs">Fetching model list…</span>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-zinc-950/90 backdrop-blur text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3.5 font-medium">AI Model name</th>
                        <th className="px-4 py-3.5 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {models.map((m) => (
                        <tr key={m.id} className="border-t border-white/5 hover:bg-white/[0.02] transition">
                          <td className="px-4 py-4">
                            <span className="font-semibold text-white">{m.name}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => handleDeleteModel(m)}
                                className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                                aria-label="Delete"
                                title="Delete model"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB CONTENT: ADSTERRA ADS MANAGEMENT PANEL
            ------------------------------------------------------------- */}
        {activeTab === "ads" && (
          <div className="rounded-3xl glass p-6 md:p-8 space-y-8 border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Megaphone className="h-6 w-6 text-amber-400" />
                  <h2 className="font-display text-2xl font-bold">Adsterra Ad Networks Panel</h2>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                  Manage your Adsterra Ad scripts, banners (728x90), native widgets, and popunder ad codes directly across the entire website.
                </p>
              </div>

              {/* Master Ads Toggle Switch */}
              <div className="flex items-center gap-3 glass p-3 rounded-2xl border border-white/10">
                <span className="text-xs font-semibold text-zinc-300">Enable Website Ads:</span>
                <button
                  type="button"
                  onClick={() => setAdsEnabled((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    adsEnabled ? "bg-amber-400" : "bg-zinc-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      adsEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveAdSettings} className="space-y-6">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Choose & Configure Ad Unit formats:
              </div>

              {/* Grid Layout for all 5 Adsterra Formats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Popunder (TOP) */}
                <div className="space-y-2 rounded-2xl glass border border-white/10 p-5 bg-black/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Popunder</span>
                      <span className="bg-green-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow-sm">
                        TOP
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400">High Revenue</span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Paste Adsterra Popunder Script Code..."
                    value={adsterraPopunder}
                    onChange={(e) => setAdsterraPopunder(e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs font-mono text-amber-200 outline-none focus:border-amber-400/60 transition resize-none"
                  />
                </div>

                {/* 2. Smartlink */}
                <div className="space-y-2 rounded-2xl glass border border-white/10 p-5 bg-black/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Smartlink</span>
                    <span className="text-[10px] text-zinc-400">Direct URL / Script</span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Paste Adsterra Smartlink URL or Script..."
                    value={adsterraSmartlink}
                    onChange={(e) => setAdsterraSmartlink(e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs font-mono text-amber-200 outline-none focus:border-amber-400/60 transition resize-none"
                  />
                </div>

                {/* 3. Native Banner */}
                <div className="space-y-2 rounded-2xl glass border border-white/10 p-5 bg-black/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Native Banner</span>
                    <span className="text-[10px] text-zinc-400">In-Feed Widget</span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Paste Adsterra Native Banner Script..."
                    value={adsterraNative}
                    onChange={(e) => setAdsterraNative(e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs font-mono text-amber-200 outline-none focus:border-amber-400/60 transition resize-none"
                  />
                </div>

                {/* 4. Social Bar (TOP) */}
                <div className="space-y-2 rounded-2xl glass border border-white/10 p-5 bg-black/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Social Bar</span>
                      <span className="bg-green-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow-sm">
                        TOP
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400">Interactive Push</span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Paste Adsterra Social Bar Script Code..."
                    value={adsterraSocialBar}
                    onChange={(e) => setAdsterraSocialBar(e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs font-mono text-amber-200 outline-none focus:border-amber-400/60 transition resize-none"
                  />
                </div>
              </div>

              {/* 5. Standard Banner (728x90 / 300x250) */}
              <div className="space-y-2 rounded-2xl glass border border-white/10 p-5 bg-black/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Banner (728x90, 468x60, 300x250)</span>
                  <span className="text-[10px] text-zinc-400">Display Ads</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Paste Adsterra Display Banner Iframe Script..."
                  value={adsterraBanner}
                  onChange={(e) => setAdsterraBanner(e.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs font-mono text-amber-200 outline-none focus:border-amber-400/60 transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-8 py-3 text-xs font-bold hover:scale-[1.02] transition shadow-lg shadow-amber-400/20 cursor-pointer"
                >
                  Save & Activate All 5 Ad Units Live
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  </div>

      {/* -------------------------------------------------------------
          MODAL: CREATE & EDIT PROMPT
          ------------------------------------------------------------- */}
      {isPromptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-strong border border-white/10 p-6 md:p-8 bg-zinc-950/90 shadow-2xl backdrop-blur-xl animate-scale-up">
            <button
              onClick={() => setIsPromptModalOpen(false)}
              className="absolute top-4 right-4 rounded-xl glass p-1.5 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-semibold text-white">
                {editingPrompt ? "Edit Prompt Details" : "Create New Prompt"}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Configure properties and variables for this prompt library asset.
              </p>
            </div>
            <form onSubmit={handleSavePrompt} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Prompt Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cinematic Luxury Watch"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editingPrompt) {
                        setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                      }
                    }}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Slug URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. luxury-watch-shot"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Category Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 [&>option]:bg-zinc-950"
                  >
                    {categories.filter(c => c.name !== "All").map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">AI Model *</label>
                  <select
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 [&>option]:bg-zinc-950"
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Summary Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Editorial-grade product shot with dramatic light."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Visual Prompt Text *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter prompt triggers..."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 resize-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Negative Prompt</label>
                <input
                  type="text"
                  placeholder="e.g. blurry, low quality"
                  value={negative}
                  onChange={(e) => setNegative(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Tags (comma-separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="luxury, watch, photorealistic"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-zinc-300 mb-1 block">Showcase Image *</label>
                  <div
                    onDragOver={handleAdminDragOver}
                    onDragLeave={handleAdminDragLeave}
                    onDrop={handleAdminDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[110px] ${
                      isAdminDragging
                        ? "border-purple-500 bg-purple-500/15 scale-[1.01]"
                        : imageUrl
                        ? "border-purple-500/40 bg-purple-500/5"
                        : "border-white/10 bg-white/[0.03] hover:border-purple-500/50"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAdminFileUpload}
                      disabled={uploadingImage}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />

                    {uploadingImage ? (
                      <div className="flex flex-col items-center justify-center py-2 gap-1.5 text-purple-400">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-xs font-medium">Uploading artwork to Cloudinary…</span>
                      </div>
                    ) : imageUrl ? (
                      <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-3">
                          <img
                            src={imageUrl}
                            alt="Preview"
                            className="h-12 w-12 rounded-none object-cover border border-white/10"
                          />
                          <div className="text-left">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-400">
                              <Check className="h-3.5 w-3.5 text-green-400" /> Image Uploaded
                            </span>
                            <p className="text-[10px] text-zinc-400 line-clamp-1 max-w-[200px]">
                              Cloudinary CDN Ready
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-purple-400 underline font-semibold shrink-0">Change</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-1 gap-1.5">
                        <Upload className="h-5 w-5 text-purple-400" />
                        <span className="text-xs text-zinc-300 font-medium">
                          Drag & drop image here or <strong className="text-purple-400 underline">browse file</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Aspect Aspect Ratio *</label>
                  <select
                    value={aspect}
                    onChange={(e) => setAspect(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 [&>option]:bg-zinc-950"
                  >
                    <option value="4:5">4:5 (Standard Portrait)</option>
                    <option value="16:9">16:9 (Landscape HD)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="9:16">9:16 (Vertical Story)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Grid Aspect Ratio Size (Height/Width)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1.25 for portrait, 0.9 for landscape"
                    value={ratio}
                    onChange={(e) => setRatio(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsPromptModalOpen(false)}
                  disabled={formLoading}
                  className="rounded-xl glass px-5 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-xl bg-white text-black px-6 py-2.5 text-xs font-bold hover:bg-white/90 transition cursor-pointer flex items-center gap-1.5"
                >
                  {formLoading && <Loader2 className="h-3 w-3 animate-spin text-purple-600" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: CREATE CATEGORY
          ------------------------------------------------------------- */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl glass-strong border border-white/10 p-6 md:p-8 bg-zinc-950/90 shadow-2xl backdrop-blur-xl animate-scale-up">
            <button
              onClick={() => setIsCatModalOpen(false)}
              className="absolute top-4 right-4 rounded-xl glass p-1.5 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-semibold text-white">Create Category</h2>
              <p className="text-xs text-zinc-400 mt-1">Add a new dynamic category filter group.</p>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Interior Design"
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    setCatSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                  }}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">URL Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. interior-design"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Lucide Icon Name *</label>
                <select
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 [&>option]:bg-zinc-950"
                >
                  <option value="Sparkles">Sparkles (General)</option>
                  <option value="ShoppingBag">ShoppingBag (E-commerce)</option>
                  <option value="Aperture">Aperture (Photo Editing)</option>
                  <option value="User">User (Portraits)</option>
                  <option value="Swords">Swords (Characters)</option>
                  <option value="Star">Star (Anime)</option>
                  <option value="Palette">Palette (Art Styles)</option>
                  <option value="Sofa">Sofa (Interior)</option>
                  <option value="Wand2">Wand2 (Visual Effects)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Category header subtitle details..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  disabled={formLoading}
                  className="rounded-xl glass px-5 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-xl bg-white text-black px-6 py-2.5 text-xs font-bold hover:bg-white/90 transition cursor-pointer flex items-center gap-1.5"
                >
                  {formLoading && <Loader2 className="h-3 w-3 animate-spin text-purple-600" />}
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: CREATE MODEL
          ------------------------------------------------------------- */}
      {isModelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl glass-strong border border-white/10 p-6 md:p-8 bg-zinc-950/90 shadow-2xl backdrop-blur-xl animate-scale-up">
            <button
              onClick={() => setIsModelModalOpen(false)}
              className="absolute top-4 right-4 rounded-xl glass p-1.5 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-semibold text-white">Register AI Model</h2>
              <p className="text-xs text-zinc-400 mt-1">Register a new supported AI generator platform.</p>
            </div>
            <form onSubmit={handleSaveModel} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stable Diffusion 3"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModelModalOpen(false)}
                  disabled={formLoading}
                  className="rounded-xl glass px-5 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-xl bg-white text-black px-6 py-2.5 text-xs font-bold hover:bg-white/90 transition cursor-pointer flex items-center gap-1.5"
                >
                  {formLoading && <Loader2 className="h-3 w-3 animate-spin text-purple-600" />}
                  Register Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
