# Implementation Plan

[Overview]
修改 Type G 样式的预览和导出逻辑，使其与 Type F 有明确差异。主要变更：第一行显示厂商 Logo（替代文字），第二行使用与第一行相同的字号显示三部分信息（拍摄日期 | 拍摄参数 | 相机名称），编辑面板恢复 Logo 选项。

[Types]
无类型系统变更。

[Files]
修改 4 个文件：

**文件 1：`src/renderer/css/type-g.css`**
- 修改 `.type-g-line1` 样式（第一行改为 Logo 容器）
- 添加 `.type-g-logo` 样式
- 修改 `.type-g-line2` 样式（添加竖线分隔符样式）
- 添加 `.type-g-separator` 样式

**文件 2：`src/renderer/js/styles/type-g-preview.js`**
- `updateContentPreview()` — 第一行改为显示 Logo，第二行改为三部分竖线分隔
- Logo 大小计算：height = baseFontSize × 1.2，width 按比例，maxWidth = canvasWidth × 0.15

**文件 3：`src/renderer/js/styles/type-g-export.js`**
- `drawBorderContent()` — 第一行绘制 Logo，第二行绘制三部分文字
- Logo 绘制：height = line1FontSize × 1.2，maxWidth = canvasWidth × 0.15

**文件 4：`src/renderer/js/components/type-g-editor-panel.js`**
- 恢复 Logo 选项显示（移除隐藏 Logo 区域和 Logo 开关的代码）
- 保持其他隐藏（边框颜色、边框高度、比例设置）

[Functions]
修改 2 个函数中的内容生成逻辑。

**函数 1：`updateContentPreview(elements, settings)` — `type-g-preview.js`**

修改第一行（从文字改为 Logo）：
```javascript
// 第一行：显示厂商 Logo
let line1Html = '';
if (selectedLogo && showLogo) {
  line1Html = `<div class="type-g-logo"><img src="logos/${selectedLogo}.svg" alt="${selectedLogo}"></div>`;
}
```

修改第二行（三部分竖线分隔）：
```javascript
// 第二行：拍摄日期 | 拍摄参数 | 相机名称
const line2Parts = [];
if (dateTime && showTime) {
  const dt = new Date(dateTime);
  line2Parts.push(`${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`);
}
const paramParts = [];
if (showParams && fNumber) paramParts.push(`f/${fNumber}`);
if (showParams && focalLength) paramParts.push(`${String(focalLength).replace(/mm$/i, '')}mm`);
if (showParams && exposureTime) paramParts.push(`${exposureTime}s`);
if (showParams && iso) paramParts.push(`ISO${iso}`);
if (paramParts.length > 0) line2Parts.push(paramParts.join(' '));
if (showModel && customModel) line2Parts.push(customModel);
const line2Html = line2Parts.join(' <span class="type-g-separator">|</span> ');
```

Logo 大小计算（Type D 规则）：
```javascript
// Logo 大小：高度 = baseFontSize × 1.2，宽度按比例，最大宽度 = 画布宽度 × 15%
const logoHeight = baseFontSize * 1.2;
// Logo 图片加载后通过 onload 设置实际尺寸
```

**函数 2：`drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts, isPortrait)` — `type-g-export.js`**

修改第一行（绘制 Logo）：
```javascript
// 第一行：绘制厂商 Logo
if (settings.selectedLogo && settings.showLogo) {
  const logoHeight = line1FontSize * 1.2;
  const maxLogoWidth = canvasWidth * 0.15;
  await drawLogo(ctx, settings.selectedLogo, centerX, line1Y, logoHeight, maxLogoWidth);
}
```

修改第二行（三部分竖线分隔）：
```javascript
// 第二行：拍摄日期 | 拍摄参数 | 相机名称
const line2Parts = [];
if (settings.dateTime && settings.showTime) {
  line2Parts.push(formatDateForDisplay(settings.dateTime));
}
const paramParts = [];
if (settings.showParams && settings.fNumber) paramParts.push(`f/${settings.fNumber}`);
if (settings.showParams && settings.focalLength) paramParts.push(`${String(settings.focalLength).replace(/mm$/i, '')}mm`);
if (settings.showParams && settings.exposureTime) paramParts.push(`${settings.exposureTime}s`);
if (settings.showParams && settings.iso) paramParts.push(`ISO${settings.iso}`);
if (paramParts.length > 0) line2Parts.push(paramParts.join(' '));
if (settings.showModel && settings.customModel) line2Parts.push(settings.customModel);
const line2Text = line2Parts.join(' | ');
```

新增 `drawLogo()` 函数（从 Type D 复制，调整参数）：
```javascript
async function drawLogo(ctx, logoName, centerX, y, maxHeight, maxWidth) {
  // 加载 Logo 图片
  // 计算缩放后的宽高（保持比例，不超过 maxWidth 和 maxHeight）
  // 居中绘制
}
```

[Classes]
无类变更。

[Dependencies]
无依赖变更。

[Testing]
1. 导入图片到 Type G，确认第一行显示 Logo
2. 确认第二行显示"日期 | 参数 | 相机名称"格式
3. 确认第三行署名正常
4. 确认编辑面板显示 Logo 选择区域
5. 导出图片，确认与预览一致
6. 切换到其他样式，确认不受影响

[Implementation Order]
1. 修改 `type-g-editor-panel.js`（恢复 Logo 选项显示）
2. 修改 `type-g.css`（添加 Logo 和分隔符样式）
3. 修改 `type-g-preview.js`（第一行 Logo + 第二行三部分）
4. 修改 `type-g-export.js`（第一行绘制 Logo + 第二行三部分）
5. 启动应用验证