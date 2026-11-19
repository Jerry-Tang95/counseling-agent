import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/anonymous";
import { encrypt, safeDecrypt } from "@/lib/crypto/encrypt";
import { assessRisk, isCrisis } from "@/lib/safety/risk-rules";
import {
  buildCrisisMessage,
  buildMedicalReferralMessage,
  buildMinorBlockMessage,
  buildPassiveSafetyMessage,
  CRISIS_RESOURCES,
} from "@/lib/safety/crisis-resources";
import {
  getActiveMemoryViews,
  formatMemoryLines,
  selectRelevantMemories,
  touchMemories,
  listMemoryViews,
  saveMemoryOperations,
} from "@/lib/memory/service";
import { chatMessageSchema } from "@/lib/validation/schemas";
import { generateMockReply, type ChatTurn } from "@/lib/ai/mock";
import { extractSessionMemories } from "@/lib/ai/agents";
import {
  buildCounselorMessages,
  isMockMode,
  streamChatCompletion,
  type ChatMessage,
} from "@/lib/ai/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function nextStage(current: string, userTurns: number): string {
  if (current === "intake" && userTurns >= 2) return "explore";
  if (current === "explore" && userTurns >= 6) return "reframe";
  if (current === "reframe" && userTurns >= 8) return "action";
  if (current === "action") return "action";
  return current;
}

