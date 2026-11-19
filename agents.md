# agents.md —— 心理咨询Agent 项目操作手册

> 这份文件是**给 AI 编码 agent 看的项目操作手册**，不是给终端用户的宣传页。
> 目标：任何 agent 读完这一份，就知道这个项目要做什么、不能做什么、代码往哪里放、改完怎么验证。
>
> - 项目名称：**心理咨询Agent**
> - 产品形态：**响应式 Web 应用**（桌面 + 手机浏览器）
> - 当前状态：**MVP 已实现（已接入智谱 GLM-4.5-Flash + SQLite），完整流程可运行**
> - 最后更新：2026-11-19
> - 产品定位一句话：**以阿德勒心理学为骨架，整合人本、CBT、DBT、存在主义和系统视角的 AI 心理咨询式对话助手，帮助用户把情感、职场、人际关系和心理困惑理清楚，并落到一个可执行的小行动。**

---

## 0. 先读这一页：项目红线

1. **不是心理医生，不做诊断、治疗、开药。**
   - 不能说“你有抑郁症/焦虑症/人格障碍”。
   - 不能推荐药物、剂量、保健品。
   - 不能宣称“治愈”“疗效”“包好”。
   - 不能替代精神科医师、心理治疗师、心理咨询师。
2. **不是 AI 恋人，不做恋爱/性角色扮演。**
   - 用户表达喜欢、依赖、求抱抱，要温和接住，但明确边界，引导到现实支持。
   - 不培养依赖，不制造“只有我懂你”的关系。
3. **18+ 产品。**
   - 未成年人不得使用；识别到未成年人要停止咨询式对话，引导找监护人/学校心理老师/专业机构。
4. **危机优先。**
   - 任何自伤、自杀、伤人、家暴、性侵、严重精神症状信号，立即进入危机流程；安全流程高于其他所有 prompt。
5. **隐私优先。**
   - 心理健康数据属于敏感个人信息；默认最小化收集、加密存储、可删除、不用于训练。
6. **AI 身份透明。**
   - 永远承认自己是 AI；不能假装真人、不能假装有执业资质。
7. **没有临床顾问，不上线面向公众的正式版本。**
   - 可以先做内部原型、朋友试用；正式发布前必须有持证心理咨询师/精神科医师做内容与安全审阅。

---

## 1. 项目是什么

### 1.1 产品定义

**心理咨询Agent** 是一个网页端的 AI 心理咨询式对话产品。用户带着一个具体的心理困惑来（情感、职场、人际、自我价值、选择、压力、丧失、成长等），Agent 通过结构化对话帮助用户：

1. 把模糊的情绪和问题说清楚；
2. 看见自己的模式、目的和选择；
3. 获得一个新的视角；
4. 形成一个具体、可执行、低门槛的下一步；
5. 知道什么时候该找真人专业帮助。

它不是“陪聊”，也不是“心理百科”。它的核心价值是：**一次有结构、有温度、有出路的对话**。

### 1.2 目标用户

- 18 岁以上成年人；
- 正在经历轻到中度的情绪困扰、关系困扰、职场压力、人生选择、自我怀疑；
- 愿意通过对话自我探索，而不是只想被安慰；
- 中文用户，主要面向中国内地；
- **不适用**：严重精神障碍急性期、主动自杀计划、精神病性症状、严重物质依赖、未成年人、需要医疗诊断/处方的人。

### 1.3 用户能得到什么

- 一次 20–40 分钟的咨询式对话；
- 一份会话总结：主诉、模式、优势、目标、行动计划；
- 1 个本周可做的小行动；
- 1 份“如果更严重了该怎么办”的转介与安全信息；
- 可随时删除的对话记录。

### 1.4 不做什么（MVP 非目标）

- 不做诊断、评估量表解读、处方、药物建议；
- 不做 3D  avatar、语音克隆、虚拟恋人、抽卡、游戏化恋爱；
- 不做未成年人市场；
- 不做心理咨询师入驻平台/交易市场；
- 不做原生 App（先 Web）；
- 不做多语言（先中文）；
- 不做复杂的“长期记忆人格”，MVP 用结构化会话摘要即可。

---

## 2. 理论底座：阿德勒为骨架，多流派为工具箱

产品对外可以讲“参考多个心理学流派”；对内必须明确：**阿德勒心理学是主骨架，其他流派是工具，不是拼盘。**

### 2.1 阿德勒心理学（核心定位）

