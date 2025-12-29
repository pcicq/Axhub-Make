/**
 * 测试 MCP 安装 API
 * 
 * 使用方法：
 * 1. 启动开发服务器：npm run dev
 * 2. 运行测试：node test-mcp-install.js
 */

async function testMCPInstall() {
  const testCases = [
    { client: 'cursor', description: 'Cursor 编辑器' },
    { client: 'trae', description: 'Trae CN' },
    { client: 'windsurf', description: 'Windsurf' },
  ];

  console.log('🚀 开始测试 MCP 安装 API\n');

  for (const testCase of testCases) {
    console.log(`📦 测试安装到 ${testCase.description} (${testCase.client})...`);
    
    try {
      const response = await fetch('http://localhost:51720/api/install-mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client: testCase.client,
          override: true
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`✅ 成功！配置文件路径: ${result.configPath}\n`);
      } else {
        console.log(`❌ 失败: ${result.error}\n`);
      }
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}\n`);
    }
  }

  console.log('✨ 测试完成！');
}

testMCPInstall();
