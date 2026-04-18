# OneFrame 函数动作分析总结

---

## 📊 快速总览

| 状态 | 数量 | 说明 |
|------|------|------|
| ✅ 设计/使用中 | 30+ | 按设计预期运行，无需修改 |
| ⚠️ 未使用/预留 | 12 | 功能已废弃或预留，未被调用 |

---

## 📁 项目文件结构

```
src/
├── main/
│   ├── main.js              # Electron 主进程
│   └── preload.js           # 安全桥接
└── renderer/
    ├── index.html           # 主页面
    ├── index.css            # 全局样式
    ├── css/
    │   ├── type-a.css      # Type A 样式
    │   └── type-b.css      # Type B 样式
    ├── js/
    │   ├── app.js          # 主逻辑入口
    │   ├── events.js        # 事件处理
    │   ├── state.js        # 状态管理
    │   ├── exif.js         # EXIF 读取 (exifreader)
    │   ├── exif-exporter.js # EXIF 导出 (piexifjs)
    │   ├── exporter.js      # 图片导出
    │   ├── logo-utils.js    # Logo 工具函数
    │   ├── components/
    │   │   ├── index.js    # 组件导出
    │   │   ├── home.js     # 首页视图
    │   │   ├── editor.js   # 编辑器视图
    │   │   ├── type-a-editor-panel.js  # Type A 编辑面板配置
    │   │   └── type-b-editor-panel.js  # Type B 编辑面板配置
    │   └── styles/
    │       ├── index.js     # 样式注册表
    │       ├── type-a-preview.js   # Type A 预览
    │       ├── type-b-preview.js   # Type B 预览
    │       ├── type-a-export.js    # Type A 导出
    │       └── type-b-export.js    # Type B 导出
    ├── logos/               # 相机厂商 Logo (SVG)
    └── fonts/               # 字体文件 (MiSans)
```

---

## 📋 模块职责表

### 样式相关模块

| 模块 | 文件 | 职责 | 样式 |
|------|------|------|------|
| **预览** | `type-a-preview.js` | Type A 边框预览渲染 | Type A |
| **预览** | `type-b-preview.js` | Type B 边框预览渲染 | Type B |
| **导出** | `type-a-export.js` | Type A Canvas 绘制导出 | Type A |
| **导出** | `type-b-export.js` | Type B Canvas 绘制导出 | Type B |
| **面板配置** | `type-a-editor-panel.js` | Type A 编辑面板配置 | Type A |
| **面板配置** | `type-b-editor-panel.js` | Type B 编辑面板配置 | Type B |
| **样式注册表** | `index.js` | 统一管理样式模块 | 通用 |

### 共享模块

| 模块 | 文件 | 职责 | 说明 |
|------|------|------|------|
| **主入口** | `app.js` | 主逻辑入口 | 混合处理 Type A/B |
| **EXIF 读取** | `exif.js` | 读取图片 EXIF 信息 | 使用 exifreader |
| **EXIF 导出** | `exif-exporter.js` | 嵌入 EXIF 到输出图 | 使用 piexifjs |
| **图片导出** | `exporter.js` | Canvas 绘制导出 | 通用逻辑 |
| **Logo 工具** | `logo-utils.js` | Logo 文件和厂商映射 | 共享 |
| **首页视图** | `home.js` | 首页组件 | 通用 |
| **编辑器视图** | `editor.js` | 编辑器组件 | 通用 |

---

## 📋 机制汇总表

### styles/index.js

| 函数名 | 状态 | 说明 | 样式 |
|--------|------|------|------|
| `styles` | ✅ | 样式注册表对象 | 通用 |
| `getPreview(styleId)` | ✅ | 获取预览模块 | 通用 |
| `getExport(styleId)` | ✅ | 获取导出模块 | 通用 |
| `getStyle(styleId)` | ✅ | 获取完整样式配置 | 通用 |
| `getAllStyles()` | ✅ | 获取所有样式列表 | 通用 |

### styles/type-a-preview.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `init(elements)` | ✅ | 初始化 Type A 预览 |
| `updatePreview(img, footer, options)` | ✅ | 更新边框预览 |
| `updateContentPreview(elements, settings)` | ✅ | 更新边框内容 |
| `reset()` | ✅ | 重置预览状态 |

