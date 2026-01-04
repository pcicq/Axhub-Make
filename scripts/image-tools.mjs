#!/usr/bin/env node

/**
 * Image Tools Script
 * 
 * 主入口文件，提供命令行接口
 * 支持图片颜色提取功能
 */

import { showHelp } from './image-tools/help.mjs';
import { extractColorsCommand } from './image-tools/colors.mjs';
import { analyzeCommand } from './image-tools/analyzer.mjs';

const args = process.argv.slice(2);
const command = args[0] || 'help';
const commandArgs = args.slice(1);

async function main() {
  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    
    case 'extract-colors':
    case 'analyze': // analyze 现在等同于 extract-colors
      await extractColorsCommand(commandArgs);
      break;
    
    default:
      console.log(`Unknown command: ${command}`);
      console.log('Run "node scripts/image-tools.mjs help" for usage information.');
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error:', error.message);
  if (error.stack) {
    console.error('\nStack trace:');
    console.error(error.stack);
  }
  process.exit(1);
});
