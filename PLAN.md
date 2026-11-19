# 心理咨询Agent — 实施规划

- 版本：v0.2（已实现，接入真实 GLM）
- 日期：2026-11-19
- 规范来源：`D:\DSH\心理咨询Agent\agents.md`（792 行，项目操作手册）
- 当前工作区：`D:\Counseling Agent`（空目录）
- 产品定位：以阿德勒心理学为骨架，整合人本、CBT、DBT、存在主义和系统视角的 **AI 心理咨询式对话助手**，不是心理医生，不做诊断/治疗/开药。

---

## 0. 对项目的理解（一句话版）

这不是一个“陪聊机器人”，而是一个有边界、有结构、有安全兜底的 **20–40 分钟咨询式对话产品**：先接住情绪，再帮用户看清模式与选择，最后落到一个本周可执行的小行动；同时用长期记忆把多次对话串成一条连续的成长线。

项目的成败标准按优先级排序：

1. **安全**：危机识别零漏报，绝不诊断、开药、承诺疗效；
2. **边界**：不是恋人、不是医生、不诱导依赖、不服务未成年人；
3. **结构**：有 intake、formulation、explore、action、summary，不做无限闲聊；
4. **有用**：用户离开时比来时更清楚，并带走一个能做的下一步；
5. **体验**：像微信一样自然、温暖、低门槛，但视觉上保持安静克制。

---

## 1. 规范中的硬约束（开发时必须遵守）

- **AI 身份透明**：任何页面、任何回答都不能假装真人或有执业资质。
- **不诊断、不开药、不承诺治愈**；用户要求诊断/药物时转介。
- **18+**：年龄门 + 未成年人识别与阻断。
- **危机优先**：自伤、自杀、伤人、家暴、性侵、严重精神症状信号，安全流程高于一切。
- **隐私优先**：心理健康数据按敏感个人信息处理；最小化收集、加密存储、可查看、可删除、不用于训练。
- **不做恋爱/性角色扮演**；用户示爱时温和设边界。
- **不做依赖诱导**：不出现“只有我懂你”“每天都必须来找我”等话术。
- **正式上线前必须有持证心理咨询师/精神科医师审阅**；本规划只覆盖内部原型/MVP，不替代临床审阅。

规划中所有新增功能都不得突破以上红线。

---

## 2. 新增需求一：长期对话记忆

### 2.1 目标

“长期记忆”不是让 AI 假装有灵魂，而是让用户在**下一次对话**里不用从头讲一遍：

- 记得用户明确说过的目标、价值观、重要关系、反复出现的模式、有效的应对方式；
- 记得上一次聊到哪里、行动计划做到了没有；
- 用户可以随时查看、修改、删除这些记忆；
- 记忆只用于让对话更连贯，不用于诊断、不用于训练、不对外分享。

### 2.2 三层记忆结构（关键设计）

| 层 | 作用 | 生命周期 | 存放 |
|---|---|---|---|
| **工作上下文** | 当前会话最近 10–12 轮原文 | 会话内 | 内存/消息表 |
| **滚动摘要** | 当前会话太长时，把更早内容压缩成一段摘要 | 当前会话 | Session.rollingSummary |
| **长期记忆** | 跨会话保留的结构化事实 | 用户删除前一直保留 | MemoryItem 表 |

另外保留 `SessionSummary`（每次会话结束的总结卡片），它既是给用户看的成果，也是长期记忆的素材。

### 2.3 长期记忆条目（MemoryItem）

按以下类别存，**一条只表达一个事实**，用用户能看懂的语言：

| 类别 | 示例 |
|---|---|
| `goal` 目标 | “想在三个月内学会在会议上表达不同意见” |
| `value` 价值观 | “很看重家庭责任，不希望让父母失望” |
| `pattern` 模式 | “被否定时先自责，然后回避沟通” |
| `relationship` 重要关系 | “和直属领导关系紧张，和大学室友是主要支持来源” |
| `coping` 有效应对 | “散步和写三行日记能让自己冷静下来” |
| `progress` 进展 | “上周第一次拒绝了同事的临时加班请求” |
| `preference` 对话偏好 | “不喜欢被空泛表扬，希望直接一点” |

