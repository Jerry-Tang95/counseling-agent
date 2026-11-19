import Link from "next/link";
import { Brain, Check, Circle, Lock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  { id: "intake", label: "说清楚", hint: "今天想聊什么" },
  { id: "explore", label: "看见模式", hint: "目的、课题与选择" },
  { id: "reframe", label: "换个角度", hint: "新的理解" },
  { id: "action", label: "带走行动", hint: "一个本周小实验" },
];

export function ProgressSidebar({
  stage,
  memoryEnabled,
  title,
}: {
  stage: string;
  memoryEnabled: boolean;
  title?: string | null;
}) {
  const activeIndex = Math.max(
    0,
    STAGES.findIndex((item) => item.id === stage),
  );

  return (
    <aside className="hidden w-[280px] shrink-0 flex-col gap-4 border-l border-black/5 bg-[#F7F7F5]/80 p-5 xl:flex">
      <div>
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          本次会话
        </div>
        <div className="mt-2 text-[14px] font-semibold leading-6 text-ink">
          {title || "一次新的对话"}
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-4">
        <div className="text-[11px] font-medium text-ink-soft">对话阶段</div>
        <ol className="mt-3 space-y-3">
          {STAGES.map((item, index) => {
            const done = index < activeIndex;
            const active = index === activeIndex;
            return (
              <li key={item.id} className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    done && "border-jade-600 bg-jade-600 text-white",
                    active && "border-jade-600 bg-jade-50 text-jade-700",
                    !done && !active && "border-ink/15 bg-white text-ink-faint",
                  )}
                >
                  {done ? <Check className="h-3 w-3" /> : active ? <span className="h-1.5 w-1.5 rounded-full bg-jade-600" /> : <Circle className="h-2 w-2" />}
                </span>
                <span>
                  <span className={cn("block text-[12px]", active ? "font-medium text-ink" : "text-ink-soft")}>{item.label}</span>
                  <span className="block text-[10px] text-ink-faint">{item.hint}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <Link
        href="/memory"
        className="group rounded-2xl border border-black/5 bg-white p-4 transition hover:border-jade-200"
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-[11.5px] font-medium text-ink">
            <Brain className="h-3.5 w-3.5 text-jade-700" /> 长期记忆
          </span>
          <span className={cn("rounded-full px-2 py-0.5 text-[9.5px]", memoryEnabled ? "bg-jade-50 text-jade-700" : "bg-ink/5 text-ink-faint")}>
            {memoryEnabled ? "已开启" : "已关闭"}
          </span>
        </div>
        <p className="mt-2 text-[10.5px] leading-5 text-ink-faint">
          {memoryEnabled
            ? "本次回复可能会参考你开启的记忆。点此查看、修改或删除。"
            : "开启后，下一次不用从头讲起。你随时可以关闭。"}
        </p>
      </Link>

      <div className="mt-auto rounded-2xl bg-jade-50/70 p-4">
        <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-jade-800">
          <ShieldCheck className="h-3.5 w-3.5" /> 边界提醒
        </div>
        <p className="mt-1.5 text-[10px] leading-5 text-jade-800/70">
          心屿是 AI 对话助手，不是心理医生，不做诊断、治疗或开药。紧急情况请拨打 110/120。
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-[9.5px] text-ink-faint">
        <Lock className="h-3 w-3" /> 对话内容加密存储
      </div>
    </aside>
  );
}
