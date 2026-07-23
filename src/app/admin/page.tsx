"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { getAllPromptsFromSupabase, type Prompt } from "@/lib/prompts-data";
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
} from "lucide-react";
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
  
  // Tab control state: prompts | categories | models
  const [activeTab, setActiveTab] = useState<"prompts" | "categories" | "models">("prompts");
  
  // Database State loaded from Supabase
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [models, setModels] = useState<DbModel[]>([]);
  const [loading, setLoading] = useState(true);
  
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
  const [ratio, setRatio] = useState("1.25");

  // Fetch all tables from Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch prompts
      const promptsData = await getAllPromptsFromSupabase();
      setAllPrompts(promptsData);

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
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-purple-500/30">
      <div className="mx-auto max-w-7xl px-6 py-10">
        
        {/* Top bar header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl glass p-2 hover:bg-white/[0.08] dark:hover:bg-white/[0.08] transition text-muted-foreground hover:text-foreground cursor-pointer"
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 transition cursor-pointer shadow-lg shadow-white/5"
              >
                <Plus className="h-4 w-4" /> New prompt
              </button>
            )}
            {activeTab === "categories" && (
              <button
                onClick={openCreateCatModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 transition cursor-pointer shadow-lg shadow-white/5"
              >
                <Plus className="h-4 w-4" /> New category
              </button>
            )}
            {activeTab === "models" && (
              <button
                onClick={() => setIsModelModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 transition cursor-pointer shadow-lg shadow-white/5"
              >
                <Plus className="h-4 w-4" /> Register Model
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Title */}
        <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 font-semibold">Admin Panel</div>
            <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-zinc-400 max-w-xl leading-relaxed">
              Create, read, update, and delete prompts, categories, and AI models directly in your Supabase backend.
            </p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex bg-white/[0.03] border border-white/10 p-1.5 rounded-2xl gap-1 shrink-0 md:self-end">
            <button
              onClick={() => setActiveTab("prompts")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                activeTab === "prompts"
                  ? "bg-white text-black shadow-md shadow-white/5"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Prompts ({visible.length})
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                activeTab === "categories"
                  ? "bg-white text-black shadow-md shadow-white/5"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab("models")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                activeTab === "models"
                  ? "bg-white text-black shadow-md shadow-white/5"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              Models ({models.length})
            </button>
          </div>
        </div>

        {/* Stat Cards (only visible on prompts tab for clarity) */}
        {activeTab === "prompts" && (
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              label="Likes" 
              value={loading ? "..." : formatNum(totals.likes)} 
              delta="+5.1%" 
              Icon={Heart} 
            />
            <StatCard 
              label="Copies" 
              value={loading ? "..." : formatNum(totals.copies)} 
              delta="+3.7%" 
              Icon={CopyIcon} 
            />
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB CONTENT: PROMPTS
            ------------------------------------------------------------- */}
        {activeTab === "prompts" && (
          <div className="mt-10 rounded-3xl glass p-4 md:p-6">
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
                  <label className="text-xs font-semibold text-zinc-300">Showcase Image URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 font-mono"
                  />
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

      <Toaster />
    </div>
  );
}
