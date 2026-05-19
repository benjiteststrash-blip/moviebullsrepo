import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdPopunder } from "@/components/ads/AdPopunder";

export const metadata: Metadata = {
  title: "Moviebulls - Watch Movies & TV Shows",
  description: "Moviebulls is a fast movie and TV discovery hub with active search, deep browsing, and quick watch lists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <AdPopunder />
      </body>
    </html>
  );
}
