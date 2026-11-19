import { Phone, ShieldAlert } from "lucide-react";
import { CRISIS_RESOURCES } from "@/lib/safety/crisis-resources";

export function CrisisCard({ level = 2 }: { level?: number }) {
  return (
    <div className="mx-4 my-4 overflow-hidden rounded-2xl border border-crisis/20 bg-white shadow-sm">
      <div className="flex items-center gap-2 bg-red-50 px-4 py-3 text-[12px] font-semibold text-crisis">
        <ShieldAlert className="h-4 w-4" />
        {level >= 3 ? "请先确保你的安全" : "我们先停一下，确认你的安全"}
      </div>
      <div className="px-4 py-4">
        <p className="text-[11.5px] leading-6 text-ink-soft">
          如果现在有立即危险，请先拨打 <span className="font-semibold text-crisis">110/120</span>。
          你也可以联系下面任何一个热线，不必一个人扛着。
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {CRISIS_RESOURCES.map((resource) => (
            <a
              key={resource.number}
              href={`tel:${resource.number.replace(/[^\d]/g, "")}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-[#FBFAF7] px-3 py-2.5 transition hover:border-crisis/30"
            >
              <span className="text-[11px] text-ink-soft">{resource.name}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11.5px] font-medium text-crisis">
                <Phone className="h-3 w-3" />
                {resource.number}
              </span>
            </a>
          ))}
        </div>
        <p className="mt-3 text-[10px] leading-5 text-ink-faint">
          如果你愿意，也可以现在给一个信任的人发消息，让对方陪着你。安全比继续对话更重要。
        </p>
      </div>
    </div>
  );
}
