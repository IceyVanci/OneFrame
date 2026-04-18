/**
 * Type B 导出渲染模块
 * 负责在 Canvas 上绘制边框和内容
 * 当前与 Type A 相同，稍后可自定义
 */

// 使用全局 opentype 变量（从 CDN 加载）
const opentype = window.opentype;

// 预加载字体
let fontSemibold = null;
let fontMedium = null;
let fontNormal = null;

async function loadFonts() {
  try {
    if (!fontSemibold) {
      const semiboldUrl = new URL('../../fonts/MiSans-Semibold.ttf', import.meta.url).href;
      fontSemibold = await opentype.load(semiboldUrl);
    }
    if (!fontMedium) {
      const mediumUrl = new URL('../../fonts/MiSans-Medium.ttf', import.meta.url).href;
      fontMedium = await opentype.load(mediumUrl);
    }
    if (!fontNormal) {
      const normalUrl = new URL('../../fonts/MiSans-Normal.ttf', import.meta.url).href;
      fontNormal = await opentype.load(normalUrl);
    }
    return { fontSemibold, fontMedium, fontNormal };
  } catch (error) {
    console.error('Font loading failed:', error);
    throw error;
  }
}

/**
 * 使用 ctx.fillText 绘制文字（与 CSS 样式一致）
 */
