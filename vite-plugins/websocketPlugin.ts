import type { Plugin, ViteDevServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';

export interface WebSocketMessage {
  type: string;
  data?: any;
}

/**
 * WebSocket 插件 - 在 Vite 开发服务器上添加 WebSocket 支持
 */
export function websocketPlugin(): Plugin {
  let wss: WebSocketServer | null = null;
  const clients = new Set<WebSocket>();
  const clientMeta = new Map<WebSocket, { id: number; address?: string; connectedAt: number }>();
  let nextClientId = 1;
  const WS_PATH = '/ws';

  return {
    name: 'vite-websocket',
    apply: 'serve',

    configureServer(server: ViteDevServer) {
      // 使用独立的 noServer 模式，避免抢占 Vite 自带的 HMR WebSocket 升级请求
      // （此前共享同一个 httpServer 且指定 path 会拦截非 /ws 升级，导致 HMR 报 Invalid frame header）
      wss = new WebSocketServer({ noServer: true });

      const handleUpgrade = (req: IncomingMessage, socket: any, head: Buffer) => {
        // 只处理 /ws 的升级请求，其余交给 Vite 自己的 HMR 逻辑
        const pathname = req.url ? new URL(req.url, 'http://localhost').pathname : '';
        if (pathname !== WS_PATH) {
          return;
        }

        wss?.handleUpgrade(req, socket, head, (ws) => {
          wss?.emit('connection', ws, req);
        });
      };

      server.httpServer?.on('upgrade', handleUpgrade);

      wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
        console.log('[WebSocket] 新客户端连接:', req.socket.remoteAddress);
        clients.add(ws);
        const meta = {
          id: nextClientId++,
          address: req.socket.remoteAddress,
          connectedAt: Date.now()
        };
        clientMeta.set(ws, meta);

        // 发送欢迎消息
        ws.send(JSON.stringify({ 
          type: 'connected', 
          message: 'WebSocket 连接成功' 
        }));

        // 处理客户端消息
        ws.on('message', (rawData) => {
          try {
            const payloadText = typeof rawData === 'string'
              ? rawData
              : Buffer.isBuffer(rawData)
                ? rawData.toString()
                : Array.isArray(rawData)
                  ? Buffer.concat(rawData).toString()
                  : Buffer.from(rawData as ArrayBuffer).toString();

            const message: WebSocketMessage = JSON.parse(payloadText);
            const client = clientMeta.get(ws);
            const bodyKeys = message && typeof message === 'object' ? Object.keys(message as any) : [];
            const dataKeys = message?.data && typeof message.data === 'object'
              ? Object.keys(message.data)
              : [];

            console.log('[WebSocket] 收到 WS 消息:', {
              clientId: client?.id,
              address: client?.address,
              type: message?.type,
              hasData: message?.data !== undefined,
              bodyKeys,
              dataKeys,
              bytes: Buffer.byteLength(payloadText, 'utf8')
            });

            // 处理不同类型的消息
            handleMessage(ws, message, clients);
          } catch (err) {
            console.error('[WebSocket] 解析消息失败:', err);
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: '消息格式错误' 
            }));
          }
        });

        // 处理连接关闭
        ws.on('close', () => {
          console.log('[WebSocket] 客户端断开连接');
          clients.delete(ws);
          clientMeta.delete(ws);
        });

        // 处理错误
        ws.on('error', (err) => {
          console.error('[WebSocket] 连接错误:', err);
          clients.delete(ws);
          clientMeta.delete(ws);
        });
      });

      // HTTP API: 获取当前 WS 客户端信息
      server.middlewares.use('/api/ws/clients', (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        const list = Array.from(clientMeta.values()).map((item) => ({
          id: item.id,
          address: item.address,
          connectedAt: item.connectedAt
        }));

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ clients: list }));
      });

      // HTTP API: 发送消息给全部客户端
      server.middlewares.use('/api/ws/send', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', () => {
          try {
            const parsedBody = JSON.parse(body || '{}');
            const { type } = parsedBody;
            // 兼容历史字段：payload / data
            const data = (parsedBody as any).payload !== undefined
              ? (parsedBody as any).payload
              : (parsedBody as any).data;

            // 验证 type
            if (!type || typeof type !== 'string') {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ error: 'type is required' }));
              return;
            }

            // 验证 data
            if (data === undefined || data === null) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ error: 'data is required' }));
              return;
            }

            // 针对 sync-widget-content 的特殊验证
            if (type === 'sync-widget-content') {
              // 验证 widgetId（必需字段）
              if (!parsedBody.widgetId || typeof parsedBody.widgetId !== 'string') {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ error: 'widgetId is required for sync-widget-content' }));
                return;
              }

              // 验证 data.layers 不为空
              if (!data || typeof data !== 'object' || !data.layers) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ error: 'data.layers is required' }));
                return;
              }

              if (!Array.isArray(data.layers) || data.layers.length === 0) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ error: 'data.layers array is empty' }));
                return;
              }
            }

            // 针对 sync-page-content 的验证
            if (type === 'sync-page-content') {
              // 验证 data.layers 不为空
              if (!data || typeof data !== 'object' || !data.layers) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ error: 'data.layers is required' }));
                return;
              }

              if (!Array.isArray(data.layers) || data.layers.length === 0) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ error: 'data.layers array is empty' }));
                return;
              }
            }

            const clientCount = clients.size;
            
            // 如果没有客户端连接
            if (clientCount === 0) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ ok: true, sent: 0, warning: 'no clients connected' }));
              return;
            }

            console.log('[WebSocket] /api/ws/send 请求:', {
              type,
              hasPayload: data !== undefined,
              clientCount,
              bodyKeys: parsedBody && typeof parsedBody === 'object' ? Object.keys(parsedBody) : []
            });

            // 立即返回成功状态（不等待渲染完成）
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: true, sent: clientCount }));

            // 异步广播消息（不阻塞响应）
            setImmediate(() => {
              try {
                // 构建完整的消息对象，包含所有字段（type, widgetId/pageId, data, blurImages, metadata 等）
                const message: any = {
                  type,
                  ...(parsedBody.widgetId ? { widgetId: parsedBody.widgetId } : {}),
                  ...(parsedBody.pageId ? { pageId: parsedBody.pageId } : {}),
                  data,
                  ...(parsedBody.blurImages !== undefined ? { blurImages: parsedBody.blurImages } : {}),
                  ...(parsedBody.metadata ? { metadata: parsedBody.metadata } : {})
                };
                const sentCount = broadcast(clients, message);
                console.log('[WebSocket] 消息已广播:', { type, sentCount });
              } catch (err) {
                console.error('[WebSocket] 广播消息失败:', err);
              }
            });

          } catch (err) {
            console.error('[WebSocket] /api/ws/send 解析失败:', err);
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'invalid json body' }));
          }
        });
      });

      // 服务器关闭时清理
      server.httpServer?.on('close', () => {
        if (wss) {
          wss.close();
          clients.clear();
          console.log('[WebSocket] 服务器已关闭');
        }

        server.httpServer?.off?.('upgrade', handleUpgrade);
      });
    }
  };
}

/**
 * 处理 WebSocket 消息
 */
function handleMessage(
  ws: WebSocket, 
  message: WebSocketMessage, 
  clients: Set<WebSocket>
) {
  switch (message.type) {
    case 'ping':
      // 心跳检测
      ws.send(JSON.stringify({ type: 'pong' }));
      break;

    case 'broadcast':
      // 广播消息给所有客户端
      broadcast(clients, {
        type: 'broadcast',
        data: message.data
      });
      break;

    case 'echo':
      // 回显消息
      ws.send(JSON.stringify({
        type: 'echo',
        data: message.data
      }));
      break;

    default:
      // 未知消息类型，可以在这里添加自定义处理逻辑
      console.log('[WebSocket] 未处理的消息类型:', message.type);
      ws.send(JSON.stringify({
        type: 'unknown',
        message: `未知的消息类型: ${message.type}`
      }));
  }
}

/**
 * 广播消息给所有连接的客户端
 */
function broadcast(clients: Set<WebSocket>, message: WebSocketMessage) {
  const data = JSON.stringify(message);
  let count = 0;
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
      count += 1;
    }
  });
  return count;
}
