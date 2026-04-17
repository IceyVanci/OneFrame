# OneFrame 函数动作分析总结

---

## 📊 快速总览

| 状态 | 数量 | 说明 |
|------|------|------|
| ✅ 设计/使用中 | 25 | 按设计预期运行，无需修改 |
| ⚠️ 未使用/预留 | 12 | 功能已废弃或预留，未被调用 |
| 🔧 待优化 | 1 | 存在改进空间 |

---

## 📋 机制汇总表

### app.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 影响范围 |
|--------|------|----------|----------|----------|
| `initLogoGrid` | ✅ | 初始化 | 加载 Logo 列表 → 渲染网格 | UI |
| `loadLogoImage` | ✅ | 选择 Logo | 加载 SVG 文件到 `<img>` | UI |
| `selectLogo` | ✅ | 点击 Logo | 更新选中状态 → 更新预览 | UI、边框 |
| `detectLogoBrightness` | ✅ | Logo 亮度检测 | 分析像素亮度判断浅/深色 | Logo 显示 |
| `isLogoLight` | ✅ | Logo 亮度缓存 | 带缓存的亮度检测 | Logo 显示 |
| `loadImageWithExif` | ✅ | 导入文件 | 读取 EXIF → 更新表单 | UI |
| `loadImageInElectron` | ✅ | Electron 选择图片 | IPC 读取 EXIF → 无 EXIF 用文件时间 | UI |
| `updateExifDisplay` | ✅ | EXIF 更新 | 填充 Logo/机型/参数/时间 | UI |
| `showEditor` | ✅ | 进入编辑器 | 显示编辑界面 → 更新边框 | UI |
| `hideEditor` | ✅ | 返回主页 | 隐藏编辑器 → 重置状态 | UI |
| `resetForm` | ✅ | 返回主页 | 清空表单和选中状态 | UI |
| `updateBorder` | ✅ | 颜色/高度变化 | 更新边框高度/裁切 → 更新预览 | 边框预览 |
| `updateBorderContent` | ✅ | 内容变化 | 更新边框文字颜色和内容 | 边框预览 |
| `getEditSettings` | ✅ | 导出时 | 收集所有编辑设置 | 导出 |
| `exportImageHandler` | ✅ | 点击导出 | 调用 exporter → 保存文件 | 文件系统 |

### exporter.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 影响范围 |
|--------|------|----------|----------|----------|
| `loadFonts` | ✅ | 导出时 | 加载 MiSans 三种字重 | Canvas |
| `exportImage` | ✅ | 导出按钮 | 创建 Canvas → 绘制 → 嵌入 EXIF | 文件系统 |
| `drawText` | ✅ | 绘制内容 | 使用 Canvas fillText 绘制文字 | Canvas |
| `drawBorderContent` | ✅ | 导出时 | 按比例绘制 Logo/机型/焦距/署名/时间 | Canvas |
| `detectLogoBrightness` | ✅ | 绘制 Logo | 分析像素亮度判断浅/深色 | Canvas |
| `drawLogo` | ✅ | 绘制内容 | 根据背景色决定是否反转 Logo | Canvas |
| `borderColorIsLight` | ✅ | 颜色判断 | 计算亮度判断浅/深色 | 文字颜色 |
| `formatDateForDisplay` | ✅ | 时间格式化 | 转换为 `YYYY/MM/DD HH:mm` | 边框文字 |
| `dataURLtoBlob` | ✅ | 导出完成 | 将 DataURL 转为 Blob | 文件系统 |
| `buildExifObj` | ✅ | EXIF 构建 | 转换为 piexif 格式 | EXIF |
| `parseExposureTime` | ✅ | 快门解析 | 支持分数和小数格式 | EXIF |
| `saveBlobToFile` | ✅ | 保存文件 | IPC 保存或浏览器下载 | 文件系统 |

