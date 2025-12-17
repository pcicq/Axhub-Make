import { defineConfig } from 'vite';
import type { Plugin, UserConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { forceInlineDynamicImportsOff } from './vite-plugins/forceInlineDynamicImportsOff';
import { addAxhubMarker } from './vite-plugins/addAxhubMarker';
import { axhubComponentEnforcer } from './vite-plugins/axhubComponentEnforcer';
import { virtualHtmlPlugin } from './vite-plugins/virtualHtml';
import { websocketPlugin } from './vite-plugins/websocketPlugin';
import { injectStablePageIds } from './vite-plugins/injectStablePageIds';
import { fileSystemApiPlugin } from './vite-plugins/fileSystemApiPlugin';

const entriesPath = path.resolve(process.cwd(), 'entries.json');
let entries = { js: {}, html: {} };
if (fs.existsSync(entriesPath)) {
  entries = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
}

export default defineConfig(async (): Promise<UserConfig> => {
  const { default: react } = await import('@vitejs/plugin-react');
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

  return {
    plugins: [
      injectStablePageIds(), // 注入稳定 ID（所有模式都启用）
      virtualHtmlPlugin(),
      websocketPlugin(),
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
          entryFileNames: (chunkInfo) => `${chunkInfo.name}.js`,
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
      }
  };
});
