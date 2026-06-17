# OneFrame 设计方案

## 项目概述

- **项目名称**: OneFrame
- **项目目标**: 为图片添加边框的桌面工具
- **技术框架**: Electron 28 + 原生 HTML/CSS/JS
- **交付形式**: 便携版单 exe 文件
- **当前版本**: v1.0.3

---

## 技术栈

| 模块 | 技术方案 | 说明 |
|------|----------|------|
| **桌面框架** | Electron 28.0 | 跨平台桌面应用框架 |
| **前端** | 原生 HTML/CSS/JS | 无需构建工具，轻量高效 |
| **图片预览** | CSS 渲染 | 实时预览边框效果 |
| **图片导出** | Canvas 绘制 | 使用 Canvas API 绘制并导出图片 |
| **EXIF 读取** | exifreader | 浏览器端读取图片 EXIF 信息 |
| **EXIF 写入** | piexifjs | 导出时保留原图 EXIF 数据 |
| **字体渲染** | opentype.js | Canvas 精确字体渲染（MiSans 字体） |
| **打包工具** | electron-builder | 生成便携版单 exe 文件 |

---

## 项目结构

```
OneFrame/
├── src/
│   ├── main/
│   │   ├── main.js              # Electron 主进程
│   │   └── preload.js           # 安全桥接（IPC）
│   └── renderer/
│       ├── index.html           # 主页面（首页 + 编辑器）
│       ├── index.css            # 全局样式
│       ├── css/
│       │   ├── type-a.css      # Type A：白色下边框
│       │   ├── type-b.css      # Type B：黑色下边框
│       │   ├── type-c.css      # Type C：横向布局
│       │   ├── type-d.css      # Type D：横向居中
│       │   ├── type-e.css      # Type E：3:2 纵向，顶部 1:1 正方形
│       │   └── type-f.css      # Type F：画中画风格
│       ├── js/
│       │   ├── app.js          # 主逻辑入口
│       │   ├── exif.js         # EXIF 读取（exifreader）
│       │   ├── exif-exporter.js # EXIF 导出（piexifjs）
│       │   ├── exporter.js     # 图片导出（通用逻辑）
│       │   ├── logo-utils.js   # Logo 工具函数
│       │   ├── events.js       # 事件总线
│       │   ├── state.js        # 状态管理
│       │   ├── components/
│       │   │   ├── index.js     # 组件统一导出
│       │   │   ├── home.js     # 首页视图
│       │   │   ├── editor.js   # 编辑器视图
│       │   │   └── type-*-editor-panel.js  # 各类型面板配置
│       │   └── styles/
│       │       ├── index.js     # 样式注册表
│       │       ├── type-a-preview.js   # Type A 预览
│       │       ├── type-b-preview.js   # Type B 预览
│       │       ├── type-c-preview.js   # Type C 预览
│       │       ├── type-d-preview.js   # Type D 预览
│       │       ├── type-e-preview.js   # Type E 预览
│       │       ├── type-f-preview.js   # Type F 预览
│       │       ├── type-a-export.js    # Type A 导出
│       │       ├── type-b-export.js    # Type B 导出
│       │       ├── type-c-export.js    # Type C 导出
│       │       ├── type-d-export.js    # Type D 导出
│       │       ├── type-e-export.js    # Type E 导出
│       │       └── type-f-export.js    # Type F 导出
│       ├── logos/               # 相机厂商 Logo（SVG）
│       ├── fonts/               # 字体文件（MiSans）
│       └── assets/
│           └── piexif.js       # piexifjs 库
├── package.json
├── README.md
├── DESIGN.md
└── AI_PROJECT_GUIDE.md
```

---

## 核心功能

### 1. 首页 - 边框样式图片墙

- 以网格形式展示所有边框样式预览（Type A-E）
- 每个样式卡片显示边框样式缩略图
- 点击样式卡片 → 弹出文件选择器 → 选择图片 → 进入编辑页面

### 2. 编辑页面 - 实时预览与参数调整

- **左侧/中央**：实时预览区，显示带边框的用户图片
- **右侧**：浮动操作按钮（换个模板、重选照片、编辑、保存）
- **右侧滑出面板**：编辑面板，包含：
  - 比例设置
  - 边框颜色和高度
  - Logo 选择（24 家相机厂商）
  - 设备型号
  - 拍摄参数（光圈、快门、ISO、焦距）
  - 拍摄时间
  - 署名文字

