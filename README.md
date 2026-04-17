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

### 🎨 边框定制
- 支持白色和黑色边框颜色
- 可调节边框高度（5%-30%）
- 边框颜色自适应文字配色

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
Apple、Canon、DJI、Fujifilm、Google、GoPro、Hasselblad、Huawei、Insta360、Leica、Lumix、Nikon、Nokia、Olympus、OnePlus、OPPO、Pentax、Ricoh、Samsung、Sigma、Sony、Vivo、Xiaomi 等

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
│       ├── index.css        # 样式文件
│       ├── js/
│       │   ├── app.js        # 主逻辑
│       │   ├── exif.js      # EXIF 读取
│       │   ├── exif-exporter.js  # EXIF 导出
│       │   ├── exporter.js      # 图片导出
│       │   └── logo-utils.js     # Logo 工具
│       ├── logos/           # 相机厂商 Logo
│       ├── fonts/           # 字体文件 (MiSans)
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
启动应用后，点击首页的样式卡片（如"白色下边框"或"黑色下边框"）。

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
5. 如需自动检测，在 `SUPPORTED_MAKES` 数组中添加厂商名称

### 添加新的边框样式

1. 在 `src/renderer/index.html` 中添加新的样式卡片
2. 在 `src/renderer/index.css` 中添加对应的 CSS 样式
3. 在 `src/renderer/js/app.js` 中添加样式处理逻辑

---

## 📄 许可证

本项目基于 MIT 许可证开源。

---

## 🙏 致谢

- [Electron](https://www.electronjs.org/) - 桌面应用框架
- [exifreader](https://github.com/mattiasw/ExifReader) - EXIF 信息读取
- [piexifjs](https://github.com/hMatoba/piexifjs) - EXIF 信息写入
- [opentype.js](https://github.com/opentypejs/opentype.js) - 字体渲染
- [Font Awesome](https://fontawesome.com/) - 图标库
- [MiSans](https://xiaomi.fonts.net.cn/) - 小米 MiSans 字体