### styles/type-b-preview.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `init(elements)` | ✅ | 初始化 Type B 预览 |
| `update(params, settings)` | ✅ | 更新边框和内容 |
| `reset()` | ✅ | 重置预览状态 |

### styles/type-a-export.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `exportToCanvas(img, settings)` | ✅ | Type A Canvas 导出 |

### styles/type-b-export.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `exportToCanvas(img, settings)` | ✅ | Type B Canvas 导出 |

### components/type-a-editor-panel.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `configureEditPanel()` | ✅ | 配置 Type A 编辑面板显示 |

### components/type-b-editor-panel.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `configureEditPanel()` | ✅ | 配置 Type B 编辑面板（隐藏高级选项） |

### app.js

| 函数名 | 状态 | 触发时机 | 核心机制 | 说明 |
|--------|------|----------|----------|------|
| `initLogoGrid` | ✅ | 初始化 | 加载 Logo 列表 | UI |
| `selectLogo` | ✅ | 点击 Logo | 更新选中状态 | 边框预览 |
| `detectLogoBrightness` | ✅ | Logo 检测 | 分析像素亮度 | 智能配色 |
| `isLogoLight` | ✅ | Logo 检测 | 带缓存的亮度检测 | 性能优化 |
| `loadImageWithExif` | ✅ | 导入文件 | 读取 EXIF → 更新表单 | 浏览器环境 |
| `loadImageInElectron` | ✅ | 选择图片 | IPC 读取 EXIF | Electron 环境 |
| `updateExifDisplay` | ✅ | EXIF 更新 | 自动填充表单 | UX 优化 |
| `showEditor` | ✅ | 进入编辑器 | 配置编辑面板 | Type A/B 分支 |
| `hideEditor` | ✅ | 返回主页 | 重置状态 | Type A/B 分支 |
| `resetForm` | ✅ | 返回主页 | 清空表单 | UI |
| `updateBorder` | ✅ | 颜色/高度变化 | 更新边框 | Type A/B 分支 |
| `updateBorderContent` | ✅ | 内容变化 | 更新边框内容 | Type A/B 分支 |
| `getDisplaySettings` | ✅ | 预览更新 | 收集显示设置 | Type A/B 默认值不同 |
| `getEditSettings` | ✅ | 导出时 | 收集编辑设置 | Type A/B 默认值不同 |
| `exportImageHandler` | ✅ | 点击导出 | 调用 exporter | 文件系统 |

### exporter.js

| 函数名 | 状态 | 触发时机 | 说明 |
|--------|------|----------|------|
| `loadFonts` | ✅ | 导出时 | 加载 MiSans 三种字重 |
| `exportImage` | ✅ | 导出按钮 | 创建 Canvas → 绘制 → 嵌入 EXIF |
| `drawText` | ✅ | 绘制内容 | Canvas 文字绘制 |
| `drawBorderContent` | ✅ | 导出时 | 绘制 Logo/机型/参数/署名/时间 |
| `detectLogoBrightness` | ✅ | 绘制 Logo | 分析像素亮度 |
| `drawLogo` | ✅ | 绘制内容 | 根据背景色决定 Logo 颜色 |
| `borderColorIsLight` | ✅ | 颜色判断 | 计算亮度 |
| `formatDateForDisplay` | ✅ | 时间格式化 | 转换为显示格式 |
| `dataURLtoBlob` | ✅ | 导出完成 | DataURL → Blob |
| `buildExifObj` | ⚠️ | 未使用 | 直接使用 piexif.load |
| `parseExposureTime` | ⚠️ | 未使用 | 直接使用已有格式 |

### exif.js

| 函数名 | 状态 | 触发时机 | 说明 |
|--------|------|----------|------|
| `loadExifReader` | ✅ | 首次读取 | 动态加载 exifreader |
| `getExif` | ✅ | 导入图片 | 读取全部 EXIF 字段 |
| `getMakeName` | ✅ | Logo 选择 | 标准化厂商名称 |
| `getFocalLength` | ✅ | 焦距获取 | 优先等效焦距 |
| `formatDateTime` | ✅ | 日期格式化 | EXIF 日期格式转换 |
| `formatValue` | ✅ | 值格式化 | 提取 description/value |
| `getExifName` | ⚠️ | 未使用 | UI 不显示 EXIF 详情 |

