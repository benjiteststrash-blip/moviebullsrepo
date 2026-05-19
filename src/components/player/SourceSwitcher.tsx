"use client";

import type { SourceProtectionMode } from "@/lib/sources";

interface SourceSwitcherProps {
  sources: {
    name: string;
    url: string;
    defaultMode: SourceProtectionMode;
    reliability: "primary" | "fallback" | "last-resort";
  }[];
  currentSource: number;
  protectionMode: SourceProtectionMode;
  onSwitch: (index: number) => void;
  onProtectionModeChange: (mode: SourceProtectionMode) => void;
}

const reliabilityLabel = {
  primary: "Best",
  fallback: "Alt",
  "last-resort": "Last",
};

export function SourceSwitcher({
  sources,
  currentSource,
  protectionMode,
  onSwitch,
  onProtectionModeChange,
}: SourceSwitcherProps) {
  const source = sources[currentSource];
  const protectedActive = protectionMode === "protected";

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {sources.map((item, index) => {
          const active = index === currentSource;
          const protectedDefault = item.defaultMode === "protected";

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onSwitch(index)}
              title={protectedDefault ? "Protected by default" : "Compatibility source"}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-red text-white"
                  : "border border-border bg-surface text-muted hover:text-white"
              }`}
            >
              <span>{item.name}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  protectedDefault ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
                }`}
              >
                {protectedDefault ? "Safe" : reliabilityLabel[item.reliability]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface/70 p-2">
        <div className="flex rounded-md border border-border bg-black/20 p-1">
          <button
            type="button"
            onClick={() => onProtectionModeChange("protected")}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
              protectedActive ? "bg-emerald-500 text-black" : "text-muted hover:text-white"
            }`}
          >
            Protected
          </button>
          <button
            type="button"
            onClick={() => onProtectionModeChange("compatibility")}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
              !protectedActive ? "bg-amber-400 text-black" : "text-muted hover:text-white"
            }`}
          >
            Compatibility
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span
            className={`rounded-full px-2 py-1 font-semibold ${
              protectedActive ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
            }`}
          >
            {protectedActive ? "Redirects blocked" : "Less restricted"}
          </span>
          <a
            href={source?.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-border bg-white/5 px-3 py-1.5 font-medium text-white transition-colors hover:bg-white/10"
          >
            Open Source
          </a>
        </div>
      </div>
    </div>
  );
}
