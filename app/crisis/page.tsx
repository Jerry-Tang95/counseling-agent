import Link from "next/link";
import { ArrowLeft, HeartHandshake, MapPin, Phone, ShieldAlert } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CRISIS_RESOURCES } from "@/lib/safety/crisis-resources";

export default function CrisisPage() {
  return (
    <div className="paper-bg min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-ink-soft hover:text-jade-700">
          <ArrowLeft className="h-4 w-4" /> 返回首页
        </Link>

        <div className="mt-7 rounded-3xl border border-crisis/20 bg-white p-6 shadow-sm sm:p-9">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-crisis">
              <ShieldAlert className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-ink sm:text-[34px]">
                如果你现在有立即危险
              </h1>
              <p className="mt-2 text-[13px] leading-7 text-ink-soft">
                请先做一件事：<strong className="text-crisis">拨打 110 或 120</strong>。
                不要一个人扛着。如果可能，请把门打开、远离可以伤害自己的物品，去一个有其他人的地方。
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {CRISIS_RESOURCES.map((resource) => (
              <a
                key={resource.number}
                href={`tel:${resource.number.replace(/[^\d]/g, "")}`}
                className={`group rounded-2xl border p-4 transition ${
                  resource.emergency
                    ? "border-crisis/25 bg-red-50/70 hover:border-crisis/40"
                    : "border-black/[0.08] bg-[#FBFAF7] hover:border-jade-300"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12.5px] font-medium text-ink">{resource.name}</span>
                  <span className={`inline-flex items-center gap-1 font-mono text-[13px] font-semibold ${resource.emergency ? "text-crisis" : "text-jade-700"}`}>
                    <Phone className="h-3.5 w-3.5" />
                    {resource.number}
                  </span>
                </div>
                <p className="mt-1.5 text-[10.5px] leading-5 text-ink-faint">{resource.description}</p>
              </a>
            ))}
          </div>

          <div className="mt-7 rounded-2xl bg-[#F4F1EA] p-5">
            <div className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <HeartHandshake className="h-4 w-4 text-jade-700" /> 现在可以做的 4 件小事
            </div>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-[12px] leading-6 text-ink-soft">
              <li>先深呼吸三次，把注意力放在脚底和呼吸上；如果做不到，也不用勉强。</li>
              <li>给你信任的一个人发一条消息：“我现在状态不太好，你能陪我一会儿吗？”</li>
              <li>
                如果你有安全计划，按上面的步骤做；如果没有，可以现在写一个最简单的：
                <br />
                <span className="text-ink-faint">预警信号 → 我能做的 2 件事 → 我可以联系的人 → 紧急电话</span>
              </li>
              <li>如果身边有药物、刀具或其他可能伤害自己的物品，请让它们离你远一点，或交给别人保管。</li>
            </ol>
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-xl border border-black/[0.08] bg-white px-3.5 py-3 text-[10.5px] leading-5 text-ink-faint">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            如果不知道去哪家医院：优先前往当地三甲医院的精神科/心理科，或精神卫生中心；急诊 24 小时可处理紧急情况。
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <h2 className="text-[13px] font-semibold text-ink">关于本产品</h2>
          <p className="mt-2 text-[11.5px] leading-6 text-ink-soft">
            心屿不是急救或危机干预服务。它不能替代 110/120、急诊、精神科医生或心理咨询师。
            如果你正在经历危机，请优先联系真人帮助；安全比继续对话更重要。
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/chat" className="text-[12px] text-ink-soft underline-offset-4 hover:text-jade-700 hover:underline">
            我确认自己现在安全，返回对话
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
