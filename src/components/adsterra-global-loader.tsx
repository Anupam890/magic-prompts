"use client";

import { useEffect, useState } from "react";

export function AdsterraGlobalLoader() {
  const [globalScripts, setGlobalScripts] = useState<string[]>([]);

  useEffect(() => {
    try {
      const monetagEnabled = localStorage.getItem("monetag_ads_enabled") !== "false";
      const adsterraEnabled = localStorage.getItem("adsterra_ads_enabled") !== "false";

      const scriptsToInject: string[] = [];

      // 1. Monetag MultiTag (All-in-one recommended)
      if (monetagEnabled) {
        const multitagEnabled = localStorage.getItem("monetag_multitag_enabled") !== "false";
        const multitagCode = localStorage.getItem("monetag_multitag_code") || "";
        if (multitagEnabled && multitagCode) {
          scriptsToInject.push(multitagCode);
        }

        // 2. Monetag Popunder (OnClick)
        const popunderEnabled = localStorage.getItem("monetag_popunder_enabled") !== "false";
        const popunderCode = localStorage.getItem("monetag_popunder_code") || "";
        if (popunderEnabled && popunderCode) {
          scriptsToInject.push(popunderCode);
        }

        // 3. Monetag Push Notifications Opt-In
        const pushEnabled = localStorage.getItem("monetag_push_enabled") !== "false";
        const pushCode = localStorage.getItem("monetag_push_code") || "";
        if (pushEnabled && pushCode) {
          scriptsToInject.push(pushCode);
        }

        // 4. Monetag Vignette / Interstitial Banner
        const vignetteEnabled = localStorage.getItem("monetag_vignette_enabled") !== "false";
        const vignetteCode = localStorage.getItem("monetag_vignette_code") || "";
        // Only inject if enabled and not already the base zone in layout.tsx
        if (vignetteEnabled && vignetteCode && !vignetteCode.includes("11962668")) {
          scriptsToInject.push(vignetteCode);
        }
      }

      // 5. Adsterra Popunder
      if (adsterraEnabled) {
        const adsterraPop = localStorage.getItem("adsterra_popunder_code") || "";
        if (adsterraPop) {
          scriptsToInject.push(adsterraPop);
        }
      }

      setGlobalScripts(scriptsToInject);

      // 6. Direct Link Trigger Handler (Optional feature for buttons/copy)
      const directLinkUrl = localStorage.getItem("monetag_directlink_url") || "";
      const directLinkEnabled = localStorage.getItem("monetag_directlink_enabled") === "true";
      const directLinkPlacement = localStorage.getItem("monetag_directlink_placement") || "buttons";

      if (monetagEnabled && directLinkEnabled && directLinkUrl && directLinkPlacement === "buttons") {
        const handleDirectLinkClick = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          // Check if target is a copy prompt or download action
          if (
            target &&
            (target.closest("button[aria-label*='Copy']") ||
              target.closest("button[aria-label*='copy']") ||
              target.closest(".action-direct-ad"))
          ) {
            // Chance/Frequency: 25% of the time or trigger once per session
            const lastTrigger = sessionStorage.getItem("mp_direct_ad_last");
            const now = Date.now();
            if (!lastTrigger || now - Number(lastTrigger) > 120000) {
              sessionStorage.setItem("mp_direct_ad_last", String(now));
              try {
                window.open(directLinkUrl, "_blank", "noopener,noreferrer");
              } catch (err) {}
            }
          }
        };

        document.addEventListener("click", handleDirectLinkClick, true);
        return () => document.removeEventListener("click", handleDirectLinkClick, true);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (globalScripts.length === 0) return;

    globalScripts.forEach((scriptHtml) => {
      if (!scriptHtml) return;
      const container = document.createElement("div");
      container.innerHTML = scriptHtml;
      const scripts = container.querySelectorAll("script");
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        document.body.appendChild(newScript);
      });
    });
  }, [globalScripts]);

  return null;
}
