import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <span
      className="relative inline-flex items-center justify-center overflow-hidden rounded-[11px] bg-jade-700 text-white shadow-sm"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 40 40" width={size} height={size} fill="none">
        <path
          d="M9 24c0-7.2 4.9-13 11-13s11 5.8 11 13"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M13.5 24c0-4.4 2.9-8 6.5-8s6.5 3.6 6.5 8"
          stroke="currentColor"
          strokeOpacity="0.72"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M20 23.5v7.2M20 30.7c-2.6 0-4.6-1.1-6-3.1M20 30.7c2.6 0 4.6-1.1 6-3.1"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Brand({
  href = "/",
  compact = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark size={compact ? 30 : 34} />
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-semibold tracking-wide text-ink">心屿</span>
        {!compact && (
          <span className="mt-1 hidden text-[10px] font-medium tracking-[0.16em] text-ink-faint sm:block">
            AI 心理咨询式对话助手
          </span>
        )}
      </span>
    </Link>
  );
}
