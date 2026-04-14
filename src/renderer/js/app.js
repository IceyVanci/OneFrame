// OneFrame 主程序
import { getExif, formatDateTime, getFocalLength } from './exif.js';
import { getMakeLogoSvg, getModelName, logoSvgMap, getAllLogos, getLogoFilename, getAutoLogoFilename, getMakeName, getMakeLogo, getMakeLogoPath } from './logo-utils.js';
import { exportImage } from './exporter.js';

let currentExif = null;
let currentFile = null;
let currentImagePath = null;

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
    try {
      // 通过主进程 IPC 读取 EXIF
      const exifTags = await window.electronAPI.readExif(imagePath);
      if (exifTags) {
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

  function updateBorder() {
    if (!userImage.complete) return;
    photoFooter.style.backgroundColor = borderColor.value;
    
    // 边框宽度 = 图片的显示宽度（无论横向还是纵向）
    const imgDisplayWidth = userImage.clientWidth;
    const imgDisplayHeight = userImage.clientHeight;
    
    // 边框高度 = 图片显示宽度 × 边框比例
    // 这样纵向图片的边框宽度也等于图片显示宽度（短边）
    const footerHeight = Math.round(imgDisplayWidth * (borderHeight.value / 100));
    photoFooter.style.height = `${footerHeight}px`;
    
    borderHeightLabel.textContent = `${borderHeight.value}%`;
    
    // 更新边框内容预览
    updateBorderContent();
  }
  
  // 更新边框内容预览
  function updateBorderContent() {
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
    
    // 1. Logo - 根据背景颜色自动切换
    if (selectedLogo && document.getElementById('switchLogo')?.classList.contains('active')) {
      const logoSrc = `logos/${selectedLogo}.svg`;
      // 白背景用原色，黑背景反转
      const logoFilter = isLight ? '' : 'filter: brightness(0) invert(1);';
      borderLogo.innerHTML = `<img src="${logoSrc}" alt="" style="${logoFilter}">`;
    } else {
      borderLogo.innerHTML = '';
    }
    
    // 2. 机型
    if (customModel?.value && document.getElementById('switchModel')?.classList.contains('active')) {
      borderModel.textContent = customModel.value;
      borderModel.style.color = textColor;
    } else {
      borderModel.textContent = '';
    }
    
    // 3. 参数（光圈、快门、ISO）
    if (document.getElementById('switchParams')?.classList.contains('active')) {
      const params = [];
      if (fNumber?.value) params.push(`f/${fNumber.value}`);
      if (exposureTime?.value) params.push(`${exposureTime.value}s`);
      if (iso?.value) params.push(`ISO${iso.value}`);
      borderParams.textContent = params.join(' ');
      borderParams.style.color = textColor;
    } else {
      borderParams.textContent = '';
    }
    
    // 4. 焦距（输入框已有 mm 单位，不再添加）
    if (focalLength?.value) {
      borderFocal.textContent = focalLength.value;
      borderFocal.style.color = textColor;
    } else {
      borderFocal.textContent = '';
    }
    
  // 5. 署名（有内容时自动显示，无需开关）
    if (signatureText?.value) {
      borderSignature.textContent = signatureText.value;
      borderSignature.style.color = textColor;
    } else {
      borderSignature.textContent = '';
    }
    
    // 6. 时间
    if (dateTime?.value && document.getElementById('switchTime')?.classList.contains('active')) {
      const dt = new Date(dateTime.value);
      borderTime.textContent = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
      borderTime.style.color = textColor;
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
      aspectRatio: document.getElementById('aspectRatio')?.value || 'original'
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

      const shortSide = Math.min(userImage.naturalWidth, userImage.naturalHeight);
      const borderHeightPx = Math.round(shortSide * ((borderHeight?.value || 12) / 100));
      const settings = getEditSettings();

      const blob = await exportImage(userImage, {
        borderColor: settings.borderColor,
        borderHeight: borderHeightPx,
        exif: currentExif,
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
