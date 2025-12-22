import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import react from '@vitejs/plugin-react';
import { forceInlineDynamicImportsOff } from './vite-plugins/forceInlineDynamicImportsOff';
import { addAxhubMarker } from './vite-plugins/addAxhubMarker';
import { axhubComponentEnforcer } from './vite-plugins/axhubComponentEnforcer';
import { virtualHtmlPlugin } from './vite-plugins/virtualHtml';
import { websocketPlugin } from './vite-plugins/websocketPlugin';
import { injectStablePageIds } from './vite-plugins/injectStablePageIds';
import { fileSystemApiPlugin } from './vite-plugins/fileSystemApiPlugin';

// 服务 admin 目录下的静态文件
function serveAdminPlugin(): Plugin {
  // 检测项目结构：判断当前目录是否在 apps/xxx/ 下
  const currentDir = __dirname;
  const appsMatch = currentDir.match(/[\/\\]apps[\/\\]([^\/\\]+)/);
  
  let projectPrefix = '';
  if (appsMatch) {
    // 在 apps/xxx/ 结构下，说明是混合项目
    // 需要找到包含 entries.json 的项目目录（通常是主项目）
    const rootDir = currentDir.split(/[\/\\]apps[\/\\]/)[0];
    const appsDir = path.join(rootDir, 'apps');
    
    if (fs.existsSync(appsDir)) {
      const appFolders = fs.readdirSync(appsDir);
      for (const folder of appFolders) {
        const folderPath = path.join(appsDir, folder);
        const entriesPath = path.join(folderPath, 'entries.json');
        if (fs.existsSync(entriesPath)) {
          projectPrefix = `apps/${folder}/`;
          break;
        }
      }
    }
  }
  
  const isMixedProject = !!projectPrefix;
  
  // 注入到 HTML 的脚本
  const injectScript = `
  <script>
    // 项目路径配置（根据项目结构自动检测）
    window.__PROJECT_PREFIX__ = '${projectPrefix}';
    window.__IS_MIXED_PROJECT__ = ${isMixedProject};
  </script>`;
  
  return {
    name: 'serve-admin-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const adminDir = path.resolve(__dirname, 'admin');
        
        // 处理根路径 / 或 /index.html
        if (req.url === '/' || req.url === '/index.html') {
          const indexPath = path.join(adminDir, 'index.html');
          if (fs.existsSync(indexPath)) {
            let html = fs.readFileSync(indexPath, 'utf8');
            // 注入项目路径配置
            html = html.replace('</head>', `${injectScript}\n</head>`);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(html);
            return;
          }
        }
        
        // 处理 /*.html 请求（如 /projects.html）
        if (req.url && req.url.match(/^\/[^/]+\.html$/)) {
          const htmlPath = path.join(adminDir, req.url);
          if (fs.existsSync(htmlPath)) {
            let html = fs.readFileSync(htmlPath, 'utf8');
            // 注入项目路径配置
            html = html.replace('</head>', `${injectScript}\n</head>`);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(html);
            return;
          }
        }
        
        // 处理 /assets/* 静态资源
        if (req.url && req.url.startsWith('/assets/')) {
          const assetPath = path.join(adminDir, req.url);
          if (fs.existsSync(assetPath)) {
            const ext = path.extname(assetPath);
            const contentTypes: Record<string, string> = {
              '.js': 'application/javascript',
              '.css': 'text/css',
              '.json': 'application/json',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.svg': 'image/svg+xml',
              '.ico': 'image/x-icon'
            };
            res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
            res.end(fs.readFileSync(assetPath));
            return;
          }
        }
        
        // 处理 /images/* 静态资源
        if (req.url && req.url.startsWith('/images/')) {
          const imagePath = path.join(adminDir, req.url);
          if (fs.existsSync(imagePath)) {
            const ext = path.extname(imagePath);
            const contentTypes: Record<string, string> = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.gif': 'image/gif',
              '.svg': 'image/svg+xml',
              '.ico': 'image/x-icon'
            };
            res.setHeader('Content-Type', contentTypes[ext] || 'image/png');
            res.end(fs.readFileSync(imagePath));
            return;
          }
        }
        
        next();
      });
    }
  };
}

