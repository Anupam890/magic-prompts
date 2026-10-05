"use client";

import { useEffect, useRef, useState } from "react";

export interface AdUnitProps {
  type?: "banner" | "native" | "popunder" | "smartlink" | "socialbar";
  placement?: "below-hero" | "gallery" | "modal" | "footer";
  className?: string;
}

export function AdsterraAd({ type = "banner", placement, className = "" }: AdUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [adHtml, setAdHtml] = useState<string>("");
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  useEffect(() => {
    try {
      // Check master toggles
      const adsterraActive = localStorage.getItem("adsterra_ads_enabled") !== "false";
      const monetagActive = localStorage.getItem("monetag_ads_enabled") !== "false";

      let code = "";
      let placementEnabled = true;

      if (placement) {
        // Handle specific placement routing
        if (placement === "below-hero") {
          placementEnabled = localStorage.getItem("ad_placement_below_hero_enabled") !== "false";
          const chosen = localStorage.getItem("ad_placement_below_hero_type") || "monetag_inpage";
          if (chosen === "monetag_inpage") code = localStorage.getItem("monetag_inpage_code") || "";
          else if (chosen === "monetag_multitag") code = localStorage.getItem("monetag_multitag_code") || "";
          else if (chosen === "custom") code = localStorage.getItem("ad_custom_creative_html") || "";
          else code = localStorage.getItem("adsterra_banner_code") || "";
        } else if (placement === "gallery") {
          placementEnabled = localStorage.getItem("ad_placement_gallery_enabled") !== "false";
          const chosen = localStorage.getItem("ad_placement_gallery_type") || "monetag_inpage";
          if (chosen === "monetag_inpage") code = localStorage.getItem("monetag_inpage_code") || "";
          else if (chosen === "custom") code = localStorage.getItem("ad_custom_creative_html") || "";
          else code = localStorage.getItem("adsterra_native_code") || "";
        } else if (placement === "modal") {
          placementEnabled = localStorage.getItem("ad_placement_modal_enabled") !== "false";
          const chosen = localStorage.getItem("ad_placement_modal_type") || "monetag_inpage";
          if (chosen === "monetag_inpage") code = localStorage.getItem("monetag_inpage_code") || "";
          else if (chosen === "custom") code = localStorage.getItem("ad_custom_creative_html") || "";
          else code = localStorage.getItem("adsterra_banner_code") || "";
        } else if (placement === "footer") {
          placementEnabled = localStorage.getItem("ad_placement_footer_enabled") !== "false";
          const chosen = localStorage.getItem("ad_placement_footer_type") || "monetag_inpage";
          if (chosen === "monetag_inpage") code = localStorage.getItem("monetag_inpage_code") || "";
          else if (chosen === "custom") code = localStorage.getItem("ad_custom_creative_html") || "";
          else code = localStorage.getItem("adsterra_banner_code") || "";
        }
      }

      // If no code from placement, fallback to legacy type mapping
      if (!code) {
        if (type === "banner") {
          code =
            localStorage.getItem("monetag_inpage_code") ||
            localStorage.getItem("adsterra_banner_code") ||
            localStorage.getItem("adsterra_728x90_code") ||
            "";
        } else if (type === "native") {
          code =
            localStorage.getItem("monetag_inpage_code") ||
            localStorage.getItem("adsterra_native_code") ||
            "";
        } else if (type === "socialbar") {
          code = localStorage.getItem("adsterra_socialbar_code") || "";
        } else if (type === "popunder") {
          code =
            localStorage.getItem("monetag_popunder_code") ||
            localStorage.getItem("adsterra_popunder_code") ||
            "";
        } else if (type === "smartlink") {
          code =
            localStorage.getItem("monetag_directlink_url") ||
            localStorage.getItem("adsterra_smartlink_code") ||
            "";
        }
      }

      const overallActive = (monetagActive || adsterraActive) && placementEnabled;
      setIsEnabled(overallActive);
      setAdHtml(code.trim());
    } catch (e) {
      setIsEnabled(false);
    }
  }, [type, placement]);

  useEffect(() => {
    if (!containerRef.current || !adHtml || !isEnabled) return;

    const wrapper = containerRef.current;
    wrapper.innerHTML = "";

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = adHtml;

    const scripts = tempDiv.querySelectorAll("script");
    if (scripts.length === 0) {
      wrapper.innerHTML = adHtml;
      return;
    }

    // Append non-script elements first
    Array.from(tempDiv.childNodes).forEach((node) => {
      if (node.nodeName !== "SCRIPT") {
        wrapper.appendChild(node.cloneNode(true));
      }
    });

    // Execute scripts sequentially
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      if (oldScript.innerHTML) {
        try {
          new Function(oldScript.innerHTML)();
        } catch (err) {
          console.error("Ad script execution error:", err);
        }
      }

      if (oldScript.src) {
        newScript.src = oldScript.src;
      }

      wrapper.appendChild(newScript);
    });
  }, [adHtml, isEnabled]);

  // If no ad script code or ads are disabled, render NOTHING (no empty container box)
  if (!isEnabled || !adHtml) {
    return null;
  }

  return (
    <div className={`w-full flex justify-center my-4 overflow-hidden ${className}`}>
      <div ref={containerRef} className="w-full flex justify-center items-center min-h-[50px]" />
    </div>
  );
}
