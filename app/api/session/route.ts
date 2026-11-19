import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/anonymous";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先完成知情同意。" }, { status: 401 });
  }

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      stage: "intake",
      status: "active",
      title: "新的对话",
    },
  });

  return NextResponse.json({ sessionId: session.id });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  return NextResponse.json({
    sessions: user.sessions.map((session) => ({
      id: session.id,
      title: session.title,
      status: session.status,
      stage: session.stage,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
    })),
  });
}
