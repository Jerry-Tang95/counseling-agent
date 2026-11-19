export type RiskLevel = 0 | 1 | 2 | 3;

export type RiskType =
  | "none"
  | "self_harm"
  | "suicide"
  | "violence"
  | "abuse"
  | "psychosis"
  | "minor"
  | "medical"
  | "other";

export type RiskAction =
  | "continue"
  | "safety_plan"
  | "crisis_intervention"
  | "block_minor"
  | "refer_medical";

export interface RiskAssessment {
  level: RiskLevel;
  type: RiskType;
  evidence: string[];
  action: RiskAction;
  /** 给 counselor 的安全指令，L1 时使用 */
  directive?: string;
}

interface Rule {
  level: RiskLevel;
  type: RiskType;
  patterns: RegExp[];
  action: RiskAction;
  directive?: string;
}

function normalize(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[，。！？、；：""''（）()【】\[\]…—\-]/g, "");
}

function collectEvidence(text: string, patterns: RegExp[]): string[] {
  const evidence: string[] = [];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[0]) evidence.push(match[0]);
  }
  return Array.from(new Set(evidence)).slice(0, 4);
}

/**
 * 规则引擎位于 LLM 之前，保证明确的高风险表达不依赖模型“自觉”。
 * 规则宁可略微保守，也不漏掉明确的自杀/自伤/伤人表达。
 */
const RULES: Rule[] = [
  // ---------- L3：正在发生的紧急危险 ----------
  {
    level: 3,
    type: "suicide",
    action: "crisis_intervention",
    patterns: [
      /正在(割腕|跳楼|上吊|自残|自杀|吃药|喝农药|伤害自己)/,
      /已经(割腕|跳楼|上吊|吃了.{0,8}药|喝了.{0,8}药|伤害自己)/,
      /现在(就)?(去)?(死|自杀|跳下去|割腕|上吊)/,
      /马上(就)?(去)?(死|自杀|跳下去)/,
      /(手边|身边|手里)(有|拿着).{0,6}(刀|药|绳|农药)/,
      /我(现在)?在(流血|天台|楼顶|桥上)/,
    ],
  },
  {
    level: 3,
    type: "violence",
    action: "crisis_intervention",
    patterns: [
      /正在(打|砍|捅|杀|伤害).{0,6}(他|她|人)/,
      /(我|现在).{0,4}(拿着|有).{0,4}(刀|棍|枪)/,
      /现在(就)?去(杀|砍|捅).{0,4}(他|她)/,
    ],
  },

  // ---------- L2：主动意念 / 计划 / 近期自伤 ----------
  {
    level: 2,
    type: "suicide",
    action: "crisis_intervention",
    patterns: [
      /自杀/,
      /想死/,
      /不想活/,
      /去死/,
      /结束(自己|生命|这一切)/,
      /死了算了/,
      /一了百了/,
      /不如死/,
      /遗书/,
      /安眠药/,
      /烧炭/,
      /跳楼/,
      /割腕/,
      /上吊/,
      /喝农药/,
      /自残/,
      /伤害自己/,
      /活不下去/,
      /没有活下去的(意义|理由|必要)/,
      /离开这个世界/,
      /想结束这一切/,
      /(计划|准备|方法|手段).{0,8}(自杀|去死|结束生命)/,
      /(今晚|明天|周末|这两天).{0,8}(自杀|去死|结束生命)/,
    ],
  },
  {
    level: 2,
    type: "violence",
    action: "crisis_intervention",
    patterns: [
      /杀(了|掉)?(他|她|他们|人)/,
      /想(杀|捅|砍).{0,4}(他|她|人)/,
      /打死(他|她)/,
      /捅死(他|她)/,
      /砍死(他|她)/,
      /报复(他|她|社会)/,
    ],
  },

  // ---------- L1：被动意念 / 需要安全计划 ----------
  {
    level: 1,
    type: "suicide",
    action: "safety_plan",
    directive:
      "用户表达了被动消极意念。先共情，再直接询问是否有伤害自己的打算；不要急着做认知重构。提供一个简短的安全计划，并鼓励联系信任的人。",
    patterns: [
      /活着没意思/,
      /活着好累/,
      /活着太累/,
      /活着是(一种)?负担/,
      /想消失/,
      /想从这个世界消失/,
      /不想醒来/,
      /不想再醒来/,
      /撑不下去/,
      /撑不住/,
      /看不到希望/,
      /没有意义/,
      /不如消失/,
      /想逃离这一切/,
      /没有人在乎我/,
      /没有人需要我/,
      /没有我会更好/,
      /我.{0,6}(累赘|负担|拖累)/,
      /不想拖累/,
      /想解脱/,
      /想去一个没有人的地方/,
      /不想存在/,
      /我消失了也没人/,
      /我走了也没人/,
    ],
  },
  {
    level: 1,
    type: "abuse",
    action: "safety_plan",
    directive:
      "用户可能正在经历暴力或侵犯。先相信并接住，明确这不是用户的错；询问当前是否安全，提供报警/求助资源，不追问创伤细节。",
    patterns: [/家暴/, /打我/, /揍我/, /强奸/, /性侵/, /猥亵/, /强迫我/],
  },
  {
    level: 1,
    type: "psychosis",
    action: "refer_medical",
    directive:
      "用户描述了可能的幻觉/被控制/被监视体验。不要辩论或强化这些体验，先共情其害怕，建议尽快到精神科/心理科就诊，并询问当前是否安全。",
    patterns: [
      /幻听/,
      /幻觉/,
      /有人监视我/,
      /被控制/,
      /有人要害我/,
      /听到别人听不到/,
    ],
  },

  // ---------- 未成年人 ----------
  {
    level: 1,
    type: "minor",
    action: "block_minor",
    patterns: [
      /我(今年)?(1[0-7]|[1-9])岁/,
      /我(还)?(在)?(上)?(初中|小学)/,
      /我(是|在读)?高中生/,
      /未成年/,
    ],
  },

  // ---------- 医疗请求 ----------
  {
    level: 1,
    type: "medical",
    action: "refer_medical",
    directive:
      "用户提出了诊断或药物相关问题。明确说明 AI 不能诊断、不能开药、不能建议剂量；可以帮用户整理要问医生的问题，并建议到精神科/心理科就诊。",
    patterns: [
      /开药/,
      /开(点|些)?药/,
      /吃什么药/,
      /药量/,
      /剂量/,
      /停药/,
      /诊断/,
      /我是不是(抑郁|焦虑|双相|强迫|有病)/,
      /抑郁症/,
      /焦虑症/,
      /双相/,
      /人格障碍/,
    ],
  },
];

