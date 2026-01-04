/**
 * Help Module
 * 
 * 显示图片处理脚本的使用帮助信息
 */

export function showHelp() {
  console.log(`
Image Tools Script - 图片处理工具

用法:
  node scripts/image-tools.mjs [command] <image1> [image2] [image3] ...

命令:
  help                      显示此帮助信息（默认命令）
  extract-colors <image...> 从图片中提取主要颜色（支持批量）
  analyze <image...>        分析图片并提取颜色信息（支持批量）

示例:
  # 显示帮助
  node scripts/image-tools.mjs help
  
  # 单个图片提取颜色
  node scripts/image-tools.mjs extract-colors image.jpg
  
  # 批量提取颜色
  node scripts/image-tools.mjs extract-colors image1.jpg image2.jpg image3.jpg
  
  # 批量分析图片
  node scripts/image-tools.mjs analyze image1.jpg image2.jpg

输出格式:
  所有命令都直接输出 JSON 数组格式到标准输出
  批量处理时会并发执行以提高性能

性能优化:
  - 并发处理所有图片
  - 自动错误处理，单个失败不影响其他

依赖:
  需要安装以下包:
    pnpm add extract-colors sharp

更多信息请访问项目文档。
  `);
}
