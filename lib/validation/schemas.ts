import { z } from "zod";

export const ageRangeSchema = z.enum([
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55+",
]);

export const consentSchema = z.object({
  ageRange: ageRangeSchema,
  avatarId: z.string().min(1).max(40).default("user-01"),
  memoryEnabled: z.boolean().default(false),
  agreed: z.literal(true),
});

export const chatMessageSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(4000),
});

export const memoryUpdateSchema = z.object({
  content: z.string().min(1).max(500).optional(),
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
  importance: z.number().int().min(1).max(5).optional(),
  status: z.enum(["active", "archived"]).optional(),
});

export const memorySettingsSchema = z.object({
  memoryEnabled: z.boolean(),
});

export const summaryRequestSchema = z.object({
  sessionId: z.string().min(1),
});

export const sessionTitleSchema = z.object({
  title: z.string().trim().min(1, "名称不能为空").max(40, "名称最多 40 个字"),
});

export const feedbackSchema = z.object({
  sessionId: z.string().min(1),
  helpful: z.number().int().min(1).max(5),
  safety: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export type ConsentInput = z.infer<typeof consentSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