### 3. 导出功能

- Canvas 绘制带边框的图片
- 自动嵌入原图 EXIF 信息（使用 piexifjs）
- JPG 高质量输出
- 保留原文件名并添加 `-OneFrame` 后缀

---

## 边框样式定义

### Type A - 白色下边框
- **布局**: 图片 + 底部白色边框
- **特点**: 可调节边框高度（5%-30%），完整编辑面板
- **适用**: 通用照片
- **边框内容**: Logo + 机型 | 参数 | 署名 | 时间

### Type B - 黑色下边框
- **布局**: 图片 + 底部黑色边框
- **特点**: 固定边框比例，简化编辑面板
- **适用**: 纵向图片（自动检测）

### Type C - 横向布局
- **布局**: 横向边框，Logo 在左侧，参数在右侧
- **特点**: Logo + 参数分区显示

### Type D - 横向居中
- **布局**: 横向边框，Logo 居中
- **特点**: 左侧时间+署名，右侧机型+参数
- **注意**: 纵向图片文字缩小 0.85x

### Type E - 3:2 纵向
- **布局**: 顶部 1:1 正方形图片，底部白色区域显示参数
- **画布比例**: 3:2（宽:高）
- **特殊功能**: 图片可拖动选择裁剪区域
- **字号**: 月份 48px，年份 24px，参数行 18px

### Type F - 画中画风格
- **布局**: 上方 5% 白色留白 + 中部 92%×80% 照片展示区 + 下方 15% 文字信息区
- **画布比例**: 图片比例（宽度 = 图片宽度，高度 = 图片高度 / 0.8）
- **特殊功能**: 文字区域使用绝对定位，署名不影响前两行位置；窗口缩放时使用 transform scale 保持宽高比
- **字号**: 动态缩放（基准 900px 宽度对应 14px）
- **文字布局**: 第一行 "Shot on"（灰色）+ 品牌型号（黑色），第二行参数（灰色），第三行署名（灰色，可选）
- **编辑面板**: 隐藏边框颜色/高度/比例/Logo，设备型号自动包含品牌名

---

## 数据流

### 图片导入流程
```
用户点击样式卡片 → 选择图片
    ↓
loadImageInElectron() / loadImageWithExif()
    ↓
getExif(file) → 解析 EXIF
    ↓
updateExifDisplay() → 自动填充表单 + 选择 Logo
    ↓
updateBorder() → 更新预览
```

### 导出流程
```
用户点击导出
    ↓
exportImageHandler() → 收集设置
    ↓
exportImage() → 获取对应样式导出模块
    ↓
renderImage() → Canvas 绘制
    ↓
embedExif() → 嵌入 EXIF → 返回 Blob
    ↓
saveBlob() → 保存文件
```

### EXIF 双轨机制

| 特性 | 第一路（预览填充） | 第二路（导出写入） |
|------|-------------------|-------------------|
| **数据来源** | 原图 EXIF | 原图 EXIF |
| **处理库** | exifreader | piexifjs |
| **目标位置** | 编辑面板表单 + 边框预览文字 | 导出图片文件 |
| **是否修改** | 不修改，读取展示 | 读取后原样写入 |
| **时机** | 图片加载时立即执行 | 用户点击导出按钮时 |

---

## 打包配置

```json
{
  "build": {
    "appId": "com.oneframe.app",
    "productName": "OneFrame",
    "win": {
      "target": [{ "target": "portable", "arch": ["x64"] }],
      "signAndEditExecutable": false
    },
    "portable": {
      "artifactName": "OneFrame.exe"
    }
  }
}
```

---

## 打包体积预估

- Electron 基础：~80MB
- exifreader + piexifjs + opentype.js：~1MB
- MiSans 字体文件：~2MB
- 相机 Logo SVG：~1MB
- **总计：~85-90MB 单 exe**

---

## 相关资源

- [Electron 官方文档](https://www.electronjs.org/)
- [electron-builder 文档](https://www.electron.build/)
- [exifreader GitHub](https://github.com/mattiasw/ExifReader)
- [piexifjs GitHub](https://github.com/hMatoba/piexifjs)
- [opentype.js GitHub](https://github.com/opentypejs/opentype.js)