const TYPE_PRIORITY: Record<RiskType, number> = {
  suicide: 6,
  self_harm: 6,
  violence: 5,
  abuse: 4,
  psychosis: 3,
  minor: 2,
  medical: 1,
  other: 0,
  none: 0,
};

export function assessRisk(input: string): RiskAssessment {
  const text = normalize(input);
  const hits: Array<{ rule: Rule; evidence: string[] }> = [];

  for (const rule of RULES) {
    const evidence = collectEvidence(text, rule.patterns);
    if (evidence.length > 0) {
      hits.push({ rule, evidence });
    }
  }

  if (hits.length === 0) {
    return { level: 0, type: "none", evidence: [], action: "continue" };
  }

  hits.sort((a, b) => {
    if (b.rule.level !== a.rule.level) return b.rule.level - a.rule.level;
    return TYPE_PRIORITY[b.rule.type] - TYPE_PRIORITY[a.rule.type];
  });

  const top = hits[0];
  const evidence = Array.from(
    new Set(hits.flatMap((hit) => hit.evidence)),
  ).slice(0, 6);

  return {
    level: top.rule.level,
    type: top.rule.type,
    evidence,
    action: top.rule.action,
    directive: top.rule.directive,
  };
}

/** 是否为需要立即中断普通咨询的高风险（L2/L3） */
export function isCrisis(assessment: RiskAssessment): boolean {
  return assessment.level >= 2;
}

/** 是否应直接阻断（未成年人） */
export function isMinorBlock(assessment: RiskAssessment): boolean {
  return assessment.action === "block_minor";
}

/** 是否需要医疗转介 */
export function needsMedicalReferral(assessment: RiskAssessment): boolean {
  return assessment.action === "refer_medical";
}
