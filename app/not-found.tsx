import Link from "next/link";
import { Brand } from "@/components/layout/Brand";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="paper-bg flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <Brand compact />
      <div className="mt-8 text-[64px] font-semibold leading-none tracking-tight text-jade-200">404</div>
      <h1 className="mt-4 text-[22px] font-semibold text-ink">这个页面不在了</h1>
      <p className="mt-2 max-w-sm text-[12.5px] leading-6 text-ink-soft">
        可能是链接过期了，或者这次对话已经被删除。你可以回到首页，或者重新开始一次对话。
      </p>
      <div className="mt-6 flex gap-2.5">
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-full bg-jade-700 px-4 py-2.5 text-[12px] font-medium text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> 回到首页
        </Link>
        <Link href="/chat" className="inline-flex items-center rounded-full border border-ink/10 bg-white px-4 py-2.5 text-[12px] text-ink-soft">
          开始对话
        </Link>
      </div>
    </div>
  );
}