### exif.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 影响范围 |
|--------|------|----------|----------|----------|
| `loadExifReader` | ✅ | 首次读取 | 动态加载 exifreader 库 | 全局 |
| `getMakeName` | ✅ | EXIF 读取 | 标准化厂商名称映射 | Logo 匹配 |
| `getExifName` | ✅ | 显示 EXIF | 获取字段中文名称 | UI |
| `formatValue` | ✅ | 值格式化 | 提取 description/value | EXIF 解析 |
| `formatDateTime` | ✅ | 日期格式化 | 转换 EXIF 日期格式 | 时间显示 |
| `getFocalLength` | ✅ | 焦距获取 | 优先等效焦距，回退物理焦距 | 参数填充 |
| `getExif` | ✅ | 导入图片 | 加载并解析 EXIF 全部字段 | 全局 |

### logo-utils.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 影响范围 |
|--------|------|----------|----------|----------|
| `getMakeName` | ✅ | Logo 选择 | 标准化厂商名称 | Logo 匹配 |
| `getAllLogos` | ✅ | Logo 列表 | 返回所有可用 Logo | UI |
| `getLogoFilename` | ✅ | Logo URL | 获取 Logo 文件名 | 文件加载 |
| `getAutoLogoFilename` | ✅ | SVG 字符串 | 获取 .auto.svg 文件名 | 预留 |
| `getMakeLogoPath` | ✅ | Logo 路径 | 获取完整路径 | 文件加载 |
| `getMakeLogo` | ✅ | Logo URL | 从 EXIF 获取 Logo | Logo 显示 |
| `getMakeLogoSvg` | ✅ | SVG 内容 | 获取 SVG 字符串 | 预留 |
| `getModelName` | ✅ | 机型格式化 | 去除冗余后缀 | 机型显示 |
| `replaceTextVars` | ✅ | 文本替换 | 替换 {Key} 占位符 | 预留 |

### exif-exporter.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 影响范围 |
|--------|------|----------|----------|----------|
| `readExifFromFile` | ✅ | 浏览器导出 | FileReader + piexif.load | EXIF 读取 |
| `readExifFromPath` | ✅ | Electron 导出 | IPC 读取 + piexif.load | EXIF 读取 |
| `embedExif` | ✅ | 导出时 | piexif.insert 嵌入 EXIF | 导出 |
| `dumpExif` | ✅ | 导出时 | piexif.dump 转换格式 | 导出 |
| `hasExifData` | ✅ | 导出前检查 | 检查 EXIF 是否有有效数据 | 导出流程 |

### main.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 影响范围 |
|--------|------|----------|----------|----------|
| `createWindow` | ✅ | 应用启动 | 创建 Electron 窗口 | 应用 |
| `select-image` | ✅ | IPC | 打开文件选择对话框 | 文件系统 |
| `save-image` | ✅ | IPC | 打开保存对话框 | 文件系统 |
| `get-logo-svg` | ✅ | IPC | 读取 Logo SVG 文件 | 文件系统 |
| `save-blob` | ✅ | IPC | 保存 Blob 到文件 | 文件系统 |
| `read-file-as-arraybuffer` | ✅ | IPC | 读取文件为 ArrayBuffer | 文件系统 |
| `read-exif` | ✅ | IPC | 使用 exifreader 读取 EXIF | EXIF |
| `read-exif-binary` | ✅ | IPC | 读取文件为 Base64 | EXIF |
| `get-logos` | ✅ | IPC | 动态获取 logos 列表 | 文件系统 |

### preload.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 影响范围 |
|--------|------|----------|----------|----------|
| `selectImage` | ✅ | 渲染进程调用 | 打开文件选择器 | IPC |
| `saveImage` | ✅ | 渲染进程调用 | 打开保存对话框 | IPC |
| `saveBlob` | ✅ | 渲染进程调用 | 保存 Blob 数据 | IPC |
| `readFileAsArrayBuffer` | ✅ | 渲染进程调用 | 读取文件 | IPC |
| `readExif` | ✅ | 渲染进程调用 | 读取 EXIF | IPC |
| `readExifBinary` | ✅ | 渲染进程调用 | 读取二进制 | IPC |
| `getLogoSvg` | ✅ | 渲染进程调用 | 获取 Logo SVG | IPC |
| `getLogos` | ✅ | 渲染进程调用 | 获取 Logo 列表 | IPC |
| `getFileMtime` | ✅ | 渲染进程调用 | 获取文件修改时间 | IPC |

