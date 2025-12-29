# 健身 App 首页 - 技术规格文档（Spec）

> **关联文档**：本规格文档基于 prd.md 中定义的产品需求

## 1. 组件概述

### 1.1 组件类型
- **类型**：页面（Page）
- **名称**：健身 App 首页（Fitness Home）
- **标识**：`ref-app-home`

### 1.2 技术定位
本组件是一个完整的移动端应用首页实现，展示了 Axhub 平台的标准开发模式。组件采用 React + TypeScript 开发，遵循 Axhub API 规范，支持完整的事件、动作、变量和配置管理。

### 1.3 核心能力
- 展示用户运动数据统计（卡路里、时长、连续天数）
- 动态环形进度条展示每日目标完成度
- 横向滚动的课程推荐列表
- 底部导航栏交互
- 完全可配置的主题色和用户信息
- 完整的事件通知机制

## 2. 技术架构

### 2.1 组件结构
```
ref-app-home/
├── index.tsx          # 组件主文件
├── style.css          # 样式文件
├── hack.css           # 临时样式调整（可选）
├── prd.md             # 产品需求文档
├── spec.md            # 技术规格文档（本文件）
└── README.md          # 组件说明（可选）
```

### 2.2 技术栈
- **框架**：React 18+
- **语言**：TypeScript
- **样式**：CSS（原生 CSS，不使用预处理器）
- **API**：Axhub API（事件、动作、变量、配置）

### 2.3 依赖关系
- `react`：React 核心库
- `axhub-types`：Axhub 类型定义

## 3. 功能实现

### 3.1 运动数据统计

#### 实现方式
使用三个独立的卡片组件展示统计数据，每个卡片包含图标、数值和标签。

#### 数据来源
- 数据为静态展示，用于演示
- 实际项目中可通过 `data` 属性传入动态数据

#### 技术细节
```tsx
<div className="demo-app-home-stats">
  <div className="demo-app-home-stat-card">
    <div className="demo-app-home-stat-icon">🔥</div>
    <div className="demo-app-home-stat-value">328</div>
    <div className="demo-app-home-stat-label">千卡消耗</div>
  </div>
  {/* 其他卡片... */}
</div>
```

#### 样式特点
- 使用 Flexbox 布局，支持横向滚动
- 卡片使用半透明背景和阴影
- 点击时提供缩放反馈（`:active` 状态）

### 3.2 每日目标管理

#### 实现方式
使用 SVG 绘制环形进度条，通过 `stroke-dashoffset` 控制进度显示。

#### 状态管理
```tsx
const progressState = useState<number>(65);
const todayProgress = progressState[0];
const setTodayProgress = progressState[1];
```

#### 进度计算
```tsx
const radius = 25;
const circumference = 2 * Math.PI * radius;
const strokeDashoffset = circumference - (todayProgress / 100) * circumference;
```

#### 技术细节
- 使用两个 `<circle>` 元素：背景圆环和进度圆环
- 进度圆环的 `stroke-dashoffset` 根据进度百分比动态计算
- 支持通过 `updateProgress` 动作更新进度

#### 交互行为
- 点击"开始训练"按钮触发 `onStartWorkout` 事件
- 按钮颜色使用配置的强调色

### 3.3 课程推荐

#### 数据结构
```typescript
interface Course {
  id: number;
  title: string;
  duration: number;
  level: string;
  category: string;
  image: string;
}
```

#### 数据来源
- 从 `data.courses` 获取课程列表
- 如果未提供数据，使用默认课程列表

#### 渲染逻辑
```tsx
{courses.map(function (course: any) {
  return (
    <div
      key={course.id}
      className="demo-app-home-course-card"
      onClick={function () { handleCourseClick(course); }}
    >
      {/* 课程内容... */}
    </div>
  );
})}
```

#### 交互行为
- 点击课程卡片触发 `onCourseClick` 事件，传递课程对象
- 鼠标悬停时图片放大（`:hover` 状态）

#### 样式特点
- 横向滚动，隐藏滚动条
- 卡片使用图片背景 + 渐变遮罩
- 分类标签使用强调色背景

### 3.4 底部导航

