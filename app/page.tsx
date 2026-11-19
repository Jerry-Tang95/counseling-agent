import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Check,
  Compass,
  Footprints,
  HeartHandshake,
  Lock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserRoundX,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Avatar } from "@/components/avatars/Avatar";
import { CRISIS_RESOURCES } from "@/lib/safety/crisis-resources";

const boundaries = [
  {
    icon: UserRoundX,
    title: "不是心理医生",
    text: "不做诊断、不评估量表、不推荐药物，也不能替代精神科医师或心理治疗师。",
  },
  {
    icon: HeartHandshake,
    title: "不是 AI 恋人",
    text: "不提供恋爱/性角色扮演，不制造“只有我懂你”的依赖。你值得真实世界里的关系。",
  },
  {
    icon: ShieldCheck,
    title: "不给你贴标签",
    text: "不说“你是抑郁症/回避型/人格障碍”。我们只谈具体发生了什么、你在保护什么。",
  },
  {
    icon: Compass,
    title: "不替你的人生做决定",
    text: "不劝你离婚、辞职或断绝关系。我们帮你把选项和后果摆清楚，决定权在你。",
  },
];

const steps = [
  {
    n: "01",
    title: "说清楚",
    text: "从一个具体的场景开始，把模糊的情绪、身体反应和脑子里的话讲出来。",
  },
  {
    n: "02",
    title: "看见模式",
    text: "用阿德勒式提问看目的、课题与私人逻辑：这个反应在保护你什么？",
  },
  {
    n: "03",
    title: "换个角度",
    text: "不灌鸡汤，也不替你下结论。一起找一个新的、更站得住的解释。",
  },
  {
    n: "04",
    title: "带走一小步",
    text: "落到一个本周能做的小实验：哪一天、做什么、做多久、做不到怎么办。",
  },
];

