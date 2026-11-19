import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/anonymous";
import { safeDecrypt } from "@/lib/crypto/encrypt";
import { sessionTitleSchema } from "@/lib/validation/schemas";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const session = await prisma.session.findFirst({
    where: { id, userId: user.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      summary: true,
    },
  });
  if (!session) {
    return NextResponse.json({ error: "会话不存在" }, { status: 404 });
  }

  return NextResponse.json({
    session: {
      id: session.id,
      title: session.title,
      stage: session.stage,
      status: session.status,
      riskLevel: session.riskLevel,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
    },
    messages: session.messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: safeDecrypt(message.contentCipher),
      memoryRefs: message.memoryRefs ? JSON.parse(message.memoryRefs) : [],
      createdAt: message.createdAt,
    })),
    summary: session.summary
      ? {
          id: session.summary.id,
          presenting: session.summary.presenting,
          patterns: session.summary.patterns,
          strengths: session.summary.strengths,
          goals: session.summary.goals,
          actionPlan: session.summary.actionPlan,
          riskLevel: session.summary.riskLevel,
          createdAt: session.summary.createdAt,
        }
      : null,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const session = await prisma.session.findFirst({
    where: { id, userId: user.id },
  });
  if (!session) {
    return NextResponse.json({ error: "会话不存在" }, { status: 404 });
  }

  const json = await request.json().catch(() => null);
  const parsed = sessionTitleSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "名称格式不正确" },
      { status: 400 },
    );
  }

  const updated = await prisma.session.update({
    where: { id },
    data: { title: parsed.data.title },
  });
  return NextResponse.json({ ok: true, title: updated.title });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const session = await prisma.session.findFirst({
    where: { id, userId: user.id },
  });
  if (!session) {
    return NextResponse.json({ error: "会话不存在" }, { status: 404 });
  }
  await prisma.memoryItem.deleteMany({ where: { sourceSessionId: id } });
  await prisma.session.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
