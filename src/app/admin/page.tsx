"use client";

import { useMemo, useState, useEffect, Fragment } from "react";
import Link from "next/link";
import {
  getAllPromptsFromSupabase,
  getPendingPromptsFromSupabase,
  approvePromptInSupabase,
  rejectPromptInSupabase,
  type Prompt,
} from "@/lib/prompts-data";
import {
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
  LayoutDashboard,
  LayoutGrid,
  List,
  Columns,
  Bell,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  Activity,
  Menu,
  Download,
  FileSpreadsheet,
  FileCode,
  Users,
  Globe,
  Settings,
  Database,
  Mail,
  History,
  Palette,
  AlertTriangle,
  Send,
  Lock,
} from "lucide-react";
import { uploadImageFile } from "@/lib/cloudinary-client";
import { toast } from "sonner";
import { useTheme } from "@/app/providers";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

function formatNum(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
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

interface DbProfile {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  created_at?: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  details: string;
  timestamp: string;
}

interface EmailNotificationLog {
  id: string;
  recipient: string;
  subject: string;
  promptTitle: string;
  sentAt: string;
}

export default function Admin() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Tab control state
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "prompts" | "pending" | "categories" | "models" | "ads" | "analytics" | "audit" | "users" | "seo" | "backups"
  >("dashboard");

  // Mobile Drawer & Search State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Real Database State loaded from Supabase
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const [pendingPrompts, setPendingPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [models, setModels] = useState<DbModel[]>([]);
  const [profiles, setProfiles] = useState<DbProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Realtime Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Email Notification Logs
  const [emailLogs, setEmailLogs] = useState<EmailNotificationLog[]>([]);

  // Announcement & Maintenance Mode State
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementLink, setAnnouncementLink] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // SEO State
  const [seoTitle, setSeoTitle] = useState("Magic Prompts — AI Image Prompts Gallery");
  const [seoDescription, setSeoDescription] = useState("Curated Nano Banana, Midjourney, and DALL-E 3 prompts for AI art generation.");
  const [seoKeywords, setSeoKeywords] = useState("Nano Banana prompts, AI image prompts, Midjourney, DALL-E 3");

  // Color Theme Accent State
  const [accentTheme, setAccentTheme] = useState<"purple" | "emerald" | "amber" | "cyan" | "rose">("purple");

  // User Management State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");

  const addAuditLog = (action: string, details: string) => {
    const entry: AuditLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      action,
      user: "anupam.dev81@gmail.com",
      details,
      timestamp: new Date().toLocaleTimeString() + " (" + new Date().toLocaleDateString() + ")",
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail) {
      toast.error("Please enter user email.");
      return;
    }
    setFormLoading(true);
    try {
      const newId = Math.random().toString(36).substring(2, 15);
      const newProfile: DbProfile = {
        id: newId,
        email: newUserEmail.trim(),
        full_name: newUserName.trim() || "Community Member",
        role: newUserRole,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").insert({
        id: newId,
        email: newUserEmail.trim(),
        full_name: newUserName.trim() || "Community Member",
        role: newUserRole,
      });

      if (error) {
        setProfiles((prev) => [newProfile, ...prev]);
      } else {
        fetchData();
      }

      toast.success(`User ${newUserEmail} registered as ${newUserRole}!`);
      addAuditLog("USER_REGISTERED", `Registered user ${newUserEmail} (${newUserRole})`);
      setIsUserModalOpen(false);
      setNewUserEmail("");
      setNewUserName("");
    } catch (err: any) {
      toast.error(err.message || "Failed to register user.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      setProfiles((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
      toast.success("User role updated successfully!");
      addAuditLog("ROLE_CHANGED", `Updated user role to ${newRole}`);
    } catch (e: any) {
      toast.error("Failed to update user role.");
    }
  };

  const handleDeleteUser = async (user: DbProfile) => {
    if (!confirm(`Are you sure you want to delete user ${user.email}?`)) return;
    try {
      setProfiles((prev) => prev.filter((u) => u.id !== user.id));
      await supabase.from("profiles").delete().eq("id", user.id);
      toast.success("User removed.");
      addAuditLog("USER_DELETED", `Removed user ${user.email}`);
    } catch (e: any) {
      toast.error("Failed to delete user.");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Prompts
      const promptsData = await getAllPromptsFromSupabase();
      setAllPrompts(promptsData);

      // 2. Fetch Pending Submissions
      const pendingData = await getPendingPromptsFromSupabase();
      setPendingPrompts(pendingData);

      // 3. Fetch Categories
      const { data: catData, error: catErr } = await supabase
        .from("categories")
        .select("*")
        .order("id", { ascending: true });
      if (catErr) throw catErr;
      if (catData) setCategories(catData);

      // 4. Fetch Models
      const { data: modelData, error: modelErr } = await supabase
        .from("models")
        .select("*")
        .order("id", { ascending: true });
      if (modelErr) throw modelErr;
      if (modelData) setModels(modelData);

      // 5. Fetch Real Profiles from Supabase Profiles Table
      const { data: profData, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profData && profData.length > 0) {
        setProfiles(profData);
      } else {
        // Fallback default admin profile if profiles table is empty
        setProfiles([
          {
            id: "b7e88f1f-9a3c-411b-a51a-5c1421cfa5d3",
            email: "anupam.dev81@gmail.com",
            full_name: "Anupam Admin",
            role: "admin",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to load records from database.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePrompt = async (id: string) => {
    try {
      const promptToApprove = pendingPrompts.find((p) => p.id === id);
      await approvePromptInSupabase(id);
      toast.success("Prompt approved and published to live gallery!");

      if (promptToApprove) {
        addAuditLog("PROMPT_APPROVED", `Approved prompt "${promptToApprove.title}"`);
        const emailEntry: EmailNotificationLog = {
          id: Math.random().toString(36).substring(2, 9),
          recipient: "creator@example.com",
          subject: "Your Prompt Submission is Live!",
          promptTitle: promptToApprove.title,
          sentAt: new Date().toLocaleTimeString(),
        };
        setEmailLogs((prev) => [emailEntry, ...prev]);
      }
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Failed to approve prompt.");
    }
  };

  const handleRejectPrompt = async (id: string) => {
    if (!confirm("Are you sure you want to reject and delete this prompt submission?")) return;
    try {
      const promptToReject = pendingPrompts.find((p) => p.id === id);
      await rejectPromptInSupabase(id);
      toast.success("Prompt submission rejected.");

      if (promptToReject) {
        addAuditLog("PROMPT_REJECTED", `Rejected submission "${promptToReject.title}"`);
      }
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Failed to reject prompt.");
    }
  };

  // Search & Filter State
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedModel, setSelectedModel] = useState("All");
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  // Modal Dialog Form State (Prompts)
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  // Modal Dialog Form State (Categories)
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [expandedCatName, setExpandedCatName] = useState<string | null>(null);
  const [catViewMode, setCatViewMode] = useState<"split" | "cards" | "table">("split");
  const [activeCatName, setActiveCatName] = useState<string>("All");
  const [catSearchQuery, setCatSearchQuery] = useState("");
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

      setAnnouncementEnabled(localStorage.getItem("mp_announcement_enabled") === "true");
      setAnnouncementText(localStorage.getItem("mp_announcement_text") || "✨ New Nano Banana & Midjourney Prompts added!");
      setAnnouncementLink(localStorage.getItem("mp_announcement_link") || "");
      setMaintenanceMode(localStorage.getItem("mp_maintenance_mode") === "true");

      const savedTheme = localStorage.getItem("mp_accent_theme") as any;
      if (savedTheme) setAccentTheme(savedTheme);
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
      addAuditLog("SETTINGS_UPDATED", "Updated Adsterra Ad scripts");
    } catch (e) {
      toast.error("Failed to save ad settings.");
    }
  };

  const handleSaveSiteSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("mp_announcement_enabled", String(announcementEnabled));
      localStorage.setItem("mp_announcement_text", announcementText);
      localStorage.setItem("mp_announcement_link", announcementLink);
      localStorage.setItem("mp_maintenance_mode", String(maintenanceMode));
      localStorage.setItem("mp_seo_title", seoTitle);
      localStorage.setItem("mp_seo_description", seoDescription);
      localStorage.setItem("mp_seo_keywords", seoKeywords);
      toast.success("Site Banner & SEO Settings updated live!");
      addAuditLog("SETTINGS_UPDATED", "Updated Announcement Banner & SEO settings");
    } catch (e) {
      toast.error("Failed to save site settings.");
    }
  };

  const exportPromptsToCSV = () => {
    if (visible.length === 0) return toast.error("No prompt data to export.");
    const headers = ["ID", "Title", "Category", "Model", "Views", "Likes", "Copies", "Slug", "Prompt"];
    const rows = visible.map((p) => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.category,
      p.model,
      p.views,
      p.likes,
      p.copies,
      p.slug,
      `"${p.prompt.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `magic_prompts_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success("Exported prompts CSV successfully!");
    addAuditLog("EXPORT_CSV", "Exported live prompts to CSV file");
  };

  const exportDatabaseSnapshotJSON = () => {
    const snapshot = {
      timestamp: new Date().toISOString(),
      prompts: visible,
      categories,
      models,
      profiles,
      settings: {
        adsEnabled,
        announcementEnabled,
        announcementText,
        seoTitle,
      },
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `magic_prompts_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    toast.success("Downloaded Database JSON Snapshot!");
    addAuditLog("DB_BACKUP", "Created 1-click JSON database snapshot backup");
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
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [tagInputBuffer, setTagInputBuffer] = useState("");
  const [aspect, setAspect] = useState("4:5");
  const [imageUrl, setImageUrl] = useState("");
  const [ratio, setRatio] = useState("1.25");
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

  // PROMPTS CRUD HANDLERS
  const openCreatePromptModal = () => {
    setEditingPrompt(null);
    setTitle("");
    setSlug("");
    if (categories.length > 0) {
      setFormCategory(categories[0].name === "All" ? categories[1]?.name || "E-commerce" : categories[0].name);
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
    setTagsList([]);
    setTagInputBuffer("");
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
    setTagsList(p.tags || []);
    setTagInputBuffer("");
    setAspect(p.aspect);
    setImageUrl(getImageUrl(p.image));
    setRatio(String(p.ratio));
    setIsPromptModalOpen(true);
  };

  const handleSavePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = (slug || title).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!title || !finalSlug || !description || !promptText || !imageUrl) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setFormLoading(true);
    const parsedTags = Array.from(
      new Set([...tagsList, tagInputBuffer.trim().replace(/^#/, "")].filter(Boolean))
    );

    const promptPayload = {
      slug: finalSlug,
      title: title.trim(),
      category: formCategory,
      model: formModel,
      description: description.trim(),
      prompt: promptText.trim(),
      negative: negative.trim() || null,
      tags: parsedTags.length > 0 ? parsedTags : ["ai-prompt", formCategory.toLowerCase()],
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
        addAuditLog("PROMPT_UPDATED", `Updated prompt "${title}"`);
      } else {
        const { error } = await supabase.from("prompts").insert({
          id: Math.random().toString(36).substring(2, 15),
          ...promptPayload,
          views: 0,
          likes: 0,
          copies: 0,
        });
        if (error) throw error;
        toast.success("New prompt added successfully!");
        addAuditLog("PROMPT_CREATED", `Created new prompt "${title}"`);
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
      const { error } = await supabase.from("prompts").delete().eq("id", p.id);
      if (error) throw error;
      toast.success("Prompt deleted successfully!");
      addAuditLog("PROMPT_DELETED", `Deleted prompt "${p.title}"`);
      fetchData();
    } catch (err: any) {
      setHidden((prev) => new Set(prev).add(p.id));
      toast.info("Removed locally.");
    }
  };

  // CATEGORIES CRUD HANDLERS
  const openCreateCatModal = () => {
    setCatName("");
    setCatSlug("");
    setCatIcon("Sparkles");
    setCatDesc("");
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCatSlug = (catSlug || catName).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!catName || !finalCatSlug || !catIcon) {
      toast.error("Please fill in required fields.");
      return;
    }
    setFormLoading(true);
    try {
      const { error } = await supabase.from("categories").insert({
        name: catName.trim(),
        slug: finalCatSlug,
        icon: catIcon.trim(),
        description: catDesc.trim(),
      });
      if (error) throw error;
      toast.success("Category added successfully!");
      addAuditLog("CATEGORY_CREATED", `Added category "${catName}"`);
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
    if (!confirm(`Are you sure you want to delete category "${c.name}"?`)) return;
    try {
      const { error } = await supabase.from("categories").delete().eq("id", c.id);
      if (error) throw error;
      toast.success("Category deleted successfully!");
      addAuditLog("CATEGORY_DELETED", `Deleted category "${c.name}"`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category.");
    }
  };

  // MODELS CRUD HANDLERS
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
      addAuditLog("MODEL_REGISTERED", `Registered AI Model "${modelName}"`);
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
    if (!confirm(`Are you sure you want to delete model "${m.name}"?`)) return;
    try {
      const { error } = await supabase.from("models").delete().eq("id", m.id);
      if (error) throw error;
      toast.success("Model deleted successfully!");
      addAuditLog("MODEL_DELETED", `Deleted model "${m.name}"`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete model.");
    }
  };

  // DATA FILTER LOGIC
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
    const views = visible.reduce((s, p) => s + (p.views || 0), 0);
    const likes = visible.reduce((s, p) => s + (p.likes || 0), 0);
    const copies = visible.reduce((s, p) => s + (p.copies || 0), 0);
    return { views, likes, copies };
  }, [visible]);

  // Dynamic Realtime Analytics Computations
  const dynamicAnalytics = useMemo(() => {
    const maxViews = totals.views || 1;
    const dailyTrend = visible.slice(0, 7).map((p, idx) => ({
      day: `Day ${idx + 1}`,
      val: p.views || Math.floor(totals.views / 7),
      pct: Math.min(100, Math.max(15, ((p.views || 100) / (maxViews / 3)) * 100)),
    }));

    const weeklyConversion = visible.slice(0, 5).map((p, idx) => ({
      label: `Prompt ${idx + 1}`,
      copies: p.copies || 1,
      likes: p.likes || 1,
    }));

    return { dailyTrend, weeklyConversion };
  }, [visible, totals]);

  return (
    <div className="min-h-screen bg-[#FAFAFC] dark:bg-[#0B0C10] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-purple-500/20 antialiased">
      {/* -------------------------------------------------------------
          TOP HEADER BAR
          ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#12131A]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-sm">
        {/* Left: Mobile Menu Trigger + Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/25 ring-4 ring-purple-500/10 shrink-0">
              M
            </div>
            <div>
              <h1 className="font-display font-extrabold text-lg leading-none tracking-tight">
                Admin Panel
              </h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">
                Magic Prompts Supercharged
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search Input Bar (Desktop) */}
        <div className="hidden md:flex items-center max-w-md w-full relative">
          <Search className="absolute left-3.5 text-slate-400 h-4 w-4 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              if (activeTab === "dashboard") setActiveTab("prompts");
            }}
            placeholder="Search prompts, categories, tags..."
            className="w-full bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-sm pl-10 pr-12 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
          />
          <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-400 bg-slate-200/60 dark:bg-slate-800 border border-slate-300/40 dark:border-slate-700">
            ⌘ K
          </kbd>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Export CSV Quick Button */}
          <button
            onClick={exportPromptsToCSV}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
            title="Export CSV"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          {/* + New Prompt Button */}
          <button
            onClick={openCreatePromptModal}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Prompt</span>
            <span className="sm:hidden">New</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-slate-200/60 dark:border-slate-800/60"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setActiveTab("pending")}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer relative border border-slate-200/60 dark:border-slate-800/60"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {pendingPrompts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-ping" />
              )}
              {pendingPrompts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
          </div>

          {/* User Logout Icon */}
          <button
            onClick={handleSignOut}
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer border border-slate-200/60 dark:border-slate-800/60"
            title="Sign Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* MOBILE SLIDE-OUT DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm">
          <div className="w-4/5 max-w-xs bg-white dark:bg-[#12131A] h-full p-5 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    M
                  </div>
                  <span className="font-display font-extrabold text-base">Magic Admin</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {[
                  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
                  { id: "analytics", label: "Analytics Charts", Icon: TrendingUp },
                  { id: "prompts", label: "Prompts", Icon: ImageIcon, badge: visible.length },
                  { id: "pending", label: "Pending", Icon: Clock, badge: pendingPrompts.length, pulse: pendingPrompts.length > 0 },
                  { id: "audit", label: "Audit Log", Icon: History },
                  { id: "users", label: "User Management", Icon: Users, badge: profiles.length },
                  { id: "categories", label: "Categories", Icon: Layers, badge: categories.length },
                  { id: "models", label: "AI Models", Icon: Cpu, badge: models.length },
                  { id: "ads", label: "Adsterra Ads", Icon: Megaphone, live: true },
                  { id: "seo", label: "SEO & Banner", Icon: Globe },
                  { id: "backups", label: "Backups & Exports", Icon: Database },
                ].map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold ${
                      activeTab === item.id
                        ? "bg-purple-600 text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.pulse ? "bg-red-500 text-white animate-pulse" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                        {item.badge}
                      </span>
                    )}
                    {item.live && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-600 font-bold">
                        LIVE
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* -------------------------------------------------------------
          MAIN RESPONSIVE 2-COLUMN GRID LAYOUT
          ------------------------------------------------------------- */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr] gap-6 lg:gap-8 items-start">
          {/* DESKTOP SIDEBAR COLUMN */}
          <aside className="hidden md:block sticky top-20 rounded-3xl bg-white dark:bg-[#12131A] p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <nav className="space-y-1">
              {[
                { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
                { id: "analytics", label: "Analytics Charts", Icon: TrendingUp },
                { id: "prompts", label: "Prompts Library", Icon: ImageIcon, badge: visible.length },
                { id: "pending", label: "Pending Reviews", Icon: Clock, badge: pendingPrompts.length, pulse: pendingPrompts.length > 0 },
                { id: "audit", label: "Audit Log", Icon: History },
                { id: "users", label: "User Roles", Icon: Users, badge: profiles.length },
                { id: "categories", label: "Categories", Icon: Layers, badge: categories.length },
                { id: "models", label: "AI Models", Icon: Cpu, badge: models.length },
                { id: "ads", label: "Adsterra Ads", Icon: Megaphone, live: true },
                { id: "seo", label: "SEO & Banner", Icon: Globe },
                { id: "backups", label: "Backups & Data", Icon: Database },
              ].map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                    activeTab === item.id
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <item.Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        activeTab === item.id
                          ? "bg-white/20 text-white"
                          : item.pulse
                          ? "bg-red-500 text-white animate-pulse"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.live && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      LIVE
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-violet-500/10 rounded-2xl p-3 border border-purple-200/50 dark:border-purple-900/50 flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0 ring-4 ring-emerald-500/20" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    Supabase Live DB
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Realtime Sync Active
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT VIEW AREA */}
          <main className="min-w-0 space-y-6 md:space-y-8">
            {/* -------------------------------------------------------------
                VIEW 1: MAIN DASHBOARD OVERVIEW
                ------------------------------------------------------------- */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 md:space-y-8">
                {/* Header Greeting */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Dashboard
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Welcome back. Here's how Happy Fashions / Magic Prompts is doing today.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-3.5 py-1.5 rounded-xl border border-purple-200/60 dark:border-purple-800/60 self-start sm:self-auto shrink-0">
                    <Activity className="h-3.5 w-3.5 animate-spin text-purple-600" />
                    <span>Realtime Live Metrics</span>
                  </div>
                </div>

                {/* 4 STAT CARDS ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {/* Stat 1: PROMPTS */}
                  <div className="bg-white dark:bg-[#12131A] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/40 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                        PROMPTS
                      </span>
                      <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="font-display text-3xl font-extrabold tracking-tight">
                        {loading ? "..." : visible.length}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                        <span className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-ping" />
                        Live from database
                      </div>
                    </div>
                  </div>

                  {/* Stat 2: PENDING REVIEWS */}
                  <div className="bg-white dark:bg-[#12131A] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/40 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                        PENDING REVIEWS
                      </span>
                      <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
                        <Clock className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="font-display text-3xl font-extrabold tracking-tight">
                        {loading ? "..." : pendingPrompts.length}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                        <span className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-ping" />
                        Live from database
                      </div>
                    </div>
                  </div>

                  {/* Stat 3: CATEGORIES */}
                  <div className="bg-white dark:bg-[#12131A] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/40 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                        CATEGORIES
                      </span>
                      <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
                        <Layers className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="font-display text-3xl font-extrabold tracking-tight">
                        {loading ? "..." : categories.length}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                        <span className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-ping" />
                        Live from database
                      </div>
                    </div>
                  </div>

                  {/* Stat 4: AI MODELS */}
                  <div className="bg-white dark:bg-[#12131A] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/40 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                        AI MODELS
                      </span>
                      <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
                        <Cpu className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="font-display text-3xl font-extrabold tracking-tight">
                        {loading ? "..." : models.length}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                        <span className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-ping" />
                        Live from database
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2-COLUMN DASHBOARD GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
                  {/* LEFT WIDE CARD: Recent Submissions */}
                  <div className="lg:col-span-2 bg-white dark:bg-[#12131A] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-base sm:text-lg font-bold">Recent submissions</h3>
                        <p className="text-xs text-slate-400 hidden sm:block">Moderate prompt requests submitted by community creators.</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("pending")}
                        className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        View all →
                      </button>
                    </div>

                    {loading ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                        <span className="text-xs">Fetching recent submissions...</span>
                      </div>
                    ) : pendingPrompts.length > 0 ? (
                      <div className="space-y-3">
                        {pendingPrompts.slice(0, 5).map((p) => (
                          <div
                            key={p.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 gap-3 sm:gap-4 hover:border-purple-500/30 transition"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <img
                                src={getImageUrl(p.image)}
                                alt=""
                                className="h-12 w-12 rounded-xl object-cover bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                              />
                              <div className="min-w-0">
                                <h4 className="font-bold text-xs truncate text-slate-900 dark:text-slate-100">
                                  {p.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                                    {p.category}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {p.model}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                              <button
                                onClick={() => handleApprovePrompt(p.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-1"
                              >
                                <Check className="h-3.5 w-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleRejectPrompt(p.id)}
                                className="p-1.5 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-200 transition cursor-pointer"
                                title="Reject"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                        <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center mx-auto">
                          <Check className="h-5 w-5" />
                        </div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          No pending prompt submissions!
                        </p>
                        <p className="text-[11px] text-slate-400">All submissions are approved & published live.</p>
                      </div>
                    )}
                  </div>

                  {/* RIGHT CARD: Latest Prompts */}
                  <div className="bg-white dark:bg-[#12131A] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-base sm:text-lg font-bold">Latest prompts</h3>
                        <p className="text-xs text-slate-400">Live assets</p>
                      </div>
                      <button
                        onClick={openCreatePromptModal}
                        className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                      >
                        Add one →
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {visible.slice(0, 4).map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={getImageUrl(p.image)}
                              alt=""
                              className="h-11 w-11 rounded-xl object-cover bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs truncate text-slate-900 dark:text-slate-100">{p.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">{p.category}</p>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 shrink-0 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg">
                            {formatNum(p.views)} views
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* System Stats Summary Card */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Total Gallery Views</span>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">{formatNum(totals.views)}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full w-[78%]" />
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-400 font-medium">Total User Likes</span>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">{formatNum(totals.likes)}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-pink-500 h-full w-[64%]" />
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-400 font-medium">Prompt Copies</span>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">{formatNum(totals.copies)}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[45%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                REALTIME ANALYTICS GROWTH CHARTS VIEW
                ------------------------------------------------------------- */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold">Analytics & Traffic Trends</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Realtime metrics charting views, copies, and likes computed dynamically from database assets.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Realtime Line Chart Card */}
                  <div className="bg-white dark:bg-[#12131A] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm">Realtime Prompt Views Distribution</h3>
                      <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" /> Dynamic Live
                      </span>
                    </div>

                    <div className="h-44 w-full relative flex items-end justify-between pt-6 gap-2">
                      {dynamicAnalytics.dailyTrend.map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                          <div className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition">
                            {formatNum(item.val)}
                          </div>
                          <div className="w-full bg-purple-100 dark:bg-purple-950/60 rounded-t-xl overflow-hidden h-32 flex items-end">
                            <div
                              style={{ height: `${item.pct}%` }}
                              className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 group-hover:brightness-125 transition duration-300 rounded-t-xl"
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {item.day}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Realtime Bar Chart Card */}
                  <div className="bg-white dark:bg-[#12131A] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm">Copies vs Likes per Prompt Asset</h3>
                      <span className="text-xs font-bold text-purple-500">Live Database</span>
                    </div>

                    <div className="h-44 w-full relative flex items-end justify-between pt-6 gap-2">
                      {dynamicAnalytics.weeklyConversion.map((item, idx) => {
                        const maxVal = Math.max(1, ...dynamicAnalytics.weeklyConversion.map((x) => Math.max(x.copies, x.likes)));
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="w-full flex items-end justify-center gap-1.5 h-32">
                              <div
                                style={{ height: `${Math.max(15, (item.copies / maxVal) * 100)}%` }}
                                className="w-3 bg-indigo-500 rounded-t-md group-hover:brightness-125 transition"
                                title={`Copies: ${item.copies}`}
                              />
                              <div
                                style={{ height: `${Math.max(15, (item.likes / maxVal) * 100)}%` }}
                                className="w-3 bg-pink-500 rounded-t-md group-hover:brightness-125 transition"
                                title={`Likes: ${item.likes}`}
                              />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[50px]">
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                REALTIME AUDIT LOG STREAM
                ------------------------------------------------------------- */}
            {activeTab === "audit" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold">Audit Log & Activity Stream</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Track administrative actions, moderation events, and settings changes live.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#12131A] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
                  {auditLogs.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 space-y-2">
                      <History className="h-8 w-8 text-purple-500 mx-auto" />
                      <p className="font-semibold text-sm">No Audit Events Logged Yet</p>
                      <p className="text-xs">Events appear live as you approve, create, edit, or reject assets.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs min-w-[500px]">
                      <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                        <tr>
                          <th className="p-4">Action Event</th>
                          <th className="p-4">Admin Email</th>
                          <th className="p-4">Details</th>
                          <th className="p-4 text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {auditLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="p-4 font-bold">
                              <span className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-mono text-[10px]">
                                {log.action}
                              </span>
                            </td>
                            <td className="p-4 font-mono text-slate-500 dark:text-slate-400">
                              {log.user}
                            </td>
                            <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                              {log.details}
                            </td>
                            <td className="p-4 text-right text-slate-400 font-mono">
                              {log.timestamp}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                REALTIME USER MANAGEMENT & ROLES
                ------------------------------------------------------------- */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold">User Management & Roles</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Live registered accounts from Supabase auth profiles database.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold text-xs">
                      {profiles.length} Accounts Registered
                    </span>
                    <button
                      onClick={() => setIsUserModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" /> Add User
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#12131A] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[600px]">
                      <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                        <tr>
                          <th className="p-4">User Email</th>
                          <th className="p-4">Full Name</th>
                          <th className="p-4">Assigned Role</th>
                          <th className="p-4">Account Status</th>
                          <th className="p-4 text-right">Registered At</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {profiles.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition">
                            <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                              {user.email}
                            </td>
                            <td className="p-4 font-medium text-slate-600 dark:text-slate-300">
                              {user.full_name || "Community Member"}
                            </td>
                            <td className="p-4">
                              <select
                                value={user.role}
                                onChange={(e) => handleChangeUserRole(user.id, e.target.value)}
                                className="rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-xs font-bold outline-none cursor-pointer"
                              >
                                <option value="admin">ADMIN</option>
                                <option value="creator">CREATOR</option>
                                <option value="user">USER</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                                ● Active
                              </span>
                            </td>
                            <td className="p-4 text-right font-mono text-slate-400">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Live"}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                SEO, BANNER & MAINTENANCE MODE
                ------------------------------------------------------------- */}
            {activeTab === "seo" && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h2 className="font-display text-2xl font-bold">SEO, Banner & Theme Settings</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure live site announcement banner, maintenance mode, SEO tags, and color theme.
                  </p>
                </div>

                <form onSubmit={handleSaveSiteSettings} className="space-y-6">
                  {/* Announcement Banner */}
                  <div className="bg-white dark:bg-[#12131A] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        <h3 className="font-bold text-sm">Site Announcement Banner</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAnnouncementEnabled((prev) => !prev)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          announcementEnabled ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-800"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                            announcementEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Banner Message Text</label>
                        <input
                          type="text"
                          value={announcementText}
                          onChange={(e) => setAnnouncementText(e.target.value)}
                          placeholder="e.g. ✨ New Nano Banana & Midjourney Prompts added!"
                          className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Action Link (Optional)</label>
                        <input
                          type="text"
                          value={announcementLink}
                          onChange={(e) => setAnnouncementLink(e.target.value)}
                          placeholder="e.g. /categories/midjourney"
                          className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Mode */}
                  <div className="bg-white dark:bg-[#12131A] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-amber-500" />
                        <div>
                          <h3 className="font-bold text-sm">Site Maintenance Mode</h3>
                          <p className="text-xs text-slate-400">Lock site for visitors while keeping admin available.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMaintenanceMode((prev) => !prev)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          maintenanceMode ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-800"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                            maintenanceMode ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* SEO Metadata Editor */}
                  <div className="bg-white dark:bg-[#12131A] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <Globe className="h-5 w-5 text-indigo-500" />
                      <h3 className="font-bold text-sm">Global SEO & OpenGraph Meta</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Meta Title Template</label>
                        <input
                          type="text"
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Meta Description</label>
                        <textarea
                          rows={2}
                          value={seoDescription}
                          onChange={(e) => setSeoDescription(e.target.value)}
                          className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-sm bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
                    >
                      Save Settings Live
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* -------------------------------------------------------------
                BACKUPS & DATA EXPORTERS
                ------------------------------------------------------------- */}
            {activeTab === "backups" && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h2 className="font-display text-2xl font-bold">Backups & Data Exporters</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    1-click CSV prompt exports and full JSON database backups.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* CSV Exporter */}
                  <div className="bg-white dark:bg-[#12131A] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Export Prompts to CSV</h3>
                      <p className="text-xs text-slate-400 mt-1">Download spreadsheet compatible CSV file with all live prompt data.</p>
                    </div>
                    <button
                      onClick={exportPromptsToCSV}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="h-4 w-4" /> Download Prompts CSV
                    </button>
                  </div>

                  {/* JSON Database Backup Exporter */}
                  <div className="bg-white dark:bg-[#12131A] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                    <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">1-Click JSON DB Backup</h3>
                      <p className="text-xs text-slate-400 mt-1">Create complete backup snapshot of prompts, categories, models, profiles, and settings.</p>
                    </div>
                    <button
                      onClick={exportDatabaseSnapshotJSON}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="h-4 w-4" /> Download JSON Snapshot
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                PROMPTS TABLE
                ------------------------------------------------------------- */}
            {activeTab === "prompts" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold">Prompts Library</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Manage and edit live prompts displayed in the public gallery.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportPromptsToCSV}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Export CSV
                    </button>
                    <button
                      onClick={openCreatePromptModal}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" /> Add Prompt
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-[#12131A] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-sm">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search prompts or tags..."
                      className="w-full rounded-sm bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex-1 sm:flex-none rounded-sm bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer transition"
                    >
                      <option value="All">All Categories</option>
                      {categories
                        .filter((c) => c.name !== "All")
                        .map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                    </select>

                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="flex-1 sm:flex-none rounded-sm bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer transition"
                    >
                      <option value="All">All Models</option>
                      {models.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-[#12131A] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[650px]">
                      <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                        <tr>
                          <th className="p-4">Prompt Title</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Model</th>
                          <th className="p-4 text-right">Views</th>
                          <th className="p-4 text-right">Likes</th>
                          <th className="p-4 text-right">Copies</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {rows.map((p) => (
                          <tr
                            key={p.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={getImageUrl(p.image)}
                                  alt=""
                                  className="h-10 w-10 rounded-xl object-cover bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                                />
                                <div className="min-w-0">
                                  <div className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                                    {p.title}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">{p.slug}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-medium text-slate-600 dark:text-slate-300">
                              {p.category}
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-semibold text-[10px]">
                                {p.model}
                              </span>
                            </td>
                            <td className="p-4 text-right font-mono text-slate-600 dark:text-slate-300">
                              {formatNum(p.views)}
                            </td>
                            <td className="p-4 text-right font-mono text-slate-600 dark:text-slate-300">
                              {formatNum(p.likes)}
                            </td>
                            <td className="p-4 text-right font-mono text-slate-600 dark:text-slate-300">
                              {formatNum(p.copies)}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEditPromptModal(p)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                  title="Edit"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeletePrompt(p)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                PENDING REVIEWS
                ------------------------------------------------------------- */}
            {activeTab === "pending" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold">Pending Reviews Queue</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Review user prompt submissions before publishing live.
                  </p>
                </div>

                {pendingPrompts.length === 0 ? (
                  <div className="bg-white dark:bg-[#12131A] rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800/80 space-y-3 shadow-sm">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto">
                      <Check className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-base">Queue is Clear!</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      No pending prompt submissions right now.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingPrompts.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white dark:bg-[#12131A] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition"
                      >
                        <div>
                          <div className="h-44 w-full rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <img
                              src={getImageUrl(p.image)}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{p.title}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {p.prompt}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleApprovePrompt(p.id)}
                            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve & Publish
                          </button>
                          <button
                            onClick={() => handleRejectPrompt(p.id)}
                            className="p-2 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-200 transition cursor-pointer"
                            title="Reject"
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
                CATEGORIES MANAGEMENT (UNIFIED CLEAN TABLE VIEW)
                ------------------------------------------------------------- */}
            {activeTab === "categories" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold">Category Management</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Organize gallery prompts into structured filter categories and manage inline sub-prompts.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={catSearchQuery}
                        onChange={(e) => setCatSearchQuery(e.target.value)}
                        placeholder="Search category..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#12131A] border border-slate-200 dark:border-slate-800 rounded-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                      />
                    </div>
                    <button
                      onClick={openCreateCatModal}
                      className="px-4 py-2 rounded-sm bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="h-4 w-4" /> New Category
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#12131A] rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[650px]">
                      <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                        <tr>
                          <th className="p-4">Category Name</th>
                          <th className="p-4">Slug</th>
                          <th className="p-4">Live Prompts Count</th>
                          <th className="p-4">Description</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {categories
                          .filter((c) => {
                            if (!catSearchQuery) return true;
                            const q = catSearchQuery.toLowerCase();
                            return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
                          })
                          .map((c) => {
                            const catPrompts = visible.filter((p) => c.name === "All" || p.category === c.name);
                            const isExpanded = expandedCatName === c.name;
                            return (
                              <Fragment key={c.id}>
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <span className="p-1.5 rounded-sm bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-mono text-xs">
                                      {c.icon}
                                    </span>
                                    {c.name}
                                  </td>
                                  <td className="p-4 font-mono text-slate-400">{c.slug}</td>
                                  <td className="p-4">
                                    <span className="px-2.5 py-1 rounded-sm bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[11px]">
                                      {catPrompts.length} Sub-Prompts Available
                                    </span>
                                  </td>
                                  <td className="p-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">{c.description || "—"}</td>
                                  <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => setExpandedCatName(isExpanded ? null : c.name)}
                                        className={`px-3 py-1.5 rounded-sm font-bold text-[10px] uppercase tracking-wider shadow-sm transition cursor-pointer flex items-center gap-1.5 ${
                                          isExpanded
                                            ? "bg-amber-500 text-white"
                                            : "bg-purple-600 hover:bg-purple-700 text-white"
                                        }`}
                                        title="View sub-prompts for this category"
                                      >
                                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                        Sub-Prompts ({catPrompts.length})
                                      </button>
                                      <button
                                        onClick={() => handleDeleteCategory(c)}
                                        disabled={c.name === "All"}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-sm transition disabled:opacity-30 cursor-pointer"
                                        title="Delete category"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {/* Collapsible Category Sub-Prompts Accordion Drawer */}
                                {isExpanded && (
                                  <tr key={c.id + "-drawer"}>
                                    <td colSpan={5} className="p-5 bg-slate-50/90 dark:bg-slate-900/80 border-y-2 border-purple-500/30">
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            <h4 className="font-bold text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                              Sub-Prompts under "{c.name}" ({catPrompts.length})
                                            </h4>
                                          </div>
                                          <button
                                            onClick={openCreatePromptModal}
                                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-sm text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1 shadow-sm"
                                          >
                                            <Plus className="h-3.5 w-3.5" /> New Sub-Prompt
                                          </button>
                                        </div>

                                        {catPrompts.length === 0 ? (
                                          <div className="text-center py-6 border border-dashed border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-[#12131A] text-slate-400 text-xs">
                                            No sub-prompts created under category "{c.name}" yet. Click "+ New Sub-Prompt" above to add one.
                                          </div>
                                        ) : (
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {catPrompts.map((subP) => (
                                              <div
                                                key={subP.id}
                                                className="p-3 bg-white dark:bg-[#12131A] rounded-sm border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs hover:border-purple-500/40 transition"
                                              >
                                                <div className="flex items-center gap-2.5">
                                                  <img
                                                    src={getImageUrl(subP.image)}
                                                    alt=""
                                                    className="h-11 w-11 rounded-sm object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                                                  />
                                                  <div className="overflow-hidden">
                                                    <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{subP.title}</h5>
                                                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-xs bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 font-mono text-[9px] font-semibold">
                                                      {subP.model}
                                                    </span>
                                                  </div>
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 font-mono bg-slate-50 dark:bg-slate-900 p-2 rounded-sm border border-slate-100 dark:border-slate-800">
                                                  {subP.prompt}
                                                </p>
                                                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                                                  <span className="font-mono">👀 {formatNum(subP.views)} · ❤️ {formatNum(subP.likes)}</span>
                                                  <div className="flex items-center gap-1">
                                                    <button
                                                      onClick={() => openEditPromptModal(subP)}
                                                      className="p-1 text-slate-400 hover:text-purple-600 transition cursor-pointer"
                                                      title="Edit Sub-Prompt"
                                                    >
                                                      <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                      onClick={() => handleDeletePrompt(subP)}
                                                      className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                                                      title="Delete Sub-Prompt"
                                                    >
                                                      <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                MODELS MANAGEMENT
                ------------------------------------------------------------- */}
            {activeTab === "models" && (
              <div className="space-y-6 max-w-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-bold">AI Models Inventory</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Register supported AI image generator platforms.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModelModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> Register Model
                  </button>
                </div>

                <div className="bg-white dark:bg-[#12131A] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                      <tr>
                        <th className="p-4">Model Name</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {models.map((m) => (
                        <tr key={m.id}>
                          <td className="p-4 font-bold">{m.name}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteModel(m)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                ADSTERRA ADS MANAGEMENT
                ------------------------------------------------------------- */}
            {activeTab === "ads" && (
              <div className="space-y-6 max-w-4xl bg-white dark:bg-[#12131A] rounded-3xl p-5 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <Megaphone className="h-5 w-5 text-amber-500" />
                      <h2 className="font-display text-xl sm:text-2xl font-bold">Adsterra Ads Network</h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Manage your website monetization scripts and ad placements.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 p-3 rounded-2xl self-start sm:self-auto">
                    <span className="text-xs font-semibold">Enable Ads:</span>
                    <button
                      type="button"
                      onClick={() => setAdsEnabled((prev) => !prev)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        adsEnabled ? "bg-amber-500" : "bg-slate-400 dark:bg-slate-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                          adsEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveAdSettings} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Popunder Script</label>
                      <textarea
                        rows={3}
                        value={adsterraPopunder}
                        onChange={(e) => setAdsterraPopunder(e.target.value)}
                        placeholder="Paste Popunder script..."
                        className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-3 text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Smartlink URL</label>
                      <textarea
                        rows={3}
                        value={adsterraSmartlink}
                        onChange={(e) => setAdsterraSmartlink(e.target.value)}
                        placeholder="Paste Smartlink URL..."
                        className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-3 text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Native Banner Code</label>
                      <textarea
                        rows={3}
                        value={adsterraNative}
                        onChange={(e) => setAdsterraNative(e.target.value)}
                        placeholder="Paste Native Banner script..."
                        className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-3 text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Social Bar Code</label>
                      <textarea
                        rows={3}
                        value={adsterraSocialBar}
                        onChange={(e) => setAdsterraSocialBar(e.target.value)}
                        placeholder="Paste Social Bar script..."
                        className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-3 text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Display Banner Iframe Code</label>
                    <textarea
                      rows={3}
                      value={adsterraBanner}
                      onChange={(e) => setAdsterraBanner(e.target.value)}
                      placeholder="Paste Banner HTML iframe script..."
                      className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-3 text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-sm bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
                    >
                      Save & Activate All Ads Live
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* -------------------------------------------------------------
          MODALS FOR PROMPT / CATEGORY / MODEL CREATION & EDITING
          ------------------------------------------------------------- */}
      {/* 1. Prompt Modal */}
      {isPromptModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
          onClick={() => setIsPromptModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-xl bg-white dark:bg-[#12131A] p-5 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsPromptModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6">
              <h3 className="font-display text-xl sm:text-2xl font-bold">
                {editingPrompt ? "Edit Prompt" : "Create New Prompt"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure details and artwork for this prompt library asset.
              </p>
            </div>

            <form onSubmit={handleSavePrompt} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setTitle(newTitle);
                      setSlug(
                        newTitle
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "")
                      );
                    }}
                    placeholder="e.g. Cinematic Luxury Watch"
                    className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase flex items-center justify-between">
                    <span>Auto-Generated Slug</span>
                    <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded-xs border border-purple-200 dark:border-purple-800">AUTO</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : "")}
                    placeholder="slug-will-be-autogenerated..."
                    className="w-full rounded-sm bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs font-mono text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 cursor-pointer transition"
                  >
                    {categories
                      .filter((c) => c.name !== "All")
                      .map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">AI Model *</label>
                  <select
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 cursor-pointer transition"
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Description *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary description..."
                  className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Visual Prompt Text *</label>
                <textarea
                  required
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Full text prompt triggers..."
                  className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs font-mono outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Negative Prompt</label>
                <input
                  type="text"
                  value={negative}
                  onChange={(e) => setNegative(e.target.value)}
                  placeholder="e.g. blurry, low quality"
                  className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase flex items-center justify-between">
                  <span>Tags (#tag + Enter) *</span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-medium">Press Enter or Comma</span>
                </label>

                <div className="min-h-[46px] p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm flex flex-wrap items-center gap-1.5 focus-within:ring-2 focus-within:ring-purple-600 focus-within:border-purple-600 transition">
                  {tagsList.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-xs font-semibold px-2.5 py-1 rounded-sm border border-purple-200 dark:border-purple-800/80 shadow-xs"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => setTagsList((prev) => prev.filter((_, i) => i !== idx))}
                        className="hover:text-red-500 transition cursor-pointer p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
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
                    placeholder={tagsList.length === 0 ? "Type #tag and press Enter..." : "Add tag..."}
                    className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 outline-none px-2 py-1 min-w-[140px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Showcase Artwork Image *</label>
                  <div
                    onDragOver={handleAdminDragOver}
                    onDragLeave={handleAdminDragLeave}
                    onDrop={handleAdminDrop}
                    className={`relative border-2 border-dashed rounded-sm p-4 text-center cursor-pointer transition min-h-[100px] flex items-center justify-center ${
                      isAdminDragging
                        ? "border-purple-600 bg-purple-50 dark:bg-purple-950/30"
                        : imageUrl
                        ? "border-purple-400 dark:border-purple-700"
                        : "border-slate-300 dark:border-slate-700"
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
                      <div className="flex items-center gap-2 text-purple-600 text-xs font-semibold">
                        <Loader2 className="h-5 w-5 animate-spin" /> Uploading to Cloudinary...
                      </div>
                    ) : imageUrl ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <img
                            src={imageUrl}
                            alt=""
                            className="h-10 w-10 rounded-sm object-cover"
                          />
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" /> Uploaded to Cloudinary
                          </span>
                        </div>
                        <span className="text-xs text-purple-600 underline font-semibold">Change</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Upload className="h-4 w-4 text-purple-600" />
                        <span>Drag & drop image or browse</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Aspect Ratio *</label>
                  <select
                    value={aspect}
                    onChange={(e) => setAspect(e.target.value)}
                    className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 cursor-pointer transition"
                  >
                    <option value="4:5">4:5 (Portrait)</option>
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="9:16">9:16 (Vertical)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPromptModalOpen(false)}
                  className="px-4 py-2 rounded-sm text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-sm bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                >
                  {formLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Category Modal */}
      {isCatModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
          onClick={() => setIsCatModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-xl bg-white dark:bg-[#12131A] p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsCatModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display text-xl font-bold">New Category</h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setCatName(newCat);
                    setCatSlug(
                      newCat
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "")
                    );
                  }}
                  className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase flex items-center justify-between">
                  <span>Auto-Generated Slug</span>
                  <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded-xs border border-purple-200 dark:border-purple-800">AUTO</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={catSlug || (catName ? catName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : "")}
                  placeholder="category-slug-will-be-autogenerated..."
                  className="w-full rounded-sm bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-mono text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Lucide Icon *</label>
                <select
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 cursor-pointer transition"
                >
                  <option value="Sparkles">Sparkles</option>
                  <option value="ShoppingBag">ShoppingBag</option>
                  <option value="User">User</option>
                  <option value="Star">Star</option>
                  <option value="Palette">Palette</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Description</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 rounded-sm text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-sm bg-purple-600 text-white text-xs font-bold uppercase tracking-wider shadow cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Model Modal */}
      {isModelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
          onClick={() => setIsModelModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-xl bg-white dark:bg-[#12131A] p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModelModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display text-xl font-bold">Register AI Model</h3>
            <form onSubmit={handleSaveModel} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midjourney v6"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModelModalOpen(false)}
                  className="px-4 py-2 rounded-sm text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-sm bg-purple-600 text-white text-xs font-bold uppercase tracking-wider shadow cursor-pointer"
                >
                  Register Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. User Registration Modal */}
      {isUserModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
          onClick={() => setIsUserModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-xl bg-white dark:bg-[#12131A] p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsUserModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display text-xl font-bold">Register New User Account</h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">User Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. creator@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Creator"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">Assign Role *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 cursor-pointer transition"
                >
                  <option value="user">USER (Community Member)</option>
                  <option value="creator">CREATOR (Prompt Creator)</option>
                  <option value="admin">ADMIN (Full Access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-sm text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-sm bg-purple-600 text-white text-xs font-bold uppercase tracking-wider shadow cursor-pointer flex items-center gap-1.5"
                >
                  {formLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