export default function HomePage() {
  return (
    <div className="paper-bg min-h-screen">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid w-full max-w-6xl gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-28">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-jade-200 bg-white/70 px-3.5 py-1.5 text-[11.5px] font-medium text-jade-700">
                <Sparkles className="h-3.5 w-3.5" />
                以阿德勒心理学为骨架 · 整合人本 / CBT / DBT / 存在主义
              </div>
              <h1 className="mt-6 text-balance text-[38px] font-semibold leading-[1.18] tracking-tight text-ink sm:text-[52px]">
                把心里的结，
                <br />
                理出一个<span className="text-jade-700">头绪</span>。
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-8 text-ink-soft sm:text-[16px]">
                一个安静的 AI 对话空间。你可以带着一件具体的事来——关系、工作、家庭、选择，
                或者只是“最近有点撑不住”。我们会先接住情绪，再一起看见模式，最后带走一个能做的下一步。
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/chat"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-jade-700 px-6 py-3.5 text-[14px] font-medium text-white shadow-card transition hover:bg-jade-800"
                >
                  <MessageCircle className="h-4 w-4" />
                  开始一次对话
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#boundaries"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/10 bg-white/75 px-6 py-3.5 text-[14px] font-medium text-ink-soft transition hover:border-jade-300 hover:text-jade-700"
                >
                  先看看它不是什么
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-ink-faint">
                <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-jade-600" />18+ 成人</span>
                <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-jade-600" />对话加密存储</span>
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-jade-600" />危机信号优先处理</span>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="relative mx-auto w-full max-w-[420px]">
              <div className="absolute -left-7 top-14 h-24 w-24 rounded-full bg-jade-200/50 blur-2xl" />
              <div className="absolute -right-8 bottom-16 h-32 w-32 rounded-full bg-[#E8D5B8]/60 blur-2xl" />
              <div className="relative rounded-[34px] border border-white/80 bg-white/60 p-3 shadow-[0_30px_80px_rgba(23,49,46,0.16)] backdrop-blur">
                <div className="overflow-hidden rounded-[26px] border border-black/5 bg-[#EDEFF0]">
                  <div className="flex items-center justify-between bg-[#F7F7F5]/95 px-4 py-3 backdrop-blur">
                    <div className="flex items-center gap-2.5">
                      <Avatar id="ai-counselor" size={34} alt="心屿头像" />
                      <div>
                        <div className="text-[13px] font-semibold text-ink">心屿</div>
                        <div className="text-[10px] text-ink-faint">AI 对话助手 · 不是心理医生</div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-ink/15" />
                      <span className="h-1.5 w-1.5 rounded-full bg-ink/15" />
                      <span className="h-1.5 w-1.5 rounded-full bg-ink/15" />
                    </div>
                  </div>
                  <div className="chat-canvas min-h-[430px] space-y-5 px-4 py-5">
                    <div className="text-center text-[10px] text-ink-faint">今天 14:32</div>
                    <div className="bubble-row">
                      <Avatar id="ai-counselor" size={34} alt="心屿头像" />
                      <div className="bubble ai">
                        我听到了，这件事让你心里一直悬着。先不急着把它解决掉——今天最让你难受的，是发生了什么，还是你对自己的某个评价？
                      </div>
                    </div>
                    <div className="bubble-row user">
                      <Avatar id="user-03" size={34} alt="用户头像" />
                      <div className="bubble user">
                        可能是……我觉得自己怎么做都不够好。明明已经很努力了。
                      </div>
                    </div>
                    <div className="bubble-row">
                      <Avatar id="ai-counselor" size={34} alt="心屿头像" />
                      <div className="bubble ai">
                        如果这个“不够好”会说话，它想帮你避免什么？它可能在保护你，不让你面对某种更难受的东西。
                      </div>
                    </div>
                    <div className="bubble-row user">
                      <Avatar id="user-03" size={34} alt="用户头像" />
                      <div className="bubble user">怕别人发现我其实没那么厉害。</div>
                    </div>
                  </div>
                  <div className="border-t border-black/5 bg-white/90 p-3">
                    <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-white px-3 py-2.5">
                      <span className="flex-1 text-[11.5px] text-ink-faint">说说你现在最想聊的…</span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-jade-700 text-white">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white bg-white/90 px-3.5 py-1.5 text-[10px] font-medium text-ink-soft shadow-sm backdrop-blur">
                <Lock className="h-3 w-3 text-jade-600" />
                会话加密 · 可随时删除
              </div>
            </div>
          </div>
        </section>

        {/* Boundaries */}
        <section id="boundaries" className="border-y border-black/5 bg-white/50">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-jade-700">
                先把边界说清楚
              </p>
              <h2 className="mt-3 text-[30px] font-semibold tracking-tight text-ink sm:text-[36px]">
                它很认真，但它不是万能的。
              </h2>
              <p className="mt-4 text-[14.5px] leading-7 text-ink-soft">
                一个负责任的 AI 心理支持工具，第一步不是承诺“我能治好你”，而是诚实告诉你：哪些能做，哪些不能做。
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {boundaries.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-black/[0.08] bg-white/80 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-jade-50 text-jade-700">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-[15px] font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-[12.5px] leading-6 text-ink-soft">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-jade-700">
                一次对话，四个小步
              </p>
              <h2 className="mt-3 text-[30px] font-semibold tracking-tight text-ink sm:text-[36px]">
                不急着给答案，
                <br />
                先陪你把问题看清楚。
              </h2>
              <p className="mt-5 max-w-md text-[14px] leading-7 text-ink-soft">
                我们不会一上来就给你十条建议。一次 20–40 分钟的对话，会沿着一个温和但清晰的结构往前走。
              </p>
              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-jade-200 bg-jade-50/60 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-jade-700">
                  <Brain className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <div className="text-[12.5px] font-semibold text-ink">阿德勒式提问</div>
                  <div className="text-[11px] text-ink-faint">目的 · 课题分离 · 横向关系 · 鼓励</div>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map((step) => (
                <div key={step.n} className="rounded-2xl border border-black/[0.08] bg-white/80 p-6">
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-semibold tracking-[0.18em] text-jade-600">{step.n}</span>
                    {step.n === "04" ? (
                      <Footprints className="h-[18px] w-[18px] text-jade-500" />
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-[16px] font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-[12.5px] leading-6 text-ink-soft">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Memory feature */}
        <section className="border-y border-black/5 bg-[#F4F1EA]">
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-jade-700">
                长期记忆
              </p>
              <h2 className="mt-3 text-[30px] font-semibold tracking-tight text-ink sm:text-[36px]">
                下一次，不用从头讲起。
              </h2>
              <p className="mt-5 max-w-xl text-[14px] leading-7 text-ink-soft">
                如果你愿意开启长期记忆，心屿会记住你明确说过的目标、价值观和反复出现的模式。
                它不是偷偷记，也不是“永远懂你”的承诺——你可以在「我的记忆」里看见每一条、修改或删除。
              </p>
              <ul className="mt-6 space-y-3 text-[13px] text-ink-soft">
                {[
                  "默认关闭，单独同意后才开启",
                  "每一条记忆都可查看、编辑、删除",
                  "危机细节不写入记忆，不用于训练",
                  "随时暂停，暂停后新会话不再引用",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-jade-100 text-jade-700">
                      <Check className="h-3 w-3" />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                href="/memory"
                className="mt-7 inline-flex items-center gap-2 text-[13px] font-medium text-jade-700 hover:text-jade-800"
              >
                看看记忆长什么样 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="rounded-3xl border border-white bg-white/70 p-5 shadow-card backdrop-blur">
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <div className="text-[12px] font-semibold text-ink">我的记忆</div>
                <div className="rounded-full bg-jade-50 px-2.5 py-1 text-[10px] text-jade-700">已开启</div>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { label: "目标", text: "想在下次会议上表达一次不同意见", tone: "bg-jade-50 text-jade-700" },
                  { label: "模式", text: "被否定时先自责，然后回避沟通", tone: "bg-[#F6EFE1] text-[#8A6A35]" },
                  { label: "有效应对", text: "散步和写三行日记能让自己冷静", tone: "bg-[#EDF3F6] text-[#4E7280]" },
                ].map((memory) => (
                  <div key={memory.text} className="rounded-2xl border border-black/5 bg-white p-4">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${memory.tone}`}>{memory.label}</span>
                      <span className="text-[10px] text-ink-faint">来自 11 月 17 日的对话</span>
                    </div>
                    <p className="mt-2 text-[12.5px] leading-6 text-ink-soft">{memory.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-jade-50/70 px-3 py-2 text-[10.5px] text-jade-700">
                <Lock className="h-3 w-3" /> 加密存储 · 可随时删除
              </div>
            </div>
          </div>
        </section>

        {/* Adler */}
        <section className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-jade-700">
              为什么是阿德勒
            </p>
            <h2 className="mt-3 text-[30px] font-semibold tracking-tight text-ink sm:text-[36px]">
              不把你当成“有问题的人”，
              <br className="hidden sm:block" />
              而是一个正在想办法的人。
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "目的论",
                text: "不只问“你为什么会这样”，更问“这个反应在帮你达到什么”。把注意力从过去的原因，移回现在的选择。",
              },
              {
                title: "课题分离",
                text: "分清“我的课题”和“别人的课题”。不是冷漠，而是把力气用在你真正能改变的地方。",
              },
              {
                title: "鼓励，而不是表扬",
                text: "不空泛地说“你真棒”，而是具体看见你已经做过的努力、勇气、资源和对他人的贡献。",
              },
            ].map((item, index) => (
              <div key={item.title} className="rounded-2xl border border-black/[0.08] bg-white/80 p-7">
                <span className="text-[11px] font-semibold tracking-[0.18em] text-jade-500">0{index + 1}</span>
                <h3 className="mt-4 text-[17px] font-semibold text-ink">{item.title}</h3>
                <p className="mt-2.5 text-[12.5px] leading-6 text-ink-soft">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
          <div className="overflow-hidden rounded-3xl bg-jade-800 px-7 py-10 text-white sm:px-12 sm:py-12">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] text-jade-100">
                  <Lock className="h-3 w-3" /> 隐私优先
                </div>
                <h2 className="mt-4 text-[27px] font-semibold leading-tight sm:text-[32px]">
                  心理困扰是敏感信息。
                  <br />
                  我们不拿它做生意。
                </h2>
                <p className="mt-4 max-w-xl text-[13px] leading-7 text-jade-100/85">
                  对话与记忆加密存储；不用于模型训练、不做精准广告；原始对话默认 30 天删除；
                  你可以随时导出或删除自己的数据。正式上线前会完成隐私政策、用户协议与安全评估。
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["AES-256-GCM", "对话与记忆加密"],
                  ["30 天", "原始消息默认删除"],
                  ["可删除", "记忆逐条可见"],
                  ["不训练", "不使用你的数据"],
                ].map(([big, small]) => (
                  <div key={big} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                    <div className="text-[16px] font-semibold text-white">{big}</div>
                    <div className="mt-1 text-[11px] text-jade-100/70">{small}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Crisis strip */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
          <div className="flex flex-col gap-4 rounded-2xl border border-crisis/15 bg-red-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[12px] font-semibold text-crisis">如果你现在有立即危险</div>
              <p className="mt-1 text-[11.5px] leading-5 text-ink-soft">
                请先拨打 110/120。心理援助热线：{CRISIS_RESOURCES.find((r) => r.number === "12356")?.number}。
              </p>
            </div>
            <Link
              href="/crisis"
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-crisis/25 bg-white px-4 py-2.5 text-[12px] font-medium text-crisis transition hover:bg-red-50"
            >
              查看紧急求助资源
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-24 text-center sm:px-8">
          <h2 className="text-[30px] font-semibold tracking-tight text-ink sm:text-[38px]">
            如果今天有点难，
            <br className="sm:hidden" />
            先从一句话开始。
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[13.5px] leading-7 text-ink-soft">
            不需要准备好完整的故事。你可以只说：“我最近有点累。”
          </p>
          <Link
            href="/chat"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-jade-700 px-7 py-4 text-[14px] font-medium text-white shadow-card transition hover:bg-jade-800"
          >
            <MessageCircle className="h-4 w-4" />
            开始一次对话
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
