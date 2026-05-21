"use client";

interface AdBannerProps {
  variant?: "leaderboard" | "rectangle";
}

export function AdBanner({ variant = "leaderboard" }: AdBannerProps) {
  const className = variant === "leaderboard"
    ? "mx-auto my-4 h-[50px] w-full max-w-[320px] sm:h-[90px] sm:max-w-[728px]"
    : "mx-auto my-4 h-[250px] w-full max-w-[300px]";

  return (
    <div className="flex justify-center" aria-label="Advertisement">
      <div
        className={`flex items-center justify-center rounded-lg border border-border bg-surface ${className}`}
        data-monetag-placement={variant}
      />
    </div>
  );
}
