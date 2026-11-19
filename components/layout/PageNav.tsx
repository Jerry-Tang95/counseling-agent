"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageNav({
  showHome = true,
  showChats = true,
  className,
  labelsOnMobile = false,
}: {
  showHome?: boolean;
  showChats?: boolean;
  className?: string;
  labelsOnMobile?: boolean;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isChatList = pathname === "/chat";

  return (
    <nav
      className={cn(
        "flex items-center gap-1 text-[11.5px] text-ink-soft",
        className,
      )}
      aria-label="页面导航"
    >
      {showHome && !isHome && (
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition hover:bg-jade-50 hover:text-jade-700"
          aria-label="返回主页"
        >
          <Home className="h-3.5 w-3.5" />
          <span className={cn(!labelsOnMobile && "hidden sm:inline")}>返回主页</span>
        </Link>
      )}
      {showChats && !isChatList && (
        <Link
          href="/chat"
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition hover:bg-jade-50 hover:text-jade-700"
          aria-label="返回对话列表"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span className={cn(!labelsOnMobile && "hidden sm:inline")}>对话列表</span>
        </Link>
      )}
    </nav>
  );
}
