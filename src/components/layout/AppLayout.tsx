"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumb from "./Breadcrumb";
import CommandPalette from "@/components/CommandPalette";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const SIDEBAR_WIDTH = 216;

const ADMIN_ROUTES = ["/admin/members", "/admin/billing", "/admin/settings"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const role = sessionStorage.getItem("userRole");
    if (!role) {
      router.replace("/login");
      return;
    }
    if (role === "Employee" && ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
      router.replace("/dashboard");
      return;
    }
    setAuthed(true);
  }, [router, pathname]);

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

  if (!authed) return null;

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
