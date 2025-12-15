# WebSocket API 文档

## POST /api/ws/send

向所有连接的 WebSocket 客户端广播消息。

### 请求格式

```json
{
  "type": "sync-widget-content",
  "data": [
    {
      "type": "FRAME",
      "widgetId": "unique-id-here",
      "name": "Component Name",
      "children": []
    }
  ]
}
```

### 参数说明

- `type` (string, 必需): 消息类型
- `data` (any, 必需): 消息数据

### 特殊验证规则

#### sync-widget-content 类型

当 `type` 为 `sync-widget-content` 时，会进行额外验证：

1. `data` 不能为空数组
2. `data` 的第一个元素必须包含 `widgetId` 字段

### 响应格式

#### 成功 (200)

```json
{
  "ok": true,
  "sent": 2
}
```

- `sent`: 成功发送的客户端数量
- `warning`: 可选，当没有客户端连接时返回

#### 错误 (400)

```json
{
  "error": "error message"
}
```

可能的错误信息：
- `type is required`: 缺少 type 字段
- `data is required`: 缺少 data 字段
- `data array is empty`: data 数组为空
- `missing widgetId in data`: 缺少 widgetId
- `invalid json body`: JSON 解析失败

### 行为特性

1. **立即返回**: API 会立即返回响应，不等待客户端渲染完成
2. **异步广播**: 消息广播在后台异步执行
3. **无客户端处理**: 如果没有客户端连接，返回 `sent: 0` 和警告信息

### 使用示例

```typescript
const response = await fetch('/api/ws/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'sync-widget-content',
    data: figmaJsonData
  })
});

if (response.ok) {
  const result = await response.json();
  console.log(`已发送给 ${result.sent} 个客户端`);
} else {
  const error = await response.json();
  console.error('发送失败:', error.error);
}
```

## GET /api/ws/clients

获取当前连接的客户端列表。

### 响应格式

```json
{
  "clients": [
    {
      "id": "client-uuid-1",
      "connectedAt": "2025-12-12T10:30:00.000Z"
    }
  ]
}
```