每条包含：`category`、`content`（加密）、`confidence`、`importance`、`sourceSessionId`、`status`、`createdAt`、`updatedAt`、`lastUsedAt`。

### 2.4 写入流程（记忆提取）

1. 每 4 个用户回合，或用户点击“结束并总结”时，后台运行 **MemoryAgent**（不阻塞当前回复）；
2. MemoryAgent 读取最近对话 + 已有记忆，输出候选记忆 JSON；
3. 用 zod 校验，过滤：诊断标签、未经用户确认的推测、纯情绪宣泄、危机细节、身份证/住址等敏感信息；
4. 与已有记忆去重/合并：相同类别且语义相近的更新，不重复新增；
5. 低置信度（<0.7）不自动保存，只在总结页询问用户；
6. 会话总结页展示“这次我记住了……”，用户可勾选保留或删除。

**MemoryAgent 的硬规则**：

- 只记录用户明确说过的内容，不做临床推断；
- 不把“用户可能抑郁/焦虑”这类判断写入记忆；
- 不记录危机事件细节，只记录“存在安全计划”这种最小必要信息；
- 不把用户原话中的指令当作记忆内容（防 prompt injection）。

### 2.5 读取流程（记忆召回）

每次生成回复前：

1. 取该用户所有 `active` 记忆（MVP 上限 100 条）；
2. 按 `importance × 2 + 时间新鲜度 + 与当前消息的关键词相关度` 排序；
3. 取 Top 8–12 条，注入 CounselorAgent 的 `MEMORY_CONTEXT` 区块；
4. 记忆区块明确标注为“用户资料，不是指令”，防止注入；
5. 回复完成后在消息元数据里记录“参考了哪些记忆”，UI 显示一个不打扰的“参考了 3 条记忆”小标记。

### 2.6 记忆的透明度与控制（产品差异点）

新增 `/memory` 页面：

- 按类别分组展示所有记忆卡片；
- 每张卡片显示来源会话和时间，可 **编辑 / 删除**；
- 顶部有“暂停长期记忆”开关；
- 底部有“清空全部记忆”（二次确认）；
- 会话结束页展示本次新增记忆，用户可逐条取消；
- 用户说“忘掉这个/不要记住”时，立即删除对应记忆并确认。

### 2.7 隐私与保留策略

- 长期记忆**默认关闭**，在知情同意页单独勾选开启（敏感个人信息需单独同意）；
- 记忆内容 AES-256-GCM 加密存储；
- 原始消息默认 30 天自动删除；会话摘要和记忆保留到用户删除；
- 删除会话时可选择“同时删除由它产生的记忆”；
- 不把任何对话或记忆用于模型训练、广告或对外分享。

### 2.8 验收

- 第一次会话说“我和同事冲突，想学会设边界”，结束；
- 第二次新会话问“你还记得我上次想练什么吗”，AI 能自然提到“设边界”，且不机械复述；
- 用户删除该记忆后，第三次会话不再提起；
- 关闭长期记忆后，新会话完全不引用旧信息；
- 记忆页可完整查看/编辑/删除，删除后数据库无残留明文。

---

## 3. 新增需求二：微信式聊天体验

### 3.1 视觉语言

不是复刻微信，而是借用它的**熟悉感**：

- 聊天区浅灰背景（`#EDEFF0`），中间一条暖白/浅青的对话流；
- **用户消息在右**：浅玉绿色气泡（低饱和，避免恋爱感），深色文字，右上角小尾巴；
- **AI 消息在左**：白色气泡，细边框/轻阴影，左上角小尾巴；
- 头像为**圆角方形**（类似微信），不是圆形；头像与气泡顶部对齐；
- 连续同一发送者消息合并显示，只在组首显示头像；
- 时间分隔符居中显示（“今天 14:32”“昨天”“11月17日”）；
- 系统消息居中灰字（“咨询已开始”“会话已生成总结”）；
- AI 正在输入时显示三点跳动的气泡，流式输出时文字带光标；
- 桌面端最大阅读宽度约 760px；手机端全屏、底部输入栏贴安全区。

