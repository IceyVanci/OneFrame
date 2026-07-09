# OneFrame v1.1.5 发布说明

**发布日期**：2026-07-09

---

## ✨ 新功能

### Type N 上下对称边框样式
- 新增第十四种边框样式，基于 Type G 修改
- 上下对称白色边框：顶部 Logo 居中，中部照片区，底部参数+署名
- 横向图片：顶部 7.5% + 照片 85% + 底部 7.5%
- 纵向图片：顶部 3.75% + 照片 92.5% + 底部 3.75%
- 删除时间和机型显示，保留拍摄参数和署名
- 参数格式改为英文标签风格：`Aperture f/1.8  Focal 50mm  Shutter 1/100s  ISO 100`
- 混合字重：标签 MiSans Medium (500)，数值 MiSans Normal (400)
- 署名固定在参数行下方，不随有无署名影响参数位置

## 📝 文档

- 新增 `doc/V1.15_CHANGES.md` 详细修改记录
- 更新 `README.md` 添加 Type N 样式说明
- 版本号更新至 v1.1.5

## 📦 构建

- `dist/OneFrame-1.1.5.exe` — Windows 便携版

---

**下载**：[dist/OneFrame-1.1.5.exe](./dist/OneFrame-1.1.5.exe)

---

# OneFrame v1.1.4 发布说明

**发布日期**：2026-07-03

---

## ⚡ 性能优化

### Manifest 清单法优化首页缩略图
- 新增 `sample-manifest.json` 静态清单文件，替代暴力探测（2,574→1 次请求）
- 首页样式卡片 `<img>` 改为透明 GIF 占位符 + `data-fallback-src`，消除页面加载闪烁
- 重写 `thumbnail-selector.js`（287→195 行），三级回退策略：manifest 清单 → IPC 文件列表 → data-fallback-src
- 新增 `get-sample-manifest` IPC 端点和 `getSampleManifest` API

### 自动更新 manifest
- 新增 `scripts/generate-manifest.js` 自动扫描脚本，有变化才写入
- 集成到 `dev` 和 `build` 命令，每次开发/打包时自动更新

---

## 📚 详细文档

详见 `doc/V1.14_CHANGES.md`

---

# OneFrame v1.1.3 发布说明

**发布日期**：2026-07-02

---

## 🎉 新功能

### 首页缩略图随机选择
- 新增首页缩略图随机选择机制，每次页面加载时 13 个样式卡片从 `Sample/` 目录中随机选择不同 ID 的缩略图
- 使用 Fisher-Yates 洗牌算法和全局去重分配，确保同屏不同样式不使用相同原始图片
- 新增 `src/renderer/js/thumbnail-selector.js` 缩略图选择器模块

### Electron IPC 文件列表读取
- 新增 `get-sample-files` IPC 端点，主进程直接读取 `Sample/` 目录文件列表
- 渲染端根据实际文件列表筛选候选，避免逐个探测（13 × 99 → 34 次匹配）
- 浏览器环境回退到 Image 对象探测模式

## 🐛 Bug 修复

- 修复首页样式卡片 `<img src>` 指向不存在的根目录文件导致全部 404 的问题
- 修复 `checkFileExists()` 使用 `fetch()` 在 Electron `file://` 协议下无法探测本地文件的问题（改用 Image 对象）
- 修复 `buildStyleThumbnailMeta()` 回退路径缺少 `Sample/` 前缀的问题
- 修复首页样式卡片图片下方出现多余白色边框区域（移除首页 photo-footer 元素）
- 修复 Type E 预览拖动边界、导出偏移方向、重选图片 EXIF 刷新问题

## 📝 文档

- 新增 `doc/V1.13_CHANGES.md` 详细修改记录
- 新增 `doc/V1.12_CHANGES.md` Type E 修复详细记录
- 版本号更新至 v1.1.3

---

# OneFrame v1.1.0 发布说明

**发布日期**：2026-06-30

---

## 🎉 新功能

### Type M 模糊边框+顶部Logo+底部文字样式
- 新增第十三种边框样式，照片 90%×90% 居中，四条边等高高斯模糊背景（各 5%）
- 顶部 Logo（和样式 J 一样），底部署名+参数行三栏（和样式 J 一样）
- 导入图像应用 12px 圆角
- 导出端文字位置基于照片区域计算，确保预览与导出一致

### 样式 B/F/G/L/M 图片圆角
- 为样式 B、F、G、L、M 的图片添加 12px 圆角
- 预览端使用 CSS `border-radius: 12px`
- 导出端使用 Canvas `roundRect()` + `clip()` 裁剪，圆角半径按画布宽度比例缩放

### Type I 极简叠加文字样式
- Logo 顶部居中，底部仅显示署名
- 纵向图片底部字号自动增大 50%

### Type J 署名+三栏参数行样式
- 参数行三栏布局：左栏机型、中栏参数、右栏时间
- 机型名称自动包含厂商前缀

## 🐛 Bug 修复

- 修复 Type L 导出模糊背景缩放不一致（添加 1.5x 缩放，与预览端 CSS `transform: scale(1.5)` 一致）
- 修复样式 M 导出端文字位置偏移（基于照片区域而非画布计算）
- 修复样式 M 预览缩放错误（使用与 Type I 相同的缩放逻辑）
- 修复纵向图片预览时字号累乘的 bug

## ✨ 优化

### 关于界面调整
- 删除"技术栈"行，GitHub 改为文本超链接
- 添加 Bilibili、Instagram 链接
- 链接点击后从系统默认浏览器打开（非 Electron 窗口内导航）

## 📝 文档

- 新增 `doc/V1.11_CHANGES.md` 详细修改记录
- 更新 `README.md` 版本号至 v1.1.0

## 📦 构建

- `dist/OneFrame-1.1.0.exe` — Windows 便携版

---

**下载**：[dist/OneFrame-1.1.0.exe](./dist/OneFrame-1.1.0.exe)