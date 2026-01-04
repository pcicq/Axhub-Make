# 主题生成规范（Design Tokens + 演示页）

本文档约束“主题”的生成产物与实现方式，供 AI 在用户提供任意形式输入（token、设计规范文档、截图、样式提取结果等）时，稳定产出可用的主题文件与演示页面。

## 🎯 交付物

每个主题必须且仅需生成 2 个文件：

```
src/themes/<theme-key>/
├── designToken.json  # 主题 Token（必需）
└── index.tsx         # 主题演示页（必需）
```

约束：
- `<theme-key>` 使用 `kebab-case`（如 `antd`、`my-brand`、`dark-pro`）
- 不要在 `src/themes/<theme-key>/` 下额外创建其它文件（除非用户明确要求）

## 1) `designToken.json` 规范

### 1.1 必须字段

- `name`：主题名称（必需，字符串，用于 UI 展示与演示页标题）

推荐字段：
- `description`：主题描述（字符串）

### 1.2 结构要求

- 若用户已提供固定格式（例如分层结构或扁平结构），则保留用户格式
- 允许包含大量 token（颜色、字体、间距、圆角、阴影、动效、断点等）
- token key 建议按语义命名（如 `colorPrimary`、`colorTextSecondary`、`borderRadius`、`boxShadow` 等），但不是强制

### 1.3 值类型与格式

- 颜色：`#RRGGBB` / `#RGB` / `rgba(...)` / `hsla(...)` / `transparent`
- 尺寸：数值（如 `fontSize: 14`）或带单位字符串（如 `"8px"`），同一主题内保持一致
- 阴影：字符串（如 `"0 6px 16px rgba(...)"`）
- 布尔：`wireframe` 等
- 文本：`fontFamily`、`lineType` 等

### 1.4 最小可用集合（建议）

为了让主题在组件中“开箱即用”，建议至少包含：
- `name`
- `colorPrimary`
- `colorInfo` / `colorSuccess` / `colorWarning` / `colorError`（如能提供）
- `colorTextBase` 或 `colorText`、`colorBgBase` 或 `colorBgContainer`
- `borderRadius`
- `fontFamily`、`fontSize`、`lineHeight`（如能提供）

## 2) `index.tsx`（主题演示页）规范

主题演示页的目标：在 Axhub Make 环境中直观看到主题 token 的内容与效果，同时能作为“主题开发模板”被复用。

### 2.1 基本约束

- 文件必须 `export default Component`
- 使用 `forwardRef` + `useImperativeHandle` 实现 `AxhubHandle`（与其它元素/页面一致）
- 使用 `ConfigProvider` 注入主题 token（从 `designToken.json` 读取）
- 演示页只做展示，不发起任何外部网络请求，不依赖浏览器扩展能力

### 2.2 注入方式

- `ConfigProvider` 的 `theme.token` 必须从 `designToken.json` 读取
- 当某些关键 token 缺失时，必须提供合理默认值（避免页面空白或报错）

推荐注入项：
- `colorPrimary`：优先使用 `designToken.json` 的 `colorPrimary`
- `borderRadius`：优先使用 `designToken.json` 的 `borderRadius`

### 2.3 演示列表的技术规范

演示页应对不同风格的 token 内容具备鲁棒性：

- **自动分组**：根据 key 前缀与规则分组展示（例如 `color*`、`font*`、`padding*`、`margin*`、`borderRadius*`、`boxShadow*`、`motion*`、`screen*`）
- **颜色识别**：仅当 value 是颜色值时才进入色块展示；非颜色值用“键值行”展示
- **色阶排序**：对于 `blue-1..10` / `blue1..10` 这类 token，按数字顺序排列
- **安全渲染**：所有 token 值以纯文本展示，避免将用户输入当成可执行内容
- **性能约束**：展示逻辑应为纯前端计算，不做大体量 DOM 递归解析

### 2.4 UI 展示建议（不强制）

- 顶部展示：`name`、`description`
- Colors：
  - 基础色：`blue/purple/...`（若存在）
  - 语义色：所有 `color*` 且值为颜色的 token
  - 色阶：按色系分组展示 `*-1..10`
- Typography：`fontFamily/fontSize*/lineHeight*/fontWeightStrong`
- Spacing & Sizing：`padding* / margin* / size* / control*`
- Radius：`borderRadius*`
- Shadows：`boxShadow*`
- Others：`motion*`、`lineWidth*`、`zIndex*`、`screen*` 等

## 3) 输入来源与生成策略

用户输入可能包含：
- 直接给 token（完整或不完整）
- 设计规范文档（文字说明、表格、品牌规范）
- 页面截图（视觉稿）
- 样式提取结果（CSS/JSON、颜色列表、字号/间距统计等）
- 需求描述

生成策略（按优先级）：

1. **用户直接提供 token**：优先原样保留 key 与值，只做必要的格式纠错与补全 `name`
2. **规范文档**：抽取并映射到 token（优先映射到语义 token，如 `colorPrimary`、`colorTextSecondary` 等）
3. **截图/视觉信息**：提取主色、背景色、文本色、圆角、阴影风格，生成合理的最小可用集合，再补充细节 token
4. **样式提取**：直接使用统计结果填充（字号/行高/间距/色板），并合并去重

必须注意：
- 无论输入来源如何，最终 `designToken.json` 都必须包含 `name`
- 当信息不足时，先保证主题“可用”，再逐步补齐 token（避免产出不可运行的主题）

## 4) 开发后验收流程

### 4.1 运行验收脚本

```bash
node scripts/check-app-ready.mjs /themes/[主题名]
```

脚本返回 JSON 格式结果，包含 `status`、`url`、`homeUrl`、`errors` 等字段。

### 4.2 根据状态处理

**状态为 ERROR**：根据 `errors` 字段中的错误信息直接修复代码，修复后重新运行验收脚本。

**状态为 READY**：使用 Chrome DevTools MCP（或 Playwright MCP）访问 `url` 进行功能验收，检查控制台是否有错误。如模型支持视觉能力，可使用 `take_screenshot` 检查主题展示效果。如有错误或功能不符合预期，**此时才需要阅读 `debugging-guide.md` 进行自动化调试和修复**
