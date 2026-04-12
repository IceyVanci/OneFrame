# Type A - 白色下边框边框样式

## 边框尺寸

- **边框宽度**：图片宽度（100%）
- **边框高度**：图片短边 × 12%
- **边框颜色**：#FFFFFF（白色）

## 元素布局

基于1920px基准图像宽度和115px基准边框高度计算：

### 水平位置（相对于边框左侧）

| 元素 | 百分比 | 说明 |
|------|--------|------|
| logo-alpha | 2.3% | α标志 |
| camera-info | 35.4% | 机型和参数 |
| focal-length | 49.5% | 焦距 |
| author-name | 98.4% | 署名（距右侧1.6%） |

### 垂直位置（相对于边框顶部）

| 元素 | 百分比 | 说明 |
|------|--------|------|
| logo-alpha | 30.4% | α标志 |
| camera-model | 17.4% | 机型名称 |
| camera-settings | 43.5% | 光圈、快门、ISO |
| focal-length | 13% | 焦距 |
| author-name | 73.9% | 署名（距顶部） |

## CSS样式

```css
.photo-footer {
  height: /* 边框高度 = 图片短边 × 12% */;
  background: #FFFFFF;
  position: relative;
}

.logo-alpha {
  position: absolute;
  left: 2.3%;
  top: 30.4%;
  font-weight: bold;
  font-size: /* 根据边框高度自适应 */;
}

.camera-info {
  position: absolute;
  left: 35.4%;
  display: flex;
  flex-direction: column;
}

.camera-model {
  font-weight: bold;
  top: 17.4%;
}

.camera-settings {
  color: #555;
  top: 43.5%;
}

.focal-length {
  position: absolute;
  left: 49.5%;
  top: 13%;
}

.author-name {
  position: absolute;
  right: 1.6%;
  bottom: 26.1%;
}
```

## 显示内容

白框内显示以下信息：
- **Logo**：α 标志
- **机型**：相机型号
- **参数**：光圈值、快门速度、ISO感光度
- **焦距**：镜头焦距
- **署名**：摄影师名称
- **时间**：拍摄日期（可选）
