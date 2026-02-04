## 项目概述

astro-koharu 是一个从 Hexo 重构的基于 Astro 的博客，设计灵感来自 Shoka 主题。使用 React 构建交互组件，Tailwind CSS 进行样式设计，并保持与旧版 Hexo 博客内容的兼容性。

## 核心工程原则

### 1. 模块优先原则

**每个功能必须实现为具有清晰边界的独立模块。**

- 逻辑组织为专注的、单一职责的模块
- 模块结构：`src/lib/`（工具函数）、`src/hooks/`（React hooks）、`src/components/`（UI 组件）、`src/store/`（状态管理）、`src/constants/`（配置）

### 2. 接口优先设计

**模块必须暴露清晰、最小化的公共 API。**

- 使用桶导出（`index.ts`）定义公共接口
- 导出 TypeScript 类型与实现
- 为复杂函数编写 JSDoc 文档

### 3. 函数式优先方法

**优先使用纯函数而非有状态的类；显式管理副作用。**

- 编写纯函数（相同输入 → 相同输出）
- 在边界处隔离副作用
- 使用 es-toolkit 进行不可变数据转换

### 4. 测试友好架构

**设计代码使其无需 mock 即可测试。**

- 纯函数天然可测试
- 测试优先级：高（lib 工具函数、数据转换）> 中（hooks、状态）> 低（UI 组件）

### 5. 简洁与反过度抽象

**抵制过早抽象；出现三次后再提取模式。**

- 不要为单次使用的场景创建抽象
- 最多 3 层模块嵌套

### 6. 依赖卫生

**谨慎管理依赖；避免循环导入和臃肿。**

- 对大型依赖（>100KB）使用动态导入
- 可选功能使用条件打包
- 禁止循环依赖

## 重要准则

- **文档查询**：使用 Context7 MCP 服务器或 WebSearch 查找官方文档
- **保持 CLAUDE.md 更新**：进行架构更改时请更新此文件
- **完成前运行 lint**：任务完成前必须通过 `pnpm lint:fix`
- **检查死代码**：定期运行 `pnpm knip`

## 开发命令

包管理器：**pnpm**

```bash
# 开发
pnpm dev              # 启动开发服务器 http://localhost:4321
pnpm build            # 生产构建
pnpm preview          # 预览生产构建
pnpm check            # 运行 Astro 类型检查

# 代码检查与质量
pnpm lint             # 运行 Biome 检查器和格式化器
pnpm lint:fix         # 自动修复检查问题
pnpm lint-md          # 检查 src/content/ 中的 Markdown 文件
pnpm lint-md:fix      # 自动修复 Markdown 检查问题
pnpm knip             # 查找未使用的文件/依赖

# Koharu CLI（交互式 TUI）
pnpm koharu              # 交互式菜单
pnpm koharu new          # 创建新内容（文章/友链）
pnpm koharu new post     # 创建带 frontmatter 的新博客文章
pnpm koharu new friend   # 添加新友链到配置
pnpm koharu backup       # 备份博客内容和配置（--full 完整备份）
pnpm koharu restore      # 从备份恢复（--latest、--dry-run、--force）
pnpm koharu update       # 从上游更新主题（--check、--skip-backup、--force、--rebase）
pnpm koharu generate     # 生成内容资产（交互式菜单）
pnpm koharu generate lqips        # 生成 LQIP 图片占位符
pnpm koharu generate similarities # 生成语义相似度向量
pnpm koharu generate summaries    # 生成 AI 摘要（--model、--force）
pnpm koharu generate all          # 生成所有内容资产
pnpm koharu clean        # 清理旧备份（--keep N 保留最近 N 个）
pnpm koharu list         # 列出所有备份
```

**配置更改说明：** 修改 `config/site.yaml` 或 `config/cms.yaml` 后，需重启开发服务器或重新构建。YAML 配置在构建时会被缓存以提升性能。

## 架构

### 技术栈

- **框架**：Astro 5.x + React 集成
- **样式**：Tailwind CSS 4.x + 插件
- **内容**：Astro Content Collections（`src/content/blog/`）
- **动画**：Motion（Framer Motion 继任者）
- **状态**：Nanostores
- **搜索**：Pagefind（静态）
- **工具库**：es-toolkit、date-fns、sanitize-html

### 项目结构

```plain
src/
├── components/   # React 和 Astro 组件
├── content/blog/ # Markdown/MDX 文章
├── layouts/      # 页面布局
├── pages/        # 基于文件的路由
├── lib/          # 工具函数
├── hooks/        # React hooks
├── constants/    # 配置、路由、动画
├── scripts/      # 构建时脚本
├── store/        # 全局状态（nanostores）
└── types/        # TypeScript 类型
```

### 模块组织

**依赖流向**（避免循环依赖）：

```plain
pages/ → components/ → hooks/ → lib/ → constants/
                               ↓
                             types/
```

