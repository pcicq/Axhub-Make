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
    const basePath = path.resolve(process.cwd(), 'src' + urlPath);
    const specMdPath = path.join(basePath, 'spec.md');
    const prdMdPath = path.join(basePath, 'prd.md');
    const name = pathParts[1];
    const type = pathParts[0] === 'elements' ? 'Element' : 'Page';

    console.log('[虚拟HTML] 检查文档文件:', { specMdPath, prdMdPath });
    console.log('[虚拟HTML] 文件存在:', { 
      spec: fs.existsSync(specMdPath),
      prd: fs.existsSync(prdMdPath)
    });

    // 收集所有存在的文档
    const docs: Array<{ key: string; label: string; url: string }> = [];
    
    if (fs.existsSync(specMdPath)) {
      docs.push({
        key: 'spec',
        label: 'Spec',
        url: `${urlPath}/spec.md`
      });
    }
    
    if (fs.existsSync(prdMdPath)) {
      docs.push({
        key: 'prd',
        label: 'PRD',
        url: `${urlPath}/prd.md`
      });
    }

    if (docs.length > 0) {
      const title = `${type}: ${name}`;
      const isMultiDoc = docs.length > 1;
      
      // 使用 spec-template.html 模板
      let html = specTemplate.replace(/\{\{TITLE\}\}/g, title);
      
      if (isMultiDoc) {
        // 多文档模式
        const docsConfig = JSON.stringify(docs);
        html = html.replace(/\{\{SPEC_URL\}\}/g, '');
        html = html.replace(/\{\{DOCS_CONFIG\}\}/g, docsConfig.replace(/"/g, '&quot;'));
        html = html.replace(/\{\{MULTI_DOC\}\}/g, 'true');
        console.log('[虚拟HTML] ✅ 返回多文档 Spec 虚拟 HTML:', req.url, '文档数:', docs.length);
      } else {
        // 单文档模式
        html = html.replace(/\{\{SPEC_URL\}\}/g, docs[0].url);
        html = html.replace(/\{\{DOCS_CONFIG\}\}/g, '[]');
        html = html.replace(/\{\{MULTI_DOC\}\}/g, 'false');
        console.log('[虚拟HTML] ✅ 返回单文档 Spec 虚拟 HTML:', req.url);
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.statusCode = 200;
      res.end(html);
      return true;
    } else {
      console.log('[虚拟HTML] ❌ 没有找到任何文档文件');
    }
  }

  // 处理 /assets/docs/* 的 spec.html 请求
  if (pathParts.length >= 2 && pathParts[0] === 'assets' && pathParts[1] === 'docs') {
    const docName = pathParts.slice(2).join('/');
    const decodedDocName = decodeURIComponent(docName);
    const mdPath = path.resolve(process.cwd(), 'assets/docs' + (decodedDocName ? '/' + decodedDocName : '') + '.md');

    console.log('[虚拟HTML] 检查 docs markdown 文件:', mdPath, '存在:', fs.existsSync(mdPath));

    if (fs.existsSync(mdPath)) {
      const title = `Docs: ${decodedDocName || 'Index'}`;
      const decodedUrlPath = decodeURIComponent(urlPath);
      const specMdUrl = `${decodedUrlPath}.md`;

      let html = specTemplate.replace(/\{\{TITLE\}\}/g, title);
      html = html.replace(/\{\{SPEC_URL\}\}/g, specMdUrl);
      html = html.replace(/\{\{DOCS_CONFIG\}\}/g, '[]');
      html = html.replace(/\{\{MULTI_DOC\}\}/g, 'false');

      console.log('[虚拟HTML] ✅ 返回 Docs 虚拟 HTML:', req.url);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.statusCode = 200;
      res.end(html);
      return true;
    } else {
      console.log('[虚拟HTML] ❌ docs markdown 不存在:', mdPath);
    }
  }

  // 处理 /assets/libraries/* 的 spec.html 请求
  if (pathParts.length >= 2 && pathParts[0] === 'assets' && pathParts[1] === 'libraries') {
    const libraryName = pathParts.slice(2).join('/');
    const decodedLibraryName = decodeURIComponent(libraryName);
    const mdPath = path.resolve(process.cwd(), 'assets/libraries', decodedLibraryName + '.md');

    console.log('[虚拟HTML] 检查 library markdown 文件:', mdPath, '存在:', fs.existsSync(mdPath));

    if (fs.existsSync(mdPath)) {
      const title = `Library: ${decodedLibraryName || 'Index'}`;
      const specMdUrl = `/assets/libraries/${decodedLibraryName}.md`;

      let html = specTemplate.replace(/\{\{TITLE\}\}/g, title);
      html = html.replace(/\{\{SPEC_URL\}\}/g, specMdUrl);
      html = html.replace(/\{\{DOCS_CONFIG\}\}/g, '[]');
      html = html.replace(/\{\{MULTI_DOC\}\}/g, 'false');

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
