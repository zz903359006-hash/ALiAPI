import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./landing.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "limAPI — 一个 API，连接每一种 AI",
  description: "统一接入多种 AI 模型，集中管理 Key、团队额度、调用用量与账单。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