**文件命名**：

- 桶导出：`index.ts`
- 单导出：文件名匹配（`useMediaQuery.ts`）
- React 组件：PascalCase（`PostCard.tsx`）

**模块大小限制**：

- 每文件最多 500 行
- 每模块最多 15 个公共导出
- 每文件最多 10 个导入

### 路径别名

```plain
@/          → src/
@lib/*      → src/lib/*
@hooks/*    → src/hooks/*
@components/* → src/components/*
@constants/* → src/constants/*
```

### 配置文件

```plain
config/
├── site.yaml    # 主站点配置（标题、社交、导航、评论、统计、特色系列）
└── cms.yaml     # 本地 CMS 配置（VS Code/Cursor/Zed 编辑器 URL）
```

### 核心概念

**内容系统**：博客文章位于 `src/content/blog/`，使用 Astro Content Collections。支持层级分类，如 `'工具'` 或 `['笔记', '前端', 'React']`。

**特色系列**：基于分类的内容系列，有专属页面和首页高亮。通过 `config/site.yaml` 中的 `featuredSeries` 配置。每个系列需要唯一的 `slug`（不能与保留路由冲突）和 `categoryName`。

**评论系统**：支持 Waline（推荐）、Giscus 或 Remark42。通过 `config/site.yaml` 中的 `comment.provider` 配置。

**主题系统**：深色/浅色切换，使用 localStorage 存储，`<head>` 中的内联检查防止 FOUC。

**Markdown 增强**：Shiki 代码高亮、通过 rehype 插件自动生成标题 ID/链接、GFM 支持、链接嵌入、Mermaid 图表、`@antv/infographic` 数据可视化。

## 组件模式

### 组件设计原则

1. **单一职责**：每个组件只做好一件事
2. **Props 接口**：清晰、最小化的 props
3. **组合优于配置**：使用可组合的组件

### UI 组件

- 遵循 **shadcn/ui 模式**，使用 Radix UI 原语
- 使用 **`class-variance-authority` (cva)** 处理变体
- 通过 `src/lib/utils.ts` 中的 `cn()` 合并 Tailwind 类

### Astro vs React

**Astro 组件**（`.astro`）：布局、页面、静态内容（默认不输出 JS）
**React 组件**（`.tsx`）：交互式 UI（状态、事件）

**客户端指令**：

- `client:load` - 关键交互元素（头部、导航、搜索）
- `client:idle` - 低优先级交互（工具提示、模态框）
- `client:visible` - 首屏下方组件（页脚、评论）
- `client:only="react"` - 跳过 SSR（框架特定）

### Astro 脚本初始化

始终处理初始化竞态条件：

```typescript
// ✅ 正确：如果 DOM 已就绪则立即初始化
if (document.readyState !== "loading") init();
document.addEventListener("astro:page-load", init);

// 页面切换时清理
document.addEventListener("astro:before-swap", cleanup);
```

## 代码风格与质量

### 检查与格式化

Biome（行宽：128，单引号，尾随逗号）。Tailwind 类必须排序。

### 前端质量优先级

1. **用户体验**（性能、无障碍、渐进增强）
2. **正确性**（类型安全、边缘情况、错误处理）
3. **可维护性**（清晰的抽象、组件复用）
4. **性能**（包大小、运行时优化）
5. **代码简洁**（简洁但清晰）

### Core Web Vitals 目标

- LCP < 2.5s
- FID/INP < 100ms
- CLS < 0.1

### 错误处理策略

**分层且上下文相关：**

1. **数据层**（`src/lib/`）：返回 `null` 或抛出类型化错误
2. **React 组件**：使用 `ErrorBoundary` 处理组件错误
3. **异步操作**：显式 try-catch 或 `.catch()`
4. **验证**：仅在系统边界处进行

### 性能最佳实践

- 延迟加载大型依赖（>100KB）：`const THREE = await import("three");`
- 不要过早优化 - 先测量
- 仅对昂贵计算使用 `useMemo()`
- 仅在传递给记忆化子组件时使用 `useCallback()`
- 滚动事件使用 `useSyncExternalStore`（参见 `useCurrentHeading`）

### 代码复用模式

1. **纯函数**（`src/lib/`）：使用 2 次以上时提取
2. **React Hooks**（`src/hooks/`）：模式重复 3 次以上时提取
3. **共享类型**（`src/types/`）：使用 3 次以上时提取

### 状态管理最佳实践

**状态提升**：将状态放在最近的公共祖先，避免过度提升。

**派生状态**：优先使用 `const filtered = posts.filter(...)` 而非 `useEffect` 同步。

**不可变性**：始终使用不可变更新：`setUser(prev => ({ ...prev, name: 'Alice' }))`。

