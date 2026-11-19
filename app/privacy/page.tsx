import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function PrivacyPage() {
  return (
    <div className="paper-bg min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-jade-700">隐私政策</p>
        <h1 className="mt-3 text-[32px] font-semibold tracking-tight text-ink sm:text-[40px]">
          你的心理困扰，是敏感信息。
        </h1>
        <p className="mt-4 text-[13px] leading-7 text-ink-soft">
          生效日期：2026 年 11 月 17 日 · 版本 v1（内部原型）
        </p>
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-[11.5px] leading-6 text-ink-soft">
          本文件是 MVP 阶段的隐私政策草案，不构成正式法律意见。正式上线前需由法律顾问审阅，并完成适用的备案与安全评估。
        </div>

        <div className="mt-10 space-y-9 text-[13px] leading-7 text-ink-soft">
          <section>
            <h2 className="text-[17px] font-semibold text-ink">1. 我们收集什么</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li><strong className="text-ink">匿名标识</strong>：一个随机生成的用户 ID，保存在你的浏览器 Cookie 中，用于找回你的会话。</li>
              <li><strong className="text-ink">年龄段</strong>：仅用于确认你已满 18 岁和调整对话方式，不收集生日、身份证、真实姓名。</li>
              <li><strong className="text-ink">对话内容</strong>：你发送的消息与 AI 回复，加密存储。</li>
              <li><strong className="text-ink">会话摘要与长期记忆</strong>：仅在你开启长期记忆后保存；你可以查看、编辑、删除。</li>
              <li><strong className="text-ink">安全事件</strong>：当系统识别到危机信号时，记录风险级别、类型与处理动作，不记录不必要的原文。</li>
              <li><strong className="text-ink">基础技术日志</strong>：如错误日志、请求时间，用于排障，不用于广告画像。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink">2. 我们为什么使用这些信息</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>提供对话、会话总结与跨会话记忆功能；</li>
              <li>识别危机信号并触发安全流程；</li>
              <li>保障服务安全、排查故障、改进产品体验；</li>
              <li>遵守法律法规要求的记录与安全义务。</li>
            </ul>
            <p className="mt-3">我们不会把你的对话或记忆用于模型训练、精准广告、对外分享或出售。</p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink">3. 敏感个人信息的单独同意</h2>
            <p className="mt-3">
              心理健康信息属于《个人信息保护法》定义的敏感个人信息。我们仅在你有明确交互、并单独勾选同意后，才处理与保存长期记忆。
              你可以随时在「我的记忆」中关闭记忆、删除单条记忆或清空全部记忆。
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink">4. 存储与保留</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>对话内容使用 AES-256-GCM 加密后存储在数据库中；</li>
              <li>原始消息默认在 30 天后自动删除（正式版将实现定时清理任务）；</li>
              <li>会话摘要与长期记忆保留到你主动删除；删除会话时可选择删除由它产生的记忆；</li>
              <li>删除后，数据库不再保留对应明文或密文。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink">5. 第三方与模型服务</h2>
            <p className="mt-3">
              为了生成回复，我们可能调用经配置的 OpenAI-compatible 大模型服务。调用时只发送完成当前回复所需的对话上下文，不发送你的匿名 ID 以外的身份信息。
              当前内部原型在 Mock 模式下不会向第三方发送对话内容；接入真实模型时，将在本政策中列明服务提供者与数据处理方式。
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink">6. 你的权利</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>查看、复制、更正你的记忆内容；</li>
              <li>删除单条记忆、清空全部记忆、删除会话；</li>
              <li>关闭长期记忆；</li>
              <li>拒绝或撤回同意（撤回不影响此前基于同意进行的处理）。</li>
            </ul>
            <p className="mt-3">当前版本可通过页面上的「我的记忆」与「删除这次会话」完成上述操作。</p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink">7. 未成年人</h2>
            <p className="mt-3">
              本产品仅面向 18 岁以上成年人。我们不会故意收集未成年人的信息；识别到未成年人会停止咨询式对话，并引导其寻求监护人或专业帮助。
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink">8. 安全事件与联系</h2>
            <p className="mt-3">
              如果发生个人信息泄露、篡改或丢失，我们会按法律法规要求及时处置并通知受影响用户。
              当前为内部原型，正式联系方式将在上线前补充。
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink">9. 政策更新</h2>
            <p className="mt-3">
              我们可能因功能、法规或安全需要更新本政策。重大变更会通过页面提示重新获得你的同意。
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
