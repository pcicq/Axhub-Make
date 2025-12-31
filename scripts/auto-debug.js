#!/usr/bin/env node

/**
 * 自动调试脚本
 * 用于在代码生成后自动执行检测和修复
 * 
 * 使用方法：
 * node scripts/auto-debug.js pages/user-list
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// ANSI 颜色代码
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

/**
 * 步骤 1: 构建时检测
 */
async function buildTimeCheck(targetPath) {
  logStep('1/3', '构建时检测');
  
  const srcFile = path.join(rootDir, 'src', targetPath, 'index.tsx');
  
  if (!fs.existsSync(srcFile)) {
    logError(`文件不存在: ${srcFile}`);
    return { success: false, errors: [{ message: 'File not found' }] };
  }
  
  const code = fs.readFileSync(srcFile, 'utf8');
  const errors = [];
  
  // 检查 1: export default
  if (!code.includes('export default')) {
    errors.push({
      type: 'export',
      severity: 'error',
      message: '缺少 export default',
      suggestion: '在文件末尾添加 "export default Component"'
    });
  }
  
  // 检查 2: @name 注释
  if (!code.match(/@(?:name|displayName)\s+.+/)) {
    errors.push({
      type: 'metadata',
      severity: 'error',
      message: '缺少 @name 注释',
      suggestion: '在文件顶部添加 "/** @name 组件名称 */"'
    });
  }
  
  // 检查 3: TypeScript 类型检查
  try {
    log('  正在执行 TypeScript 类型检查...', 'gray');
    await execAsync('npx tsc --noEmit', { cwd: rootDir, timeout: 30000 });
    logSuccess('TypeScript 类型检查通过');
  } catch (e) {
    if (e.stderr) {
      const typeErrors = parseTypeScriptErrors(e.stderr, targetPath);
      if (typeErrors.length > 0) {
        errors.push(...typeErrors);
        logError(`发现 ${typeErrors.length} 个类型错误`);
      }
    }
  }
  
  // 检查 4: 尝试构建
  try {
    log('  正在尝试构建...', 'gray');
    await execAsync(`ENTRY_KEY=${targetPath} npm run build`, { 
      cwd: rootDir, 
      timeout: 60000 
    });
    logSuccess('构建成功');
  } catch (e) {
    logError('构建失败');
    if (e.stderr) {
      errors.push({
        type: 'build',
        severity: 'error',
        message: '构建失败',
        details: e.stderr.substring(0, 500)
      });
    }
  }
  
  if (errors.length === 0) {
    logSuccess('构建时检测通过');
    return { success: true, errors: [] };
  } else {
    logError(`发现 ${errors.length} 个问题`);
    return { success: false, errors };
  }
}

/**
 * 步骤 2: 自动修复
 */