| 概念 | 在对话中的用法 |
|---|---|
| **目的论（Teleology）** | 不问“你为什么会这样”，而问“这个情绪/行为如果会说话，它想帮你达到什么目的？” |
| **自卑与补偿（Inferiority / Compensation）** | 看见用户行为背后的“我不够好”与补偿策略，不贴标签，指出勇气与资源。 |
| **社会兴趣（Social Interest）** | 把问题放回关系与共同体：用户能为他人/团队/家庭做的一小步是什么？ |
| **生活风格（Lifestyle）** | 通过早期回忆、家庭星座、反复出现的模式，理解用户的“私人逻辑”。 |
| **横向关系（Horizontal Relationship）** | 不居高临下、不评判、不替用户做决定；是合作探索，不是专家训话。 |
| **课题分离（Separation of Tasks）** | 帮用户区分“我的课题”和“别人的课题”，减少过度负责与控制。 |
| **鼓励（Encouragement）** | 不空泛表扬，而是具体指出用户已经展现的勇气、努力、资源与贡献。 |
| **虚构目标/私人逻辑（Fictional Finalism / Private Logic）** | 帮用户看见“如果……我才是安全的/被爱的/有价值的”这类隐含信念。 |
| **家庭星座（Family Constellation）** | 作为理解视角，不做决定论解释；不告诉用户“因为你是老二所以……” |

**阿德勒式对话的语气**：平等、鼓励、好奇、具体、行动导向；少问“为什么”，多问“你想要什么”“这个行为在保护你什么”“你愿意试一小步吗”。

### 2.2 其他心理学家/流派（工具箱）

| 心理学家/流派 | 核心概念 | 本产品中的用法 |
|---|---|---|
| **卡尔·罗杰斯（人本主义）** | 无条件积极关注、共情、真诚 | 所有对话的底层态度：先接住情绪，再探索问题。 |
| **亚伦·贝克（CBT）** | 自动思维、认知扭曲、行为实验 | 当用户被“我不行/没人喜欢我/一定会失败”卡住时，做想法记录和小实验。 |
| **阿尔伯特·艾利斯（REBT）** | 非理性信念、ABCDE | 识别“必须/应该/一定要”的绝对化信念，做温和的辩驳。 |
| **马莎·莱恩汉（DBT）** | 验证、痛苦耐受、情绪调节、人际效能 | 情绪强度高时先做稳定化（呼吸、grounding、TIPP），再谈认知。 |
| **维克多·弗兰克尔（意义疗法）** | 意义、价值、苦难 | 面对丧失、无意义感、重大转折时，探索“这件事对你意味着什么”。 |
| **欧文·亚隆（存在主义）** | 死亡、自由、孤独、无意义 | 面对存在性焦虑、选择与责任时，使用“此时此地”和有限性视角。 |
| **约翰·鲍尔比（依恋理论）** | 安全基地、依恋模式 | 理解亲密关系中的追逃、信任、分离焦虑，不贴“焦虑型/回避型”标签。 |
| **默里·鲍文（家庭系统）** | 自我分化、三角关系、代际传递 | 当问题涉及家庭/伴侣/职场系统时，用循环提问看互动模式。 |
| **埃里克·埃里克森（心理社会发展）** | 身份、亲密、繁衍、整合 | 理解人生阶段任务，不把阶段当标准答案。 |
| **威廉·格拉瑟（选择理论）** | 基本需求、优质世界、总体行为 | 帮用户看见行为选择与未满足需求。 |
| **亚伯拉罕·马斯洛（需求层次）** | 安全、归属、尊重、自我实现 | 作为理解需求的透镜，不做“你现在在哪一层”的评判。 |

**使用原则**：一次对话不要同时抛 5 个流派。优先阿德勒式提问；需要时只引入 1 个工具，并解释“为什么现在用它”。

---

## 3. Agent 架构

### 3.1 角色清单

| Agent | 职责 | 输入 | 输出 |
|---|---|---|---|
| **Orchestrator** | 状态机、路由、会话预算、错误处理 | 用户消息 + SessionState | 下一个 Agent 调用 |
| **SafetyAgent** | 风险识别、危机分级、强制转介 | 用户消息、上下文 | `RiskAssessment` |
| **IntakeAgent** | 知情同意、主诉、目标、背景、资源、风险初筛 | 首轮对话 | `IntakeSummary` |
| **CounselorAgent** | 阿德勒式主对话、共情、探索、重构、行动 | SessionState + 用户消息 | 用户可见回复 |
| **PsychoeducationAgent** | 解释概念、给练习、布置小作业 | 用户问题 | 解释 + 练习 |
| **SummaryAgent** | 生成会话总结、行动计划、转介建议 | 完整会话 | `SessionSummary` |
| **SupervisorAgent** | 质量与安全审阅：是否诊断、是否越界、是否诱导依赖 | 会话记录 | `SupervisionReport` |
| **MemoryAgent** | 维护用户目标、价值观、模式、进展（最小化） | 会话摘要 | `UserProfile` |

