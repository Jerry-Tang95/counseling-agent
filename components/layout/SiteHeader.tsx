import Link from "next/link";
import { HeartHandshake, ShieldAlert } from "lucide-react";
import { Brand } from "@/components/layout/Brand";
import { PageNav } from "@/components/layout/PageNav";

const nav = [
  { href: "/about", label: "它是什么" },
  { href: "/#how", label: "怎么聊" },
  { href: "/privacy", label: "隐私" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Brand />
          <span className="hidden h-5 w-px bg-black/10 sm:block" />
          <PageNav className="shrink-0" />
        </div>
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium text-ink-soft transition hover:text-jade-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <Link
            href="/crisis"
            className="hidden items-center gap-1.5 rounded-full border border-crisis/20 bg-white px-3.5 py-2 text-[12px] font-medium text-crisis transition hover:bg-red-50 sm:inline-flex"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            紧急求助
          </Link>
          <Link
            href="/chat"
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-jade-700 px-3.5 py-2.5 text-[13px] font-medium text-white shadow-sm transition hover:bg-jade-800 sm:px-4"
          >
            <HeartHandshake className="h-4 w-4" />
            开始对话
          </Link>
        </div>
      </div>
    </header>
  );
}
