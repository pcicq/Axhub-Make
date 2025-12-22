import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';

export function handleSpecHtml(req: IncomingMessage, res: ServerResponse, specTemplate: string): boolean {
  if (!req.url?.includes('/spec.html')) {
    return false;
  }

  const urlWithoutQuery = req.url.split('?')[0];
  const urlPath = urlWithoutQuery.replace('/spec.html', '');
  const pathParts = urlPath.split('/').filter(Boolean);

  console.log('[虚拟HTML] Spec 请求路径:', req.url, '解析部分:', pathParts);

  // 处理 /pages/* 或 /elements/* 的 spec.html 请求
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

  // 处理 /assets/docs/* 的 spec.html 请求（用于 assets/docs 目录下的文档）
  if (pathParts.length >= 2 && pathParts[0] === 'assets' && pathParts[1] === 'docs') {
    const docName = pathParts.slice(2).join('/');
    // 对 docName 进行 URL 解码
    const decodedDocName = decodeURIComponent(docName);
    const mdPath = path.resolve(process.cwd(), 'assets/docs' + (decodedDocName ? '/' + decodedDocName : '') + '.md');

    console.log('[虚拟HTML] 检查 docs markdown 文件:', mdPath, '存在:', fs.existsSync(mdPath));

    if (fs.existsSync(mdPath)) {
      const title = `Docs: ${decodedDocName || 'Index'}`;
      // 对 urlPath 进行 URL 解码后再添加 .md
      const decodedUrlPath = decodeURIComponent(urlPath);
      const specMdUrl = `${decodedUrlPath}.md`;

      let html = specTemplate.replace('{{TITLE}}', title);
      html = html.replace('{{SPEC_URL}}', specMdUrl);

      console.log('[虚拟HTML] ✅ 返回 Docs 虚拟 HTML:', req.url);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.statusCode = 200;
      res.end(html);
      return true;
    } else {
      console.log('[虚拟HTML] ❌ docs markdown 不存在:', mdPath);
    }
  }

  // 处理 /assets/libraries/* 的 spec.html 请求（用于 assets/libraries 目录下的前端库）
  if (pathParts.length >= 2 && pathParts[0] === 'assets' && pathParts[1] === 'libraries') {
    const libraryName = pathParts.slice(2).join('/');
    // 对 libraryName 进行 URL 解码
    const decodedLibraryName = decodeURIComponent(libraryName);
    const mdPath = path.resolve(process.cwd(), 'assets/libraries', decodedLibraryName + '.md');

    console.log('[虚拟HTML] 检查 library markdown 文件:', mdPath, '存在:', fs.existsSync(mdPath));

    if (fs.existsSync(mdPath)) {
      const title = `Library: ${decodedLibraryName || 'Index'}`;
      // 构建正确的 markdown URL
      const specMdUrl = `/assets/libraries/${decodedLibraryName}.md`;

      let html = specTemplate.replace('{{TITLE}}', title);
      html = html.replace('{{SPEC_URL}}', specMdUrl);

      console.log('[虚拟HTML] ✅ 返回 Library 虚拟 HTML:', req.url);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.statusCode = 200;
      res.end(html);
      return true;
    } else {
      console.log('[虚拟HTML] ❌ library markdown 不存在:', mdPath);
    }
  }

  return false;
}
