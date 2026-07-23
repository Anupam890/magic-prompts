"use client";

import { useEffect, useState } from "react";

export function AdsterraGlobalLoader() {
  const [popunderCode, setPopunderCode] = useState("");

  useEffect(() => {
    try {
      const enabled = localStorage.getItem("adsterra_ads_enabled") !== "false";
      if (!enabled) return;

      const code = localStorage.getItem("adsterra_popunder_code") || "";
      if (code) {
        setPopunderCode(code);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!popunderCode) return;
    const container = document.createElement("div");
    container.innerHTML = popunderCode;
    const scripts = container.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      document.body.appendChild(newScript);
    });
  }, [popunderCode]);

  return null;
}
