// OneFrame 主程序
import { getExif, formatDateTime } from './exif.js';
import { getMakeLogoSvg, getModelName } from './logo-utils.js';
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
  const logoSelect = document.getElementById('logoSelect');
  const logoPreview = document.getElementById('logoPreview');
  const customModel = document.getElementById('customModel');
  const fNumber = document.getElementById('fNumber');
  const exposureTime = document.getElementById('exposureTime');
  const focalLength = document.getElementById('focalLength');
  const iso = document.getElementById('iso');
  const dateTime = document.getElementById('dateTime');

  let currentStyle = null;

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

    // Logo
    const logoSvg = getMakeLogoSvg(currentExif);
    if (logoSvg) {
      logoPreview.innerHTML = logoSvg;
      // 自动设置select值
      const make = currentExif.Make || currentExif.Model;
      if (make) {
        const makeName = make.trim().toLowerCase();
        for (const opt of logoSelect.options) {
          if (opt.value && opt.value.toLowerCase() === makeName) {
            logoSelect.value = opt.value;
            break;
          }
        }
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
    if (currentExif.FocalLength) {
      focalLength.value = currentExif.FocalLength;
    }
    if (currentExif.ISOSpeedRatings) {
      iso.value = currentExif.ISOSpeedRatings;
    }

    // 时间
    if (currentExif.DateTimeOriginal) {
      dateTime.value = currentExif.DateTimeOriginal;
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
    logoSelect.value = '';
    logoPreview.innerHTML = '';
    customModel.value = '';
    fNumber.value = '';
    exposureTime.value = '';
    focalLength.value = '';
    iso.value = '';
    dateTime.value = '';
    document.querySelectorAll('.switch').forEach(s => s.classList.remove('active'));
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

  // Logo选择变化
  logoSelect.addEventListener('change', () => {
    const selected = logoSelect.value;
    if (selected) {
      const svg = getMakeLogoSvg(selected);
      logoPreview.innerHTML = svg;
    } else {
      logoPreview.innerHTML = '';
    }
  });

  function updateBorder() {
    if (!userImage.complete) return;
    photoFooter.style.backgroundColor = borderColor.value;
    const shortSide = Math.min(userImage.clientWidth, userImage.clientHeight);
    const height = Math.round(shortSide * (borderHeight.value / 100));
    photoFooter.style.height = `${height}px`;
    borderHeightLabel.textContent = `${borderHeight.value}%`;
  }

  borderColor.addEventListener('input', updateBorder);
  borderHeight.addEventListener('input', updateBorder);
  userImage.addEventListener('load', updateBorder);

  // Switch 切换
  document.querySelectorAll('.switch').forEach(sw => {
    sw.addEventListener('click', () => {
      sw.classList.toggle('active');
    });
  });

  // 获取编辑设置
  function getEditSettings() {
    return {
      showLogo: document.getElementById('switchLogo')?.classList.contains('active') ?? false,
      selectedLogo: logoSelect?.value || '',
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