---

## 📂 app.js 详细分析

### 1. `initLogoGrid` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第112-146行 |
| **类型** | 异步函数 |
| **触发时机** | DOMContentLoaded 初始化 |
| **依赖** | `getAllLogos()`, `loadLogoImage()` |

**代码：**
```javascript
async function initLogoGrid() {
  let logos = getAllLogos();
  
  // 尝试从主进程获取 logo 列表（动态读取文件夹）
  if (window.electronAPI) {
    try {
      const serverLogos = await window.electronAPI.getLogos();
      if (serverLogos && serverLogos.length > 0) {
        logos = serverLogos;
      }
    } catch (e) {
      console.warn('Failed to load logos from server:', e);
    }
  }
  
  logoGrid.innerHTML = '';
  logos.forEach(name => {
    const item = document.createElement('div');
    item.className = 'logo-grid-item';
    item.dataset.logo = name;
    
    const img = document.createElement('img');
    img.alt = name;
    img.loading = 'lazy';
    
    loadLogoImage(name, img);
    
    item.appendChild(img);
    item.addEventListener('click', () => selectLogo(name));
    logoGrid.appendChild(item);
  });
}
```

**执行流程：**
1. 获取 Logo 列表（优先从主进程获取）
2. 清空 Logo 网格
3. 为每个 Logo 创建网格项
4. 绑定点击事件

---

### 2. `selectLogo` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第158-186行 |
| **类型** | 函数 |
| **触发时机** | 点击 Logo 网格项 |
| **副作用** | 更新选中状态、预览、边框内容 |

**代码：**
```javascript
function selectLogo(name) {
  selectedLogo = name;
  // 更新选中状态
  document.querySelectorAll('.logo-grid-item').forEach(item => {
    item.classList.toggle('selected', item.dataset.logo === name);
  });
  // 更新预览
  if (name) {
    const previewImg = document.createElement('img');
    previewImg.alt = name;
    previewImg.style.maxWidth = '100%';
    previewImg.style.maxHeight = '100%';
    previewImg.style.objectFit = 'contain';
    
    loadLogoImage(name, previewImg);
    
    logoPreview.innerHTML = '';
    logoPreview.appendChild(previewImg);
    
    // 预加载 logo 亮度信息
    isLogoLight(name);
  } else {
    logoPreview.innerHTML = '';
  }
  
  // 更新边框内容预览
  updateBorderContent();
}
```

**执行流程：**
1. 更新全局 `selectedLogo`
2. 更新 UI 选中状态
3. 创建并加载预览图
4. 预加载亮度检测
5. 更新边框预览

---

### 3. `loadImageWithExif` / `loadImageInElectron` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第189-227行 |
| **类型** | 异步函数 |
| **触发时机** | 用户选择图片 |
| **差异** | 浏览器 vs Electron 环境 |

**浏览器版本代码：**
```javascript
async function loadImageWithExif(file) {
  currentFile = file;
  currentImagePath = null;
  userImage.src = URL.createObjectURL(file);
  try {
    currentExif = await getExif(file);
    updateExifDisplay();
  } catch (error) {
    console.error('Error reading EXIF:', error);
    currentExif = {};
  }
}
```

