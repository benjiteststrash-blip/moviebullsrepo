import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="font-[family-name:var(--font-syne)] text-xl font-extrabold" aria-label="Moviebulls home">
            <span className="text-red">Movie</span>
            <span className="text-white">bulls</span>
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
            <Link href="/" className="hover:text-white transition-colors">DMCA</Link>
            <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>
        <p className="text-xs text-muted/60 text-center mt-6 max-w-2xl mx-auto">
          This site does not store any files on its server. All content is provided by non-affiliated third parties.
        </p>
        <p className="text-xs text-muted/40 text-center mt-2">
          &copy; {new Date().getFullYear()} Moviebulls. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