function buildConversationRecap(history: ChatTurn[]): string {
  const users = history
    .filter((item) => item.role === "user")
    .map((item) => item.content.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (users.length < 2) return "";

  const previousUsers = users.slice(0, -1).slice(-4);
  const previousAssistants = history
    .filter((item) => item.role === "assistant")
    .map((item) => item.content.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(-2);

  return [
    `用户前面说过：${previousUsers.join("；")}`,
    previousAssistants.length > 0
      ? `你之前的回应重点：${previousAssistants.map((item) => item.slice(0, 90)).join(" / ")}`
      : "",
    `用户最新一句：${users[users.length - 1]}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildSafetySupportMessage(type: string): string {
  if (type === "abuse") {
    return [
      "谢谢你愿意把这件事说出来。先告诉你一件事：**这不是你的错**。",
      "",
      "我想先关心你现在的安全：你现在安全吗？身边有没有可以信任的人？如果正处于危险中，请先拨打 **110**；如果身体受伤，请拨打 **120**。",
      "如果需要，我也可以陪你一起整理接下来可以联系谁、怎么开口。",
    ].join("\n");
  }
  if (type === "psychosis") {
    return [
      "听起来你现在很害怕，这些体验一定让你很难受。我不会跟你争辩它们是不是真的，也不会给你贴标签。",
      "",
      "但这类体验需要专业医生当面评估。建议你尽快到精神科或心理科就诊；如果现在觉得不安全，请拨打 **120** 或 **110**，并让身边的人陪着你。",
    ].join("\n");
  }
  return "谢谢你愿意说出来。我想先确认你现在的安全：你现在有伤害自己的打算吗？如果有，请先拨打 110/120，或联系一个你信任的人。";
}

async function extractMemoryInBackground(
  userId: string,
  sessionId: string,
  messages: ChatTurn[],
) {
  try {
    const existing = (await listMemoryViews(userId)).filter(
      (item) => item.status === "active",
    );
    const operations = await extractSessionMemories(messages, existing);
    if (operations.length > 0) {
      await saveMemoryOperations(userId, sessionId, operations);
    }
  } catch (error) {
    console.error("background memory extraction failed:", error);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先完成知情同意。" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = chatMessageSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "消息格式不正确，请控制在 4000 字以内。" },
      { status: 400 },
    );
  }

  const { sessionId, message } = parsed.data;
  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId: user.id, status: { not: "deleted" } },
  });
  if (!session) {
    return NextResponse.json({ error: "会话不存在或无权访问。" }, { status: 404 });
  }

  const assessment = assessRisk(message);
  const memoryIntent = /记住|帮我记住|记一下|别忘|不要忘记/.test(message);

  await prisma.message.create({
    data: {
      sessionId,
      role: "user",
      contentCipher: encrypt(message),
      safetyFlags: JSON.stringify({
        level: assessment.level,
        type: assessment.type,
        action: assessment.action,
      }),
    },
  });

  if (assessment.level >= 1) {
    await prisma.riskEvent.create({
      data: {
        sessionId,
        level: assessment.level,
        type: assessment.type,
        actionTaken: assessment.action,
      },
    });
  }

  if (assessment.level >= 2 || assessment.action === "block_minor") {
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        riskLevel: assessment.level,
        stage: assessment.level >= 2 ? "crisis" : session.stage,
        status: assessment.level >= 2 ? "crisis" : session.status,
      },
    });
  }

  const dbHistory = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    take: 60,
  });

  const history: ChatTurn[] = dbHistory.map((item) => ({
    role: item.role as ChatTurn["role"],
    content: safeDecrypt(item.contentCipher),
  }));
  const userTurns = history.filter((item) => item.role === "user").length;

  const memories =
    user.memoryEnabled && assessment.level < 2
      ? selectRelevantMemories(
          await getActiveMemoryViews(user.id),
          message,
          10,
        )
      : [];
  const memoryIds = memories.map((item) => item.id);

  const assistantId = randomUUID();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(sse(event, data)));
        } catch {
          // 客户端可能已经断开，静默忽略后续事件
        }
      };

      let fullText = "";

      try {
        send("meta", {
          messageId: assistantId,
          riskLevel: assessment.level,
          riskType: assessment.type,
          memoryRefs: memoryIds,
        });

        if (isCrisis(assessment)) {
          fullText = buildCrisisMessage(assessment.level);
          send("crisis", {
            level: assessment.level,
            type: assessment.type,
            resources: CRISIS_RESOURCES,
          });
          for (const chunk of fullText.split(/(?<=[。！？\n])/)) {
            if (chunk) send("delta", { text: chunk });
          }
        } else if (assessment.level === 1 && assessment.type === "suicide") {
          fullText = buildPassiveSafetyMessage();
          for (const chunk of fullText.split(/(?<=[。！？\n])/)) {
            if (chunk) send("delta", { text: chunk });
          }
        } else if (assessment.action === "block_minor") {
          fullText = buildMinorBlockMessage();
          send("block", { reason: "minor", resources: CRISIS_RESOURCES });
          for (const chunk of fullText.split(/(?<=[。！？\n])/)) {
            if (chunk) send("delta", { text: chunk });
          }
        } else if (assessment.action === "refer_medical") {
          fullText =
            assessment.type === "medical"
              ? buildMedicalReferralMessage()
              : buildSafetySupportMessage(assessment.type);
          for (const chunk of fullText.split(/(?<=[。！？\n])/)) {
            if (chunk) send("delta", { text: chunk });
          }
        } else if (assessment.type === "abuse" || assessment.type === "psychosis") {
          fullText = buildSafetySupportMessage(assessment.type);
          for (const chunk of fullText.split(/(?<=[。！？\n])/)) {
            if (chunk) send("delta", { text: chunk });
          }
        } else {
          const recentAssistantReplies = history
            .filter((item) => item.role === "assistant")
            .slice(-3);
          const recentQuestionCount = recentAssistantReplies.reduce(
            (sum, item) => sum + (item.content.match(/？/g)?.length ?? 0),
            0,
          );
          const asksForAdvice =
            /怎么办|咋办|应该|可以怎么|怎么才能|如何|建议|方法|释放|缓解|我想让|我希望|想要|希望能|能不能|可不可以|有什么办法/.test(message);

          const styleDirective = asksForAdvice
            ? "用户提出了具体改变目标或求助：先给 1–2 个具体、可执行的方案（结合用户刚才的场景和限制），再给一个更轻的备选；不要只复述共情，不要用“你觉得可行吗”把问题抛回去；最多一个必要的问题。"
            : recentQuestionCount > 0
              ? "上一轮已经问过你问题：这一轮优先用陈述句承接，不要连续追问；结尾给一个具体邀请或选项，让用户知道可以怎么接。"
              : "保持对话推进：先接住/回应，再给一个用户容易接的出口（一个具体邀请、两个选项，或一个真问题）。";

          const context = {
            memoryLines: formatMemoryLines(memories),
            rollingSummary: session.rollingSummary
              ? safeDecrypt(session.rollingSummary)
              : null,
            conversationRecap: buildConversationRecap(history),
            riskDirective: assessment.directive,
            styleDirective,
          };

          let questionCount = 0;
          const sanitizeQuestions = (text: string) =>
            text.replace(/？/g, () => {
              questionCount += 1;
              return questionCount === 1 ? "？" : "。";
            });

          if (isMockMode()) {
            fullText = sanitizeQuestions(
              generateMockReply({ messages: history, memories, stage: session.stage }),
            );
            const chunks = Array.from(fullText);
            for (let i = 0; i < chunks.length; i += 2) {
              send("delta", { text: chunks.slice(i, i + 2).join("") });
              if (i % 8 === 0) {
                await new Promise((resolve) => setTimeout(resolve, 18));
              }
            }
          } else {
            const messagesForModel: ChatMessage[] = history
              .filter((item) => item.role !== "system")
              .map((item) => ({
                role: item.role as "user" | "assistant",
                content: item.content,
              }));
            try {
              for await (const delta of streamChatCompletion(
                buildCounselorMessages(messagesForModel, context),
                { temperature: 0.8 },
              )) {
                const safeDelta = sanitizeQuestions(delta);
                fullText += safeDelta;
                send("delta", { text: safeDelta });
              }
            } catch (error) {
              console.error("counselor stream failed, fallback to mock:", error);
              fullText = sanitizeQuestions(
                generateMockReply({ messages: history, memories, stage: session.stage }),
              );
              for (const chunk of fullText.split(/(?<=[。！？\n])/)) {
                if (chunk) send("delta", { text: chunk });
              }
            }
          }
        }

        const newStage = nextStage(session.stage, userTurns);
        await prisma.message.create({
          data: {
            id: assistantId,
            sessionId,
            role: "assistant",
            contentCipher: encrypt(fullText),
            memoryRefs: JSON.stringify(memoryIds),
            safetyFlags: JSON.stringify({
              level: assessment.level,
              type: assessment.type,
              action: assessment.action,
            }),
          },
        });
        await prisma.session.update({
          where: { id: sessionId },
          data: {
            stage: newStage,
            riskLevel: Math.max(session.riskLevel, assessment.level),
            title:
              session.title && session.title !== "新的对话"
                ? session.title
                : message.slice(0, 24),
          },
        });
        if (memoryIds.length > 0) {
          await touchMemories(memoryIds);
        }

        // 每 6 个用户回合做一次增量记忆整理；用户明确说“记住”时立即整理。
        // 不再每一小段情绪都自动写记忆，避免把临时状态当成长期事实。
        if (
          user.memoryEnabled &&
          assessment.level === 0 &&
          (memoryIntent ||
            (userTurns > 0 && userTurns % 6 === 0))
        ) {
          void extractMemoryInBackground(user.id, sessionId, [
            ...history,
            { role: "assistant", content: fullText },
          ]);
        }

        send("state", {
          stage: newStage,
          riskLevel: Math.max(session.riskLevel, assessment.level),
        });
        send("done", { messageId: assistantId });
      } catch (error) {
        console.error("chat stream error:", error);
        send("error", {
          message: "回复生成中断了。你可以稍后重试，或先深呼吸一下。",
        });
      } finally {
        try {
          controller.close();
        } catch {
          // 客户端已经断开时 controller 可能已关闭
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
