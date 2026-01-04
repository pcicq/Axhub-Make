/**
 * Utils Module
 * 
 * 图片处理工具函数
 */

import { existsSync } from 'fs';
import { extname } from 'path';

/**
 * 验证图片文件是否存在
 * @param {string} imagePath - 图片路径
 * @returns {boolean} 文件是否存在
 */
export function validateImagePath(imagePath) {
  if (!imagePath) {
    throw new Error('Image path is required');
  }
  
  if (!existsSync(imagePath)) {
    throw new Error(`Image file not found: ${imagePath}`);
  }
  
  return true;
}

/**
 * 检查文件是否为支持的图片格式
 * @param {string} imagePath - 图片路径
 * @returns {boolean} 是否为支持的格式
 */
export function isSupportedImageFormat(imagePath) {
  const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'];
  const ext = extname(imagePath).toLowerCase();
  return supportedFormats.includes(ext);
}