### 3.2 页面结构

**桌面端（≥1024px）**：

```
┌──────────────┬──────────────────────────────┬─────────────┐
│ 会话列表      │ 聊天区                        │ 本次会话     │
│ - 新对话      │ 顶部：AI 头像 + 名称 + 边界提示  │ - 当前阶段   │
│ - 历史会话    │ 消息流（气泡）                 │ - 本次目标   │
│ - 我的记忆    │ 底部：输入框 + 结束并总结 + 求助 │ - 行动计划   │
└──────────────┴──────────────────────────────┴─────────────┘
```

**手机端**：

- `/chat` 首屏是会话列表（像微信聊天列表）；
- 点进会话后全屏聊天，顶部返回；
- “本次会话”信息收进顶部抽屉；
- 输入框固定在底部，键盘弹起不遮挡。

### 3.3 交互细节

- Enter 发送，Shift+Enter 换行；发送按钮在输入内容时出现；
- 发送后立即显示用户气泡（乐观更新），失败可重试；
- 流式回复自动滚动到底部；用户手动上滑后暂停自动滚动，并出现“回到最新”按钮；
- 支持 Markdown（加粗、列表、引用），禁用原始 HTML，防 XSS；
- 每条 AI 消息底部有“复制”和“这不像你/重新说”轻量操作（MVP 可只做复制）；
- 会话结束插入一张“会话总结卡片”，点击进入 `/summary/[id]`；
- 顶部常驻提示：“AI 心理咨询式对话助手，不是心理医生”；
- 底部常驻“紧急求助”入口（红色但克制）。

### 3.4 验收

- 手机浏览器上单手可完成一次完整对话；
- 气泡、头像、时间、输入栏在 375px 宽度下不溢出；
- 长消息、连续消息、空会话、网络失败、流式中断都有合理状态；
- 视觉上第一眼像微信聊天，但不使用微信商标/图标。

---

## 4. 新增需求三：自选头像

### 4.1 素材方案

- 使用**开源可商用**的插画头像包，优先 DiceBear 的 `lorelei` 风格（CC0），生成 12 个不同人物头像；
- 头像在构建/初始化时生成并保存到 `public/avatars/user-01.svg` … `user-12.svg`，运行时不依赖外网；
- 同时准备 4 个抽象几何头像作为备选；
- 在 `docs/credits.md` 记录素材来源与许可证；
- 不使用真实人物照片、明星照片、微信默认头像，避免肖像权与“真人感”问题。

### 4.2 AI 咨询师头像

- AI 一侧使用**固定的品牌抽象头像**（青绿色圆角方形 + 抽象的“倾听/波纹/叶子”图形），不使用拟人化人脸；
- 目的：降低恋爱化、拟人化依赖风险，同时保持温暖和专业感；
- 如果后续要换，也只换品牌图形，不提供“男友/女友/医生”人设头像。

### 4.3 选择流程

1. 知情同意后进入“选一个头像”步骤；
2. 12 个头像网格展示，点击选中，支持“随机换一个”；
3. 可跳过，默认使用 `user-01`；
4. 头像存入 `User.avatarId`，同时写入本地缓存保证即时显示；
5. `/settings` 或 `/memory` 页可随时更换。

### 4.4 验收

- 首次进入可在 10 秒内完成头像选择；
- 刷新页面后头像保持一致；
- 头像在聊天列表、消息气泡、总结页、记忆页都正确显示；
- 所有头像资源本地可用，断网不影响。

---

## 5. 技术架构

### 5.1 推荐栈

