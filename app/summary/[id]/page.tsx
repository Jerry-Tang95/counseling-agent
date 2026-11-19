import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Brain,
  CheckCircle2,
  Compass,
  Footprints,
  Heart,
  ShieldAlert,
  Sparkles,
  Target,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/anonymous";
import { prisma } from "@/lib/db/client";
import { listMemoryViews, categoryLabel } from "@/lib/memory/service";
import { Brand } from "@/components/layout/Brand";
import { PageNav } from "@/components/layout/PageNav";
import { SummaryActions } from "@/components/summary/SummaryActions";
import { FeedbackCard } from "@/components/summary/FeedbackCard";
import { CRISIS_RESOURCES } from "@/lib/safety/crisis-resources";

export const dynamic = "force-dynamic";

const SECTIONS = [
  { key: "presenting", label: "你带来的困扰", icon: Heart, tone: "bg-[#FBF1EE] text-[#A45B4A]" },
  { key: "patterns", label: "看见的模式", icon: Compass, tone: "bg-[#F2F5EC] text-[#5F7A4A]" },
  { key: "strengths", label: "你的资源与优势", icon: Sparkles, tone: "bg-[#F6F1E7] text-[#8A6A35]" },
  { key: "goals", label: "你想去的方向", icon: Target, tone: "bg-[#EDF3F6] text-[#4E7280]" },
  { key: "actionPlan", label: "这周可以试的一小步", icon: Footprints, tone: "bg-jade-50 text-jade-700" },
] as const;

export default async function SummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/start");
  const { id } = await params;

  const summary = await prisma.sessionSummary.findFirst({
    where: { id, session: { userId: user.id } },
    include: { session: true },
  });
  if (!summary) notFound();

  const memories = (await listMemoryViews(user.id)).filter(
    (item) => item.sourceSessionId === summary.sessionId,
  );

  return (
    <div className="paper-bg min-h-[100dvh]">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[#F7F7F5]/90 backdrop-blur">
        <div className="mx-auto flex h-[64px] w-full max-w-2xl items-center justify-between px-4 sm:px-6">
          <PageNav />
          <Brand compact />
          <Link href="/memory" className="text-[11px] text-jade-700">我的记忆</Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-jade-50 px-3 py-1.5 text-[10.5px] font-medium text-jade-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> 本次对话总结
          </div>
          <h1 className="mt-4 text-[28px] font-semibold tracking-tight text-ink sm:text-[34px]">
            把今天的谈话，
            <br className="sm:hidden" />
            收进一页纸里。
          </h1>
          <p className="mt-3 text-[11.5px] text-ink-faint">
            这不是诊断报告，只是一次对话的整理。你可以随时回来重读，也可以删除它。
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {SECTIONS.map((section) => (
            <div key={section.key} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${section.tone}`}>
                  <section.icon className="h-4 w-4" />
                </span>
                <h2 className="text-[13px] font-semibold text-ink">{section.label}</h2>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[13px] leading-7 text-ink-soft">
                {summary[section.key]}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-jade-100 bg-jade-50/50 p-5">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-jade-700" />
            <h2 className="text-[13px] font-semibold text-ink">这次记住的内容</h2>
            <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[9px] text-jade-700">
              {user.memoryEnabled ? "长期记忆已开启" : "长期记忆未开启"}
            </span>
          </div>
          {memories.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {memories.map((memory) => (
                <li key={memory.id} className="flex items-start gap-2 rounded-xl bg-white px-3 py-2.5 text-[11.5px] leading-5 text-ink-soft">
                  <span className="shrink-0 rounded-full bg-jade-50 px-2 py-0.5 text-[9.5px] text-jade-700">{categoryLabel(memory.category)}</span>
                  <span>{memory.content}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[11.5px] leading-6 text-ink-soft">
              {user.memoryEnabled
                ? "这次没有写入新的长期记忆。你可以在「我的记忆」里查看已有内容。"
                : "长期记忆目前是关闭的。开启后，心屿才能在下一次对话里记得你明确说过的目标和模式。"}
            </p>
          )}
          <Link href="/memory" className="mt-3 inline-block text-[11px] font-medium text-jade-700 hover:text-jade-800">
            查看或管理我的记忆 →
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border border-crisis/15 bg-red-50/50 p-4">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-crisis" />
            <div className="text-[10.5px] leading-5 text-ink-soft">
              <span className="font-medium text-crisis">如果情况变严重了：</span>
              请拨打 110/120，或联系 {CRISIS_RESOURCES.slice(2, 4).map((r) => `${r.name} ${r.number}`).join("、")}。
              也可以前往当地医院的精神科或心理科。
            </div>
          </div>
        </div>

        <FeedbackCard sessionId={summary.sessionId} />

        <div className="mt-7">
          <SummaryActions sessionId={summary.sessionId} />
        </div>
        <p className="mt-5 text-center text-[9.5px] leading-5 text-ink-faint">
          本页由 AI 生成，不是诊断或治疗记录。如内容与你的感受不符，请以你的真实感受为准。
        </p>
      </main>
    </div>
  );
}