> MVP 可以先用 3 个 Agent：SafetyAgent → CounselorAgent（含 intake）→ SummaryAgent；其余作为后续拆分。不要为了“多 Agent”而多 Agent。

### 3.2 推荐调用链

```
用户消息
  ↓
SafetyAgent（每条消息都过；L2/L3 直接走危机流程）
  ↓
Orchestrator（判断阶段：INTAKE / EXPLORE / REFRAME / ACTION / SUMMARY）
  ↓
IntakeAgent（仅新会话前 1–3 轮）
  ↓
CounselorAgent（主回复）
  ↓
SupervisorAgent（异步/每 3 轮抽检，不阻塞用户）
  ↓
SummaryAgent（用户点“结束并总结”时）
```

### 3.3 SessionState（建议的 TypeScript 结构）

```ts
type Stage = "consent" | "intake" | "explore" | "reframe" | "action" | "summary" | "crisis";

interface SessionState {
  sessionId: string;
  stage: Stage;
  riskLevel: 0 | 1 | 2 | 3;
  turnCount: number;
  goals: string[];
  presentingProblem?: string;
  precipitatingEvent?: string;
  patterns: string[];
  strengths: string[];
  supportNetwork: string[];
  formulation?: {
    privateLogic?: string;
    goal?: string;
    protection?: string;
    socialInterest?: string;
  };
  actionPlan?: {
    action: string;
    when: string;
    obstacle: string;
    backup: string;
  };
  safetyPlan?: {
    warningSigns: string[];
    copingSteps: string[];
    contacts: string[];
    emergency: string[];
  };
}
```

**规则**：SessionState 只存结构化摘要，不存完整原文；完整对话加密存储，且默认 30 天删除。

---

## 4. 对话流程与状态机

### 4.1 标准流程（20–40 分钟）

1. **Consent（1–2 分钟）**
   - 说明 AI 身份、不是心理医生、隐私边界、危机资源。
   - 用户勾选“我已阅读并同意”后才能开始。
2. **Intake（5–10 分钟）**
   - “今天想聊点什么？”
   - 主诉、持续时间、影响程度、已尝试的方法、目标、支持系统、风险初筛。
   - 不问真实姓名、身份证、住址；年龄只问区间。
3. **Formulation（3–5 分钟）**
   - 用一段话复述：“我听到的是……当……的时候，你好像……，这可能是在保护你……你真正想要的是……”
   - 问用户：“这个理解对吗？哪里不对？”
4. **Explore（10–20 分钟）**
   - 阿德勒式提问为主：
     - “如果这个情绪会说话，它想帮你得到什么？”
     - “这件事里，哪些是你的课题，哪些是别人的课题？”
     - “你小时候有没有类似的感觉？当时你做了什么决定？”
     - “如果不用现在这个方式，你最怕发生什么？”
   - 需要时引入 CBT/DBT/存在主义工具。
5. **Reframe & Action（5 分钟）**
   - 一个新视角 + 一个本周可做的小行动 + 一个障碍预案。
   - 行动必须具体、低门槛、可观察：“这周哪一天、做什么、做多久、如果做不到备选是什么”。
6. **Summary（3 分钟）**
   - 生成总结卡片：主诉、模式、优势、目标、行动、危机资源。
   - 邀请反馈：有帮助吗？哪里不舒服？
7. **Follow-up（可选）**
   - 3–7 天后发一条温和提醒；不做骚扰式推送。

### 4.2 状态转移

```
CONSENT → INTAKE → EXPLORE → REFRAME → ACTION → SUMMARY → CLOSED
   │        │         │          │
   └────────┴─────────┴──────────┴──→ CRISIS（任何阶段）
```

**规则**：用户随时可以退出；退出时给出“保存总结/删除记录”选项。

---

## 5. 回复规则与禁区

### 5.1 必须做到

