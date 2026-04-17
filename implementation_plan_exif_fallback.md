# Implementation Plan

[Overview]
为没有 EXIF 信息的图片添加文件创建时间作为备选时间，并在每次导入图片时刷新 EXIF 信息预览。

[Types]
无类型系统变更。

[Files]
- `src/main/main.js` - 添加 `get-file-ctime` IPC 处理程序
- `src/main/preload.js` - 暴露 `getFileCtime` API
- `src/renderer/js/app.js` - 修改 EXIF 处理逻辑

[Functions]
1. **新增** `src/main/main.js`:
   - `ipcMain.handle('get-file-ctime', ...)` - 返回文件创建时间

2. **新增** `src/main/preload.js`:
   - `getFileCtime(imagePath)` - 暴露给渲染进程的 API

3. **修改** `src/renderer/js/app.js`:
   - `loadImageInElectron()` - 调用 `getFileCtime` 并在无 EXIF 时使用
   - `loadImageWithExif()` - 调用 `updateExifDisplay`（在重选图片时）

[Implementation Order]
1. 在 `main.js` 添加获取文件创建时间的 IPC 处理程序
2. 在 `preload.js` 暴露 `getFileCtime` API
3. 修改 `app.js` 中的 `loadImageInElectron` 函数，在无 EXIF 时使用文件创建时间
4. 修改 `loadImageWithExif` 函数，确保重选图片时调用 `updateExifDisplay`
