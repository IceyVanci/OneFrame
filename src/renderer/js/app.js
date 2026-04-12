// OneFrame 主程序
document.addEventListener('DOMContentLoaded', () => {
  // 获取元素
  const appContainer = document.querySelector('.app-container');
  const editorView = document.getElementById('editor-view');
  const styleCards = document.querySelectorAll('.style-card:not(.disabled)');
  const btnBack = document.getElementById('btnBack');
  const userImage = document.getElementById('userImage');
  const photoFooter = document.getElementById('photoFooter');
  const borderColor = document.getElementById('borderColor');
  const borderHeight = document.getElementById('borderHeight');
  const borderHeightLabel = document.getElementById('borderHeightLabel');
  const btnExport = document.getElementById('btnExport');

  let currentStyle = null;

  // 点击样式卡片
  styleCards.forEach(card => {
    card.addEventListener('click', async () => {
      currentStyle = card.dataset.style;
      
      // 调用 Electron API 选择图片
      if (window.electronAPI) {
        const imagePath = await window.electronAPI.selectImage();
        if (imagePath) {
          // 加载用户图片并显示编辑器
          userImage.src = `file://${imagePath}`;
          showEditor();
        }
      } else {
        // Web 模式下使用 input[type=file]（仅用于开发测试）
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          if (e.target.files[0]) {
            userImage.src = URL.createObjectURL(e.target.files[0]);
            showEditor();
          }
        };
        input.click();
      }
    });
  });

  // 显示编辑器
  function showEditor() {
    appContainer.style.display = 'none';
    editorView.classList.remove('hidden');
    updateBorder();
  }

  // 返回首页
  function hideEditor() {
    appContainer.style.display = 'flex';
    editorView.classList.add('hidden');
    userImage.src = '';
    currentStyle = null;
  }

  btnBack.addEventListener('click', hideEditor);

  // 更新边框样式
  function updateBorder() {
    photoFooter.style.backgroundColor = borderColor.value;
    photoFooter.style.height = `${borderHeight.value}%`;
    borderHeightLabel.textContent = `${borderHeight.value}%`;
  }

  borderColor.addEventListener('input', updateBorder);
  borderHeight.addEventListener('input', updateBorder);

  // 导出功能
  btnExport.addEventListener('click', async () => {
    if (!userImage.src) {
      alert('请先选择图片');
      return;
    }

    // 获取保存路径
    let savePath = null;
    if (window.electronAPI) {
      savePath = await window.electronAPI.saveImage('oneframe-output.jpg');
    }

    if (savePath) {
      // TODO: 使用 Puppeteer 截图并保存
      console.log('保存到:', savePath);
      alert('导出功能开发中...');
    }
  });

  // 图片加载后计算边框高度
  userImage.addEventListener('load', () => {
    calculateBorderHeight();
  });

  function calculateBorderHeight() {
    const img = userImage;
    if (img.complete && img.naturalWidth > 0) {
      const shortSide = Math.min(img.clientWidth, img.clientHeight);
      const height = Math.round(shortSide * (borderHeight.value / 100));
      photoFooter.style.height = `${height}px`;
    }
  }

  // 窗口大小改变时重新计算
  window.addEventListener('resize', () => {
    if (!editorView.classList.contains('hidden')) {
      calculateBorderHeight();
    }
  });

  // 初始化边框高度计算（用于首页预览）
  const previewImages = document.querySelectorAll('.style-preview .frame-container img');
  previewImages.forEach(img => {
    img.addEventListener('load', function() {
      const footer = this.nextElementSibling;
      if (footer && footer.classList.contains('photo-footer')) {
        const shortSide = Math.min(this.clientWidth, this.clientHeight);
        const height = Math.round(shortSide * 0.12); // 12%
        footer.style.height = `${height}px`;
      }
    });
  });
});
