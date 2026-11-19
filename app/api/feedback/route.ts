import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/anonymous";
import { feedbackSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = feedbackSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "反馈格式不正确" }, { status: 400 });
  }

  const session = await prisma.session.findFirst({
    where: { id: parsed.data.sessionId, userId: user.id },
  });
  if (!session) {
    return NextResponse.json({ error: "会话不存在" }, { status: 404 });
  }

  const feedback = await prisma.feedback.create({
    data: {
      sessionId: session.id,
      helpful: parsed.data.helpful,
      safety: parsed.data.safety,
      comment: parsed.data.comment?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true, id: feedback.id });
}
