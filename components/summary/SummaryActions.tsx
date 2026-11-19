"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

export function SummaryActions({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function deleteSession() {
    setLoading(true);
    try {
      const response = await fetch(`/api/session/${sessionId}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      router.push("/chat");
      router.refresh();
    } catch {
      setLoading(false);
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        onClick={() => router.push("/chat")}
        className="inline-flex flex-1 items-center justify-center rounded-full bg-jade-700 px-5 py-3 text-[12.5px] font-medium text-white transition hover:bg-jade-800"
      >
        回到对话列表
      </button>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-ink/10 bg-white px-5 py-3 text-[12px] text-ink-soft transition hover:border-crisis/30 hover:text-crisis"
        >
          <Trash2 className="h-3.5 w-3.5" /> 删除这次会话
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-full border border-crisis/20 bg-red-50 px-3 py-2">
          <span className="text-[11px] text-crisis">确认删除？不可恢复</span>
          <button
            type="button"
            onClick={() => void deleteSession()}
            disabled={loading}
            className="rounded-full bg-crisis px-3 py-1 text-[10.5px] text-white disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "删除"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-[10.5px] text-ink-soft"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}
