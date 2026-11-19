import { z } from "zod";
import {
  buildMockSummary,
  extractMockMemories,
  type ChatTurn,
  type MockSummary,
} from "@/lib/ai/mock";
import {
  completeJSON,
  extractJSON,
  isMockMode,
  loadPrompt,
  type ChatMessage,
} from "@/lib/ai/model";
import type { MemoryOperation, MemoryView } from "@/lib/memory/service";

const summarySchema = z.object({
  presenting: z.string().min(1),
  patterns: z.string().min(1),
  strengths: z.string().min(1),
  goals: z.string().min(1),
  actionPlan: z.string().min(1),
});

const memoryOperationSchema = z.object({
  operation: z.enum(["add", "update", "archive", "none"]),
  targetId: z.string().optional(),
  category: z
    .enum([
      "goal",
      "value",
      "pattern",
      "relationship",
      "coping",
      "progress",
      "preference",
    ])
    .optional(),
  content: z.string().min(2).max(120).optional(),
  confidence: z.number().min(0).max(1).optional(),
  importance: z.number().int().min(1).max(5).optional(),
  sensitivity: z.enum(["normal", "sensitive"]).optional(),
  sourceType: z.enum(["explicit", "inferred", "summary"]).optional(),
  reason: z.string().max(200).optional(),
});

const memoryArraySchema = z.array(memoryOperationSchema);

function toTranscript(messages: ChatTurn[]): string {
  return messages
    .filter((m) => m.role !== "system")
    .slice(-40)
    .map((m) => `${m.role === "user" ? "用户" : "心屿"}：${m.content}`)
    .join("\n")
    .slice(-12000);
}

export async function generateSessionSummary(
  messages: ChatTurn[],
): Promise<MockSummary> {
  if (isMockMode()) {
    return buildMockSummary(messages);
  }

  const prompt = loadPrompt("summary");
  const request: ChatMessage[] = [
    { role: "system", content: prompt },
    {
      role: "user",
      content: `请为下面这段对话生成 JSON 总结：\n\n${toTranscript(messages)}`,
    },
  ];

  try {
    let raw = await completeJSON(request);
    let result = summarySchema.safeParse(extractJSON(raw));
    if (result.success) return result.data;

    // 模型偶尔会在 JSON 字符串里写未转义的英文双引号，导致整段无法解析。
    // 第二次要求它修正为合法 JSON，避免直接退化成模板总结。
    const retryRequest: ChatMessage[] = [
      ...request,
      { role: "assistant", content: raw.slice(0, 4000) },
      {
        role: "user",
        content:
          "你刚才的输出不是合法 JSON（常见原因是字符串内部使用了未转义的英文双引号）。请重新输出同一份总结，严格使用合法 JSON；字符串内引用请使用「」或单引号，不要输出任何解释。",
      },
    ];
    raw = await completeJSON(retryRequest);
    result = summarySchema.safeParse(extractJSON(raw));
    if (result.success) return result.data;
    console.error("generateSessionSummary JSON invalid after retry:", raw.slice(0, 800));
  } catch (error) {
    console.error("generateSessionSummary failed, falling back to mock:", error);
  }

  return buildMockSummary(messages);
}

export async function extractSessionMemories(
  messages: ChatTurn[],
  existingMemories: MemoryView[] = [],
): Promise<MemoryOperation[]> {
  const existingContents = existingMemories.map((item) => item.content);

  if (isMockMode()) {
    return extractMockMemories(messages, existingContents).map((item) => ({
      operation: "add" as const,
      category: item.category,
      content: item.content,
      confidence: item.confidence,
      importance: item.importance,
      sensitivity: "normal" as const,
      sourceType: "explicit" as const,
    }));
  }

  const prompt = loadPrompt("memory");
  const existingBlock =
    existingMemories.length > 0
      ? existingMemories
          .map(
            (item) => `[${item.id}] [${item.category}] ${item.content}`,
          )
          .join("\n")
      : "（暂无）";
  const request: ChatMessage[] = [
    { role: "system", content: prompt },
    {
      role: "user",
      content: `已有记忆：\n${existingBlock}\n\n对话记录：\n${toTranscript(messages)}`,
    },
  ];

  try {
    const raw = await completeJSON(request, { temperature: 0.2 });
    const parsed = extractJSON<unknown>(raw);
    const result = memoryArraySchema.safeParse(parsed);
    if (result.success) {
      // 规则提取只作为“明确目标/价值/模式”的兜底，且不重复模型已经给出的 add。
      const heuristicOps: MemoryOperation[] = extractMockMemories(
        messages,
        existingContents,
      )
        .filter((item) => item.confidence >= 0.7)
        .map((item) => ({
          operation: "add" as const,
          category: item.category,
          content: item.content,
          confidence: item.confidence,
          importance: item.importance,
          sensitivity: "normal" as const,
          sourceType: "explicit" as const,
        }));

      const merged: MemoryOperation[] = [...result.data];
      for (const item of heuristicOps) {
        const duplicated = merged.some(
          (existing) =>
            existing.operation === "add" &&
            existing.content &&
            item.content &&
            (existing.content.includes(item.content) ||
              item.content.includes(existing.content)),
        );
        if (!duplicated) merged.push(item);
      }
      return merged;
    }
  } catch (error) {
    console.error("extractSessionMemories failed, falling back to mock:", error);
  }

  return extractMockMemories(messages, existingContents).map((item) => ({
    operation: "add" as const,
    category: item.category,
    content: item.content,
    confidence: item.confidence,
    importance: item.importance,
    sensitivity: "normal" as const,
    sourceType: "explicit" as const,
  }));
}
