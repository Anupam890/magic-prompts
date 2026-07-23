"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function Footer() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast.success("Thank you for installing Magic Prompts App!");
      }
      setDeferredPrompt(null);
    } else {
      toast.info("Install Magic Prompts as App", {
        description: "Click your browser menu (⋮ or ⬆) and select 'Install Magic Prompts' or 'Add to Home Screen'.",
      });
    }
  };

  const cols = [
    {
      title: "Product",
      links: [
        { label: "Gallery", href: "/#gallery" },
        { label: "Categories", href: "/categories" },
        { label: "AI Models", href: "/#models" },
        { label: "Popular Prompts", href: "/#gallery" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Blog", href: "/about" },
        { label: "Careers", href: "/about" },
        { label: "Contact", href: "/about" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/about" },
        { label: "Terms", href: "/about" },
        { label: "Cookies", href: "/about" },
        { label: "License", href: "/about" },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-white/[0.06] mt-12 md:mt-24">
      <div className="mx-auto max-w-7xl px-5 md:px-6 py-12 md:py-20">
        <div className="grid gap-10 md:gap-12 grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_repeat(3,1fr)]">
          {/* Brand column */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-semibold">Magic Prompts</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              The ultimate library of premium AI image prompts. Discover. Copy. Create.
            </p>

            <div className="mt-6 max-w-sm">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Get the weekly drop
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="you@studio.com"
                  className="flex-1 min-w-0 rounded-xl glass px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition shrink-0">
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3 md:mb-4">
                {c.title}
              </div>
              <ul className="space-y-2 md:space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-foreground/80 hover:text-foreground transition"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 md:mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06] pt-6 md:pt-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Magic Prompts. Discover. Copy. Create.
            </p>

            {/* Install App Button */}
            <button
              onClick={handleInstallApp}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30 px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Install App</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="rounded-xl glass p-2 hover:bg-white/[0.08] transition"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
