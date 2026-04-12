# OneFrame 设计方案

## 项目概述

- **项目名称**: OneFrame
- **项目目标**: 为图片添加边框的桌面工具
- **技术框架**: Electron
- **交付形式**: 便携版单 exe 文件

---

## 技术栈

### 已确定方案

| 模块 | 技术方案 | 说明 |
|------|----------|------|
| **前端框架** | Electron + 原生 HTML/JS | 与 colorphoto 保持一致，无需构建工具 |
| **图片预览** | CSS 渲染 | 用 CSS 样式实现边框效果，实时预览 |
| **截图导出** | Puppeteer-core | 将 HTML 渲染为图片 |
| **EXIF 处理** | piexifjs | 保留原图 EXIF 信息和 JPG 质量 |
| **打包方式** | electron-builder (portable) | 单 exe 文件输出 |

### 参考项目

- **colorphoto** (`F:\colorphoto`): 使用原生 Electron + HTML/JS，已验证可行
- **copicseal** (`F:\copicseal`): CSS 边框渲染 + Puppeteer 截图方案

---

## 项目结构

```
OneFrame/
├── src/
│   ├── main/
│   │   ├── main.js           # Electron 主进程
│   │   └── capture.js        # Puppeteer 截图逻辑
│   ├── preload/
│   │   └── preload.js        # 安全桥接
│   ├── renderer/
│   │   ├── index.html        # 主页面
│   │   ├── index.css         # 样式
│   │   ├── js/
│   │   │   ├── app.js        # 主逻辑
│   │   │   ├── frame.js      # 边框处理
│   │   │   └── export.js     # 导出功能
│   │   └── assets/
│   │       └── piexif.js     # EXIF 处理
│   └── assets/               # 静态资源
├── package.json
├── electron-builder.json
└── README.md
```

---

## 核心功能

### 用户界面流程
```
┌─────────────────────────────────────────────────┐
│                  OneFrame                        │
│  ┌─────────────────────────────────────────────┐ │
│  │              边框样式图片墙                   │ │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ │ │
│  │  │ 样式1 │ │ 样式2 │ │ 样式3 │ │ 样式4 │ │ │
│  │  │[示例图]│ │[示例图]│ │[示例图]│ │[示例图]│ │ │
│  │  └───────┘ └───────┘ └───────┘ └───────┘ │ │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ │ │
│  │  │ 样式5 │ │ 样式6 │ │ 样式7 │ │ 样式8 │ │ │
│  │  │[示例图]│ │[示例图]│ │[示例图]│ │[示例图]│ │ │
│  │  └───────┘ └───────┘ └───────┘ └───────┘ │ │
│  └─────────────────────────────────────────────┘ │
│                                                    │
│  点击样式预览 → 弹出文件管理器 → 选择图片 → 进入编辑  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                  边框编辑页面                     │
│  ┌─────────────────────────────────────────────┐ │
│  │                  实时预览区                   │ │
│  │           ┌─────────────────┐               │ │
│  │           │   带边框的图片   │               │ │
│  │           │   (用户图片)     │               │ │
│  │           └─────────────────┘               │ │
│  └─────────────────────────────────────────────┘ │
│  ┌──────────────────┐  ┌──────────────────────┐  │
│  │   边框参数调整    │  │    操作按钮          │  │
│  │  - 颜色选择器     │  │  [导出图片]          │  │
│  │  - 宽度滑块       │  │  [返回图片墙]        │  │
│  │  - 阴影设置       │  │                      │  │
│  │  - 其他样式选项   │  │                      │  │
│  └──────────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 交互流程说明
1. **首页**：软件打开后显示边框样式图片墙，每种样式使用预设示例图片作为缩略图
2. **选择样式**：用户点击任意样式预览图
3. **导入图片**：弹出系统文件管理器，用户选择要处理的图片
4. **进入编辑**：图片加载后自动进入该样式的编辑页面
5. **调整参数**：在编辑页面调整边框参数（颜色、宽度、阴影等）
6. **导出保存**：点击导出按钮，保存带边框的图片
7. **返回首页**：点击返回按钮回到图片墙选择其他样式


### 待确定
- [ ] 边框样式类型（纯色、渐变、图案等）
- [ ] 边框参数配置选项
- [ ] 是否支持批量处理
- [ ] 其他功能需求

### 功能模块

#### 1. 首页 - 边框样式图片墙
- 以网格/瀑布流形式展示所有边框样式预览
- 每个样式卡片显示：
  - 边框样式缩略图（使用示例图片）
  - 样式名称/分类标签
- 点击进入对应样式的设计页面
- 支持滚动加载更多样式

#### 2. 设计页面 - 边框参数调整
- 左侧/上方：实时预览区
  - 拖拽/导入用户图片
  - 实时显示边框效果
- 右侧/下方：参数控制面板
  - 边框宽度
  - 边框颜色/渐变
  - 阴影效果
  - 圆角设置
  - 其他样式参数

#### 3. 导出功能
- 读取并保存原图 EXIF 信息
- CSS 渲染 + Puppeteer 截图
- 使用 piexifjs 写入 EXIF
- JPG 质量控制

### 技术实现要点

#### 边框渲染（参考 copicseal）
```html
<!-- 边框容器 -->
<div class="frame-container" :style="{
  '--border-width': '20px',
  '--border-color': '#fff',
  '--box-shadow': '0 0 10px rgba(0,0,0,0.5)',
  '--border-radius': '0'
}">
  <img :src="userImage">
