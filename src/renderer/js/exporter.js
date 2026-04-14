/**
 * 图片导出模块
 * 支持保留 EXIF 信息的高质量 JPG 输出
 */

import opentype from 'opentype.js';

// 预加载字体
let fontSemibold = null;
let fontNormal = null;

async function loadFonts() {
  if (!fontSemibold) {
    fontSemibold = await opentype.load('fonts/MiSans-Semibold.ttf');
  }
  if (!fontNormal) {
    fontNormal = await opentype.load('fonts/MiSans-Normal.ttf');
  }
  return { fontSemibold, fontNormal };
}

/**
 * 创建带边框的图片并导出
 * @param {HTMLImageElement} img - 原始图片元素
 * @param {Object} options - 导出选项
 * @param {string} options.borderColor - 边框颜色
 * @param {number} options.borderHeight - 边框高度(px)
 * @param {Object} options.exif - 原始 EXIF 数据
 * @param {number} options.quality - JPG 质量 (0-1)
 * @param {Object} options.settings - 导出设置
 * @returns {Promise<Blob>} 导出的图片 Blob
 */
export async function exportImage(img, options) {
  const {
    borderColor = '#ffffff',
    borderHeight = 100,
    exif = null,
    quality = 1.0,
    settings = {}
  } = options;

  // 加载字体
  const fonts = await loadFonts();

  // 创建 Canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // 计算画布尺寸：图片宽度 + 底部边框高度
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight + borderHeight;

  // 绘制图片
  ctx.drawImage(img, 0, 0);

  // 绘制底部边框
  ctx.fillStyle = borderColor;
  ctx.fillRect(0, img.naturalHeight, img.naturalWidth, borderHeight);

  // 如果有边框内容需要绘制
  if (settings && (settings.selectedLogo || settings.showModel || settings.showParams || settings.showTime || settings.showSignature)) {
    await drawBorderContent(ctx, img.naturalWidth, img.naturalHeight, borderHeight, settings, fonts);
  }

  // 导出为 DataURL（包含 EXIF）
  return new Promise((resolve, reject) => {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    
    if (exif && Object.keys(exif).length > 0) {
      try {
        import('piexifjs').then(module => {
          const piexif = module.default || module;
          const exifObj = buildExifObj(exif, piexif);
          const exifBytes = piexif.dump(exifObj);
          const newDataUrl = piexif.insert(exifBytes, dataUrl);
          resolve(dataURLtoBlob(newDataUrl));
        }).catch(err => {
          console.warn('piexifjs 导入失败，使用无 EXIF 导出:', err);
          resolve(dataURLtoBlob(dataUrl));
        });
      } catch (err) {
        console.error('EXIF 嵌入失败:', err);
        resolve(dataURLtoBlob(dataUrl));
      }
    } else {
      resolve(dataURLtoBlob(dataUrl));
    }
  });
}

/**
 * 使用 opentype.js 绘制文字
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} font - opentype 字体
 * @param {string} text - 文字
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @param {number} fontSize - 字号
 * @param {Object} options - 选项 { align: 'left'|'right'|'center' }
 */
function drawText(ctx, font, text, x, y, fontSize, options = {}) {
  const path = font.getPath(text, x, y, fontSize);
  
  // 设置对齐
  if (options.align === 'right' && font && font.getAdvanceWidth) {
    const width = font.getAdvanceWidth(text, fontSize);
    path.translate(-width, 0);
  }
  
  ctx.fill(path.toPath2D ? path.toPath2D() : new Path2D(path.toSVG(2)));
}

/**
 * 绘制边框内容 - 使用 opentype.js 精确匹配 CSS
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} imgWidth - 图片宽度
 * @param {number} imgHeight - 图片高度
 * @param {number} borderHeight - 边框高度
 * @param {Object} settings - 设置
 * @param {Object} fonts - { fontSemibold, fontNormal }
 */