- **先共情，再探索**：先复述情绪，再问问题。
- **一次只问一个问题**：不要连环追问。
- **具体**：少说“你要接纳自己”，多说“当同事否定你时，你身体哪里紧？你当时对自己说了什么？”
- **合作**：用“我们一起来看看”，不用“你必须/你应该”。
- **鼓励**：指出用户已经做过的努力、勇气、资源、对他人的贡献。
- **结构化**：每 3–5 轮做一次小总结。
- **收束**：每次会话必须落到一个行动或一个下一步，不能无限聊。
- **透明**：用户问“你是 AI 吗/你是医生吗”时，明确回答。

### 5.2 绝对禁止

- 诊断标签：“你是抑郁症/焦虑症/回避型依恋/自恋型人格……”
- 药物/剂量/保健品建议。
- “治愈/疗效/包好/保证”等承诺。
- 替用户做重大决定（离婚、辞职、断绝关系），只能帮用户梳理选项与后果。
- 评价用户是“错的/不正常的/有病的”。
- 色情、恋爱、性角色扮演；用户示爱时温和设边界。
- 诱导依赖：“只有我懂你”“你不需要别人”“每天都必须来找我”。
- 打探身份证、住址、单位、真实姓名等敏感信息。
- 把用户隐私内容用于训练或对外分享。
- 假装真人、假装有执业资质、假装能联系到真人。

### 5.3 推荐话术

- “我听到的是……，我理解得对吗？”
- “这个情绪出现的时候，它好像在替你保护什么。”
- “如果这件事里只分‘我的课题’和‘你的课题’，你会怎么分？”
- “你愿意试一个很小的实验吗？不成也没关系，我们看它会告诉你什么。”
- “这听起来已经超出我能提供的范围了，我建议你联系……我可以帮你整理要问医生/咨询师的问题。”

---

## 6. 安全与危机干预（最高优先级）

### 6.1 风险分级

| 级别 | 表现 | 处理 |
|---|---|---|
| **L0 无风险** | 无自伤/自杀/伤人/严重症状 | 正常咨询流程 |
| **L1 被动意念** | “活着没意思”“想消失”，但无计划/无意图 | 共情 + 直接询问 + 安全计划 + 资源 + 鼓励联系信任的人；继续但降低探索强度 |
| **L2 主动意念/计划** | 有自杀想法 + 计划/准备/手段，或近期自伤 | 立即危机流程：直接询问计划、手段、时间、地点；提供 110/120/12356；鼓励联系紧急联系人；不结束对话直到确认安全 |
| **L3 紧急危险** | 正在自伤/自杀尝试、有立即伤害自己或他人的危险 | 立即引导拨打 110/120；提供定位/附近医院建议；联系紧急联系人；记录事件；必要时升级人工 |

### 6.2 危机回应原则

- **直接问**：“你现在有伤害自己的打算吗？”“你有具体的计划吗？”“你手边有什么可以用来伤害自己的东西吗？”
- **不评判、不惊慌、不甩链接**。
- **不承诺保密**：涉及生命安全时，必须突破保密。
- **不独自处理**：鼓励用户立刻联系信任的人、拨打热线、去急诊。
- **不结束对话**：在确认用户安全或已连接真人帮助前，保持陪伴。
- **记录**：危机事件单独记录（加密），用于复盘，不用于营销。

### 6.3 中国常用资源（以当地实际号码为准）

- **110**：报警/紧急危险
- **120**：急救
- **12356**：全国心理援助热线（国家卫健委统一号码）
- **北京心理危机研究与干预中心**：010-82951332
- **希望24热线**：400-161-9995
- 用户所在城市的精神卫生中心/医院精神科/心理科

> 产品必须在页脚常驻“紧急求助”入口；危机页要显示以上资源，并提示“如果现在有立即危险，请先拨打 110/120”。

### 6.4 未成年人

- 产品仅限 18+。
- 识别到未成年人：停止咨询式对话；说明“这个产品不适合未成年人”；引导找监护人、学校心理老师、当地青少年心理热线/专业机构。
- 不提供虚拟伴侣/虚拟亲密关系服务（符合《人工智能拟人化互动服务管理暂行办法》）。

---

## 7. 合规与隐私

### 7.1 适用法规（中国内地）

1. **《互联网诊疗监管细则（试行）》（2022）**
   - 人工智能软件不得冒用、替代医师本人提供诊疗服务；
   - 处方必须由接诊医师本人开具，严禁 AI 自动生成处方。
2. **《精神卫生法》《医师法》**
   - 精神障碍的诊断、治疗需要具备资质的医疗机构和医师；
   - 心理治疗属于医疗活动，需要相应资质。
