# OneFrame 函数动作分析总结

---

## 📊 快速总览

| 状态 | 数量 | 说明 |
|------|------|------|
| ✅ 正常/使用中 | 60+ | 按设计预期运行，无需改动 |
| ⚠️ 未使用/预留 | 12 | 功能冗余或预留，未被调用 |

---

## 📁 目标文件结构

```
src/
├── main/
│   ├── main.js              # Electron 主进程
│   └── preload.js           # 安全桥接
└── renderer/
    ├── index.html           # 主页面
    ├── index.css            # 全局样式
    ├── css/
    │   ├── type-a.css      # Type A 样式（白色下边框）
    │   ├── type-b.css      # Type B 样式（黑色下边框）
    │   ├── type-c.css      # Type C 样式
    │   ├── type-d.css      # Type D 样式
    │   ├── type-e.css      # Type E 样式（3:2竖向，顶部1:1正方形）
    │   ├── type-f.css      # Type F 样式（画中画风格）
    │   └── type-g.css      # Type G 样式（顶部Logo+日期参数+签名）
    ├── js/
    │   ├── app.js          # 主统一入口
    │   ├── events.js       # 事件处理
    │   ├── state.js        # 状态管理
    │   ├── exif.js         # EXIF 读取 (exifreader)
    │   ├── exif-exporter.js # EXIF 导出 (piexifjs)
    │   ├── exporter.js      # 照片导出
    │   ├── logo-utils.js    # Logo 工具函数
    │   ├── components/
    │   │   ├── index.js     # 组件导出
    │   │   ├── home.js      # 首页视图
    │   │   ├── editor.js    # 编辑器视图
    │   │   ├── type-a-editor-panel.js  # Type A 编辑面板配置
    │   │   ├── type-b-editor-panel.js  # Type B 编辑面板配置
    │   │   ├── type-c-editor-panel.js  # Type C 编辑面板配置
    │   │   ├── type-d-editor-panel.js  # Type D 编辑面板配置
    │   │   ├── type-e-editor-panel.js  # Type E 编辑面板配置
    │   │   ├── type-f-editor-panel.js  # Type F 编辑面板配置
    │   │   └── type-g-editor-panel.js  # Type G 编辑面板配置
    │   └── styles/
    │       ├── index.js     # 样式注册表
    │       ├── type-a-preview.js   # Type A 预览
    │       ├── type-b-preview.js   # Type B 预览
    │       ├── type-c-preview.js   # Type C 预览
    │       ├── type-d-preview.js   # Type D 预览
    │       ├── type-e-preview.js   # Type E 预览
    │       ├── type-f-preview.js   # Type F 预览
    │       ├── type-g-preview.js   # Type G 预览
    │       ├── type-a-export.js    # Type A 导出
    │       ├── type-b-export.js    # Type B 导出
    │       ├── type-c-export.js    # Type C 导出
    │       ├── type-d-export.js    # Type D 导出
    │       ├── type-e-export.js    # Type E 导出
    │       ├── type-f-export.js    # Type F 导出
    │       └── type-g-export.js    # Type G 导出
    ├── logos/               # 相机厂商 Logo (SVG)
    └── fonts/               # 字体文件 (MiSans)
```

---

## 📋 模块负责表

### 样式相关模块