### logo-utils.js

| 函数名 | 状态 | 触发时机 | 说明 |
|--------|------|----------|------|
| `getAllLogos` | ✅ | Logo 列表 | 返回所有可用 Logo |
| `getLogoFilename` | ✅ | Logo URL | 获取 Logo 文件名 |
| `getModelName` | ✅ | 机型格式化 | 去除冗余后缀 |
| `getMakeName` | ✅ | Logo 选择 | 标准化厂商名称 |
| `getMakeLogo` | ⚠️ | 未使用 | 改用直接匹配 |
| `logoSvgMap` | ⚠️ | 未使用 | 改用真实 SVG 文件 |

### main.js

| IPC 通道 | 状态 | 功能 |
|----------|------|------|
| `select-image` | ✅ | 打开文件选择器 |
| `save-image` | ✅ | 保存对话框 |
| `read-exif` | ✅ | 使用 exifreader 读取 |
| `get-logos` | ✅ | 获取 Logo 列表 |
| `save-blob` | ✅ | 保存 Blob 数据 |
| `get-file-mtime` | ✅ | 获取文件修改时间 |

---

## 📈 数据流分析

### 图片导入流程

```
用户选择图片
     │
     ▼
┌─────────────────────────────────────┐
│  loadImageWithExif / loadImageInElectron  │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│            getExif(file)            │
│  - 动态加载 exifreader             │
│  - 解析 EXIF 字段                  │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
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
┌─────────────────────────────────────┐
│  currentStyle = card.dataset.style │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│          showEditor()               │
│  - 调用 configureTypeA/TypeB()      │
│  - 配置编辑面板显示                 │
│  - 调用对应预览模块                 │
└─────────────────────────────────────┘
```

### 边框预览更新流程

```
用户修改设置 / 图片加载
     │
     ▼
┌─────────────────────────────────────┐
│        updateBorder()              │
│  - 获取当前样式预览模块             │
│  - 调用 preview.update()            │
└─────────────────────────────────────┘
```

### 图片导出流程

```
用户点击导出
     │
     ▼
┌─────────────────────────────────────┐
│       exportImageHandler            │
│  - 计算边框高度                     │
│  - 收集编辑设置                     │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│       getExport(currentStyle)       │
│  - 获取对应样式导出模块             │
│  - 调用 exportToCanvas()            │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Canvas 绘制 → 嵌入 EXIF → Blob   │
└─────────────────────────────────────┘
```

---

## 📊 统计

| 分类 | 数量 |
|------|------|
| 设计/使用中 | 30+ |
| 未使用/预留 | 12 |
| **总计分析** | 42+ |

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
| `getExifName` | 未使用 | UI 不显示详情表 |
| `SUPPORTED_MAKES` | 未使用 | 从 logoList 获取 |
| `exifPrimaryKeys` | 未使用 | 仅定义 |
| `primaryExif` | 未使用 | UI 不显示详情 |

### logo-utils.js

| 函数/常量 | 状态 | 原因 |
|-----------|------|------|
| `logoSvgMap` | 未使用 | 改用真实 SVG 文件 |
| `getAutoLogoFilename` | 未使用 | 改用 CSS filter |
| `getMakeLogoPath` | 未使用 | 改用相对路径 |
| `getMakeLogo` | 未使用 | 改用直接匹配 |

---

## 🔧 样式分离状况

详见 [style_separation_analysis.md](./style_separation_analysis.md)

### 摘要

| 模块 | 分离状态 |
|------|----------|
| 样式预览 (`type-a-preview.js` / `type-b-preview.js`) | ✅ 完全分离 |
| 样式导出 (`type-a-export.js` / `type-b-export.js`) | ✅ 完全分离 |
| 编辑面板配置 (`type-a-editor-panel.js` / `type-b-editor-panel.js`) | ✅ 完全分离 |
| 主逻辑 (`app.js`) | ⚠️ 部分混合 |

详细分析请查看 `style_separation_analysis.md`。
