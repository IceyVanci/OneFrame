# OneFrame 代码审查报告

**审查日期**：2026-06-17
**审查版本**：v1.01
**审查范围**：全部源代码（src/renderer/js/、src/main/、src/preload/、CSS、HTML）

---

## 📊 问题总览

| 类别 | 数量 | 状态 |
|------|------|------|
| 🔴 逻辑错误 | 3 个活跃 + 2 个搁置 | 需要修复 |
| 🟠 调试日志未清理 | 72 处 | 需要清理 |
| 🟢 优化建议 | 3 个活跃 + 2 个搁置 | 建议优化 |
| 🔵 未使用的模块 | 3 个活跃 + 3 个搁置 | 部分需清理 |
| ⏸️ 搁置项 | 重复代码 4 类 + 搁置模块 3 个 + 搁置 Bug 2 个 + 搁置优化 2 个 | 设计决策/暂时搁置 |

---

## 🔴 逻辑错误（需要修复）

### BUG-01 + BUG-02：样式切换后 UI 状态互相干扰 ⏸️ 改用 reload 方案

**文件**：`src/renderer/js/app.js`

**问题分析**：
`showEditor()` 中根据当前样式类型隐藏了不同的 UI 元素（Type B 隐藏 Logo/参数/时间开关，Type E 隐藏边框颜色和比例选项）。但 `hideEditor()` 中没有恢复这些元素，导致切换样式后控件状态混乱。同时 Type E 中 `originalOption.remove()` 会永久删除 DOM 节点。

**解决方法**：在 `hideEditor()` 中调用 `location.reload()` 重置整个页面状态。

```javascript
function hideEditor() {
  // 移除窗口大小变化监听
  window.removeEventListener('resize', updateBorder);
  
  // 释放 Object URL 内存（BUG-04）
  if (userImage.src && userImage.src.startsWith('blob:')) {
    URL.revokeObjectURL(userImage.src);
  }
  
  // 重载页面，彻底重置所有 DOM 状态
  location.reload();
}
```

**原理**：`location.reload()` 会重新加载整个页面，所有 DOM 元素恢复为 HTML 中的初始状态。这彻底避免了：
- Type B 隐藏的开关未恢复
- Type E 删除的 `<option>` 未恢复
- 边框颜色区域未恢复
- 任何其他由 `showEditor()` 修改的内联样式

**优点**：零出错风险，不需要逐个追踪和恢复被修改的元素。
**缺点**：返回首页时有短暂刷新，Logo 网格需重新加载。

---

### BUG-03：loadImageWithExif 缺少 resetForm() 调用

**文件**：`src/renderer/js/app.js` 第 145-163 行

**问题分析**：
`loadImageInElectron()`（第 194 行）在加载新图片前调用了 `resetForm()`，但 `loadImageWithExif()`（浏览器环境）没有调用。这导致浏览器环境下重选图片时，旧的表单值（机型、参数、时间等）会残留。

**对比**：
```javascript
// Electron 环境 - 有 resetForm ✓
async function loadImageInElectron(imagePath) {
  // ...
  resetForm();  // ← 清空表单
  userImage.src = `file://${imagePath}`;
}

// 浏览器环境 - 缺少 resetForm ✗
async function loadImageWithExif(file) {
  // ...
  currentFile = file;
  userImage.src = URL.createObjectURL(file);
  // 没有 resetForm()！
}
```

**解决方法**：
```javascript
async function loadImageWithExif(file) {
  if (currentStyle === 'type-b') {
    const orientation = await checkImageOrientation(file);
    if (!orientation.isPortrait) {
      alert('目前本样式只适配纵向图像哦');
      return false;
    }
  }
  currentFile = file;
  currentImagePath = null;
  resetForm();  // ← 添加这一行
  userImage.src = URL.createObjectURL(file);
  try {
    currentExif = await getExif(file);
    updateExifDisplay();
  } catch (error) {
    currentExif = {};
  }
  return true;
}
```

---

### BUG-04：URL.createObjectURL 内存泄漏

**文件**：`src/renderer/js/app.js` 第 155 行

**问题代码**：
```javascript
userImage.src = URL.createObjectURL(file);
```

**问题分析**：
每次创建 Object URL 但从未调用 `URL.revokeObjectURL()` 释放内存。浏览器会为每个 Object URL 维护一个引用，直到页面卸载。如果用户多次重选大图片，内存占用会持续增长。

**解决方法**：
在加载新图片或离开编辑器时释放：
```javascript
// 在 loadImageWithExif 中
async function loadImageWithExif(file) {
  // ... 检查逻辑 ...
  
  // 释放旧的 Object URL
  if (userImage.src && userImage.src.startsWith('blob:')) {
    URL.revokeObjectURL(userImage.src);
  }
  
  currentFile = file;
  currentImagePath = null;
  resetForm();
  userImage.src = URL.createObjectURL(file);
  // ...
}

