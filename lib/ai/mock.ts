export interface ChatTurn {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface MockMemory {
  id?: string;
  category: string;
  content: string;
}

export interface MockReplyInput {
  messages: ChatTurn[];
  memories?: MockMemory[];
  stage?: string;
}

const THEMES: Array<{ keys: string[]; label: string }> = [
  { keys: ["同事", "领导", "加班", "工作", "裁员", "晋升", "职场", "项目"], label: "工作" },
  { keys: ["男朋友", "女朋友", "老公", "老婆", "伴侣", "分手", "暗恋", "相亲", "婚姻", "出轨", "异地"], label: "关系" },
  { keys: ["父母", "妈妈", "爸爸", "婆婆", "家里", "原生家庭", "重男轻女"], label: "家庭" },
  { keys: ["自卑", "不够好", "完美", "拖延", "讨好", "边界", "价值", "配不上"], label: "自我价值" },
  { keys: ["去世", "离开", "丧失", "生病", "事故", "化疗"], label: "丧失" },
  { keys: ["焦虑", "睡不着", "紧张", "害怕", "担心", "心慌"], label: "焦虑" },
];

function detectTheme(text: string): string {
  for (const theme of THEMES) {
    if (theme.keys.some((key) => text.includes(key))) return theme.label;
  }
  return "这件事";
}

function lastUserText(messages: ChatTurn[]): string {
  return [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
}

function userTurns(messages: ChatTurn[]): number {
  return messages.filter((m) => m.role === "user").length;
}

function shortSnippet(text: string, max = 28): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length > max ? `${cleaned.slice(0, max)}…` : cleaned;
}

function stripEnd(text: string): string {
  return text.replace(/[。！？；，、\s]+$/u, "");
}

function findMemory(memories: MockMemory[] | undefined, categories: string[]) {
  return memories?.find((m) => categories.includes(m.category));
}

/**
 * Mock 模式下的 CounselorAgent：不调用任何外部 API，也能让完整流程可体验。
 * 它不是“假扮智能”，而是为了让 UI、状态机、安全与记忆流程能被测试和演示；
 * 接入真实模型后，这个文件只在无 Key 的开发/演示环境使用。
 */
export function generateMockReply(input: MockReplyInput): string {
  const text = lastUserText(input.messages);
  const turns = userTurns(input.messages);
  const theme = detectTheme(text);
  const memoryGoal = findMemory(input.memories, ["goal"]);
  const memoryPattern = findMemory(input.memories, ["pattern"]);

  // 身份 / 边界问题
  if (/你是(不是)?(ai|人工智能|机器人|真人|人)|你是医生吗|你有证吗/.test(text)) {
    return "我是 AI 对话助手，不是真人，也不是心理医生，没有执业资质。我能做的是陪你把问题理清楚、帮你找到下一步；如果你需要诊断、治疗或开药，我会建议你找专业的医生或咨询师。";
  }

  if (/喜欢你|爱你|做我(男朋友|女朋友)|抱抱我|和我在一起/.test(text)) {
    return "谢谢你愿意把这份心意告诉我，我会认真接住它。但我需要诚实地说：我是 AI，不是真人，不能和你发展恋爱关系，也不想让你把真实的情感只寄托在这里。你值得在现实里被真实的人回应。我们可以继续聊：在这里被理解的感觉，对你来说意味着什么？";
  }

  // 记忆相关
  if (/记得|上次|之前|继续|还记得/.test(text) && (memoryGoal || memoryPattern)) {
    const chosen = memoryGoal || memoryPattern;
    return `我记得你之前提到过：「${chosen?.content}」。如果这个方向还准确，我们可以接着看——这一次，你希望从哪里继续？如果我有记错的地方，你也可以直接纠正我。`;
  }

  // 第一次回复：先共情 + 问一个开放问题
  if (turns <= 1) {
    if (memoryGoal && input.memories && input.memories.length > 0) {
      return `我听到了，${theme}这件事让你心里一直放着。先不急着解决它。我想先陪你把这一刻看清楚：今天最让你难受的，是发生了什么，还是你对自己的某个评价？`;
    }
    return `我听到了，${theme}这件事让你心里一直悬着。先不急着把它解决掉，我想先陪你把这一刻看清楚：这件事最让你难受的，是发生了什么，还是你对自己的某个评价？`;
  }

  // 后续轮次：按探索→重构→行动的节奏
  if (turns === 2) {
    return `谢谢你愿意说得更具体。我听到的是：当你说到「${shortSnippet(text)}」的时候，你好像既委屈又有点责怪自己。如果这个反应会说话，它可能想帮你避免什么？`;
  }

  if (turns === 3) {
    return "这里也许可以慢一点看：在这件事里，哪些是你能负责、能改变的部分，哪些其实是别人的课题？如果只把属于你的那一小块拿回来，你会想先动哪一块？";
  }

  if (turns === 4) {
    return "我注意到你已经在做一件事：你愿意把不舒服说出来，而不是继续压着。这本身就是一种勇气。你身边有没有一个人，是你可以稍微求助一点的？不用很亲密，能听你说十分钟就好。";
  }

  if (turns === 5) {
    return `我们试着把今天聊的收成一个很小的实验：这周选一个具体场景，先做一件 5 分钟的小事，比如在下次感到不舒服时，先停三秒，写下你当时对自己的第一句话。如果做不到，也不用把它当失败，只记录当时发生了什么。你觉得哪一天比较可能？`;
  }

  return "我们不需要一次把所有问题都解决。今天你已经看见了一个模式，也愿意为它做一点小尝试，这已经是在往前走了。下一次我们可以看看：这个小实验告诉了你什么，以及它有没有让你对自己多一点点理解。";
}

export interface MockSummary {
  presenting: string;
  patterns: string;
  strengths: string;
  goals: string;
  actionPlan: string;
}

export function buildMockSummary(messages: ChatTurn[]): MockSummary {
  const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content);
  const first = userMessages[0] ?? "用户来聊了一件让自己困扰的事";
  const all = userMessages.join("；");
  const theme = detectTheme(all);

  const goalMatch = all.match(/(?:我想|我希望|想要|目标是)([^。！？；，,]{2,50})/);
  const patternMatch = all.match(/(?:每次|总是|一[^。！？]{0,8}就)([^。！？；]{4,40})/);

  let patterns = "这次还没有形成非常清晰的模式，但你已经开始注意到自己在压力下的反应。";
  let actionPlan =
    "本周选一个具体场景，做一次 5 分钟的小实验：先停三秒，写下当时对自己的第一句话，然后问自己“这句话是在保护我什么”。如果做不到，只记录当时发生了什么，不评判。";

  if (/讨好|拒绝|加班|同事|领导/.test(all)) {
    patterns =
      "你似乎倾向于先照顾别人的需要，把“不够好”的评价留给自己；一想到拒绝，就会担心关系变差或被认为不好相处。";
    actionPlan =
      "本周选一次不合理请求，先回复“我需要看一下手头安排，稍后回复你”，给自己 10 分钟再决定。若最后还是答应，记录当时最担心发生什么；如果拒绝成功，也记录对方的真实反应。";
  } else if (/分手|男朋友|女朋友|伴侣|喜欢你|不爱/.test(all)) {
    patterns =
      "分手后，你容易把自我价值放在“对方是否喜欢我”上，反复回想自己是不是不够好、太敏感。";
    actionPlan =
      "本周选一个固定时段（如睡前 10 分钟）写下对他的想念和对自己说的话，然后做一件照顾自己的小事。如果做不到，只记录当时的情绪，不评判自己。";
  } else if (/妈妈|爸爸|父母|婆婆|家里|孝顺/.test(all)) {
    patterns =
      "你在独立和“孝顺”之间拉扯，容易把母亲/家人的情绪当成自己的责任，很难分清哪些是自己的课题。";
    actionPlan =
      "本周选一件小事（如穿衣、周末安排）练习说“这件事我想自己决定”，说完后记录对方反应和自己的感受；不急着解决对方的情绪，只观察课题边界。";
  } else if (patternMatch) {
    patterns = `你似乎会在某些时刻反复出现一个反应：${shortSnippet(patternMatch[0], 50)}。它可能在保护你，也可能让你离自己想要的关系更远。`;
  }

  return {
    presenting: `你带来的是关于${theme}的困扰：${shortSnippet(stripEnd(first), 60)}。`,
    patterns,
    strengths:
      "你愿意主动来谈这件事，而不是继续一个人扛着；你也愿意把不舒服说具体。这些本身就是资源。",
    goals: goalMatch
      ? `你希望：${shortSnippet(goalMatch[1], 50)}。`
      : "你希望对自己和这段困扰多一层理解，并找到一个能开始的小方向。",
    actionPlan,
  };
}

