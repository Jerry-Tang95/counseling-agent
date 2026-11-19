"use client";

import { useState } from "react";
import { Check, Loader2, Send, Star } from "lucide-react";
import { cn } from "@/lib/utils";

function StarRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[11.5px] text-ink-soft">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            aria-label={`${label} ${star} 分`}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition",
              star <= value ? "text-amber-500" : "text-ink/20 hover:text-amber-400",
            )}
          >
            <Star className="h-[18px] w-[18px]" fill={star <= value ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function FeedbackCard({ sessionId }: { sessionId: string }) {
  const [helpful, setHelpful] = useState(0);
  const [safety, setSafety] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!helpful || !safety) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, helpful, safety, comment }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "提交失败");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-jade-200 bg-jade-50/60 p-4 text-[11.5px] text-jade-800">
        <Check className="h-4 w-4" />
        谢谢你的反馈，这会帮我们把对话做得更好。
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Star className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-[13px] font-semibold text-ink">这次对话对你有帮助吗？</h2>
          <p className="mt-0.5 text-[10px] text-ink-faint">你的反馈只用于改进产品，不会公开。</p>
        </div>
      </div>
      <div className="mt-4 space-y-2.5">
        <StarRow label="有帮助" value={helpful} onChange={setHelpful} />
        <StarRow label="被照顾到（安全与边界）" value={safety} onChange={setSafety} />
      </div>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={2}
        maxLength={500}
        placeholder="愿意多说一点吗？（可选）"
        className="mt-3 w-full resize-none rounded-xl border border-ink/10 bg-[#FBFAF7] px-3 py-2 text-[11.5px] leading-5 text-ink outline-none focus:border-jade-300"
      />
      {error && <p className="mt-2 text-[10.5px] text-crisis">{error}</p>}
      <button
        type="button"
        onClick={() => void submit()}
        disabled={!helpful || !safety || loading}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-jade-700 px-4 py-2 text-[11px] font-medium text-white transition hover:bg-jade-800 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
        提交反馈
      </button>
    </div>
  );
}
