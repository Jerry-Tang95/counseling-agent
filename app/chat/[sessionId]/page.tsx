import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/anonymous";
import { prisma } from "@/lib/db/client";
import { safeDecrypt } from "@/lib/crypto/encrypt";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { UIMessage } from "@/components/chat/types";

export const dynamic = "force-dynamic";

export default async function ChatSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/start");
  const { sessionId } = await params;

  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId: user.id, status: { not: "deleted" } },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      summary: true,
    },
  });
  if (!session) notFound();

  const messages: UIMessage[] = session.messages.map((message) => ({
    id: message.id,
    role: message.role as UIMessage["role"],
    content: safeDecrypt(message.contentCipher),
    createdAt: message.createdAt.toISOString(),
    memoryRefs: message.memoryRefs
      ? (JSON.parse(message.memoryRefs) as string[])
      : [],
  }));

  return (
    <ChatWindow
      session={{
        id: session.id,
        title: session.title,
        stage: session.stage,
        status: session.status,
        riskLevel: session.riskLevel,
        startedAt: session.startedAt.toISOString(),
      }}
      initialMessages={messages}
      avatarId={user.avatarId}
      memoryEnabled={user.memoryEnabled}
      summaryId={session.summary?.id ?? null}
    />
  );
}