| 模块 | 文件 | 职责 | 样式 |
|------|------|------|------|
| **预览** | `type-a-preview.js` | Type A 照片预览渲染（白色下边框） | Type A |
| **预览** | `type-b-preview.js` | Type B 照片预览渲染（黑色下边框） | Type B |
| **预览** | `type-c-preview.js` | Type C 照片预览渲染 | Type C |
| **预览** | `type-d-preview.js` | Type D 照片预览渲染 | Type D |
| **预览** | `type-e-preview.js` | Type E 照片预览渲染（3:2竖向，顶部1:1照片，底部参数） | Type E |
| **预览** | `type-f-preview.js` | Type F 照片预览渲染（画中画风格，上方留白+照片+下方文字） | Type F |
| **预览** | `type-g-preview.js` | Type G 照片预览渲染（Logo+日期参数+签名，居中布局） | Type G |
| **导出** | `type-a-export.js` | Type A Canvas 绘制导出 | Type A |
| **导出** | `type-b-export.js` | Type B Canvas 绘制导出 | Type B |
| **导出** | `type-c-export.js` | Type C Canvas 绘制导出 | Type C |
| **导出** | `type-d-export.js` | Type D Canvas 绘制导出 | Type D |
| **导出** | `type-e-export.js` | Type E Canvas 绘制导出 | Type E |
| **导出** | `type-f-export.js` | Type F Canvas 绘制导出 | Type F |
| **导出** | `type-g-export.js` | Type G Canvas 绘制导出 | Type G |
| **面板配置** | `type-a-editor-panel.js` | Type A 编辑面板配置 | Type A |
| **面板配置** | `type-b-editor-panel.js` | Type B 编辑面板配置 | Type B |
| **面板配置** | `type-c-editor-panel.js` | Type C 编辑面板配置 | Type C |
| **面板配置** | `type-d-editor-panel.js` | Type D 编辑面板配置 | Type D |
| **面板配置** | `type-e-editor-panel.js` | Type E 编辑面板配置 | Type E |
| **面板配置** | `type-f-editor-panel.js` | Type F 编辑面板配置 | Type F |
| **面板配置** | `type-g-editor-panel.js` | Type G 编辑面板配置 | Type G |
| **样式注册表** | `index.js` | 统一管理样式模块 | 通用 |

### 公共模块

| 模块 | 文件 | 职责 | 说明 |
|------|------|------|------|
| **主入口** | `app.js` | 主统一入口 | 综合处理 Type A/B/C/D/E/F/G |
| **EXIF 读取** | `exif.js` | 读取照片 EXIF 信息 | 使用 exifreader |
| **EXIF 导出** | `exif-exporter.js` | 嵌入 EXIF 到导出图 | 使用 piexifjs |
| **照片导出** | `exporter.js` | Canvas 绘制导出 | 通用通道 |
| **Logo 工具** | `logo-utils.js` | Logo 文件和厂商映射 | 公共 |
| **首页视图** | `home.js` | 首页组件 | 通用 |
| **编辑器视图** | `editor.js` | 编辑器组件 | 通用 |

---

## 📋 机级细节表

### styles/index.js

| 函数名 | 状态 | 说明 | 样式 |
|--------|------|------|------|
| `styles` | ✅ | 样式注册表定义 | 通用 |
| `getPreview(styleId)` | ✅ | 获取预览模块 | 通用 |
| `getExport(styleId)` | ✅ | 获取导出模块 | 通用 |
| `getStyle(styleId)` | ✅ | 获取完整样式配置 | 通用 |
| `getAllStyles()` | ✅ | 获取所有样式列表 | 通用 |

### styles/type-a-preview.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `init(elements)` | ✅ | 初始化 Type A 预览 |
| `updatePreview(img, footer, options)` | ✅ | 更新照片预览 |
| `updateContentPreview(elements, settings)` | ✅ | 更新照片内容 |
| `reset()` | ✅ | 重置预览状态 |

### styles/type-b-preview.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `init(elements)` | ✅ | 初始化 Type B 预览 |
| `update(params, settings)` | ✅ | 更新照片和内容 |
| `reset()` | ✅ | 重置预览状态 |

### styles/type-c-preview.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `init(elements)` | ✅ | 初始化 Type C 预览 |
| `updatePreview(img, footer, options)` | ✅ | 更新照片预览 |
| `updateContentPreview(elements, settings)` | ✅ | 更新照片内容 |
| `reset()` | ✅ | 重置预览状态 |

### styles/type-d-preview.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `init(elements)` | ✅ | 初始化 Type D 预览 |
| `calcBorderSize(imgWidth, imgHeight, borderPercent)` | ✅ | 计算照片尺寸 |
| `updateFrameWrapper(frameWrapper)` | ✅ | 更新 frameWrapper 样式 |
| `updatePreview(img, photoFooter, options)` | ✅ | 更新照片预览 |
| `updateContentPreview(elements, settings)` | ✅ | 更新照片内容 |
| `reset()` | ✅ | 重置预览状态 |

