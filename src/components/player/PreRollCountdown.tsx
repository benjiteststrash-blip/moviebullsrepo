"use client";

import { useState, useEffect, useCallback } from "react";
import { AdBanner } from "@/components/ads/AdBanner";

interface PreRollCountdownProps {
  onComplete: () => void;
}

export function PreRollCountdown({ onComplete }: PreRollCountdownProps) {
  const [count, setCount] = useState(5);
  const [skipped, setSkipped] = useState(false);

  const handleSkip = useCallback(() => {
    if (!skipped) {
      setSkipped(true);
      onComplete();
    }
  }, [skipped, onComplete]);

  useEffect(() => {
    if (skipped) return;
    if (count <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, skipped, onComplete]);

  return (
    <div className="relative flex min-h-[360px] flex-col items-center justify-center rounded-lg bg-black p-4">
      <div className="mb-4 w-full">
        <AdBanner variant="rectangle" />
      </div>
      <p className="mb-4 text-sm text-muted">Your video will start shortly</p>
      <div className="mb-4 text-6xl font-bold text-white">{count}</div>
      {count <= 3 && (
        <button
          onClick={handleSkip}
          className="rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
        >
          Skip Ad
        </button>
      )}
    </div>
  );
}
