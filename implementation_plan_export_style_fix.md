# Implementation Plan: 修复导出图像边框文字样式与预览不一致问题

[Overview]
修复 OneFrame 项目中导出图片的边框文字样式（字号、字重、位置）与屏幕预览不一致的问题。

问题根源分析：
1. **焦距字重不一致**：CSS 定义为 font-weight: 600，但 app.js 的 updateBorderContent 中焦距使用 font-weight: 500
2. **字体加载未使用**：exporter.js 加载了 opentype 字体但绘制时未使用

[Types]
无类型系统变更。

[Files]
**需要修改的文件：**

1. `src/renderer/js/app.js`
   - 修改 `updateBorderContent` 函数中焦距的 fontWeight 从 '500' 改为 '600'
   - 修改 `updateBorderContent` 函数中参数的 fontWeight 从 'normal' 改为与 CSS 一致

2. `src/renderer/index.css`
   - 修改 `.border-focal-text` 的 font-weight 从 600 改为 500（与 app.js 一致）
   - 或保持 CSS 不变，修改 app.js 使用 600

[Functions]
**修改的函数：**

1. `app.js` - `updateBorderContent` 函数
   - 第 468 行：`borderFocal.style.fontWeight = '500';` → 改为 `'600'`
   - 理由：与 CSS 定义 `.border-focal-text { font-weight: 600 }` 保持一致

2. `exporter.js` - `drawText` 函数（可选优化）
   - 考虑使用 opentype 字体进行精确渲染
   - 当前使用 ctx.font 可能存在字体渲染差异

[Classes]
无类变更。

[Dependencies]
无依赖变更。

[Testing]
1. 导出测试：选择图片，调整边框参数，导出并检查文字样式
2. 对比测试：比较屏幕预览与导出图片的文字大小、字重、位置
3. 边界测试：不同尺寸图片、不同边框高度的导出效果

[Implementation Order]
1. 修改 app.js 中焦距的 fontWeight
2. 运行应用验证预览效果
3. 导出图片对比验证
4. 如需要，优化 exporter.js 的字体渲染

---

## 方案 F：优化现有 Canvas 方案（推荐）

基于 colorphoto 项目的成功经验，优化现有 Canvas 绘制方案。

### 问题根源
1. **焦距字重不一致**：app.js 使用 500，CSS 使用 600
2. **字体加载未使用**：opentype 字体已加载但未正确使用

### 修复步骤

**Step 1: 修改 app.js 第 468 行**
```javascript
// 修改前
borderFocal.style.fontWeight = '500';

// 修改后
borderFocal.style.fontWeight = '600';  // 与 CSS 和 exporter.js 一致
```

**Step 2: 验证 exporter.js 的字体设置**
确认 `drawText` 函数使用正确的 fontWeight：
- 机型：fontWeight = 600
- 参数：fontWeight = 'normal'
- 焦距：fontWeight = 600
- 署名：fontWeight = 600
- 时间：fontWeight = 'normal'

**Step 3: 验证 JPG 质量**
确认 `canvas.toDataURL('image/jpeg', quality)` 使用 `quality = 1.0`

### 优点
- ✅ 简单快速，只需修改 1 行代码
- ✅ 与 colorphoto 项目方案一致，经过验证
- ✅ 支持 MiSans 字体
- ✅ 可保持 JPG 最高质量

---

## 备选方案


### 方案 C：DOM-to-Canvas 截图（推荐）

**原理**：创建一个隐藏的 DOM 元素，完全使用 CSS 样式，然后使用 html2canvas 转为 Canvas。

**优点**：
- ✅ 完全复用 CSS 样式，预览和导出 100% 一致
- ✅ 无需手动同步样式代码
- ✅ 支持所有 CSS 特性

**实现方式**：
1. 安装 html2canvas 依赖
2. 在导出时克隆预览区域的 DOM 结构
3. 使用 html2canvas 截图
4. 保留原图 EXIF 信息嵌入

**需要修改的文件**：
- package.json: 添加 html2canvas 依赖
- exporter.js: 添加 html2canvas 截图逻辑

---

### 方案 D：使用 Puppeteer/Electron 截图

**原理**：在 Electron 中创建新的 BrowserWindow，渲染完整图片，截图输出。

**优点**：
- ✅ 原生浏览器渲染，100% 还原 CSS
- ✅ 可以处理复杂的 SVG 和字体

**需要修改的文件**：
- package.json: 添加 puppeteer-core 依赖
- main.js: 添加截图窗口创建逻辑
- preload.js: 添加截图 IPC 接口
- exporter.js: 调用主进程截图

---

### 方案 E：统一样式配置对象

**原理**：在单独的配置文件中定义所有样式值，app.js 和 exporter.js 都引用。

```javascript
// styles.config.js
export const borderStyles = {
  fontSize: 12,
  focalFontSize: 24,
  fontWeight: { model: 600, params: 'normal', focal: 500 },
  // ...
};
```

**优点**：简单直接，便于维护
**缺点**：仍需手动保持同步

**需要修改的文件**：
- 新建 src/renderer/js/styles.config.js
- app.js: 引用配置对象
- exporter.js: 引用配置对象
- index.css: 保持不变