### styles/type-e-preview.js (3:2竖向，顶部1:1正方形，底部参数)

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `init(elements)` | ✅ | 初始化 Type E 预览 |
| `setOriginalDimensions(width, height)` | ✅ | 设置原始照片尺寸 |
| `calcSize(settings)` | ✅ | 计算尺寸（正方形 + 3:2比例） |
| `updateFrameWrapper(squareSize)` | ✅ | 更新 frameWrapper 为 3:2 |
| `updatePreview(squareSize, margin, imgDimensions)` | ✅ | 更新 1:1 正方形照片预览 |
| `updateContentPreview(elements, settings)` | ✅ | 更新底部参数布局 |
| `getImageOffset()` | ✅ | 获取照片偏移量（用于导出） |
| `getState()` | ✅ | 获取完整 state（用于导出 normalizedOffset） |
| `getNormalizedOffset()` | ✅ | 获取归一化偏移量（用于导出） |
| `resetImageOffset()` | ✅ | 重置照片偏移 |
| `reset()` | ✅ | 重置预览状态 |
| `destroy()` | ✅ | 销毁拖动事件监听器（v1.02 新增） |
| `getMaxOffset()` | ✅ | 获取最大偏移量（拖动限制） |
| `startDrag/onDrag/endDrag` | ✅ | 照片拖动功能 |

### styles/type-f-preview.js (画中画风格，上方留白+照片+下方文字)

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `init(elements)` | ✅ | 初始化 Type F 预览 |
| `calcSize(settings)` | ✅ | 计算画布尺寸（canvasWidth = naturalWidth, canvasHeight = naturalHeight / 0.8，纵向图片使用 0.9） |
| `updateFrameWrapper(squareSize, canvasHeight)` | ✅ | 设置 frameWrapper 样式和动态字号 |
| `updatePreview(squareSize, canvasHeight, imgDimensions)` | ✅ | 更新照片区域样式 |
| `updateContentPreview(elements, settings)` | ✅ | 使用绝对定位更新文字内容（与导出一致） |
| `reset()` | ✅ | 重置预览状态 |

### styles/type-g-preview.js (Logo+日期参数+签名，居中布局)

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `init(elements)` | ✅ | 初始化 Type G 预览，绑定 DOM 元素 |
| `calcSize(settings)` | ✅ | 计算画布尺寸（宽度=图片宽度，高度=图片高度/0.9或0.8） |
| `updateFrameWrapper(squareSize, canvasHeight)` | ✅ | 设置 frameWrapper 样式和动态字号 |
| `updatePreview(squareSize, canvasHeight, imgDimensions)` | ✅ | 更新照片区域样式（纵向图片覆盖 CSS 默认值） |
| `updateContentPreview(elements, settings)` | ✅ | 更新文字和 Logo 内容预览（三行居中布局） |
| `reset()` | ✅ | 重置预览状态 |

### styles/type-a-export.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `exportToCanvas(img, settings)` | ✅ | Type A Canvas 导出 |

### styles/type-b-export.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `exportToCanvas(img, settings)` | ✅ | Type B Canvas 导出 |

### styles/type-c-export.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `renderImage(img, options)` | ✅ | Type C Canvas 导出 |

### styles/type-d-export.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `loadFonts()` | ✅ | 预加载字体 |
| `drawText(ctx, font, text, x, y, fontSize, options)` | ✅ | 绘制文字 |
| `drawBorderContent(ctx, imgWidth, imgHeight, borderHeight, settings, fonts)` | ✅ | 绘制照片内容 |
| `detectLogoBrightness(logoPath)` | ✅ | 检测 Logo 亮度 |
| `drawLogo(ctx, logoName, x, centerY, borderHeight, imgWidth, borderColor, onComplete)` | ✅ | 绘制 Logo |
| `borderColorIsLight(color)` | ✅ | 判断照片颜色是否为浅色 |
| `formatDateForDisplay(dateTimeStr)` | ✅ | 格式化日期用于显示 |
| `dataURLtoBlob(dataUrl)` | ✅ | DataURL 转 Blob |
| `renderImage(img, options)` | ✅ | Type D Canvas 导出 |

### styles/type-e-export.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `loadFonts()` | ✅ | 预加载 MiSans 字体 |
| `drawBorderContentTypeE(ctx, canvasWidth, canvasHeight, settings, fonts)` | ✅ | 绘制 Type E 底部参数 |
| `drawLogoTypeEFixed(ctx, logoName, x, bottomY, scale, yearFontSize)` | ✅ | 绘制 Logo（固定在底部） |
| `drawLogoTypeE(ctx, logoName, x, y, scale, yearFontSize)` | ⚠️ | 已废弃，采用 drawLogoTypeEFixed |
| `renderImage(img, options)` | ✅ | Type E Canvas 导出（3:2竖向） |