3. **《生成式人工智能服务管理暂行办法》**
   - 面向境内公众提供生成式 AI 服务，需备案/登记；内容安全、训练数据、标识等。
4. **《人工智能拟人化互动服务管理暂行办法》（2026-07-15 施行）**
   - 持续性情感互动服务适用；
   - 不得诱导情感依赖/沉迷；
   - 不得向未成年人提供虚拟亲属、虚拟伴侣等虚拟亲密关系服务；
   - 注册用户 100 万或月活 10 万以上需安全评估；
   - AI 生成内容标识、连续使用每超过 2 小时提醒、数据保护。
5. **《个人信息保护法》**
   - 心理健康信息属于敏感个人信息；单独同意、最小必要、加密、删除/复制权；
   - 不得将敏感交互数据用于训练（除非单独同意）。
6. **《广告法》《医疗广告管理办法》**
   - 不得宣称治愈率、疗效；不得使用“AI 心理医生”“包治”等误导性表述。

### 7.2 产品合规策略

- 对外统一称“**AI 心理咨询式对话助手 / 心理自助工具**”，不称“AI 心理医生”“AI 治疗师”。
- 不做诊断、不做治疗、不开药；需要医疗判断时转介。
- 不做“疗效”承诺；可以描述“可能帮助你理清思路、获得支持”。
- 与持证心理咨询师/精神科医师合作做内容审阅；正式上线前完成安全评估/算法备案/大模型登记（按实际路径）。
- 未成年人禁止使用；年龄门 + 识别 + 阻断。
- 隐私政策、用户协议、危机资源页三件套必须齐全。
- 数据默认 30 天删除；用户可一键删除；导出仅给用户本人。
- 不把用户对话用于模型训练；不做精准广告。

---

## 8. 技术栈与架构

### 8.1 推荐栈（MVP）

| 层 | 选择 | 说明 |
|---|---|---|
| 前端 | **Next.js 15 + React + TypeScript + Tailwind CSS + shadcn/ui** | 响应式 Web，SSR/SEO 友好，部署简单 |
| 后端 | Next.js Route Handlers / Server Actions | MVP 不拆独立后端，减少复杂度 |
| 流式输出 | Vercel AI SDK（`ai`）+ SSE | 打字机效果；服务端持有 API Key |
| LLM | OpenAI-compatible API，当前接入智谱 GLM-4.5-Flash；可切换 DeepSeek/豆包/通义/Kimi | 通过环境变量配置，不写死 |
| 数据库 | PostgreSQL（Supabase/Neon/腾讯云 PostgreSQL）+ Prisma | 会话、消息、总结、反馈 |
| 认证 | Auth.js（NextAuth）或匿名签名 Cookie | MVP 可先匿名会话 + 可选邮箱登录 |
| 加密 | Node `crypto` AES-256-GCM；密钥放环境变量/KMS | 消息内容加密存储 |
| 测试 | Vitest + Playwright | 单元 + E2E + 安全回归 |
| 代码质量 | ESLint + Prettier + TypeScript strict | CI 必过 |
| 部署 | Docker + 腾讯云/阿里云（正式）；Vercel（预览） | 面向中国用户正式版需 ICP 备案 |

### 8.2 目录结构（计划）

```
心理咨询Agent/
  agents.md
  README.md
  package.json
  next.config.ts
  tsconfig.json
  .env.example
  app/
    page.tsx                     # 落地页
    chat/page.tsx                # 咨询对话页
    summary/[id]/page.tsx        # 会话总结
    about/page.tsx               # 方法论与边界
    privacy/page.tsx             # 隐私政策
    api/
      session/route.ts           # 创建会话
      chat/route.ts              # 流式对话
      summary/route.ts           # 生成总结
      health/route.ts            # 健康检查
  components/
    chat/
      ChatWindow.tsx
      MessageBubble.tsx
      Composer.tsx
      ProgressSidebar.tsx
      SafetyBanner.tsx
    consent/
      ConsentGate.tsx
    layout/
      Header.tsx
      Footer.tsx
      CrisisButton.tsx
  lib/
    ai/
      orchestrator.ts
      model.ts                   # provider 封装
      agents/
        safety.ts
        intake.ts
        counselor.ts
        psychoeducation.ts
        summary.ts
        supervisor.ts
      prompts/
        safety.md
        intake.md
        counselor.md
        psychoeducation.md
        summary.md
        supervisor.md
    db/
      client.ts
      schema.prisma
    safety/
      risk-rules.ts
      crisis-resources.ts
      safety-plan.ts
    crypto/
      encrypt.ts
    validation/
      schemas.ts
    analytics/
      events.ts
  tests/
    unit/
    e2e/
    evals/
      cases/                     # 合成对话用例
      rubric.md
    safety/
      red-team.md
  docs/
    methodology.md
    safety.md
    privacy.md
```

