import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

export function handleBuildRequest(req: IncomingMessage, res: ServerResponse): boolean {
  if (req.url && req.url.startsWith('/build/') && req.url.endsWith('.js')) {
    const urlPath = req.url.replace('/build/', '').replace('.js', '');
    const entriesPath = path.resolve(process.cwd(), 'entries.json');
    const entriesData = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));

    if (entriesData.js[urlPath]) {
      console.log(`\n🔨 开始构建: ${urlPath}`);

      const result = spawnSync('npx', ['vite', 'build'], {
        cwd: process.cwd(),
        env: { ...process.env, ENTRY_KEY: urlPath },
        stdio: 'pipe'
      });

      if (result.status === 0) {
        const builtFilePath = path.resolve(process.cwd(), 'dist', `${urlPath}.js`);

        if (fs.existsSync(builtFilePath)) {
          try {
            const jsContent = fs.readFileSync(builtFilePath, 'utf8');
            console.log(`✅ 构建成功: ${urlPath}`);

            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Cache-Control', 'no-cache');
            res.statusCode = 200;
            res.end(jsContent);
            return true;
          } catch (err) {
            console.error('读取构建文件失败:', err);
          }
        } else {
          console.error('构建文件不存在:', builtFilePath);
        }
      } else {
        console.error(`❌ 构建失败: ${urlPath}`, result.stderr?.toString());
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`Build failed for ${urlPath}\n${result.stderr?.toString() || ''}`);
        return true;
      }
    }

    res.statusCode = 404;
    res.end('Not Found');
    return true;
  }
  
  return false;
}
