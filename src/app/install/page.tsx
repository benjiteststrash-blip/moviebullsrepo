import type { Metadata } from "next";
import { InstallApp } from "@/components/pwa/InstallApp";

export const metadata: Metadata = {
  title: "Install Moviebulls",
  description: "Add Moviebulls to your phone or computer for quick access to movies and TV shows.",
};

export default function InstallPage() {
  return <InstallApp />;
}
