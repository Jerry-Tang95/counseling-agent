export interface UIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  memoryRefs?: string[];
  streaming?: boolean;
}
