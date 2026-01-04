#!/usr/bin/env node
/**
 * =====================================================
 * CLI: check-app-ready
 *
 * 功能：
 *  - AI 调用，检测 Vite dev server 和页面状态
 *  - 不依赖页面注入
 *  - 捕获已存在和后续构建/热更新错误
 *  - 页面可访问即 READY，出现错误即 ERROR
 *  - 超时返回 TIMEOUT
 *
 * 使用：
 *   node scripts/check-app-ready.mjs [页面路径]
 *   例如：node scripts/check-app-ready.mjs /elements/button
 *        node scripts/check-app-ready.mjs /pages/home
 *
 * 输出（JSON）：
 * {
 *   status: "READY" | "ERROR" | "TIMEOUT",
 *   phase: "server|build|page|done",
 *   message: "...",
 *   url: "http://localhost:51720/elements/button",
 *   errors: [...],
 *   logs: [...]
 * }
 * =====================================================
 */

import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import process from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/* ================= 配置 ================= */
const CONFIG = {
  devCommand: 'npm run dev',        // 启动 Vite 的命令
  devServerInfoPath: path.resolve(__dirname, '../.dev-server-info.json'), // 开发服务器信息文件
  defaultPort: 51720,               // 默认端口（从 axhub.config.json 读取）
  pagePath: process.argv[2] || '/', // 目标页面路径（从命令行参数获取）
  pollIntervalMs: 500,              // 页面轮询间隔
  stableCheckMs: 1000,              // 错误稳定判断时间
  timeoutMs: 30_000                 // 总超时
}

/* ================= 工具函数 ================= */
function jsonExit(payload, code = 0) {
  process.stdout.write(JSON.stringify(payload, null, 2))
  process.exit(code)
}

/**
 * 尝试通过 HTTP 请求获取页面内容，检查是否有错误信息
 */
async function checkPageForErrors(url) {
  try {
    const res = await fetch(url, { method: 'GET' })
    const text = await res.text()
    
    // 尝试从 Vite 错误页面中提取错误对象
    const errorMatch = text.match(/const\s+error\s*=\s*({[\s\S]*?})\s*\n\s*try/);
    if (errorMatch) {
      try {
        // 解析错误对象（需要处理 JSON 中的特殊字符）
        const errorJson = errorMatch[1]
          .replace(/\\u003c/g, '<')
          .replace(/\\u003e/g, '>')
        const errorObj = JSON.parse(errorJson)
        
        // 提取关键错误信息
        const errorInfo = []
        if (errorObj.message) {
          errorInfo.push(`错误: ${errorObj.message.split('\\n')[0]}`)
        }
        if (errorObj.frame) {
          // 提取代码框架信息（去掉过长的内容）
          const frameLines = errorObj.frame.split('\\n').slice(0, 6)
          errorInfo.push('代码位置:')
          errorInfo.push(...frameLines)
        }
        if (errorObj.loc && errorObj.loc.file) {
          errorInfo.push(`文件: ${errorObj.loc.file}`)
          errorInfo.push(`行号: ${errorObj.loc.line}:${errorObj.loc.column}`)
        }
        
        return errorInfo.length > 0 ? [errorInfo.join('\n')] : []
      } catch (e) {
        // JSON 解析失败，尝试简单的文本提取
        logs.push('Failed to parse error JSON, using text extraction')
      }
    }
    
    // 备用方案：检查页面内容中是否包含错误关键词
    const errorPatterns = [
      /ERROR:\s*([^\n]+)/i,
      /SyntaxError:\s*([^\n]+)/i,
      /Transform failed/i
    ]
    
    const foundErrors = []
    for (const pattern of errorPatterns) {
      const match = text.match(pattern)
      if (match) {
        foundErrors.push(match[1] || match[0])
        break // 只取第一个匹配的错误
      }
    }
    
    return foundErrors
  } catch (err) {
    return []
  }
}

