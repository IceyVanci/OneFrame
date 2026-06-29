# OneFrame 更新日志

## v1.1.0 (2026-06-29)

### ✨ 新功能

#### 编辑器动态背景色
- 导入图片后，编辑器预览区背景色自动根据图片主色调生成（提取平均 RGB 值 × 0.4 压暗）
- 替代原来的固定预设背景色 `#16213e`
- 每张图片会显示不同颜色的深色背景，与图片内容视觉协调
- 切换图片时背景色实时更新

### 📝 文档

- 新增 `doc/V1.10_CHANGES.md` 详细修改记录
- 版本号更新至 v1.1.0

---

## v1.0.9 (2026-06-29)

### ✨ 新功能

#### 主界面图片墙重构
- 主界面从单列纵向排列重构为 3 列瀑布流图片墙（CSS Columns 布局）
- 移除 `max-width: 1000px` 限制，图片墙铺满窗口
- 横向缩略图自动使用纵向空间，实现近似密铺效果
- 移除参数/海报分类标签栏

#### Type K/L 编辑面板改进
- Type K 和 Type L 编辑面板现在显示设备型号输入框，方便用户手动修改机型名称

#### 文件名大写化
- 48 个样式相关文件名从小写改为大写（如 `type-a.css` → `type-A.css`）
- CSS 类名和 `data-style` 属性保持小写不变

### 🐛 Bug 修复

- 修复 I/J/K/L 样式卡片的预览图（从 TypeH 改为各自专用图片）

### 📝 文档

- 新增 `doc/V1.09_CHANGES.md` 详细修改记录

---

## v1.0.8 (2026-06-29)

### ✨ 新功能

#### Type J 编辑面板改进
- Type J 编辑面板显示设备型号输入框，方便用户手动修改机型名称

#### Type K 左下角 Logo + 双行文字样式
- 新增第十一种边框样式，照片 100% 填满画布，底部左下角显示 Logo
- Logo 右侧第一行：署名（medium）+ 日期（normal）
- Logo 右侧第二行：机型名称（medium）+ 拍摄参数（normal）
- 机型名称不含厂商前缀
- 纵向图片底部字号自动增大 50%
- 编辑面板与 Type H 类似（显示 Logo 选择、署名、文字颜色）

#### Type L 高斯模糊背景样式
- 新增第十二种边框样式，基于 Type G 修改，白色外框替换为照片高斯模糊背景
- 照片高斯模糊铺满画布，中部 92%×80% 清晰照片居中
- 底部文字信息区使用白色文字（与 Type G 黑色不同）
- 预览端：CSS `filter: blur()` 动态创建模糊背景层，GPU 加速
- 导出端：Canvas `ctx.filter = 'blur()'` 两步绘制（blur 底层 + 清晰前景）
- 纵向图片自适应（照片占 90%，文字区域减半）
- 编辑面板与 Type G 类似（显示 Logo 选择、署名、文字颜色）

### 🐛 Bug 修复

- 修复 Type K 导出图像 Logo 纵向位置偏上（不在两行文字中间）
- 修复 Type K 导出/预览字重统一（署名/机型使用 medium，日期/参数使用 normal）

### 📝 文档

- 新增 `doc/V1.08_CHANGES.md` 详细修改记录
- 更新 `README.md` 添加 Type J/K/L 样式说明
- 更新 `doc/AI_PROJECT_GUIDE.md` 添加 Type J/K/L 样式说明和文件结构

---

## v1.0.7 (2026-06-28)

### ✨ 新功能

#### Type I 极简叠加文字样式
- 新增 Type I 样式：最大化照片展示面积，仅保留 Logo 和署名
- Logo 顶部居中，底部仅署名
- 署名默认值 "OneFrame"，纵向图片底部字号增大 50%

#### Type J 署名+三栏参数行样式
- 新增 Type J 样式：不显示 Logo，署名替代 Logo 位置
- 参数行三栏布局：左栏机型（含厂商）、中栏参数（焦距/光圈/快门/ISO）、右栏时间
- 机型名称自动包含厂商前缀（如 "Sony A7M4"）
- 署名与参数同字号，纵向图片底部字号增大 50%

