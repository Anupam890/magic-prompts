"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User as UserIcon,
  Bookmark,
  Layers,
  Plus,
  ArrowLeft,
  Sparkles,
  Search,
  FolderPlus,
  Trash2,
  Pencil,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase/client";
import {
  getUserSavedPrompts,
  getUserBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  getBoardPrompts,
  removePromptFromBoard,
  saveLocalPromptId,
  type UserBoard,
  type Prompt,
} from "@/lib/prompts-data";
import { PromptCard } from "@/components/prompt-card";
import { PromptDetail } from "@/components/prompt-detail";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { toast } from "sonner";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"saved" | "boards">("saved");

  // Saved Prompts Data
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);
  const [boards, setBoards] = useState<UserBoard[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  // Selected Active Board for Detailed Board View
  const [selectedBoard, setSelectedBoard] = useState<UserBoard | null>(null);
  const [boardPrompts, setBoardPrompts] = useState<Prompt[]>([]);
  const [loadingBoardPrompts, setLoadingBoardPrompts] = useState(false);

  // New / Edit Board Modal State
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<UserBoard | null>(null);
  const [boardName, setBoardName] = useState("");
  const [boardDesc, setBoardDesc] = useState("");

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        const local = localStorage.getItem("magic_user_session");
        if (local) {
          setUser(JSON.parse(local));
        } else if (typeof document !== "undefined" && document.cookie.includes("magic_mock_session=true")) {
          const fallbackUser = { email: "anupam.dev81@gmail.com", user_metadata: { full_name: "Anupam" } };
          localStorage.setItem("magic_user_session", JSON.stringify(fallbackUser));
          setUser(fallbackUser);
        }
      }

      const prompts = await getUserSavedPrompts();
      setSavedPrompts(prompts);

      const bData = getUserBoards();
      setBoards(bData);
    } catch (err) {
      console.error("Failed to load user profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch prompts whenever a board is selected
  useEffect(() => {
    if (selectedBoard) {
      setLoadingBoardPrompts(true);
      getBoardPrompts(selectedBoard.id).then((p) => {
        setBoardPrompts(p);
        setLoadingBoardPrompts(false);
      });
    }
  }, [selectedBoard]);

  const openCreateBoardModal = () => {
    setEditingBoard(null);
    setBoardName("");
    setBoardDesc("");
    setIsBoardModalOpen(true);
  };

  const openEditBoardModal = (b: UserBoard, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBoard(b);
    setBoardName(b.name);
    setBoardDesc(b.description);
    setIsBoardModalOpen(true);
  };

  const handleSaveBoardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardName.trim()) return;

    if (editingBoard) {
      // Edit mode
      const updated = updateBoard(editingBoard.id, boardName, boardDesc);
      if (updated) {
        setBoards(getUserBoards());
        if (selectedBoard?.id === editingBoard.id) {
          setSelectedBoard(updated);
        }
        toast.success(`Updated "${boardName}" board!`);
      }
    } else {
      // Create mode
      const newB = createBoard(
        boardName,
        boardDesc,
        savedPrompts[0]
          ? typeof savedPrompts[0].image === "string"
            ? savedPrompts[0].image
            : savedPrompts[0].image?.src
          : undefined
      );
      setBoards(getUserBoards());
      toast.success(`Created "${boardName}" board!`);
    }

    setIsBoardModalOpen(false);
  };

  const handleDeleteBoard = (id: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(`Are you sure you want to delete board "${name}"?`)) {
      const updated = deleteBoard(id);
      setBoards(updated);
      if (selectedBoard?.id === id) {
        setSelectedBoard(null);
      }
      toast.success(`Deleted board "${name}".`);
    }
  };

  const handleRemoveFromBoard = (promptId: string) => {
    if (!selectedBoard) return;
    removePromptFromBoard(selectedBoard.id, promptId);
    setBoardPrompts((prev) => prev.filter((p) => p.id !== promptId));
    setBoards(getUserBoards());
    toast.success("Removed prompt from board.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-purple-500/30">
      <Nav />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-28 pb-20">
        {/* User Profile Header Card */}
        <div className="relative overflow-hidden rounded-3xl glass p-6 md:p-10 border border-black/5 dark:border-white/10 shadow-2xl mb-10">
          {/* Ambient Glows */}
          <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
            {/* Avatar */}
            <div className="relative">
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-fuchsia-600 p-1 shadow-xl shadow-purple-900/30">
                <div className="h-full w-full rounded-[22px] bg-background flex items-center justify-center text-foreground font-display text-3xl font-bold uppercase overflow-hidden">
                  {user?.user_metadata?.full_name ? (
                    user.user_metadata.full_name.slice(0, 2)
                  ) : user?.email ? (
                    user.email.slice(0, 2)
                  ) : (
                    <UserIcon className="h-10 w-10 text-purple-400" />
                  )}
                </div>
              </div>
              <span className="absolute -bottom-2 -right-2 rounded-xl bg-purple-600 text-white p-1.5 shadow-lg border border-white/20">
                <Sparkles className="h-4 w-4" />
              </span>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
                  {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Prompt Collector"}
                </h1>
              </div>
              <p className="text-xs text-muted-foreground">{user?.email || "collector@magicprompts.ai"}</p>

              {/* Stats Counters */}
              <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 rounded-2xl glass px-4 py-2 text-xs border border-black/5 dark:border-white/10">
                  <Bookmark className="h-4 w-4 text-purple-400" />
                  <div>
                    <span className="font-bold text-foreground">{savedPrompts.length}</span> Saved Prompts
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-2xl glass px-4 py-2 text-xs border border-black/5 dark:border-white/10">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  <div>
                    <span className="font-bold text-foreground">{boards.length}</span> Pinterest Boards
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={openCreateBoardModal}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2.5 shadow-lg shadow-purple-900/30 transition hover:scale-[1.02] cursor-pointer"
              >
                <FolderPlus className="h-4 w-4" />
                Create Board
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Bar / Selected Board Header */}
        {selectedBoard ? (
          <div className="space-y-6 mb-8">
            <button
              onClick={() => setSelectedBoard(null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:underline cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back to All Boards
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass p-6 rounded-3xl border border-black/5 dark:border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-2xl font-bold">{selectedBoard.name}</h2>
                  <span className="rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                    {boardPrompts.length} Prompts
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{selectedBoard.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => openEditBoardModal(selectedBoard, e)}
                  className="flex items-center gap-1.5 rounded-xl glass px-3 py-2 text-xs font-medium hover:bg-white/10 transition"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteBoard(selectedBoard.id, selectedBoard.name)}
                  className="flex items-center gap-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-2 text-xs font-medium transition"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex bg-white/[0.04] border border-black/5 dark:border-white/10 p-1.5 rounded-2xl gap-1 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === "saved"
                    ? "bg-white text-black dark:bg-white dark:text-black shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bookmark className="h-4 w-4" />
                All Saved ({savedPrompts.length})
              </button>
              <button
                onClick={() => setActiveTab("boards")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === "boards"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="h-4 w-4" />
                Boards ({boards.length})
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            DETAILED BOARD CONTENT VIEW
            ------------------------------------------------------------- */}
        {selectedBoard ? (
          <div>
            {loadingBoardPrompts ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <span className="text-xs">Loading board items…</span>
              </div>
            ) : boardPrompts.length === 0 ? (
              <div className="rounded-3xl glass p-12 text-center border border-black/5 dark:border-white/10 space-y-4 max-w-lg mx-auto">
                <div className="h-14 w-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto">
                  <Layers className="h-7 w-7" />
                </div>
                <h3 className="font-display text-lg font-bold">This board is empty</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Save prompts from the gallery and assign them to "{selectedBoard.name}"!
                </p>
                <Link
                  href="/#gallery"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white text-black font-semibold text-xs px-5 py-2.5 hover:bg-white/90 transition shadow-lg"
                >
                  Browse Gallery
                </Link>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {boardPrompts.map((p) => (
                  <div key={p.id} className="relative group/boardcard break-inside-avoid">
                    <PromptCard prompt={p} onClick={setSelectedPrompt} />
                    <button
                      onClick={() => handleRemoveFromBoard(p.id)}
                      className="absolute top-3 left-3 z-30 opacity-0 group-hover/boardcard:opacity-100 transition rounded-xl bg-red-600/90 hover:bg-red-600 text-white p-2 text-xs font-semibold shadow-lg backdrop-blur-md"
                      title="Remove from board"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "saved" ? (
          /* TAB 1: ALL SAVED PROMPTS */
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <span className="text-xs">Loading saved prompts…</span>
              </div>
            ) : savedPrompts.length === 0 ? (
              <div className="rounded-3xl glass p-12 text-center border border-black/5 dark:border-white/10 space-y-4 max-w-lg mx-auto">
                <div className="h-14 w-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto">
                  <Bookmark className="h-7 w-7" />
                </div>
                <h3 className="font-display text-lg font-bold">No saved prompts yet</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click the bookmark icon on any prompt card in the gallery to save prompts to your profile and organize them into Pinterest boards!
                </p>
                <Link
                  href="/#gallery"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white text-black font-semibold text-xs px-5 py-2.5 hover:bg-white/90 transition shadow-lg"
                >
                  Explore Prompt Gallery
                </Link>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {savedPrompts.map((p) => (
                  <div key={p.id} className="break-inside-avoid">
                    <PromptCard prompt={p} onClick={setSelectedPrompt} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* TAB 2: PINTEREST BOARDS GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {boards.map((b) => (
              <motion.div
                key={b.id}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-3xl glass border border-black/5 dark:border-white/10 p-4 cursor-pointer hover:border-purple-500/40 transition shadow-lg flex flex-col justify-between"
                onClick={() => setSelectedBoard(b)}
              >
                {/* Board Cover Image Preview */}
                <div className="relative h-44 w-full rounded-none overflow-hidden mb-3 bg-black/40 border border-white/5">
                  {b.coverUrl ? (
                    <img
                      src={b.coverUrl}
                      alt={b.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      <Layers className="h-10 w-10 opacity-30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white">
                    {b.promptIds?.length || 0} Prompts
                  </span>

                  {/* Edit/Delete Quick Actions on Hover */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => openEditBoardModal(b, e)}
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white border border-white/10 backdrop-blur-md"
                      title="Edit board"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteBoard(b.id, b.name, e)}
                      className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md"
                      title="Delete board"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Board Info */}
                <div>
                  <h3 className="font-display text-base font-bold text-foreground group-hover:text-purple-400 transition line-clamp-1">
                    {b.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {b.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs text-purple-500 dark:text-purple-400 font-medium">
                  <span>Open Board</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit Board Modal Dialog */}
      <AnimatePresence>
        {isBoardModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
              onClick={() => setIsBoardModalOpen(false)}
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-[#0f0b1e] border border-black/10 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
              >
                <button
                  onClick={() => setIsBoardModalOpen(false)}
                  className="absolute top-5 right-5 p-2 rounded-2xl glass text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                    <FolderPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold">
                      {editingBoard ? "Edit Pinterest Board" : "Create Pinterest Board"}
                    </h2>
                    <p className="text-xs text-muted-foreground">Organize your saved prompts into collections.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveBoardSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Board Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Midjourney V6 Cinematic Portraits"
                      value={boardName}
                      onChange={(e) => setBoardName(e.target.value)}
                      className="w-full rounded-2xl glass px-4 py-2.5 text-sm outline-none border border-black/5 dark:border-white/10 focus:border-purple-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Photorealistic human lighting triggers"
                      value={boardDesc}
                      onChange={(e) => setBoardDesc(e.target.value)}
                      className="w-full rounded-2xl glass px-4 py-2.5 text-sm outline-none border border-black/5 dark:border-white/10 focus:border-purple-500 transition"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsBoardModalOpen(false)}
                      className="rounded-2xl glass px-4 py-2 text-xs font-medium text-muted-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs px-5 py-2 shadow-lg shadow-purple-900/30 transition hover:scale-[1.02]"
                    >
                      {editingBoard ? "Update Board" : "Create Board"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Prompt Detail Dialog */}
      {selectedPrompt && (
        <PromptDetail prompt={selectedPrompt} onClose={() => setSelectedPrompt(null)} />
      )}

      <Footer />
    </div>
  );
}
