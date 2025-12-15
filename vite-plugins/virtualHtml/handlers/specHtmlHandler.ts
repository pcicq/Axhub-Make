import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';

export function handleSpecHtml(req: IncomingMessage, res: ServerResponse, specTemplate: string): boolean {
  if (req.url?.includes('/spec.html')) {
    const urlWithoutQuery = req.url.split('?')[0];
    const urlPath = urlWithoutQuery.replace('/spec.html', '');
    const pathParts = urlPath.split('/').filter(Boolean);

    console.log('[虚拟HTML] Spec 请求路径:', req.url, '解析部分:', pathParts);

    if (pathParts.length >= 2 && ['elements', 'pages'].includes(pathParts[0])) {
      const mdPath = path.resolve(process.cwd(), 'src' + urlPath + '/spec.md');
      const name = pathParts[1];
      const type = pathParts[0] === 'elements' ? 'Element' : 'Page';

      console.log('[虚拟HTML] 检查 spec.md 文件:', mdPath, '存在:', fs.existsSync(mdPath));

      if (fs.existsSync(mdPath)) {
        const title = `${type}: ${name}`;
        const specMdUrl = `${urlPath}/spec.md`;

        let html = specTemplate.replace('{{TITLE}}', title);
        html = html.replace('{{SPEC_URL}}', specMdUrl);

        console.log('[虚拟HTML] ✅ 返回 Spec 虚拟 HTML:', req.url);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.statusCode = 200;
        res.end(html);
        return true;
      } else {
        console.log('[虚拟HTML] ❌ spec.md 不存在:', mdPath);
      }
    }
  }
  
  return false;
}
