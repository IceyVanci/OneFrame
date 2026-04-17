// OneFrame 主程序
import { getExif, formatDateTime, getFocalLength } from './exif.js';
import { getModelName, getAllLogos, getLogoFilename, getMakeName } from './logo-utils.js';
import { exportImage } from './exporter.js';

let currentExif = null;
let currentFile = null;
let currentImagePath = null;

// Logo 亮度缓存 { logoName: { isLight: boolean } }
const logoBrightnessCache = {};

/**
 * 检测 logo 图片的平均亮度
 * @param {string} logoPath - logo 文件路径
 * @returns {Promise<boolean>} 是否为浅色 logo
 */
function detectLogoBrightness(logoPath) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 创建临时 canvas 分析像素
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
        
        // 采样分析（每隔一个像素）
        for (let i = 0; i < data.length; i += 8) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          // 跳过透明像素
          if (a < 128) continue;
          
          // 计算亮度
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          totalBrightness += brightness;
          pixelCount++;
        }
        
        const avgBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 128;
        // 亮度 > 100 认为是浅色 logo
        resolve(avgBrightness > 100);
      } catch (e) {
        // 跨域或加载失败，默认浅色
        resolve(true);
      }
    };
    img.onerror = () => resolve(true);
    img.src = logoPath;
  });
}

/**
 * 获取 logo 是否为浅色（带缓存）
 */
