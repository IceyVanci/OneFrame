/**
 * 相机厂商 Logo 工具
 */

// Logo SVG 内联内容（简化版，用于预览）
export const logoSvgMap = {
  Sony: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">SONY</text></svg>`,
  Canon: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">Canon</text></svg>`,
  Nikon: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">NIKON</text></svg>`,
  Fujifilm: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="14" font-weight="bold">FUJIFILM</text></svg>`,
  Apple: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">Apple</text></svg>`,
  Huawei: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">HUAWEI</text></svg>`,
  Xiaomi: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">Xiaomi</text></svg>`,
  default: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="14">Camera</text></svg>`
};

// 厂商名称映射
const makeNameMap = {
  SONY: 'Sony',
  Leica: 'Leica',
  OM: 'Olympus',
  NIKON: 'Nikon',
  Panasonic: 'Lumix',
  PENTAX: 'Pentax',
  RICOH: 'Ricoh',
};

/**
 * 标准化厂商名称
 * @param {string} make - 原始厂商名称
 * @returns {string}
 */
export function getMakeName(make) {
  if (!make) return '';
  make = make.trim();
  if (makeNameMap[make]) return makeNameMap[make];
  const matchKey = Object.keys(makeNameMap).find((key) => 
    new RegExp(`\\b${key}\\b`, 'i').test(make)
  );
  if (matchKey) return makeNameMap[matchKey];
  return make;
}

/**
 * 获取相机厂商 Logo SVG
 * @param {Object|string} exif - EXIF数据或Make值
 * @returns {string} Logo SVG 内容
 */
export function getMakeLogoSvg(exif) {
  let make = '';
  
  if (typeof exif === 'string') {
    make = exif;
  } else if (exif) {
    // 优先从 Model 查找，其次从 Make 查找
    make = getMakeName(exif?.Model) || getMakeName(exif?.Make);
  }
  
  const normalizedMake = make.toUpperCase();
  
  // 直接匹配
  if (logoSvgMap[make]) return logoSvgMap[make];
  
  // 大写匹配
  for (const key in logoSvgMap) {
    if (key.toUpperCase() === normalizedMake) {
      return logoSvgMap[key];
    }
  }
  
  return logoSvgMap.default;
}

/**
 * 获取 Logo 路径（用于 Electron 环境）
 * @param {string} make - 厂商名称
 * @returns {string|undefined}
 */
export function getMakeLogoPath(make) {
  if (!make) return undefined;
  const normalizedMake = getMakeName(make);
  return `/logos/${normalizedMake}.auto.svg`;
}

/**
 * 格式化相机型号名称
 * @param {string} model - 原始型号
 * @returns {string}
 */
export function getModelName(model) {
  if (!model) return '';
  
  let result = model
    .replace(/CORPORATION/gi, '')
    .replace(/Camera AG/gi, '')
    .replace(/Digital Solutions/gi, '')
    .replace(/Digital Camera/gi, '')
    .trim();
  
  // 特殊处理
  result = result
    .replace(/ILCE-/g, 'α')
    .replace(/Z\s?/gi, 'ℤ');
  
  return result;
}

/**
 * 替换文本中的变量占位符
 * @param {string} text - 包含 {Key} 格式占位符的文本
 * @param {Object} info - EXIF 数据对象
 * @returns {string}
 */
export function replaceTextVars(text, info) {
  if (!text || !info) return '';
  
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = info[key];
    if (value !== undefined && value !== null) {
      return String(value);
    }
    return match;
  });
}