// 提供 /api/download-dist 端点的插件
function downloadDistPlugin(): Plugin {
  return {
    name: 'download-dist-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.method !== 'GET' || req.url !== '/api/download-dist') {
          return next();
        }

        try {
          const distDir = path.resolve(__dirname, 'dist');

          if (!fs.existsSync(distDir)) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Dist directory not found' }));
            return;
          }

          // 读取 package.json 获取项目名称
          let projectName = 'project';
          try {
            const pkgPath = path.resolve(__dirname, 'package.json');
            if (fs.existsSync(pkgPath)) {
              const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
              projectName = pkg.name || 'project';
            }
          } catch (e) {
            console.warn('Failed to read project name from package.json:', e);
          }

          res.setHeader('Content-Type', 'application/zip');
          res.setHeader('Content-Disposition', `attachment; filename="${projectName}-dist.zip"`);

          // Use zip command (available on macOS/Linux)
          const child = exec(`cd "${distDir}" && zip -r - .`, { maxBuffer: 1024 * 1024 * 50 });

          if (child.stdout) {
            child.stdout.pipe(res);
          } else {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to create zip stream' }));
          }

          child.stderr?.on('data', (data: any) => {
            console.error(`zip stderr: ${data}`);
          });

          child.on('error', (error: any) => {
            console.error('Download dist error:', error);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: error.message }));
            }
          });
        } catch (e: any) {
          console.error('Download dist error:', e);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        }
      });
    }
  };
}

// 提供 /api/version 端点的插件
function versionApiPlugin(): Plugin {
  return {
    name: 'version-api-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.method !== 'GET' || req.url !== '/api/version') {
          return next();
        }

        try {
          const pkgPath = path.resolve(__dirname, 'package.json');
          const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf8')) : null;
          const version = pkg?.version ?? null;

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify({ version }));
        } catch (e: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: e?.message || 'Unknown error' }));
        }
      });
    }
  };
}

// 提供 /api/docs 端点的插件
function docsApiPlugin(): Plugin {
  return {
    name: 'docs-api-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.method !== 'GET' || !req.url.startsWith('/api/docs')) {
          return next();
        }

        // 处理 /api/docs/:name 端点用于获取单个文档内容
        if (req.url !== '/api/docs' && req.url !== '/api/docs/') {
          try {
            const docName = req.url.replace('/api/docs/', '').split('?')[0];
            if (!docName) {
              return next();
            }

            const docsDir = path.resolve(__dirname, 'assets/docs');
            const docPath = path.join(docsDir, `${docName}.md`);

            // 安全检查：确保路径在 assets/docs 目录内
            if (!docPath.startsWith(docsDir)) {
              res.statusCode = 403;
              res.end(JSON.stringify({ error: 'Forbidden' }));
              return;
            }

            if (fs.existsSync(docPath)) {
              const content = fs.readFileSync(docPath, 'utf8');
              res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
              res.end(content);
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Document not found' }));
            }
          } catch (error: any) {
            console.error('Error loading doc:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
          return;
        }

        // 处理 /api/docs 端点用于获取文档列表
        try {
          const docsDir = path.resolve(__dirname, 'assets/docs');
          const docs: any[] = [];

          if (fs.existsSync(docsDir)) {
            const items = fs.readdirSync(docsDir, { withFileTypes: true });
            
            items.forEach(item => {
              // 只读取第一层目录的 .md 文件
              if (item.isFile() && item.name.endsWith('.md')) {
                const name = item.name.replace('.md', '');
                
                docs.push({
                  name,
                  displayName: name
                });
              }
            });
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(docs));
        } catch (error: any) {
          console.error('Error loading docs:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }
      });

      // 处理 /api/libraries 端点用于获取前端库列表
      server.middlewares.use('/api/libraries', (_req: any, res: any) => {
        try {
          const librariesDir = path.resolve(__dirname, 'assets/libraries');
          const libraries: any[] = [];

          if (fs.existsSync(librariesDir)) {
            const items = fs.readdirSync(librariesDir, { withFileTypes: true });
            
            items.forEach(item => {
              // 只读取 .md 文件
              if (item.isFile() && item.name.endsWith('.md')) {
                const name = item.name.replace('.md', '');
                
                libraries.push({
                  name,
                  displayName: name
                });
              }
            });
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(libraries));
        } catch (error: any) {
          console.error('Error loading libraries:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    }
  };
}

function uploadDocsApiPlugin(): Plugin {
  return {
    name: 'upload-docs-api-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.method !== 'POST' || req.url !== '/api/upload-docs') {
          return next();
        }

        const chunks: Buffer[] = [];
        let totalLength = 0;

        req.on('data', (chunk: Buffer) => {
          totalLength += chunk.length;
          if (totalLength > 1024 * 1024 * 20) {
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
            const files = body?.files;

            if (!Array.isArray(files) || files.length === 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ error: 'Missing files' }));
              return;
            }

            const docsDir = path.resolve(__dirname, 'assets/docs');
            fs.mkdirSync(docsDir, { recursive: true });

            const saved: string[] = [];

            files.forEach((f: any) => {
              const rawName = typeof f?.name === 'string' ? f.name : '';
              const content = typeof f?.content === 'string' ? f.content : '';

              if (!rawName) {
                throw new Error('Invalid file name');
              }

              let safeName = path.basename(rawName).trim();
              safeName = safeName.replace(/[^\w.\- ]+/g, '-').replace(/\s+/g, '-');
              if (!safeName.toLowerCase().endsWith('.md')) {
                throw new Error('Only .md files are allowed');
              }

              const targetPath = path.join(docsDir, safeName);
              if (!targetPath.startsWith(docsDir)) {
                throw new Error('Forbidden');
              }

              fs.writeFileSync(targetPath, content, 'utf8');
              saved.push(safeName.replace(/\.md$/i, ''));
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ success: true, files: saved }));
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: e?.message || 'Upload failed' }));
          }
        });
      });
    }
  };
}