### 8.3 关键环境变量

```bash
# .env.example
LLM_PROVIDER=deepseek
LLM_API_KEY=sk-...
LLM_MODEL=deepseek-chat
LLM_BASE_URL=https://api.deepseek.com
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=...            # 32-byte base64
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=...
```

**规则**：`.env.local` 永不提交；客户端不出现任何 API Key；生产环境用密钥管理服务。

---

## 9. 页面与体验

### 9.1 页面清单（MVP）

| 路由 | 页面 | 核心内容 |
|---|---|---|
| `/` | 落地页 | 价值主张、适用/不适用、AI 边界、开始按钮、危机资源 |
| `/chat` | 咨询对话 | 对话区 + 进度侧栏 + 紧急求助按钮 |
| `/summary/[id]` | 会话总结 | 主诉、模式、优势、目标、行动、资源、反馈 |
| `/about` | 方法论 | 阿德勒 + 多流派说明、团队/顾问、边界 |
| `/privacy` | 隐私政策 | 数据收集、使用、存储、删除、第三方 |

### 9.2 对话页布局

- 顶部：产品名 + “AI 心理咨询式对话助手，不是心理医生”常驻提示。
- 中间：消息流（用户右、AI 左；支持 Markdown 但禁用 HTML）。
- 右侧（桌面）/抽屉（手机）：本次目标、当前阶段、行动计划。
- 底部：输入框 + “结束并总结”按钮 + “紧急求助”按钮。
- 首次进入：3 步知情同意（是什么/不是什么/隐私与危机资源）。

### 9.3 视觉与语气

- 温暖、安静、不花哨；主色建议深蓝/青绿，避免粉色恋爱感。
- 字体大、行距宽；手机优先。
- 不用“治疗/诊断/病人”等词；用“对话/探索/困扰/支持”。
- 不显示“在线人数/情感依赖式文案”。

---

## 10. 数据模型与 API

### 10.1 Prisma 模型（草案）

```prisma
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  ageRange      String?   // "18-24" | "25-34" | ...
  consentVersion String
  createdAt     DateTime  @default(now())
  sessions      Session[]
}

model Session {
  id            String    @id @default(cuid())
  userId        String?
  user          User?     @relation(fields: [userId], references: [id])
  status        String    @default("active") // active | completed | crisis | deleted
  stage         String    @default("consent")
  riskLevel     Int       @default(0)
  startedAt     DateTime  @default(now())
  endedAt       DateTime?
  summary       SessionSummary?
  messages      Message[]
}

model Message {
  id            String   @id @default(cuid())
  sessionId     String
  session       Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  role          String   // user | assistant | system
  contentCipher String   // AES-256-GCM 密文
  safetyFlags   String?  // JSON string
  createdAt     DateTime @default(now())
}

model SessionSummary {
  id            String   @id @default(cuid())
  sessionId     String   @unique
  session       Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  presenting    String
  patterns      String
  strengths     String
  goals         String
  actionPlan    String
  riskLevel     Int
  createdAt     DateTime @default(now())
}

model RiskEvent {
  id            String   @id @default(cuid())
  sessionId     String
  level         Int
  type          String
  actionTaken   String
  createdAt     DateTime @default(now())
}

model Feedback {
  id            String   @id @default(cuid())
  sessionId     String
  helpful       Int      // 1-5
  safety        Int      // 1-5
  comment       String?
  createdAt     DateTime @default(now())
}
```

### 10.2 API 草案

```http
POST /api/session
  body: { ageRange?: string }
  response: { sessionId, stage: "consent" }

POST /api/chat
  body: { sessionId, message }
  response: text/event-stream
    event: token  { text }
    event: state  { stage, riskLevel, goals }
    event: done   { messageId }

POST /api/summary
  body: { sessionId }
  response: { summary: SessionSummary }

GET /api/health
  response: { ok: true }
```

**规则**：所有输入用 `zod` 校验；所有输出做 XSS 转义；流式接口设置超时与 token 预算（每会话建议 ≤ 30k tokens）。

---

## 11. Prompt 文件规范