### 🐛 Bug 修复

- 修复 Type J 导出图像文字位置比预览更高的问题（预览用 CSS `bottom: 3%` 底部锚定，导出误用 15% 区域中心定位）
- 修复纵向图片预览时字号累乘的 bug（每次输入文字字号增大 1.5 倍）
- 修复 `styles/index.js` 重复导出 `typeIPreview` 导致 SyntaxError

### 📝 文档

- 新增 doc/V1.07_CHANGES.md 详细修改记录
- 更新 doc/AI_PROJECT_GUIDE.md 添加 Type H/I/J 样式说明和文件结构
- 版本号更新至 v1.0.7

---

## v1.0.6 (2026-06-23)

### ✨ 新功能

#### Type H 全画幅叠加文字样式
- 新增 Type H 样式：照片 100% 填满画布，Logo 和文字叠加在照片底部
- 画布大小 = 图片原始大小，无额外白色区域
- 文字默认白色，支持黑/灰/白三种颜色选择

#### Type H 文字颜色选择
- Type H 编辑面板新增"文字颜色"选择区域（黑/灰/白）
- 默认白色文字，用户可根据照片背景自由切换
- 预览和导出同步应用用户选择的文字颜色

### 🔧 变更

- 文字颜色选择功能从 Type G 移至 Type H（Type G 白底黑字无需颜色选择）
- Type H 样式卡片使用专用预览图 `TypeH-sample_compressed.jpeg`
- 版本号更新至 v1.0.6

### 📝 文档

- 更新 doc/V1.06_CHANGES.md 追加文字颜色迁移说明
- 删除 README.md 项目结构部分（过时且维护成本高）
- 更新 doc/function_analysis.md 添加 Type H 相关文件和函数分析

---

## v1.0.5 (2026-06-19)

### ✨ 新功能

#### Type G 画中画样式
- 新增 Type G 边框样式：第一行显示厂商 Logo，第二行显示「拍摄日期 | 拍摄参数 | 相机名称」，第三行显示署名
- 纵向图片自适应：白色区域减半（顶部 2.5%，底部 7.5%），照片区域增大到 90%
- Logo 大小规则：横向图片高度 = 画布 2.5%，纵向图片高度 = 画布 1.25%
- 编辑面板：隐藏所有显示开关（所有元素默认显示），保留 Logo 选择区域
- 机型名称只显示型号（不带品牌前缀）
- 文字颜色统一为黑色

#### Type F 纵向图片自适应
- 纵向图片（高度 > 宽度）时，顶部/底部白色区域减半，照片区域增大到 90%

#### Type E 预览文字缩放
- CSS font-size 从 px 改为 em 单位，文字随画布大小自动缩放
- Logo 加载时从 borderContent 读取动态基准字号

### 🐛 Bug 修复

- 修复 Type G 预览 Logo 无法水平居中（CSS 后代选择器误匹配 → 子代选择器）
- 修复 Type G 导出未注册到 exporter.js（缺失 typeGExport 映射）
- 修复 Type G 编辑面板显示开关问题（默认激活所有开关）

### 📝 文档

- 新增 doc/V1.05_CHANGES.md 详细修改记录
- 新增 doc/TYPE_G_CENTERING_ANALYSIS.md Logo 居中问题分析报告
- 归档 doc/CODE_REVIEW_2026-06-17.md、DESIGN.md、EXIF_DESIGN.md、style_separation_analysis.md 到 doc/archive/
- 更新版本号到 v1.0.5

### 📦 其他

- 构建输出 dist/OneFrame.exe

---

## v1.0.4 (2026-06-19)

### 🐛 Bug 修复

#### 修复 Type F 预览缩放问题
- 修复窗口大小变化后图框与图片相对位置/比例关系错乱的问题
- 修复非初始窗口大小下导入图片时图框比例错误的问题
- 修复横向窗口变小时图框不缩放（只减小横向宽度）的问题
- 修复纵向窗口变大时图框只增大纵向高度、横向不跟随的问题

