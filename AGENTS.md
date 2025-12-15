# Agents 工作流程说明

本项目为 **Axhub Runtime** 开发组件和页面，代码运行在 Axure 原型中，目标用户是不会执行命令不会编码的产品经理或者设计师。

## 🧭 工作流程

1. **需求对齐** → 与用户沟通，产出 spec.md
2. **生成代码** → 根据 spec 实现组件/页面
3. **协作调试** → 在用户环境中修复问题

## 📄 详细文档

根据当前工作阶段查看对应文档：

| 阶段 | 文档 | 用途 |
|------|------|------|
| 需求对齐 | `rules/requirements-alignment.md` | 沟通需求，产出 spec |
| 设计实现 | `rules/design-guidelines.md` | 设计规范 |
| 代码开发 | `rules/development-standards.md` | 代码规范 |
| 问题调试 | `rules/debugging-guide.md` | 调试方法 |

## 🎯 关键要点

### 技术栈
- TypeScript（编译为 es2015）
- 构建产物：单个 IIFE 格式 JS 文件

### 项目结构
```
src/
├── common/          # 公共类型和工具
├── elements/        # 原型元素
└── pages/           # 原型页面
```

### 快速参考
- 元素目录：`src/elements/`
- 页面目录：`src/pages/`
- 类型定义：`src/common/axhub-types.ts`
