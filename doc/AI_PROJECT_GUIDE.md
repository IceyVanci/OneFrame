# OneFrame AI 项目认知指南

本文档旨在帮助 AI 工具快速理解 OneFrame 项目的架构、功能和代码组织方式。

---

## 项目概述

**OneFrame** 是一款简洁优雅的图片边框添加工具，基于 Electron 构建。它能够为照片自动添加精美的底部边框，并智能显示相机的 EXIF 信息。

### 核心特性
- 智能 EXIF 读取：自动识别相机厂商并显示对应 Logo
- 多种边框样式：支持 Type A/B/C/D/E 五种样式
- EXIF 保留：导出时自动保留原图 EXIF 信息
- 跨平台支持：基于 Electron，可在 Windows/Mac/Linux 运行

### 技术栈
| 模块 | 技术方案 | 说明 |
|------|----------|------|
| 桌面框架 | Electron 28+ | 跨平台桌面应用 |
| 前端 | 原生 HTML/CSS/JS | 无需构建工具 |
| 图片预览 | CSS 渲染 | 实时预览边框效果 |
| EXIF 读取 | exifreader | 浏览器端读取 EXIF |
| EXIF 写入 | piexifjs | 导出时保留 EXIF |
| 字体渲染 | opentype.js | Canvas 精确字体 |
| 打包工具 | electron-builder | 生成单 exe |

---

## 文件结构

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
│       │   └── type-e.css      # Type E：3:2纵向，顶部1:1正方形
│       ├── js/
│       │   ├── app.js          # 主逻辑入口（混合处理所有类型）
│       │   ├── exif.js         # EXIF 读取（exifreader）
│       │   ├── exif-exporter.js # EXIF 导出（piexifjs）
│       │   ├── exporter.js     # 图片导出（通用逻辑）
│       │   ├── logo-utils.js   # Logo 工具函数
│       │   ├── components/
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
│       │       ├── type-a-export.js    # Type A 导出
│       │       ├── type-b-export.js    # Type B 导出
│       │       ├── type-c-export.js    # Type C 导出
│       │       ├── type-d-export.js    # Type D 导出
│       │       └── type-e-export.js    # Type E 导出
│       ├── logos/               # 相机厂商 Logo（SVG）
│       │   ├── Apple.svg        # 原始 Logo
│       │   ├── Apple.auto.svg   # 自动配色版 Logo
│       │   └── ...（24家厂商）
│       └── fonts/               # 字体文件
│           ├── MiSans-Medium.ttf
│           ├── MiSans-Normal.ttf
│           └── MiSans-Semibold.ttf
├── package.json
├── README.md
├── DESIGN.md
└── AI_PROJECT_GUIDE.md    # 本文档
```

---

## 样式系统详解

### Type A - 白色下边框
- **特点**：可调节边框高度（5%-30%），完整编辑面板
- **布局**：图片 + 底部白色边框
- **适用**：通用照片

### Type B - 黑色下边框
- **特点**：固定边框比例，简化编辑面板
- **布局**：图片 + 底部黑色边框
- **适用**：纵向图片（自动检测）

### Type C - 横向布局
- **特点**：Logo 在左侧，参数在右侧
- **布局**：横向边框，Logo + 参数分区显示

### Type D - 横向居中
- **特点**：Logo 居中，左侧时间+署名，右侧机型+参数
- **布局**：横向边框，复杂布局

### Type E - 3:2 纵向
- **特点**：顶部 1:1 正方形图片，底部白色区域显示参数
- **布局**：
  ```
  ┌────────────────────┐
  │                    │
  │   1:1 正方形图片    │  ← 可拖动裁剪区域
  │   (可拖动选择)      │
  │                    │
  ├────────────────────┤
  │ March      f/2.8   │  ← 底部白色区域
  │ 2024    50mm 1/125│
  │          ISO 400   │
  │ [Logo]    Model    │
  └────────────────────┘
  ```
- **字号**：
  - 月份：48px（英文首字母大写）
  - 年份：24px
  - 参数行：21px
  - 机型/署名：18px
- **特殊功能**：图片可拖动选择裁剪区域

---

## 模块职责

### 1. styles/index.js - 样式注册表
统一管理所有样式的预览和导出模块。

```javascript
export const styles = {
  'type-a': { preview, export },
  'type-b': { preview, export },
  // ...
};