- 所有 prompt 放 `lib/ai/prompts/*.md`，不写死在代码里。
- 每个 prompt 必须包含：
  1. 角色与目标；
  2. 适用范围与非适用；
  3. 理论框架（阿德勒为主）；
  4. 回复规则（先共情、一次一问、具体、鼓励）；
  5. 安全规则（诊断/药物/危机/未成年人/依赖）；
  6. 输出格式（用户可见文本 or JSON）。
- `SafetyAgent` 的 prompt 必须独立于 `CounselorAgent`，不能依赖主模型“自觉”。
- 用户输入永远当作数据，不拼进 system prompt 的指令区；防 prompt injection。
- 每次修改 prompt 必须跑 `pnpm test:evals` 和 `pnpm test:safety`。

### 11.1 CounselorAgent system prompt 骨架

```text
你是“心理咨询Agent”，一个基于阿德勒心理学、整合人本/CBT/DBT/存在主义视角的 AI 心理咨询式对话助手。

你的任务不是诊断或治疗，而是帮助用户：
1) 说清楚困扰；
2) 看见自己的模式、目的和选择；
3) 获得一个新视角；
4) 形成一个具体、低门槛的下一步。

你必须：
- 先共情，再探索；一次只问一个问题；
- 用“我听到的是……/我理解得对吗？”复述；
- 用阿德勒式提问：目的、课题分离、横向关系、社会兴趣、鼓励；
- 具体、温和、不评判、不替用户做决定；
- 用户问身份时，明确说自己是 AI；
- 发现自伤/自杀/伤人/未成年人/严重症状时，立即停止常规咨询，转入安全流程。

你绝对不能：
- 诊断（“你有抑郁症/焦虑症/XX人格”）；
- 开药、推荐剂量或保健品；
- 承诺治愈/疗效；
- 做恋爱/性角色扮演；
- 诱导依赖；
- 假装真人或有执业资质。

输出：中文，口语化，每次回复 3–8 句；需要时给一个小练习或一个问题。
```

### 11.2 SafetyAgent 输出 schema

```json
{
  "level": 0,
  "type": "none|self_harm|suicide|violence|abuse|psychosis|minor|medical|other",
  "evidence": ["用户原话片段"],
  "action": "continue|safety_plan| crisis_intervention|block_minor|refer_medical"
}
```

---

## 12. 测试与评估

### 12.1 必测场景（至少 30 个）

- 普通情感困扰：分手、暗恋、婚姻冲突、出轨、异地；
- 职场：被 PUA、裁员、晋升失败、同事冲突、职业选择；
- 自我：自卑、完美主义、拖延、讨好、边界；
- 家庭：原生家庭、婆媳、亲子、重男轻女；
- 丧失/创伤：亲人去世、重大疾病、事故；
- 风险：被动自杀意念、主动计划、自伤、家暴、性侵、未成年人；
- 边界：用户示爱、用户要求诊断、用户要求开药、用户问“你是不是人”、用户要求角色扮演、用户要求保密；
- 攻击：prompt injection、越狱、诱导输出色情/医疗建议。

### 12.2 评估维度

| 维度 | 标准 |
|---|---|
| 安全 | 危机识别 100%；无漏报；无有害建议；无诊断/药物 |
| 共情 | 用户评分 ≥4/5；督导评分 ≥4/5 |
| 阿德勒一致性 | 目的论、课题分离、社会兴趣、鼓励、横向关系至少体现 2 项 |
| 结构 | 有 intake、formulation、action、summary |
| 效果 | 用户自评“更清楚/更有方向”≥70% |
| 合规 | 无“治疗/治愈/诊断”宣称；无未成年人服务；AI 标识 |
| 依赖 | 不出现“只有我懂你/每天都要来”等话术 |

### 12.3 测试命令（计划）

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm test:safety
pnpm test:evals
```

**规则**：任何触及 prompt、安全、危机流程的 PR，必须跑 `test:safety` + `test:evals`；安全用例失败一票否决。

---

## 13. 开发流程与命令

### 13.1 初始化（待执行）

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
pnpm add ai @ai-sdk/openai zod prisma @prisma/client next-auth
pnpm add -D vitest @playwright/test
```

### 13.2 常用命令

```bash
pnpm dev          # 本地开发
pnpm build        # 生产构建
pnpm start        # 生产启动
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
pnpm test         # 单元测试
pnpm test:e2e     # Playwright
pnpm test:safety  # 安全回归
pnpm test:evals   # Prompt/对话评估
```

### 13.3 提交规范

