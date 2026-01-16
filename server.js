// server.js - ESA 函数服务入口（关键：直接启动 Vite，不打包）
const { spawn } = require('child_process');
const path = require('path');

// 获取端口（优先使用 ESA 环境变量，兼容本地运行）
const port = process.env.PORT || 51720;
// Vite 启动命令
const vitePath = path.resolve(__dirname, 'node_modules/vite/bin/vite.js');

// 启动 Vite 服务（关键：用 spawn 执行，保持进程常驻）
const viteProcess = spawn('node', [vitePath, '--port', port, '--host', '0.0.0.0'], {
  cwd: __dirname,
  stdio: 'inherit', // 继承标准输出，便于查看日志
  env: {
    ...process.env,
    NODE_ENV: 'development', // 强制开发模式（项目依赖 Vite 开发服务）
    allowLAN: 'true'
  }
});

// 监听进程退出，防止服务中断
viteProcess.on('exit', (code) => {
  console.log(`Vite process exited with code ${code}, restarting...`);
  // 进程退出时自动重启（增强稳定性）
  setTimeout(() => {
    require('./server.js');
  }, 1000);
});

// 监听错误
viteProcess.on('error', (err) => {
  console.error('Vite process error:', err);
});

// 输出启动日志
console.log(`Starting Vite server on port ${port}...`);

// ESA 函数服务必须导出 handler（空实现即可，核心是启动 Vite 进程）
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: `Vite server running on port ${port}`
  };
};
