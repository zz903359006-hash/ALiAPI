import { redirect } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { cookies } from "next/headers";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  // Note: In a real app we'd check session here.
  // Mock: server renders, client-side guard in AppLayout handles redirect.
  return <AppLayout>{children}</AppLayout>;
}
