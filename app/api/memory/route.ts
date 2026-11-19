import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/anonymous";
import { listMemoryViews } from "@/lib/memory/service";
import { memorySettingsSchema } from "@/lib/validation/schemas";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const memories = await listMemoryViews(user.id);
  return NextResponse.json({
    memoryEnabled: user.memoryEnabled,
    memories,
  });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const json = await request.json().catch(() => null);
  const parsed = memorySettingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { memoryEnabled: parsed.data.memoryEnabled },
  });
  return NextResponse.json({ memoryEnabled: updated.memoryEnabled });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  await prisma.memoryItem.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}