export function getPreview(styleId) { ... }
export function getExport(styleId) { ... }
```

### 2. Type A-E Preview 模块
每个样式的预览模块，职责：
- 初始化 DOM 元素引用
- 计算尺寸（边框高度等）
- 更新预览样式
- 更新边框内容（Logo、参数等）
- 提供重置方法

### 3. Type A-E Export 模块
每个样式的导出模块，职责：
- 加载字体（opentype.js）
- 创建 Canvas
- 绘制图片和边框
- 绘制文字内容
- 返回 DataURL

### 4. app.js - 主逻辑
混合处理所有样式类型：
- 图片导入（浏览器/ Electron）
- 样式切换
- 预览更新
- 导出处理
- 表单管理

### 5. exif.js - EXIF 读取
使用 exifreader 读取图片 EXIF：
- `getExif(file)` - 获取全部 EXIF
- `getMakeName(make)` - 标准化厂商名
- `getFocalLength(exif)` - 获取焦距

### 6. exif-exporter.js - EXIF 导出
使用 piexifjs 处理 EXIF：
- `readExifFromFile(file)` - 读取 EXIF
- `embedExif(dataUrl, exif)` - 嵌入 EXIF

### 7. exporter.js - 导出逻辑
通用导出逻辑，调用对应样式的导出模块。

### 8. logo-utils.js - Logo 工具
- `logoList` - 24家厂商列表
- `getAllLogos()` - 获取所有 Logo
- `getMakeName(make)` - 厂商名标准化
- `getModelName(model)` - 格式化型号

---

## 数据流

### 图片导入流程
```
用户选择图片
    ↓
loadImageWithExif / loadImageInElectron
    ↓
getExif(file) → 解析 EXIF
    ↓
updateExifDisplay → 自动填充表单 + 选择 Logo
```

### 样式切换流程
```
点击样式卡片
    ↓
currentStyle = card.dataset.style
    ↓
showEditor() → 配置面板 + 初始化预览
    ↓
updateBorder() → 调用 preview.update()
```

### 导出流程
```
用户点击导出
    ↓
exportImageHandler → 收集设置
    ↓
exportImage → 获取导出模块
    ↓
renderImage → Canvas 绘制
    ↓
嵌入 EXIF → 返回 Blob
    ↓
saveBlob → 保存文件
```

---

## EXIF 双轨机制

### 显示用 EXIF
- 模块：`exif.js`
- 库：`exifreader`
- 用途：读取图片信息，填充表单

### 导出用 EXIF
- 模块：`exif-exporter.js`
- 库：`piexifjs`
- 用途：将 EXIF 嵌入导出的图片

---

## 开发命令

```bash
# 安装依赖
pnpm install  # 或 npm install

# 运行开发版本
pnpm run dev  # 或 npm run dev

# 构建打包
pnpm run build  # 或 npm run build

# 输出位置：dist/OneFrame.exe
```

---

## 添加新样式的步骤

1. **创建 CSS**：`src/renderer/css/type-x.css`
2. **创建预览模块**：`src/renderer/js/styles/type-x-preview.js`
3. **创建导出模块**：`src/renderer/js/styles/type-x-export.js`
4. **创建面板配置**：`src/renderer/js/components/type-x-editor-panel.js`
5. **注册样式**：`src/renderer/js/styles/index.js`
6. **添加卡片**：`src/renderer/index.html`

---

## 重要常量

### Logo 列表（24家）
Apple, Canon, DJI, Fujifilm, Google, GoPro, Hasselblad, Huawei, Insta360, Leica, Lumix, Nikon, Nokia, Olympus, Oneplus, OPPO, Pentax, Ricoh, Samsung, Sigma, Sony, Vivo, Xiaomi, xuzhou

### 默认边框高度
- Type A: 12%（可调 5%-30%）
- Type B: 固定比例

### 支持的 EXIF 字段
- Make: 相机厂商
- Model: 相机型号
- DateTimeOriginal: 拍摄时间
- FNumber: 光圈值
- ExposureTime: 快门速度
- ISOSpeedRatings: ISO 感光度
- FocalLength: 焦距

---

## 常见问题

### Q: 为什么 Type E 的导出位置与预览不一致？
A: 检查导出代码中的 padding 计算。CSS 的 `padding: 5%` 相对于宽度，而非高度。

### Q: Logo 不显示？
A: 检查 `logos/` 目录中是否有对应的 SVG 文件，以及 `logo-utils.js` 中的 `logoList` 是否包含该厂商。

### Q: EXIF 没有保留？
A: 确保使用 Electron 环境运行，浏览器环境因 CORS 限制可能无法读取某些 EXIF。
