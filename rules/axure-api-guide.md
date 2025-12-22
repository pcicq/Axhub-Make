# Axure API 使用指南

本文档说明如何在 Axhub 原型中使用 Axure API 实现交互功能。

## 📌 什么是 Axure API

Axure API 是 Axhub 提供的一套接口规范，用于实现组件与 Axure 原型之间的交互。通过 Axure API，组件可以：

- **触发事件**：向外部发送事件通知
- **接收动作**：响应外部调用的动作
- **暴露变量**：提供内部状态供外部读取
- **接收配置**：从配置面板接收用户配置
- **接收数据**：从外部数据源接收数据

## 🎯 何时使用 Axure API

**使用场景**：
- 需要与 Axure 原型进行交互
- 需要在配置面板中提供可配置项
- 需要接收外部数据源
- 需要触发事件或响应动作

**不使用场景**：
- 纯展示型组件
- 不需要与外部交互的独立组件
- 标准 React 组件即可满足需求

## 📋 Axure API 接口规范

### 组件定义

使用 `forwardRef<AxhubHandle, AxhubProps>` 包装组件：

```typescript
import React, { forwardRef, useImperativeHandle } from 'react';
import type { AxhubProps, AxhubHandle } from '../../common/axhub-types';

const Component = forwardRef<AxhubHandle, AxhubProps>(function MyComponent(innerProps, ref) {
  // 组件实现
  
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

export default Component;
```

### Props 处理

```typescript
// 安全解构 props 并提供默认值
const dataSource = innerProps && innerProps.data ? innerProps.data : {};
const configSource = innerProps && innerProps.config ? innerProps.config : {};
const onEventHandler = typeof innerProps.onEvent === 'function' 
  ? innerProps.onEvent 
  : function () { return undefined; };
const container = innerProps && innerProps.container ? innerProps.container : null;

// 从 config 获取配置值（避免使用 || 运算符）
const title = typeof configSource.title === 'string' && configSource.title 
  ? configSource.title 
  : '默认标题';
```

## 📝 API 常量定义

### 1. 事件列表（EVENT_LIST）

定义组件可以触发的事件：

```typescript
import type { EventItem } from '../../common/axhub-types';

const EVENT_LIST: EventItem[] = [
  { name: 'onClick', desc: '点击按钮时触发' },
  { name: 'onChange', desc: '值改变时触发，传递新值' },
  { name: 'onSubmit', desc: '提交表单时触发，传递表单数据' }
];
```

**触发事件**：

```typescript
import { useCallback } from 'react';

const emitEvent = useCallback(function (eventName: string, payload?: any) {
  try {
    onEventHandler(eventName, payload);
  } catch (error) {
    console.warn('事件触发失败:', eventName, error);
  }
}, [onEventHandler]);

// 使用
emitEvent('onClick', { timestamp: Date.now() });
```

### 2. 动作列表（ACTION_LIST）

定义组件可以响应的动作：

```typescript
import type { Action } from '../../common/axhub-types';

const ACTION_LIST: Action[] = [
  { name: 'reset', desc: '重置表单到初始状态' },
  { name: 'setValue', desc: '设置指定字段的值，参数：{ field: string, value: any }' },
  { name: 'submit', desc: '提交表单' }
];
```

**处理动作**：

```typescript
const fireActionHandler = useCallback(function (name: string, params?: any) {
  switch (name) {
    case 'reset':
      // 重置逻辑
      setFormData({});
      break;
    case 'setValue':
      if (params && params.field) {
        setFormData({ ...formData, [params.field]: params.value });
      }
      break;
    case 'submit':
      // 提交逻辑
      handleSubmit();
      break;
    default:
      console.warn('未知的动作:', name);
  }
}, [formData]);
```

### 3. 变量列表（VAR_LIST）

定义组件暴露的内部状态：

```typescript
import type { KeyDesc } from '../../common/axhub-types';

const VAR_LIST: KeyDesc[] = [
  { name: 'value', desc: '当前输入值（字符串）' },
  { name: 'isValid', desc: '表单是否有效（布尔值）' },
  { name: 'errorMessage', desc: '错误信息（字符串）' }
];
```

**暴露变量**：

```typescript
useImperativeHandle(ref, function () {
  return {
    getVar: function (name: string) {
      const vars: Record<string, any> = {
        value: inputValue,
        isValid: isFormValid,
        errorMessage: error
      };
      return vars[name];
    },
    // ... 其他接口
  };
}, [inputValue, isFormValid, error]);
```

### 4. 配置项列表（CONFIG_LIST）

定义配置面板中的可配置项：

```typescript
import type { ConfigItem } from '../../common/axhub-types';

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
  },
  {
    type: 'switch',
    attributeId: 'disabled',
    displayName: '禁用',
    info: '是否禁用组件',
    initialValue: false
  }
];
```

