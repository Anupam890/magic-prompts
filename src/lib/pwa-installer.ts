"use client";

import { toast } from "sonner";

let deferredPrompt: any = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: any) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export async function triggerPWAInstall() {
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast.success("Magic Prompts installed successfully!");
      }
      deferredPrompt = null;
      return;
    } catch (e) {
      console.error("PWA installation trigger error:", e);
    }
  }

  // Browser Fallback for iOS Safari or Chrome Desktop address bar
  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    toast.info("Install Magic Prompts on iOS", {
      description: "Tap the Share button ⬆ at the bottom of Safari and select 'Add to Home Screen'.",
    });
  } else {
    toast.info("Install Magic Prompts App", {
      description: "Click the ⊕ install icon in your browser address bar or menu to add Magic Prompts to your device.",
    });
  }
}
