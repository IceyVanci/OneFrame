const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// 禁用硬件加速，避免某些Windows系统问题
app.disableHardwareAcceleration();

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    backgroundColor: '#1a1a2e'
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 打开开发者工具（开发模式）
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 选择图片文件
ipcMain.handle('select-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// 保存图片文件
ipcMain.handle('save-image', async (event, defaultName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || 'output.jpg',
    filters: [
      { name: 'JPEG图片', extensions: ['jpg', 'jpeg'] }
    ]
  });
  
  if (!result.canceled) {
    return result.filePath;
  }
  return null;
});

// 读取 logo SVG 文件
ipcMain.handle('get-logo-svg', async (event, logoName) => {
  try {
    // 尝试多个可能的路径
    const possiblePaths = [
      path.join(__dirname, '../renderer/logos', logoName),
      path.join(__dirname, '../../src/renderer/logos', logoName),
      path.join(process.resourcesPath || '', 'logos', logoName),
    ];
    
    for (const logoPath of possiblePaths) {
      if (fs.existsSync(logoPath)) {
        return fs.readFileSync(logoPath, 'utf-8');
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading logo:', error);
    return null;
  }
});

// 保存 Blob 数据到文件
ipcMain.handle('save-blob', async (event, { buffer, filePath }) => {
  try {
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Error saving file:', error);
    return { success: false, error: error.message };
  }
});

// 读取文件为 ArrayBuffer（用于 EXIF 读取）
ipcMain.handle('read-file-as-arraybuffer', async (event, filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    return Array.from(buffer);
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
});

// 使用 exifreader 读取 EXIF（在主进程中）
ipcMain.handle('read-exif', async (event, filePath) => {
  try {
    const ExifReader = require('exifreader');
    const buffer = fs.readFileSync(filePath);
    const tags = ExifReader.load(buffer);
    return tags;
  } catch (error) {
    console.error('Error reading EXIF:', error);
    return null;
  }
});