function themesApiPlugin(): Plugin {
  return {
    name: 'themes-api-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.method !== 'GET' || !req.url.startsWith('/api/themes')) {
          return next();
        }

        // 处理 /api/themes/:name 端点用于获取单个主题内容
        if (req.url !== '/api/themes' && req.url !== '/api/themes/') {
          try {
            const themeName = req.url.replace('/api/themes/', '').split('?')[0];
            if (!themeName) {
              return next();
            }

            const themesDir = path.resolve(__dirname, 'src/themes');
            const themeDir = path.join(themesDir, themeName);

            // 安全检查：确保路径在 themes 目录内
            if (!themeDir.startsWith(themesDir)) {
              res.statusCode = 403;
              res.end(JSON.stringify({ error: 'Forbidden' }));
              return;
            }

            if (fs.existsSync(themeDir) && fs.statSync(themeDir).isDirectory()) {
              const designTokenPath = path.join(themeDir, 'designToken.json');
              const indexHtmlPath = path.join(themeDir, 'index.html');
              
              const themeData: any = { name: themeName, displayName: themeName };
              
              if (fs.existsSync(designTokenPath)) {
                try {
                  const designToken = JSON.parse(fs.readFileSync(designTokenPath, 'utf8'));
                  themeData.designToken = designToken;
                  if (designToken && designToken.name) {
                    themeData.displayName = designToken.name;
                  }
                } catch (e) {
                  console.error('Error parsing designToken.json:', e);
                }
              }
              
              if (fs.existsSync(indexHtmlPath)) {
                themeData.indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
              }
              
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(themeData));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Theme not found' }));
            }
          } catch (error: any) {
            console.error('Error loading theme:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
          return;
        }

        // 处理 /api/themes 端点用于获取主题列表
        try {
          const themesDir = path.resolve(__dirname, 'src/themes');
          const themes: any[] = [];

          if (fs.existsSync(themesDir)) {
            const items = fs.readdirSync(themesDir, { withFileTypes: true });
            
            items.forEach(item => {
              // 只读取第一层目录
              if (item.isDirectory()) {
                const themeDir = path.join(themesDir, item.name);
                const designTokenPath = path.join(themeDir, 'designToken.json');
                let displayName = item.name;

                if (fs.existsSync(designTokenPath)) {
                  try {
                    const designToken = JSON.parse(fs.readFileSync(designTokenPath, 'utf8'));
                    if (designToken && designToken.name) {
                      displayName = designToken.name;
                    }
                  } catch (e) {
                    console.error(`Error loading theme ${item.name} designToken:`, e);
                  }
                }

                themes.push({
                  name: item.name,
                  displayName: displayName
                });
              }
            });
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(themes));
        } catch (error: any) {
          console.error('Error loading themes:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    }
  };
}

const entriesPath = path.resolve(process.cwd(), 'entries.json');
let entries = { js: {}, html: {} };
if (fs.existsSync(entriesPath)) {
  entries = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
}

const entryKey = process.env.ENTRY_KEY;
const jsEntries = entries.js as Record<string, string>;
const htmlEntries = entries.html as Record<string, string>;

const hasSingleEntry = typeof entryKey === 'string' && entryKey.length > 0;
let rollupInput: Record<string, string> = htmlEntries;

if (hasSingleEntry) {
  if (!jsEntries[entryKey as string]) {
    throw new Error(`ENTRY_KEY=${entryKey} 未在 entries.js 中找到对应入口文件`);
  }
  rollupInput = { [entryKey as string]: jsEntries[entryKey as string] };
}

const isIifeBuild = hasSingleEntry;

const config: any = {
  plugins: [
    serveAdminPlugin(), // 服务 admin 目录（需要在最前面）
    injectStablePageIds(), // 注入稳定 ID（所有模式都启用）
    virtualHtmlPlugin(),
    websocketPlugin(),
    versionApiPlugin(), // 提供 /api/version 端点
    downloadDistPlugin(), // 提供 /api/download-dist 端点
    docsApiPlugin(), // 提供 /api/docs 端点
    uploadDocsApiPlugin(),
    themesApiPlugin(), // 提供 /api/themes 端点
    fileSystemApiPlugin(),
    forceInlineDynamicImportsOff(isIifeBuild),
    isIifeBuild
      ? react({
        jsxRuntime: 'classic',
        babel: { configFile: false, babelrc: false }
      })
      : null,
    isIifeBuild ? addAxhubMarker() : null,
    isIifeBuild ? axhubComponentEnforcer(jsEntries[entryKey as string]) : null
  ].filter(Boolean) as Plugin[],

  root: 'src',

  optimizeDeps: {
    exclude: ['react', 'react-dom']
  },

  resolve: {
    alias: [
      !isIifeBuild && {
        find: /^react\/.*/,
        replacement: path.resolve(__dirname, 'src/common/react-shim.js')
      },
      !isIifeBuild && {
        find: /^react-dom\/.*/,
        replacement: path.resolve(__dirname, 'src/common/react-dom-shim.js')
      },
      !isIifeBuild && {
        find: 'react',
        replacement: path.resolve(__dirname, 'src/common/react-shim.js')
      },
      !isIifeBuild && {
        find: 'react-dom',
        replacement: path.resolve(__dirname, 'src/common/react-dom-shim.js')
      }
    ].filter(Boolean) as { find: string | RegExp; replacement: string }[]
  },

  server: {
    port: 51720,
    host: true,
    open: '/',
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  },

  build: {
    outDir: path.resolve(process.cwd(), 'dist'),
    emptyOutDir: !isIifeBuild,
    target: isIifeBuild ? 'es2015' : 'esnext',

    rollupOptions: {
      input: rollupInput,

      external: isIifeBuild ? ['react', 'react-dom'] : [],

      output: {
        entryFileNames: (chunkInfo: { name: string }) => `${chunkInfo.name}.js`,
        format: isIifeBuild ? 'iife' : 'es',
        name: 'UserComponent',

        ...(isIifeBuild
          ? {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM'
            },
            generatedCode: { constBindings: false }
          }
          : {})
      }
    },

    minify: isIifeBuild ? 'esbuild' : false
  },

  esbuild: isIifeBuild
    ? {
      target: 'es2015',
      legalComments: 'none',
      keepNames: true
    }
    : {
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment'
    },

  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    root: '.',
  }
};

export default defineConfig(config);
