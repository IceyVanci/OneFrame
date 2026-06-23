# OneFrame 📸

一款简洁优雅的图片边框添加工具，为您的照片自动添加精美的底部边框，并智能显示相机 EXIF 信息。

![OneFrame](https://img.shields.io/badge/version-1.0.6-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Electron](https://img.shields.io/badge/Electron-28.0.0-47848F.svg)

---

## 🕰️ 开发历程

本项目最初使用 Minimax M2.7 进行开发，后入选 **Xiaomi MiMo Orbit-百万亿 Token 创造者激励计划**，改用 Xiaomi Mimo-v2.5/v2.5pro 进行开发，感谢 **Xiaomi MiMo Orbit** 提供的免费 Token。

---

## ✨ 功能特性

### 📷 智能 EXIF 读取
- 自动识别相机厂商并显示对应 Logo
- 提取并展示拍摄参数（光圈、快门、ISO、焦距）
- 自动读取拍摄时间和设备型号

### 🖼️ 边框样式
支持多种边框样式：
- **Type A**：白色下边框 - 可调节边框高度（5%-30%），完整编辑面板
- **Type B**：黑色下边框 - 固定边框比例，简化编辑面板
- **Type C**：横向布局 - Logo 在左侧，参数在右侧
- **Type D**：横向布局 - Logo 居中，左侧时间+署名，右侧机型+参数
- **Type E**：3:2 纵向 - 顶部 1:1 正方形图片，底部白色区域显示参数，支持拖动裁剪
- **Type F**：画中画风格 - 上方白色留白，中部照片展示区（92%宽度，80%高度），下方居中文字信息
- **Type G**：居中布局 - 第一行厂商 Logo，第二行日期|参数|机型，第三行签名，白色固定背景
- **Type H**：全画幅叠加文字 - 照片 100% 填满画布，Logo 和文字叠加在照片底部，支持文字颜色选择（黑/灰/白）

### ✏️ 边框信息编辑
- Logo 显示开关
- 拍摄参数显示开关
- 拍摄时间显示开关
- 支持自定义署名

### 💾 EXIF 保留
- 导出时自动保留原图 EXIF 信息
- 支持 JPG 高质量输出

### 📱 广泛的相机支持
支持以下相机厂商的 Logo 和信息识别：
Apple、Canon、DJI、Fujifilm、Google、GoPro、Hasselblad、Leica、Lumix、Nikon、Nokia、Olympus、Oneplus、Pentax、Ricoh、Sigma、Sony、Vivo、Xiaomi 等

---

## 🏗️ 技术架构

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
启动应用后，点击首页的样式卡片（Type A ~ Type H）。

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

## 🛠️ 开发指南

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

- [function_analysis.md](./doc/function_analysis.md) - 项目函数分析
- [style_separation_analysis.md](./doc/style_separation_analysis.md) - 样式分离状况分析

---

## 🙏 致谢

- [Electron](https://www.electronjs.org/) - 桌面应用框架
- [exifreader](https://github.com/mattiasw/ExifReader) - EXIF 信息读取
- [piexifjs](https://github.com/hMatoba/piexifjs) - EXIF 信息写入
- [opentype.js](https://github.com/opentypejs/opentype.js) - 字体渲染
- [Copicseal](https://github.com/copicseal) - 可图匠，部分代码逻辑来自 Copicseal
- [Font Awesome](https://fontawesome.com/) - 图标库
- [MiSans](https://hyperos.mi.com/font) - 小米 MiSans 字体
- [Xiaomi MiMo](https://mimo.xiaomi.com/) - Xiaomi MiMo Orbit-百万亿 Token 创造者激励计划提供了免费的TokenPlan