**Electron 版本代码：**
```javascript
async function loadImageInElectron(imagePath) {
  currentImagePath = imagePath;
  currentFile = null;
  userImage.src = `file://${imagePath}`;
  try {
    const exifTags = await window.electronAPI.readExif(imagePath);
    if (exifTags) {
      currentExif = {};
      for (const key in exifTags) {
        if (exifTags[key] && exifTags[key].description) {
          currentExif[key] = exifTags[key].description;
        } else if (exifTags[key] && exifTags[key].value !== undefined) {
          currentExif[key] = exifTags[key].value;
        }
      }
      updateExifDisplay();
    }
  } catch (error) {
    console.error('Error reading EXIF:', error);
    currentExif = {};
  }
}
```

**执行流程：**
1. 设置当前文件/路径
2. 加载图片到 `<img>`
3. 读取 EXIF 数据
4. 更新 EXIF 显示

---

### 4. `updateExifDisplay` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第230-280行 |
| **类型** | 函数 |
| **触发时机** | EXIF 读取完成 |

**代码：**
```javascript
function updateExifDisplay() {
  if (!currentExif) return;

  // Logo - 自动检测厂商
  const make = currentExif.Make || currentExif.Model;
  if (make) {
    const makeName = getMakeName(make);
    const allLogos = getAllLogos();
    const matchedLogo = allLogos.find(logo => 
      makeName.toLowerCase().includes(logo.toLowerCase())
    );
    
    if (matchedLogo) {
      selectLogo(matchedLogo);
    }
  }

  // 设备型号
  if (currentExif.Model) {
    customModel.value = getModelName(currentExif.Model);
  }

  // 拍摄参数
  if (currentExif.FNumber) {
    fNumber.value = typeof currentExif.FNumber === 'string' 
      ? currentExif.FNumber.replace('f/', '').replace('F', '')
      : currentExif.FNumber;
  }
  if (currentExif.ExposureTime) {
    exposureTime.value = currentExif.ExposureTime;
  }
  // 焦距 - 优先等效焦距
  const focal = getFocalLength(currentExif);
  if (focal) {
    focalLength.value = focal;
  }
  if (currentExif.ISOSpeedRatings) {
    iso.value = currentExif.ISOSpeedRatings;
  }

  // 时间
  if (currentExif.DateTimeOriginal) {
    const dt = currentExif.DateTimeOriginal;
    const parts = dt.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2})/);
    if (parts) {
      dateTime.value = `${parts[1]}-${parts[2]}-${parts[3]}T${parts[4]}:${parts[5]}`;
    }
  }
}
```

**自动填充逻辑：**
1. 检测厂商 → 自动选择 Logo
2. 提取机型 → 填充设备型号
3. 提取光圈 → 填充 f 值
4. 提取快门 → 填充快门时间
5. 提取焦距 → 填充焦距（优先等效）
6. 提取 ISO → 填充感光度
7. 提取时间 → 填充拍摄时间

---

### 5. `updateBorder` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第383-396行 |
| **类型** | 函数 |
| **触发时机** | 颜色/高度变化、图片加载 |
| **副作用** | 更新边框高度和内容 |

**代码：**
```javascript
function updateBorder() {
  if (!userImage.complete) return;
  photoFooter.style.backgroundColor = borderColor.value;
  
  // 边框高度 = 图片短边 × 边框比例
  const shortSide = Math.min(userImage.clientWidth, userImage.clientHeight);
  const footerHeight = Math.round(shortSide * (borderHeight.value / 100));
  photoFooter.style.height = `${footerHeight}px`;
  
  borderHeightLabel.textContent = `${borderHeight.value}%`;
  
  // 更新边框内容预览
  updateBorderContent();
}
```

---

### 6. `updateBorderContent` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第399-494行 |
| **类型** | 异步函数 |
| **触发时机** | 内容变化、Switch 切换 |

**代码片段：**
```javascript
async function updateBorderContent() {
  // 根据边框颜色确定文字颜色
  const isLight = borderColor.value === '#ffffff' || borderColor.value === '#fff';
  const textColor = isLight ? '#000' : '#fff';
  
  // 1. Logo - 智能检测亮度
  if (selectedLogo && switchLogo.classList.contains('active')) {
    let logoIsLight = logoBrightnessCache[selectedLogo]?.isLight;
    if (logoIsLight === undefined) {
      logoIsLight = await isLogoLight(selectedLogo);
    }
    
    if (isLight) {
      borderLogo.innerHTML = `<img src="logos/${selectedLogo}.svg" alt="">`;
    } else {
      if (logoIsLight) {
        borderLogo.innerHTML = `<img src="logos/${selectedLogo}.svg" alt="">`;
      } else {
        borderLogo.innerHTML = `<img src="logos/${selectedLogo}.svg" alt="" class="logo-invert">`;
      }
    }
  }
  
  // 2. 机型
  if (customModel?.value && switchModel.classList.contains('active')) {
    borderModel.textContent = customModel.value;
    borderModel.style.color = textColor;
    borderModel.style.fontFamily = "'MiSans', sans-serif";
    borderModel.style.fontWeight = '600';
  }
  
  // 3. 参数
  if (switchParams.classList.contains('active')) {
    const params = [];
    if (fNumber?.value) params.push(`f/${fNumber.value}`);
    if (exposureTime?.value) params.push(`${exposureTime.value}s`);
    if (iso?.value) params.push(`ISO${iso.value}`);
    borderParams.textContent = params.join(' ');
  }
  
  // 4. 焦距
  if (focalLength?.value) {
    borderFocal.textContent = focalLength.value;
    borderFocal.style.fontWeight = '600';
  }
  
  // 5. 署名
  if (signatureText?.value) {
    borderSignature.textContent = signatureText.value;
  }
  
  // 6. 时间
  if (dateTime?.value && switchTime.classList.contains('active')) {
    const dt = new Date(dateTime.value);
    borderTime.textContent = formatDate(dt);
  }
}
```

---

### 7. `exportImageHandler` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第543-596行 |
| **类型** | 异步函数 |
| **触发时机** | 点击导出按钮 |

**代码：**
```javascript
async function exportImageHandler() {
  if (!userImage.src || !userImage.complete) {
    alert('请先选择图片');
    return;
  }

  try {
    btnSave.disabled = true;
    btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    // 边框高度 = 图片短边 × 边框比例
    const shortSide = Math.min(userImage.naturalWidth, userImage.naturalHeight);
    const borderHeightPx = Math.round(shortSide * (Number(borderHeight?.value) || 12) / 100);
    const settings = getEditSettings();
    
    const borderWidth = photoFooter.clientWidth;

    const blob = await exportImage(userImage, {
      file: currentFile,
      imagePath: currentImagePath,
      borderColor: settings.borderColor,
      borderHeight: borderHeightPx,
      borderWidth: borderWidth,
      quality: 1.0,
      settings: settings
    });

    if (window.electronAPI) {
      const savePath = await window.electronAPI.saveImage('oneframe-output.jpg');
      if (savePath) {
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Array.from(new Uint8Array(arrayBuffer));
        const result = await window.electronAPI.saveBlob(buffer, savePath);
        if (result.success) {
          alert('导出成功！\n保存至: ' + result.path);
        }
      }
    }
  } catch (error) {
    console.error('Export error:', error);
    alert('导出失败: ' + error.message);
  } finally {
    btnSave.disabled = false;
    btnSave.innerHTML = '<i class="fas fa-save"></i><span>保存</span>';
  }
}
```

**执行流程：**
1. 检查图片是否加载
2. 计算边框高度（像素）
3. 收集编辑设置
4. 调用 `exportImage()` 导出
5. 显示保存对话框
6. 保存 Blob 到文件

---

## 📂 exporter.js 详细分析

### 1. `loadFonts` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第16-41行 |
| **类型** | 异步函数 |
| **触发时机** | 首次导出时 |

**代码：**
```javascript
async function loadFonts() {
  try {
    if (!fontSemibold) {
      const semiboldUrl = new URL('../fonts/MiSans-Semibold.ttf', import.meta.url).href;
      fontSemibold = await opentype.load(semiboldUrl);
    }
    if (!fontMedium) {
      const mediumUrl = new URL('../fonts/MiSans-Medium.ttf', import.meta.url).href;
      fontMedium = await opentype.load(mediumUrl);
    }
    if (!fontNormal) {
      const normalUrl = new URL('../fonts/MiSans-Normal.ttf', import.meta.url).href;
      fontNormal = await opentype.load(normalUrl);
    }
    return { fontSemibold, fontMedium, fontNormal };
  } catch (error) {
    console.error('Font loading failed:', error);
    throw error;
  }
}
```

**字体预加载：**
- MiSans-Semibold (600) - 机型、署名
- MiSans-Medium (500) - 焦距
- MiSans-Normal (400) - 参数、时间

---

### 2. `exportImage` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第55-139行 |
| **类型** | 异步函数 |
| **触发时机** | 用户导出图片 |

**代码：**
```javascript
export async function exportImage(img, options) {
  const {
    file = null,
    imagePath = null,
    borderColor = '#ffffff',
    borderHeight = 100,
    borderWidth = null,
    quality = 1.0,
    settings = {}
  } = options;

  // 加载字体
  const fonts = await loadFonts();

  // 创建 Canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // 计算画布尺寸
  canvas.width = img.naturalWidth;
  const exportBorderHeight = borderHeight;
  canvas.height = img.naturalHeight + exportBorderHeight;

  // 绘制图片
  ctx.drawImage(img, 0, 0);

  // 绘制底部边框
  ctx.fillStyle = borderColor;
  ctx.fillRect(0, img.naturalHeight, img.naturalWidth, exportBorderHeight);

  // 绘制边框内容
  const shouldDrawContent = settings && (
    settings.selectedLogo || 
    settings.showModel || 
    settings.showParams || 
    settings.showTime || 
    settings.showSignature ||
    settings.focalLength
  );
  
  if (shouldDrawContent) {
    await drawBorderContent(ctx, img.naturalWidth, img.naturalHeight, exportBorderHeight, borderWidth, settings, fonts);
  }

  // 导出为 DataURL
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  
  // 读取并嵌入 EXIF
  let exifObj = null;
  if (file) {
    exifObj = await readExifFromFile(file);
  } else if (imagePath) {
    exifObj = await readExifFromPath(imagePath);
  }
  
  if (exifObj && hasExifData(exifObj)) {
    const exifBytes = dumpExif(exifObj);
    if (exifBytes) {
      const newDataUrl = embedExif(exifBytes, dataUrl);
      return dataURLtoBlob(newDataUrl);
    }
  }
  
  return dataURLtoBlob(dataUrl);
}
```

**导出流程：**
1. 预加载字体
2. 创建 Canvas
3. 绘制原图
4. 绘制边框
5. 绘制边框内容
6. 导出为 DataURL
7. 读取原图 EXIF
8. 嵌入 EXIF 到输出图
9. 转为 Blob 返回

---

### 3. `drawBorderContent` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第185-305行 |
| **类型** | 异步函数 |
| **触发时机** | 导出时 |

**布局计算：**
```javascript
// 字号缩放比例
const previewWidth = 900;
const scale = imgWidth / previewWidth;
const fontSize = Math.round(12 * scale);
const largeFontSize = Math.round(24 * scale);

