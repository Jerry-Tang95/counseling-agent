import { prisma } from "@/lib/db/client";
import { encrypt, safeDecrypt } from "@/lib/crypto/encrypt";
import { pickRelevantMemories } from "@/lib/memory/score";

export interface MemoryView {
  id: string;
  category: string;
  content: string;
  confidence: number;
  importance: number;
  sensitivity: string;
  sourceType: string;
  occurrences: number;
  sourceSessionId: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  goal: "目标",
  value: "价值观",
  pattern: "模式",
  relationship: "重要关系",
  coping: "有效应对",
  progress: "进展",
  preference: "对话偏好",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? "记忆";
}

function isExpired(item: MemoryView): boolean {
  return Boolean(item.expiresAt && item.expiresAt.getTime() <= Date.now());
}

export async function listMemoryViews(userId: string): Promise<MemoryView[]> {
  const items = await prisma.memoryItem.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { importance: "desc" }, { updatedAt: "desc" }],
  });
  return items.map((item) => ({
    id: item.id,
    category: item.category,
    content: safeDecrypt(item.contentCipher),
    confidence: item.confidence,
    importance: item.importance,
    sensitivity: item.sensitivity,
    sourceType: item.sourceType,
    occurrences: item.occurrences,
    sourceSessionId: item.sourceSessionId,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    lastUsedAt: item.lastUsedAt,
    expiresAt: item.expiresAt,
  }));
}

export async function getActiveMemoryViews(userId: string): Promise<MemoryView[]> {
  const all = await listMemoryViews(userId);
  return all.filter((item) => item.status === "active" && !isExpired(item));
}

export function formatMemoryLines(items: MemoryView[]): string[] {
  return items.map((item) => `[${categoryLabel(item.category)}] ${item.content}`);
}

export function selectRelevantMemories(
  items: MemoryView[],
  query: string,
  limit = 10,
): MemoryView[] {
  return pickRelevantMemories(
    items.map((item) => ({
      ...item,
      lastUsedAt: item.lastUsedAt,
    })),
    query,
    limit,
  );
}

export interface MemoryCandidate {
  category: string;
  content: string;
  confidence: number;
  importance: number;
  sensitivity?: string;
  sourceType?: string;
}

export interface MemoryOperation {
  operation: "add" | "update" | "archive" | "none";
  targetId?: string;
  category?: string;
  content?: string;
  confidence?: number;
  importance?: number;
  sensitivity?: "normal" | "sensitive";
  sourceType?: "explicit" | "inferred" | "summary";
  reason?: string;
}

function canonicalMemory(content: string): string {
  return content
    .replace(/^用户[：:，,\s]*/u, "")
    .replace(/^(我想|我希望|希望能|想要|想|能|可以|愿意)/u, "")
    .replace(/\s+/g, "")
    .replace(/[。！？；，,]/g, "")
    .trim();
}

function normalizeMemoryContent(content: string): string {
  return content
    .replace(/^用户[：:，,\s]*/u, "")
    .replace(/\s+/g, " ")
    .replace(/[。！？；，,]+$/g, "")
    .trim();
}

function viewFromItem(item: {
  id: string;
  category: string;
  contentCipher: string;
  confidence: number;
  importance: number;
  sensitivity: string;
  sourceType: string;
  occurrences: number;
  sourceSessionId: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
}): MemoryView {
  return {
    id: item.id,
    category: item.category,
    content: safeDecrypt(item.contentCipher),
    confidence: item.confidence,
    importance: item.importance,
    sensitivity: item.sensitivity,
    sourceType: item.sourceType,
    occurrences: item.occurrences,
    sourceSessionId: item.sourceSessionId,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    lastUsedAt: item.lastUsedAt,
    expiresAt: item.expiresAt,
  };
}

/**
 * 记忆写入策略（参考 ChatGPT / Claude / Mem0 的“提取—合并—更新—遗忘”流程）：
 * - 只自动保存稳定的自述、目标、价值观、偏好、反复模式；
 * - 敏感信息不自动保存；
 * - 相似记忆合并，冲突记忆通过 update/archive 处理，不重复堆叠；
 * - 推断性记忆 90 天后自然过期，明确自述长期保留。
 */