### styles/type-g-export.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `loadFonts()` | ✅ | 预加载 MiSans 字体（Semibold/Medium/Normal） |
| `drawText(ctx, text, x, y, fontSize, options)` | ✅ | 使用 ctx.fillText 绘制文字 |
| `detectLogoBrightness(logoPath)` | ✅ | 检测 logo 图片的平均亮度 |
| `borderColorIsLight(color)` | ✅ | 判断颜色是否为浅色 |
| `formatDateForDisplay(dateTimeStr)` | ✅ | 格式化日期 |
| `drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts, isPortrait)` | ✅ | 绘制底部文字内容（Logo+日期参数+签名） |
| `drawLogoG(ctx, logoName, centerX, centerY, maxHeight)` | ✅ | 绘制 Logo（居中，按目标高度缩放） |
| `renderImage(img, options)` | ✅ | Type G Canvas 导出 |

### components/type-*-editor-panel.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `configureEditPanel()` | ✅ | 配置对应型号的编辑面板 |

### app.js

| 函数名 | 状态 | 触发时机 | 核心机心 | 说明 |
|--------|------|----------|----------|------|
| `initLogoGrid` | ✅ | 初始化 | 加载 Logo 列表 | UI |
| `selectLogo` | ✅ | 点击 Logo | 更新选中状态 | 照片预览 |
| `detectLogoBrightness` | ✅ | Logo 检测 | 分析像素亮度 | 智能配色 |
| `isLogoLight` | ✅ | Logo 检测 | 缓存的亮度检测 | 性能优化 |
| `loadImageWithExif` | ✅ | 导入文件 | 读取 EXIF → 更新菜单 | 浏览器环境 |
| `loadImageInElectron` | ✅ | 选择照片 | IPC 读取 EXIF | Electron 环境 |
| `updateExifDisplay` | ✅ | EXIF 更新 | 自动填充菜单 | UX 优化 |
| `showEditor` | ✅ | 进入编辑器 | 配置编辑面板 | Type A/B/C/D/E/F/G 分支 |
| `hideEditor` | ✅ | 返回首页 | 重置状态 | Type A/B/C/D/E/F/G 分支 |
| `resetForm` | ✅ | 返回首页 | 清空菜单 | UI |
| `updateBorder` | ✅ | 颜色/高度变化 | 更新预览 | Type A/B/C/D/E/F/G 分支 |
| `updateBorderContent` | ✅ | 内容变化 | 更新预览内容 | Type A/B/C/D/E/F/G 分支 |
| `getDisplaySettings` | ✅ | 预览更新 | 收集显示设置 | Type A/B/C/D/E/F/G 高级值不同 |
| `getEditSettings` | ✅ | 导出时 | 收集编辑设置 | Type A/B/C/D/E/F/G 高级值不同 |
| `exportImageHandler` | ✅ | 点击导出 | 调用 exporter | 文件系统 |

### exporter.js

| 函数名 | 状态 | 触发时机 | 说明 |
|--------|------|----------|------|
| `loadFonts` | ✅ | 导出时 | 加载 MiSans 三种字重 |
| `exportImage` | ✅ | 导出按钮 | 创建 Canvas → 绘制 → 嵌入 EXIF |
| `drawText` | ✅ | 绘制内容 | Canvas 文字绘制 |
| `drawBorderContent` | ✅ | 导出时 | 绘制 Logo/机型/参数/签名/时间 |
| `detectLogoBrightness` | ✅ | 绘制 Logo | 分析像素亮度 |
| `drawLogo` | ✅ | 绘制内容 | 根据背景色确定 Logo 颜色 |
| `borderColorIsLight` | ✅ | 颜色判断 | 计算亮度 |
| `formatDateForDisplay` | ✅ | 时间格式化 | 转换为显示格式 |
| `dataURLtoBlob` | ✅ | 导出完成 | DataURL → Blob |
| `buildExifObj` | ⚠️ | 未使用 | 直接使用 piexif.load |
| `parseExposureTime` | ⚠️ | 未使用 | 直接使用已有格式 |

### exif.js

