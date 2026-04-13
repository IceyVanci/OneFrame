/**
 * 图片导出模块
 * 支持保留 EXIF 信息的高质量 JPG 输出
 */

/**
 * 创建带边框的图片并导出
 * @param {HTMLImageElement} img - 原始图片元素
 * @param {Object} options - 导出选项
 * @param {string} options.borderColor - 边框颜色
 * @param {number} options.borderHeight - 边框高度(px)
 * @param {Object} options.exif - 原始 EXIF 数据
 * @param {number} options.quality - JPG 质量 (0-1)
 * @returns {Promise<Blob>} 导出的图片 Blob
 */
export async function exportImage(img, options) {
  const {
    borderColor = '#ffffff',
    borderHeight = 100,
    exif = null,
    quality = 1.0
  } = options;

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

  // 导出为 DataURL（包含 EXIF）
  return new Promise((resolve, reject) => {
    // 首先尝试导出为 base64
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    
    // 如果有 EXIF 数据，需要嵌入
    if (exif && Object.keys(exif).length > 0) {
      try {
        // 动态导入 piexifjs（避免打包问题）
        import('piexifjs').then(module => {
          const piexif = module.default || module;
          const exifObj = buildExifObj(exif, piexif);
          const exifBytes = piexif.dump(exifObj);
          const newDataUrl = piexif.insert(exifBytes, dataUrl);
          
          // 转换 dataURL 为 Blob
          const blob = dataURLtoBlob(newDataUrl);
          resolve(blob);
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
