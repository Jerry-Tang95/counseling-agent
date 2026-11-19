import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/anonymous";
import { safeDecrypt } from "@/lib/crypto/encrypt";
import { generateSessionSummary, extractSessionMemories } from "@/lib/ai/agents";
import {
  listMemoryViews,
  saveMemoryOperations,
} from "@/lib/memory/service";
import { summaryRequestSchema } from "@/lib/validation/schemas";
import type { ChatTurn } from "@/lib/ai/mock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = summaryRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const session = await prisma.session.findFirst({
    where: { id: parsed.data.sessionId, userId: user.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      summary: true,
    },
  });
  if (!session) {
    return NextResponse.json({ error: "会话不存在" }, { status: 404 });
  }

  if (session.summary) {
    const memories = (await listMemoryViews(user.id)).filter(
      (item) => item.sourceSessionId === session.id,
    );
    return NextResponse.json({
      summaryId: session.summary.id,
      summary: session.summary,
      newMemories: memories,
      alreadyExists: true,
    });
  }

  const messages: ChatTurn[] = session.messages.map((item) => ({
    role: item.role as ChatTurn["role"],
    content: safeDecrypt(item.contentCipher),
  }));

  const summary = await generateSessionSummary(messages);
  const savedSummary = await prisma.sessionSummary.create({
    data: {
      sessionId: session.id,
      presenting: summary.presenting,
      patterns: summary.patterns,
      strengths: summary.strengths,
      goals: summary.goals,
      actionPlan: summary.actionPlan,
      riskLevel: session.riskLevel,
    },
  });

  await prisma.session.update({
    where: { id: session.id },
    data: { status: "completed", stage: "summary", endedAt: new Date() },
  });

  let newMemories: Awaited<ReturnType<typeof saveMemoryOperations>> = [];
  if (user.memoryEnabled) {
    const existing = (await listMemoryViews(user.id)).filter(
      (item) => item.status === "active",
    );
    const operations = await extractSessionMemories(messages, existing);
    newMemories = await saveMemoryOperations(user.id, session.id, operations);
  }

  return NextResponse.json({
    summaryId: savedSummary.id,
    summary: savedSummary,
    newMemories,
    memoryEnabled: user.memoryEnabled,
  });
}
