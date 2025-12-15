# 开发规范

本文档定义 Axhub 组件和页面的代码编写规范。

## 📁 项目结构

### 目录组织

```
src/
├── elements/          # 原型元素
│   └── button/
│       ├── index.tsx  # 入口文件（必需）
│       ├── spec.md    # 需求规格（必需）
│       ├── style.css  # 样式文件（可选）
│       └── hack.css   # 样式覆盖文件（可选，AI Agent 不应主动修改）
└── pages/             # 原型页面
    └── sample-page/
        ├── index.tsx  # 入口文件（必需）
        ├── spec.md    # 需求规格（必需）
        ├── style.css  # 样式文件（可选）
        └── hack.css   # 样式覆盖文件（可选，AI Agent 不应主动修改）
```

### 结构约束

- **入口固定**：每个组件/页面的入口必须是 `index.tsx`
- **规格文档**：必须包含 `spec.md` 说明功能和接口
- **模块分离**：复杂项目鼓励按模块拆分文件，例如：
  ```
  elements/complex-table/
  ├── index.tsx          # 入口
  ├── spec.md            # 规格
  ├── style.css          # 样式
  ├── components/        # 子组件
  │   ├── Header.tsx
  │   └── Row.tsx
  ├── hooks/             # 自定义 Hooks
  │   └── useTableData.ts
  └── utils/             # 工具函数
      └── formatters.ts
  ```

## 🎯 核心要求

### 1. 文件头部注释

**每个文件顶部必须包含项目名称**（通常与用户使用的语言一致）

```typescript
/**
 * @name Ant Design 下拉选择框
 */
```

### 2. 依赖引用规范

**可以直接引用 React 和第三方库**

```typescript
// ✅ 正确 - 直接导入 React
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';

// ✅ 正确 - 导入第三方库（需要协助用户安装依赖）
import { Select } from 'antd';
import { Button } from '@mui/material';
```

**注意事项**：
- 使用第三方库时，需要协助用户安装相应的 npm 依赖
- 确保导入的库与项目的依赖管理文件兼容
- **按需导入**：优先使用按需导入方式，避免导入整个库，以减小打包体积

**按需导入示例**：

```typescript
// ✅ 推荐 - 按需导入具体组件
import { Select, Button, Input } from 'antd';

// ❌ 不推荐 - 导入整个库
import * as antd from 'antd';
```

### 3. 组件接口规范

**必须使用 forwardRef 并实现 AxhubHandle 接口**

```typescript
import type { AxhubProps, AxhubHandle } from '../../common/axhub-types';

var Component = forwardRef<AxhubHandle, AxhubProps>(function MyComponent(innerProps, ref) {
  const dataSource = innerProps && innerProps.data ? innerProps.data : {};
  const configSource = innerProps && innerProps.config ? innerProps.config : {};
  const onEventHandler = typeof innerProps.onEvent === 'function' 
    ? innerProps.onEvent 
    : function () { return undefined; };

  useImperativeHandle(ref, function () {
    return {
      getVar: function (name: string) { /* ... */ },
      fireAction: function (name: string, params?: any) { /* ... */ },
      eventList: EVENT_LIST,
      actionList: ACTION_LIST,
      varList: VAR_LIST,
      configList: CONFIG_LIST,
      dataList: DATA_LIST
    };
  }, [/* 依赖项 */]);

  return <div>Component Content</div>;
});
```

## 📋 代码结构规范

### 文件结构

```typescript
/**
 * @name 组件显示名称
 */

// 1. 导入样式（可选）
import './style.css';

// 2. 导入 React 和 Hooks
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';

// 3. 导入第三方库（可选，需要协助用户安装依赖）
import { Select } from 'antd';

// 4. 导入类型
import type {
  KeyDesc,
  DataDesc,
  ConfigItem,
  Action,
  EventItem,
  AxhubProps,
  AxhubHandle
} from '../../common/axhub-types';

// 5. 定义常量列表
const EVENT_LIST: EventItem[] = [/* ... */];
const ACTION_LIST: Action[] = [/* ... */];
const VAR_LIST: KeyDesc[] = [/* ... */];
const CONFIG_LIST: ConfigItem[] = [/* ... */];
const DATA_LIST: DataDesc[] = [/* ... */];

// 6. 定义组件
const Component = forwardRef<AxhubHandle, AxhubProps>(function ComponentName(innerProps, ref) {
  // 解构 props
  const dataSource = innerProps && innerProps.data ? innerProps.data : {};
  const configSource = innerProps && innerProps.config ? innerProps.config : {};
  const onEventHandler = typeof innerProps.onEvent === 'function' 
    ? innerProps.onEvent 
    : function () { return undefined; };
  const container = innerProps && innerProps.container ? innerProps.container : null;
  
  // 组件实现
});

// 7. 导出组件
export default Component;
```