async function isServerAlive(url) {
  try {
    const res = await fetch(url, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}

/**
 * 读取开发服务器信息
 * 优先从 .dev-server-info.json 读取，如果不存在则使用默认配置
 */
function getServerInfo() {
  try {
    if (fs.existsSync(CONFIG.devServerInfoPath)) {
      const info = JSON.parse(fs.readFileSync(CONFIG.devServerInfoPath, 'utf8'))
      return {
        port: info.port || CONFIG.defaultPort,
        host: info.host || 'localhost',
        localIP: info.localIP || 'localhost'
      }
    }
  } catch (err) {
    logs.push(`Failed to read .dev-server-info.json: ${err.message}`)
  }

  // 尝试从 axhub.config.json 读取
  try {
    const configPath = path.resolve(__dirname, '../axhub.config.json')
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      return {
        port: config.server?.port || CONFIG.defaultPort,
        host: 'localhost',
        localIP: 'localhost'
      }
    }
  } catch (err) {
    logs.push(`Failed to read axhub.config.json: ${err.message}`)
  }

  return {
    port: CONFIG.defaultPort,
    host: 'localhost',
    localIP: 'localhost'
  }
}

/**
 * 生成服务器首页 URL
 * 使用 localhost 而不是 0.0.0.0，因为浏览器无法访问 0.0.0.0
 */
function getHomeUrl(serverInfo) {
  // 如果 host 是 0.0.0.0，使用 localhost 替代
  const host = serverInfo.host === '0.0.0.0' ? 'localhost' : serverInfo.host
  return `http://${host}:${serverInfo.port}`
}

/**
 * 获取可访问的 host
 * 将 0.0.0.0 转换为 localhost，因为浏览器无法直接访问 0.0.0.0
 */
function getAccessibleHost(serverInfo) {
  return serverInfo.host === '0.0.0.0' ? 'localhost' : serverInfo.host
}

/* ================= 全局状态 ================= */
let logs = []
let errors = []
let lastErrorTime = 0
let errorCache = new Set() // 用于去重错误信息

/* ================= 阶段 1：启动或 attach Vite ================= */
function startOrAttachVite() {
  logs.push('Checking Vite server...')
  const child = spawn(CONFIG.devCommand, {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: path.resolve(__dirname, '..')
  })

  child.stdout.on('data', (data) => {
    const text = data.toString().trim()
    if (text) logs.push(text)
    
    // 检测构建错误
    if (/error/i.test(text) || /failed to compile/i.test(text)) {
      errors.push(text)
      lastErrorTime = Date.now()
    }
  })

  child.stderr.on('data', (data) => {
    const text = data.toString().trim()
    if (text) {
      // 过滤掉一些正常的警告信息
      if (!/deprecated|experimental/i.test(text)) {
        errors.push(text)
        lastErrorTime = Date.now()
      }
      logs.push(text)
    }
  })

  child.on('error', (err) => {
    errors.push(`Process error: ${err.message}`)
    lastErrorTime = Date.now()
  })

  return child
}

/* ================= 阶段 2：轮询页面可访问性 ================= */
async function waitForPage(url) {
  const start = Date.now()
  let lastCheckTime = 0
  
  while (Date.now() - start < CONFIG.timeoutMs) {
    const now = Date.now()
    
    // 每隔一段时间尝试获取错误信息（即使页面不可访问）
    if (now - lastCheckTime > 2000) {
      const pageErrors = await checkPageForErrors(url)
      if (pageErrors.length > 0) {
        // 去重：只添加未见过的错误
        pageErrors.forEach(err => {
          const errorKey = err.substring(0, 200) // 使用前200个字符作为唯一标识
          if (!errorCache.has(errorKey)) {
            errorCache.add(errorKey)
            errors.push(err)
          }
        })
      }
      lastCheckTime = now
    }
    
    if (await isServerAlive(url)) return true
    await sleep(CONFIG.pollIntervalMs)
  }
  return false
}

/* ================= 阶段 3：等待稳定状态 ================= */
async function waitForStable(pageUrl) {
  const startTime = Date.now()
  
  while (Date.now() - startTime < CONFIG.timeoutMs) {
    const now = Date.now()
    
    // 页面可访问
    const pageOk = await isServerAlive(pageUrl)
    
    // 如果页面可访问，尝试检查页面内容中的错误
    if (pageOk) {
      const pageErrors = await checkPageForErrors(pageUrl)
      if (pageErrors.length > 0) {
        return {
          status: 'ERROR',
          phase: 'build',
          message: 'Detected error in page content',
          url: pageUrl,
          errors: pageErrors,
          logs
        }
      }
    }
    
    // 错误稳定：最近 stableCheckMs 内没有新的错误
    const stable = (now - lastErrorTime) > CONFIG.stableCheckMs
    
    if (!pageOk) {
      // 页面不可访问，继续轮询
      await sleep(CONFIG.pollIntervalMs)
      continue
    }
    
    if (errors.length > 0) {
      return {
        status: 'ERROR',
        phase: 'build',
        message: 'Detected Vite build/runtime error',
        url: pageUrl,
        errors,
        logs
      }
    }
    
    if (pageOk && stable) {
      return {
        status: 'READY',
        phase: 'done',
        message: 'Page ready and stable',
        url: pageUrl,
        errors: [],
        logs
      }
    }
    
    await sleep(CONFIG.pollIntervalMs)
  }
  
  return {
    status: 'TIMEOUT',
    phase: 'server',
    message: 'Timeout waiting for page/stable state',
    url: pageUrl,
    errors,
    logs
  }
}

/**
 * 为结果添加服务器首页信息
 */
function addHomeUrl(result, serverInfo) {
  return {
    ...result,
    homeUrl: getHomeUrl(serverInfo)
  }
}

/* ================= 主流程 ================= */
async function main() {
  try {
    // 获取服务器信息
    const serverInfo = getServerInfo()
    const accessibleHost = getAccessibleHost(serverInfo)
    const pageUrl = `http://${accessibleHost}:${serverInfo.port}${CONFIG.pagePath}`
    
    logs.push(`Target URL: ${pageUrl}`)
    logs.push(`Server info: port=${serverInfo.port}, host=${serverInfo.host}`)
    
    // 检查服务器是否已经在运行
    const serverAlreadyRunning = await isServerAlive(`http://${accessibleHost}:${serverInfo.port}`)
    
    let viteChild = null
    if (!serverAlreadyRunning) {
      logs.push('Server not running, starting Vite...')
      viteChild = startOrAttachVite()
    } else {
      logs.push('Server already running, skipping start')
    }
    
    // 等待页面可访问
    const pageReachable = await waitForPage(pageUrl)
    if (!pageReachable) {
      if (viteChild) viteChild.kill()
      return jsonExit(addHomeUrl({
        status: 'TIMEOUT',
        phase: 'page',
        message: 'Page never became reachable',
        url: pageUrl,
        errors,
        logs
      }, serverInfo), 1)
    }
    
    // 等待稳定状态
    const result = await waitForStable(pageUrl)
    
    // 清理进程
    if (viteChild) viteChild.kill()
    
    jsonExit(addHomeUrl(result, serverInfo), result.status === 'READY' ? 0 : 1)
  } catch (err) {
    const serverInfo = getServerInfo()
    jsonExit(addHomeUrl({
      status: 'ERROR',
      phase: 'server',
      message: err.message,
      url: CONFIG.pagePath,
      errors: [String(err)],
      logs
    }, serverInfo), 1)
  }
}

main()
