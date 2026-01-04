/**
 * Analyzer Module
 * 
 * 综合分析图片（仅颜色提取）
 */

import { extractColorsFromImage } from './colors.mjs';

/**
 * 综合分析图片
 * @param {string} imagePath - 图片路径
 * @param {Object} options - 分析选项
 * @returns {Promise<Object>} 分析结果
 */
export async function analyzeImage(imagePath, options = {}) {
  console.log(`Analyzing image: ${imagePath}...`);
  
  const results = {
    image: imagePath,
    timestamp: new Date().toISOString()
  };
  
  try {
    // 提取颜色
    console.log('Extracting colors...');
    results.colors = await extractColorsFromImage(imagePath, {
      maxColors: options.maxColors,
      resize: options.colorResize
    });
    
    return results;
  } catch (error) {
    console.error('Analysis failed:', error.message);
    throw error;
  }
}

/**
 * 命令行接口：分析图片
 * @param {Array<string>} args - 命令行参数
 */
export async function analyzeCommand(args) {
  const { validateImagePath } = await import('./utils.mjs');
  
  const imagePaths = args.filter(arg => !arg.startsWith('--'));
  
  if (imagePaths.length === 0) {
    console.error('Error: At least one image path is required');
    console.log('Usage: node scripts/image-tools.mjs analyze <image1> [image2] [image3] ...');
    process.exit(1);
  }
  
  try {
    const results = await Promise.all(
      imagePaths.map(async (imagePath) => {
        try {
          validateImagePath(imagePath);
          return await analyzeImage(imagePath);
        } catch (error) {
          return {
            image: imagePath,
            error: error.message
          };
        }
      })
    );
    
    // 直接输出 JSON 数组
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}