export interface ExtractedMemory {
  category: string;
  content: string;
  confidence: number;
  importance: number;
}

const MEMORY_PATTERNS: Array<{
  category: string;
  regex: RegExp;
  importance: number;
}> = [
  { category: "goal", regex: /(?:我想|我希望|想要|目标是)([^。！？；，,]{2,48})/, importance: 5 },
  { category: "value", regex: /(?:我看重|我在意|最重要的是|对我来说最重要)([^。！？；，,]{2,48})/, importance: 4 },
  { category: "pattern", regex: /(?:每次|总是|总觉得|老是|经常)[^。！？；，,]{2,42}/, importance: 4 },
  { category: "relationship", regex: /(?:和|跟)(?:同事|领导|父母|妈妈|爸爸|伴侣|男朋友|女朋友|老公|老婆)[^。！？；，,]{0,32}/, importance: 3 },
  { category: "coping", regex: /(?:散步|写日记|听音乐|深呼吸|运动|跑步|冥想|找朋友聊)[^。！？；，,]{0,24}/, importance: 3 },
  { category: "progress", regex: /(?:我做到了|我第一次|上周我|昨天我)[^。！？；，,]{2,48}/, importance: 4 },
];

export function extractMockMemories(
  messages: ChatTurn[],
  existing: string[] = [],
): ExtractedMemory[] {
  const userTexts = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const results: ExtractedMemory[] = [];
  const seen = new Set(existing);

  for (const text of userTexts) {
    for (const item of MEMORY_PATTERNS) {
      const matches = text.matchAll(new RegExp(item.regex.source, "g"));
      for (const match of matches) {
        let content = (match[1] || match[0]).trim();
        if (item.category === "pattern" && content.startsWith("总是")) {
          content = content.replace(/^总是/, "容易");
        }
        if (content.length < 3 || content.length > 60) continue;
        if (seen.has(content)) continue;
        seen.add(content);
        results.push({
          category: item.category,
          content,
          confidence: 0.82,
          importance: item.importance,
        });
        if (results.length >= 6) return results;
      }
    }
  }

  // 没有显式句式时，从第一句提取一个低置信度的主诉，作为总结素材但不自动保存
  if (results.length === 0) {
    const first = messages.find((m) => m.role === "user")?.content;
    if (first && first.length >= 8) {
      results.push({
        category: "pattern",
        content: `近来被「${shortSnippet(first, 32)}」困扰`,
        confidence: 0.62,
        importance: 2,
      });
    }
  }

  return results;
}
