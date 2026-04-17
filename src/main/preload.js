const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 选择图片
  selectImage: () => ipcRenderer.invoke('select-image'),
  
  // 保存图片
  saveImage: (defaultName) => ipcRenderer.invoke('save-image', defaultName),
  
  // 保存 Blob 数据
  saveBlob: (buffer, filePath) => ipcRenderer.invoke('save-blob', { buffer, filePath }),
  
  // 读取文件为 ArrayBuffer（用于 EXIF 读取）
  readFileAsArrayBuffer: (filePath) => ipcRenderer.invoke('read-file-as-arraybuffer', filePath),
  
  // 在主进程读取 EXIF
  readExif: (filePath) => ipcRenderer.invoke('read-exif', filePath),
  
  // 读取文件为 Base64（用于导出时 piexif 读取）
  readExifBinary: (filePath) => ipcRenderer.invoke('read-exif-binary', filePath),
  
  // 读取 logo SVG
  getLogoSvg: (logoName) => ipcRenderer.invoke('get-logo-svg', logoName),
  
  // 获取 logo 列表
  getLogos: () => ipcRenderer.invoke('get-logos'),
  
  // 获取文件修改时间
  getFileMtime: (filePath) => ipcRenderer.invoke('get-file-mtime', filePath)
});
