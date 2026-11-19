import Link from "next/link";
import { ArrowRight, BookOpen, Compass, HeartHandshake, Quote, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const schools = [
  ["阿德勒心理学", "主骨架：目的论、自卑与补偿、社会兴趣、课题分离、横向关系、鼓励。"],
  ["人本主义（罗杰斯）", "底层态度：无条件积极关注、共情、真诚。"],
  ["CBT（贝克）", "当用户被“我不行/没人喜欢我/一定会失败”卡住时，做想法记录和小实验。"],
  ["REBT（艾利斯）", "识别“必须/应该/一定要”的绝对化信念，做温和的辩驳。"],
  ["DBT（莱恩汉）", "情绪强度高时，先做稳定化（呼吸、grounding、TIPP），再谈认知。"],
  ["存在主义（弗兰克尔/亚隆）", "面对丧失、无意义感、选择与责任时，探索意义与有限性。"],
  ["依恋与系统视角", "理解亲密关系中的追逃、信任与家庭互动模式，不贴“焦虑型/回避型”标签。"],
];

export default function AboutPage() {
  return (
    <div className="paper-bg min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-jade-50 px-3 py-1.5 text-[11px] font-medium text-jade-700">
            <BookOpen className="h-3.5 w-3.5" /> 方法论与边界
          </div>
          <h1 className="mt-5 text-[34px] font-semibold leading-tight tracking-tight text-ink sm:text-[44px]">
            它是一个对话工具，
            <br />
            不是一个“心理医生”。
          </h1>
          <p className="mt-5 text-[14.5px] leading-8 text-ink-soft">
            心屿的目标不是“像人一样聊天”，而是用一套有结构、有温度、有边界的方式，
            帮你在一次对话里把问题说清楚、看见模式，并带走一个能做的下一步。
          </p>
        </div>

        <section className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            { icon: HeartHandshake, title: "先接住情绪", text: "不急着分析、不急着给建议。先让你感到被听见。" },
            { icon: Compass, title: "再看清模式", text: "用阿德勒式提问，理解行为背后的目的与保护。" },
            { icon: ShieldCheck, title: "守住边界", text: "不诊断、不开药、不替代专业帮助，必要时转介。" },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-black/[0.08] bg-white/80 p-5">
              <item.icon className="h-5 w-5 text-jade-700" />
              <h2 className="mt-3 text-[14px] font-semibold text-ink">{item.title}</h2>
              <p className="mt-1.5 text-[12px] leading-6 text-ink-soft">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="mt-16">
          <h2 className="text-[24px] font-semibold tracking-tight text-ink">理论底座：阿德勒为骨架，其他流派为工具箱</h2>
          <p className="mt-3 max-w-2xl text-[13px] leading-7 text-ink-soft">
            对外我们参考多个心理学流派；对内，阿德勒心理学是主骨架。一次对话不会同时抛给你五个流派，
            而是优先用阿德勒式提问，需要时只引入一个合适的工具，并解释“为什么现在用它”。
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-black/[0.08] bg-white/80">
            {schools.map(([name, text], index) => (
              <div key={name} className={`grid gap-2 px-5 py-4 sm:grid-cols-[170px_1fr] ${index > 0 ? "border-t border-black/5" : ""}`}>
                <div className="text-[12.5px] font-medium text-ink">{name}</div>
                <div className="text-[12px] leading-6 text-ink-soft">{text}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl bg-jade-800 px-6 py-9 text-white sm:px-10">
          <Quote className="h-7 w-7 text-jade-200/60" />
          <blockquote className="mt-4 text-[20px] font-medium leading-relaxed sm:text-[24px]">
            “重要的不是过去发生了什么，
            <br className="hidden sm:block" />
            而是你现在想往哪里去。”
          </blockquote>
          <p className="mt-4 text-[11px] text-jade-100/60">—— 阿德勒心理学的一个核心转向</p>
        </section>

        <section className="mt-16">
          <h2 className="text-[24px] font-semibold tracking-tight text-ink">明确的不能做</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["不做诊断", "不能判断你是否有抑郁症、焦虑症或任何人格障碍。"],
              ["不开药", "不推荐药物、剂量、停药或保健品。"],
              ["不承诺疗效", "不使用“治愈/包好/保证”等表述。"],
              ["不做恋爱角色扮演", "不提供虚拟恋人、性角色扮演或依赖诱导。"],
              ["不替代专业帮助", "需要医疗判断时，会建议你找精神科/心理科。"],
              ["不服务未成年人", "产品仅限 18 岁以上成年人。"],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl border border-black/[0.08] bg-white/70 p-4">
                <div className="text-[12.5px] font-semibold text-ink">{title}</div>
                <p className="mt-1 text-[11.5px] leading-5 text-ink-soft">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
          <h2 className="text-[14px] font-semibold text-ink">关于临床审阅</h2>
          <p className="mt-2 text-[12px] leading-6 text-ink-soft">
            本项目目前是内部原型。正式面向公众上线前，必须由持证心理咨询师/精神科医师对内容、危机流程与边界进行审阅；
            并完成适用的备案、算法登记与安全评估。在此之前，它不能替代任何专业服务。
          </p>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/chat" className="inline-flex items-center gap-2 rounded-full bg-jade-700 px-5 py-3 text-[13px] font-medium text-white hover:bg-jade-800">
            开始一次对话 <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/privacy" className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-3 text-[13px] text-ink-soft hover:border-jade-300">
            阅读隐私政策
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
