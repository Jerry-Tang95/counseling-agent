import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "心屿 · AI 心理咨询式对话助手",
  description:
    "以阿德勒心理学为骨架的 AI 心理咨询式对话助手：帮你理清情绪、关系与选择，落到一个可执行的小行动。不是心理医生，不做诊断和治疗。",
  applicationName: "心屿",
  keywords: ["心理咨询", "情绪", "阿德勒", "AI 对话", "自我探索"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#FBFaf7",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
