# Image Tools 模块

图片处理工具，支持颜色提取和文本识别（OCR）功能。

## 文件结构

```
image-tools/
├── help.mjs       # 帮助信息模块
├── colors.mjs     # 颜色提取模块
├── text.mjs       # 文本识别模块（OCR）
├── analyzer.mjs   # 综合分析模块
├── utils.mjs      # 工具函数模块
└── README.md      # 本文档
```

## 模块说明

### colors.mjs
从图片中提取主要颜色信息：
- `extractColorsFromImage()` - 提取颜色
- `extractColorsCommand()` - 命令行接口
- `formatColorOutput()` - 格式化输出

使用 `extract-colors` 和 `sharp` 库实现。

### text.mjs
从图片中识别文本（OCR）：
- `extractTextFromImage()` - 提取文本
- `extractTextCommand()` - 命令行接口
- `formatTextOutput()` - 格式化输出

使用 `tesseract.js` 和 `sharp` 库实现。

### analyzer.mjs
综合分析图片（同时提取颜色和文本）：
- `analyzeImage()` - 综合分析
- `analyzeCommand()` - 命令行接口
- `generateReport()` - 生成报告

### utils.mjs
通用工具函数：
- `validateImagePath()` - 验证图片路径
- `isSupportedImageFormat()` - 检查图片格式
- `parseArgs()` - 解析命令行参数
- `formatColorToCss()` - 格式化颜色
- `log()` - 日志记录

## 使用方法

```bash
# 显示帮助
node scripts/image-tools.mjs help

# 提取颜色
node scripts/image-tools.mjs extract-colors image.jpg

# 识别文本
node scripts/image-tools.mjs extract-text screenshot.png

# 综合分析
node scripts/image-tools.mjs analyze image.jpg
```

## 功能特性

### 颜色提取
- 自动降采样提高处理速度
- 可配置最大颜色数量
- 输出包含 hex、rgb 和占比信息
- 智能去噪和颜色聚类

### 文本识别
- 支持多语言 OCR（英文、中文简体、中文繁体等）
- 图片预处理（灰度化、归一化）
- Word 级别的文本定位
- 置信度评分
- 低置信度文本标记

### 综合分析
- 同时提取颜色和文本
- 生成完整的分析报告
- 支持多种输出格式

## 依赖安装

```bash
# 安装所需依赖
pnpm add extract-colors sharp tesseract.js
```

## 配置选项

### 颜色提取选项
- `maxColors`: 最大颜色数量（默认: 8）
- `resize`: 降采样尺寸（默认: 256）
- `tolerance`: 颜色容差（默认: 10）
- `distance`: 颜色距离阈值（默认: 0.22）

### 文本识别选项
- `lang`: OCR 语言代码（默认: 'eng'）
  - `eng`: 英文
  - `chi_sim`: 中文简体
  - `chi_tra`: 中文繁体
- `resize`: 预处理尺寸（默认: 1500）
- `confidenceThreshold`: 置信度阈值（默认: 0.3）

## 输出格式

### 颜色提取输出
```json
{
  "image": "path/to/image.jpg",
  "width": 1920,
  "height": 1080,
  "colors": [
    {
      "hex": "#FF5733",
      "rgb": [255, 87, 51],
      "area": 0.2345
    }
  ]
}
```

### 文本识别输出
```json
{
  "textBlocks": [
    {
      "text": "Hello",
      "confidence": 0.95,
      "bbox": {
        "x": 100,
        "y": 200,
        "w": 50,
        "h": 20
      },
      "unknown": false
    }
  ]
}
```

## 待实现功能

所有模块的核心功能都已创建框架，但具体实现待完成：
- [ ] 颜色提取实现
- [ ] OCR 文本识别实现
- [ ] 命令行参数解析
- [ ] 多格式输出支持
- [ ] 批量处理功能
- [ ] 错误处理和重试机制
- [ ] 进度显示

## 技术栈

- **extract-colors**: 颜色提取库
- **sharp**: 高性能图片处理库
- **tesseract.js**: JavaScript OCR 引擎
