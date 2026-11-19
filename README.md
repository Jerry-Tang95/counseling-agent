# 心屿 · 心理咨询Agent（MVP）

以阿德勒心理学为骨架、整合人本 / CBT / DBT / 存在主义视角的 **AI 心理咨询式对话助手**。

> 这不是心理医生，不做诊断、治疗、开药，不能替代专业帮助。当前为内部原型，正式上线前必须由持证心理咨询师/精神科医师审阅。

---

## 现在能做什么

- 18+ 年龄门 + 三步知情同意；
- 微信式聊天气泡（左右气泡、时间分隔、圆角方形头像、流式打字机）；
- 顶部常驻返回主页 / 对话列表导航；
- 对话列表支持重命名、删除对话；
- 自选头像（12 个开源插画头像 + 固定 AI 品牌头像）；
- 阿德勒式结构化对话：说清楚 → 看见模式 → 换个角度 → 带走行动；
- SafetyAgent 每条消息风险识别：L0–L3 分级、危机资源、未成年人阻断、医疗转介；
- 会话总结：主诉、模式、优势、目标、本周小行动；
- 会话反馈：有帮助 / 安全边界评分 + 文字反馈，写入数据库用于后续改进；
- **长期记忆**：默认关闭、单独开启、跨会话召回、查看/编辑/删除/清空；
- 隐私页面、用户协议、紧急求助页；
- SQLite + Prisma 本地零依赖运行；当前已接入智谱 GLM-4.5-Flash，断网或没 Key 时可切回 Mock 模式。

> 记忆的写入判断、去重、冲突处理与检索策略详见 [docs/memory.md](docs/memory.md)。

---

## 快速开始

环境要求：Node.js ≥ 20，pnpm（当前项目使用 `corepack pnpm`）。

```bash
# 1. 安装依赖（首次需要允许 Prisma / esbuild 的构建脚本）
corepack pnpm install

# 2. 配置环境变量
copy .env.example .env
# 生成 ENCRYPTION_KEY（32 字节 base64）和 AUTH_SECRET
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('AUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# 3. 初始化数据库
corepack pnpm db:setup

# 4. 启动
corepack pnpm dev
```

打开 http://localhost:3000。

> 首次使用需要完成「18+ 年龄确认 → 知情同意 → 头像选择」3 步；完成一次后，之后点击「开始对话」会直接进入对话列表，不再重复确认。若未来隐私政策/用户协议版本更新，会只针对变更部分重新征得同意。

### Windows 一键启动

直接双击项目根目录的 `启动心屿.bat`：

- 会自动检查依赖、数据库和构建产物；
- 服务就绪后自动打开浏览器；
- 关闭弹出的终端窗口即可停止服务。

> 该脚本默认使用生产模式（`next start`），适合日常使用；如果你正在改代码，请用 `corepack pnpm dev` 以便热更新。

### 接入真实 LLM

项目默认 `LLM_MOCK=true`，用于完整演示 UI、记忆与安全流程。当前已配置智谱 GLM（`glm-4.5-flash`）真实接入，配置示例：

```bash
LLM_MOCK=false
LLM_PROVIDER=zhipu
LLM_API_KEY=你的智谱 API Key
LLM_MODEL=glm-4.5-flash
LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
LLM_THINKING=disabled   # 智谱 GLM 关闭思考链，降低首字延迟
```

任何 OpenAI-compatible 服务都可以通过 `LLM_BASE_URL` / `LLM_MODEL` 切换。API Key 只在服务端使用，不会进入客户端 bundle。

> 智谱免费额度模型：`glm-4-flash`、`glm-4.5-flash` 可直接用；`glm-4.7`/`glm-5.x` 等模型需要账户有对应资源包。接口返回 `余额不足或无可用资源包` 时，先到智谱控制台充值/领取资源包。

---

## 常用命令

```bash
corepack pnpm dev          # 本地开发
corepack pnpm build        # 生产构建
corepack pnpm start        # 生产启动
corepack pnpm lint         # ESLint
corepack pnpm typecheck    # TypeScript strict
corepack pnpm test         # 单元测试 + 安全回归
corepack pnpm test:safety  # 仅安全用例
corepack pnpm test:e2e     # Playwright（需本地 dev server）
corepack pnpm db:setup     # Prisma generate + db push
```

