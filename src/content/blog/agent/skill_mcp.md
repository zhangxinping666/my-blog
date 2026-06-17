---
title: 从 Function Call 到渐进式 Skill：大模型能力扩展范式的演进与落地实践
link: skill_mcp
catalog: true
date: 2025-01-05 13:00:00
description: 从 Function Call 到渐进式 Skill：大模型能力扩展范式的演进与落地实践
tags:
  - MCP
  - Function Call
categories:
  - [MCP,Function Call]
---


## 一、前置概念：大模型能力扩展的三种范式

在给大模型"装上双手"这件事上，业界先后出现了三种主流范式：`Function Call`、`MCP` 以及 Anthropic 推出的 `Skill`。它们解决的是同一个问题——如何让模型调用外部世界——但思路截然不同。

### 1.1 Function Call（函数调用）

`Function Call` 是最早被 OpenAI 规范化的能力。其本质是：
- 将一组函数的 `JSON Schema` 一次性写入 `system prompt` 或 `tools` 字段
- 模型推理时，从这份 Schema 中挑出要调用的函数，并生成参数
- 运行时执行函数，将结果回注到对话中

它的工作假设是"**所有能力必须前置地、完整地暴露给模型**"。当工具数量达到几十上百时，仅工具定义本身就可能吃掉数千甚至上万 token，且大量无关工具会对路由决策造成噪声干扰。

### 1.2 MCP（Model Context Protocol）

`MCP` 是 Anthropic 提出的工具调用**协议层**抽象。它解决的是"工具供给侧"的标准化问题：
- 以 `server / client` 架构统一工具发现、参数定义、结果返回
- 一个 MCP Server 可以同时被多个 Host 复用
- 把"工具长什么样"从应用代码里抽离出去

然而 `MCP` 并没有改变模型消费工具的方式——工具描述**仍然需要进入上下文**。MCP 解决了"工具从哪来"，但没解决"工具太多怎么办"。

### 1.3 Skill（渐进式加载的能力包）

`Skill` 是一种**文件系统驱动**的能力扩展范式，把一个能力封装为一个带 `SKILL.md` 的目录，核心思想是"**渐进式披露**（Progressive Disclosure）"：

> 只把识别能力所需的最小元数据放进上下文，真正的指令体和资源在被触发时才按需加载。

Anthropic 官方给出的三级加载模型如下：

| 层级 | 何时加载 | Token 成本 | 内容 |
|---|---|---|---|
| **Level 1: Metadata** | 启动时始终加载 | 约 `100 tokens / skill` | `name` + `description` |
| **Level 2: Instructions** | Skill 被触发时 | `< 5k tokens` | `SKILL.md` 正文 |
| **Level 3: Resources** | 按需 | 视情况几乎无限 | 引用文件、脚本、模板 |

这种三层结构让一个 Agent 可以"知道自己有 100 项能力，但只带一项能力的重量"。

---

## 二、渐进式 Skill 的核心价值

### 2.1 上下文预算友好

传统 `Function Call` 会把 N 个工具的 `schema` 全部塞入 prompt。在多能力系统中，工具描述本身就会挤占生成预算，并且大量无关工具在 `tool picking` 阶段充当噪声。

`Skill` 只在启动时加载 `name + description`，一个技能大约只占 `100 tokens`。即使系统挂载了 50 个技能，路由上下文也稳定在 `5k tokens` 以内，远低于一组全量 `tools` 的 schema 体量。

### 2.2 能力边界天然隔离

每个 Skill 是一个独立目录，它拥有：
- 自己的 `allowedTools`：不会污染全局工具池
- 自己的 `systemPrompt`：写死领域规则、硬约束、输出风格
- 自己的 `executor` 类型：决定用 `fixed_pipeline` 还是 `planner` 还是 `tool_loop`
- 自己的 `references` / `scripts`：领域私有资产

这意味着一个技能失控不会把别的技能拖下水，也不会让别的技能的硬规则被泛化进来。

### 2.3 声明式 + 可热更新

`SKILL.md` 是一份 Markdown 文件：前端的 `frontmatter`（`YAML`）是元数据契约，后面的正文是喂给 LLM 的指令体。这意味着：
- **产品/领域专家**可以直接改 SKILL.md，不需要碰 TS 代码
- 改完重启即可，不需要改 Schema、改 Registry、改 Router
- 同一份文件既能被机器（loader）读，也能被人（PM / QA）审

---

## 三、SKILL.md 里应该有什么

一个生产级 Skill 不是把一段 prompt 丢进 Markdown 这么简单。以`task-management` 为例，它的 `SKILL.md` 包含如下要素：

### 3.1 标准元数据（Anthropic 规范）

```yaml
---
name: task-management              # 必填，lowercase + hyphen
description: 任务增删改查、状态变更、列表查询、批量删除/修改
---
```