**根因**：两个独立问题
1. `calcSize()` 内部做了预览区域缩放（返回已缩小的像素值），与 `app.js` 的 `transform: scale()` 产生双重缩放
2. `type-a.css` 中 `.frame-wrapper:not(.type-b):not(.type-e)` 通用选择器意外匹配了 Type F，施加了 `max-width: 900px`、`width: 100%`、`max-height: 100%` 约束

**修复**：
- `type-f-preview.js` 的 `calcSize()` 移除预览缩放，只返回原始画布尺寸
- `app.js` 的 `updateBorder()` Type F 分支去掉 `transform: scale()`，改为每次 resize 动态计算显示尺寸
- `type-f.css` 添加 `max-width: none !important` 和 `max-height: none !important` 覆盖继承约束

### 📝 文档

- 生成 doc/V1.04_CHANGES.md 详细修改说明
- 归档 doc/CODE_REVIEW.md → doc/CODE_REVIEW_2026-06-17.md
- 更新 doc/style_separation_analysis.md 添加 Type F 和 CSS 干扰分析
- 更新 doc/AI_PROJECT_GUIDE.md 添加 Type F 说明
- 更新所有文档版本号到 v1.0.4

---

## v1.0.3 (2026-06-18)

### ✨ 新功能

#### Type F 画中画样式
- 新增 Type F 边框样式：上方 5% 白色留白 + 中部 92%×80% 照片展示区 + 下方 15% 文字信息区
- 文字区域使用绝对定位，署名不影响前两行位置
- 窗口缩放时使用 `transform: scale()` 保持宽高比
- 字号动态缩放（基准 900px 宽度对应 14px）
- 文字内容：第一行 "Shot on" + 品牌型号，第二行参数，第三行署名（可选）

#### Type F 编辑面板
- 隐藏边框颜色、边框高度、比例设置、Logo 区域
- 设备型号文本框自动包含品牌名（如 "Sony A7M4"）
- 拍摄参数开关控制焦距显示

### 🔧 优化

- 首页"参数"分类新增 Type F 卡片
- 更新 Type E 和 Type F 缩略图
- README.md 项目结构部分默认折叠

---

## v1.0.2 (2026-06-17)

### ✨ 新功能

#### 首页分类标签
- 添加"参数"和"海报"两个标签页，快速筛选样式
- 参数分类：Type A、Type C、Type D
- 海报分类：Type B、Type E

#### 关于弹框
- 标题栏新增"关于"按钮，点击查看应用信息

### 🐛 Bug 修复

- 修复样式切换后 UI 控件互相干扰（Type B 隐藏的开关在切换到 Type A 后仍然隐藏）
- 修复 Type E 的"原始比例"选项被永久删除问题
- 修复浏览器环境下重选图片时表单值残留
- 修复 URL.createObjectURL 内存泄漏
- 修复 Type E 拖动事件监听器未清理问题

### 🔧 优化

- 移除未使用的 `electron-store` 依赖
- 清理 exif.js 中未使用的导出（SUPPORTED_MAKES、primaryExif 等）
- 清理 logo-utils.js 中未使用的导出（logoSvgMap、getAutoLogoFilename 等）
- 清理 exporter.js 中未使用的 saveBlobToFile 函数
- 清理部分调试日志

### 📝 文档

- 重写 DESIGN.md，与当前代码保持一致
- 更新样式分离分析文档，添加 Type E 完整分析
- 致谢添加 Copicseal（可图匠）
- 创建 CODE_REVIEW.md 代码审查报告
- 文档整理到 doc/ 文件夹

---

## v1.01 (2026-05-28)

### ✨ 新功能

#### 首页分类标签
- 在样式卡片网格上方添加"参数"和"海报"两个标签页
- **参数分类**：Type A（白色下边框）、Type C（横向布局）、Type D（横向居中）
- **海报分类**：Type B（黑色下边框）、Type E（3:2 纵向）
- 默认显示"参数"分类，点击标签切换显示对应样式卡片

