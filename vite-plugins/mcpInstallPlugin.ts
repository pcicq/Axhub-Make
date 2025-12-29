import type { Plugin } from 'vite';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * MCP 安装插件
 * 提供 /api/install-mcp 端点用于安装 MCP 配置到不同的客户端
 */

// 固定的 MCP 配置
const FIXED_MCP_SERVERS = {
  "deepwiki": {
    "serverUrl": "https://mcp.deepwiki.com/sse",
    "url": "https://mcp.deepwiki.com/sse"
  },
  "Chrome DevTools MCP": {
    "command": "npx",
    "args": ["-y", "chrome-devtools-mcp@latest"],
    "env": {}
  },

  "Axhub": {
    "type": "streamable-http",
    "url": "http://127.0.0.1:12308/mcp"
  },
  "microsoft-playwright-mcp": {
    "args": ["@playwright/mcp@latest"],
    "command": "npx"
  }
};

function installMCPBatch(input: {
  client: string;
  servers: Record<string, any>;
  override?: boolean;
  customPath?: string;
}) {
  const { client, servers, override = true, customPath } = input;

  if (!client) throw new Error('client is required');
  if (!servers || typeof servers !== 'object') {
    throw new Error('servers must be an object');
  }
  if (client === 'claude-code') {
    throw new Error('claude-code must be installed via CLI');
  }

  /* ---------- platform paths ---------- */
  const homeDir = os.homedir();
  const platformPaths: any = {
    win32: {
      baseDir: process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming'),
      vscodePath: path.join('Code', 'User', 'globalStorage'),
    },
    darwin: {
      baseDir: path.join(homeDir, 'Library', 'Application Support'),
      vscodePath: path.join('Code', 'User', 'globalStorage'),
    },
    linux: {
      baseDir: process.env.XDG_CONFIG_HOME || path.join(homeDir, '.config'),
      vscodePath: path.join('Code/User/globalStorage'),
    },
  };

  const platform = process.platform;
  const { baseDir, vscodePath } = platformPaths[platform];

  /* ---------- known client paths ---------- */
  const clientPaths: Record<string, string> = {
    trae: path.join(baseDir, 'Trae CN', 'User', 'mcp.json'),
    'trae-global': path.join(baseDir, 'Trae', 'User', 'mcp.json'),
    claude: path.join(baseDir, 'Claude', 'claude_desktop_config.json'),
    cline: path.join(
      baseDir,
      vscodePath,
      'saoudrizwan.claude-dev',
      'settings',
      'cline_mcp_settings.json'
    ),
    'roo-cline': path.join(
      baseDir,
      vscodePath,
      'rooveterinaryinc.roo-cline',
      'settings',
      'cline_mcp_settings.json'
    ),
    windsurf: path.join(homeDir, '.codeium', 'windsurf', 'mcp_config.json'),
    witsy: path.join(baseDir, 'Witsy', 'settings.json'),
    enconvo: path.join(homeDir, '.config', 'enconvo', 'mcp_config.json'),
    cursor: path.join(homeDir, '.cursor', 'mcp.json'),
  };

  const normalizedClient = client.toLowerCase();
  const configPath =
    customPath ||
    clientPaths[normalizedClient] ||
    path.join(baseDir, normalizedClient, 'mcp.json');

  /* ---------- read existing config ---------- */
  let config: any = { mcpServers: {} };
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config.mcpServers ||= {};
    } catch {
      config = { mcpServers: {} };
    }
  }

  /* ---------- merge servers ---------- */
  for (const [name, server] of Object.entries(servers)) {
    if (config.mcpServers[name] && !override) {
      continue;
    }
    config.mcpServers[name] = server;
  }

  /* ---------- write config ---------- */
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  return { success: true, configPath };
}

export function mcpInstallPlugin(): Plugin {
  return {
    name: 'mcp-install-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.method !== 'POST' || req.url !== '/api/install-mcp') {
          return next();
        }

        const chunks: Buffer[] = [];
        let totalLength = 0;

        req.on('data', (chunk: Buffer) => {
          totalLength += chunk.length;
          // 限制请求大小为 1MB
          if (totalLength > 1024 * 1024) {
            res.statusCode = 413;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'Payload too large' }));
            req.destroy();
            return;
          }
          chunks.push(chunk);
        });

        req.on('end', () => {
          try {
            const raw = Buffer.concat(chunks).toString('utf8');
            const body = raw ? JSON.parse(raw) : null;
            const client = body?.client;

            if (!client || typeof client !== 'string') {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ error: 'Missing or invalid client parameter' }));
              return;
            }

            // 使用固定的 MCP 配置
            const result = installMCPBatch({
              client,
              servers: FIXED_MCP_SERVERS,
              override: body?.override !== false, // 默认覆盖
              customPath: body?.customPath
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(result));
          } catch (e: any) {
            console.error('MCP install error:', e);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: e?.message || 'Installation failed' }));
          }
        });

        req.on('error', (error: any) => {
          console.error('Request error:', error);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      });
    }
  };
}
