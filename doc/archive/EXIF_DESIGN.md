# OneFrame EXIF 设计文档

## 概述

OneFrame 项目中存在两路独立的 EXIF 信息处理流程，它们相互独立，各司其职。

---

## 第一路：EXIF 读取与预览填充

### 目的
读取原图中的 EXIF 信息，用于填充编辑面板的数据和预览图中显示的内容。

### 数据流
```
用户选择图片
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ app.js: loadImageWithExif() / loadImageInElectron() │
│                                                     │
│ 浏览器环境: getExif(file)                           │
│ Electron环境: window.electronAPI.readExif(imagePath) │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ app.js: updateExifDisplay()                         │
│                                                     │
│ - 自动选择匹配的相机 Logo                            │
│ - 填充设备型号 (customModel)                        │
│ - 填充拍摄参数 (fNumber, exposureTime, iso)         │
│ - 填充焦距 (focalLength)                            │
│ - 填充时间 (dateTime)                               │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ app.js: updateBorderContent()                      │
│                                                     │
│ 将 EXIF 数据渲染为边框上的文字显示                   │
└─────────────────────────────────────────────────────┘
```

### 涉及文件
| 文件 | 函数 | 作用 |
|------|------|------|
| `app.js` | `loadImageWithExif()` | 浏览器环境读取 EXIF |
| `app.js` | `loadImageInElectron()` | Electron 环境读取 EXIF |
| `app.js` | `updateExifDisplay()` | 填充编辑面板 |
| `app.js` | `updateBorderContent()` | 更新边框预览文字 |
| `exif.js` | `getExif()` | 解析 EXIF 字段 |
| `logo-utils.js` | `getMakeName()` | 标准化厂商名称 |
| `main.js` | `read-exif` (IPC) | 主进程读取 EXIF |

### 核心变量
- `currentExif` - 全局变量，存储当前图片的 EXIF 对象
- 用户可编辑的表单元素：`customModel`, `fNumber`, `exposureTime`, `focalLength`, `iso`, `dateTime`

---

## 第二路：EXIF 读取与导出写入

### 目的
将原图中的 EXIF 信息原封不动地写入到导出的新图片中。

### 数据流
```
用户点击导出
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ app.js: exportImageHandler()                        │
│                                                     │
│ 调用 exporter.exportImage()                         │
│ 传入: currentFile 或 currentImagePath               │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ exporter.js: exportImage()                         │
│                                                     │
│ 1. 创建 Canvas，绘制带边框的新图片                   │
│ 2. canvas.toDataURL('image/jpeg') 生成新图片数据   │
│ 3. 从原图读取 EXIF                                 │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ exif-exporter.js                                   │
│                                                     │
│ readExifFromFile() / readExifFromPath()            │
│     │                                              │
│     ├── 使用 piexif.load() 解析 EXIF               │
│     └── 返回 piexif 格式的 EXIF 对象               │
│                                                     │
│ dumpExif(exifObj)                                  │
│     │                                              │
│     └── 使用 piexif.dump() 转换为字节数组          │
│                                                     │
│ embedExif(exifBytes, dataUrl)                      │
│     │                                              │
│     ├── 提取 dataUrl 中的 base64 数据              │
│     ├── 解码为二进制字符串                          │
│     ├── 使用 piexif.insert() 嵌入 EXIF             │
│     └── 返回带 EXIF 的新 DataURL                  │
└─────────────────────────────────────────────────────┘
```

### 涉及文件
| 文件 | 函数 | 作用 |
|------|------|------|
| `app.js` | `exportImageHandler()` | 触发导出 |
| `exporter.js` | `exportImage()` | 导出主函数，包含 EXIF 嵌入流程 |
| `exif-exporter.js` | `readExifFromFile()` | 从 File 读取 EXIF（浏览器） |
| `exif-exporter.js` | `readExifFromPath()` | 从路径读取 EXIF（Electron） |
| `exif-exporter.js` | `dumpExif()` | 转换 EXIF 为 piexif 格式 |
| `exif-exporter.js` | `embedExif()` | 嵌入 EXIF 到图片 |
| `exif-exporter.js` | `hasExifData()` | 检查 EXIF 是否有效 |
| `main.js` | `read-exif-binary` (IPC) | 主进程读取文件为 Base64 |
| `assets/piexif.js` | - | piexifjs 库，全局 `window.piexif` |

### 关键代码

**embedExif 函数实现：**
```javascript
export function embedExif(exifBytes, dataUrl) {
  try {
    // 1. 从 DataURL 提取 base64
    const base64 = dataUrl.split(',')[1];
    // 2. 解码为二进制字符串
    const binary = atob(base64);
    // 3. 嵌入 EXIF
    const newBinary = piexif.insert(exifBytes, binary);
    // 4. 重新编码并返回完整 DataURL
    return 'data:image/jpeg;base64,' + btoa(newBinary);
  } catch (err) {
    console.error('嵌入 EXIF 失败:', err);
    return dataUrl;
  }
}
```

---

## 两路 EXIF 的独立性

### 完全独立，互不干扰

| 特性 | 第一路（预览填充） | 第二路（导出写入） |
|------|-------------------|-------------------|
| **数据来源** | 原图 EXIF | 原图 EXIF |
| **处理库** | exifreader | piexifjs |
| **目标位置** | 编辑面板表单 + 边框预览文字 | 导出图片文件 |
| **是否修改** | 不修改，读取展示 | 读取后原样写入 |
| **用户编辑影响** | 表单可编辑，影响预览文字 | 不影响（从原图读取） |
| **失败处理** | 使用默认值 | 跳过 EXIF 写入 |

### 独立性保证

1. **存储分离**
   - 第一路：`currentExif` 变量 + DOM 表单元素
   - 第二路：直接在 `exportImage()` 中读取并处理

2. **读取分离**
   - 第一路：使用 `exifreader` 库（`exif.js`）
   - 第二路：使用 `piexifjs` 库（`exif-exporter.js`）

3. **时机分离**
   - 第一路：图片加载时立即执行
   - 第二路：用户点击导出按钮时才执行

---

## 注意事项

### 1. piexif.insert 数据格式
`piexif.insert()` 需要**原始二进制字符串**，不是 base64 也不是完整 DataURL。

### 2. Canvas 导出格式
`canvas.toDataURL('image/jpeg')` 返回完整 DataURL（`data:image/jpeg;base64,...`），需要提取 base64 部分并解码。

### 3. Electron 环境
在 Electron 环境中，需要通过 IPC 调用主进程来读取文件二进制数据。

---

## 相关文件列表

```
src/
├── renderer/
│   ├── js/
│   │   ├── app.js              # 主程序，包含两路 EXIF 的调用
│   │   ├── exif.js            # 第一路：exifreader 封装
│   │   ├── exif-exporter.js   # 第二路：piexifjs 封装
│   │   └── exporter.js        # 导出功能，整合 EXIF 写入
│   ├── index.html              # 加载 piexif.js
│   └── assets/
│       └── piexif.js          # piexifjs 库
├── main/
│   └── main.js                # IPC 处理：read-exif, read-exif-binary
└── preload/
    └── preload.js             # 暴露 electronAPI
```