async function drawBorderContent(ctx, imgWidth, imgHeight, borderHeight, settings, fonts) {
  const borderTop = imgHeight;
  const textColor = borderColorIsLight(settings.borderColor) ? '#000000' : '#ffffff';
  
  ctx.fillStyle = textColor;
  
  // 字号 - 与 CSS 保持一致
  const fontSize = 12;  // 基础字号（CSS: 12px）
  const largeFontSize = 24;  // 焦距大字（CSS: 24px）
  
  // 布局位置（与 CSS 完全一致）
  const leftEdge = imgWidth * 0.025;     // 2.5%
  const centerX = imgWidth * 0.175;      // 17.5%
  const focalX = imgWidth * 0.525;       // 52.5%
  const rightEdge = imgWidth * 0.975;    // 97.5%
  
  // 垂直居中
  const centerY = borderTop + borderHeight / 2;
  const lineHeight = fontSize * 1.2;
  
  // 1. Logo（左侧 2.5% 处）- 高度为边框的 60%
  if (settings.selectedLogo && settings.showLogo) {
    drawLogo(ctx, settings.selectedLogo, leftEdge, centerY, borderHeight, settings.borderColor);
  }
  
  // 2. 机型 + 拍摄参数（17.5%，居右对齐）
  if (settings.showModel || settings.showParams) {
    const centerRightX = centerX;  // 17.5% 位置
    
    // 第一行：机型名称（semibold）
    if (settings.showModel && settings.customModel) {
      const width = fonts.fontSemibold.getAdvanceWidth(settings.customModel, fontSize);
      drawText(ctx, fonts.fontSemibold, settings.customModel, centerRightX - width, centerY - lineHeight / 2 + fontSize * 0.35, fontSize, { align: 'right' });
    }
    
    // 第二行：光圈、快门、ISO（normal）
    if (settings.showParams) {
      const params = [];
      if (settings.fNumber) params.push(`f/${settings.fNumber}`);
      if (settings.exposureTime) params.push(`${settings.exposureTime}s`);
      if (settings.iso) params.push(`ISO${settings.iso}`);
      
      if (params.length > 0) {
        const paramsText = params.join(' ');
        const width = fonts.fontNormal.getAdvanceWidth(paramsText, fontSize);
        drawText(ctx, fonts.fontNormal, paramsText, centerRightX - width, centerY + lineHeight / 2 + fontSize * 0.35, fontSize, { align: 'right' });
      }
    }
  }
  
  // 3. 焦距（52.5%，居左，大字）
  if (settings.focalLength) {
    drawText(ctx, fonts.fontSemibold, `${settings.focalLength}mm`, focalX, centerY + largeFontSize * 0.35, largeFontSize);
  }
  
  // 4. 署名 + 时间（右侧 97.5%）
  const rightX = rightEdge;
  
  // 署名（semibold）
  if (settings.showSignature && settings.signatureText) {
    const width = fonts.fontSemibold.getAdvanceWidth(settings.signatureText, fontSize);
    drawText(ctx, fonts.fontSemibold, settings.signatureText, rightX - width, centerY - lineHeight / 2 + fontSize * 0.35, fontSize, { align: 'right' });
  }
  
  // 时间（normal）
  if (settings.showTime && settings.dateTime) {
    const timeStr = formatDateForDisplay(settings.dateTime);
    const width = fonts.fontNormal.getAdvanceWidth(timeStr, fontSize);
    drawText(ctx, fonts.fontNormal, timeStr, rightX - width, centerY + lineHeight / 2 + fontSize * 0.35, fontSize, { align: 'right' });
  }
}

/**
 * 绘制 Logo（根据背景颜色自动调整）
 */
function drawLogo(ctx, logoName, x, centerY, borderHeight, borderColor) {
  const logoPath = `logos/${logoName}.svg`;
  
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  img.onload = () => {
    const logoHeight = borderHeight * 0.6;
    const logoWidth = (img.width / img.height) * logoHeight;
    
    // 绘制到临时 canvas 处理颜色
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = logoWidth;
    tempCanvas.height = logoHeight;
    const tempCtx = tempCanvas.getContext('2d');
    
    // 绘制原始 Logo
    tempCtx.drawImage(img, 0, 0, logoWidth, logoHeight);
    
    // 如果是深色背景，反转 Logo 颜色
    if (!borderColorIsLight(borderColor)) {
      const imageData = tempCtx.getImageData(0, 0, logoWidth, logoHeight);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];         // R
        data[i + 1] = 255 - data[i + 1]; // G
        data[i + 2] = 255 - data[i + 2]; // B
      }
      tempCtx.putImageData(imageData, 0, 0);
    }
    
    // 绘制到主画布
    ctx.drawImage(tempCanvas, x, centerY - logoHeight / 2);
  };
  
  img.src = logoPath;
}

/**
 * 判断边框颜色是否为浅色
 */