**配置项类型**：
- `input`：文本输入框
- `inputNumber`：数字输入框
- `switch`：开关
- `select`：下拉选择
- `color`：颜色选择器
- 更多类型参考 `/src/common/config-panel-types.ts`

### 5. 数据项列表（DATA_LIST）

定义组件接收的数据结构：

```typescript
import type { DataDesc } from '../../common/axhub-types';

const DATA_LIST: DataDesc[] = [
  {
    name: 'users',
    desc: '用户列表数据',
    keys: [
      { name: 'id', desc: '用户唯一标识（数字）' },
      { name: 'name', desc: '用户姓名（字符串）' },
      { name: 'email', desc: '用户邮箱（字符串）' },
      { name: 'status', desc: '用户状态（active/inactive）' }
    ]
  }
];
```

**使用数据**：

```typescript
const users = Array.isArray(dataSource.users) ? dataSource.users : [];
```

## 🔧 Container 容器使用

`container` 是 AxhubProps 提供的 DOM 容器元素，适用于需要直接操作 DOM 的场景（如图表库）：

```typescript
import { useRef, useEffect } from 'react';
import * as echarts from 'echarts/core';

const Component = forwardRef<AxhubHandle, AxhubProps>(function Chart(innerProps, ref) {
  const container = innerProps && innerProps.container ? innerProps.container : null;
  const chartRef = useRef<any>(null);

  useEffect(function () {
    if (!container) return;
    
    if (!chartRef.current) {
      chartRef.current = echarts.init(container);
      chartRef.current.setOption({ /* 配置 */ });
    }
    
    return function () {
      if (chartRef.current) {
        chartRef.current.dispose();
        chartRef.current = null;
      }
    };
  }, [container]);

  return null; // 直接使用 container 时可返回 null
});
```

## ✅ 完整示例

```typescript
/**
 * @name 用户表单
 */

import './style.css';
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Input, Button } from 'antd';
import type {
  KeyDesc,
  DataDesc,
  ConfigItem,
  Action,
  EventItem,
  AxhubProps,
  AxhubHandle
} from '../../common/axhub-types';

const EVENT_LIST: EventItem[] = [
  { name: 'onSubmit', desc: '提交表单时触发，传递表单数据' }
];

const ACTION_LIST: Action[] = [
  { name: 'reset', desc: '重置表单' }
];

const VAR_LIST: KeyDesc[] = [
  { name: 'formData', desc: '当前表单数据（对象）' }
];

const CONFIG_LIST: ConfigItem[] = [
  {
    type: 'input',
    attributeId: 'submitText',
    displayName: '提交按钮文字',
    info: '提交按钮显示的文字',
    initialValue: '提交'
  }
];

const DATA_LIST: DataDesc[] = [];

const Component = forwardRef<AxhubHandle, AxhubProps>(function UserForm(innerProps, ref) {
  const configSource = innerProps && innerProps.config ? innerProps.config : {};
  const onEventHandler = typeof innerProps.onEvent === 'function' 
    ? innerProps.onEvent 
    : function () { return undefined; };

  const submitText = typeof configSource.submitText === 'string' && configSource.submitText
    ? configSource.submitText
    : '提交';

  const formDataState = useState({ name: '', email: '' });
  const formData = formDataState[0];
  const setFormData = formDataState[1];

  const emitEvent = useCallback(function (eventName: string, payload?: any) {
    try {
      onEventHandler(eventName, payload);
    } catch (error) {
      console.warn('事件触发失败:', error);
    }
  }, [onEventHandler]);

  const handleSubmit = useCallback(function () {
    emitEvent('onSubmit', { formData });
  }, [emitEvent, formData]);

  const handleReset = useCallback(function () {
    setFormData({ name: '', email: '' });
  }, []);

  useImperativeHandle(ref, function () {
    return {
      getVar: function (name: string) {
        const vars: Record<string, any> = { formData };
        return vars[name];
      },
      fireAction: function (name: string, params?: any) {
        switch (name) {
          case 'reset':
            handleReset();
            break;
          default:
            console.warn('未知的动作:', name);
        }
      },
      eventList: EVENT_LIST,
      actionList: ACTION_LIST,
      varList: VAR_LIST,
      configList: CONFIG_LIST,
      dataList: DATA_LIST
    };
  }, [formData, handleReset]);

  return (
    <div className="user-form">
      <Input
        placeholder="姓名"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <Input
        placeholder="邮箱"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <Button type="primary" onClick={handleSubmit}>
        {submitText}
      </Button>
    </div>
  );
});

export default Component;
```

## 📚 参考资源

- **类型定义**：`/src/common/axhub-types.ts`
- **配置面板类型**：`/src/common/config-panel-types.ts`
- **示例代码**：查看 `/src/elements/` 和 `/src/pages/` 目录下以 `ref-` 开头的文件
