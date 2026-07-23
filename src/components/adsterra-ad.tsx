"use client";

import { useEffect, useRef, useState } from "react";

export interface AdUnitProps {
  type?: "banner" | "native" | "popunder" | "smartlink" | "socialbar";
  className?: string;
}

export function AdsterraAd({ type = "banner", className = "" }: AdUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [adHtml, setAdHtml] = useState<string>("");
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  useEffect(() => {
    try {
      const active = localStorage.getItem("adsterra_ads_enabled") !== "false";
      setIsEnabled(active);
      if (!active) return;

      let code = "";
      if (type === "banner") {
        code = localStorage.getItem("adsterra_banner_code") || localStorage.getItem("adsterra_728x90_code") || "";
      } else if (type === "native") {
        code = localStorage.getItem("adsterra_native_code") || "";
      } else if (type === "socialbar") {
        code = localStorage.getItem("adsterra_socialbar_code") || "";
      } else if (type === "popunder") {
        code = localStorage.getItem("adsterra_popunder_code") || "";
      } else if (type === "smartlink") {
        code = localStorage.getItem("adsterra_smartlink_code") || "";
      }

      setAdHtml(code.trim());
    } catch (e) {}
  }, [type]);

  useEffect(() => {
    if (!containerRef.current || !adHtml || !isEnabled) return;

    // Directly inject HTML & script elements into container
    const wrapper = containerRef.current;
    wrapper.innerHTML = adHtml;

    const scripts = wrapper.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
      newScript.text = oldScript.text || oldScript.innerHTML;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [adHtml, isEnabled]);

  // If no ad script code is entered in Admin Panel or Ads are disabled, render NOTHING (no empty container box)
  if (!isEnabled || !adHtml) {
    return null;
  }

  return (
    <div className={`w-full flex justify-center my-6 overflow-hidden ${className}`}>
      <div ref={containerRef} className="w-full flex justify-center items-center min-h-[90px]" />
    </div>
  );
}