export async function saveMemoryOperations(
  userId: string,
  sessionId: string,
  operations: MemoryOperation[],
): Promise<MemoryView[]> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.memoryEnabled) return [];

  const existingItems = await prisma.memoryItem.findMany({ where: { userId } });
  const existing = existingItems.map((item) => ({
    item,
    content: safeDecrypt(item.contentCipher),
    key: canonicalMemory(safeDecrypt(item.contentCipher)),
  }));

  const saved: MemoryView[] = [];

  for (const operation of operations) {
    if (!operation || operation.operation === "none") continue;

    if (operation.operation === "archive") {
      const target = existing.find((entry) => entry.item.id === operation.targetId);
      if (target) {
        await prisma.memoryItem.update({
          where: { id: target.item.id },
          data: {
            status: "archived",
            archivedReason: operation.reason || "被用户或新信息取代",
            updatedAt: new Date(),
          },
        });
      }
      continue;
    }

    if (operation.operation === "update") {
      const target = existing.find((entry) => entry.item.id === operation.targetId);
      if (!target || !operation.content) continue;
      const content = normalizeMemoryContent(operation.content);
      if (content.length < 3 || content.length > 120) continue;
      if (operation.sensitivity === "sensitive") continue;

      const updated = await prisma.memoryItem.update({
        where: { id: target.item.id },
        data: {
          category: CATEGORY_LABELS[operation.category || ""]
            ? operation.category
            : target.item.category,
          contentCipher: encrypt(content),
          confidence: Math.max(operation.confidence ?? 0.8, 0.75),
          importance: Math.max(operation.importance ?? target.item.importance, 1),
          sensitivity: operation.sensitivity || "normal",
          occurrences: target.item.occurrences + 1,
          lastConfirmedAt: new Date(),
          status: "active",
          updatedAt: new Date(),
        },
      });
      target.content = content;
      target.key = canonicalMemory(content);
      saved.push(viewFromItem(updated));
      continue;
    }

    // add
    if (!operation.content || !operation.category) continue;
    if (!CATEGORY_LABELS[operation.category]) continue;
    if (operation.sensitivity === "sensitive") continue;
    const content = normalizeMemoryContent(operation.content);
    if (content.length < 3 || content.length > 120) continue;
    if ((operation.confidence ?? 0.8) < 0.75) continue;

    const key = canonicalMemory(content);
    const duplicate = existing.find(
      (entry) =>
        entry.item.category === operation.category &&
        (entry.key === key ||
          entry.key.includes(key) ||
          key.includes(entry.key)),
    );

    if (duplicate) {
      const updated = await prisma.memoryItem.update({
        where: { id: duplicate.item.id },
        data: {
          confidence: Math.max(operation.confidence ?? 0.8, 0.75),
          importance: Math.max(operation.importance ?? 1, 1),
          occurrences: duplicate.item.occurrences + 1,
          lastConfirmedAt: new Date(),
          status: "active",
          updatedAt: new Date(),
        },
      });
      saved.push(viewFromItem(updated));
      continue;
    }

    const sourceType = operation.sourceType || "explicit";
    const expiresAt =
      sourceType === "inferred"
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        : null;
    const created = await prisma.memoryItem.create({
      data: {
        userId,
        category: operation.category,
        contentCipher: encrypt(content),
        confidence: operation.confidence ?? 0.8,
        importance: operation.importance ?? 3,
        sensitivity: operation.sensitivity || "normal",
        sourceType,
        occurrences: 1,
        lastConfirmedAt: new Date(),
        expiresAt,
        sourceSessionId: sessionId,
        status: "active",
      },
    });
    existing.push({
      item: created,
      content,
      key,
    });
    saved.push(viewFromItem(created));
  }

  return saved;
}

/** 兼容旧调用：把普通候选记忆视为 add 操作。 */
export async function saveMemoryCandidates(
  userId: string,
  sessionId: string,
  candidates: MemoryCandidate[],
): Promise<MemoryView[]> {
  return saveMemoryOperations(
    userId,
    sessionId,
    candidates.map((candidate) => ({
      operation: "add",
      category: candidate.category,
      content: candidate.content,
      confidence: candidate.confidence,
      importance: candidate.importance,
      sensitivity: candidate.sensitivity === "sensitive" ? "sensitive" : "normal",
      sourceType: candidate.sourceType === "inferred" ? "inferred" : "explicit",
    })),
  );
}

export async function touchMemories(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await prisma.memoryItem.updateMany({
    where: { id: { in: ids } },
    data: { lastUsedAt: new Date() },
  });
}
