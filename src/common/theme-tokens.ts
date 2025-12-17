/**
 * 主题 Token 定义
 * 
 * 基于设计系统分析数据生成的主题 token，包含颜色、间距、圆角、字体等设计变量
 */

/**
 * 颜色 Token
 */
export const colorTokens = {
  // 背景色
  background: {
    /** 主背景色 - 白色 */
    primary: 'rgb(255, 255, 255)',
    /** 次要背景色 - 浅灰 */
    secondary: 'rgb(245, 246, 247)',
    /** 品牌色背景 - 蓝色半透明 */
    brand: 'rgba(20, 86, 240, 0.2)',
    /** 品牌色背景 - 浅蓝色半透明 */
    brandLight: 'rgba(20, 86, 240, 0.15)',
  },

  // 文本色
  text: {
    /** 主文本色 - 深灰 */
    primary: 'rgb(31, 35, 41)',
    /** 次要文本色 - 中灰 */
    secondary: 'rgb(100, 106, 115)',
    /** 辅助文本色 - 浅灰 */
    tertiary: 'rgb(143, 149, 158)',
    /** 品牌色文本 */
    brand: 'rgb(20, 86, 240)',
    /** 链接色 */
    link: 'rgb(0, 0, 238)',
    /** 白色文本 */
    white: 'rgb(255, 255, 255)',
    /** 深色文本 */
    dark: 'rgb(43, 47, 54)',
    /** 半透明深色文本 */
    darkAlpha: 'rgba(43, 47, 54, 0.5)',
  },

  // 边框色
  border: {
    /** 主边框色 - 中灰 */
    primary: 'rgb(100, 106, 115)',
    /** 次要边框色 - 浅灰 */
    secondary: 'rgb(143, 149, 158)',
    /** 深色边框 */
    dark: 'rgb(31, 35, 41)',
    /** 浅色边框 */
    light: 'rgb(222, 224, 227)',
    /** 品牌色边框 */
    brand: 'rgb(20, 86, 240)',
    /** 链接色边框 */
    link: 'rgb(0, 0, 238)',
    /** 白色边框 */
    white: 'rgb(255, 255, 255)',
    /** 半透明深色边框 */
    darkAlpha: 'rgba(43, 47, 54, 0.5)',
    /** 半透明深色边框（浅） */
    darkAlphaLight: 'rgba(31, 35, 41, 0.15)',
  },
} as const;

/**
 * 间距 Token
 */
export const spacingTokens = {
  /** 1px - 最小间距 */
  xs: '1px',
  /** 3px - 极小间距 */
  xxs: '3px',
  /** 4px - 小间距（最常用） */
  sm: '4px',
  /** 5px - 中小间距 */
  smd: '5px',
  /** 6px - 中间距 */
  md: '6px',
  /** 8px - 标准间距 */
  base: '8px',
  /** 12px - 大间距 */
  lg: '12px',
  /** -4px - 负间距（用于重叠效果） */
  negative: '-4px',
  /** 573.852px - 特殊尺寸 */
  special1: '573.852px',
  /** 609.852px - 特殊尺寸 */
  special2: '609.852px',
} as const;

/**
 * 圆角 Token
 */
export const radiusTokens = {
  /** 2px - 小圆角 */
  sm: '2px',
  /** 4px - 标准圆角 */
  base: '4px',
  /** 6px - 中等圆角（最常用） */
  md: '6px',
  /** 8px - 大圆角 */
  lg: '8px',
  /** 50% - 圆形 */
  round: '50%',
  /** 100% - 完全圆形（用于图片） */
  full: '100%',
} as const;

/**
 * 边框宽度 Token
 */
export const borderWidthTokens = {
  /** 1px - 标准边框宽度 */
  base: '1px',
  /** 0px - 无边框 */
  none: '0px',
} as const;

/**
 * 字体 Token
 */