| 函数名 | 状态 | 触发时机 | 说明 |
|--------|------|----------|------|
| `loadExifReader` | ✅ | 首次读取 | 动态加载 exifreader |
| `getExif` | ✅ | 导入照片 | 读取全部 EXIF 字段 |
| `getMakeName` | ✅ | Logo 选择 | 标准化厂商名称 |
| `getFocalLength` | ✅ | 焦距获取 | 优先等效焦距 |
| `formatDateTime` | ✅ | 日期格式化 | EXIF 日期格式转换 |
| `formatValue` | ✅ | 数值格式化 | 提取 description/value |
| `getExifName` | ❌ | 已移除 | v1.02 清理 |
| `SUPPORTED_MAKES` | ❌ | 已移除 | v1.02 清理 |
| `exifPrimaryKeys` | ❌ | 已移除 | v1.02 清理 |
| `primaryExif` | ❌ | 已移除 | v1.02 清理 |

### logo-utils.js

| 函数名 | 状态 | 触发时机 | 说明 |
|--------|------|----------|------|
| `getAllLogos` | ✅ | Logo 列表 | 返回所有可用 Logo |
| `getLogoFilename` | ✅ | Logo URL | 获取 Logo 文件名 |
| `getModelName` | ✅ | 机型格式化 | 去除冗余后缀 |
| `getMakeName` | ✅ | Logo 选择 | 标准化厂商名称 |
| `replaceTextVars` | ✅ | 文本替换 | 替换占位符变量 |
| `getMakeLogo` | ❌ | 已移除 | v1.02 清理 |
| `logoSvgMap` | ❌ | 已移除 | v1.02 清理 |
| `getAutoLogoFilename` | ❌ | 已移除 | v1.02 清理 |
| `getMakeLogoPath` | ❌ | 已移除 | v1.02 清理 |
| `getMakeLogoSvg` | ❌ | 已移除 | v1.02 清理 |

### main.js

| IPC 通道 | 状态 | 功能 |
|----------|------|------|
| `select-image` | ✅ | 打开文件选择器 |
| `save-image` | ✅ | 保存带照片 |
| `read-exif` | ✅ | 使用 exifreader 读取 |
| `get-logos` | ✅ | 获取 Logo 列表 |
| `save-blob` | ✅ | 保存 Blob 数据 |
| `get-file-mtime` | ✅ | 获取文件创建时间 |

---

## 📈 数据流程

### 照片导入流程

```
用户选择照片
     │
     ▼
┌──────────────────────────────────────┐
│  loadImageWithExif / loadImageInElectron  │
└────────────────────┬─────────────────┘
                     │
                     ▼
┌──────────────────────────────────────┐
│            getExif(file)            │
│  - 动态加载 exifreader             │
│  - 解析 EXIF 字段                  │
└────────────────────┬─────────────────┘
                     │
                     ▼
┌──────────────────────────────────────┐
│         updateExifDisplay           │
│  - 自动选择 Logo                   │
│  - 填充机型/参数/时间              │
└─────────────────────────────────────┘
```

### 样式切换流程

```
点击样式卡片
     │
     ▼
┌──────────────────────────────────────┐
│  currentStyle = card.dataset.style │
└────────────────────┬─────────────────┘
                     │
                     ▼
┌──────────────────────────────────────┐
│          showEditor()               │
│  - 调用 configureEditPanel()       │
│  - 配置编辑面板显示                 │
│  - 调用对应预览模块                 │
└─────────────────────────────────────┘
```

### 照片预览更新流程

```
用户改变设置 / 照片加载
     │
     ▼
┌──────────────────────────────────────┐
│        updateBorder()              │
│  - 获取当前样式预览模块             │
│  - 调用 preview.update()           │
└─────────────────────────────────────┘
```

### 照片导出流程

```
用户点击导出
     │
     ▼
┌──────────────────────────────────────┐
│       exportImageHandler            │
│  - 计算照片高度                     │
│  - 收集编辑设置                     │
└────────────────────┬─────────────────┘
                     │
                     ▼
┌──────────────────────────────────────┐
│       getExport(currentStyle)       │
│  - 获取对应样式导出模块             │
│  - 调用 renderImage()              │
└────────────────────┬─────────────────┘
                     │
                     ▼
┌──────────────────────────────────────┐
│  Canvas 绘制 → 嵌入 EXIF → Blob   │
└─────────────────────────────────────┘
```

---

## Type E 特殊布局说明

### Type E 画布结构