---

## 页面

| 路由 | 说明 |
|---|---|
| `/` | 落地页：定位、边界、方法论、隐私、危机入口 |
| `/start` | 18+ 年龄门、知情同意、长期记忆授权、头像选择 |
| `/chat` | 对话列表（微信式聊天列表） |
| `/chat/[sessionId]` | 聊天页：气泡消息流、流式回复、顶部导航、无任务阶段栏 |
| `/summary/[id]` | 会话总结与“这次记住的内容” |
| `/memory` | 长期记忆管理：查看、编辑、删除、暂停、清空 |
| `/about` | 方法论、理论底座、明确不能做的事 |
| `/privacy` `/terms` | 隐私政策、用户协议（MVP 草案） |
| `/crisis` | 紧急求助资源、安全计划模板 |

---

## 技术结构

- **Next.js 15 App Router + React 19 + TypeScript + Tailwind CSS**
- **Prisma 6 + SQLite**（schema 可迁移到 PostgreSQL）
- **AES-256-GCM** 加密消息与记忆内容
- **匿名签名 Cookie** 识别用户，不做邮箱/手机号收集
- **SSE 流式输出**，Mock / 真实 OpenAI-compatible 两种模式
- 独立 **SafetyAgent 规则引擎**，不依赖主模型自觉
- 长期记忆：MemoryAgent 提取 → 置信度过滤 → 去重合并 → 按重要性/新近性/相关度召回

```text
app/
  api/              consent, chat, summary, memory, session, health
  chat/ summary/ memory/ start/ about/ privacy/ terms/ crisis/
components/
  chat/ consent/ memory/ summary/ layout/ avatars/
lib/
  ai/               orchestrator/model/mock/prompts
  safety/           risk-rules, crisis-resources
  memory/           service, score
  crypto/ auth/ db/ validation/
prisma/schema.prisma
tests/               unit, safety, e2e
docs/               methodology, safety, credits
public/avatars/     12 个 CC0 插画头像 + AI 品牌头像
```

---

## 长期记忆（重点）

1. 知情同意页单独开关，**默认关闭**；
2. 会话结束后 `MemoryAgent` 提取目标、价值观、模式、重要关系、有效应对、进展、偏好；
3. 低置信度（<0.7）不自动写入；过滤诊断标签、危机细节、身份敏感信息；
4. 新会话开始前按重要性 × 新近性 × 相关度召回 Top 8–12 条，注入 `MEMORY_CONTEXT`；
5. 每条记忆可在 `/memory` 查看、编辑、删除；可暂停或清空全部；
6. 消息和记忆内容均加密存储。

---

## 安全与合规

- L2/L3（主动自杀意念、计划、正在自伤/伤人）直接进入危机流程，**不使用 CounselorAgent 自由发挥**；
- 未成年人识别后停止咨询式对话，引导监护人/学校心理老师/12356；
- 医疗请求（诊断、开药、剂量、停药）只做转介与问题清单，不提供医疗建议；
- 30+ 条安全回归用例，`pnpm test:safety` 零漏报；
- 隐私政策、用户协议、危机资源页三件套齐全；
- **正式上线前**：持证心理咨询师/精神科医师审阅 + 适用备案/算法登记/安全评估。

紧急资源：110（报警）/ 120（急救）/ 12356（全国心理援助热线）/ 010-82951332（北京心理危机研究与干预中心）/ 400-161-9995（希望24热线）。

---

## 头像与素材

- 用户头像：DiceBear **Lorelei** 风格，作者 Lisa Wischofsky，**CC0 1.0**，已本地化到 `public/avatars/`；
- AI 头像：项目自绘 SVG，未使用真人照片或明星肖像；
- 详见 [docs/credits.md](docs/credits.md)。

---

## 已知边界（MVP）

- 没有真实临床顾问审阅，不能对外正式运营；
- 原始消息 30 天自动清理尚未做定时任务，只在文档与产品说明中承诺；
- 没有邮箱登录/多设备同步，清除 Cookie 会失去会话；
- 没有语音、3D、虚拟人、恋爱/性角色扮演；
- 真实 LLM 接入需自行申请 Key 并遵守服务商条款与中国内地适用法规。
