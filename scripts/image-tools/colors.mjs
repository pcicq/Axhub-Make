/**
 * Colors Module
 * 
 * 从图片中提取主要颜色信息
 */

import { extractColors } from 'extract-colors';
import sharp from 'sharp';

/**
 * 从图片中提取颜色
 * @param {string} imagePath - 图片路径
 * @param {Object} options - 提取选项
 * @param {number} options.maxColors - 最大颜色数量
 * @param {number} options.resize - 降采样尺寸
 * @returns {Promise<Object>} 提取结果
 */
export async function extractColorsFromImage(imagePath, options) {
  const {
    maxColors = 8,
    resize = 256
  } = options || {};

  // 1️⃣ 读取图片基础信息
  const image = sharp(imagePath);
  const metadata = await image.metadata();

  // 2️⃣ 关键修改：转换为 Raw 像素数据
  // .raw() 会输出未压缩的 R, G, B, A 数组，而不是 PNG/JPEG 文件流
  const { data, info } = await image
    .resize(resize, resize, { fit: 'inside' })
    .ensureAlpha() // 确保有 Alpha 通道 (RGBA)，防止报错
    .raw()         // 🔥 核心：告诉 sharp 输出原始像素数据
    .toBuffer({ resolveWithObject: true }); // 获取数据 + 宽高信息

  // 3️⃣ 构造 extract-colors 能识别的 ImageData 对象
  const imageData = {
    data: new Uint8ClampedArray(data), // 将 Buffer 转为 Uint8ClampedArray
    width: info.width,
    height: info.height
  };

  // 4️⃣ 提取颜色
  const colors = await extractColors(imageData, {
    pixels: info.width * info.height, // 使用实际 resize 后的像素数
    count: maxColors,
    tolerance: 10,
    distance: 0.22,
    saturationDistance: 0.2,
    lightnessDistance: 0.2
  });

  // 5️⃣ 标准化输出
  return {
    image: imagePath,
    width: metadata.width,
    height: metadata.height,
    colors: colors.map(c => ({
      hex: c.hex,
      rgb: c.rgb, // 字符串格式 "rgb(r, g, b)"
      area: Number(c.area.toFixed(4))
    }))
  };
}

/**
 * 命令行接口：提取颜色
 * @param {Array<string>} args - 命令行参数
 */
export async function extractColorsCommand(args) {
  const { validateImagePath } = await import('./utils.mjs');
  
  const imagePaths = args.filter(arg => !arg.startsWith('--'));
  
  if (imagePaths.length === 0) {
    console.error('Error: At least one image path is required');
    console.log('Usage: node scripts/image-tools.mjs extract-colors <image1> [image2] [image3] ...');
    process.exit(1);
  }
  
  try {
    const results = await Promise.all(
      imagePaths.map(async (imagePath) => {
        try {
          validateImagePath(imagePath);
          return await extractColorsFromImage(imagePath);
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