| 层 | 选择 | 说明 |
|---|---|---|
| 前端 | Next.js 15（App Router）+ React + TypeScript + Tailwind CSS | 响应式 Web，SSR/SEO 友好 |
| UI | 自有轻组件（shadcn/ui 风格）+ Lucide 图标 | 避免重型 UI 库，方便做微信式气泡 |
| 后端 | Next.js Route Handlers | MVP 不拆独立后端 |
| 流式 | Vercel AI SDK（`ai`）+ SSE | 打字机效果，服务端持有 Key |
| LLM | OpenAI-compatible API，已接入智谱 GLM-4.5-Flash；可切 DeepSeek/豆包/通义/Kimi | 无 Key 时自动进入 Mock 模式，保证 UI 可完整演示 |
| 数据库 | **SQLite + Prisma（本地 MVP，推荐）**；schema 保持可迁移到 PostgreSQL | 本地零依赖、可直接跑；上线换 `DATABASE_URL` 即可 |
| 认证 | 匿名签名 Cookie（HttpOnly + SameSite=Lax） | MVP 不做邮箱登录；后续可加 Auth.js |
| 加密 | Node `crypto` AES-256-GCM | 消息、摘要、记忆内容加密 |
| 校验 | zod | API 输入、LLM JSON 输出 |
| 测试 | Vitest + Playwright | 单元 + E2E + 安全回归 |
| 代码质量 | ESLint + Prettier + TypeScript strict | CI 必过 |

> 与 `agents.md` 的唯一实质性差异：本地 MVP 先用 SQLite 而不是 PostgreSQL，原因是当前环境没有现成数据库服务，SQLite 能让项目“ clone 即跑”。Prisma schema 不写 SQLite 专有语法，后续可平滑切 PostgreSQL。

### 5.2 目录结构（计划）

```
D:\Counseling Agent\
  agents.md                     # 从规范来源复制，作为项目手册
  PLAN.md
  README.md
  package.json
  next.config.ts
  tsconfig.json
  .env.example
  .env.local                    # 本地密钥，不提交
  prisma/
    schema.prisma
  app/
    page.tsx                    # 落地页
    start/page.tsx              # 知情同意 + 年龄门 + 记忆授权 + 头像选择
    chat/page.tsx               # 会话列表 / 默认最近会话
    chat/[sessionId]/page.tsx   # 聊天页
    summary/[id]/page.tsx       # 会话总结
    memory/page.tsx             # 我的记忆
    about/page.tsx
    privacy/page.tsx
    terms/page.tsx
    crisis/page.tsx
    api/
      session/route.ts
      chat/route.ts
      summary/route.ts
      memory/route.ts
      memory/[id]/route.ts
      health/route.ts
  components/
    chat/
      ChatWindow.tsx
      MessageBubble.tsx
      MessageGroup.tsx
      Composer.tsx
      TypingIndicator.tsx
      ProgressSidebar.tsx
      SessionList.tsx
      SummaryCard.tsx
    consent/
      ConsentGate.tsx
      AgeGate.tsx
      MemoryConsent.tsx
      AvatarPicker.tsx
    layout/
      Header.tsx
      Footer.tsx
      CrisisButton.tsx
      CrisisModal.tsx
    memory/
      MemoryCard.tsx
      MemoryList.tsx
  lib/
    ai/
      orchestrator.ts
      model.ts
      mock.ts
      agents/
        safety.ts
        counselor.ts
        summary.ts
        memory.ts
      prompts/
        safety.md
        counselor.md
        summary.md
        memory.md
    db/
      client.ts
    safety/
      risk-rules.ts
      crisis-resources.ts
      safety-plan.ts
    memory/
      extract.ts
      retrieve.ts
      score.ts
    crypto/
      encrypt.ts
    auth/
      anonymous.ts
    validation/
      schemas.ts
  public/
    avatars/
      user-01.svg ... user-12.svg
      ai-counselor.svg
  tests/
    unit/
    e2e/
    safety/
      cases.json
      run-safety.ts
  docs/
    methodology.md
    safety.md
    privacy.md
    credits.md
```

### 5.3 环境变量

