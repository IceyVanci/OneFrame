# Implementation Plan

## [Overview]

基于 Type G 样式创建新的 Type N 样式，修改边框布局：底部白色边框高度减半，顶部新增与底部等高的白色边框（Logo 移入顶部），删除时间和机型显示，保留拍摄参数和署名。Type N 与 Type G 共享左右图框比例（92% 宽度，左右各 4%），但上下边框对称分配。

**Type G 当前布局（横向）：**
- 顶部：5% 白色留白
- 照片区：92% 宽 × 80% 高（top:5%, left:4%）
- 底部：15% 文字区（Logo + 日期|参数|机型 + 署名）

**Type N 目标布局（横向）：**
- 顶部：7.5% 白色边框（Logo 居中）
- 照片区：92% 宽 × 85% 高（top:7.5%, left:4%）
- 底部：7.5% 文字区（参数 + 署名，无日期、无机型）

**Type N 目标布局（纵向）：**
- 顶部：3.75% 白色边框（Logo 居中）
- 照片区：92% 宽 × 92.5% 高（top:3.75%, left:4%）
- 底部：3.75% 文字区（参数 + 署名）

## [Types]

Type N 的数据结构与 Type G 完全一致，不需要新增类型定义。所有 settings 传参复用现有结构，仅在预览/导出渲染时忽略 `dateTime`、`customModel` 字段。

## [Files]

### 新建文件（4 个）

1. **`src/renderer/css/type-N.css`** — Type N 的 CSS 样式
   - 基于 `type-G.css` 修改
   - `.frame-wrapper.type-n` 白色背景，block 布局
   - 照片区 `top: 7.5%`（横向）/ `top: 3.75%`（纵向，由 JS 覆盖）
   - `.border-content` 分为两部分：顶部 `.type-n-top`（Logo）+ 底部 `.type-n-bottom`（参数+署名）
   - 文字行样式 `.type-n-line`, `.type-n-line1`(参数), `.type-n-line2`(署名)

2. **`src/renderer/js/styles/type-N-preview.js`** — Type N 预览模块
   - 基于 `type-G-preview.js` 修改
   - `calcSize()`: 横向照片占 85%（canvasHeight = naturalHeight / 0.85），纵向占 92.5%（canvasHeight = naturalHeight / 0.925）
   - `updateFrameWrapper()`: 类名切换为 `type-n`
   - `updatePreview()`: 纵向图片覆盖 CSS top/height
   - `updateContentPreview()`:
     - 顶部区域：仅显示 Logo（居中）
     - 底部区域：仅显示参数行（日期 | 参数，无机型）+ 署名行
     - 布局使用绝对定位（与 Type G 一致）
   - `reset()`: 清理 type-n 类名

3. **`src/renderer/js/styles/type-N-export.js`** — Type N 导出渲染模块
   - 基于 `type-G-export.js` 修改
   - `renderImage()`: 画布高度 = naturalHeight / 0.85（横向）/ 0.925（纵向）
   - 照片区域：top 7.5%（横向）/ 3.75%（纵向），left 4%，width 92%，height 85%/92.5%
   - `drawBorderContent()`: 
     - 绘制顶部 Logo（居中于顶部 7.5% 区域）
     - 绘制底部参数行（f/xx xxmm xxs ISOxxxx，无日期、无机型）
     - 绘制底部署名行
   - 不绘制日期时间、不绘制机型名称

4. **`src/renderer/js/components/type-N-editor-panel.js`** — Type N 编辑面板配置
   - 基于 `type-G-editor-panel.js` 修改
   - 隐藏：边框颜色、边框高度、比例、时间开关及输入框、设备型号输入框
   - 显示：Logo 设置区域
   - 隐藏所有显示开关（与 Type G 一致，Type N 默认显示所有保留元素）

### 修改文件（5 个）

5. **`src/renderer/index.html`**
   - 在 `<head>` 中添加 `<link rel="stylesheet" href="css/type-N.css">`
   - 在样式卡片列表中添加 Type N 卡片（第 14 个，data-style="type-n"）

6. **`src/renderer/js/styles/index.js`**
   - 导入 `typeNPreview` 和 `typeNExport`
   - 在 `styles` 注册表中添加 `'type-n'` 条目
   - 重新导出 `typeNPreview`

7. **`src/renderer/js/exporter.js`**
   - 导入 `typeNExport`
   - 在 `exportStyles` 中添加 `'type-n': typeNExport`

