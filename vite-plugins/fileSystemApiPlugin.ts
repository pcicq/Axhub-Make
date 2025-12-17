
import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

/**
 * 文件系统 API 插件
 * 提供 /api/delete 和 /api/zip 等文件操作接口
 */
export function fileSystemApiPlugin(): Plugin {
  return {
    name: 'file-system-api',
    configureServer(server) {
      // 处理 /api/delete
      server.middlewares.use('/api/delete', (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', () => {
          try {
            const { path: targetPath } = JSON.parse(body);
            
            if (!targetPath) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing path parameter' }));
              return;
            }

            // Validate path
            if (targetPath.includes('..') || targetPath.startsWith('/')) {
              res.statusCode = 403;
              res.end(JSON.stringify({ error: 'Invalid path' }));
              return;
            }

            const srcDir = path.resolve(process.cwd(), 'src', targetPath);

            if (!fs.existsSync(srcDir)) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Directory not found' }));
              return;
            }

            fs.rmSync(srcDir, { recursive: true, force: true });
            
            // 更新 entries.json
            const entriesPath = path.resolve(process.cwd(), 'entries.json');
            if (fs.existsSync(entriesPath)) {
                try {
                    const entries = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
                    const keyToRemove = targetPath; // e.g. 'pages/xxx'
                    
                    let changed = false;
                    if (entries.js && entries.js[keyToRemove]) {
                        delete entries.js[keyToRemove];
                        changed = true;
                    }
                    if (entries.html && entries.html[keyToRemove]) {
                        delete entries.html[keyToRemove];
                        changed = true;
                    }
                    
                    if (changed) {
                        fs.writeFileSync(entriesPath, JSON.stringify(entries, null, 2));
                    }
                } catch (e) {
                    console.error('Error updating entries.json:', e);
                }
            }

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true }));
          } catch (e: any) {
            console.error('Delete error:', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

      // 处理 /api/entries.json
      server.middlewares.use('/api/entries.json', (_req: any, res: any) => {
        const entriesPath = path.resolve(process.cwd(), 'entries.json');
        if (!fs.existsSync(entriesPath)) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'entries.json not found' }));
          return;
        }

        const entries = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
        const jsEntries = entries.js as Record<string, string>;
        
        // 转换为前端需要的格式
        const elements: any[] = [];
        const pages: any[] = [];

        Object.entries(jsEntries).forEach(([key, filePath]) => {
          const isPage = key.startsWith('pages/');
          const name = key.split('/').pop() || key;
          const displayName = name.charAt(0).toUpperCase() + name.slice(1);
          const isReference = name.startsWith('ref-');
          
          const item = {
            name,
            displayName,
            jsUrl: `/${key}.js`,
            demoUrl: `/${key}.html`,
            specUrl: `/spec-template.html?url=/${key}/spec.md`,
            filePath: filePath,
            isReference
          };

          if (isPage) {
            pages.push(item);
          } else {
            elements.push(item);
          }
        });

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ elements, pages }));
      });

      // 处理 /api/zip
      server.middlewares.use('/api/zip', (req: any, res: any) => {
        try {
            // 解析 URL，兼容 req.url 可能不包含 host 的情况
            const protocol = req.protocol || 'http';
            const host = req.headers.host || 'localhost';
            const url = new URL(req.url, `${protocol}://${host}`);
            const targetPath = url.searchParams.get('path'); // e.g., 'pages/antd-demo'

            if (!targetPath) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing path parameter' }));
                return;
            }

            // Validate path to prevent directory traversal
            if (targetPath.includes('..') || targetPath.startsWith('/')) {
                 res.statusCode = 403;
                 res.end(JSON.stringify({ error: 'Invalid path' }));
                 return;
            }

            const srcDir = path.resolve(process.cwd(), 'src', targetPath);

            if (!fs.existsSync(srcDir)) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Directory not found' }));
                return;
            }

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${path.basename(targetPath)}.zip"`);

            // Use zip command (available on macOS/Linux)
            const child = exec(`cd "${srcDir}" && zip -r - .`, { maxBuffer: 1024 * 1024 * 10 });

            if (child.stdout) {
                child.stdout.pipe(res);
            } else {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to create zip stream' }));
            }
            
            child.stderr?.on('data', (data) => {
                console.error(`zip stderr: ${data}`);
            });

        } catch (e: any) {
            console.error('Zip error:', e);
            if (!res.headersSent) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
            }
        }
      });
    }
  };
}