export const typographyTokens = {
  // 字体族
  fontFamily: {
    /** 主字体族 - 系统字体栈 */
    primary: 'LarkHackSafariFont, LarkEmojiFont, LarkChineseQuote, -apple-system, "system-ui", "Helvetica Neue", Tahoma, "PingFang SC", "Microsoft Yahei", Arial, "Hiragino Sans GB", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    /** 次要字体族 - 简化版系统字体 */
    secondary: 'LarkEmojiFont, LarkChineseQuote, -apple-system, "system-ui", "Helvetica Neue", Tahoma, "PingFang SC", "Microsoft Yahei", Arial, "Hiragino Sans GB", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    /** 图标字体 */
    icon: 'icomoon',
    /** Emoji 字体 */
    emoji: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI"',
  },

  // 字体大小
  fontSize: {
    /** 12px - 小号字体 */
    sm: '12px',
    /** 14px - 标准字体（最常用） */
    base: '14px',
    /** 16px - 中等字体 */
    md: '16px',
    /** 24px - 大号字体 */
    lg: '24px',
  },

  // 字重
  fontWeight: {
    /** 400 - 常规字重 */
    normal: '400',
  },

  // 行高
  lineHeight: {
    /** 0px - 无行高（用于图标等） */
    none: '0px',
    /** 14px - 小行高 */
    sm: '14px',
    /** 16px - 标准行高 */
    base: '16px',
    /** 18px - 中等行高 */
    md: '18px',
    /** 22px - 大行高 */
    lg: '22px',
    /** 24px - 超大行高 */
    xl: '24px',
    /** normal - 默认行高 */
    normal: 'normal',
  },
} as const;

/**
 * 文本样式预设
 */
export const textStyleTokens = {
  /** 标准文本样式 - 14px, normal, 400 */
  body: {
    fontSize: typographyTokens.fontSize.base,
    lineHeight: typographyTokens.lineHeight.normal,
    fontWeight: typographyTokens.fontWeight.normal,
  },
  /** 小文本样式 - 12px, 18px, 400 */
  small: {
    fontSize: typographyTokens.fontSize.sm,
    lineHeight: typographyTokens.lineHeight.md,
    fontWeight: typographyTokens.fontWeight.normal,
  },
  /** 中等文本样式 - 14px, 22px, 400 */
  medium: {
    fontSize: typographyTokens.fontSize.base,
    lineHeight: typographyTokens.lineHeight.lg,
    fontWeight: typographyTokens.fontWeight.normal,
  },
  /** 大文本样式 - 16px, normal, 400 */
  large: {
    fontSize: typographyTokens.fontSize.md,
    lineHeight: typographyTokens.lineHeight.normal,
    fontWeight: typographyTokens.fontWeight.normal,
  },
  /** 超大文本样式 - 24px, 24px, 400 */
  xlarge: {
    fontSize: typographyTokens.fontSize.lg,
    lineHeight: typographyTokens.lineHeight.xl,
    fontWeight: typographyTokens.fontWeight.normal,
  },
  /** 图标文本样式 - 14px, 14px, 400 */
  icon: {
    fontSize: typographyTokens.fontSize.base,
    lineHeight: typographyTokens.lineHeight.sm,
    fontWeight: typographyTokens.fontWeight.normal,
  },
  /** 按钮文本样式 - 16px, 0px, 400 */
  button: {
    fontSize: typographyTokens.fontSize.md,
    lineHeight: typographyTokens.lineHeight.none,
    fontWeight: typographyTokens.fontWeight.normal,
  },
} as const;

/**
 * 阴影 Token（当前为空，预留扩展）
 */
export const shadowTokens = {
  box: [] as string[],
  text: [] as string[],
} as const;

/**
 * 主题 Token 汇总
 */
export const themeTokens = {
  color: colorTokens,
  spacing: spacingTokens,
  radius: radiusTokens,
  borderWidth: borderWidthTokens,
  typography: typographyTokens,
  textStyle: textStyleTokens,
  shadow: shadowTokens,
} as const;

/**
 * 主题 Token 类型定义
 */
export type ColorTokens = typeof colorTokens;
export type SpacingTokens = typeof spacingTokens;
export type RadiusTokens = typeof radiusTokens;
export type BorderWidthTokens = typeof borderWidthTokens;
export type TypographyTokens = typeof typographyTokens;
export type TextStyleTokens = typeof textStyleTokens;
export type ShadowTokens = typeof shadowTokens;
export type ThemeTokens = typeof themeTokens;

// 默认导出
export default themeTokens;




