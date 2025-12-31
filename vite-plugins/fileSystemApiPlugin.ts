
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
      // 处理 /api/delete-asset
      server.middlewares.use('/api/delete-asset', (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', () => {
          try {
            const { type, name } = JSON.parse(body);
            
            if (!type || !name) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing type or name parameter' }));
              return;
            }

            let targetPath = '';
            if (type === 'themes') {
              targetPath = path.resolve(process.cwd(), 'src/themes', name);
            } else if (type === 'docs') {
              targetPath = path.resolve(process.cwd(), 'assets/docs', `${name}.md`);
            } else if (type === 'libraries') {
              targetPath = path.resolve(process.cwd(), 'assets/libraries', `${name}.md`);
            } else {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid asset type' }));
              return;
            }

            if (!fs.existsSync(targetPath)) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Asset not found' }));
              return;
            }

            if (fs.statSync(targetPath).isDirectory()) {
              fs.rmSync(targetPath, { recursive: true, force: true });
            } else {
              fs.unlinkSync(targetPath);
            }

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true }));
          } catch (e: any) {
            console.error('Delete asset error:', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

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

      // 处理 /api/rename
      server.middlewares.use('/api/rename', (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', () => {
          try {
            const { path: targetPath, newName } = JSON.parse(body);

            if (!targetPath || !newName) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing path or newName parameter' }));
              return;
            }

            if (targetPath.includes('..') || targetPath.startsWith('/')) {
              res.statusCode = 403;
              res.end(JSON.stringify({ error: 'Invalid path' }));
              return;
            }

            const trimmedNewName = String(newName).trim();
            if (!trimmedNewName) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Name cannot be empty' }));
              return;
            }

            const parts = String(targetPath).split('/').filter(Boolean);
            if (parts.length !== 2 || (parts[0] !== 'elements' && parts[0] !== 'pages')) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid path' }));
              return;
            }

            const group = parts[0];
            const folderName = parts[1];
            const targetDir = path.resolve(process.cwd(), 'src', group, folderName);

            if (!fs.existsSync(targetDir)) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Directory not found' }));
              return;
            }

            // 修改 index.tsx 中的 @name 注释
            const indexPath = path.join(targetDir, 'index.tsx');
            if (!fs.existsSync(indexPath)) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'index.tsx not found' }));
              return;
            }

            let content = fs.readFileSync(indexPath, 'utf8');
            const nameRegex = /@(?:name|displayName)\s+(.+)/;
            const match = content.match(nameRegex);
            
            if (!match) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: '@name comment not found in index.tsx' }));
              return;
            }

            // 替换 @name 注释
            content = content.replace(nameRegex, `@name ${trimmedNewName}`);
            fs.writeFileSync(indexPath, content, 'utf8');

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true }));
          } catch (e: any) {
            console.error('Rename error:', e);
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

            const folderName = path.basename(srcDir);
            const parentDir = path.dirname(srcDir);
            const tmpZipPath = path.join(parentDir, `${folderName}-${Date.now()}.zip`);
            
            // Use zip command with -q flag to suppress progress output
            const child = exec(`cd "${parentDir}" && zip -q -r "${tmpZipPath}" "${folderName}"`, { 
                maxBuffer: 1024 * 1024 * 10
            });

            child.on('error', (error) => {
                console.error('Zip process error:', error);
                if (fs.existsSync(tmpZipPath)) {
                    fs.unlinkSync(tmpZipPath);
                }
                if (!res.headersSent) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: error.message }));
                }
            });

            child.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`Zip process exited with code ${code}`);
                    if (fs.existsSync(tmpZipPath)) {
                        fs.unlinkSync(tmpZipPath);
                    }
                    if (!res.headersSent) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({ error: `Zip failed with code ${code}` }));
                    }
                    return;
                }

                // Send the zip file
                try {
                    const stat = fs.statSync(tmpZipPath);
                    res.setHeader('Content-Type', 'application/zip');
                    res.setHeader('Content-Disposition', `attachment; filename="${folderName}.zip"`);
                    res.setHeader('Content-Length', stat.size);
                    
                    const readStream = fs.createReadStream(tmpZipPath);
                    readStream.pipe(res);
                    
                    readStream.on('end', () => {
                        // Clean up temp file
                        if (fs.existsSync(tmpZipPath)) {
                            fs.unlinkSync(tmpZipPath);
                        }
                    });

                    readStream.on('error', (error) => {
                        console.error('Read stream error:', error);
                        if (fs.existsSync(tmpZipPath)) {
                            fs.unlinkSync(tmpZipPath);
                        }
                    });
                } catch (e: any) {
                    console.error('Error sending zip file:', e);
                    if (fs.existsSync(tmpZipPath)) {
                        fs.unlinkSync(tmpZipPath);
                    }
                    if (!res.headersSent) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({ error: e.message }));
                    }
                }
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
