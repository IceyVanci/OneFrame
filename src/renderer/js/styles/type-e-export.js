/**
 * Type E 导出渲染模块
 * 布局：3:2 纵向画布，顶部 1:1 正方形显示图片，底部白色区域显示参数
 */

const opentype = window.opentype;
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

function borderColorIsLight(color) {
  if (!color) return true;
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

function formatDateForDisplay(dateTimeStr) {
  if (!dateTimeStr) return '';
  const dt = new Date(dateTimeStr);
  return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
}

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
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 128) continue;
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          totalBrightness += brightness;
          pixelCount++;
        }
        resolve(pixelCount > 0 ? totalBrightness / pixelCount > 100 : true);
      } catch (e) { resolve(true); }
    };
    img.onerror = () => resolve(true);
    img.src = logoPath;
  });
}

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
  img.onerror = () => { if (onComplete) onComplete(); };
  img.src = normalPath;
}

/**
 * 绘制 Type E 边框内容
 * 布局：
 * ┌─────────────────────────────────┐
 * │  March             f/2.8       │
 * │  2024            50mm 1/125   │
 * │                   ISO 400       │
 * │ [Logo]           Model          │
 * │                 Signature        │
 * └─────────────────────────────────┘
 */
async function drawBorderContentTypeE(ctx, canvasWidth, canvasHeight, settings, fonts) {
  const textColor = '#000000';
  const grayColor = '#666666';
  const lightGrayColor = '#888888';
  
  // 画布尺寸
  const squareSize = canvasWidth; // 顶部 1:1 区域边长
  const footerHeight = canvasHeight - squareSize; // 底部白色区域高度
  
  // 缩放比例
  const baseSize = 800; // 基准尺寸
  const scale = canvasWidth / baseSize;
  
  // 字号
  const monthFontSize = Math.round(24 * scale);
  const yearFontSize = Math.round(12 * scale);
  const paramFontSize = Math.round(12 * scale);
  const fNumberFontSize = Math.round(14 * scale);
  const lineGap = Math.round(6 * scale);
  
  // 边距
  const paddingLeft = canvasWidth * 0.08;
  const paddingRight = canvasWidth * 0.08;
  const paddingTop = footerHeight * 0.15;
  
  // 辅助函数：绘制 OTF 文本
  const drawText = (font, text, x, y, size, color, align = 'left') => {
    if (!font) return;
    const tempPath = font.getPath(text, 0, 0, size);
    const bbox = tempPath.getBoundingBox();
    const textWidth = bbox.x2 - bbox.x1;
    let drawX = x;
    if (align === 'right') drawX = x - textWidth;
    else if (align === 'center') drawX = x - textWidth / 2;
    const path = font.getPath(text, drawX, y + size / 3, size);
    ctx.fillStyle = color;
    path.draw(ctx);
  };
  
  // 左侧起始 X
  const leftX = paddingLeft;
  
  // 右侧结束 X
  const rightX = canvasWidth - paddingRight;
  
  // 当前 Y 位置
  let y = squareSize + paddingTop;
  
  // === 绘制左侧内容 ===
  
  // 1. 月份（英文首字母大写）
  if (settings.dateTime && settings.showTime) {
    const dt = new Date(settings.dateTime);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[dt.getMonth()];
    // 首字母大写
    const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
    
    drawText(fonts.fontMedium, formattedMonth, leftX, y, monthFontSize, textColor, 'left');
    y += monthFontSize + Math.round(2 * scale);
    
    // 2. 年份
    const year = dt.getFullYear().toString();
    drawText(fonts.fontMedium, year, leftX, y, yearFontSize, textColor, 'left');
    y += yearFontSize + Math.round(16 * scale);
  }
  
  // 3. Logo
  if (settings.selectedLogo && settings.showLogo) {
    await drawLogoTypeE(ctx, settings.selectedLogo, leftX, y, scale, yearFontSize);
  }
  
  // === 绘制右侧内容 ===
  
  // 重置 Y 到参数起始位置
  y = squareSize + paddingTop;
  
  // 1. 光圈
  if (settings.fNumber) {
    const text = `f/${settings.fNumber}`;
    drawText(fonts.fontMedium, text, rightX, y, fNumberFontSize, textColor, 'right');
    y += fNumberFontSize + lineGap;
  }
  
  // 2. 焦距 + 快门
  const hasFocal = settings.focalLength;
  const hasShutter = settings.exposureTime;
  if (hasFocal || hasShutter) {
    let text = '';
    if (hasFocal) {
      text += `${String(settings.focalLength).replace(/mm$/i, '')}mm`;
    }
    if (hasFocal && hasShutter) {
      text += ' ';
    }
    if (hasShutter) {
      text += `${settings.exposureTime}s`;
    }
    drawText(fonts.fontMedium, text, rightX, y, paramFontSize, textColor, 'right');
    y += paramFontSize + lineGap;
  }
  
  // 3. ISO
  if (settings.iso) {
    const text = `ISO ${settings.iso}`;
    drawText(fonts.fontMedium, text, rightX, y, paramFontSize, textColor, 'right');
    y += paramFontSize + lineGap;
  }
  
  // 4. 机型
  if (settings.customModel && settings.showModel) {
    drawText(fonts.fontMedium, settings.customModel, rightX, y, paramFontSize, grayColor, 'right');
    y += paramFontSize + lineGap;
  }
  
  // 5. 署名
  if (settings.signatureText) {
    drawText(fonts.fontMedium, settings.signatureText, rightX, y, paramFontSize, lightGrayColor, 'right');
  }
}

