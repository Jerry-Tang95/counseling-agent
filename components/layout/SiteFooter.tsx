import Link from "next/link";
import { BrandMark } from "@/components/layout/Brand";
import { CRISIS_RESOURCES } from "@/lib/safety/crisis-resources";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-[#F4F1EA]">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandMark size={30} />
              <span className="text-[15px] font-semibold text-ink">心屿</span>
            </div>
            <p className="mt-4 max-w-sm text-[12.5px] leading-6 text-ink-soft">
              AI 心理咨询式对话助手。不是心理医生，不做诊断、治疗或开药。
              如果你需要医疗帮助，请前往正规医院的精神科或心理科。
            </p>
            <p className="mt-3 text-[11px] leading-5 text-ink-faint">
              本项目为内部原型，正式上线前需由持证心理咨询师/精神科医师审阅。
            </p>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              了解
            </h3>
            <ul className="mt-4 space-y-2.5 text-[12.5px] text-ink-soft">
              <li><Link className="hover:text-jade-700" href="/about">方法论与边界</Link></li>
              <li><Link className="hover:text-jade-700" href="/privacy">隐私政策</Link></li>
              <li><Link className="hover:text-jade-700" href="/terms">用户协议</Link></li>
              <li><Link className="hover:text-jade-700" href="/memory">我的记忆</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              紧急求助
            </h3>
            <ul className="mt-4 space-y-2.5 text-[12.5px] text-ink-soft">
              {CRISIS_RESOURCES.slice(0, 3).map((resource) => (
                <li key={resource.number} className="flex items-baseline justify-between gap-3">
                  <span>{resource.name}</span>
                  <span className="font-mono text-[12px] text-crisis">{resource.number}</span>
                </li>
              ))}
              <li>
                <Link className="text-crisis underline-offset-4 hover:underline" href="/crisis">
                  查看全部危机资源 →
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-black/5 pt-5 text-[11px] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 心屿 · 心理咨询Agent</span>
          <span>请对自己温柔一点，也给改变一点时间。</span>
        </div>
      </div>
    </footer>
  );
}
