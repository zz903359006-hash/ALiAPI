"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const SIDEBAR_WIDTH = 216;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "var(--color-canvas)" }}
    >
      <Sidebar />

      {/* Spacer to offset fixed sidebar */}
      <div className="shrink-0 hidden md:block" style={{ width: SIDEBAR_WIDTH }} />

      {/* Main area: Topbar + scrollable content */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <Topbar />

        <main
          className="flex-1 overflow-y-auto"
          style={{
            padding: "var(--spacing-xl)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
