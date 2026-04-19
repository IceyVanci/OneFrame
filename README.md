# OneFrame 🎨

一款简洁优雅的图片边框添加工具，为您的照片自动添加精美的底部边框，并智能显示相机 EXIF 信息。

![OneFrame](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Electron](https://img.shields.io/badge/Electron-28.0.0-47848F.svg)

---

## ✨ 功能特性

### 📷 智能 EXIF 读取
- 自动识别相机厂商并显示对应 Logo
- 提取并展示拍摄参数（光圈、快门、ISO、焦距）
- 自动读取拍摄时间和设备型号

### 🎨 边框样式
支持多种边框样式：
- **Type A**：白色下边框 - 可调节边框高度（5%-30%），完整编辑面板
- **Type B**：黑色下边框 - 固定边框比例，简化编辑面板
- **Type C**：横向布局 - Logo 在左侧，参数在右侧
- **Type D**：横向布局 - Logo 居中，左侧时间+署名，右侧机型+参数

### 📝 边框信息编辑
- Logo 显示开关
- 拍摄参数显示开关
- 拍摄时间显示开关
- 支持自定义署名

### 🔒 EXIF 保留
- 导出时自动保留原图 EXIF 信息
- 支持 JPG 高质量输出

### 📁 广泛的相机支持
支持以下相机厂商的 Logo 和信息识别：
Apple、Canon、DJI、Fujifilm、Google、GoPro、Hasselblad、Leica、Lumix、Nikon、Nokia、Olympus、Oneplus、Pentax、Ricoh、Sigma、Sony、Vivo、Xiaomi 等

---

## 🛠 技术架构

| 模块 | 技术方案 | 说明 |
|------|----------|------|
| **桌面框架** | Electron 28.0 | 跨平台桌面应用框架 |
| **前端** | 原生 HTML/CSS/JS | 无需构建工具，轻量高效 |
| **图片预览** | CSS 渲染 | 实时预览边框效果 |
| **EXIF 读取** | exifreader | 读取图片 EXIF 信息 |
| **EXIF 写入** | piexifjs | 保留原图 EXIF 数据 |
| **字体渲染** | opentype.js | 精确字体渲染 |
| **打包工具** | electron-builder | 生成便携版单 exe 文件 |

---

## 📂 项目结构

```
OneFrame/
├── src/
│   ├── main/
│   │   ├── main.js          # Electron 主进程
│   │   └── preload.js       # 安全桥接
│   └── renderer/
│       ├── index.html       # 主页面
│       ├── index.css        # 全局样式
│       ├── css/
│       │   ├── type-a.css   # Type A 样式（白色下边框）
│       │   ├── type-b.css   # Type B 样式（黑色下边框）
│       │   ├── type-c.css   # Type C 样式
│       │   └── type-d.css   # Type D 样式
│       ├── js/
│       │   ├── app.js        # 主逻辑入口
│       │   ├── events.js     # 事件处理
│       │   ├── state.js      # 状态管理
│       │   ├── exif.js       # EXIF 读取 (exifreader)
│       │   ├── exif-exporter.js  # EXIF 导出 (piexifjs)
│       │   ├── exporter.js    # 图片导出
│       │   ├── logo-utils.js  # Logo 工具
│       │   ├── components/    # UI 组件
│       │   │   ├── index.js    # 组件导出
│       │   │   ├── home.js    # 首页视图
│       │   │   ├── editor.js  # 编辑器视图
│       │   │   ├── type-a-editor-panel.js  # Type A 面板配置
│       │   │   ├── type-b-editor-panel.js  # Type B 面板配置
│       │   │   ├── type-c-editor-panel.js  # Type C 面板配置
│       │   │   └── type-d-editor-panel.js  # Type D 面板配置
│       │   └── styles/        # 样式模块
│       │       ├── index.js   # 样式注册表
│       │       ├── type-a-preview.js   # Type A 预览
│       │       ├── type-b-preview.js   # Type B 预览
│       │       ├── type-c-preview.js   # Type C 预览
│       │       ├── type-d-preview.js   # Type D 预览
│       │       ├── type-a-export.js    # Type A 导出
│       │       ├── type-b-export.js    # Type B 导出
│       │       ├── type-c-export.js    # Type C 导出
│       │       └── type-d-export.js    # Type D 导出
│       ├── logos/            # 相机厂商 Logo (SVG)
│       ├── fonts/            # 字体文件 (MiSans)
│       └── assets/
│           └── piexif.js    # EXIF 处理库
├── package.json
├── README.md
├── DESIGN.md
└── .gitignore
```

---

## 🚀 安装和运行

### 环境要求
- Node.js 16+
- pnpm 或 npm

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 运行开发版本

```bash
# 使用 pnpm
pnpm run dev

# 或使用 npm
npm run dev
```

### 构建打包

```bash
# 使用 pnpm
pnpm run build

# 或使用 npm
npm run build
```

构建完成后，可执行文件位于 `dist/OneFrame.exe`

---

## 📖 使用说明

### 1. 选择边框样式
启动应用后，点击首页的样式卡片（Type A / Type B / Type C / Type D）。

### 2. 选择图片
选择样式后，系统会弹出文件选择器，选择要处理的图片。

### 3. 调整设置
在右侧编辑面板中，您可以：
- 调整边框颜色和高度
- 选择是否显示相机 Logo
- 编辑或自动填充拍摄参数
- 添加自定义署名
- 设置拍摄时间

### 4. 导出图片
点击"保存"或"导出"按钮，选择保存路径即可。

---

## ⚙️ 配置说明

### 边框高度
边框高度默认设置为图片短边的 12%，可在 5%-30% 范围内调整。

### Logo 智能适配
- 浅色边框背景：使用原始 Logo
- 深色边框背景：深色 Logo 自动转换为白色

### 支持的 EXIF 字段
- Make: 相机厂商
- Model: 相机型号
- DateTimeOriginal: 拍摄时间
- FNumber: 光圈值
- ExposureTime: 快门速度
- ISOSpeedRatings: ISO 感光度
- FocalLength/FocalLengthIn35mmFilm: 焦距

---

## 🔧 开发指南

### 添加新的相机厂商 Logo

1. 准备 Logo 文件（SVG 格式）
2. 将文件放入 `src/renderer/logos/` 目录
3. 文件命名规范：`{厂商名}.svg`（如 `Sony.svg`）
4. 在 `src/renderer/js/logo-utils.js` 的 `logoList` 数组中添加厂商名称

### 添加新的边框样式

1. 在 `src/renderer/index.html` 中添加新的样式卡片
2. 在 `src/renderer/css/` 中添加对应的 CSS 样式文件
3. 在 `src/renderer/js/styles/` 中添加预览和导出模块
4. 在 `src/renderer/js/components/` 中添加面板配置模块
5. 在 `src/renderer/js/styles/index.js` 中注册新样式

---

## 📄 许可证

本项目基于 MIT 许可证开源。

---

## 📚 相关文档

- [function_analysis.md](./function_analysis.md) - 项目函数分析
- [style_separation_analysis.md](./style_separation_analysis.md) - 样式分离状况分析

---

## 🙏 致谢

- [Electron](https://www.electronjs.org/) - 桌面应用框架
- [exifreader](https://github.com/mattiasw/ExifReader) - EXIF 信息读取
- [piexifjs](https://github.com/hMatoba/piexifjs) - EXIF 信息写入
- [opentype.js](https://github.com/opentypejs/opentype.js) - 字体渲染
- [Font Awesome](https://fontawesome.com/) - 图标库
- [MiSans](https://hyperos.mi.com/font) - 小米 MiSans 字体
