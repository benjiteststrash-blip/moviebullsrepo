import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PwaProvider } from "@/components/pwa/PwaProvider";

export const metadata: Metadata = {
  title: "Moviebulls - Watch Movies & TV Shows",
  description: "Moviebulls is a fast movie and TV discovery hub with active search, deep browsing, and quick watch lists.",
  applicationName: "Moviebulls",
  appleWebApp: { capable: true, title: "Moviebulls", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png", icon: "/icons/icon-192.png" },
};

export const viewport: Viewport = { themeColor: "#0a0a0f", colorScheme: "dark" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PwaProvider>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        </PwaProvider>
      </body>
    </html>
  );
}
