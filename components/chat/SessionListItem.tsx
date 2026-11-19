"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { Avatar } from "@/components/avatars/Avatar";
import { cn } from "@/lib/utils";

export interface SessionListItemData {
  id: string;
  title: string;
  preview: string;
  timeLabel: string;
  dayLabel: string;
  hasSummary: boolean;
  isCrisis: boolean;
}

export function SessionListItem({ session }: { session: SessionListItemData }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [titleDraft, setTitleDraft] = useState(session.title);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveTitle() {
    const nextTitle = titleDraft.trim();
    if (!nextTitle) {
      setError("名称不能为空");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/session/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "保存失败");
      setRenameOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSession() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/session/${session.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("删除失败");
      setDeleteOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="relative">
      <div className="flex items-center gap-2 px-4 py-4 transition hover:bg-[#F7FBF8] sm:px-5">
        <Link
          href={`/chat/${session.id}`}
          className="flex min-w-0 flex-1 items-center gap-3.5"
        >
          <div className="relative shrink-0">
            <Avatar id="ai-counselor" size={48} alt="心屿头像" />
            {session.isCrisis && (
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-crisis ring-2 ring-white" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-[14px] font-medium text-ink">
                {session.title}
              </span>
              <span className="shrink-0 text-[10px] text-ink-faint">
                {session.dayLabel} {session.timeLabel}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="truncate text-[11.5px] text-ink-faint">
                {session.preview}
              </span>
              {session.hasSummary ? (
                <span className="shrink-0 rounded-full bg-jade-50 px-2 py-0.5 text-[9px] text-jade-700">
                  已总结
                </span>
              ) : null}
            </div>
          </div>
          <span className="shrink-0 text-ink-faint/50">›</span>
        </Link>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              setMenuOpen((open) => !open);
              setError("");
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint transition hover:bg-black/5"
            aria-label="对话操作"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-32 overflow-hidden rounded-xl border border-black/5 bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setTitleDraft(session.title);
                  setRenameOpen(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[11.5px] text-ink-soft hover:bg-jade-50 hover:text-jade-700"
              >
                <Pencil className="h-3.5 w-3.5" /> 重命名
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setDeleteOpen(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[11.5px] text-crisis hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> 删除对话
              </button>
            </div>
          )}
        </div>
      </div>

      {renameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-ink">重命名对话</h3>
              <button
                type="button"
                onClick={() => setRenameOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-faint hover:bg-black/5"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-[11px] text-ink-faint">给这段对话起一个你记得住的名字。</p>
            <input
              autoFocus
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void saveTitle();
              }}
              maxLength={40}
              className="mt-4 w-full rounded-xl border border-ink/10 bg-[#FBFAF7] px-3 py-2.5 text-[13px] text-ink outline-none focus:border-jade-300 focus:ring-2 focus:ring-jade-100"
              placeholder="例如：和同事的边界"
            />
            {error && <p className="mt-2 text-[11px] text-crisis">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenameOpen(false)}
                className="rounded-full border border-ink/10 px-4 py-2 text-[11.5px] text-ink-soft"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => void saveTitle()}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-full bg-jade-700 px-4 py-2 text-[11.5px] font-medium text-white disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-[16px] font-semibold text-ink">删除这段对话？</h3>
            <p className="mt-2 text-[11.5px] leading-6 text-ink-soft">
              “{session.title}”以及由它产生的记忆会被删除，且无法恢复。确定要删除吗？
            </p>
            {error && <p className="mt-2 text-[11px] text-crisis">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="rounded-full border border-ink/10 px-4 py-2 text-[11.5px] text-ink-soft"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => void deleteSession()}
                disabled={saving}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full bg-crisis px-4 py-2 text-[11.5px] font-medium text-white disabled:opacity-60",
                )}
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
