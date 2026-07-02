"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumb from "./Breadcrumb";
import CommandPalette from "@/components/CommandPalette";
import { useState, useEffect } from "react";

const SIDEBAR_WIDTH = 216;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(true);
      }
      if (e.key === "Escape") {
        setCmdOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "var(--color-canvas)" }}
    >
      <Sidebar />

      <div className="shrink-0 hidden md:block" style={{ width: SIDEBAR_WIDTH }} />

      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <Topbar onOpenCommandPalette={() => setCmdOpen(true)} />

        <main
          className="flex-1 overflow-y-auto"
          style={{
            padding: "var(--spacing-xl)",
            paddingTop: "var(--spacing-lg)",
          }}
        >
          <Breadcrumb />
          {children}
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