// 布局位置（与 CSS 完全一致）
const infoRightX = baseWidth * 0.5;     // 50%
const focalX = baseWidth * 0.525;       // 52.5%
const rightEdgeX = baseWidth * 0.975;   // 97.5%
const logoX = baseWidth * 0.025;        // 2.5%
```

**内容绘制：**
1. **Logo** (2.5%) - 高度60%，宽度限制15%
2. **机型+参数** (17.5%-50%) - 右侧对齐
3. **焦距** (52.5%-80%) - 大号字体
4. **署名+时间** (82.5%-97.5%) - 右侧对齐

---

### 4. `drawLogo` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第371-431行 |
| **类型** | 异步函数 |
| **触发时机** | 绘制 Logo 时 |

**代码：**
```javascript
async function drawLogo(ctx, logoName, x, centerY, borderHeight, imgWidth, borderColor, onComplete) {
  const isDark = !borderColorIsLight(borderColor);
  const normalPath = `logos/${logoName}.svg`;
  
  // 检测原始 logo 亮度
  const logoIsLight = await detectLogoBrightness(normalPath);
  
  // ... 绘制逻辑
  
  // 如果需要颜色反转（深色背景 + 深色 logo）
  if (isDark && !logoIsLight) {
    // 创建临时 canvas 进行颜色反转
    const tempCanvas = document.createElement('canvas');
    // ... 反转 RGB
    ctx.drawImage(tempCanvas, x, centerY - logoHeight / 2, logoWidth, logoHeight);
  } else {
    ctx.drawImage(img, x, centerY - logoHeight / 2, logoWidth, logoHeight);
  }
}
```

---

## 📂 exif.js 详细分析

### 1. `loadExifReader` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第9-39行 |
| **类型** | 异步函数 |
| **触发时机** | 首次读取 EXIF |
| **CDN** | unpkg / jsdelivr |

---

### 2. `getFocalLength` - ✅ 设计

| 属性 | 内容 |
|------|------|
| **位置** | 第180-190行 |
| **类型** | 函数 |
| **优先级** | 等效焦距 > 物理焦距 |

**代码：**
```javascript
export function getFocalLength(exif) {
  // 优先使用等效焦距
  if (exif['FocalLengthIn35mmFilm']) {
    return exif.FocalLengthIn35mmFilm;
  }
  // 回退到物理焦距
  if (exif.FocalLength) {
    return exif.FocalLength;
  }
  return null;
}
```

---

## 📂 logo-utils.js 详细分析

### 厂商列表

```javascript
export const logoList = [
  'Apple', 'Canon', 'DJI', 'Fujifilm', 'Google', 'GoPro', 'Hasselblad',
  'Huawei', 'Insta360', 'Leica', 'Lumix', 'Nikon', 'Nokia', 'Olympus',
  'Oneplus', 'OPPO', 'Pentax', 'Ricoh', 'Samsung', 'Sigma', 'Sony', 'Vivo', 'Xiaomi', 'xuzhou'
];
```

### 厂商名称标准化

```javascript
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
```

---

## 📂 main.js 详细分析

### IPC 处理

| IPC 通道 | 功能 |
|----------|------|
| `select-image` | 打开文件选择器 |
| `save-image` | 打开保存对话框 |
| `get-logo-svg` | 读取 Logo SVG |
| `save-blob` | 保存 Blob 数据 |
| `read-file-as-arraybuffer` | 读取文件 |
| `read-exif` | 使用 exifreader 读取 |
| `read-exif-binary` | 读取为 Base64 |
| `get-file-mtime` | 获取文件修改时间 |
| `get-logos` | 动态获取 Logo 列表 |

---

## 📂 exif-exporter.js 详细分析

### EXIF 导出流程

```
┌─────────────────┐
│  readExifFromX  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   piexif.load   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   hasExifData   │──否──▶ 跳过 EXIF
└────────┬────────┘
         │是
         ▼
