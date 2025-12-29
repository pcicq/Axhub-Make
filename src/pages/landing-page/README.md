# AI 开发平台落地页

这是一个使用 **Tailwind CSS** 和 **shadcn/ui** 构建的现代化落地页示例。

## 🎯 项目特点

- ✅ **完全使用 Tailwind CSS**：无自定义 CSS 文件，所有样式使用 utility classes
- ✅ **shadcn/ui 组件**：使用 Button 等高质量 React 组件
- ✅ **lucide-react 图标**：现代化的 SVG 图标库
- ✅ **组件化架构**：代码拆分为多个独立组件，易于维护
- ✅ **响应式设计**：完美适配移动端、平板和桌面
- ✅ **Glassmorphism 效果**：现代化的毛玻璃效果
- ✅ **Unsplash 图片**：高质量的真实图片

## 📁 项目结构

```
landing-page/
├── index.tsx                      # 主入口（导出 Component）
├── components/
│   ├── HeroSection.tsx           # 英雄区 + Header + Dashboard Preview
│   ├── SocialProof.tsx           # 社会证明
│   ├── FeaturesSection.tsx       # 功能展示（6个卡片）
│   ├── LargeTestimonial.tsx      # 大型推荐
│   ├── PricingSection.tsx        # 价格方案
│   ├── TestimonialsSection.tsx   # 推荐网格
│   ├── FAQSection.tsx            # 常见问题
│   ├── CTASection.tsx            # 行动号召
│   └── Footer.tsx                # 页脚
├── spec.md                        # 技术规格
├── prd.md                         # 产品需求
├── README.md                      # 本文件
└── CHANGELOG.md                   # 更新日志
```

## 🚀 快速开始

```bash
# 启动开发服务器
cd apps/axhub-make
pnpm dev

# 访问页面
open http://localhost:51720/pages/landing-page/index.html
```

## 🎨 技术栈

- **React 18**：现代化的 React Hooks
- **TypeScript**：类型安全
- **Tailwind CSS**：Utility-first CSS 框架
- **shadcn/ui**：高质量 React 组件库
- **lucide-react**：SVG 图标库
- **Vite**：快速的构建工具

## 📚 代码示例

### 使用 Tailwind CSS

```tsx
<div className="relative flex flex-col items-center max-w-[1220px] h-[810px] rounded-2xl overflow-hidden">
  <h1 className="text-3xl md:text-4xl lg:text-6xl font-semibold leading-tight">
    Unleash the Power of AI Agents
  </h1>
</div>
```

### 使用 shadcn/ui Button

```tsx
import { Button } from '@/components/ui/button';

<Button className="bg-[#e7eceb] text-[#141a18] hover:bg-[#e7eceb]/90 rounded-full">
  Signup for free
</Button>
```

### 使用 lucide-react 图标

```tsx
import { Code, Zap, Rocket } from 'lucide-react';

<Code className="w-16 h-16 text-[#78fcd6]" />
```

### Glassmorphism 效果

```tsx
<div className="bg-[#e7eceb]/8 backdrop-blur-sm border border-white/20 rounded-2xl">
  {/* 内容 */}
</div>
```

## 🎯 设计特色

### 1. SVG 网格背景

```tsx
<div 
  style={{
    backgroundImage: `
      repeating-linear-gradient(0deg, transparent, transparent 35.6px, rgba(231, 236, 235, 0.11) 35.6px, rgba(231, 236, 235, 0.11) 36px),
      repeating-linear-gradient(90deg, transparent, transparent 35.6px, rgba(231, 236, 235, 0.11) 35.6px, rgba(231, 236, 235, 0.11) 36px)
    `,
    backgroundSize: '36px 36px'
  }}
/>
```

### 2. 渐变光晕

```tsx
<div className="absolute w-[800px] h-[1000px] bg-[radial-gradient(circle,rgba(120,252,214,0.15)_0%,rgba(0,255,182,0.08)_40%,transparent_70%)] blur-[80px]" />
```

### 3. 悬停动画

```tsx
<div className="hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
  {/* 内容 */}
</div>
```

## 🔧 符合 Axhub 开发规范

- ✅ 主文件使用 `export default Component`
- ✅ 组件可以拆分为多个文件
- ✅ 避免 ES6 解构（state 管理）
- ✅ 使用 `const Component = function` 格式
- ✅ 文件头部包含 `@name` 注释

## 📖 学习资源

- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [lucide-react 图标](https://lucide.dev)
- [Tailwind CSS 中文文档](https://www.tailwindcss.cn)

## 🎓 作为示例的价值

这个项目展示了如何在 Axhub 中：

1. **集成现代 CSS 框架**（Tailwind CSS）
2. **使用组件库**（shadcn/ui）
3. **组织组件结构**（多文件架构）
4. **实现复杂设计**（Glassmorphism、渐变、动画）
5. **保持代码可维护性**（组件化、类型安全）

## 💡 提示

- 所有颜色使用 `[#hex]` 格式定义
- 响应式断点：`md:` (768px), `lg:` (1024px)
- 使用 `backdrop-blur-sm` 实现毛玻璃效果
- 使用 `transition-all duration-300` 实现平滑过渡
- 图片使用 Unsplash CDN，无需本地存储

## 📝 许可

MIT License