function drawText(ctx, font, text, x, y, fontSize, options = {}) {
  const color = options.color || '#000000';
  const fontWeight = options.fontWeight || 'normal';
  
  ctx.font = `${fontWeight} ${fontSize}px 'MiSans', sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  
  if (options.align === 'right') {
    ctx.textAlign = 'right';
  } else if (options.align === 'center') {
    ctx.textAlign = 'center';
  } else {
    ctx.textAlign = 'left';
  }
  
  ctx.fillText(text, x, y);
}

/**
 * 绘制边框内容
 */
async function drawBorderContent(ctx, imgWidth, imgHeight, borderHeight, settings, fonts) {
  const borderTop = imgHeight;
  const textColor = borderColorIsLight(settings.borderColor) ? '#000000' : '#ffffff';
  
  ctx.fillStyle = textColor;
  
  const isLandscape = imgWidth > imgHeight;
  const baseScale = isLandscape ? imgWidth : imgHeight;
  const previewBase = 900;
  const scale = baseScale / previewBase;
  
  const fontSize = Math.round(12 * scale);
  const largeFontSize = Math.round(24 * scale);
  
  const baseWidth = imgWidth;
  const infoRightX = baseWidth * 0.5;
  const focalX = baseWidth * 0.525;
  const rightEdgeX = baseWidth * 0.975;
  
  const centerY = borderTop + borderHeight / 2;
  const lineGap = Math.round(2 * scale);
  const lineOffset = fontSize / 2 + lineGap / 2;
  
  // Logo
  const logoX = baseWidth * 0.025;
  if (settings.selectedLogo && settings.showLogo) {
    const promise = new Promise((resolve) => {
      drawLogo(ctx, settings.selectedLogo, logoX, centerY, borderHeight, baseWidth, settings.borderColor, resolve);
    });
    await promise;
  }
  
  // 机型 + 参数
  const hasModel = !!(settings.showModel && settings.customModel);
  const hasParams = !!(settings.showParams && (settings.fNumber || settings.exposureTime || settings.iso));
  
  if (hasModel || hasParams) {
    const rightX = infoRightX;
    
    if (hasModel && hasParams) {
      drawText(ctx, fonts.fontMedium, settings.customModel, rightX, centerY - lineOffset, fontSize, { align: 'right', color: textColor, fontWeight: '500' });
      const params = [];
      if (settings.fNumber) params.push(`f/${settings.fNumber}`);
      if (settings.exposureTime) params.push(`${settings.exposureTime}s`);
      if (settings.iso) params.push(`ISO${settings.iso}`);
      drawText(ctx, fonts.fontNormal, params.join(' '), rightX, centerY + lineOffset, fontSize, { align: 'right', color: textColor, fontWeight: 'normal' });
    } else if (hasModel) {
      drawText(ctx, fonts.fontMedium, settings.customModel, rightX, centerY, fontSize, { align: 'right', color: textColor, fontWeight: '500' });
    } else if (hasParams) {
      const params = [];
      if (settings.fNumber) params.push(`f/${settings.fNumber}`);
      if (settings.exposureTime) params.push(`${settings.exposureTime}s`);
      if (settings.iso) params.push(`ISO${settings.iso}`);
      drawText(ctx, fonts.fontNormal, params.join(' '), rightX, centerY, fontSize, { align: 'right', color: textColor, fontWeight: 'normal' });
    }
  }
  
  // 焦距
  if (settings.focalLength) {
    drawText(ctx, fonts.fontMedium, settings.focalLength, focalX, centerY, largeFontSize, { color: textColor, fontWeight: '500' });
  }
  
  // 署名 + 时间
  const hasSignature = !!settings.signatureText;
  const hasTime = !!(settings.showTime && settings.dateTime);
  
  if (hasSignature || hasTime) {
    const rightX = rightEdgeX;
    
    if (hasSignature && hasTime) {
      drawText(ctx, fonts.fontSemibold, settings.signatureText, rightX, centerY - lineOffset, fontSize, { align: 'right', color: textColor, fontWeight: '600' });
      drawText(ctx, fonts.fontNormal, formatDateForDisplay(settings.dateTime), rightX, centerY + lineOffset, fontSize, { align: 'right', color: textColor, fontWeight: 'normal' });
    } else if (hasSignature) {
      drawText(ctx, fonts.fontSemibold, settings.signatureText, rightX, centerY, fontSize, { align: 'right', color: textColor, fontWeight: '600' });
    } else if (hasTime) {
      drawText(ctx, fonts.fontNormal, formatDateForDisplay(settings.dateTime), rightX, centerY, fontSize, { align: 'right', color: textColor, fontWeight: 'normal' });
    }
  }
}

/**
 * 检测 logo 图片的平均亮度
 */
function detectLogoBrightness(logoPath) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let totalBrightness = 0;
        let pixelCount = 0;
        
        for (let i = 0; i < data.length; i += 8) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue;
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          totalBrightness += brightness;
          pixelCount++;
        }
        
        const avgBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 128;
        resolve(avgBrightness > 100);
      } catch (e) {
        resolve(true);
      }
    };
    img.onerror = () => resolve(true);
    img.src = logoPath;
  });
}

/**
 * 绘制 Logo
 */
async function drawLogo(ctx, logoName, x, centerY, borderHeight, imgWidth, borderColor, onComplete) {
  const isDark = !borderColorIsLight(borderColor);
  const normalPath = `logos/${logoName}.svg`;
  
  const logoIsLight = await detectLogoBrightness(normalPath);
  
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  img.onload = () => {
    let logoHeight = borderHeight * 0.6;
    let logoWidth = (img.width / img.height) * logoHeight;
    
    const maxLogoWidth = imgWidth * 0.15;
    if (logoWidth > maxLogoWidth) {
      logoWidth = maxLogoWidth;
      logoHeight = (logoWidth / img.width) * img.height;
    }
    
    if (isDark && !logoIsLight) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(img, 0, 0);
      
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      tempCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(tempCanvas, x, centerY - logoHeight / 2, logoWidth, logoHeight);
    } else {
      ctx.drawImage(img, x, centerY - logoHeight / 2, logoWidth, logoHeight);
    }
    
    if (onComplete) onComplete();
  };
  
  img.onerror = () => {
    if (onComplete) onComplete();
  };
  
  img.src = normalPath;
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
 */
function dataURLtoBlob(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return new Blob([], { type: 'image/jpeg' });
  }
  const arr = dataUrl.split(',');
  if (arr.length < 2) {
    return new Blob([], { type: 'image/jpeg' });
  }
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) {
    return new Blob([], { type: 'image/jpeg' });
  }
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * 渲染导出图片（仅渲染，不处理 EXIF）
 */
export async function renderImage(img, options) {
  const {
    borderColor = '#ffffff',
    borderHeight = 12,
    quality = 1.0,
    settings = {}
  } = options;

  const fonts = await loadFonts();

  if (!img.complete || img.naturalWidth === 0) {
    throw new Error('图片尚未加载完成');
  }

  // Type B: 正方形画布，边长 = 图片高度 × 110%
  const squareSize = Math.round(img.naturalHeight * 1.1);
  const margin = Math.round(squareSize * 0.05); // 5% 边距
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = squareSize;
  canvas.height = squareSize;
  
  // 填充白色背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, squareSize, squareSize);
  
  // 图片居左显示，上下左三边距为 5%
  const imgHeight = squareSize - margin * 2; // 图片高度 = 正方形高度 - 上下边距
  const imgWidth = imgHeight; // 保持比例，宽度 = 高度（纵向图片）
  
  // 绘制图片在左侧
  ctx.drawImage(img, margin, margin, imgWidth, imgHeight);
  
  // Type B 的边框内容位置调整（右侧白色区域）
  const contentLeft = margin + imgWidth + margin; // 图片右边缘 + 右边距
  const contentWidth = squareSize - contentLeft;
  
  if (contentWidth > 0 && settings) {
    // 在右侧白色区域绘制边框内容
    await drawBorderContentTypeB(ctx, squareSize, squareSize, squareSize, settings, fonts, contentLeft, contentWidth);
  }

  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Type B 专用边框内容绘制（右侧垂直排列）
 */
async function drawBorderContentTypeB(ctx, canvasWidth, canvasHeight, borderHeight, settings, fonts, contentLeft, contentWidth) {
  const textColor = '#000000'; // 白色背景用黑色文字
  const baseScale = canvasHeight / 900;
  const fontSize = Math.round(14 * baseScale);
  const largeFontSize = Math.round(20 * baseScale);
  
  // 内容区域居中
  const centerX = contentLeft + contentWidth / 2;
  const startY = canvasHeight * 0.2;
  const lineGap = fontSize * 1.5;
  
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  let y = startY;
  
  // Logo
  if (settings.selectedLogo && settings.showLogo) {
    const logoHeight = fontSize * 2;
    await drawLogoTypeB(ctx, settings.selectedLogo, centerX, y + logoHeight / 2, logoHeight, textColor);
    y += logoHeight + lineGap;
  }
  
  // 机型
  if (settings.showModel && settings.customModel) {
    ctx.font = `${fontSize}px 'MiSans', sans-serif`;
    ctx.fillText(settings.customModel, centerX, y);
    y += fontSize + lineGap * 0.5;
  }
  
  // 参数
  if (settings.showParams && (settings.fNumber || settings.exposureTime || settings.iso)) {
    const params = [];
    if (settings.fNumber) params.push(`f/${settings.fNumber}`);
    if (settings.exposureTime) params.push(`${settings.exposureTime}s`);
    if (settings.iso) params.push(`ISO${settings.iso}`);
    ctx.font = `${fontSize}px 'MiSans', sans-serif`;
    ctx.fillText(params.join(' '), centerX, y);
    y += fontSize + lineGap * 0.5;
  }
  
  // 时间
  if (settings.showTime && settings.dateTime) {
    const dt = new Date(settings.dateTime);
    const timeStr = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    ctx.font = `${fontSize}px 'MiSans', sans-serif`;
    ctx.fillText(timeStr, centerX, y);
    y += fontSize + lineGap * 0.5;
  }
  
  // 署名
  if (settings.showSignature && settings.signatureText) {
    ctx.font = `${fontSize}px 'MiSans', sans-serif`;
    ctx.fillText(settings.signatureText, centerX, y);
  }
}

/**
 * 绘制 Logo (Type B)
 */
async function drawLogoTypeB(ctx, logoName, x, y, height, textColor) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const width = (img.width / img.height) * height;
      ctx.drawImage(img, x - width / 2, y - height / 2, width, height);
      resolve();
    };
    
    img.onerror = () => resolve();
    img.src = `logos/${logoName}.svg`;
  });
}

/**
 * Type B 导出样式配置
 */
export const typeBExport = {
  id: 'type-b-export',
  name: 'Type B Export',
  
  renderImage
};
