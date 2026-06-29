# OneFrame 代码审查报告

**日期**：2026-06-29  
**版本**：v1.1.0  
**审查范围**：src/renderer/ 目录下所有 JS/CSS/HTML 文件

---

## 一、逻辑错误

### 1.1 JSDoc 与函数签名不匹配（app.js）— ✅ 已修复

**状态**：✅ 已修复，JSDoc 已移除 `editorView` 参数描述。

### 1.2 loadImageInElectron 遗漏 applyDynamicBackground 调用（app.js）— ✅ 已修复

**状态**：✅ 已修复，在 `if (userImage.complete)` 分支中添加了 `applyDynamicBackground(userImage)`。

### 1.3 loadImageInElectron 重复设置 onload（app.js）— ✅ 已修复

**状态**：✅ 已修复，改为 `addEventListener('load', ..., { once: true })`，避免覆盖并自动清理。

### 1.4 checkImageOrientation 内存泄漏（app.js）— ✅ 已修复

**状态**：✅ 已修复，在 `onload` 和 `onerror` 回调中添加了 `URL.revokeObjectURL(src)`（仅对 blob URL）。

### 1.5 applyDynamicBackground CORS 风险（app.js）

**文件**：`src/renderer/js/app.js` 第 28-32 行  
**严重度**：低

```javascript
ctx.drawImage(img, 0, 0, 10, 10);
const imageData = ctx.getImageData(0, 0, 10, 10).data;
```

如果图片源是跨域的（如 `file://` 协议在某些环境下），`getImageData` 会抛出 `SecurityError`。当前有 `try/catch` 兜底，但可能导致控制台报错。

**修复**：已在 try/catch 中处理，无需额外修改。

---

## 二、代码质量优化

### 2.1 updateBorder() 巨型 if-else 链（app.js）— 暂不处理

**状态**：暂不优化，当前可正常工作，后续重构时再处理。

### 2.2 7 个独立的缓存变量（app.js）— 暂不处理

**状态**：暂不优化，当前可正常工作，后续重构时再处理。

### 2.3 showEditor 中重复的 configureTypeX 调用（app.js）— ✅ 已修复

**状态**：✅ 已修复，改为映射表 `panelConfigurers[currentStyle]?.()`。

### 2.4 detectLogoBrightness 全分辨率绘制（app.js）— ✅ 已修复

**状态**：✅ 已修复，canvas 尺寸改为 32×32，drawImage 自动缩放。

### 2.5 CSS 注释中的乱码（多个 CSS 文件）— 暂不处理

**状态**：低优先级，需要外部编码工具批量转换，后续处理。

---

## 三、架构优化建议

### 3.1 样式系统注册表 key 与文件名不一致 — 暂不处理

**状态**：当前命名规范（文件名大写、内部引用小写）是合理的设计决策，已在 `doc/AI_PROJECT_GUIDE.md` 中记录。后续可在代码注释中补充说明。

### 3.2 hideEditor 使用 location.reload()（已确认为设计意图）

**文件**：`src/renderer/js/app.js` 第 340 行

```javascript
location.reload();
```

**状态**：✅ 确认为专门的设计决策，用于彻底重置所有 DOM 状态，避免样式切换后 UI 互相干扰。无需修复。

### 3.3 编辑面板配置分散在 app.js 和各 editor-panel.js 中 — 已确认不存在

**状态**：✅ `type-B-editor-panel.js` 和 `type-E-editor-panel.js` 已存在。

---

## 四、总结

| 类别 | 数量 | 严重度 |
|------|------|--------|
| 逻辑错误 | 4 | 低-中 |
| 代码质量 | 5 | 低-中 |
| 架构优化 | 2 | 中 |

**优先修复**：
1. #1.2 `loadImageInElectron` 遗漏 `applyDynamicBackground` 调用
