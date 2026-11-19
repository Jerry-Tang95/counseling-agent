"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

export function NewChatButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    try {
      const response = await fetch("/api/session", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "创建会话失败");
      router.push(`/chat/${data.sessionId}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void create()}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full bg-jade-700 px-4 py-2.5 text-[12px] font-medium text-white shadow-sm transition hover:bg-jade-800 disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-4 w-4" />}
      新对话
    </button>
  );
}