### 常量定义规范

**所有常量必须有清晰的描述，说明参数和类型**

```typescript
// 事件列表
const EVENT_LIST: EventItem[] = [
  { name: 'onClick', desc: '点击按钮时触发' },
  { name: 'onChange', desc: '值改变时触发，传递新值' }
];

// 动作列表（需说明参数）
const ACTION_LIST: Action[] = [
  { name: 'reset', desc: '重置表单到初始状态' },
  { name: 'setValue', desc: '设置指定字段的值，参数：{ field: string, value: any }' }
];

// 变量列表（需说明类型）
const VAR_LIST: KeyDesc[] = [
  { name: 'value', desc: '当前输入值（字符串）' },
  { name: 'isValid', desc: '表单是否有效（布尔值）' }
];

// 配置项列表（必须有 initialValue）
const CONFIG_LIST: ConfigItem[] = [
  {
    type: 'input',
    attributeId: 'title',
    displayName: '标题',
    info: '组件顶部显示的标题文本',
    initialValue: '默认标题'
  },
  {
    type: 'inputNumber',
    attributeId: 'maxLength',
    displayName: '最大长度',
    info: '输入框允许的最大字符数',
    initialValue: 100,
    min: 1,
    max: 1000
  }
];

// 数据项列表（需详细定义 keys）
const DATA_LIST: DataDesc[] = [
  {
    name: 'users',
    desc: '用户列表数据',
    keys: [
      { name: 'id', desc: '用户唯一标识（数字）' },
      { name: 'name', desc: '用户姓名（字符串）' },
      { name: 'status', desc: '用户状态（active/inactive）' }
    ]
  }
];
```

## 🔧 组件实现规范

### Props 处理

```typescript
// 安全解构 props 并提供默认值
const dataSource = innerProps && innerProps.data ? innerProps.data : {};
const configSource = innerProps && innerProps.config ? innerProps.config : {};
const onEventHandler = typeof innerProps.onEvent === 'function' 
  ? innerProps.onEvent 
  : function () { return undefined; };
const container = innerProps && innerProps.container ? innerProps.container : null;

// 从 config 获取配置，避免使用 || （会误判 0、false）
const title = typeof configSource.title === 'string' && configSource.title 
  ? configSource.title 
  : '默认标题';
```

### Container 容器使用

**`container` 是 AxhubProps 提供的 DOM 容器元素，可以直接用于挂载组件内容**

**适用场景**：
- **图表类组件**：ECharts、D3.js、Chart.js 等需要直接操作 DOM 的图表库
- **第三方库集成**：需要直接挂载到 DOM 元素的库
- **性能优化**：避免 React 虚拟 DOM 的开销，直接操作原生 DOM

**使用示例（图表组件）**：

```typescript
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

const Component = forwardRef<AxhubHandle, AxhubProps>(function Chart(innerProps, ref) {
  const container = innerProps && innerProps.container ? innerProps.container : null;
  const chartInstanceRef = useRef<any>(null);

  // 使用 useEffect 在 container 上初始化图表
  useEffect(function () {
    if (!container) {
      return;
    }

    // 直接使用 container 初始化 ECharts
    if (!chartInstanceRef.current) {
      const chartInstance = echarts.init(container);
      chartInstanceRef.current = chartInstance;
      
      // 设置图表配置
      chartInstance.setOption({
        // ... 配置项
      });
    }

    // 清理函数
    return function () {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [container]);

  // 如果直接使用 container 渲染，组件可以返回 null
  return null;
});
```

**注意事项**：
- `container` 可能为 `null`，使用前必须检查
- 使用 `container` 时，组件可以返回 `null`（不渲染 React 元素）
- 在 `useEffect` 中处理 DOM 操作，确保在组件挂载后执行
- 记得在清理函数中销毁实例，避免内存泄漏

### State 管理

```typescript
// 避免使用 ES6 解构
const countState = useState<number>(0);
const count = countState[0];
const setCount = countState[1];

// 更新 state
setCount(function (prev) { return prev + 1; });
```

### 事件处理