#### 导航项定义
```tsx
const tabs = [
  { icon: 'home', label: '首页' },
  { icon: 'calendar', label: '计划' },
  { icon: 'chart', label: '统计' },
  { icon: 'user', label: '我的' }
];
```

#### 状态管理
```tsx
const tabState = useState<number>(0);
const currentTab = tabState[0];
const setCurrentTab = tabState[1];
```

#### 交互行为
- 点击导航项切换当前选中的 Tab
- 触发 `onTabChange` 事件，传递 Tab 索引
- 选中的 Tab 使用强调色高亮

#### 技术细节
- 使用 `position: fixed` 固定在底部
- 使用 SVG 图标，支持颜色动态变化
- 适配 iPhone 底部安全区（`padding-bottom: 16px`）

## 4. Axhub API 实现

### 4.1 事件列表（Events）

| 事件名 | 描述 | 触发时机 | 参数类型 | 参数示例 |
|--------|------|----------|----------|----------|
| `onCourseClick` | 点击课程卡片时触发 | 用户点击任意课程卡片 | `{ course: Course }` | `{ course: { id: 1, title: "HIIT 高强度燃脂", ... } }` |
| `onStartWorkout` | 点击开始训练时触发 | 用户点击今日计划中的开始按钮 | `{}` | `{}` |
| `onTabChange` | 切换底部标签栏时触发 | 用户点击底部导航任意 Tab | `{ index: number }` | `{ index: 1 }` |

#### 事件触发实现
```tsx
const emitEvent = useCallback(function (eventName: string, payload?: any) {
  try {
    onEventHandler(eventName, payload);
  } catch (error) {
    console.warn('事件触发失败:', error);
  }
}, [onEventHandler]);
```

### 4.2 动作列表（Actions）

| 动作名 | 描述 | 参数类型 | 参数说明 | 使用示例 |
|--------|------|----------|----------|----------|
| `refreshData` | 刷新首页数据 | 无 | - | `fireAction('refreshData')` |
| `updateProgress` | 更新今日目标进度 | `{ progress: number }` | `progress`: 进度值（0-100） | `fireAction('updateProgress', { progress: 85 })` |

#### 动作处理实现
```tsx
const fireActionHandler = useCallback(function (name: string, params?: any) {
  switch (name) {
    case 'refreshData':
      console.log('刷新数据...');
      break;
    case 'updateProgress':
      if (params && typeof params.progress === 'number') {
        setTodayProgress(params.progress);
      }
      break;
    default:
      console.warn('未知的动作:', name);
  }
}, []);
```

### 4.3 变量列表（Variables）

| 变量名 | 类型 | 描述 | 默认值 | 访问方式 |
|--------|------|------|--------|----------|
| `currentTab` | `number` | 当前选中的标签页索引（0-3） | `0` | `getVar('currentTab')` |
| `todayProgress` | `number` | 今日目标完成进度（0-100） | `65` | `getVar('todayProgress')` |

#### 变量访问实现
```tsx
getVar: function (name: string) {
  const vars: Record<string, any> = {
    currentTab,
    todayProgress
  };
  return vars[name];
}
```

### 4.4 配置项列表（Config）

| 配置项ID | 类型 | 显示名称 | 说明 | 默认值 | 验证规则 |
|----------|------|----------|------|--------|----------|
| `userName` | `input` | 用户名 | 显示在页面顶部的用户名 | `'Alex'` | 非空字符串 |
| `accentColor` | `colorPicker` | 强调色 | App 的主要强调色，影响按钮、进度条、选中状态等 | `'#a6ff00'` | 有效的十六进制颜色值 |
| `dailyGoal` | `inputNumber` | 每日目标(kcal) | 每日卡路里消耗目标值 | `500` | 正整数，范围 100-2000 |

#### 配置项使用
```tsx
const userName = typeof configSource.userName === 'string' && configSource.userName 
  ? configSource.userName 
  : 'Alex';
const accentColor = typeof configSource.accentColor === 'string' && configSource.accentColor 
  ? configSource.accentColor 
  : '#a6ff00';
const dailyGoal = typeof configSource.dailyGoal === 'number' 
  ? configSource.dailyGoal 
  : 500;
```

