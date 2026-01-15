# AI Studio 项目转换助手规范

本文档定义了如何将 Google AI Studio 生成的 React 项目转换到 Axhub Make 原型系统的工作流程。

## 🎯 核心目标

将 AI Studio 生成的零配置 React 应用快速转换为 Axhub 页面组件，保持视觉效果和功能，符合 Axhub 开发规范。

## 🚀 使用方式

### 步骤 1: 运行预处理脚本

```bash
node scripts/ai-studio-converter.mjs <ai-studio-project-dir> [output-name]

# 示例
node scripts/ai-studio-converter.mjs "temp/my-ai-studio-project" my-page
```

**脚本会自动完成**：
- 完整复制 AI Studio 项目到 `src/pages/[页面名]/`
- 分析项目结构（Import Map、自定义样式、依赖等）
- 生成 AI 工作文档（`.ai-studio-tasks.md`）
- 生成详细数据（`.ai-studio-analysis.json`）
- **不修改任何代码**（100% 安全）

### 步骤 2: AI 完成智能转换

脚本会生成 `.ai-studio-tasks.md` 文件，包含：
- 项目概况统计
- 5 个具体任务清单
- Import Map 依赖映射
- 环境变量配置提示
- 验收测试步骤

AI 根据任务清单和本文档的规范示例，完成所有转换工作。

---

## � 转换要点

### AI Studio 项目特征

**典型目录结构**:
```
ai-studio-project/
├── assets/                 # 静态资源（可选）
├── components/             # UI 组件
├── App.tsx                 # 主应用组件
├── index.tsx               # React 挂载入口
├── index.html              # HTML 模板（Import Map + Tailwind CDN）
├── constants.ts            # 常量定义（可选）
├── types.ts                # 类型定义（可选）
├── vite.config.ts          # Vite 配置（可选）
└── metadata.json           # 项目元数据（可选）
```

**技术栈**:
- **框架**: React 19（Function Components + Hooks）
- **语言**: TypeScript
- **模块**: Native ESM（Import Map，通常是 esm.sh CDN）
- **样式**: Tailwind CSS（CDN Runtime Mode）
- **图标**: Lucide React
- **配置**: Vite（如果有 vite.config.ts）

### 关键文件特征

**index.html**：
```html
<script src="https://cdn.tailwindcss.com"></script>
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@19",
    "lucide-react": "https://esm.sh/lucide-react"
  }
}
</script>
<style>/* 可能包含自定义样式 */</style>
<link href="https://fonts.googleapis.com/...">  <!-- 可能包含外部字体 -->
```

### Axhub 组件规范

所有页面组件必须遵循以下格式：

```typescript
/**
 * @name 页面名称
 * 
 * 参考资料：
 * - /rules/development-standards.md
 * - /assets/libraries/tailwind-css.md
 */

import './style.css';
import React, { forwardRef, useImperativeHandle } from 'react';
import type { AxhubProps, AxhubHandle } from '../../common/axhub-types';

const Component = forwardRef<AxhubHandle, AxhubProps>(function PageName(innerProps, ref) {
  useImperativeHandle(ref, function () {
    return {
      getVar: function () { return undefined; },
      fireAction: function () {},
      eventList: [],
      actionList: [],
      varList: [],
      configList: [],
      dataList: []
    };
  }, []);

  // 组件逻辑
  
  return (
    // JSX 内容
  );
});

export default Component;
```

### 转换主应用组件

**AI Studio 原始代码**：
```typescript
// App.tsx
import { useState } from 'react';
import Header from './components/Header';

export default function App() {
  const [count, setCount] = useState(0);
  return <div><Header /></div>;
}
```

