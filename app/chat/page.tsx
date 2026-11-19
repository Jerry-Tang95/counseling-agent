import Link from "next/link";
import { redirect } from "next/navigation";
import { Brain, MessageCircle, ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/anonymous";
import { prisma } from "@/lib/db/client";
import { safeDecrypt } from "@/lib/crypto/encrypt";
import { Avatar } from "@/components/avatars/Avatar";
import { Brand } from "@/components/layout/Brand";
import { PageNav } from "@/components/layout/PageNav";
import { NewChatButton } from "@/components/chat/NewChatButton";
import { SessionListItem } from "@/components/chat/SessionListItem";
import { formatDay, formatTime, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ChatListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/start");

  const sessions = await prisma.session.findMany({
    where: { userId: user.id, status: { not: "deleted" } },
    orderBy: { startedAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      summary: true,
    },
  });

  return (
    <div className="paper-bg min-h-[100dvh]">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[#F7F7F5]/90 backdrop-blur">
        <div className="mx-auto flex h-[64px] w-full max-w-3xl items-center justify-between gap-2 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Brand compact />
            <PageNav />
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/memory"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-black/5"
              aria-label="我的记忆"
            >
              <Brain className="h-[18px] w-[18px]" />
            </Link>
            <Link
              href="/crisis"
              className="flex h-9 w-9 items-center justify-center rounded-full text-crisis/80 transition hover:bg-red-50"
              aria-label="紧急求助"
            >
              <ShieldAlert className="h-[18px] w-[18px]" />
            </Link>
            <NewChatButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-ink">对话</h1>
            <p className="mt-1 text-[11px] text-ink-faint">
              像微信一样，接着上次的话继续说
            </p>
          </div>
          <Avatar id={user.avatarId} size={40} alt="我的头像" />
        </div>

        <div className="relative rounded-3xl border border-black/5 bg-white/80 shadow-sm">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-jade-50 text-jade-700">
                <MessageCircle className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-[17px] font-semibold text-ink">还没有对话</h2>
              <p className="mt-2 max-w-xs text-[12px] leading-6 text-ink-soft">
                你可以从一句“最近有点累”开始。不需要准备好完整的故事。
              </p>
              <div className="mt-5">
                <NewChatButton />
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-black/5">
              {sessions.map((session) => {
                const last = session.messages[0];
                const preview = last
                  ? truncate(safeDecrypt(last.contentCipher), 52)
                  : "开始聊聊你今天想说的…";
                return (
                  <SessionListItem
                    key={session.id}
                    session={{
                      id: session.id,
                      title: session.title || "新的对话",
                      preview,
                      dayLabel: formatDay(session.startedAt),
                      timeLabel: formatTime(session.startedAt),
                      hasSummary: Boolean(session.summary),
                      isCrisis: session.status === "crisis",
                    }}
                  />
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-jade-100 bg-jade-50/50 px-4 py-3">
          <Brain className="mt-0.5 h-4 w-4 shrink-0 text-jade-700" />
          <p className="text-[10.5px] leading-5 text-jade-800/75">
            长期记忆{user.memoryEnabled ? "已开启" : "默认关闭"}。
            {user.memoryEnabled
              ? "心屿会在不同对话之间参考你明确说过的目标、价值观和模式，你可以在「我的记忆」里随时修改或删除。"
              : "如果你想下一次不用从头讲起，可以在「我的记忆」里开启它。"}
          </p>
        </div>
        <p className="mt-5 text-center text-[9.5px] leading-5 text-ink-faint">
          对话内容加密存储 · 原始消息默认 30 天删除 · 不用于模型训练
        </p>
      </main>
    </div>
  );
}
