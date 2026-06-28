# OneFrame v1.0.7 发布说明

**发布日期**：2026-06-28

---

## 🎉 新功能

### Type I 极简叠加文字样式
- 新增第九种边框样式，最大化照片展示面积，仅保留 Logo 和署名
- Logo 顶部居中，底部仅显示署名
- 署名默认值自动填入 "OneFrame"
- 纵向图片底部字号自动增大 50%
- 编辑面板仅显示 Logo 选择、署名、文字颜色

### Type J 署名+三栏参数行样式
- 新增第十种边框样式，不显示 Logo，署名替代 Logo 位置
- 参数行三栏布局：左栏机型（含厂商）、中栏参数（焦距/光圈/快门/ISO）、右栏时间
- 机型名称自动包含厂商前缀（如 "Sony A7M4"，与 Type F 相同逻辑）
- 署名与参数使用相同字号
- 纵向图片底部字号自动增大 50%
- 编辑面板仅显示署名和文字颜色，隐藏 Logo/边框/设备型号/所有开关

## 🐛 Bug 修复

- 修复 Type J 导出图像文字位置比预览更高的问题（预览用 CSS `bottom: 3%` 底部锚定，导出误用 15% 区域中心定位，改为底部锚定并对齐 line-height/gap 参数）
- 修复纵向图片预览时字号累乘的 bug（每次输入文字字号增大 1.5 倍，改为从 `frameWrapper` 宽度重新计算基准字号）
- 修复 `styles/index.js` 重复导出 `typeIPreview` 导致 SyntaxError

## 📝 文档

- 新增 `doc/V1.07_CHANGES.md` 详细修改记录
- 更新 `doc/CHANGELOG.md` 添加 v1.0.7 条目
- 更新 `doc/AI_PROJECT_GUIDE.md` 添加 Type H/I/J 样式说明和文件结构
- 更新 `README.md` 添加 Type I/J 样式说明，版本号更新至 v1.0.7

## 📦 构建

- `dist/OneFrame-1.0.7.exe` — Windows 便携版

---

**下载**：[dist/OneFrame-1.0.7.exe](./dist/OneFrame-1.0.7.exe)