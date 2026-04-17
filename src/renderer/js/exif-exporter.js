/**
 * EXIF 导出模块
 * 专门负责导出时的 EXIF 读取和写入，使用 piexif.js 直接处理
 */

// 使用全局 piexif
const piexif = window.piexif;

/**
 * 从原图文件读取 EXIF 数据（使用 piexif）
 * @param {File} file - 原始图片文件
 * @returns {Promise<Object|null>} piexif 格式的 EXIF 对象
 */
export async function readExifFromFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const exifObj = piexif.load(e.target.result);
        resolve(exifObj);
      } catch (err) {
        console.error('读取 EXIF 失败:', err);
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * 从文件路径读取 EXIF 数据（Electron 环境）
 * @param {string} imagePath - 图片文件路径
 * @returns {Promise<Object|null>} piexif 格式的 EXIF 对象
 */
export async function readExifFromPath(imagePath) {
  if (!window.electronAPI || !window.electronAPI.readExifBinary) {
    console.warn('Electron API not available for reading EXIF binary');
    return null;
  }
  
  try {
    const base64 = await window.electronAPI.readExifBinary(imagePath);
    if (base64) {
      const exifObj = piexif.load(base64);
      return exifObj;
    }
  } catch (err) {
    console.error('从路径读取 EXIF 失败:', err);
  }
  return null;
}

/**
 * 将 EXIF 嵌入到图片 DataURL
 * @param {string} exifBytes - piexif.dump() 生成的字节数组
 * @param {string} dataUrl - 图片 DataURL
 * @returns {string} 带有 EXIF 的新 DataURL
 */
export function embedExif(exifBytes, dataUrl) {
  try {
    return piexif.insert(exifBytes, dataUrl);
  } catch (err) {
    console.error('嵌入 EXIF 失败:', err);
    return dataUrl;
  }
}

/**
 * 将 EXIF 对象转换为 piexif.dump 格式
 * @param {Object} exifObj - piexif.load() 返回的 EXIF 对象
 * @returns {Uint8Array} piexif.dump() 格式的字节数组
 */
export function dumpExif(exifObj) {
  try {
    return piexif.dump(exifObj);
  } catch (err) {
    console.error('转换 EXIF 失败:', err);
    return null;
  }
}

/**
 * 检查 EXIF 对象是否包含有效数据
 * @param {Object} exifObj - piexif 格式的 EXIF 对象
 * @returns {boolean}
 */
export function hasExifData(exifObj) {
  if (!exifObj) return false;
  
  const sections = ['0th', 'Exif', 'GPS', '1st'];
  for (const section of sections) {
    if (exifObj[section] && Object.keys(exifObj[section]).length > 0) {
      return true;
    }
  }
  return false;
}
