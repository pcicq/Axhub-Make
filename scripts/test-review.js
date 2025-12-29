#!/usr/bin/env node

/**
 * 测试代码检查插件
 * 
 * 这个脚本会测试几个示例文件，验证检查功能是否正常工作
 */

import http from 'http';

const HOST = 'localhost';
const PORT = 51720;

// 测试用例
const testCases = [
  {
    name: '参考按钮组件（应该通过）',
    path: 'elements/ref-button'
  },
  {
    name: '参考首页组件（应该通过）',
    path: 'pages/ref-app-home'
  },
  {
    name: 'Landing Page（检查实际项目）',
    path: 'pages/landing-page'
  }
];

function reviewCode(targetPath) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ path: targetPath });
    
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/api/code-review',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    
    req.write(postData);
    req.end();
  });
}

function formatIssue(issue) {
  const icon = issue.type === 'error' ? '❌' : '⚠️';
  let output = `   ${icon} [${issue.rule}] ${issue.message}`;
  if (issue.suggestion) {
    output += `\n      💡 ${issue.suggestion}`;
  }
  return output;
}

async function runTests() {
  console.log('\n🧪 开始测试代码检查插件...\n');
  console.log('='.repeat(70));
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const testCase of testCases) {
    totalTests++;
    console.log(`\n📝 测试: ${testCase.name}`);
    console.log(`   路径: ${testCase.path}`);
    console.log('-'.repeat(70));
    
    try {
      const result = await reviewCode(testCase.path);
      
      if (result.error) {
        console.log(`   ❌ 检查失败: ${result.error}`);
        continue;
      }
      
      const errors = result.issues.filter(i => i.type === 'error');
      const warnings = result.issues.filter(i => i.type === 'warning');
      
      console.log(`   结果: ${result.passed ? '✅ 通过' : '❌ 未通过'}`);
      console.log(`   问题: ${errors.length} 个错误, ${warnings.length} 个警告`);
      
      if (result.issues.length > 0) {
        console.log('\n   详细信息:');
        result.issues.forEach(issue => {
          console.log(formatIssue(issue));
        });
      }
      
      if (result.passed) {
        passedTests++;
      }
      
    } catch (error) {
      console.log(`   ❌ 测试失败: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`\n📊 测试总结: ${passedTests}/${totalTests} 通过\n`);
  
  if (passedTests === totalTests) {
    console.log('✅ 所有测试通过！\n');
  } else {
    console.log('⚠️  部分测试未通过，请检查上面的详细信息。\n');
  }
}

// 检查服务器是否运行
function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(`http://${HOST}:${PORT}/api/version`, (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.error('\n❌ 错误：开发服务器未运行');
    console.log('\n请先启动开发服务器：');
    console.log('  npm run dev\n');
    process.exit(1);
  }
  
  await runTests();
}

main();