// 在 hideEditor 中也要释放
function hideEditor() {
  // ...
  if (userImage.src && userImage.src.startsWith('blob:')) {
    URL.revokeObjectURL(userImage.src);
  }
  userImage.src = '';
  // ...
}
```

---

## 🟠 调试日志未清理

**统计**：共 72 处 `console.log` 散布在生产代码中。

**分布**：
| 文件 | 数量 | 说明 |
|------|------|------|
| `type-e-preview.js` | ~30 | 拖动、尺寸计算、初始化、Logo 加载 |
| `type-b-preview.js` | ~10 | 初始化、更新、内容预览 |
| `type-a-export.js` | ~6 | 导出参数、Canvas 尺寸 |
| `type-c-export.js` | ~6 | 同上 |
| `type-d-export.js` | ~6 | 同上 |
| `type-e-export.js` | ~3 | Logo 绘制 |
| `exporter.js` | 2 | dataUrl 调试 |
| `exif.js` | 1 | EXIF 加载 |

**影响**：
- 运行时性能下降（特别是拖动时高频触发的 `[TypeE] onDrag` 日志）
- 控制台噪音大，真正的错误信息被淹没
- 暴露内部实现细节

**解决方法**：
1. 保留关键错误日志（`console.error`）
2. 移除所有调试用 `console.log`
3. 如需调试能力，可引入日志级别控制：
```javascript
// utils/logger.js
const DEBUG = false; // 生产环境设为 false
export const log = DEBUG ? console.log.bind(console) : () => {};
export const warn = console.warn.bind(console);
export const error = console.error.bind(console);
```

---

## 🟢 优化建议（活跃）

### OPT-02：updateBorderContent 中重复查询 DOM

**文件**：`src/renderer/js/app.js` 第 437-469 行

**问题**：每次调用 `updateBorderContent()` 都执行 8 次 `document.getElementById()` 查询相同的 DOM 元素。

**解决方法**：
在 `DOMContentLoaded` 中缓存这些元素引用（部分已缓存，如 `customModel`、`fNumber` 等，但 `switchLogo`、`switchModel`、`switchParams`、`switchTime` 没有缓存）。

---

### OPT-03：Type E 拖动事件未清理

**文件**：`src/renderer/js/styles/type-e-preview.js` 第 82-84 行

**当前代码**：
```javascript
state.img.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag);
window.addEventListener('mouseup', endDrag);
```

**问题**：`mousemove` 和 `mouseup` 监听器添加在 `window` 上，但 `reset()` 中没有移除。切换样式时这些监听器会累积。

**解决方法**：
在 `reset()` 或专门的 `destroy()` 方法中移除：
```javascript
export function destroy() {
  if (state.img) {
    state.img.removeEventListener('mousedown', startDrag);
  }
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', endDrag);
}
```

---

### OPT-04：editor.js 只支持 Type A/B

**文件**：`src/renderer/js/components/editor.js`

**问题**：`editor.js` 的 `updateBorder()` 方法只处理 Type A 和 Type B 两种情况，不支持 Type C/D/E。`configureEditPanel` 只导入了 Type A 和 Type B 的面板配置。

**影响**：如果未来想使用 `editor.js` 组件，需要先扩展其支持范围。

**建议**：要么删除，要么补全对所有样式的支持。

---

## 🔵 未使用的模块（需要清理）

### UNUSED-04：exporter.js 中的 saveBlobToFile()

**文件**：`src/renderer/js/exporter.js` 第 136-152 行

**现状**：定义了通用的 Blob 保存函数，支持 Electron IPC 和浏览器降级。

**问题**：`app.js` 的 `exportImageHandler()` 中直接内联了保存逻辑（第 539-543 行），没有使用 `saveBlobToFile()`。

**建议**：在 `app.js` 中改用 `saveBlobToFile()`，减少重复代码。

---

### UNUSED-05：exif.js 中的未使用导出

**文件**：`src/renderer/js/exif.js`

| 导出 | 状态 |
|------|------|
| `getExifName` | 未使用 |
| `SUPPORTED_MAKES` | 未使用（从 logoList 获取） |
| `exifPrimaryKeys` | 未使用（仅定义） |
| `primaryExif` | 未使用（仅定义） |

**建议**：删除这些未使用的导出，减少包体积。

---

### UNUSED-06：logo-utils.js 中的未使用导出

**文件**：`src/renderer/js/logo-utils.js`

| 导出 | 状态 | 原因 |
|------|------|------|
| `logoSvgMap` | 未使用 | 改用真实 SVG 文件 |
| `getAutoLogoFilename` | 未使用 | 改用 CSS filter |
| `getMakeLogoPath` | 未使用 | 改用相对路径直接拼接 |
| `getMakeLogo` | 未使用 | 改用直接匹配 |

**建议**：删除这些函数和 `logoSvgMap` 对象（约 50 行）。

---

## 📋 修复优先级排序（仅活跃问题）

| 顺序 | 问题 | 影响 | 工作量 |
|------|------|------|--------|
| 1 | BUG-01+02: reload 方案 | 用户体验严重受损 | 小 |
| 2 | BUG-03: 缺少 resetForm | 浏览器环境表单残留 | 极小 |
| 3 | BUG-04: 内存泄漏 | 长时间使用内存增长 | 小 |
| 4 | OPT-03: 拖动事件未清理 | 事件监听器累积 | 小 |
| 5 | 清理 console.log | 性能+代码整洁 | 中（72处） |
| 6 | UNUSED-05: exif.js 未使用导出 | 代码整洁 | 极小 |
| 7 | UNUSED-06: logo-utils.js 未使用导出 | 代码整洁 | 小 |
| 8 | UNUSED-04: saveBlobToFile 未使用 | 代码整洁 | 极小 |
| 9 | OPT-02: DOM 查询缓存 | 性能优化 | 小 |
| 10 | OPT-04: editor.js 只支持 A/B | 未来扩展 | 低 |

---

---

# ⏸️ 搁置项

> 以下问题已确认为设计决策或暂时搁置，不影响当前版本的正常运行。

---

## ⏸️ 搁置的 Bug

### BUG-05：Type E resize 时执行完整重置导致闪烁 ⏸️ 暂时搁置

**状态**：暂时搁置，暂不修复。当前 resize 逻辑虽然不够优雅，但功能正确，不影响正常使用。

**文件**：`src/renderer/js/app.js` 第 372-395 行

**问题分析**：
Type E 的 `updateBorder()` 每次调用都执行完整重置，窗口 resize 时高频触发会导致内容闪烁、Logo 重新加载、拖动偏移量丢失。但功能结果正确。

**未来优化方向**：在 `type-e-preview.js` 中添加 `resize()` 方法，只更新尺寸不做重置。

---

## ⏸️ 搁置的优化

### OPT-01：resize 事件添加防抖 ⏸️ 暂不改进

**文件**：`src/renderer/js/app.js` 第 253 行

**问题**：窗口拖动时 resize 事件每秒可触发 60+ 次，每次都执行完整的布局计算和 DOM 更新。

**状态**：暂不改进。当前方案虽然不够优化，但功能正确且实际使用中窗口拖动频率不高，性能影响可接受。

---

### OPT-05：exif.js 动态加载 CDN 的 eval 安全风险 ⏸️ 暂不改进

**文件**：`src/renderer/js/exif.js` 第 24 行

**问题**：使用 `eval()` 执行从 CDN 下载的脚本存在 XSS 安全风险。

**状态**：暂不改进。CDN 加载仅在浏览器调试时使用，Electron 生产环境通过 `require('exifreader')` 加载，不受影响。

---

## ⏸️ 重复代码（设计决策，有意保留）

> **设计决策**：重复代码是有意为之，每个样式模块保持独立的工具函数实现，避免不同样式之间互相干扰和耦合。这是项目的核心设计原则之一。

### DUP-01：detectLogoBrightness() 重复 6 次 ⏸️

**分布**：`app.js`、`components/editor.js`、`styles/type-a/b/c/d/e-export.js`

### DUP-02：borderColorIsLight() 重复 5 次 ⏸️

**分布**：`styles/type-a/b/c/d/e-export.js`

### DUP-03：formatDateForDisplay() 重复 5 次 ⏸️

**分布**：`styles/type-a/b/c/d/e-export.js`

### DUP-04：dataURLtoBlob() 重复 6 次 ⏸️

**分布**：`exporter.js` + `styles/type-a/b/c/d-export.js`

---

## ⏸️ 搁置的未使用模块

### UNUSED-01：state.js — 状态管理模块未被引用 ⏸️ 暂时搁置

**文件**：`src/renderer/js/state.js`

**现状**：定义了完整的响应式状态管理 API，但 `app.js` 使用局部变量管理状态。保留以备未来扩展使用。

---

### UNUSED-02：events.js — 事件总线未被引用 ⏸️ 暂时搁置

**文件**：`src/renderer/js/events.js`

**现状**：定义了发布订阅机制和预定义事件常量。保留以备未来模块解耦使用。

---

### UNUSED-03：components/home.js 和 components/editor.js ⏸️ 暂时搁置

**文件**：`src/renderer/js/components/home.js`、`src/renderer/js/components/editor.js`

**现状**：封装了首页和编辑器视图逻辑，但 `app.js` 直接操作 DOM。保留以备未来架构升级使用。