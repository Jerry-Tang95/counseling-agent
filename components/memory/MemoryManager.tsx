"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Brain,
  Check,
  Edit3,
  Loader2,
  Lock,
  PauseCircle,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { Brand } from "@/components/layout/Brand";
import { PageNav } from "@/components/layout/PageNav";
import { cn } from "@/lib/utils";

export interface MemoryUI {
  id: string;
  category: string;
  content: string;
  confidence: number;
  importance: number;
  occurrences: number;
  sourceType: string;
  sourceSessionId: string | null;
  status: string;
  createdAt: string;
}

const CATEGORY_ORDER = [
  "goal",
  "value",
  "pattern",
  "relationship",
  "coping",
  "progress",
  "preference",
];

const CATEGORY_LABELS: Record<string, string> = {
  goal: "目标",
  value: "价值观",
  pattern: "模式",
  relationship: "重要关系",
  coping: "有效应对",
  progress: "进展",
  preference: "对话偏好",
};

const CATEGORY_STYLES: Record<string, string> = {
  goal: "bg-jade-50 text-jade-700",
  value: "bg-[#F6F1E7] text-[#8A6A35]",
  pattern: "bg-[#FBF1EE] text-[#A45B4A]",
  relationship: "bg-[#EDF3F6] text-[#4E7280]",
  coping: "bg-[#F2F5EC] text-[#5F7A4A]",
  progress: "bg-[#F5EEF8] text-[#7C5A8C]",
  preference: "bg-ink/5 text-ink-soft",
};

