"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  HeartHandshake,
  Lock,
  ShieldAlert,
  Sparkles,
  UserRoundX,
} from "lucide-react";
import { Avatar, USER_AVATAR_IDS } from "@/components/avatars/Avatar";
import { Brand } from "@/components/layout/Brand";
import { PageNav } from "@/components/layout/PageNav";
import { CRISIS_RESOURCES } from "@/lib/safety/crisis-resources";

const AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55+"] as const;
type AgeRange = (typeof AGE_RANGES)[number];

export function StartFlow({
  defaultAvatar = "user-01",
  defaultMemory = false,
  hasExistingUser = false,
}: {
  defaultAvatar?: string;
  defaultMemory?: boolean;
  hasExistingUser?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [ageRange, setAgeRange] = useState<AgeRange>("25-34");
  const [agreed, setAgreed] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(defaultMemory);
  const [avatarId, setAvatarId] = useState(defaultAvatar);
  const [underage, setUnderage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!agreed) {
      setError("请先确认你已理解并同意上述内容。");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageRange,
          avatarId,
          memoryEnabled,
          agreed: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "创建会话失败");
      }
      router.push(`/chat/${data.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建会话失败，请重试。");
      setLoading(false);
    }
  }

  if (underage) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-5 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-crisis">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-[26px] font-semibold text-ink">这个产品不适合未成年人</h1>
        <p className="mt-4 text-[13.5px] leading-7 text-ink-soft">
          心屿只面向 18 岁以上的成年人。如果你还未成年，请优先告诉监护人、学校心理老师，
          或拨打 <span className="font-medium text-crisis">12356</span> 心理援助热线。
          如果情况紧急，请拨打 <span className="font-medium text-crisis">110/120</span>。
        </p>
        <div className="mt-6 w-full rounded-2xl border border-black/[0.08] bg-white p-4 text-left text-[12px] leading-6 text-ink-soft">
          <p className="font-medium text-ink">你值得得到身边真实大人的帮助</p>
          <p className="mt-1">这不是你的错，也不代表你“有问题”。找一个你信任的大人，把现在的感受告诉他/她。</p>
        </div>
        <button
          type="button"
          onClick={() => setUnderage(false)}
          className="mt-6 text-[12px] text-ink-faint underline-offset-4 hover:underline"
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="paper-bg min-h-screen">
      <div className="mx-auto flex w-full max-w-2xl flex-col px-5 py-8 sm:px-8 sm:py-12">
        <div className="flex items-center justify-between">
          <Brand compact />
          <PageNav showChats={false} labelsOnMobile />
        </div>

        <div className="mt-10 flex items-center gap-2">
          {[1, 2, 3].map((item) => (
            <span
              key={item}
              className={`h-1.5 flex-1 rounded-full transition ${item <= step ? "bg-jade-600" : "bg-ink/10"}`}
            />
          ))}
        </div>
        <div className="mt-2 text-[11px] text-ink-faint">第 {step} / 3 步</div>

        {step === 1 && (
          <section className="mt-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-jade-50 px-3 py-1.5 text-[11px] font-medium text-jade-700">
              <Sparkles className="h-3.5 w-3.5" /> 开始之前
            </div>
            <h1 className="mt-5 text-[30px] font-semibold leading-tight tracking-tight text-ink sm:text-[36px]">
              先确认一下：
              <br />
              你已经 18 岁了吗？
            </h1>
            <p className="mt-4 text-[13.5px] leading-7 text-ink-soft">
              心屿只面向 18 岁以上的成年人。我们不会收集你的真实姓名、身份证或住址，只需要知道你的年龄段，方便用更合适的方式和你说话。
            </p>
            <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
              {AGE_RANGES.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setAgeRange(range)}
                  className={`rounded-xl border px-3 py-3 text-[13px] transition ${
                    ageRange === range
                      ? "border-jade-500 bg-jade-50 font-medium text-jade-800"
                      : "border-ink/10 bg-white text-ink-soft hover:border-jade-300"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setUnderage(true)}
              className="mt-4 text-[12px] text-ink-faint underline-offset-4 hover:text-crisis hover:underline"
            >
              我还没有满 18 岁
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-jade-700 px-6 py-3.5 text-[14px] font-medium text-white shadow-sm transition hover:bg-jade-800"
            >
              下一步：了解边界 <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="mt-8 animate-fade-up">
            <h1 className="text-[30px] font-semibold leading-tight tracking-tight text-ink sm:text-[36px]">
              它是对话助手，
              <br />
              不是心理医生。
            </h1>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: HeartHandshake,
                  title: "它能做的",
                  items: ["陪你理清情绪与困扰", "用阿德勒式提问探索模式", "帮你设计一个可执行的小行动", "在你需要时提示专业帮助"],
                  tone: "border-jade-200 bg-jade-50/60",
                },
                {
                  icon: UserRoundX,
                  title: "它不能做的",
                  items: ["诊断任何心理疾病", "开药、推荐剂量或停药", "替代心理咨询/精神科治疗", "提供恋爱或性角色扮演"],
                  tone: "border-amber-200 bg-amber-50/60",
                },
              ].map((box) => (
                <div key={box.title} className={`rounded-2xl border p-5 ${box.tone}`}>
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                    <box.icon className="h-4 w-4 text-jade-700" /> {box.title}
                  </div>
                  <ul className="mt-3 space-y-2 text-[12px] leading-5 text-ink-soft">
                    {box.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-jade-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-crisis/15 bg-red-50/50 p-4">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-crisis" />
                <div className="text-[11.5px] leading-6 text-ink-soft">
                  <span className="font-medium text-crisis">危机优先：</span>
                  如果你有自伤、自杀、伤人想法，或正在经历家暴、性侵等危险，请优先拨打
                  <span className="font-medium"> 110/120</span>，或心理援助热线
                  <span className="font-medium"> 12356</span>。安全比继续对话更重要。
                </div>
              </div>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/10 bg-white p-4">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-jade-700"
              />
              <span className="text-[12px] leading-6 text-ink-soft">
                我已年满 18 岁，已阅读并理解
                <Link href="/terms" className="mx-1 text-jade-700 underline underline-offset-2">用户协议</Link>
                与
                <Link href="/privacy" className="mx-1 text-jade-700 underline underline-offset-2">隐私政策</Link>
                ，知道这是 AI 对话助手，不是心理医生，不能替代专业帮助。
              </span>
            </label>
            {error && <p className="mt-3 text-[12px] text-crisis">{error}</p>}

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-ink/10 bg-white px-5 py-3.5 text-[13px] text-ink-soft transition hover:border-jade-300"
              >
                <ArrowLeft className="h-4 w-4" /> 返回
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!agreed) {
                    setError("请先勾选确认。");
                    return;
                  }
                  setError("");
                  setStep(3);
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-jade-700 px-6 py-3.5 text-[14px] font-medium text-white shadow-sm transition hover:bg-jade-800"
              >
                下一步：选一个头像 <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="mt-8 animate-fade-up">
            <h1 className="text-[30px] font-semibold leading-tight tracking-tight text-ink sm:text-[36px]">
              选一个你喜欢的头像。
            </h1>
            <p className="mt-3 text-[13px] leading-7 text-ink-soft">
              它会出现在你的聊天气泡旁边。你随时可以在「我的记忆」页面里更换。AI 一侧使用固定的品牌头像，不是真人形象。
            </p>

            <div className="mt-6 rounded-2xl border border-black/[0.08] bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-medium text-ink">我的头像</div>
                <button
                  type="button"
                  onClick={() => {
                    const options = USER_AVATAR_IDS.filter((id) => id !== avatarId);
                    setAvatarId(options[Math.floor(Math.random() * options.length)]);
                  }}
                  className="text-[11px] text-jade-700 hover:text-jade-800"
                >
                  随机换一个
                </button>
              </div>
              <div className="mt-4 grid grid-cols-6 gap-2.5 sm:grid-cols-12 sm:gap-2">
                {USER_AVATAR_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAvatarId(id)}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-xl p-0.5 transition ${
                      avatarId === id ? "bg-jade-100 ring-2 ring-jade-500" : "hover:bg-ink/5"
                    }`}
                    aria-label={`选择头像 ${id}`}
                  >
                    <Avatar id={id} size={34} alt={`头像 ${id}`} className="h-full w-full" />
                    {avatarId === id && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-jade-700 text-white">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-black/[0.08] bg-white p-4">
              <Avatar id="ai-counselor" size={44} alt="心屿头像" />
              <div>
                <div className="text-[12px] font-medium text-ink">心屿 · AI 对话助手</div>
                <div className="mt-0.5 text-[11px] leading-5 text-ink-faint">固定品牌头像，不提供拟人化“医生/恋人”人设。</div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-black/[0.08] bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[12.5px] font-medium text-ink">
                    <Lock className="h-3.5 w-3.5 text-jade-700" /> 长期记忆
                  </div>
                  <p className="mt-1 text-[11.5px] leading-6 text-ink-soft">
                    开启后，心屿会记住你明确说过的目标、价值观和模式，下一次不用从头讲。
                    默认关闭；你可以随时在「我的记忆」里查看、修改、删除或暂停。
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={memoryEnabled}
                  aria-label="长期记忆"
                  onClick={() => setMemoryEnabled((value) => !value)}
                  className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition ${memoryEnabled ? "bg-jade-700" : "bg-ink/15"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${memoryEnabled ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            </div>

            {error && <p className="mt-3 text-[12px] text-crisis">{error}</p>}
            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-ink/10 bg-white px-5 py-3.5 text-[13px] text-ink-soft transition hover:border-jade-300"
              >
                <ArrowLeft className="h-4 w-4" /> 返回
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-jade-700 px-6 py-3.5 text-[14px] font-medium text-white shadow-sm transition hover:bg-jade-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "正在准备…" : hasExistingUser ? "开始新的对话" : "进入对话"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-4 text-center text-[10.5px] leading-5 text-ink-faint">
              点击进入即表示你同意在本设备上保存匿名会话标识；清除浏览器 Cookie 会失去历史记录。
            </p>
            <div className="mt-6 text-center text-[10.5px] text-ink-faint">
              紧急情况：{CRISIS_RESOURCES.slice(0, 2).map((r) => r.number).join(" / ")} · 心理援助 12356
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