`name` 是路由唯一键，`description` 是路由判定依据。官方对 `description` 的要求是 **"同时说明这个 skill 做什么 + 什么时候应该用它"**——这一句话直接决定了 Router 在大模型眼里的命中率。

### 3.2 项目扩展的 `x-runtime` 运行时契约

仅官方字段不足以驱动复杂的多执行器系统，在 `x-runtime` 命名空间下扩展了一组运行时字段（符合 YAML 自定义字段惯例，不破坏官方兼容性）：

```yaml
x-runtime:
  executors: [managed_action, autonomous_loop]   # 本 skill 支持的执行器
  defaultExecutor: managed_action                # 默认执行器
  escalation:
    allowAutonomous: true                        # 允许升级到自主循环
    allowSupervisor: true                        # 允许升级到督导模式
  allowedTools:                                  # 白名单工具（不污染全局）
    - queryTasks
    - createTask
    - bulkDeleteTasks
    # ...
  contextInjection:                              # 声明需要哪些上下文切片
    - page-context-summary
    - object-memory-summary
  references:
    preload: []                                  # 启动时预加载资源（Level 2）
    lazy: []                                     # 按需加载资源（Level 3）
  scripts:
    pipeline: null                               # 固定管线实现（可选）
    planner: null                                # 规划器实现（可选）
  autonomousLoop:
    maxToolCalls: 6                              # 单 skill 工具调用预算
    allowReferenceRead: true
```

这一层扩展把"**能力声明**"和"**运行时策略**"合并在一个文件里：领域专家声明规则，框架根据声明自动装配执行路径。

### 3.3 正文（喂给 LLM 的指令体）

SKILL.md 正文承担的角色类似"**新员工入职手册**"。以 `task-management` 为例，真实落地的章节包括：

- **可用工具清单**：每个工具一句话说明，降低 LLM 猜参数的概率
- **任务定位规则**：如何从 `taskId` / `ordinal` / `pronoun` / `selectedEntity` 消解引用
- **序号引用硬规则**：当 `<object_memory>` 存在候选列表时的绝对优先级
- **查询参数组合规则**：自然语言 → 结构化参数的确定性映射
- **创建/更新/删除**：每类高风险操作的具体触发条件与反抗模式（避免擅自解释）
- **批量操作的 `TaskSetSpec` 协议**：定义 `target.kind` 的所有合法取值
- **展示风格与安全红线**：禁止暴露数据库 ID、禁止暴露内部工具名

这种写法的关键：**不是描述"这个 skill 做什么"，而是描述"遇到 X 场景应该怎么做"**——是规则书，不是说明书。

### 3.4 模板变量

正文允许内嵌运行时变量，比如 `{{today}}` 会被 loader 在读取时替换为当天日期，`<page_context>\n{{contextSummary}}\n</page_context>` 会被替换为运行时注入的当前页上下文。这让 SKILL.md 保持静态文件的优点，同时具备一定的动态能力。

### 3.5 可选资源

- `reference.ts`：本 skill 专属的引用消解逻辑（如 `resolveTaskReference`）
- `tools.ts`：本 skill 专属工具的定义 + `registerTool()` 注册
- `pipeline.ts`：`fixed_pipeline` 执行器的实现（如 `weekly-report` 的 `gather → aggregate → template → polish`）
- `planner.ts`：`planner` 执行器的实现（如 `task-decompose`）

---

## 四、渐进式 Skill 实现

官方文档里的 Skill 是一个**面向 Claude 自身的机制**（Claude 在 VM 里用 bash 读 SKILL.md）。做的是**把这个思想内化到自研 Agent 运行时**里：不依赖 Claude 端的实现，而是自己实现 loader + 三级缓存 + 四种执行器的调度。

### 4.1 三级缓存

```ts
const metaCache      = new Map<string, SkillMeta>()         // Level 1
const activatedCache = new Map<string, SkillDefinition>()   // Level 2
const scriptRegistry = new Map<string, { pipeline?, planner? }>()  // Level 3
```

- `metaCache`：进程启动时扫描 `skills/*/SKILL.md`，只解析 `frontmatter` 的 `name + description`，供 `Router` 做意图判定
- `activatedCache`：当 Router 选中某个 skill 后，懒解析完整 `SKILL.md`（正文 + `x-runtime`）并缓存
- `scriptRegistry`：`fixed_pipeline` / `planner` 的 TS 实现函数，由各 skill 的 `index.ts` 在启动时调 `skillLoader.registerScript()` 主动注册（Markdown 无法 export 函数，这是必要的 side-channel）

### 4.2 init：只读元数据，不读正文

```ts
init(): void {
  for (const dir of readdirSync(skillsDir, { withFileTypes: true })) {
    const mdPath = join(skillsDir, dir.name, 'SKILL.md')
    const { data } = matter(readFileSync(mdPath, 'utf-8'))
    metaCache.set(data.name, { name: data.name, description: data.description, filePath: mdPath })
  }
}
```

