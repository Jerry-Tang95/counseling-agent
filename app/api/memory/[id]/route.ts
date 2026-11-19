import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/anonymous";
import { encrypt, safeDecrypt } from "@/lib/crypto/encrypt";
import { memoryUpdateSchema } from "@/lib/validation/schemas";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const item = await prisma.memoryItem.findFirst({
    where: { id, userId: user.id },
  });
  if (!item) {
    return NextResponse.json({ error: "记忆不存在" }, { status: 404 });
  }

  const json = await request.json().catch(() => null);
  const parsed = memoryUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const data: {
    contentCipher?: string;
    category?: string;
    importance?: number;
    status?: string;
    updatedAt: Date;
  } = { updatedAt: new Date() };
  if (parsed.data.content) data.contentCipher = encrypt(parsed.data.content);
  if (parsed.data.category) data.category = parsed.data.category;
  if (parsed.data.importance) data.importance = parsed.data.importance;
  if (parsed.data.status) data.status = parsed.data.status;

  const updated = await prisma.memoryItem.update({ where: { id }, data });
  return NextResponse.json({
    memory: {
      id: updated.id,
      category: updated.category,
      content: safeDecrypt(updated.contentCipher),
      confidence: updated.confidence,
      importance: updated.importance,
      status: updated.status,
    },
  });
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
  const item = await prisma.memoryItem.findFirst({
    where: { id, userId: user.id },
  });
  if (!item) {
    return NextResponse.json({ error: "记忆不存在" }, { status: 404 });
  }
  await prisma.memoryItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
