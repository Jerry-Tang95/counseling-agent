import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/anonymous";
import { listMemoryViews } from "@/lib/memory/service";
import { MemoryManager } from "@/components/memory/MemoryManager";

export const dynamic = "force-dynamic";

export default async function MemoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/start");

  const memories = await listMemoryViews(user.id);

  return (
    <MemoryManager
      initialEnabled={user.memoryEnabled}
      initialMemories={memories.map((memory) => ({
        id: memory.id,
        category: memory.category,
        content: memory.content,
        confidence: memory.confidence,
        importance: memory.importance,
        occurrences: memory.occurrences,
        sourceType: memory.sourceType,
        sourceSessionId: memory.sourceSessionId,
        status: memory.status,
        createdAt: memory.createdAt.toISOString(),
      }))}
    />
  );
}