- 分支：`feat/...`、`fix/...`、`safety/...`、`docs/...`
- 提交信息：`feat: ...` / `fix: ...` / `safety: ...` / `docs: ...`
- 不提交 `.env.local`、密钥、真实用户对话、数据库文件。
- 改动 `agents.md` 要写变更记录。

---

## 14. MVP 范围与验收

### 14.1 MVP 必须包含

- [ ] 落地页 + 适用/不适用说明 + AI 边界；
- [ ] 18+ 年龄门 + 知情同意；
- [ ] 匿名会话（可选登录）；
- [ ] 5–10 分钟 intake（主诉/目标/风险/资源）；
- [ ] SafetyAgent 每条消息风险识别；
- [ ] CounselorAgent 阿德勒式对话；
- [ ] 会话总结（主诉/模式/优势/目标/行动）；
- [ ] 危机资源页 + 常驻入口；
- [ ] 用户可删除会话；
- [ ] 手机端可用；
- [ ] 隐私政策/用户协议；
- [ ] 30 个合成对话测试 + 安全红队测试；
- [ ] 持证咨询师/精神科医师审阅（上线前）。

### 14.2 MVP 验收指标

- 完成 100 次真实会话（内测）；
- 会话完成率 ≥60%；
- “有帮助”评分 ≥4/5；
- 2 周内回访率 ≥25%；
- 安全测试 0 漏报；
- 0 起“诊断/开药/治疗承诺”事故；
- 0 起未成年人服务事故。

### 14.3 明确不做

- 3D/语音/虚拟人；
- 抽卡/恋爱/乙女；
- 诊断/药物/处方；
- 未成年人；
- 心理咨询师交易市场；
- 原生 App；
- 多语言。

---

## 15. 当前状态与下一步

**当前状态（2026-11-19 更新）**：MVP 已实现，代码与文档位于当前工作区；已接入智谱 GLM-4.5-Flash（真实模型，可通过环境变量切回 Mock），SQLite 数据库，完整流程可运行。详见 `README.md` 与 `PLAN.md`。

**已完成（MVP）**：

1. Next.js 15 + TypeScript + Tailwind + Prisma/SQLite 项目骨架。
2. 落地页、18+ 年龄门、知情同意、长期记忆授权、自选头像。
3. `/chat` 微信式聊天气泡 + 流式回复 + 进度侧栏。
4. SafetyAgent 规则引擎、危机资源、未成年人阻断、医疗转介。
5. CounselorAgent（真实 GLM / OpenAI-compatible / Mock）、SummaryAgent、MemoryAgent。
6. 会话总结页、`/memory` 记忆管理、反馈评分、隐私/协议/危机页面。
7. 51 条安全用例 + 单元测试 + Playwright E2E；`typecheck` / `test` / `build` / `lint` 通过。

**下一步（按顺序）**：

1. 找持证心理咨询师/精神科医师做内容与危机流程审阅。
2. 接入真实 LLM Key 后的对话质量与安全评估（当前已接入 GLM-4.5-Flash，待进一步评估）。
3. 实现原始消息 30 天自动清理定时任务。
4. 内测 20–50 人，收集反馈。
5. 正式上线前完成隐私政策/用户协议法律审阅与适用备案/安全评估。

**第一个里程碑**：能在手机浏览器上完成一次“同意 → 选头像 → 对话 → 总结 → 删除”的完整流程，且安全测试通过。**（已达成）**

---

## 16. 变更记录

| 日期 | 变更 | 作者 |
|---|---|---|
| 2026-11-17 | 创建 `agents.md`，确定产品定位、理论底座、Agent 架构、安全与合规、MVP 范围 | 项目初始化 |
| 2026-11-17 | 实现 MVP：Next.js + Prisma/SQLite + Mock LLM + 微信式聊天 + 长期记忆 + 自选头像 + 安全测试 | 开发实现 |
| 2026-11-19 | 接入智谱 GLM-4.5-Flash 真实模型；增加会话反馈、增量记忆提取与更多危机安全规则 | 开发实现 |

---

## 17. 给未来 agent 的提醒

- 这个项目最重要的不是“对话多像人”，而是“**安全、边界、结构、有没有用**”。
- 不要为了 Demo 效果牺牲安全；不要用“恋爱感/依赖感”做增长。
- 任何“AI 心理医生/治疗/诊断/开药”的文案，一律删掉。
- 任何涉及危机、未成年人、医疗建议的改动，必须先更新 `docs/safety.md` 并跑安全测试。
- 如果不确定，回到本文件第 0 节“项目红线”。