启动阶段只做"**扫目录 + 解 frontmatter**"。10 个 skill 的元数据大约只占 `~1k tokens`。

### 4.3 activate：懒加载 + 策略装配

```ts
activate(capability: string): SkillDefinition | undefined {
  if (activatedCache.has(capability)) return activatedCache.get(capability)

  const { data, content } = matter(readFileSync(meta.filePath, 'utf-8'))
  const body = replaceTemplateVars(content.trim())

  const tools       = resolveTools(data['x-runtime'].allowedTools ?? [])
  const defaultMode = executorToMode(data['x-runtime'].defaultExecutor)
  const buildPrompt = body.includes('<page_context>')
    ? (ctx) => body.replace(/<page_context>\n\{\{contextSummary\}\}\n<\/page_context>/g, `<page_context>\n${ctx}\n</page_context>`)
    : (ctx, mem) => composePrompt(body, ctx, mem)

  const def: SkillDefinition = {
    name: data.name,
    tools,
    buildPrompt,
    runPipeline:     scriptRegistry.get(capability)?.pipeline,
    runPlanWorkflow: scriptRegistry.get(capability)?.planner,
    defaultMode,
    toolRisks: Object.fromEntries(data['x-runtime'].allowedTools.map(n => [n, getToolRisk(n)])),
    maxToolCalls: data['x-runtime'].autonomousLoop?.maxToolCalls ?? 8,
  }
  activatedCache.set(capability, def)
  return def
}
```

`activate()` 只在路由命中后被调用。一次请求通常只会激活 1~2 个 skill，因此 Level 2 的加载量恒定、可预测。

### 4.4 与 Router、Supervisor 的协作

- **Router**：只用 `skillLoader.getAllMeta()`，看到 7 个能力的 `name + description`，判定意图 → 吐出 `capability`
- **Dispatcher**（supervisor 子图）：调 `skillLoader.activate(capability)` 拿到完整 `SkillDefinition` → 进入 `managed_action` / `autonomous_loop` / `fixed_pipeline` / `planner` 之一
- **Tool Registry**：`allowedTools` 是一层白名单，LangChain 工具实例在全局注册表中按名解析，保证 skill 间工具不串位

这是一条标准的"**上下文做减法、运行时做加法**"的链路。

---

## 五、渐进式 Skill vs Function Call vs MCP

在铺垫完基础概念与实现之后，三者的差异变得清晰：

| 维度 | `Function Call` | `MCP` | `渐进式 Skill` |
|---|---|---|---|
| **关注点** | 单次工具调用协议 | 工具供给侧标准化 | 能力封装 + 按需加载 |
| **上下文代价** | 所有工具 schema 常驻 | 工具 schema 仍需常驻 | 只有 `name+description` 常驻 |
| **多能力扩展成本** | O(n) token 线性增长 | O(n) token 线性增长 | O(n) 元数据 + 按需 O(1) 正文 |
| **能力隔离** | 弱（全局工具池） | 弱（服务端隔离，但模型侧仍混合） | 强（白名单 + 专属 prompt） |
| **声明式程度** | 低（代码定义 schema） | 中（服务端声明） | 高（Markdown + frontmatter） |
| **热更新友好度** | 需改代码 + 重部署 | 需改 Server | 改 Markdown 即可 |
| **执行策略绑定** | 无 | 无 | 有（`defaultExecutor`、`maxToolCalls`） |
| **领域规则承载** | 只能塞进 system prompt | 只能塞进 system prompt | 天然位于 SKILL.md 正文 |

### 5.1 Skill 不是 Function Call 的替代，而是"上位结构"

`Function Call` 解决的是"**模型怎么开口调用一个函数**"，这是**执行层**。
`Skill` 解决的是"**这个函数属于哪个能力、什么时候该上、该带什么规则**"，这是**组织层**。

在实际链路里，**两者共存**：
- 路由阶段用 `Skill` 的 `description` 判能力（渐进式披露的关键价值）
- 执行阶段用 `LangChain StructuredTool`（本质上仍是 Function Call）调用具体工具
- `SKILL.md` 正文作为 `systemPrompt` 注入，承载了传统 Function Call 中"塞进全局 prompt 就会互相污染"的那部分领域规则

### 5.2 Skill 与 MCP 正交

`MCP` 负责工具供给侧协议统一，`Skill` 负责工具消费侧的**按需组装与规则承载**。一个理想的生态是：
- MCP Server 提供标准化工具
- Skill 负责"**挑选哪些 MCP 工具进哪个能力包**"
- Skill 的 `description` 负责"**让模型只在合适的时候加载自己**"

两者在层级上互补而非替代。