**转换为 Axhub 规范**：
```typescript
/**
 * @name 页面名称
 * 
 * 参考资料：
 * - /rules/development-standards.md
 * - /assets/libraries/tailwind-css.md
 */

import './style.css';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import type { AxhubProps, AxhubHandle } from '../../common/axhub-types';
import Header from './components/Header';

const Component = forwardRef<AxhubHandle, AxhubProps>(function PageName(innerProps, ref) {
  const [count, setCount] = useState(0);
  
  useImperativeHandle(ref, function () {
    return {
      getVar: function () { return undefined; },
      fireAction: function () {},
      eventList: [],
      actionList: [],
      varList: [],
      configList: [],
      dataList: []
    };
  }, []);

  return <div><Header /></div>;
});

export default Component;
```

**关键转换点**：
1. 添加文件头部注释（`@name` 和参考资料）
2. 使用 `forwardRef<AxhubHandle, AxhubProps>` 包装
3. 实现 `useImperativeHandle` 暴露 Axhub API
4. 使用 `export default Component`
5. 保持原有的 JSX、Hooks 和 Tailwind 类名不变

### 处理样式

从 `index.html` 提取样式信息，创建 `style.css`：

```css
@import "tailwindcss";

/* 提取 <style> 标签中的自定义样式 */
/* 例如：自定义动画、字体、选择器样式等 */

/* 如果有外部字体，添加 @import */
@import url('https://fonts.googleapis.com/css2?family=...');
```

### 依赖管理

从 `index.html` 的 Import Map 提取依赖：

```bash
cd apps/axhub-make

# 常见依赖：lucide-react, framer-motion 等
# 排除：react, react-dom（Axhub 已有）
pnpm add [识别到的依赖列表]
```

**CDN 到 npm 包映射**：
- `https://esm.sh/lucide-react` → `lucide-react`
- `https://esm.sh/framer-motion` → `framer-motion`
- `https://esm.sh/@google/genai` → `@google/generative-ai`

### 环境变量处理

AI Studio 可能使用 `process.env.*`，需要转换为 `import.meta.env.VITE_*`：
- 检查 `vite.config.ts` 中的 `define` 配置
- 告知用户需要配置的环境变量
- 提供 `.env.local` 示例

### 移除 AI Studio 特定文件

**必须移除**：
- `index.html`（提取信息后删除）
- `index.tsx`（Axhub 有自己的入口）
- `metadata.json`（可选保留作为参考）

---

## ✅ 验收标准

转换完成后运行验收脚本：

```bash
node scripts/check-app-ready.mjs /pages/[页面名]
```

**验收要求**：
- 状态为 READY
- 页面能正常渲染
- 无控制台错误
- 交互功能正常
- 样式显示正确

---

## ⚠️ 常见问题

### 依赖缺失
```bash
# 根据报告中的依赖列表安装
pnpm add [依赖名称]
```

### Import Map 转换
- 检查 `.ai-studio-analysis.json` 中的 CDN 依赖映射
- 确保所有 CDN 依赖已转换为 npm 包

### 样式问题
- 确认 `style.css` 包含 `@import "tailwindcss"`
- 检查 index.html 的 `<style>` 标签是否已提取

### 环境变量
- 将 `process.env.*` 改为 `import.meta.env.VITE_*`
- 配置 `.env.local` 文件

---

## 📚 参考资源

- **开发规范**：`/rules/development-standards.md`
- **调试指南**：`/rules/debugging-guide.md`
- **Tailwind CSS**：`/assets/libraries/tailwind-css.md`

---

## 🔄 详细转换流程（供参考）

### 步骤 1：分析项目结构

脚本会自动扫描识别：
- 主应用：`App.tsx`
- 入口文件：`index.tsx`（需移除）
- HTML 模板：`index.html`（提取依赖和样式信息）
- 组件文件：`components/**/*.tsx`
- 配置文件：`vite.config.ts`（提取路径别名）
- 常量/类型：`constants.ts`, `types.ts`（如果存在）
- 静态资源：`assets/**`

### 步骤 2：调试验收

运行验收脚本，根据结果修复问题。
