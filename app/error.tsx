"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#FBFAF7] px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-jade-50 text-jade-700">
        <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
          <path d="M9 24c0-7.2 4.9-13 11-13s11 5.8 11 13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M20 23.5v7.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="mt-5 text-[22px] font-semibold text-ink">页面刚刚走神了</h1>
      <p className="mt-2 max-w-sm text-[12.5px] leading-6 text-ink-soft">
        这不是你的问题。你可以刷新试试；如果反复出现，先回到首页。
      </p>
      <div className="mt-6 flex gap-2.5">
        <button type="button" onClick={reset} className="rounded-full bg-jade-700 px-4 py-2.5 text-[12px] font-medium text-white">
          刷新
        </button>
        <Link href="/" className="rounded-full border border-ink/10 bg-white px-4 py-2.5 text-[12px] text-ink-soft">
          回到首页
        </Link>
      </div>
    </div>
  );
}
