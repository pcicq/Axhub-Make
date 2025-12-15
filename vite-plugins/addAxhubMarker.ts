import type { Plugin } from 'vite';

/**
 * 添加 Axhub 标识
 * 在文件开头添加特殊标识，让第三方平台识别这是通过 Axhub 打包的组件
 */
export function addAxhubMarker(): Plugin {
  return {
    name: 'add-axhub-marker',
    enforce: 'post',

    generateBundle(options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;

        const marker = `/* @axhub-factory */\n`;
        chunk.code = marker + chunk.code;
      }
    }
  };
}