```typescript
// 使用 useCallback 优化性能，避免在 JSX 中直接定义函数
const emitEvent = useCallback(function (eventName: string, payload?: any) {
  try {
    onEventHandler(eventName, payload);
  } catch (error) {
    console.warn('事件触发失败:', eventName, error);
  }
}, [onEventHandler]);

const handleClick = useCallback(function () {
  emitEvent('onClick', { timestamp: Date.now() });
}, [emitEvent]);
```

### 动作处理

```typescript
// 使用 switch 处理不同动作
const fireActionHandler = useCallback(function (name: string, params?: any) {
  switch (name) {
    case 'reset':
      setCount(0);
      setMessage('');
      break;
    case 'setValue':
      if (params && typeof params.value !== 'undefined') {
        setMessage(params.value);
      }
      break;
    default:
      console.warn('未知的动作:', name);
  }
}, []);
```

### useImperativeHandle 使用

```typescript
// 完整暴露接口，正确设置依赖项
useImperativeHandle(ref, function () {
  return {
    getVar: function (name: string) {
      const vars: Record<string, any> = { count, message, isValid: count > 0 };
      return vars[name];
    },
    fireAction: fireActionHandler,
    eventList: EVENT_LIST,
    actionList: ACTION_LIST,
    varList: VAR_LIST,
    configList: CONFIG_LIST,
    dataList: DATA_LIST
  };
}, [count, message, fireActionHandler]);
```

## 🎨 样式规范

### CSS 类命名

**使用 BEM 命名，加组件前缀避免冲突**

```css
/* ✅ 正确 - 有前缀的 BEM 命名 */
.axhub-button-container { }
.axhub-button-title { }
.axhub-button-primary { }
.axhub-button-primary--disabled { }

/* ❌ 错误 - 命名过于通用 */
.container { }
.button { }
```

### 避免全局样式污染

```css
/* ✅ 正确 - 使用特定类名 */
.my-component-wrapper button { }

/* ❌ 错误 - 直接修改全局标签 */
button { }
div { }
```

### hack.css 样式覆盖文件

**`hack.css` 是用户手动调整样式的文件，AI Agent 不应主动修改**


### 允许使用的 ES6+ 特性

```typescript
// 构建时会自动转换为 ES5
const count = 0;  // → var
for (const item of array) { }  // → for 循环
const obj = { method() { } };  // → 完整函数

// 但避免使用数组/对象解构
const [a, b] = arr;  // ❌ 不推荐
```

## 📦 导出规范

### 必须导出 Component

**所有组件文件必须包含 `export default Component` 语句**

```typescript
// ✅ 正确 - 必须使用这个确切的导出语句
export default Component;
```

**注意事项**：
- 必须使用变量名 `Component`（大小写敏感）
- 必须使用 `export default` 语法
- 这是 Axhub 第三方平台集成的必要条件

## ✅ 代码检查清单

**文件头部**
- [ ] 包含 `@name` 注释（项目名称，与用户语言一致）

**依赖导入**
- [ ] 直接从 `react` 导入所需的 Hooks
- [ ] 第三方库已安装依赖（如使用 antd、@mui/material 等）
- [ ] 导入顺序：样式 → React → 第三方库 → 类型

**常量定义**
- [ ] 所有列表完整且有清晰描述
- [ ] ACTION_LIST 说明参数
- [ ] VAR_LIST 说明类型
- [ ] CONFIG_LIST 有 initialValue（如适用）

**组件实现**
- [ ] 使用 `forwardRef<AxhubHandle, AxhubProps>` 和类型标注
- [ ] 安全解构 props 并提供默认值（包括 `container`）
- [ ] 图表类组件优先使用 `container` 直接渲染（如 ECharts、D3.js 等）
- [ ] 使用 `container` 时，在 `useEffect` 中处理 DOM 操作并正确清理
- [ ] 使用 `useCallback` 优化回调
- [ ] `useImperativeHandle` 暴露完整接口
- [ ] 依赖项数组正确

**导出**
- [ ] 使用 `export default Component`

## 📚 参考资源

- **类型定义**：`src/common/axhub-types.ts`、`src/common/config-panel-types.ts`
- **示例代码**：
  - 基础组件：`src/elements/demo-button/`、`src/pages/demo-antd/`
  - 图表组件（使用 container）：`src/elements/demo-line-chart/`
- **其他文档**：[设计规范](./design-guidelines.md)、[调试指南](./debugging-guide.md)
