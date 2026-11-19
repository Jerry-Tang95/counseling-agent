import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function TermsPage() {
  return (
    <div className="paper-bg min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-jade-700">用户协议</p>
        <h1 className="mt-3 text-[32px] font-semibold tracking-tight text-ink sm:text-[40px]">
          先把话说在前面。
        </h1>
        <p className="mt-4 text-[13px] leading-7 text-ink-soft">
          生效日期：2026 年 11 月 17 日 · 版本 v1（内部原型）
        </p>

        <div className="mt-10 space-y-9 text-[13px] leading-7 text-ink-soft">
          <section>
            <h2 className="text-[17px] font-semibold text-ink">1. 这是什么</h2>
            <p className="mt-3">
              心屿是一个 AI 心理咨询式对话助手，提供自助式对话、情绪梳理与行动建议。它不是医疗机构，不提供诊断、治疗、处方或急救服务，
              也不能替代精神科医师、心理治疗师或心理咨询师。
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink">2. 使用资格</h2>
            <p className="mt-3">
              你需确认已年满 18 岁。未成年人不得使用本产品。若系统识别到未成年人，将停止咨询式对话并引导其寻求监护人或专业帮助。
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink">3. 紧急情况</h2>
            <p className="mt-3">
              本产品不是急救或危机干预服务。如果你或他人正面临立即的人身危险，请立刻拨打 <strong className="text-crisis">110/120</strong>，
              或联系当地医院急诊、精神卫生中心。心理援助热线：<strong className="text-crisis">12356</strong>。
            </p>
            <p className="mt-2">
              在涉及生命安全的情况下，AI 不能承诺保密，也不能替代真人帮助。
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink">4. AI 的局限</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>AI 可能生成不准确、不完整或不适合你的内容；</li>
              <li>AI 不能做医学诊断、不能开药、不能判断药物剂量；</li>
              <li>AI 不提供恋爱、性角色扮演或虚拟亲密关系；</li>
              <li>AI 的建议不构成专业意见，重大决定请咨询真人专业人士。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink">5. 你的责任</h2>
            <p className="mt-3">
              请勿使用本产品从事违法、有害、欺诈、骚扰或侵犯他人权益的行为；请勿尝试绕过安全规则、诱导诊断/开药、输入他人的敏感个人信息。
              你对在对话中提供的信息负责，请避免输入身份证号、住址、真实姓名等不必要的身份信息。
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink">6. 隐私与数据</h2>
            <p className="mt-3">
              我们按照<Link href="/privacy" className="mx-1 text-jade-700 underline underline-offset-2">隐私政策</Link>
              处理你的信息。对话与记忆加密存储，原始消息默认 30 天删除；长期记忆需单独开启，可随时查看、修改、删除。
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink">7. 服务变更与中断</h2>
            <p className="mt-3">
              本产品当前为内部原型，可能随时调整、暂停或终止部分功能。我们会尽力提前提示，但不对因服务中断造成的损失承担责任（法律另有规定的除外）。
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink">8. 协议更新</h2>
            <p className="mt-3">
              我们可能根据功能或法规变化更新本协议。重大变更会通过页面提示重新获得你的同意。继续使用即表示接受更新后的协议。
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink">9. 联系</h2>
            <p className="mt-3">
              当前为内部原型，正式联系方式将在上线前补充。若你对本协议有疑问，请先暂停使用并联系项目负责人。
            </p>
          </section>
        </div>

        <div className="mt-10 rounded-2xl border border-black/[0.08] bg-white/70 p-4 text-[11px] leading-6 text-ink-faint">
          本协议是 MVP 阶段草案，不构成正式法律意见；正式上线前需由法律顾问审阅。
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
