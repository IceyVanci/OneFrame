# Implementation Plan - 编辑面板完善

## [Overview]
完善OneFrame编辑面板，实现EXIF自动读取、Logo匹配选择、边框颜色预设、拍摄参数独立输入、时间编辑等功能。

## [Tasks]

### 1. 复制Logo SVG文件
- 创建 `src/renderer/logos/` 目录
- 从 `F:\copicseal-copy\src\renderer\src\assets\logos\` 复制所有SVG文件
- 支持25+厂商：Apple, Canon, DJI, Fujifilm, Google, GoPro, Hasselblad, Huawei, Insta360, Leica, Lumix, Nikon, Nokia, Olympus, Oneplus, OPPO, Pentax, Ricoh, Samsung, Sigma, Sony, Vivo, Xiaomi等

### 2. 完善exif.js
- 移植 `getMakeName()` 函数（标准化厂商名称）
- 移植 `SUPPORTED_MAKES` 列表
- 优化日期时间格式化

### 3. 完善logo-utils.js
- 实现 `getMakeName(exif)` 函数
- 实现 `getMakeLogo(exif)` 函数（根据EXIF获取Logo）
- 实现 `getMakeLogoSvg(exif)` 函数（获取内联SVG）
- 完善 `logoMap` 映射

### 4. 重构HTML编辑面板
**边框分区：**
- 添加白色/黑色预设按钮
- 自定义颜色选择器

**Logo分区：**
- 厂商Logo下拉选择器（显示所有支持厂商）
- Logo预览区域

**拍摄参数分区：**
- 光圈输入框
- 快门输入框
- 焦距输入框
- ISO输入框

**时间分区：**
- 日期时间显示
- 日期时间修改输入框

### 5. 更新CSS样式
- 预设按钮样式
- Logo选择器样式
- 输入框统一样式

### 6. 更新app.js逻辑
- 加载图片时自动读取EXIF
- 自动填充编辑面板
- Logo自动匹配显示
- 设置保存和读取

## [Files]
- `src/renderer/logos/*.svg` - 新增
- `src/renderer/js/exif.js` - 修改
- `src/renderer/js/logo-utils.js` - 修改
- `src/renderer/index.html` - 修改
- `src/renderer/index.css` - 修改
- `src/renderer/js/app.js` - 修改