async function autoFix(targetPath, errors) {
  logStep('2/3', '自动修复');
  
  const srcFile = path.join(rootDir, 'src', targetPath, 'index.tsx');
  let code = fs.readFileSync(srcFile, 'utf8');
  let fixed = false;
  const changes = [];
  
  for (const error of errors) {
    // 修复 1: 添加 export default
    if (error.type === 'export') {
      const componentMatch = code.match(/const\s+(\w+)\s*=\s*function/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        code += `\n\nexport default ${componentName};\n`;
        fixed = true;
        changes.push(`添加: export default ${componentName}`);
        logSuccess(`已添加 export default ${componentName}`);
      }
    }
    
    // 修复 2: 添加 @name 注释
    if (error.type === 'metadata') {
      const folderName = path.basename(path.dirname(srcFile));
      const displayName = folderName.split('-').map(w => 
        w.charAt(0).toUpperCase() + w.slice(1)
      ).join(' ');
      
      code = `/**\n * @name ${displayName}\n */\n${code}`;
      fixed = true;
      changes.push(`添加: @name ${displayName}`);
      logSuccess(`已添加 @name ${displayName}`);
    }
    
    // 修复 3: 添加空值检查
    if (error.message && (error.message.includes('null') || error.message.includes('undefined'))) {
      const mapPattern = /(\w+)\.map\(/g;
      let match;
      while ((match = mapPattern.exec(code)) !== null) {
        const varName = match[1];
        const hasCheck = new RegExp(`${varName}\\s*&&|\\|\\||\\?\\.|if\\s*\\(${varName}\\)`).test(code);
        if (!hasCheck) {
          code = code.replace(
            new RegExp(`${varName}\\.map\\(`),
            `(${varName} || []).map(`
          );
          fixed = true;
          changes.push(`添加空值检查: ${varName}.map()`);
          logSuccess(`已为 ${varName}.map() 添加空值检查`);
        }
      }
    }
  }
  
  if (fixed) {
    fs.writeFileSync(srcFile, code, 'utf8');
    logSuccess(`已修复 ${changes.length} 个问题`);
    return { success: true, fixed: true, changes };
  } else {
    logWarning('没有可自动修复的问题');
    return { success: true, fixed: false, changes: [] };
  }
}

/**
 * 步骤 3: 运行时检测
 */
async function runtimeCheck(targetPath) {
  logStep('3/3', '运行时检测');
  
  log('  提示: 运行时检测需要启动开发服务器', 'gray');
  log('  请运行: npm run dev', 'gray');
  log('  然后在浏览器中打开页面，观察是否有错误', 'gray');
  
  // 这里可以集成 Puppeteer 或其他无头浏览器进行自动化测试
  // 但为了简化，我们只提供提示
  
  return { success: true };
}

/**
 * 显示错误详情
 */
function displayErrors(errors) {
  log('\n错误详情:', 'red');
  errors.forEach((error, index) => {
    log(`\n[${index + 1}] ${error.message}`, 'red');
    if (error.line) {
      log(`  位置: 第 ${error.line} 行`, 'gray');
    }
    if (error.suggestion) {
      log(`  建议: ${error.suggestion}`, 'yellow');
    }
    if (error.details) {
      log(`  详情: ${error.details}`, 'gray');
    }
  });
}

/**
 * 解析 TypeScript 错误
 */
function parseTypeScriptErrors(stderr, targetPath) {
  const errors = [];
  const lines = stderr.split('\n');
  
  lines.forEach(line => {
    const match = line.match(/src\/(.+?)\((\d+),(\d+)\):\s*(error|warning)\s+TS\d+:\s*(.+)/);
    if (match && match[1].includes(targetPath)) {
      errors.push({
        type: 'type',
        severity: match[4],
        message: match[5],
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        suggestion: '检查 TypeScript 类型定义'
      });
    }
  });
  
  return errors;
}

/**
 * 主函数
 */
async function main() {
  const targetPath = process.argv[2];
  
  if (!targetPath) {
    logError('用法: node scripts/auto-debug.js <path>');
    logError('示例: node scripts/auto-debug.js pages/user-list');
    process.exit(1);
  }
  
  log('\n='.repeat(60), 'blue');
  log('自动调试工具', 'blue');
  log('='.repeat(60), 'blue');
  log(`目标: ${targetPath}\n`, 'blue');
  
  try {
    // 步骤 1: 构建时检测
    const checkResult = await buildTimeCheck(targetPath);
    
    if (!checkResult.success) {
      displayErrors(checkResult.errors);
      
      // 步骤 2: 尝试自动修复
      const fixResult = await autoFix(targetPath, checkResult.errors);
      
      if (fixResult.fixed) {
        log('\n正在重新检测...', 'blue');
        const recheckResult = await buildTimeCheck(targetPath);
        
        if (recheckResult.success) {
          logSuccess('\n所有问题已修复！');
        } else {
          logWarning('\n部分问题已修复，但仍有错误需要人工处理');
          displayErrors(recheckResult.errors);
        }
      } else {
        logWarning('\n这些问题需要人工处理');
      }
    }
    
    // 步骤 3: 运行时检测提示
    await runtimeCheck(targetPath);
    
    log('\n='.repeat(60), 'blue');
    log('调试完成', 'green');
    log('='.repeat(60), 'blue');
    
  } catch (error) {
    logError(`\n调试过程出错: ${error.message}`);
    process.exit(1);
  }
}

main();