</div>

<style>
.frame-container {
  padding: var(--border-width);
  background-color: var(--border-color);
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
}
.frame-container img {
  width: 100%;
  height: auto;
  display: block;
}
</style>
```

#### 截图导出（参考 copicseal/capture.ts）
```javascript
// 使用 puppeteer 截图
await page.screenshot({
  path: outputPath,
  type: 'jpeg',
  quality: 95  // JPG 质量控制
});

// 使用 piexifjs 写入 EXIF
piexif.insert(exifBytes, outputPath);
```

---

## 打包配置

参考 colorphoto 的 electron-builder 配置：

```json
{
  "build": {
    "appId": "com.oneframe.app",
    "productName": "OneFrame",
    "win": {
      "target": [
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ]
    },
    "portable": {
      "artifactName": "OneFrame.exe"
    }
  }
}
```

---

## 打包体积预估

- Electron 基础：~80MB
- Puppeteer-core：~20MB
- piexifjs：~50KB
- **总计：~100-120MB 单 exe**

---

## 开发计划

### 阶段一：项目初始化
1. 创建项目目录结构
2. 编写 package.json
3. 配置 electron-builder
4. 搭建 Electron 基础架构

### 阶段二：核心功能开发
1. 图片导入模块
2. 边框渲染模块
3. 截图导出模块

### 阶段三：UI 界面开发
1. 拖拽区域
2. 边框参数控制面板
3. 预览区域
4. 导出按钮

### 阶段四：测试与打包

---

## 边框样式定义

### ✅ 已确定的边框样式

**样式名称**: 白色下边框

**参数**:
- 边框位置: 图片下方
- 边框颜色: 白色 (#fff)
- 边框宽度: 图片短边的 10%

**CSS 实现**:
```css
.frame-container {
  background-color: #fff;
  padding-bottom: calc(图片短边 × 10%);
}
```

---

## 待讨论问题

- [ ] 批量处理需求
- [ ] 导出格式选项
- [ ] 其他边框样式需求

---

## 相关资源

- [Electron 官方文档](https://www.electronjs.org/)
- [electron-builder 文档](https://www.electron.build/)
- [piexifjs GitHub](https://github.com/hMatoba/piexifjs)
- [Puppeteer 文档](https://pptr.dev/)