async function isLogoLight(logoName) {
  if (logoBrightnessCache[logoName] !== undefined) {
    return logoBrightnessCache[logoName].isLight;
  }
  
  // 检测原始 logo 亮度
  const brightness = await detectLogoBrightness(`logos/${logoName}.svg`);
  logoBrightnessCache[logoName] = { isLight: brightness };
  
  return brightness;
}

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.querySelector('.app-container');
  const editorView = document.getElementById('editor-view');
  const styleCards = document.querySelectorAll('.style-card:not(.disabled)');
  const userImage = document.getElementById('userImage');
  const photoFooter = document.getElementById('photoFooter');

  // 浮动按钮
  const btnTemplate = document.getElementById('btnTemplate');
  const btnReselect = document.getElementById('btnReselect');
  const btnEdit = document.getElementById('btnEdit');
  const btnSave = document.getElementById('btnSave');
  const editPanel = document.getElementById('editPanel');

  // 编辑控件
  const borderColor = document.getElementById('borderColor');
  const borderHeight = document.getElementById('borderHeight');
  const borderHeightLabel = document.getElementById('borderHeightLabel');
  const logoGrid = document.getElementById('logoGrid');
  const logoPreview = document.getElementById('logoPreview');
  const customModel = document.getElementById('customModel');
  const fNumber = document.getElementById('fNumber');
  const exposureTime = document.getElementById('exposureTime');
  const focalLength = document.getElementById('focalLength');
  const iso = document.getElementById('iso');
  const dateTime = document.getElementById('dateTime');
  const signatureText = document.getElementById('signatureText');

  let currentStyle = null;
  let selectedLogo = null;

  // 初始化 Logo 网格（使用 <img> 显示 .svg 文件）
  async function initLogoGrid() {
    let logos = getAllLogos();
    
    // 尝试从主进程获取 logo 列表（动态读取文件夹）
    if (window.electronAPI) {
      try {
        const serverLogos = await window.electronAPI.getLogos();
        if (serverLogos && serverLogos.length > 0) {
          logos = serverLogos;
          console.log('Loaded logos from server:', logos.length);
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
      
      // 创建 <img> 元素加载 .svg 文件
      const img = document.createElement('img');
      img.alt = name;
      img.loading = 'lazy';
      
      // 尝试加载 logo
      loadLogoImage(name, img);
      
      item.appendChild(img);
      item.addEventListener('click', () => selectLogo(name));
      logoGrid.appendChild(item);
    });
  }

  // 加载 Logo 图片（使用相对路径加载 src/renderer/logos/*.svg）
  async function loadLogoImage(name, imgElement) {
    try {
      imgElement.src = `logos/${getLogoFilename(name)}`;
    } catch (e) {
      console.warn('Failed to load logo image:', name, e);
    }
  }

  // 选择 Logo
  function selectLogo(name) {
    selectedLogo = name;
    // 更新选中状态
    document.querySelectorAll('.logo-grid-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.logo === name);
    });
    // 更新预览 - 使用 <img> 显示
    if (name) {
      const previewImg = document.createElement('img');
      previewImg.alt = name;
      previewImg.style.maxWidth = '100%';
      previewImg.style.maxHeight = '100%';
      previewImg.style.objectFit = 'contain';
      
      // 加载预览图片
      loadLogoImage(name, previewImg);
      
      logoPreview.innerHTML = '';
      logoPreview.appendChild(previewImg);
      
      // 预加载 logo 亮度信息（异步，不阻塞 UI）
      isLogoLight(name);
    } else {
      logoPreview.innerHTML = '';
    }
    
    // 更新边框内容预览
    updateBorderContent();
  }

  // 加载图片并读取EXIF
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

  // 在 Electron 环境下加载图片并读取EXIF
  async function loadImageInElectron(imagePath) {
    currentImagePath = imagePath;
    currentFile = null;
    userImage.src = `file://${imagePath}`;
    
    // 重置表单（清除之前图片的数据）
    resetForm();
    
    try {
      // 通过主进程 IPC 读取 EXIF
      const exifTags = await window.electronAPI.readExif(imagePath);
      if (exifTags && Object.keys(exifTags).length > 0) {
        // 转换为对象格式
        currentExif = {};
        for (const key in exifTags) {
          if (exifTags[key] && exifTags[key].description) {
            currentExif[key] = exifTags[key].description;
          } else if (exifTags[key] && exifTags[key].value !== undefined) {
            currentExif[key] = exifTags[key].value;
          }
        }
        console.log('EXIF from main process:', currentExif);
        updateExifDisplay();
      } else {
        // 无 EXIF 信息，使用文件修改时间
        currentExif = {};
        const fileMtime = await window.electronAPI.getFileMtime(imagePath);
        if (fileMtime) {
          const dt = new Date(fileMtime);
          dateTime.value = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}T${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
        }
      }
    } catch (error) {
      console.error('Error reading EXIF:', error);
      currentExif = {};
    }
  }

  // 更新EXIF显示
  function updateExifDisplay() {
    if (!currentExif) return;

    // Logo - 自动检测厂商
    const make = currentExif.Make || currentExif.Model;
    if (make) {
      const makeName = getMakeName(make);
      // 查找匹配的厂商
      const allLogos = getAllLogos();
      const matchedLogo = allLogos.find(logo => 
        makeName.toLowerCase().includes(logo.toLowerCase())
      );
      
      if (matchedLogo) {
        selectLogo(matchedLogo);
      }
    }

    // 设备型号 - 始终填充值
    if (currentExif.Model) {
      customModel.value = getModelName(currentExif.Model);
    }

    // 拍摄参数 - 填充值
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

    // 时间 - 转换为 datetime-local 格式
    if (currentExif.DateTimeOriginal) {
      const dt = currentExif.DateTimeOriginal;
      // 格式: YYYY-MM-DDTHH:mm
      const parts = dt.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2})/);
      if (parts) {
        dateTime.value = `${parts[1]}-${parts[2]}-${parts[3]}T${parts[4]}:${parts[5]}`;
      }
    }
  }

  // 点击样式卡片
  styleCards.forEach(card => {
    card.addEventListener('click', async () => {
      currentStyle = card.dataset.style;
      if (window.electronAPI) {
        const imagePath = await window.electronAPI.selectImage();
        if (imagePath) {
          await loadImageInElectron(imagePath);
          showEditor();
        }
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          if (e.target.files[0]) {
            loadImageWithExif(e.target.files[0]);
            showEditor();
          }
        };
        input.click();
      }
    });
  });

  function showEditor() {
    appContainer.style.display = 'none';
    editorView.classList.remove('hidden');
    if (userImage.complete) {
      updateBorder();
    }
  }

  function hideEditor() {
    appContainer.style.display = 'flex';
    editorView.classList.add('hidden');
    userImage.src = '';
    currentStyle = null;
    currentExif = null;
    currentFile = null;
    currentImagePath = null;
    editPanel.classList.remove('visible');
    // 重置表单
    resetForm();
  }

  function resetForm() {
    selectedLogo = null;
    logoPreview.innerHTML = '';
    customModel.value = '';
    fNumber.value = '';
    exposureTime.value = '';
    focalLength.value = '';
    iso.value = '';
    dateTime.value = '';
    document.querySelectorAll('.logo-grid-item').forEach(item => {
      item.classList.remove('selected');
    });
  }

  // 换个模板 - 返回主页
  btnTemplate.addEventListener('click', hideEditor);

  // 重选照片
  btnReselect.addEventListener('click', async () => {
    if (window.electronAPI) {
      const imagePath = await window.electronAPI.selectImage();
      if (imagePath) {
        await loadImageInElectron(imagePath);
      }
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        if (e.target.files[0]) loadImageWithExif(e.target.files[0]);
      };
      input.click();
    }
  });

  // 编辑 - 切换编辑面板
  btnEdit.addEventListener('click', () => {
    editPanel.classList.toggle('visible');
  });

  // 关闭编辑面板
  document.getElementById('btnClosePanel')?.addEventListener('click', () => {
    editPanel.classList.remove('visible');
  });

  // 颜色预设按钮
  document.querySelectorAll('.color-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      borderColor.value = btn.dataset.color;
      updateBorder();
    });
  });

  // 比例选择器切换
  document.getElementById('aspectRatio')?.addEventListener('change', updateBorder);

  function updateBorder() {
    if (!userImage.complete) return;
    
    photoFooter.style.backgroundColor = borderColor.value;
    
    // 判断图片方向
    const isLandscape = userImage.clientWidth > userImage.clientHeight;
    
    // 边框高度 = 图片短边（显示宽度或高度）× 边框比例
    const shortSide = Math.min(userImage.clientWidth, userImage.clientHeight);
    const footerHeight = Math.round(shortSide * (borderHeight.value / 100));
    photoFooter.style.height = `${footerHeight}px`;
    
    // 边框宽度：根据图片方向分别处理
    if (isLandscape) {
      photoFooter.style.width = '100%';  // 横向图片：占满宽度
    } else {
      photoFooter.style.width = `${shortSide}px`;  // 纵向图片：使用短边
    }
    
    borderHeightLabel.textContent = `${borderHeight.value}%`;
    
    // 根据比例设置调整预览效果
    const aspectRatio = document.getElementById('aspectRatio').value;
    
    if (aspectRatio === 'original') {
      const offset = Math.round(footerHeight / 4);  // 边框高度的1/4
      
      // 横向和纵向图片使用相同的裁切逻辑
      // 裁切百分比 = 边框高度/2 / 图片高度 × 100
      const cropPercent = (footerHeight / 2) / userImage.clientHeight * 100;
      userImage.style.clipPath = `inset(${cropPercent}% 0)`;
      userImage.style.transform = `translateY(${offset}px)`;
      photoFooter.style.transform = `translateY(-${offset}px)`;
    } else {
      // 默认模式：不做裁剪
      userImage.style.clipPath = 'none';
      userImage.style.transform = 'none';
      photoFooter.style.transform = 'none';
    }
    
    // 更新边框内容预览
    updateBorderContent();
  }
  
  // 更新边框内容预览
  async function updateBorderContent() {
    const borderLogo = document.getElementById('borderLogo');
    const borderModel = document.getElementById('borderModel');
    const borderParams = document.getElementById('borderParams');
    const borderFocal = document.getElementById('borderFocal');
    const borderSignature = document.getElementById('borderSignature');
    const borderTime = document.getElementById('borderTime');
    
    // 根据边框颜色确定文字颜色
    const isLight = borderColor.value === '#ffffff' || borderColor.value === '#fff';
    const textColor = isLight ? '#000' : '#fff';
    document.querySelectorAll('.border-text').forEach(el => {
      el.style.color = textColor;
    });
    
    // 1. Logo - 智能检测：根据原始 logo 亮度决定是否使用 .auto.svg
    if (selectedLogo && document.getElementById('switchLogo')?.classList.contains('active')) {
      // 确保亮度检测完成
      let logoIsLight = logoBrightnessCache[selectedLogo]?.isLight;
      if (logoIsLight === undefined) {
        // 缓存未命中，强制检测
        logoIsLight = await isLogoLight(selectedLogo);
      }
      
      if (isLight) {
        // 浅色背景：用原始 logo
        borderLogo.innerHTML = `<img src="logos/${selectedLogo}.svg" alt="">`;
      } else {
        // 深色背景
        if (logoIsLight) {
          // 原始 logo 是浅色，保持原样（浅色在深色背景也可见）
          borderLogo.innerHTML = `<img src="logos/${selectedLogo}.svg" alt="">`;
        } else {
          // 原始 logo 是深色，需要将颜色转换成白色
          borderLogo.innerHTML = `<img src="logos/${selectedLogo}.svg" alt="" class="logo-invert">`;
        }
      }
    } else {
      borderLogo.innerHTML = '';
    }
    
    // 2. 机型 - 使用 Medium
    if (customModel?.value && document.getElementById('switchModel')?.classList.contains('active')) {
      borderModel.textContent = customModel.value;
      borderModel.style.color = textColor;
      borderModel.style.fontFamily = "'MiSans', 'Segoe UI', sans-serif";
      borderModel.style.fontWeight = '500';
    } else {
      borderModel.textContent = '';
    }
    
    // 3. 参数（光圈、快门、ISO）- 使用 Semibold
    if (document.getElementById('switchParams')?.classList.contains('active')) {
      const params = [];
      if (fNumber?.value) params.push(`f/${fNumber.value}`);
      if (exposureTime?.value) params.push(`${exposureTime.value}s`);
      if (iso?.value) params.push(`ISO${iso.value}`);
      borderParams.textContent = params.join(' ');
      borderParams.style.color = textColor;
      borderParams.style.fontFamily = "'MiSans', 'Segoe UI', sans-serif";
      borderParams.style.fontWeight = 'normal';
    } else {
      borderParams.textContent = '';
    }
    
    // 4. 焦距（输入框已有 mm 单位，不再添加）- 使用 Medium
    if (focalLength?.value) {
      borderFocal.textContent = focalLength.value;
      borderFocal.style.color = textColor;
      borderFocal.style.fontFamily = "'MiSans', 'Segoe UI', sans-serif";
      borderFocal.style.fontWeight = '500';
    } else {
      borderFocal.textContent = '';
    }
    
  // 5. 署名（有内容时自动显示，无需开关）- 使用 Semibold
    if (signatureText?.value) {
      borderSignature.textContent = signatureText.value;
      borderSignature.style.color = textColor;
      borderSignature.style.fontFamily = "'MiSans', 'Segoe UI', sans-serif";
      borderSignature.style.fontWeight = '600';
    } else {
      borderSignature.textContent = '';
    }
    
    // 6. 时间 - 使用 Normal
    if (dateTime?.value && document.getElementById('switchTime')?.classList.contains('active')) {
      const dt = new Date(dateTime.value);
      borderTime.textContent = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
      borderTime.style.color = textColor;
      borderTime.style.fontFamily = "'MiSans', 'Segoe UI', sans-serif";
      borderTime.style.fontWeight = 'normal';
    } else {
      borderTime.textContent = '';
    }
  }

  borderColor.addEventListener('input', updateBorder);
  borderHeight.addEventListener('input', updateBorder);
  userImage.addEventListener('load', updateBorder);
  
  // 编辑控件 - 输入时实时更新预览
  const editControls = [
    'customModel', 'fNumber', 'exposureTime', 'focalLength', 'iso',
    'dateTime', 'signatureText'
  ];
  editControls.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateBorderContent);
    }
  });

  // Switch 切换
  document.querySelectorAll('.switch').forEach(sw => {
    sw.addEventListener('click', () => {
      sw.classList.toggle('active');
      updateBorderContent();
    });
  });

  // 获取编辑设置
  function getEditSettings() {
    return {
      showLogo: document.getElementById('switchLogo')?.classList.contains('active') ?? false,
      selectedLogo: selectedLogo || '',
      showModel: document.getElementById('switchModel')?.classList.contains('active') ?? false,
      customModel: customModel?.value || '',
      showParams: document.getElementById('switchParams')?.classList.contains('active') ?? false,
      fNumber: fNumber?.value || '',
      exposureTime: exposureTime?.value || '',
      focalLength: focalLength?.value || '',
      iso: iso?.value || '',
      showTime: document.getElementById('switchTime')?.classList.contains('active') ?? false,
      dateTime: dateTime?.value || '',
      showSignature: document.getElementById('switchSignature')?.classList.contains('active') ?? false,
      signatureText: document.getElementById('signatureText')?.value || '',
      borderColor: borderColor?.value || '#ffffff',
      borderHeight: borderHeight?.value || 12,
      aspectRatio: document.getElementById('aspectRatio')?.value || 'default'
    };
  }

  // 导出处理
  async function exportImageHandler() {
    if (!userImage.src || !userImage.complete) {
      alert('请先选择图片');
      return;
    }

    try {
      btnSave.disabled = true;
      btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      // 边框高度 = 图片短边 × 边框比例（与预览保持一致）
      const shortSide = Math.min(userImage.naturalWidth, userImage.naturalHeight);
      const borderHeightPx = Math.round(shortSide * (Number(borderHeight?.value) || 12) / 100);
      const settings = getEditSettings();
      
      const blob = await exportImage(userImage, {
        file: currentFile,
        imagePath: currentImagePath,
        borderColor: settings.borderColor,
        borderHeight: borderHeightPx,
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
          } else {
            alert('导出失败: ' + result.error);
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

  // 导出按钮
  btnSave.addEventListener('click', exportImageHandler);
  document.getElementById('btnExport')?.addEventListener('click', exportImageHandler);
  document.getElementById('btnExportTop')?.addEventListener('click', exportImageHandler);

  // 初始化 Logo 网格
  initLogoGrid();

  // 初始化边框高度计算
  const previewImages = document.querySelectorAll('.style-preview .frame-container img');
  previewImages.forEach(img => {
    img.addEventListener('load', function() {
      const footer = this.nextElementSibling;
      if (footer && footer.classList.contains('photo-footer')) {
        const shortSide = Math.min(this.clientWidth, this.clientHeight);
        const height = Math.round(shortSide * 0.12);
        footer.style.height = `${height}px`;
      }
    });
  });
});