function borderColorIsLight(color) {
  if (!color) return true;
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

/**
 * 格式化日期用于显示
 */
function formatDateForDisplay(dateTimeStr) {
  if (!dateTimeStr) return '';
  const dt = new Date(dateTimeStr);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  const h = String(dt.getHours()).padStart(2, '0');
  const min = String(dt.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${d} ${h}:${min}`;
}

/**
 * 将 DataURL 转换为 Blob
 * @param {string} dataUrl - DataURL 字符串
 * @returns {Blob}
 */
function dataURLtoBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * 将 EXIF 数据转换为 piexif 格式
 * @param {Object} exifData - 原始 EXIF 数据
 * @param {Object} piexif - piexifjs 模块
 * @returns {Object} piexif 格式的 EXIF 对象
 */
function buildExifObj(exifData, piexif) {
  const exifObj = {
    "0th": {},
    "Exif": {},
    "GPS": {},
    "1st": {},
    "thumbnail": null
  };

  // 相机信息
  if (exifData.Make) {
    exifObj["0th"][piexif.ImageIFD.Make] = exifData.Make;
  }
  if (exifData.Model) {
    exifObj["0th"][piexif.ImageIFD.Model] = exifData.Model;
  }

  // 尺寸信息
  if (exifData.ImageWidth) {
    exifObj["0th"][piexif.ImageIFD.ImageWidth] = exifData.ImageWidth;
  }
  if (exifData.ImageHeight) {
    exifObj["0th"][piexif.ImageIFD.ImageLength] = exifData.ImageHeight;
  }

  // 日期时间
  if (exifData.DateTimeOriginal) {
    // 转换为 piexif 格式: "YYYY:MM:DD HH:MM:SS"
    const dateStr = exifData.DateTimeOriginal.replace(/-/g, ':').replace(' ', ' ');
    exifObj["Exif"][piexif.ExifIFD.DateTimeOriginal] = dateStr;
    exifObj["0th"][piexif.ImageIFD.DateTime] = dateStr;
  }

  // 拍摄参数
  if (exifData.FocalLength) {
    const focal = parseFloat(exifData.FocalLength);
    if (!isNaN(focal)) {
      exifObj["Exif"][piexif.ExifIFD.FocalLength] = [focal, 1];
    }
  }

  if (exifData.FNumber) {
    const fNum = parseFloat(exifData.FNumber);
    if (!isNaN(fNum)) {
      exifObj["Exif"][piexif.ExifIFD.FNumber] = [fNum, 1];
    }
  }

  if (exifData.ExposureTime) {
    const exp = parseExposureTime(exifData.ExposureTime);
    if (exp) {
      exifObj["Exif"][piexif.ExifIFD.ExposureTime] = exp;
    }
  }

  if (exifData.ISOSpeedRatings) {
    const iso = parseInt(exifData.ISOSpeedRatings);
    if (!isNaN(iso)) {
      exifObj["Exif"][piexif.ExifIFD.ISOSpeedRatings] = [iso];
    }
  }

  if (exifData.LensModel) {
    exifObj["Exif"][piexif.ExifIFD.LensModel] = exifData.LensModel;
  }

  return exifObj;
}

/**
 * 解析快门时间字符串为分数
 * @param {string|number} exposureTime - 快门时间
 * @returns {number[]|null} [分子, 分母] 格式
 */
function parseExposureTime(exposureTime) {
  if (typeof exposureTime === 'number') {
    if (exposureTime >= 1) {
      return [exposureTime, 1];
    } else {
      return [1, Math.round(1 / exposureTime)];
    }
  }

  if (typeof exposureTime === 'string') {
    // 处理 "1/250" 格式
    const match = exposureTime.match(/^(\d+)\/(\d+)$/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2])];
    }

    // 处理 "0.004" 格式
    const num = parseFloat(exposureTime);
    if (!isNaN(num)) {
      if (num >= 1) {
        return [num, 1];
      } else {
        return [1, Math.round(1 / num)];
      }
    }
  }

  return null;
}

/**
 * 保存 Blob 到文件
 * @param {Blob} blob - 要保存的数据
 * @param {string} filePath - 保存路径
 */
export async function saveBlobToFile(blob, filePath) {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Array.from(new Uint8Array(arrayBuffer));

  // 通过 IPC 保存文件
  if (window.electronAPI && window.electronAPI.saveBlob) {
    return await window.electronAPI.saveBlob(buffer, filePath);
  }

  // 降级方案：使用 URL.createObjectURL 下载
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filePath || 'output.jpg';
  a.click();
  URL.revokeObjectURL(url);
}