export function MemoryManager({
  initialMemories,
  initialEnabled,
}: {
  initialMemories: MemoryUI[];
  initialEnabled: boolean;
}) {
  const [memories, setMemories] = useState(initialMemories);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [toggling, setToggling] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<string, MemoryUI[]>();
    for (const memory of memories.filter((item) => item.status === "active")) {
      const list = map.get(memory.category) ?? [];
      list.push(memory);
      map.set(memory.category, list);
    }
    return CATEGORY_ORDER.filter((category) => map.has(category)).map((category) => ({
      category,
      items: map.get(category) ?? [],
    }));
  }, [memories]);

  async function toggleMemory() {
    setToggling(true);
    setError("");
    try {
      const response = await fetch("/api/memory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memoryEnabled: !enabled }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "操作失败");
      setEnabled(data.memoryEnabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setToggling(false);
    }
  }

  async function saveEdit(id: string) {
    if (!draft.trim()) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/memory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "保存失败");
      setMemories((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, content: data.memory.content } : item,
        ),
      );
      setEditingId(null);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function deleteMemory(id: string) {
    setError("");
    try {
      const response = await fetch(`/api/memory/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("删除失败");
      setMemories((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  }

  async function clearAll() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/memory", { method: "DELETE" });
      if (!response.ok) throw new Error("清空失败");
      setMemories([]);
      setClearing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "清空失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="paper-bg min-h-[100dvh]">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[#F7F7F5]/90 backdrop-blur">
        <div className="mx-auto flex h-[64px] w-full max-w-2xl items-center justify-between px-4 sm:px-6">
          <PageNav />
          <Brand compact />
          <span className="w-[70px] text-right text-[10px] text-ink-faint">隐私优先</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-jade-50 px-3 py-1.5 text-[10.5px] font-medium text-jade-700">
              <Brain className="h-3.5 w-3.5" /> 长期记忆
            </div>
            <h1 className="mt-4 text-[28px] font-semibold tracking-tight text-ink sm:text-[34px]">
              我记住的，都在这里。
            </h1>
            <p className="mt-3 max-w-md text-[12.5px] leading-6 text-ink-soft">
              这些是你在对话里明确说过、并且允许我记住的内容。你可以逐条修改或删除；
              关闭记忆后，新对话不会再参考它们，但已保存的内容仍然保留。
            </p>
          </div>
          <span className={cn("mt-1 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium", enabled ? "bg-jade-700 text-white" : "bg-ink/10 text-ink-soft")}>
            {enabled ? "已开启" : "已关闭"}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            {enabled ? (
              <PlayCircle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-jade-700" />
            ) : (
              <PauseCircle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-ink-faint" />
            )}
            <div>
              <div className="text-[12px] font-medium text-ink">
                {enabled ? "长期记忆已开启" : "长期记忆已暂停"}
              </div>
              <div className="mt-0.5 text-[10.5px] leading-5 text-ink-faint">
                {enabled
                  ? "新对话会参考这些内容。你可以随时关闭。"
                  : "关闭后新对话不会引用这些内容；已有记忆不会被删除。"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void toggleMemory()}
            disabled={toggling}
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full transition",
              enabled ? "bg-jade-700" : "bg-ink/15",
            )}
            role="switch"
            aria-checked={enabled}
            aria-label="切换长期记忆"
          >
            <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition", enabled ? "left-6" : "left-1")} />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[11px] text-crisis">{error}</div>
        )}

        {grouped.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-3xl border border-black/5 bg-white/80 px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-jade-50 text-jade-700">
              <Brain className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-[16px] font-semibold text-ink">还没有记忆</h2>
            <p className="mt-2 max-w-xs text-[11.5px] leading-6 text-ink-soft">
              {enabled
                ? "在对话里明确说出你的目标、价值观或反复出现的模式，会话结束后就会出现在这里。"
                : "开启长期记忆后，心屿才能在下一次对话里记得你。你也可以先去聊一次。"}
            </p>
            <Link href="/chat" className="mt-4 rounded-full bg-jade-700 px-4 py-2.5 text-[11.5px] font-medium text-white">
              去对话
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {grouped.map((group) => (
              <section key={group.category}>
                <div className="mb-2 flex items-center gap-2 px-1">
                  <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-medium", CATEGORY_STYLES[group.category])}>
                    {CATEGORY_LABELS[group.category]}
                  </span>
                  <span className="text-[10px] text-ink-faint">{group.items.length} 条</span>
                </div>
                <div className="space-y-2">
                  {group.items.map((memory) => (
                    <div key={memory.id} className="rounded-2xl border border-black/5 bg-white p-4">
                      {editingId === memory.id ? (
                        <div>
                          <textarea
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            className="w-full resize-none rounded-xl border border-jade-200 bg-jade-50/30 px-3 py-2 text-[12.5px] leading-6 text-ink outline-none focus:border-jade-400"
                            rows={2}
                            maxLength={500}
                          />
                          <div className="mt-2 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => { setEditingId(null); setDraft(""); }}
                              className="rounded-full px-3 py-1.5 text-[10.5px] text-ink-faint"
                            >
                              取消
                            </button>
                            <button
                              type="button"
                              onClick={() => void saveEdit(memory.id)}
                              disabled={saving || !draft.trim()}
                              className="inline-flex items-center gap-1 rounded-full bg-jade-700 px-3 py-1.5 text-[10.5px] text-white disabled:opacity-50"
                            >
                              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                              保存
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[12.5px] leading-6 text-ink-soft">{memory.content}</p>
                          <div className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              onClick={() => { setEditingId(memory.id); setDraft(memory.content); }}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-ink-faint transition hover:bg-jade-50 hover:text-jade-700"
                              aria-label="编辑记忆"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteMemory(memory.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-ink-faint transition hover:bg-red-50 hover:text-crisis"
                              aria-label="删除记忆"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2 text-[9px] text-ink-faint">
                        <span>重要度 {memory.importance}/5</span>
                        <span>·</span>
                        <span>{memory.occurrences > 1 ? `出现 ${memory.occurrences} 次` : "首次记录"}</span>
                        <span>·</span>
                        <span>{memory.sourceType === "explicit" ? "你明确说过" : "对话推断"}</span>
                        <span>·</span>
                        <span>{new Date(memory.createdAt).toLocaleDateString("zh-CN")}</span>
                        <Link href="/privacy" className="ml-auto inline-flex items-center gap-1 hover:text-jade-700">
                          <Lock className="h-2.5 w-2.5" /> 加密存储
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {memories.length > 0 && (
          <div className="mt-8 border-t border-black/5 pt-5">
            {!clearing ? (
              <button
                type="button"
                onClick={() => setClearing(true)}
                className="inline-flex items-center gap-1.5 text-[11px] text-ink-faint transition hover:text-crisis"
              >
                <Trash2 className="h-3.5 w-3.5" /> 清空全部记忆
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 rounded-xl bg-red-50 px-3 py-2">
                <span className="text-[11px] text-crisis">确认清空全部记忆？此操作不可恢复。</span>
                <button
                  type="button"
                  onClick={() => void clearAll()}
                  disabled={saving}
                  className="rounded-full bg-crisis px-3 py-1 text-[10px] text-white disabled:opacity-60"
                >
                  {saving ? "清空中…" : "确认清空"}
                </button>
                <button type="button" onClick={() => setClearing(false)} className="text-[10px] text-ink-soft">
                  取消
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex items-start gap-2 rounded-2xl bg-jade-50/60 p-4 text-[10px] leading-5 text-jade-800/70">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          记忆内容使用 AES-256-GCM 加密存储；不会用于模型训练、广告或对外分享。删除后数据库不再保留对应内容。
        </div>
      </main>
    </div>
  );
}
