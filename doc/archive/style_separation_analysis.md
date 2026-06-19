# OneFrame 样式分离状况分析

## 📊 概览

| 模块 | Type A | Type B | Type C | Type D | Type E | Type F | 分离状态 | 说明 |
|------|--------|--------|--------|--------|--------|--------|----------|------|
| **样式预览** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 完全分离 | 独立模块 `type-a/b/c/d/e/f-preview.js` |
| **样式导出** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 完全分离 | 独立模块 `type-a/b/c/d/e/f-export.js` |
| **编辑面板配置** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 完全分离 | 独立模块 `type-a/b/c/d/e/f-editor-panel.js` |
| **主逻辑 (app.js)** | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | 部分混合 | 包含样式切换分支 |

---

## ✅ 已完全分离的模块

### 1. 样式预览模块 (`styles/`)

| 文件 | 功能 | 样式 |
|------|------|------|
| `type-a-preview.js` | Type A 边框预览（白色下边框） | Type A |
| `type-b-preview.js` | Type B 边框预览（黑色下边框） | Type B |
| `type-c-preview.js` | Type C 边框预览 | Type C |
| `type-d-preview.js` | Type D 边框预览（横向布局） | Type D |
| `type-e-preview.js` | Type E 边框预览（3:2 纵向，顶部 1:1 正方形） | Type E |
| `type-f-preview.js` | Type F 边框预览（画中画风格） | Type F |

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
| `type-e-export.js` | Type E 图片导出（3:2 纵向） | Type E |
| `type-f-export.js` | Type F 图片导出（画中画风格） | Type F |

### 3. 编辑面板配置模块 (`components/`)

| 文件 | 功能 | 样式 |
|------|------|------|
| `type-a-editor-panel.js` | Type A 编辑面板配置 | Type A |
| `type-b-editor-panel.js` | Type B 编辑面板配置（简化版） | Type B |
| `type-c-editor-panel.js` | Type C 编辑面板配置 | Type C |
| `type-d-editor-panel.js` | Type D 编辑面板配置 | Type D |
| `type-e-editor-panel.js` | Type E 编辑面板配置（简化版） | Type E |
| `type-f-editor-panel.js` | Type F 编辑面板配置（简化版） | Type F |

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

| 函数/代码段 | Type A | Type B | Type C | Type D | Type E | 说明 |
|-------------|--------|--------|--------|--------|--------|------|
| `loadImageWithExif` | ✅ | ✅ | ✅ | ✅ | ✅ | 通用 EXIF 读取 |
| `loadImageInElectron` | ✅ | ✅ | ✅ | ✅ | ✅ | IPC 读取 |
| `showEditor` | ✅ | ✅ | ✅ | ✅ | ✅ | 配置面板分支 |
| `hideEditor` | ✅ | ✅ | ✅ | ✅ | ✅ | 重置预览分支 |
| `updateBorder` | ✅ | ✅ | ✅ | ✅ | ✅ | 使用样式预览模块 |
| `updateBorderContent` | ✅ | ✅ | ✅ | ✅ | ✅ | 调用样式预览模块 |
| `getDisplaySettings` | ✅ | ✅ | ✅ | ✅ | ✅ | 样式默认值不同 |
| `getEditSettings` | ✅ | ✅ | ✅ | ✅ | ✅ | 样式默认值不同 |

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
| `type-e-preview.js` | Type E 边框预览渲染（3:2 纵向） | Type E |
| `type-f-preview.js` | Type F 边框预览渲染（画中画风格） | Type F |
| `type-a-export.js` | Type A Canvas 绘制导出 | Type A |
| `type-b-export.js` | Type B Canvas 绘制导出 | Type B |
| `type-c-export.js` | Type C Canvas 绘制导出 | Type C |
| `type-d-export.js` | Type D Canvas 绘制导出 | Type D |
| `type-e-export.js` | Type E Canvas 绘制导出 | Type E |
| `type-f-export.js` | Type F Canvas 绘制导出 | Type F |

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
| `type-e-editor-panel.js` | Type E 编辑面板配置 | Type E |
| `type-f-editor-panel.js` | Type F 编辑面板配置（简化版） | Type F |

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

### Type E - 3:2 纵向
- 顶部 1:1 正方形图片，底部白色区域显示参数
- 画布比例 3:2
- 图片可拖动选择裁剪区域
- 字号：月份 48px，年份 24px，参数行 18px
- Logo 固定在底部左下角

### Type F - 画中画风格
- 上方 5% 白色留白 + 中部 92%×80% 照片展示区 + 下方 15% 文字信息区
- 画布比例 = 图片比例（宽度 = 图片宽度，高度 = 图片高度 / 0.8）
- 字号动态缩放（基准 900px 宽度对应 14px）
- 文字区域使用绝对定位，署名不影响前两行位置
- 窗口缩放时动态计算显示尺寸，所有元素等比缩放
- 编辑面板隐藏边框颜色、边框高度、比例设置、Logo 区域

---

## ✅ 结论

**已实现完全分离的模块：**
- 样式预览模块 (`type-a/b/c/d/e/f-preview.js`)
- 样式导出模块 (`type-a/b/c/d/e/f-export.js`)
- 编辑面板配置模块 (`type-a/b/c/d/e/f-editor-panel.js`)

**需要改进的部分：**
- app.js 中的样式处理逻辑可以考虑进一步抽取
- 状态默认值可以移到对应的 editor-panel 模块中统一管理

**不影响其他样式的保障机制：**
- ✅ 使用独立的模块文件
- ✅ 在 `showEditor()` 中根据 `currentStyle` 调用对应配置
- ✅ 每个样式的配置不会影响其他样式

---

## ⚠️ 已知 CSS 干扰问题（v1.0.4 修复）

### 干扰源

`type-a.css` 中的通用选择器：
```css
.frame-wrapper.type-a,
.frame-wrapper:not(.type-b):not(.type-e) {
  max-width: 900px;
  width: 100%;
  max-height: 100%;
  display: flex;
}
```

该选择器匹配了所有不带 `.type-b` 和 `.type-e` 的 frame-wrapper。

### 影响分析

| 样式 | 是否被匹配 | 是否有冲突 | 说明 |
|------|-----------|-----------|------|
| Type A | ✅ 有意匹配 | 无 | 本身就是目标样式 |
| Type B | ❌ 不匹配 | 无 | 被 `:not(.type-b)` 排除 |
| Type C | ⚠️ 意外匹配 | 无 | Type C 自己有 `max-width: 900px` |
| Type D | ⚠️ 意外匹配 | 无 | Type D 自己有 `max-width: 900px` |
| Type E | ❌ 不匹配 | 无 | 被 `:not(.type-e)` 排除 |
| Type F | ❌ 意外匹配 | **有冲突** | `max-width: 900px` 和 `width: 100%` 干扰了 JS 设置的尺寸 |

### Type F 的修复

在 `type-f.css` 中添加 `!important` 覆盖：
```css
.frame-wrapper.type-f {
  max-width: none !important;
  max-height: none !important;
}
```

### 潜在风险

未来新增样式（如 Type G）也需要检查是否会被此通用选择器影响。建议后续将 `.frame-wrapper:not(.type-b):not(.type-e)` 改为显式列出需要匹配的样式。
