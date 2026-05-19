"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  variant?: "leaderboard" | "rectangle";
}

const ADSTERRA_LEADERBOARD_SCRIPT = "";
const ADSTERRA_RECTANGLE_SCRIPT = "";

export function AdBanner({ variant = "leaderboard" }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptCode = variant === "leaderboard" ? ADSTERRA_LEADERBOARD_SCRIPT : ADSTERRA_RECTANGLE_SCRIPT;

  useEffect(() => {
    if (!containerRef.current || !scriptCode.trim()) return;

    const container = containerRef.current;
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = scriptCode;
    container.appendChild(script);

    return () => {
      script.remove();
    };
  }, [scriptCode]);

  const className = variant === "leaderboard"
    ? "mx-auto my-4 h-[90px] w-full max-w-[728px]"
    : "mx-auto my-4 h-[250px] w-full max-w-[300px]";

  return (
    <div className="flex justify-center">
      <div
        ref={containerRef}
        className={`flex items-center justify-center rounded-lg border border-border bg-surface ${className}`}
      >
        {!scriptCode.trim() && (
          <span className="text-xs text-muted">
            {variant === "leaderboard" ? "Leaderboard ad placeholder" : "Rectangle ad placeholder"}
          </span>
        )}
      </div>
    </div>
  );
}
