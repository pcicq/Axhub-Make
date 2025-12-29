import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';

export function handleIndexHtml(req: IncomingMessage, res: ServerResponse, devTemplate: string, htmlTemplate: string): boolean {
  if (req.url?.includes('/index.html')) {
    const urlWithoutQuery = req.url.split('?')[0];
    const urlPath = urlWithoutQuery.replace('/index.html', '');
    const pathParts = urlPath.split('/').filter(Boolean);

    console.log('[虚拟HTML] 请求路径:', req.url, '解析部分:', pathParts);

    if (pathParts.length >= 2 && ['elements', 'pages', 'themes'].includes(pathParts[0])) {
      const tsxPath = path.resolve(process.cwd(), 'src' + urlPath + '/index.tsx');
      console.log('[虚拟HTML] 检查 TSX 文件:', tsxPath, '存在:', fs.existsSync(tsxPath));

      if (fs.existsSync(tsxPath)) {
        const type = pathParts[0];
        const name = pathParts[1];
        const title = type === 'elements'
          ? `Element: ${name} - Dev Preview`
          : type === 'pages'
            ? `Page: ${name} - Dev Preview`
            : `Theme: ${name} - Dev Preview`;

        let html = devTemplate.replace(/\{\{TITLE\}\}/g, title);
        // Vite root 是 'src'，所以路径应该相对于 src 目录
        html = html.replace(/\{\{ENTRY\}\}/g, `${urlPath}/index.tsx`);

        const hackCssPath = path.resolve(process.cwd(), 'src' + urlPath + '/hack.css');
        if (fs.existsSync(hackCssPath)) {
          console.log('[虚拟HTML] 注入 hack.css:', hackCssPath);
          html = html.replace('</head>', '  <link rel="stylesheet" href="./hack.css">\n  </head>');
        }

        console.log('[虚拟HTML] ✅ 返回虚拟 HTML:', req.url);

        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        res.end(html);
        return true;
      }
    }
  }
  
  return false;
}