**URL 状态管理**：使用 **nuqs** (https://nuqs.dev/) 管理可分享状态（搜索、分页、过滤、标签页）。好处：可分享 URL、可收藏、浏览器导航、SEO 友好。

```typescript
// ✅ 正确：过滤器使用 URL 状态
const [search, setSearch] = useQueryState("q", { defaultValue: "" });
const [category, setCategory] = useQueryState("category");
// URL: /posts?q=react&category=tech（可分享！）
```

对于 Astro 项目，使用原生 `URLSearchParams`：

```typescript
const url = new URL(Astro.request.url);
const search = url.searchParams.get("q") || "";
```

### React 最佳实践

**避免滥用 useCallback**：仅在回调传递给记忆化子组件时使用。

**修复 useEffect 中的循环依赖**：使用 ref 获取最新状态而无需重新订阅。

**避免 useState 存储静态值**：使用常量或 `useMemo` 处理计算值。

**提取自定义 Hooks**：当 `useState` + `useRef` + `useEffect` 模式重复 2 次以上时。

**滚动事件**：使用 `useSyncExternalStore` 而非 `useState` + `useEffect`。

**媒体查询**：使用现有 hooks：`@hooks/useMediaQuery` 中的 `useIsMobile()`、`useMediaQuery()`。

**动画**：动画组件使用 Motion 的 `useReducedMotion()`。

**SSR 水合**：永远不要使用 `suppressHydrationWarning`。客户端专有值使用 `useIsMounted()` hook。

```typescript
// ✅ 正确：避免水合不匹配
const isMounted = useIsMounted();
const isEnabled = useStore(christmasEnabled);
<div className={cn({ 'z-5': isMounted && isEnabled })} />
```

## 测试策略

**严格测试业务逻辑；务实测试 UI。**

**高优先级**：内容工具函数、数据转换、构建脚本
**中优先级**：复杂 React hooks、状态管理
**低优先级**：UI 组件（优先手动测试）

```typescript
// 示例：纯函数测试
describe("getCategoryLinks", () => {
  it("递归返回所有链接", () => {
    const category = {
      name: "笔记",
      link: "/category/notes",
      children: [
        { name: "前端", link: "/category/notes/front-end", children: [] },
      ],
    };
    expect(getCategoryLinks(category)).toEqual(["/category/notes/front-end"]);
  });
});
```

## 开发检查清单

### 开始前

- [ ] 清晰理解需求
- [ ] 检查现有代码中的类似模式
- [ ] 验证无循环依赖

### 实现过程中

- [ ] 遵循模块优先原则
- [ ] 尽可能编写纯函数
- [ ] 严格使用 TypeScript（禁止 `any`）
- [ ] 第三次使用后提取共享逻辑
- [ ] 适当处理错误
- [ ] 使用现有 hooks（`useMediaQuery`、`useIsMounted` 等）

### 组件开发

- [ ] 适当选择 Astro vs React
- [ ] 使用正确的客户端指令
- [ ] 遵循组合模式
- [ ] 用 `ErrorBoundary` 包装交互部分
- [ ] 正确处理 SSR 水合

### 提交前

- [ ] **运行 linter**：`pnpm lint:fix` ✅ 必需
- [ ] 运行类型检查：`pnpm check`
- [ ] 检查未使用的代码：`pnpm knip`
- [ ] 验证构建成功：`pnpm build`

## 常见代码异味

**组件层面**：

- 过大的组件（> 300 行）
- Props 透传超过 3 层 → 使用 Context
- 滥用 useEffect → 使用派生状态

**状态管理**：

- 重复状态 → 单一数据源
- 可分享过滤器缺少 URL 状态 → 使用 nuqs

**性能**：

- 不必要的重渲染 → 需要时添加 memo
- 过早优化 → 先测量
- 大型依赖未延迟加载（> 100KB）

## 常见陷阱

### 1. 循环依赖

将共享逻辑提取到单独文件，而不是在对等模块间互相导入。

### 2. 水合不匹配

客户端专有值使用 `useIsMounted()`，永远不要用 `suppressHydrationWarning`。

### 3. 滥用 useEffect

优先使用派生值：`const fullName = \`${first} ${last}\``而非`useEffect` 同步。

### 4. 过度抽象

模式出现 3 次前保持内联。避免不必要的抽象。

### 5. 与框架紧耦合

保持业务逻辑纯净，框架调用放在边界处。

## 资源

### 文档

- [Astro 文档](https://docs.astro.build/)
- [React 文档](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Motion](https://motion.dev/)
- [Nanostores](https://github.com/nanostores/nanostores)

### 工具

- [Biome](https://biomejs.dev/) - 代码检查器和格式化器
- [Pagefind](https://pagefind.app/) - 静态搜索
- [es-toolkit](https://es-toolkit.slash.page/) - 工具库

### 内部参考

- 核心工具函数：`src/lib/content/`、`src/lib/utils.ts`
- 可复用 hooks：`src/hooks/`
- 动画预设：`src/constants/anim/`
- 站点配置：`src/constants/site-config.ts`
