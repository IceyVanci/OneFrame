const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 选择图片
  selectImage: () => ipcRenderer.invoke('select-image'),
  
  // 保存图片
  saveImage: (defaultName) => ipcRenderer.invoke('save-image', defaultName),
  
  // 截图功能（后续扩展）
  captureScreenshot: (options) => ipcRenderer.invoke('capture-screenshot', options)
});
