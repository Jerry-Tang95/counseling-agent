import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { createUserWithCookie, getCurrentUser } from "@/lib/auth/anonymous";
import { CURRENT_CONSENT_VERSION } from "@/lib/consent";
import { consentSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = consentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "请确认你已年满 18 岁并同意相关条款。" },
      { status: 400 },
    );
  }

  const existing = await getCurrentUser();
  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          ageRange: parsed.data.ageRange,
          avatarId: parsed.data.avatarId,
          memoryEnabled: parsed.data.memoryEnabled,
          consentVersion: CURRENT_CONSENT_VERSION,
        },
      })
    : await createUserWithCookie({
        ageRange: parsed.data.ageRange,
        avatarId: parsed.data.avatarId,
        memoryEnabled: parsed.data.memoryEnabled,
      });

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      stage: "intake",
      status: "active",
      title: "新的对话",
    },
  });

  return NextResponse.json({ sessionId: session.id, userId: user.id });
}