/**
 * 绘制 Type E Logo
 * Logo 的左边缘和月份/年份对齐
 * 方形 Logo：高度 = 年份行高
 * 横向 Logo：宽度 = 年份宽度 × 2
 */
async function drawLogoTypeE(ctx, logoName, x, y, scale, yearFontSize) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      
      let logoHeight, logoWidth;
      
      if (ratio >= 0.8 && ratio <= 1.2) {
        // 方形 Logo：高度 = 年份行高
        logoHeight = yearFontSize;
        logoWidth = img.naturalWidth * (logoHeight / img.naturalHeight);
      } else {
        // 横向 Logo：宽度 = 年份宽度 × 2（估算）
        logoWidth = yearFontSize * 4;
        logoHeight = img.naturalHeight * (logoWidth / img.naturalWidth);
      }
      
      // Logo 左边缘和日期对齐
      ctx.drawImage(img, x, y, logoWidth, logoHeight);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = `logos/${logoName}.svg`;
  });
}

export async function renderImage(img, options) {
  const { quality = 1.0, settings = {}, imageOffset = { x: 0, y: 0 } } = options;
  const fonts = await loadFonts();
  if (!img.complete || img.naturalWidth === 0) throw new Error('图片尚未加载完成');
  
  // Type E: 3:2 纵向画布，短边 = 图片短边
  const imgShortEdge = Math.min(img.naturalWidth, img.naturalHeight);
  const canvasWidth = imgShortEdge; // 短边
  const canvasHeight = Math.round(canvasWidth * 1.5); // 3:2 比例
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  // 填充白色背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // 顶部 1:1 正方形区域显示图片
  const squareSize = canvasWidth;
  const imgAspectRatio = img.naturalHeight / img.naturalWidth;
  const isPortrait = img.naturalHeight > img.naturalWidth;
  
  let drawWidth, drawHeight;
  if (isPortrait) {
    // 纵向图片：以宽度为准
    drawWidth = squareSize;
    drawHeight = Math.round(drawWidth * imgAspectRatio);
  } else {
    // 横向/方形图片：以高度为准
    drawHeight = squareSize;
    drawWidth = Math.round(drawHeight / imgAspectRatio);
  }
  
  // 裁剪图片使其适应正方形
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, squareSize, squareSize);
  ctx.clip();
  
  // 计算居中偏移（加上用户拖动产生的偏移）
  const baseOffsetX = (squareSize - drawWidth) / 2;
  const baseOffsetY = (squareSize - drawHeight) / 2;
  
  // 应用用户偏移量
  // imageOffset 的单位是预览区域的像素，需要转换为导出画布的比例
  const offsetScale = canvasWidth / squareSize;
  const drawOffsetX = baseOffsetX + imageOffset.x * offsetScale;
  const drawOffsetY = baseOffsetY + imageOffset.y * offsetScale;
  
  ctx.drawImage(img, drawOffsetX, drawOffsetY, drawWidth, drawHeight);
  ctx.restore();
  
  // 绘制底部边框内容
  if (settings) {
    await drawBorderContentTypeE(ctx, canvasWidth, canvasHeight, settings, fonts);
  }
  
  return canvas.toDataURL('image/jpeg', quality);
}

export const typeEExport = {
  id: 'type-e-export',
  name: 'Type E Export',
  renderImage
};
