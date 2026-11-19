export interface MemoryForScoring {
  id: string;
  category: string;
  content: string;
  importance: number;
  createdAt: Date | string;
  lastUsedAt?: Date | string | null;
}

const CATEGORY_WEIGHT: Record<string, number> = {
  goal: 6,
  value: 5,
  pattern: 4,
  relationship: 3,
  coping: 3,
  progress: 4,
  preference: 2,
};

/** 提取中文双字片段 + 英文单词，用于轻量相关度匹配（无需 embedding）。 */
export function tokenize(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .replace(/[^\p{Script=Han}a-z0-9]+/gu, " ")
    .trim();
  const tokens = new Set<string>();
  for (const chunk of normalized.split(/\s+/)) {
    if (!chunk) continue;
    if (/^[a-z0-9]+$/.test(chunk)) {
      if (chunk.length >= 2) tokens.add(chunk);
      continue;
    }
    for (let i = 0; i < chunk.length - 1; i += 1) {
      tokens.add(chunk.slice(i, i + 2));
    }
    if (chunk.length <= 4) tokens.add(chunk);
  }
  return [...tokens];
}

function daysAgo(value: Date | string): number {
  const time = typeof value === "string" ? new Date(value).getTime() : value.getTime();
  return Math.max(0, (Date.now() - time) / 86400000);
}

export function scoreMemory(
  item: MemoryForScoring,
  query: string,
  now = new Date(),
): number {
  const queryTokens = new Set(tokenize(query));
  const contentTokens = tokenize(item.content);
  const overlap = contentTokens.filter((token) => queryTokens.has(token)).length;

  const importance = item.importance * 10;
  const category = CATEGORY_WEIGHT[item.category] ?? 1;
  const recency = Math.max(0, 10 - daysAgo(item.createdAt) / 30);
  const usage = item.lastUsedAt ? Math.max(0, 4 - daysAgo(item.lastUsedAt) / 14) : 0;
  const relevance = Math.min(30, overlap * 4);
  const dateBoost = now.getTime() > 0 ? 0 : 0; // 保留参数，便于测试稳定

  return importance + category + recency + usage + relevance + dateBoost;
}

export function pickRelevantMemories<T extends MemoryForScoring>(
  items: T[],
  query: string,
  limit = 10,
): T[] {
  return [...items]
    .map((item) => ({ item, score: scoreMemory(item, query) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}
