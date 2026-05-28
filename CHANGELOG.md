# OneFrame 更新日志

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