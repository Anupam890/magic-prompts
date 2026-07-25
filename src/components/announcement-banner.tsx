"use client";

import { useEffect, useState } from "react";
import { Sparkles, X, ArrowRight } from "lucide-react";
import Link from "next/link";

export function AnnouncementBanner() {
  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const isEnabled = localStorage.getItem("mp_announcement_enabled") === "true";
      const bannerText = localStorage.getItem("mp_announcement_text") || "";
      const bannerLink = localStorage.getItem("mp_announcement_link") || "";

      setEnabled(isEnabled);
      setText(bannerText);
      setLink(bannerLink);
    } catch (e) {}
  }, []);

  if (!enabled || !text || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white text-xs font-semibold py-2 px-4 flex items-center justify-between gap-3 shadow-md z-50 relative animate-fade-in">
      <div className="flex items-center justify-center gap-2 mx-auto min-w-0">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-yellow-300 animate-pulse" />
        <span className="truncate">{text}</span>
        {link && (
          <Link
            href={link}
            className="underline inline-flex items-center gap-1 hover:text-yellow-200 transition shrink-0 ml-1 font-bold"
          >
            Learn more <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-white/20 rounded-md transition shrink-0 cursor-pointer"
        aria-label="Dismiss announcement"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
