import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { Brain, ExternalLink } from "lucide-react";
import { Avatar } from "@/components/avatars/Avatar";
import { cn, formatTime } from "@/lib/utils";
import type { UIMessage } from "@/components/chat/types";

export function MessageBubble({
  message,
  avatarId,
  showAvatar = true,
}: {
  message: UIMessage;
  avatarId: string;
  showAvatar?: boolean;
}) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="my-4 flex justify-center">
        <div className="max-w-[86%] rounded-full bg-white/70 px-3 py-1 text-center text-[10.5px] leading-5 text-ink-faint ring-1 ring-black/5">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid={isUser ? "user-message" : "assistant-message"}
      className={cn("bubble-row", isUser && "user")}
    >
      {showAvatar ? (
        <Avatar
          id={isUser ? avatarId : "ai-counselor"}
          size={34}
          alt={isUser ? "我的头像" : "心屿头像"}
        />
      ) : (
        <span className="w-[34px] shrink-0" aria-hidden />
      )}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          isUser ? "items-end" : "items-start",
        )}
      >
        <div className={cn("bubble", isUser ? "user" : "ai")}>
          {isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <Link
                    href={href || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-jade-700 underline underline-offset-2"
                  >
                    {children}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ),
              }}
            >
              {message.content || " "}
            </ReactMarkdown>
          )}
        </div>
        <div className={cn("mt-1 flex items-center gap-2 px-1 text-[10px] text-ink-faint", isUser && "flex-row-reverse")}>
          <span>{formatTime(message.createdAt)}</span>
          {!isUser && message.memoryRefs && message.memoryRefs.length > 0 && (
            <Link
              href="/memory"
              className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[9.5px] text-jade-700 ring-1 ring-jade-100"
              title="这次回复参考了你开启的长期记忆"
            >
              <Brain className="h-2.5 w-2.5" />
              参考了 {message.memoryRefs.length} 条记忆
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