### 4.5 数据项列表（Data）

#### courses（课程列表）

**描述**：推荐课程列表

**数据类型**：`Array<Course>`

**字段定义**：

| 字段名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| `id` | `number` | 是 | 课程唯一标识 | `1` |
| `title` | `string` | 是 | 课程标题 | `"HIIT 高强度燃脂"` |
| `duration` | `number` | 是 | 课程时长（分钟） | `20` |
| `level` | `string` | 是 | 难度等级 | `"K3"` |
| `category` | `string` | 是 | 分类标签 | `"减脂"` |
| `image` | `string` | 是 | 封面图片 URL | `"https://..."` |

**数据示例**：
```json
{
  "courses": [
    {
      "id": 1,
      "title": "HIIT 高强度燃脂",
      "duration": 20,
      "level": "K3",
      "category": "减脂",
      "image": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438"
    },
    {
      "id": 2,
      "title": "腹肌核心撕裂者",
      "duration": 15,
      "level": "K2",
      "category": "塑形",
      "image": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b"
    }
  ]
}
```

**默认数据**：
组件内置了 3 个默认课程，当未提供数据时使用。

## 5. 样式设计

### 5.1 色彩系统

| 用途 | 颜色值 | 说明 |
|------|--------|------|
| 背景色 | `#121212` | 主背景色，深灰黑色 |
| 卡片背景 | `#1e1e1e` | 卡片和容器背景 |
| 强调色 | `#a6ff00`（可配置） | 按钮、进度条、选中状态 |
| 主文字 | `#ffffff` | 标题、数值等主要文字 |
| 次要文字 | `#888888` | 标签、说明等次要文字 |
| 边框色 | `#333333` | 分隔线、边框 |

### 5.2 字体系统

| 用途 | 字号 | 字重 | 行高 |
|------|------|------|------|
| 大标题 | 24px | 700 | 1.2 |
| 标题 | 18px | 600 | 1.3 |
| 正文 | 16px | 400 | 1.5 |
| 小字 | 14px | 400 | 1.4 |
| 标签 | 12px | 500 | 1.3 |
| 微小文字 | 10px | 700 | 1.2 |

### 5.3 间距系统

使用 8px 栅格系统：
- 小间距：8px
- 中间距：16px
- 大间距：24px
- 超大间距：32px

### 5.4 圆角系统

| 元素 | 圆角值 |
|------|--------|
| 卡片 | 16px |
| 按钮 | 12px |
| 头像 | 50%（圆形） |
| 标签 | 4px |

### 5.5 阴影系统

| 层级 | 阴影值 |
|------|--------|
| 卡片 | `0 4px 12px rgba(0, 0, 0, 0.2)` |
| 浮动按钮 | `0 4px 16px rgba(166, 255, 0, 0.4)` |

### 5.6 动画系统

| 动画类型 | 时长 | 缓动函数 |
|----------|------|----------|
| 点击反馈 | 0.2s | ease |
| 进度条更新 | 0.5s | ease |
| 图片缩放 | 0.3s | ease |

## 6. 响应式设计

### 6.1 断点定义

| 断点 | 宽度范围 | 说明 |
|------|----------|------|
| 小屏 | < 375px | iPhone SE 等小屏设备 |
| 中屏 | 375px - 428px | 主流手机屏幕 |
| 大屏 | > 428px | 大屏手机或平板 |

### 6.2 适配策略

- 使用相对单位（百分比、vw）确保布局灵活
- 卡片宽度使用 `flex: 1` 自适应
- 课程卡片使用固定最小宽度（240px）
- 底部导航使用 `padding-bottom` 适配安全区

## 7. 性能优化

### 7.1 渲染优化

- 使用 `useCallback` 缓存事件处理函数
- 使用 `key` 属性优化列表渲染
- 避免在 JSX 中定义内联函数

### 7.2 样式优化

- 使用 CSS 类名而非内联样式（除动态值外）
- 使用 CSS 变量管理主题色
- 使用 `transform` 而非 `top/left` 实现动画

### 7.3 图片优化

