# OneFrame v1.0.4 更新发布！

一款简洁优雅的图片边框添加工具，为您的照片自动添加精美的底部边框，并智能显示相机的 EXIF 信息。

## 🐛 Bug 修复

### 修复 Type F 预览缩放问题
- 修复窗口大小变化后图框与图片相对位置/比例关系错乱的问题
- 修复非初始窗口大小下导入图片时图框比例错误的问题
- 修复横向窗口变小时图框不缩放的问题
- 修复纵向窗口变大时图框只增大纵向高度的问题

**根因**：`calcSize()` 内部预览缩放与 `transform: scale()` 双重缩放 + `type-a.css` 通用选择器意外匹配 Type F 施加 CSS 约束。

**修复**：去掉 `transform: scale()`，改为每次 resize 动态计算显示尺寸；通过 `!important` 覆盖继承的 CSS 约束。

## 📝 文档更新

- 生成 doc/V1.04_CHANGES.md 详细修改说明
- 归档 doc/CODE_REVIEW.md → doc/CODE_REVIEW_2026-06-17.md
- 更新 doc/style_separation_analysis.md 添加 Type F 和 CSS 干扰分析
- 更新 doc/AI_PROJECT_GUIDE.md 添加 Type F 说明
- 更新所有文档版本号到 v1.0.4

## 📥 下载

下载 `OneFrame.exe` 即可直接运行。

## 🙏 致谢

本项目入选了 **Xiaomi MiMo Orbit-百万亿 Token 创造者激励计划**。感谢 **Xiaomi MiMo Orbit** 提供的免费 Token。

## 📄 许可证

MIT License