"use client";

import { useEffect } from "react";

const ADSTERRA_POPUNDER_SCRIPT = "";

export function AdPopunder() {
  useEffect(() => {
    const handler = () => {
      if (sessionStorage.getItem("pop_shown")) return;
      sessionStorage.setItem("pop_shown", "true");

      if (!ADSTERRA_POPUNDER_SCRIPT.trim()) return;

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.innerHTML = ADSTERRA_POPUNDER_SCRIPT;
      document.body.appendChild(script);
    };

    window.addEventListener("trigger-popunder", handler, { once: true });
    return () => window.removeEventListener("trigger-popunder", handler);
  }, []);

  return null;
}