#### 关于弹框
- 在首页标题栏右侧添加"关于"按钮
- 点击后弹出模态框，显示应用信息：
  - 应用名称和版本号
  - 应用描述
  - GitHub 仓库链接
  - 技术栈信息（Electron 28、exifreader、piexifjs、opentype.js）
  - Xiaomi MiMo Orbit 致谢
  - MIT 许可证信息
- 支持点击关闭按钮或遮罩区域关闭弹框

### 🐛 Bug 修复

#### 窗口缩放预览错位修复
- **问题**：加载图片后调整窗口大小，边框内容（文字、Logo、边框高度等）不会跟随图片缩放，导致预览错位
- **原因**：预览布局使用 JS 计算固定像素值，窗口大小变化时 CSS 让图片自动缩放但 JS 值不更新
- **修复**：在编辑器打开时添加 `window.addEventListener('resize', updateBorder)` 监听器，窗口大小变化时重新计算所有布局参数；编辑器关闭时移除监听器避免内存泄漏
- **影响范围**：所有样式（Type A/B/C/D/E）均受影响

### 📝 文档更新

- **DESIGN.md**：全面重写，移除过时的 Puppeteer 截图方案描述，更新为当前实际的 Canvas 绘制方案，添加所有 5 种样式的详细说明和数据流图
- **style_separation_analysis.md**：添加 Type E 样式的完整分析（预览模块、导出模块、编辑面板配置、样式特性）
- **README.md**：在致谢部分添加 Copicseal（可图匠）致谢，部分代码逻辑来自 Copicseal
- **function_analysis.md**：确认 Type E 函数分析完整性
- **AI_PROJECT_GUIDE.md**：验证与代码一致性

### 🔧 依赖优化

- 移除未使用的 `electron-store` 依赖（减少 23 个包，减小打包体积）

### 📦 依赖变更

| 依赖 | 变更 | 说明 |
|------|------|------|
| `electron-store` | 移除 | 项目中未被任何文件引用 |

### 📁 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/renderer/index.html` | 修改 | 添加标签页、关于按钮、模态框 HTML，样式卡片添加 data-category 属性 |
| `src/renderer/index.css` | 修改 | 添加标签页、关于按钮、模态框样式 |
| `src/renderer/js/app.js` | 修改 | 添加标签切换逻辑、模态框交互、窗口 resize 监听 |
| `src/renderer/js/styles/type-e-preview.js` | 修改 | 移除独立的 resize 处理（改为 app.js 统一管理） |
| `package.json` | 修改 | 移除 electron-store 依赖 |
| `pnpm-lock.yaml` | 修改 | 自动更新（移除 electron-store 相关锁定） |
| `DESIGN.md` | 重写 | 全面更新为反映当前代码状态 |
| `style_separation_analysis.md` | 修改 | 添加 Type E 分析 |
| `README.md` | 修改 | 添加 Copicseal 致谢 |
| `CHANGELOG.md` | 新建 | 本文档 |
| `RELEASE.md` | 修改 | 更新为 v1.01 发布说明 |

---

## v1.00 (2026-05-25)

### 🎉 首次发布

#### 核心功能
- 5 种边框样式：Type A（白色下边框）、Type B（黑色下边框）、Type C（横向布局）、Type D（横向居中）、Type E（3:2 纵向）
- 智能 EXIF 读取：自动识别 24 家相机厂商 Logo，提取拍摄参数
- EXIF 保留：导出时自动保留原图 EXIF 信息
- 图片导出：Canvas 绘制，JPG 高质量输出
- 编辑面板：边框颜色/高度、Logo 选择、拍摄参数、时间、署名

#### 技术栈
- Electron 28 + 原生 HTML/CSS/JS
- exifreader（EXIF 读取）+ piexifjs（EXIF 写入）+ opentype.js（字体渲染）
- electron-builder 打包为 Windows 便携版单 exe