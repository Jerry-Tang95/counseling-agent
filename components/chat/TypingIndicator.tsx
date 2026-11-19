import { Avatar } from "@/components/avatars/Avatar";

export function TypingIndicator() {
  return (
    <div className="bubble-row">
      <Avatar id="ai-counselor" size={34} alt="心屿头像" />
      <div className="bubble ai flex items-center gap-1 py-4">
        <span className="h-1.5 w-1.5 animate-dot-bounce rounded-full bg-jade-500 [animation-delay:-0.24s]" />
        <span className="h-1.5 w-1.5 animate-dot-bounce rounded-full bg-jade-500 [animation-delay:-0.12s]" />
        <span className="h-1.5 w-1.5 animate-dot-bounce rounded-full bg-jade-500" />
      </div>
    </div>
  );
}
