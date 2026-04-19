# OneFrame 样式分离状况分析

## 📊 概览

| 模块 | Type A | Type B | Type C | Type D | 分离状态 | 说明 |
|------|--------|--------|--------|--------|----------|------|
| **样式预览** | ✅ | ✅ | ✅ | ✅ | 完全分离 | 独立模块 `type-a/b/c/d-preview.js` |
| **样式导出** | ✅ | ✅ | ✅ | ✅ | 完全分离 | 独立模块 `type-a/b/c/d-export.js` |
| **编辑面板配置** | ✅ | ✅ | ✅ | ✅ | 完全分离 | 独立模块 `type-a/b/c/d-editor-panel.js` |
| **主逻辑 (app.js)** | ⚠️ | ⚠️ | ⚠️ | ⚠️ | 部分混合 | 包含样式切换分支 |

---

## ✅ 已完全分离的模块

### 1. 样式预览模块 (`styles/`)

| 文件 | 功能 | 样式 |
|------|------|------|
| `type-a-preview.js` | Type A 边框预览（白色下边框） | Type A |
| `type-b-preview.js` | Type B 边框预览（黑色下边框） | Type B |
| `type-c-preview.js` | Type C 边框预览 | Type C |
| `type-d-preview.js` | Type D 边框预览（横向布局） | Type D |

**调用方式：**
```javascript
import { getPreview } from './styles/index.js';

// 通用方式
const preview = getPreview(currentStyle);
preview.init(elements);
preview.update(params, settings);
```

### 2. 样式导出模块 (`styles/`)

| 文件 | 功能 | 样式 |
|------|------|------|
| `type-a-export.js` | Type A 图片导出 | Type A |
| `type-b-export.js` | Type B 图片导出 | Type B |
| `type-c-export.js` | Type C 图片导出 | Type C |
| `type-d-export.js` | Type D 图片导出 | Type D |

### 3. 编辑面板配置模块 (`components/`)

| 文件 | 功能 | 样式 |
|------|------|------|
| `type-a-editor-panel.js` | Type A 编辑面板配置 | Type A |
| `type-b-editor-panel.js` | Type B 编辑面板配置（简化版） | Type B |
| `type-c-editor-panel.js` | Type C 编辑面板配置 | Type C |
| `type-d-editor-panel.js` | Type D 编辑面板配置 | Type D |

**调用方式：**
```javascript
import { getStyle } from './styles/index.js';

const style = getStyle(currentStyle);
style.panel.configureEditPanel();
```

---

## ⚠️ 部分混合的模块

### app.js

**问题：** 包含样式切换条件分支

**混合处理的部分：**

| 函数/代码段 | Type A | Type B | Type C | Type D | 说明 |
|-------------|--------|--------|--------|--------|------|
| `loadImageWithExif` | ✅ | ✅ | ✅ | ✅ | 通用 EXIF 读取 |
| `loadImageInElectron` | ✅ | ✅ | ✅ | ✅ | IPC 读取 |
| `showEditor` | ✅ | ✅ | ✅ | ✅ | 配置面板分支 |
| `hideEditor` | ✅ | ✅ | ✅ | ✅ | 重置预览分支 |
| `updateBorder` | ✅ | ✅ | ✅ | ✅ | 使用样式预览模块 |
| `updateBorderContent` | ✅ | ✅ | ✅ | ✅ | 调用样式预览模块 |
| `getDisplaySettings` | ✅ | ✅ | ✅ | ✅ | 样式默认值不同 |
| `getEditSettings` | ✅ | ✅ | ✅ | ✅ | 样式默认值不同 |

---

## 📁 文件职责表

### styles/ 模块

| 文件 | 职责 | 样式 |
|------|------|------|
| `index.js` | 样式注册表，提供 `getPreview()` / `getExport()` | 通用 |
| `type-a-preview.js` | Type A 边框预览渲染 | Type A |
| `type-b-preview.js` | Type B 边框预览渲染 | Type B |
| `type-c-preview.js` | Type C 边框预览渲染 | Type C |
| `type-d-preview.js` | Type D 边框预览渲染 | Type D |
| `type-a-export.js` | Type A Canvas 绘制导出 | Type A |
| `type-b-export.js` | Type B Canvas 绘制导出 | Type B |
| `type-c-export.js` | Type C Canvas 绘制导出 | Type C |
| `type-d-export.js` | Type D Canvas 绘制导出 | Type D |

### components/ 模块

| 文件 | 职责 | 样式 |
|------|------|------|
| `index.js` | 组件统一导出 | 通用 |
| `home.js` | 首页视图 | 通用 |
| `editor.js` | 编辑器视图（调用面板配置模块） | 通用 |
| `type-a-editor-panel.js` | Type A 编辑面板配置 | Type A |
| `type-b-editor-panel.js` | Type B 编辑面板配置（简化版） | Type B |
| `type-c-editor-panel.js` | Type C 编辑面板配置 | Type C |
| `type-d-editor-panel.js` | Type D 编辑面板配置 | Type D |

### 共享模块

| 文件 | 职责 | 说明 |
|------|------|------|
| `app.js` | 主逻辑入口，混合处理 | ⚠️ 需要维护样式分支 |
| `exif.js` | EXIF 读取 | ✅ 共享 |
| `exporter.js` | 通用导出逻辑（Type A/B） | ✅ 共享 |
| `logo-utils.js` | Logo 工具函数 | ✅ 共享 |
| `events.js` | 事件处理 | ✅ 共享 |
| `state.js` | 状态管理 | ✅ 共享 |

---

## 🔧 样式特性

### Type A - 白色下边框
- 可调节边框高度（5%-30%）
- 完整编辑面板
- Logo + 机型 + 参数 + 时间

### Type B - 黑色下边框
- 固定边框比例
- 简化编辑面板
- 隐藏 Logo 开关

### Type C - 样式 C
- 横向布局
- Logo 在左侧
- 参数在右侧

### Type D - 横向布局
- Logo 居中
- 左侧：时间 + 署名
- 右侧：机型 + 参数
- 纵向图片文字缩小 0.85x

---

## ✅ 结论

**已实现完全分离的模块：**
- 样式预览模块 (`type-a/b/c/d-preview.js`)
- 样式导出模块 (`type-a/b/c/d-export.js`)
- 编辑面板配置模块 (`type-a/b/c/d-editor-panel.js`)

**需要改进的部分：**
- app.js 中的样式处理逻辑可以考虑进一步抽取
- 状态默认值可以移到对应的 editor-panel 模块中统一管理

**不影响其他样式的保障机制：**
- ✅ 使用独立的模块文件
- ✅ 在 `showEditor()` 中根据 `currentStyle` 调用对应配置
- ✅ 每个样式的配置不会影响其他样式