8. **`src/renderer/js/app.js`**
   - 导入 `configureTypeN`
   - 添加 `typeNCachedSize` 变量
   - 在 `loadImageWithExif` 和 `loadImageInElectron` 中清除 `typeNCachedSize`
   - 在 `showEditor()` 的 `borderColorSection` 条件中添加 `type-n`
   - 在 `panelConfigurers` 中添加 `'type-n': configureTypeN`
   - 在 `updateBorder()` 中添加 `type-n` 分支（与 type-g 相同的缩放逻辑）

9. **`scripts/generate-manifest.js`**
   - 无需修改（自动扫描 Sample 目录，只要放置 Type N 示例图片即可）

## [Functions]

### 新建函数

**`src/renderer/js/styles/type-N-preview.js`:**
- `init(elements)` — 初始化 DOM 元素引用（与 Type G 相同结构）
- `calcSize(settings)` — 计算画布尺寸（横向 85%，纵向 92.5%）
- `updateFrameWrapper(squareSize, canvasHeight)` — 设置 frameWrapper 样式，类名切换为 type-n
- `updatePreview(squareSize, canvasHeight, imgDimensions)` — 重置图片样式，纵向覆盖 CSS
- `updateContentPreview(elements, settings)` — 渲染顶部 Logo + 底部参数+署名
- `reset()` — 清理 type-n 相关内联样式和类名

**`src/renderer/js/styles/type-N-export.js`:**
- `loadFonts()` — 加载 MiSans 字体（与 Type G 相同）
- `drawText(ctx, text, x, y, fontSize, options)` — 绘制文字（与 Type G 相同）
- `drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts, isPortrait)` — 绘制 Type N 边框内容（Logo 顶部居中 + 底部参数行 + 署名行）
- `drawLogoN(ctx, logoName, centerX, centerY, maxHeight)` — 绘制 Logo（与 drawLogoG 相同）
- `renderImage(img, options)` — 主渲染函数，绘制白色背景+照片+边框内容

**`src/renderer/js/components/type-N-editor-panel.js`:**
- `configureEditPanel()` — 配置编辑面板，隐藏不需要的控件

### 修改函数

**`src/renderer/js/app.js`:**
- `updateBorder()` — 添加 `else if (currentStyle === 'type-n')` 分支，使用与 type-g 相同的缩放逻辑（calcSize + 缓存 + displayScale）
- `loadImageWithExif()` — 添加 `typeNCachedSize = null`
- `loadImageInElectron()` — 添加 `typeNCachedSize = null`
- `showEditor()` — 在 borderColor 条件和 panelConfigurers 中添加 type-n

## [Classes]

无新增或修改类。Type N 使用与 Type G 相同的函数式模块模式（导出函数 + state 对象）。

## [Dependencies]

无新增依赖。Type N 复用现有依赖：
- opentype.js（字体渲染）
- MiSans 字体文件
- piexifjs（EXIF 处理）

## [Testing]

手动测试步骤：
1. 启动应用，确认 Type N 样式卡片出现在首页
2. 选择 Type N 样式并加载横向图片：
   - 确认顶部 7.5% 白色边框内 Logo 居中显示
   - 确认照片区域占 85% 高度，92% 宽度，左右各 4%
   - 确认底部 7.5% 区域显示参数（f/xx xxmm xxs ISOxxxx）和署名
   - 确认不显示日期时间和机型
3. 加载纵向图片：
   - 确认顶部 3.75% / 底部 3.75% / 照片 92.5% 布局正确
4. 测试 Logo 切换、参数编辑、署名编辑
5. 测试导出功能，确认导出图片布局与预览一致
6. 测试"换个模板"回到首页再重新选择 Type N

## [Implementation Order]

1. 创建 `src/renderer/css/type-N.css`
2. 创建 `src/renderer/js/styles/type-N-preview.js`
3. 创建 `src/renderer/js/styles/type-N-export.js`
4. 创建 `src/renderer/js/components/type-N-editor-panel.js`
5. 修改 `src/renderer/index.html`（添加 CSS 链接 + 样式卡片）
6. 修改 `src/renderer/js/styles/index.js`（注册 Type N）
7. 修改 `src/renderer/js/exporter.js`（注册 Type N 导出）
8. 修改 `src/renderer/js/app.js`（添加 Type N 分支逻辑）
9. 手动测试验证