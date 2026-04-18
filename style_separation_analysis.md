# OneFrame 样式分离状况分析

## 📊 概览

| 模块 | Type A | Type B | 分离状态 | 说明 |
|------|--------|--------|----------|------|
| **样式预览** | ✅ | ✅ | 完全分离 | 独立模块 `type-a-preview.js` / `type-b-preview.js` |
| **样式导出** | ✅ | ✅ | 完全分离 | 独立模块 `type-a-export.js` / `type-b-export.js` |
| **编辑面板配置** | ✅ | ✅ | 完全分离 | 独立模块 `type-a-editor-panel.js` / `type-b-editor-panel.js` |
| **主逻辑 (app.js)** | ⚠️ | ⚠️ | 部分混合 | 包含 `if (currentStyle === 'type-b')` 分支 |

---

## ✅ 已完全分离的模块

### 1. 样式预览模块 (`styles/`)

| 文件 | 功能 | 样式 |
|------|------|------|
| `type-a-preview.js` | Type A 边框预览 | Type A |
| `type-b-preview.js` | Type B 边框预览 | Type B |

**调用方式：**
```javascript
import { getPreview, typeBPreview } from './styles/index.js';

// 通用方式
const preview = getPreview(currentStyle);
preview.init(elements);
preview.update(params, settings);

// Type B 直接引用
typeBPreview.init(elements);
typeBPreview.update(params, settings);
```

### 2. 样式导出模块 (`styles/`)

| 文件 | 功能 | 样式 |
|------|------|------|
| `type-a-export.js` | Type A 图片导出 | Type A |
| `type-b-export.js` | Type B 图片导出 | Type B |

### 3. 编辑面板配置模块 (`components/`)

| 文件 | 功能 | 样式 |
|------|------|------|
| `type-a-editor-panel.js` | Type A 编辑面板配置 | Type A |
| `type-b-editor-panel.js` | Type B 编辑面板配置 | Type B |

**调用方式：**
```javascript
import { configureEditPanel as configureTypeA } from './type-a-editor-panel.js';
import { configureEditPanel as configureTypeB } from './type-b-editor-panel.js';

if (currentStyle === 'type-b') {
  configureTypeB();
} else {
  configureTypeA();
}
```

---

## ⚠️ 部分混合的模块

### app.js

**问题：** 包含大量 `if (currentStyle === 'type-b')` 条件分支

**混合处理的部分：**

| 函数/代码段 | Type A | Type B | 说明 |
|-------------|--------|--------|------|
| `loadImageWithExif` | ✅ | ✅ | Type B 检查纵向图片 |
| `loadImageInElectron` | ✅ | ✅ | Type B 检查纵向图片 |
| `showEditor` | ✅ | ✅ | Type B 隐藏编辑面板开关 |
| `hideEditor` | ✅ | ✅ | Type B 重置预览 |
| `updateBorder` | ✅ | ✅ | 使用对应样式预览模块 |
| `updateBorderContent` | ✅ | ⚠️ | Type B 调用 `typeBPreview.update` |
| `getDisplaySettings` | ✅ | ✅ | Type B 默认值不同 |
| `getEditSettings` | ✅ | ✅ | Type B 默认值不同 |

**Type B 相关代码片段：**

```javascript
// showEditor 中的 Type B 处理
if (currentStyle === 'type-b') {
  const switchLogo = document.getElementById('switchLogo');
  if (switchLogo) switchLogo.style.display = 'none';
  // ...
}

// updateBorder 中的 Type B 处理
if (currentStyle === 'type-b') {
  typeBPreview.init({...});
  typeBPreview.update({...}, getDisplaySettings());
}
```

---

## 🔧 还需要做的工作

### 1. 编辑面板显示/隐藏逻辑 - ✅ 已完成

| 操作 | 文件 | 状态 |
|------|------|------|
| Type B 隐藏开关按钮 | `app.js` / `type-b-editor-panel.js` | ✅ 已实现 |
| Type B 输出比例简化 | `type-b-editor-panel.js` | ✅ 已实现 |
| Type B 时间类型为 date | `type-b-editor-panel.js` | ✅ 已实现 |

### 2. 预览内容更新 - ⚠️ 需要检查

**问题：** `updateBorderContent` 函数在 Type B 时调用 `typeBPreview.update`，但 Type A 使用通用方式。

**建议：** 统一使用 `getPreview(currentStyle).updateContentPreview()` 方式。

### 3. 状态默认值 - ⚠️ 需要统一

| 设置项 | Type A 默认值 | Type B 默认值 | 位置 |
|--------|--------------|--------------|------|
| `showLogo` | `switchLogo.classList.contains('active')` | `true` | `getDisplaySettings()` |
| `showParams` | `switchParams.classList.contains('active')` | `true` | `getDisplaySettings()` |
| `showTime` | `switchTime.classList.contains('active')` | `true` | `getDisplaySettings()` |

### 4. app.js 重构建议 - 📋 可选

可以考虑将 app.js 中的样式相关逻辑抽取到独立模块：

```
components/
├── style-controller.js   # 统一管理样式切换逻辑
├── type-a-state.js      # Type A 状态
└── type-b-state.js      # Type B 状态
```

---

## 📁 文件职责表

### styles/ 模块

| 文件 | 职责 | 样式 |
|------|------|------|
| `index.js` | 样式注册表，提供 `getPreview()` / `getExport()` | 通用 |
| `type-a-preview.js` | Type A 边框预览渲染 | Type A |
| `type-b-preview.js` | Type B 边框预览渲染 | Type B |
| `type-a-export.js` | Type A Canvas 绘制导出 | Type A |
| `type-b-export.js` | Type B Canvas 绘制导出 | Type B |

### components/ 模块

| 文件 | 职责 | 样式 |
|------|------|------|
| `index.js` | 组件统一导出 | 通用 |
| `home.js` | 首页视图 | 通用 |
| `editor.js` | 编辑器视图（调用面板配置模块） | 通用 |
| `type-a-editor-panel.js` | Type A 编辑面板配置 | Type A |
| `type-b-editor-panel.js` | Type B 编辑面板配置 | Type B |

### 共享模块

| 文件 | 职责 | 说明 |
|------|------|------|
| `app.js` | 主逻辑入口，混合处理 | ⚠️ 需要重构 |
| `exif.js` | EXIF 读取 | ✅ 共享 |
| `exporter.js` | 通用导出逻辑 | ✅ 共享 |
| `logo-utils.js` | Logo 工具函数 | ✅ 共享 |
| `events.js` | 事件处理 | 待分析 |
| `state.js` | 状态管理 | 待分析 |

---

## ✅ 结论

**已实现完全分离的模块：**
- 样式预览模块 (`type-a-preview.js` / `type-b-preview.js`)
- 样式导出模块 (`type-a-export.js` / `type-b-export.js`)
- 编辑面板配置模块 (`type-a-editor-panel.js` / `type-b-editor-panel.js`)

**需要改进的部分：**
- app.js 中的样式处理逻辑可以考虑进一步抽取
- 状态默认值可以移到对应的 editor-panel 模块中统一管理
- `updateBorderContent` 的调用方式可以统一

**不影响其他样式的保障机制：**
- ✅ 使用独立的模块文件
- ✅ 在 `showEditor()` 中根据 `currentStyle` 调用对应配置
- ✅ Type B 配置不会影响 Type A（只在 Type B 模式生效）
