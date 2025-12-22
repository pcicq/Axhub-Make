# Axhub 公共工具库

这个目录包含所有 Axhub 组件和页面共用的类型定义、工具函数和辅助方法。

## 文件列表

### DesignTokens.json

设计 Token 定义文件（JSON 格式），包含：
- 颜色 Token（背景色、文本色、边框色等）
- 间距 Token
- 圆角 Token
- 边框宽度 Token
- 字体 Token（字体族、大小、字重、行高）
- 文本样式预设
- 阴影 Token

**注意**：此文件可能为空，表示使用默认设计系统。


### axhub-types.ts

核心类型定义和工具函数文件，包含：

#### 类型定义
- `KeyDesc` - 键值描述类型
- `DataDesc` - 数据描述类型
- `ConfigItem` - 配置项类型
- `Action` - 动作类型
- `EventItem` - 事件类型
- `CSSProperties` - CSS 属性类型
- `AxhubProps` - 组件 Props 接口
- `AxhubHandle` - 组件 Handle 接口

#### 工具函数
- `safeEmitEvent()` - 安全地触发事件
- `createEventEmitter()` - 创建事件发射器
- `mergeStyles()` - 合并样式对象
- `getConfigValue()` - 获取配置值
- `getDataValue()` - 获取数据值

## 使用方法

### 在组件中使用

```typescript
import './style.css';

import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';

import type {
  KeyDesc,
  DataDesc,
  ConfigItem,
  Action,
  EventItem,
  CSSProperties,
  AxhubProps,
  AxhubHandle
} from '../../common/axhub-types';

// 定义事件列表
const EVENT_LIST: EventItem[] = [
  { name: 'onClick', desc: '点击时触发' }
];

// 定义动作列表
const ACTION_LIST: Action[] = [
  { name: 'doSomething', desc: '执行某个动作' }
];

// 创建组件
const Component = forwardRef<AxhubHandle, AxhubProps>(function MyComponent(innerProps, ref) {
  const dataSource = innerProps && innerProps.data ? innerProps.data : {};
  const configSource = innerProps && innerProps.config ? innerProps.config : {};
  const onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };
  const container = innerProps && innerProps.container ? innerProps.container : null;

  // 组件逻辑...
  
  return (
    <div>My Component</div>
  );
});

export default Component;
```

### 使用工具函数

```typescript
import { 
  mergeStyles, 
  getConfigValue, 
  createEventEmitter 
} from '../../common/axhub-types';

// 合并样式
const style = mergeStyles(baseStyle, hoverStyle, activeStyle);

// 获取配置值
const primaryColor = getConfigValue(configSource, 'primaryColor', '#1890ff');

// 创建事件发射器
const emitEvent = createEventEmitter(onEventHandler);
emitEvent('onClick', { data: 'some data' });
```

### 使用设计 Token

```typescript
// 从 JSON 文件导入设计 Token
import DesignTokens from '../../common/DesignTokens.json';

// 使用设计 Token（如果文件不为空）
const style = DesignTokens ? {
  backgroundColor: DesignTokens.colors?.background?.primary,
  color: DesignTokens.colors?.text?.primary,
  padding: DesignTokens.spacing?.base,
  borderRadius: DesignTokens.radius?.md,
} : {};

// 或者使用 TypeScript 主题 Token
import { 
  colorTokens, 
  spacingTokens, 
  radiusTokens,
  typographyTokens,
  textStyleTokens,
  themeTokens 
} from '../../common/theme-tokens';

// 在组件中使用颜色
const style = {
  backgroundColor: colorTokens.background.primary,
  color: colorTokens.text.primary,
  borderColor: colorTokens.border.primary,
};

// 使用间距
const containerStyle = {
  padding: spacingTokens.base, // 8px
  margin: spacingTokens.sm,     // 4px
  gap: spacingTokens.md,        // 6px
};

// 使用圆角
const cardStyle = {
  borderRadius: radiusTokens.md, // 6px
};

// 使用字体
const textStyle = {
  fontFamily: typographyTokens.fontFamily.primary,
  fontSize: typographyTokens.fontSize.base, // 14px
  lineHeight: typographyTokens.lineHeight.lg, // 22px
};

// 使用预设文本样式
const buttonTextStyle = textStyleTokens.button;
```

### 使用核心数据模型

```typescript
// 从 JSON 文件导入核心数据模型
import CoreModels from '../../common/CoreModels.json';

// 使用核心数据模型（如果文件不为空）
if (CoreModels && CoreModels.models) {
  // 访问定义的数据模型
  const userModel = CoreModels.models.user;
  const productModel = CoreModels.models.product;
}
```

## 设计原则

1. **类型安全**：所有公共类型都有明确的定义
2. **可复用性**：避免在每个组件中重复定义相同的类型和函数
3. **一致性**：确保所有组件使用相同的接口和约定
4. **易维护**：集中管理公共代码，便于统一更新和维护

## 注意事项

1. **依赖导入**：直接使用 `import React from 'react'` 导入 React，使用 `import` 导入其他第三方库
2. **导入路径**：根据文件位置调整相对路径（`../../common/axhub-types`）
3. **类型导入**：使用 `import type` 导入类型，避免运行时开销
4. **容器属性**：虽然元素可能用不到 `container` 属性，但建议在代码中赋值以便参考
5. **JSON 文件**：`DesignTokens.json` 和 `CoreModels.json` 可能为空，使用前需要检查文件内容
6. **向后兼容**：保留 `theme-tokens.ts` 以确保现有组件的兼容性

## 扩展指南

如果需要添加新的公共功能：

1. 在 `axhub-types.ts` 中添加类型定义或工具函数
2. 添加完整的 JSDoc 注释
3. 更新此 README 文档
4. 在现有组件中测试新功能
5. 确保构建成功

## 版本历史

- v1.2.0 - 新增 JSON 格式的设计系统文件（DesignTokens.json、CoreModels.json），移除 theme.ts
- v1.1.0 - 新增主题 Token 定义（theme-tokens.ts）
- v1.0.0 - 初始版本，包含基础类型定义和工具函数
