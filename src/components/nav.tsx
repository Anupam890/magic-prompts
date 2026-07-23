import Link from "next/link";
import {
  Search,
  Command,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  User,
  ChevronDown,
  Menu,
  X,
  Wand2,
  Sparkles,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "@/app/providers";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "motion/react";

export function Nav() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Automatic Open on Hover states
  const [aiToolsOpen, setAiToolsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const aiToolsTimer = useRef<any>(null);
  const userMenuTimer = useRef<any>(null);

  const handleAiToolsEnter = () => {
    if (aiToolsTimer.current) clearTimeout(aiToolsTimer.current);
    setAiToolsOpen(true);
  };

  const handleAiToolsLeave = () => {
    aiToolsTimer.current = setTimeout(() => {
      setAiToolsOpen(false);
    }, 300);
  };

  const handleUserMenuEnter = () => {
    if (userMenuTimer.current) clearTimeout(userMenuTimer.current);
    setUserMenuOpen(true);
  };

  const handleUserMenuLeave = () => {
    userMenuTimer.current = setTimeout(() => {
      setUserMenuOpen(false);
    }, 300);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      setMobileOpen(false);
      router.push("/");
      router.refresh();
    }
  };

  const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/categories", label: "Categories" },
    { href: "/#gallery", label: "Gallery" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-[padding] duration-300 ${
          scrolled ? "py-2 md:py-3" : "py-3 md:py-5"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4">
          <nav
            className={`flex items-center justify-between rounded-2xl px-4 md:px-5 py-2.5 md:py-3 transition-[background-color,box-shadow,border-color] duration-300 ${
              scrolled ? "glass-strong shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)]" : "bg-transparent"
            }`}
          >
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-display text-base md:text-lg font-semibold tracking-tight">Magic Prompts</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-foreground transition">
                  {link.label}
                </Link>
              ))}

              {/* AI Tools Dropdown - Automatically opens on Hover */}
              <div
                onMouseEnter={handleAiToolsEnter}
                onMouseLeave={handleAiToolsLeave}
                className="relative inline-block"
              >
                <DropdownMenu open={aiToolsOpen} onOpenChange={setAiToolsOpen}>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 hover:text-foreground transition cursor-pointer outline-none select-none py-1">
                    AI Tools
                    <ChevronDown className={`h-3.5 w-3.5 opacity-60 transition-transform duration-200 ${aiToolsOpen ? "rotate-180" : ""}`} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-64"
                    onMouseEnter={handleAiToolsEnter}
                    onMouseLeave={handleAiToolsLeave}
                  >
                    <DropdownMenuLabel>
                      Prompting Generators
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild onClick={() => setAiToolsOpen(false)}>
                      <Link href="/#gallery" className="flex items-start gap-2.5 w-full py-1.5 cursor-pointer">
                        <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Wand2 className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-foreground">
                            Midjourney Prompt Helper
                          </span>
                          <span className="text-[10px] text-muted-foreground leading-tight">
                            Inject luxury photographic triggers
                          </span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild onClick={() => setAiToolsOpen(false)}>
                      <Link href="/#gallery" className="flex items-start gap-2.5 w-full py-1.5 cursor-pointer">
                        <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-foreground">Flux Enhancer</span>
                          <span className="text-[10px] text-muted-foreground leading-tight">Add granular texture modifiers</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild onClick={() => setAiToolsOpen(false)}>
                      <Link href="/#gallery" className="flex items-start gap-2.5 w-full py-1.5 cursor-pointer">
                        <div className="h-7 w-7 rounded-lg bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Command className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-foreground">Prompt Optimizer</span>
                          <span className="text-[10px] text-muted-foreground leading-tight">Clean and compile messy text</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Desktop right actions */}
            <div className="hidden md:flex items-center gap-2">
              <button
                className="flex items-center gap-2 rounded-xl glass px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition"
                aria-label="Search"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search</span>
                <span className="flex items-center gap-0.5 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px]">
                  <Command className="h-2.5 w-2.5" />K
                </span>
              </button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-xl glass p-2 hover:bg-white/[0.08] transition text-muted-foreground hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-3.5 w-3.5" />
                ) : (
                  <Moon className="h-3.5 w-3.5" />
                )}
              </button>

              {/* User Avatar Dropdown - Automatically opens on Hover */}
              {user ? (
                <div
                  onMouseEnter={handleUserMenuEnter}
                  onMouseLeave={handleUserMenuLeave}
                  className="relative inline-block"
                >
                  <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <button className="outline-none cursor-pointer">
                        <Avatar className="h-9 w-9 border border-white/10 hover:border-white/20 transition">
                          <AvatarFallback className="bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-semibold text-xs">
                            {user.email ? user.email.slice(0, 2).toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56"
                      onMouseEnter={handleUserMenuEnter}
                      onMouseLeave={handleUserMenuLeave}
                    >
                      <DropdownMenuLabel className="truncate">
                        {user.email}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild onClick={() => setUserMenuOpen(false)}>
                        <Link href="/admin" className="flex items-center gap-2.5 w-full cursor-pointer">
                          <LayoutDashboard className="h-4 w-4 text-purple-500" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 dark:hover:bg-red-500/20 cursor-pointer flex items-center gap-2.5"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="rounded-xl bg-white text-black text-sm font-medium px-4 py-2 hover:bg-white/90 transition-all hover:scale-[1.02]"
                >
                  Sign in
                </Link>
              )}
            </div>

            {/* Mobile: theme toggle + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-xl glass p-2 text-muted-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-xl glass p-2 text-foreground"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-[85vw] max-w-sm bg-background border-l border-white/10 flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                <span className="font-display text-base font-semibold">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl glass p-2 text-foreground"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer links */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-white/[0.04] transition"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="pt-4 border-t border-white/[0.06]">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground px-4 mb-2">
                    AI Tools
                  </div>
                  <Link
                    href="/#gallery"
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-col items-start gap-0.5 rounded-xl px-4 py-3 hover:bg-white/[0.04] transition"
                  >
                    <span className="text-sm font-medium">Midjourney Prompt Helper</span>
                    <span className="text-[11px] text-muted-foreground">Inject luxury photographic triggers</span>
                  </Link>
                  <Link
                    href="/#gallery"
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-col items-start gap-0.5 rounded-xl px-4 py-3 hover:bg-white/[0.04] transition"
                  >
                    <span className="text-sm font-medium">Flux Enhancer</span>
                    <span className="text-[11px] text-muted-foreground">Add granular texture modifiers</span>
                  </Link>
                  <Link
                    href="/#gallery"
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-col items-start gap-0.5 rounded-xl px-4 py-3 hover:bg-white/[0.04] transition"
                  >
                    <span className="text-sm font-medium">Prompt Optimizer</span>
                    <span className="text-[11px] text-muted-foreground">Clean and compile messy text</span>
                  </Link>
                </div>

                {user && (
                  <div className="pt-4 border-t border-white/[0.06]">
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-white/[0.04] transition"
                    >
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                      Dashboard
                    </Link>
                  </div>
                )}
              </div>

              {/* Drawer footer */}
              <div className="px-6 py-5 border-t border-white/[0.06] space-y-3">
                {user ? (
                  <>
                    <div className="text-xs text-muted-foreground truncate px-1">{user.email}</div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 rounded-xl glass px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center rounded-xl bg-white text-black px-4 py-3 text-sm font-medium hover:bg-white/90 transition"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