- 使用 CDN 加载图片
- 图片使用 `object-fit: cover` 确保比例
- 考虑使用懒加载（实际项目中）

## 8. 兼容性

### 8.1 浏览器兼容性

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

### 8.2 移动端兼容性

- iOS 12+
- Android 8+

### 8.3 特性兼容性

- CSS Grid / Flexbox：全面支持
- CSS Variables：全面支持
- SVG：全面支持
- ES6+：需要 Babel 转译

## 9. 测试要点

### 9.1 功能测试

- [ ] 页面正常加载，所有元素正确显示
- [ ] 点击课程卡片触发 `onCourseClick` 事件
- [ ] 点击开始训练按钮触发 `onStartWorkout` 事件
- [ ] 点击底部导航切换 Tab，触发 `onTabChange` 事件
- [ ] 调用 `updateProgress` 动作更新进度条
- [ ] 调用 `getVar` 获取正确的变量值

### 9.2 配置测试

- [ ] 修改 `userName` 配置，页面显示更新
- [ ] 修改 `accentColor` 配置，强调色正确应用
- [ ] 修改 `dailyGoal` 配置，目标值正确显示

### 9.3 数据测试

- [ ] 提供课程数据，列表正确渲染
- [ ] 提供空数组，显示默认课程
- [ ] 提供不完整数据，组件不崩溃

### 9.4 样式测试

- [ ] 在不同屏幕尺寸下布局正常
- [ ] 暗色主题显示正常
- [ ] 动画流畅，无卡顿
- [ ] 点击反馈正常

### 9.5 边界测试

- [ ] 进度值为 0 时，进度条显示正常
- [ ] 进度值为 100 时，进度条显示正常
- [ ] 进度值超过 100 时，进度条显示为 100%
- [ ] 课程列表为空时，不显示课程区域

## 10. 开发规范

### 10.1 代码规范

- 遵循 development-standards.md 开发规范
- 使用 TypeScript 严格模式
- 避免使用 ES6 解构（Axhub 规范要求）
- 使用 `function` 关键字而非箭头函数

### 10.2 命名规范

- 组件类名：`demo-app-home-*`（统一前缀）
- 事件名：`on*`（如 `onCourseClick`）
- 动作名：动词开头（如 `refreshData`）
- 变量名：驼峰命名（如 `currentTab`）

### 10.3 注释规范

- 文件头部必须包含 `@name` 和参考资料
- 复杂逻辑添加必要的注释
- 避免冗余注释

### 10.4 导出规范

- 必须使用 `export default Component`（大小写敏感）
- 组件必须使用 `forwardRef<AxhubHandle, AxhubProps>` 包装
- 必须实现完整的 `AxhubHandle` 接口

## 11. 部署说明

### 11.1 构建要求

- Node.js 16+
- pnpm 8+
- TypeScript 5+

### 11.2 构建命令

```bash
# 开发模式
pnpm dev

# 生产构建
pnpm build

# 类型检查
pnpm type-check
```

### 11.3 部署检查

- [ ] 构建无错误和警告
- [ ] 类型检查通过
- [ ] 所有资源正确加载
- [ ] 在目标环境中测试通过

## 12. 维护说明

### 12.1 常见问题

**Q: 进度条不更新？**
A: 检查 `updateProgress` 动作的参数是否正确，确保 `progress` 为 0-100 的数字。

**Q: 强调色不生效？**
A: 检查 `accentColor` 配置是否为有效的十六进制颜色值（如 `#a6ff00`）。

**Q: 课程列表不显示？**
A: 检查 `data.courses` 是否为数组，且每个课程对象包含必填字段。

### 12.2 扩展建议

- 增加骨架屏加载状态
- 支持下拉刷新
- 增加运动数据趋势图表
- 支持课程收藏功能
- 增加社交分享功能

### 12.3 性能监控

- 监控页面加载时间
- 监控事件触发频率
- 监控内存使用情况
- 监控崩溃率

---

**文档版本**：v1.0  
**创建日期**：2024-12-23  
**创建人**：技术团队  
**审核人**：待定  
**状态**：待审核  
**关联 PRD**：prd.md
