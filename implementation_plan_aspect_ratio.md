# Implementation Plan: 原始比例模式 ✅ 已完成

[Overview]
为 OneFrame 添加"添加边框（原尺寸）"比例输出选项。选择该选项时，输出图片的分辨率与原始图片相同，通过在图片上下各裁剪边框高度一半的方式来实现无边框效果，同时保留底部边框信息。

## 需求说明

**当前行为（默认模式 - border）:**
- 输出尺寸: `img.naturalWidth × img.naturalHeight` (与原图相同)
- 从原图顶部和底部各裁剪 `borderHeight / 2` 像素
- 保留底部边框，边框内容位置和大小不变

**其他比例模式:**
- 输出尺寸: `img.naturalWidth × (img.naturalHeight + borderHeight)`
- 图片完整保留，在底部添加边框

## 实现状态

✅ 已完成所有修改

[Types]

**新增设置:**
```javascript
// settings 中新增字段
aspectRatio: 'original' | '1:1' | '4:3' | '3:2' | '16:9'
```

**导出逻辑:**
```javascript
// 原始模式
if (aspectRatio === 'original') {
  // 裁剪原图: 顶部裁剪 half，底部裁剪 half
  const cropTop = borderHeight / 2;
  const cropBottom = borderHeight / 2;
  const croppedHeight = img.naturalHeight - borderHeight;
  // 绘制裁剪后的图片
  ctx.drawImage(img, 0, cropTop, img.naturalWidth, croppedHeight, 0, 0, img.naturalWidth, croppedHeight);
  // 在底部绘制边框
  ctx.fillRect(0, croppedHeight, img.naturalWidth, borderHeight);
  // 边框内容绘制位置需要调整
}
```

[Files]

### Modified Files

1. **src/renderer/index.html**
   - 修改比例选择器的第一个选项文本为"原始比例"
   - 确保默认选中"原始比例"

2. **src/renderer/js/app.js**
   - 在 `getEditSettings()` 中确保传递 `aspectRatio` 设置
   - 预览时需要处理原始比例模式的显示（可选）

3. **src/renderer/js/exporter.js**
   - 修改 `exportImage()` 函数，添加原始比例模式逻辑
   - 在 `drawBorderContent()` 中处理绘制区域的调整

4. **src/renderer/index.css**
   - 添加原始比例模式的预览样式（如需要）

[Functions]

### Modified Functions

1. **`exportImage()` in exporter.js**
   - 修改参数解构，添加 `aspectRatio`
   - 添加原始比例模式的画布计算逻辑
   - 修改图片绘制部分，支持裁剪模式
   - 修改边框绘制位置

2. **`drawBorderContent()` in exporter.js**
   - 添加参数接收图片绘制区域信息
   - 调整边框内容的绘制 Y 坐标（当使用裁剪模式时）

[Implementation Order]

✅ 1. 修改 index.html - 比例选项改为"添加边框（原尺寸）"并设为默认
✅ 2. 修改 exporter.js - 添加 border 模式导出逻辑
✅ 3. 更新 app.js - aspectRatio 默认值改为 'border'
✅ 4. 已完成实现