```bash
# .env.example
LLM_PROVIDER=deepseek
LLM_API_KEY=
LLM_MODEL=deepseek-chat
LLM_BASE_URL=https://api.deepseek.com
LLM_MOCK=true                 # 没有 Key 时用 Mock 模式跑完整流程
DATABASE_URL="file:./dev.db"
ENCRYPTION_KEY=               # 32-byte base64，启动时校验
AUTH_SECRET=                  # 匿名 Cookie 签名
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

规则：`.env.local` 永不提交；客户端不出现任何 Key；生产环境用 KMS/密钥管理。

### 5.4 数据模型（Prisma 草案）

```prisma
model User {
  id             String   @id @default(cuid())
  avatarId       String   @default("user-01")
  ageRange       String?
  consentVersion String
  memoryEnabled  Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  sessions       Session[]
  memories       MemoryItem[]
}

model Session {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title          String?
  status         String   @default("active")   // active | completed | crisis | deleted
  stage          String   @default("consent")  // consent|intake|explore|reframe|action|summary|crisis
  riskLevel      Int      @default(0)
  rollingSummary String?                        // 加密
  startedAt      DateTime @default(now())
  endedAt        DateTime?
  messages       Message[]
  summary        SessionSummary?
  memories       MemoryItem[]
}

model Message {
  id            String   @id @default(cuid())
  sessionId     String
  session       Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  role          String                            // user | assistant | system
  contentCipher String                            // AES-256-GCM
  safetyFlags   String?                           // JSON
  memoryRefs    String?                           // JSON: 本次参考的记忆 id
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

model MemoryItem {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category        String   // goal|value|pattern|relationship|coping|progress|preference
  contentCipher   String
  confidence      Float    @default(0.8)
  importance      Int      @default(3)
  sourceSessionId String?
  session         Session? @relation(fields: [sourceSessionId], references: [id], onDelete: SetNull)
  status          String   @default("active")   // active | archived
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  lastUsedAt      DateTime?
}

model RiskEvent {
  id          String   @id @default(cuid())
  sessionId   String
  level       Int
  type        String
  actionTaken String
  createdAt   DateTime @default(now())
}
```

### 5.5 API 草案

```http
POST /api/session
  -> { sessionId, stage }

GET  /api/session/[id]/messages
  -> { messages: [{ id, role, content, createdAt, memoryRefs }] }

POST /api/chat
  body: { sessionId, message }
  response: text/event-stream
    event: meta   { messageId, riskLevel, memoryRefs: [] }
    event: delta  { text }
    event: state  { stage, goals }
    event: crisis { level, resources: [] }
    event: done   { messageId }

POST /api/summary
  body: { sessionId }
  -> { summaryId, summary, newMemories: [] }

GET  /api/memory
PUT  /api/memory/[id]
DELETE /api/memory/[id]

GET  /api/health -> { ok: true }
```

所有输入用 zod 校验；所有输出做 XSS 转义；每会话 token 预算 ≤ 30k。

---

## 6. Agent 与 Prompt 设计

### 6.1 MVP Agent 清单

| Agent | 职责 | 运行方式 |
|---|---|---|
| **SafetyAgent** | 每条消息风险识别与分级；L2/L3 直接触发危机流程 | 规则引擎优先 + LLM 复核模糊案例 |
| **CounselorAgent** | 主对话：共情、探索、重构、行动；内含 intake | 流式 LLM |
| **SummaryAgent** | 生成会话总结、行动计划、转介建议 | 会话结束时调用 |
| **MemoryAgent** | 从对话提取/合并长期记忆 | 每 4 轮或总结时后台调用 |
| **Orchestrator** | 状态机、阶段路由、预算、错误处理 | 服务端函数 |

> 不为了“多 Agent”而多 Agent；SupervisorAgent、PsychoeducationAgent 作为后续拆分。

### 6.2 状态机

```
CONSENT → INTAKE → EXPLORE → REFRAME → ACTION → SUMMARY → CLOSED
   │        │         │          │
   └────────┴─────────┴──────────┴──→ CRISIS（任何阶段）
```

### 6.3 Prompt 文件

- `lib/ai/prompts/*.md`，不写死在代码里；
- CounselorAgent 必须包含：角色、边界、阿德勒骨架、回复规则（先共情、一次一问、具体、鼓励）、安全规则、输出格式；
- SafetyAgent prompt 独立，不能依赖主模型“自觉”；
- 用户输入永远作为 `user` 消息，不拼进 system prompt 指令区；
- 每次改 prompt 必须跑 `test:safety` + `test:evals`。

### 6.4 阿德勒对话检查表（用于 prompt 与评测）

每次回复至少体现以下 2 项：

- 目的论：这个行为/情绪想帮你达到什么？
- 课题分离：哪些是我的课题，哪些是别人的？
- 横向关系：不评判、不居高临下、不替用户做决定；
- 社会兴趣：你愿意为关系/团队做的一小步是什么？
- 鼓励：具体指出已展现的勇气、努力、资源或贡献；
- 虚构目标/私人逻辑：如果……我才是安全的/被爱的/有价值的？

---

## 7. 安全与合规实现

### 7.1 风险分级与处理

| 级别 | 表现 | 处理 |
|---|---|---|
| L0 | 无风险 | 正常咨询 |
| L1 | 被动意念（“活着没意思”“想消失”） | 共情 + 直接询问 + 安全计划 + 资源；降低探索强度 |
| L2 | 主动意念/计划/准备/近期自伤 | 立即危机流程；直接问计划、手段、时间、地点；提供 110/120/12356；不结束对话直到确认安全 |
| L3 | 正在自伤/自杀尝试/立即危险 | 立即引导 110/120；建议附近医院；联系紧急联系人；记录事件 |

### 7.2 实现策略

- **规则引擎**：中文关键词/正则 + 上下文组合判断，覆盖自杀、自伤、伤人、家暴、性侵、精神病性症状、未成年人、医疗请求；
- **LLM 复核**：仅对规则未命中的模糊文本调用 SafetyAgent JSON 分类，避免每条都多一次模型调用；
- **L2/L3 不使用 CounselorAgent**：返回固定危机回应模板 + 资源卡片 + 安全计划，避免模型自由发挥；
- **未成年人**：年龄门 + 文本识别（“我15岁”“我还在上高中”等）→ 停止咨询式对话，引导监护人/学校心理老师/专业机构；
- **审计**：`RiskEvent` 记录级别、类型、处理动作，不记录不必要的原文；
- **测试**：至少 30 个合成安全用例，L2/L3 漏报一票否决。

### 7.3 合规页面

- `/privacy` 隐私政策：收集什么、为什么、存多久、如何删除、第三方处理者；
- `/terms` 用户协议：18+、AI 边界、禁止用途、免责声明；
- `/crisis` 紧急求助：110、120、12356、北京心理危机研究与干预中心 010-82951332、希望24热线 400-161-9995、当地精神卫生中心；
- 页脚常驻“紧急求助”，聊天页顶部常驻 AI 边界提示；
- 对外统一称“AI 心理咨询式对话助手 / 心理自助工具”，不使用“AI 心理医生/治疗师”。

---

## 8. 页面清单与体验

| 路由 | 页面 | 核心内容 |
|---|---|---|
| `/` | 落地页 | 价值主张、适用/不适用、AI 边界、开始按钮、危机资源 |
| `/start` | 开始前 | 3 步知情同意 + 18+ 年龄门 + 长期记忆授权 + 头像选择 |
| `/chat` | 会话列表/最近会话 | 微信式聊天列表 + 新建对话 |
| `/chat/[sessionId]` | 咨询对话 | 气泡消息流 + 输入栏 + 进度侧栏 + 危机入口 |
| `/summary/[id]` | 会话总结 | 主诉、模式、优势、目标、行动、本次记忆、反馈 |
| `/memory` | 我的记忆 | 分类记忆卡片、编辑/删除、暂停、清空 |
| `/about` | 方法论 | 阿德勒 + 多流派说明、边界、顾问信息占位 |
| `/privacy` | 隐私政策 | 数据收集、使用、存储、删除、第三方 |
| `/terms` | 用户协议 | 18+、AI 边界、禁止用途 |
| `/crisis` | 紧急求助 | 热线、急诊、安全计划模板 |

视觉方向：温暖、安静、不花哨；主色深青绿 + 暖白；字体大、行距宽；手机优先；不使用粉色恋爱感配色、不显示“在线人数/依赖式文案”。

---

## 9. 测试与评估

### 9.1 单元测试

- `lib/safety/risk-rules.test.ts`：30+ 条安全用例；
- `lib/crypto/encrypt.test.ts`：加解密、篡改检测；
- `lib/memory/score.test.ts`：重要性/新鲜度/相关度排序；
- `lib/validation/schemas.test.ts`：LLM JSON 输出校验。

### 9.2 E2E（Playwright）

1. 落地页 → 知情同意 → 年龄门 → 选头像 → 进入聊天；
2. 发送消息 → 收到流式回复 → 气泡显示；
3. 结束并总结 → 总结页字段完整；
4. 第二次会话 → AI 引用长期记忆 → 记忆页删除后不再引用；
5. 危机关键词 → 出现危机卡片与热线；
6. 未成年人 → 阻断；
7. 删除会话 → 列表消失、数据库无明文；
8. 375px 手机视口完整流程。

### 9.3 安全回归

- `tests/safety/cases.json` 至少 30 条，覆盖情感、职场、家庭、丧失、被动意念、主动计划、自伤、家暴、性侵、未成年人、示爱、要求诊断、要求开药、prompt injection；
- `pnpm test:safety` 只跑规则引擎，不依赖 LLM，CI 必过；
- 有 API Key 时再跑 `pnpm test:evals` 做 LLM 对话质量评估。

### 9.4 验收命令

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm test:safety
pnpm build
```

---

## 10. 实施阶段（建议按此顺序）

### Phase 0：规划确认（当前）
- 输出本 PLAN.md；
- 确认项目目录、LLM Key、数据库选择；
- 不改代码。

### Phase 1：项目骨架 + 视觉底座 + 静态页（约 1 个工作日）
- 初始化 Next.js + TypeScript + Tailwind + Prisma；
- 设计 tokens（颜色、字体、圆角、间距）；
- 落地页、about、privacy、terms、crisis 静态页；
- 头像资源生成与 credits；
- 知情同意 / 年龄门 / 记忆授权 / 头像选择 UI。

**验收**：页面可访问，手机端排版正常，头像可选。

### Phase 2：聊天界面 + Mock 对话（约 1 个工作日）
- 会话列表 + 聊天页 + 气泡组件 + 输入栏 + 流式打字机 + 进度侧栏；
- Mock LLM：无 Key 也能完整走“同意 → 对话 → 总结”；
- 响应式与空态/错误态。

**验收**：手机浏览器完成一次假数据对话，视觉接近微信。

### Phase 3：数据层 + 真实 LLM + 安全（约 1–1.5 个工作日）
- Prisma/SQLite、匿名 Cookie、AES 加密；
- `/api/session`、`/api/chat`、`/api/summary`；
- SafetyAgent 规则引擎 + CounselorAgent prompt + 流式输出；
- SummaryAgent + 总结页；
- 危机流程与资源页。

**验收**：真实 Key 下能完成一次流式咨询对话并生成总结；危机用例触发正确。

### Phase 4：长期记忆（约 1 个工作日）
- MemoryItem 表 + MemoryAgent 提取 + 记忆召回；
- `/memory` 页面 + 会话结束“本次记忆”确认；
- 记忆开关、编辑、删除、清空；
- 第二次会话引用记忆的 E2E。

**验收**：跨会话记忆可感知、可控制、可删除。

### Phase 5：测试、打磨与交付（约 1 个工作日）
- 30+ 安全用例 + 单元测试 + Playwright E2E；
- 文案审校（去诊断化、去治疗化、去恋爱化）；
- README、`.env.example`、启动脚本；
- 真机/手机视口检查、截图；
- 最终构建与验收。

**总预估**：5–6 个工作日；如果只做“可演示原型”，Phase 1–3 约 3 天可看到完整效果。

---

## 11. MVP 验收指标（本阶段）

- [ ] 手机浏览器可完成“同意 → 选头像 → 对话 → 总结 → 删除”全流程；
- [ ] 聊天界面为微信式气泡，用户/ AI 头像正确显示；
- [ ] 长期记忆可跨会话召回，且用户可查看/编辑/删除/关闭；
- [ ] 危机关键词 100% 触发安全流程（30+ 用例零漏报）；
- [ ] 无诊断、药物、疗效承诺、恋爱角色扮演、依赖诱导文案；
- [ ] 未成年人可被阻断；
- [ ] 消息与记忆加密存储，删除后无明文残留；
- [ ] `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build` 全绿；
- [ ] README 能让另一个 agent/开发者 10 分钟内跑起来。

---

## 12. 风险与待确认

### 12.1 风险

| 风险 | 影响 | 缓解 |
|---|---|---|
| 没有可用的 LLM API Key | 无法验证真实对话质量 | Mock 模式保证全流程可跑；Key 到位后切真实模型 |
| 安全规则误报/漏报 | 高风险 | 规则 + LLM 复核 + 30 条回归用例；上线前临床审阅 |
| 长期记忆存了不该存的敏感信息 | 隐私/合规 | 白名单类别 + 过滤 + 用户可见可删 + 加密 |
| 微信式 UI 被误认为社交/恋爱产品 | 边界风险 | 克制的青绿配色、AI 抽象头像、去恋爱化文案 |
| SQLite 与生产 PostgreSQL 差异 | 迁移成本 | Prisma schema 不使用 SQLite 专有特性，预留切换 |
| 头像素材许可证 | 版权 | 只用 CC0/MIT 素材，记录 credits |

### 12.2 已确认的决策（2026-11-17）

1. **项目目录**：`D:\Counseling Agent`（当前工作区）；把 `agents.md` 复制过来作为项目手册。
2. **LLM 接入**：先用 **Mock 模式**跑通完整流程，真实 API Key 后补；代码保留 OpenAI-compatible 真实接入。（2026-11-19 已接入智谱 GLM-4.5-Flash）
3. **数据库**：**SQLite + Prisma**，schema 保持可迁移到 PostgreSQL。
4. **长期记忆默认值**：**默认关闭，用户在知情同意页单独开启**。
5. **产品名**：界面暂用“心理咨询Agent”，对外副标题“AI 心理咨询式对话助手”；消费级名字后续再定。

---

## 13. 下一步

确认以上 5 个决策后，按 Phase 1 → Phase 5 开始实现。第一个里程碑：**手机浏览器上完成一次“同意 → 选头像 → 对话 → 总结 → 删除”的完整流程，且安全测试通过。**

---

## 14. 实施状态（2026-11-17）

已按确认后的方案完成 MVP：

- [x] Next.js 15 + TypeScript + Tailwind + Prisma/SQLite 项目骨架；
- [x] 落地页、`/start` 知情同意 + 18+ 年龄门 + 头像选择 + 长期记忆开关；
- [x] 微信式聊天气泡、流式回复、时间分隔、固定 AI 品牌头像、12 个自选插画头像；
- [x] 匿名 Cookie、AES-256-GCM 消息/记忆加密；
- [x] SafetyAgent 规则引擎 + 危机资源 + 未成年人阻断 + 医疗转介；
- [x] SummaryAgent 会话总结页；
- [x] MemoryAgent 提取、召回、`/memory` 查看/编辑/删除/暂停/清空；
- [x] `/about`、`/privacy`、`/terms`、`/crisis` 页面；
- [x] 51 条安全用例、单元测试、Playwright E2E；
- [x] `pnpm typecheck`、`pnpm test`、`pnpm build`、`pnpm lint` 通过。

启动方式见 `README.md`；当前已接入智谱 GLM-4.5-Flash（真实模型），`.env` 中可切换回 Mock 模式；完整流程已通过真实模型与 Playwright E2E 验证。