```
┌──────────────────────────────────────┐
│                                 │
│         1:1 正方形照片            │  ← 顶部 squareSize × squareSize
│       (可拖动裁剪区域)            │
│                                 │
├──────────────────────────────────────┤
│  March              f/2.8       │
│  2024            50mm 1/125   │  ← 底部白色区域
│                   ISO 400       │    canvasHeight × 0.5
│ [Logo]            Model          │
│                 Signature        │
└──────────────────────────────────────┘

画布尺寸：squareSize × (squareSize × 1.5)
```

### Type E 布局规则

| 位置 | 内容 | 样式 |
|------|------|------|
| 左上 | 月份（英文首字母大写） | font-size: 48px（是其他文字的 2 倍） |
| 左上（月份下方） | 年份 | font-size: 24px |
| 左下 | Logo | 固定在底部，距离底部下边缘 5% |
| 右上 | 光圈 + 焦距 + 快门 + ISO | 合并在一行，font-size: 21px |
| 右上 | 机型 | font-size: 18px, 灰色 #666666 |
| 右上 | 签名 | font-size: 18px, 浅灰 #888888 |

### Type E 拖动机心

- 纵向照片：只能上下拖动，可拖动范围 = (原始高度 - squareSize) / 2
- 横向/方形照片：只能左右拖动，可拖动范围 = (原始宽度 - squareSize) / 2

---

## Type G 特殊布局说明

### Type G 画布结构

```
┌──────────────────────────────────────┐
│           ┌────────────┐           │
│           │   照片区域   │           │  ← 顶部 5% 留白，照片 92%×80%
│           │            │           │
│           └────────────┘           │
│                                      │
│         [Logo]  (居中)               │  ← 第一行：厂商 Logo
│     2024/01/01 | f/2.8 50mm | A7M4  │  ← 第二行：日期 | 参数 | 机型
│         © 署名  (居中)               │  ← 第三行：签名
└──────────────────────────────────────┘
```

### Type G 布局规则

| 位置 | 内容 | 样式 |
|------|------|------|
| 第一行 | 厂商 Logo | 居中，高度 = 文字区域高度 / 6 |
| 第二行 | 日期 | 参数 | 机型 | 居中，用竖线分隔，font-size: 14px（基准 900px 宽度） |
| 第三行 | © 署名 | 居中，font-size: 12px |

### Type G 特性

- 白色固定背景，无边框颜色/高度设置
- 所有元素默认显示，无开关控制
- 机型名称不带品牌前缀（如 "A7M4" 而非 "SONY A7M4"）
- 纵向图片：照片占 90%，白色区域减半（顶部 2.5%，底部 7.5%）
- 横向图片：照片占 80%，顶部 5%，底部 15%

---

## 📊 统计

| 分类 | 数量 |
|------|------|
| 正常/使用中 | 60+ |
| 未使用/预留 | 12 |
| **总计分析** | 72+ |

---

## ⚠️ 未使用/预留函数

### exporter.js

| 函数 | 状态 | 原因 |
|------|------|------|
| `buildExifObj` | 未使用 | 直接使用 piexif.load() |
| `parseExposureTime` | 未使用 | 直接使用已有格式 |

### exif.js

| 函数/常量 | 状态 | 原因 |
|-----------|------|------|
| `getExifName` | 已移除 | v1.02 清理 |
| `SUPPORTED_MAKES` | 已移除 | v1.02 清理 |
| `exifPrimaryKeys` | 已移除 | v1.02 清理 |
| `primaryExif` | 已移除 | v1.02 清理 |

### logo-utils.js

| 函数/常量 | 状态 | 原因 |
|-----------|------|------|
| `logoSvgMap` | 已移除 | v1.02 清理 |
| `getAutoLogoFilename` | 已移除 | v1.02 清理 |
| `getMakeLogoPath` | 已移除 | v1.02 清理 |
| `getMakeLogo` | 已移除 | v1.02 清理 |
| `getMakeLogoSvg` | 已移除 | v1.02 清理 |

---

## 🔧 样式分离状态

详见 [style_separation_analysis.md](./style_separation_analysis.md)

### 摘要

| 模块 | 分离状态 |
|------|----------|
| 样式预览 (`type-a/b/c/d/e/f/g-preview.js`) | ✅ 完全分离 |
| 样式导出 (`type-a/b/c/d/e/f/g-export.js`) | ✅ 完全分离 |
| 编辑面板配置 (`type-a/b/c/d/e/f/g-editor-panel.js`) | ✅ 完全分离 |
| 主入口 (`app.js`) | ⚠️ 部分混合 |

详细分析请查看 `style_separation_analysis.md`。