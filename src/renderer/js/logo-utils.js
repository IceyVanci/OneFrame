/**
 * 相机厂商 Logo 工具
 * 
 * 同步自 copicseal-copy 项目：
 * - *.svg 作为图片 URL (<img src="...">)
 * - *.auto.svg 作为原始 SVG 字符串（可动态修改颜色）
 */

// 厂商列表
export const logoList = [
  'Apple', 'Canon', 'DJI', 'Fujifilm', 'Google', 'GoPro', 'Hasselblad',
  'Huawei', 'Insta360', 'Leica', 'Lumix', 'Nikon', 'Nokia', 'Olympus',
  'Oneplus', 'OPPO', 'Pentax', 'Ricoh', 'Samsung', 'Sigma', 'Sony', 'Vivo', 'Xiaomi', 'xuzhou'
];

// 厂商名称映射
const makeNameMap = {
  SONY: 'Sony',
  Leica: 'Leica',
  OM: 'Olympus',
  NIKON: 'Nikon',
  Panasonic: 'Lumix',
  PENTAX: 'Pentax',
  RICOH: 'Ricoh',
  OnePlus: 'Oneplus',
  XIAOMI: 'Xiaomi',
  HUAWEI: 'Huawei',
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
 * 获取所有可用的 logo 列表
 * @returns {string[]}
 */
export function getAllLogos() {
  return logoList;
}

/**
 * 获取 Logo 文件名（用于 URL）
 * @param {string} make - 厂商名称
 * @returns {string}
 */
export function getLogoFilename(make) {
  if (!make) return '';
  const normalized = getMakeName(make);
  return `${normalized}.svg`;
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