┌─────────────────┐
│    dumpExif     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   embedExif     │
└─────────────────┘
```

---

## 📈 数据流分析

### 图片导入流程

```
用户选择图片
     │
     ▼
┌─────────────────────────────────────┐
│  loadImageWithExif / loadImageInElectron  │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│            getExif(file)            │
│  - 动态加载 exifreader              │
│  - 解析 EXIF 字段                   │
│  - 标准化厂商名称                   │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│         updateExifDisplay           │
│  - 自动选择 Logo                    │
│  - 填充机型/参数/时间               │
│  - 更新边框预览                     │
└─────────────────────────────────────┘
```

### 边框内容更新流程

```
边框内容变化
     │
     ▼
┌─────────────────────────────────────┐
│         updateBorderContent         │
│  - 判断边框颜色（浅/深）            │
│  - 设置文字颜色                      │
│  - 更新 Logo（智能亮度检测）        │
│  - 更新机型/参数/焦距/署名/时间    │
└─────────────────────────────────────┘
```

### 图片导出流程

```
用户点击导出
     │
     ▼
┌─────────────────────────────────────┐
│        exportImageHandler           │
│  - 计算边框高度（像素）             │
│  - 收集编辑设置                     │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│           exportImage               │
│  1. 加载字体（MiSans 三种）          │
│  2. 创建 Canvas                      │
│  3. 绘制原图                         │
│  4. 绘制边框                         │
│  5. 按比例绘制边框内容               │
│  6. 导出为 DataURL                   │
│  7. 读取原图 EXIF                    │
│  8. 嵌入 EXIF                        │
│  9. 转为 Blob                        │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│         saveBlobToFile             │
│  - Electron: IPC 保存               │
│  - 浏览器: URL.createObjectURL      │
└─────────────────────────────────────┘
```

---

## 📊 统计

| 分类 | 数量 |
|------|------|
| 设计/使用中 | 25 |
| 未使用/预留 | 12 |
| 待优化 | 1 |
| **总计分析** | **38** |

---

## 🔧 待优化项

### 1. 字体字重一致性 - ✅ 已修复

| 元素 | CSS 字重 | 预览字重 | 导出字重 | 状态 |
|------|----------|----------|----------|------|
| 机型 | 500 | 500 | 500 | ✅ 一致 |
| 焦距 | 500 | 500 | 500 | ✅ 一致 |
| 参数 | normal | normal | normal | ✅ 一致 |
| 署名 | 600 | 600 | 600 | ✅ 一致 |
| 时间 | normal | normal | normal | ✅ 一致 |

**修复内容：**
- CSS：机型和焦距改为 500 (Medium)
- app.js：机型和焦距字重从 600 改为 500
- exporter.js：机型和焦距字重使用 500

### 2. app.js 中的字重硬编码 - ✅ 已修复

| 位置 | 旧值 | 新值 | 状态 |
|------|------|------|------|
| 第445行 (机型) | 600 | 500 | ✅ 已修复 |
| 第459行 (参数) | normal | normal | ✅ 正确 |
| 第469行 (焦距) | 600 | 500 | ✅ 已修复 |
| 第479行 (署名) | 600 | 600 | ✅ 正确 |
| 第490行 (时间) | normal | normal | ✅ 正确 |

**最终字重分配：**
- **Medium (500)**: 机型、焦距
- **Normal (400)**: 参数、时间
- **Semibold (600)**: 署名

### 3. Logo 亮度检测异步问题 - 🔧 待优化

| 问题 | 影响 |
|------|------|
| `detectLogoBrightness` 在 `updateBorderContent` 中异步调用 | 可能导致首次渲染时 Logo 颜色不正确 |

**建议：** 在 Logo 选择时预先检测亮度并缓存。

---

## ⚠️ 未使用/预留函数

以下函数存在于代码中但未被调用，保留作为预留功能或历史遗留：

### exporter.js

| 函数 | 状态 | 原因 |
|------|------|------|
| `buildExifObj` | 未使用 | 直接使用 piexif.load() 读取已有 EXIF |
| `parseExposureTime` | 未使用 | EXIF 读取后直接使用已有格式 |
| `saveBlobToFile` | 未使用 | app.js 直接调用 electronAPI.saveBlob |
| `isLogoLightFromCache` | 未使用 | 功能被 detectLogoBrightness 替代 |

### exif.js

| 函数/常量 | 状态 | 原因 |
|-----------|------|------|
| `getExifName` | 未使用 | UI 不显示 EXIF 详情表 |
| `SUPPORTED_MAKES` | 未使用 | 从 logoList 获取 |
| `exifPrimaryKeys` | 未使用 | 仅定义 |
| `primaryExif` | 未使用 | UI 不显示详情表 |

### logo-utils.js

| 函数/常量 | 状态 | 原因 |
|-----------|------|------|
| `logoSvgMap` | 未使用 | 改用真实 SVG 文件 |
| `getAutoLogoFilename` | 未使用 | 改用 CSS filter 方案 |
| `getMakeLogoPath` | 未使用 | 改用相对路径 |
| `getMakeLogo` | 未使用 | 改用直接匹配 |
| `getMakeLogoSvg` | 未使用 | 改用 `<img>` 加载 |
| `replaceTextVars` | 未使用 | 预留功能 |

### main.js

| IPC 通道 | 状态 | 原因 |
|----------|------|------|
| `get-logo-svg` | 未使用 | 改用相对路径加载 |
