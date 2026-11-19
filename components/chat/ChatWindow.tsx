"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  Check,
  ChevronRight,
  Loader2,
  Send,
  ShieldAlert,
} from "lucide-react";
import { Avatar } from "@/components/avatars/Avatar";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { CrisisCard } from "@/components/chat/CrisisCard";
import { PageNav } from "@/components/layout/PageNav";
import type { UIMessage } from "@/components/chat/types";
import { cn, formatDay } from "@/lib/utils";

export interface ChatSessionInfo {
  id: string;
  title: string | null;
  stage: string;
  status: string;
  riskLevel: number;
  startedAt: string;
}

interface ChatWindowProps {
  session: ChatSessionInfo;
  initialMessages: UIMessage[];
  avatarId: string;
  memoryEnabled: boolean;
  summaryId?: string | null;
}

type SSEHandler = (event: string, data: Record<string, unknown>) => void;

async function readSSE(response: Response, onEvent: SSEHandler) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("无法读取回复流");
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      let event = "message";
      let data = "";
      for (const line of block.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;
      try {
        onEvent(event, JSON.parse(data) as Record<string, unknown>);
      } catch {
        // 忽略不完整事件
      }
    }
  }
}

export function ChatWindow({
  session,
  initialMessages,
  avatarId,
  memoryEnabled,
  summaryId: initialSummaryId,
}: ChatWindowProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [summaryId, setSummaryId] = useState<string | null>(initialSummaryId ?? null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState("");
  const [crisisLevel, setCrisisLevel] = useState<number | null>(
    session.riskLevel >= 2 ? session.riskLevel : null,
  );
  const [showSummaryConfirm, setShowSummaryConfirm] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldAutoScroll = useRef(true);

  useEffect(() => {
    if (shouldAutoScroll.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, waiting, crisisLevel]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [input]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldAutoScroll.current = distance < 120;
  }

  async function sendMessage(raw: string) {
    const text = raw.trim();
    if (!text || sending) return;

    shouldAutoScroll.current = true;
    const now = new Date().toISOString();
    const tempId = `pending-${Date.now()}`;
    const userMessage: UIMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: now,
    };
    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: tempId,
        role: "assistant",
        content: "",
        createdAt: now,
        streaming: true,
      },
    ]);
    setInput("");
    setSending(true);
    setWaiting(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, message: text }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error || "发送失败，请稍后重试。",
        );
      }

      await readSSE(response, (event, data) => {
        if (event === "meta") {
          const riskLevel = Number(data.riskLevel ?? 0);
          const memoryRefs = Array.isArray(data.memoryRefs)
            ? (data.memoryRefs as string[])
            : [];
          setMessages((prev) =>
            prev.map((item) =>
              item.id === tempId ? { ...item, memoryRefs } : item,
            ),
          );
          if (riskLevel >= 2) setCrisisLevel(riskLevel);
        } else if (event === "delta") {
          const delta = String(data.text ?? "");
          setWaiting(false);
          setMessages((prev) =>
            prev.map((item) =>
              item.id === tempId
                ? { ...item, content: item.content + delta, streaming: true }
                : item,
            ),
          );
        } else if (event === "crisis") {
          setCrisisLevel(Number(data.level ?? 2));
          setWaiting(false);
        } else if (event === "block") {
          setWaiting(false);
        } else if (event === "error") {
          setError(String(data.message ?? "回复中断了。"));
        } else if (event === "done") {
          setMessages((prev) =>
            prev.map((item) =>
              item.id === tempId ? { ...item, streaming: false } : item,
            ),
          );
          setWaiting(false);
        }
      });

      setMessages((prev) =>
        prev.map((item) =>
          item.id === tempId ? { ...item, streaming: false } : item,
        ),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "发送失败";
      setError(message);
      setMessages((prev) =>
        prev.map((item) =>
          item.id === tempId
            ? {
                ...item,
                streaming: false,
                content:
                  item.content ||
                  "这次回复没有成功生成。你可以再试一次，或者先深呼吸一下。",
              }
            : item,
        ),
      );
    } finally {
      setSending(false);
      setWaiting(false);
    }
  }

  async function endAndSummarize() {
    setSummaryLoading(true);
    setError("");
    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "生成总结失败");
      setSummaryId(data.summaryId);
      setShowSummaryConfirm(false);
      router.push(`/summary/${data.summaryId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成总结失败");
      setSummaryLoading(false);
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  const visibleMessages = messages;
  let lastDay = "";

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-white">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-black/5 bg-[#F7F7F5]/95 px-3 backdrop-blur sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <PageNav />
            <span className="hidden h-5 w-px bg-black/10 sm:block" />
            <Avatar id="ai-counselor" size={36} alt="心屿头像" />
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 text-[14px] font-semibold text-ink">心屿</span>
                <span className="hidden truncate rounded-full bg-white px-2 py-0.5 text-[9.5px] text-ink-faint ring-1 ring-black/5 sm:inline">
                  {session.title || "新的对话"}
                </span>
              </div>
              <div className="truncate text-[10px] text-ink-faint">
                AI 对话助手 · 不是心理医生
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/memory"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-black/5"
              aria-label="我的记忆"
              title={`我的记忆（${memoryEnabled ? "已开启" : "已关闭"}）`}
            >
              <Brain className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <main className="relative flex min-w-0 flex-1 flex-col chat-canvas">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="thin-scrollbar flex-1 overflow-y-auto px-3 py-5 sm:px-6"
            >
              <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4">
                {visibleMessages.length === 0 && (
                  <div className="rounded-3xl border border-white bg-white/75 p-6 shadow-sm backdrop-blur sm:p-8">
                    <div className="flex items-start gap-3">
                      <Avatar id="ai-counselor" size={42} alt="心屿头像" />
                      <div>
                        <div className="text-[15px] font-semibold text-ink">你好，我是心屿。</div>
                        <p className="mt-2 max-w-lg text-[13px] leading-7 text-ink-soft">
                          今天想聊点什么？你可以从一件具体的小事说起，不需要准备好完整的故事。
                          我会先听你说，再陪你一起看看：这件事里，什么在保护你，你又真正想要什么。
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2 pl-0 sm:pl-[54px]">
                      {["最近有点累", "和同事相处很累", "我不知道自己要什么", "我总是讨好别人"].map(
                        (prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => {
                              setInput(prompt);
                              textareaRef.current?.focus();
                            }}
                            className="rounded-full border border-jade-200 bg-white px-3.5 py-2 text-[11.5px] text-jade-800 transition hover:bg-jade-50"
                          >
                            {prompt}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {visibleMessages.map((message, index) => {
                  // 发送后、首个 token 到达前，会有一个空的 assistant 占位消息。
                  // 这时只显示 TypingIndicator，避免出现“空气泡 + 思考气泡”两个 AI 头像。
                  if (
                    message.role === "assistant" &&
                    message.streaming &&
                    !message.content
                  ) {
                    return null;
                  }
                  const day = formatDay(message.createdAt);
                  const showDay = day !== lastDay;
                  lastDay = day;
                  const prev = visibleMessages[index - 1];
                  const sameSender =
                    prev &&
                    prev.role === message.role &&
                    new Date(message.createdAt).getTime() -
                      new Date(prev.createdAt).getTime() <
                      3 * 60 * 1000;
                  return (
                    <div key={message.id}>
                      {showDay && (
                        <div className="mb-4 flex justify-center">
                          <span className="rounded-full bg-white/60 px-2.5 py-1 text-[10px] text-ink-faint">
                            {day}
                          </span>
                        </div>
                      )}
                      <MessageBubble
                        message={message}
                        avatarId={avatarId}
                        showAvatar={!sameSender}
                      />
                    </div>
                  );
                })}

                {waiting && <TypingIndicator />}
                {crisisLevel !== null && <CrisisCard level={crisisLevel} />}
                {error && (
                  <div className="mx-auto rounded-full bg-red-50 px-3 py-1.5 text-[10.5px] text-crisis">
                    {error}
                  </div>
                )}
                <div ref={bottomRef} className="h-1" />
              </div>
            </div>

            {/* Composer */}
            <div className="shrink-0 border-t border-black/5 bg-[#F7F7F5]/95 px-3 py-2.5 backdrop-blur sm:px-6 sm:py-3">
              <div className="mx-auto w-full max-w-[760px]">
                {summaryId && (
                  <Link
                    href={`/summary/${summaryId}`}
                    className="mb-2 flex items-center justify-between rounded-xl border border-jade-200 bg-white px-3 py-2 text-[11px] text-jade-800"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" /> 本次会话已生成总结
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px]">查看 <ChevronRight className="h-3 w-3" /></span>
                  </Link>
                )}
                <div className="flex items-end gap-2 rounded-2xl border border-black/10 bg-white p-1.5 shadow-sm focus-within:border-jade-300 focus-within:ring-2 focus-within:ring-jade-100">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={onKeyDown}
                    rows={1}
                    maxLength={4000}
                    placeholder="说说你现在最想聊的…"
                    className="max-h-[132px] min-h-[34px] flex-1 resize-none bg-transparent px-1 py-1.5 text-[14px] leading-6 text-ink outline-none placeholder:text-ink-faint/70"
                  />
                  <button
                    type="button"
                    onClick={() => void sendMessage(input)}
                    disabled={!input.trim() || sending}
                    className={cn(
                      "mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition",
                      input.trim() && !sending
                        ? "bg-jade-700 text-white shadow-sm hover:bg-jade-800"
                        : "bg-ink/5 text-ink-faint",
                    )}
                    aria-label="发送"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2 px-1 text-[9.5px] text-ink-faint">
                  <span className="hidden sm:inline">Enter 发送 · Shift+Enter 换行</span>
                  <div className="ml-auto flex items-center gap-3">
                    <Link href="/crisis" className="inline-flex items-center gap-1 text-crisis/90 hover:text-crisis">
                      <ShieldAlert className="h-3 w-3" /> 紧急求助
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        if (summaryId) router.push(`/summary/${summaryId}`);
                        else setShowSummaryConfirm(true);
                      }}
                      className="text-ink-soft hover:text-jade-700"
                    >
                      {summaryId ? "查看总结" : "结束并总结"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Summary confirm */}
      {showSummaryConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="text-[17px] font-semibold text-ink">要结束这次对话吗？</div>
            <p className="mt-2 text-[12px] leading-6 text-ink-soft">
              我们会把这次聊到的内容整理成一页总结：主诉、模式、优势、目标和一个小行动。
              你仍然可以回到「我的记忆」查看或删除它。
            </p>
            {error && <p className="mt-2 text-[11px] text-crisis">{error}</p>}
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowSummaryConfirm(false)}
                className="flex-1 rounded-full border border-ink/10 py-3 text-[12.5px] text-ink-soft"
              >
                再聊一会儿
              </button>
              <button
                type="button"
                onClick={() => void endAndSummarize()}
                disabled={summaryLoading}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-jade-700 py-3 text-[12.5px] font-medium text-white disabled:opacity-60"
              >
                {summaryLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                生成总结
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
