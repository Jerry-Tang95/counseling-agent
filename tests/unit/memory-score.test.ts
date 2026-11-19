import { describe, expect, it } from "vitest";
import { pickRelevantMemories, scoreMemory } from "@/lib/memory/score";

const base = new Date("2026-11-17T00:00:00Z");

function item(
  id: string,
  category: string,
  content: string,
  importance: number,
  createdAt = base,
) {
  return {
    id,
    category,
    content,
    importance,
    createdAt,
    lastUsedAt: null,
  };
}

describe("memory scoring", () => {
  it("prefers goals over low-importance preferences", () => {
    const goal = item("1", "goal", "想在会议上表达不同意见", 5);
    const preference = item("2", "preference", "喜欢直接一点的反馈", 1);
    expect(scoreMemory(goal, "明天要开会，我该怎么表达意见")).toBeGreaterThan(
      scoreMemory(preference, "明天要开会，我该怎么表达意见"),
    );
  });

  it("ranks query-relevant memories higher", () => {
    const relevant = item("1", "pattern", "被同事否定时会自责", 4);
    const irrelevant = item("2", "coping", "散步能让我冷静", 4);
    expect(scoreMemory(relevant, "同事又否定我了")).toBeGreaterThan(
      scoreMemory(irrelevant, "同事又否定我了"),
    );
  });

  it("returns at most the requested number of memories", () => {
    const items = Array.from({ length: 20 }, (_, i) =>
      item(String(i), "goal", `目标 ${i}`, 3),
    );
    expect(pickRelevantMemories(items, "目标", 6)).toHaveLength(6);
  });
});
