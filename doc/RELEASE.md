# OneFrame v1.02 更新发布！

一款简洁优雅的图片边框添加工具，为您的照片自动添加精美的底部边框，并智能显示相机的 EXIF 信息。

## ✨ 新功能

### 🏷️ 首页分类标签
- 新增"参数"和"海报"两个标签页，快速筛选样式
- **参数**：Type A、Type C、Type D
- **海报**：Type B、Type E

### ℹ️ 关于弹框
- 标题栏新增"关于"按钮，点击查看应用信息、技术栈、致谢等

## 🐛 Bug 修复

- 修复样式切换后 UI 控件互相干扰（切换样式后开关状态错乱）
- 修复 Type E 的"原始比例"选项被永久删除问题
- 修复浏览器环境下重选图片时表单值残留
- 修复 URL.createObjectURL 内存泄漏
- 修复 Type E 拖动事件监听器未清理问题

## 🔧 优化

- 移除未使用的 `electron-store` 依赖
- 清理未使用的导出函数和调试日志

## 📝 文档

- 重写 DESIGN.md 与当前代码保持一致
- 文档整理到 doc/ 文件夹
- 创建 CODE_REVIEW.md 代码审查报告

## 📥 下载

下载 `OneFrame.exe` 即可直接运行。

## 🙏 致谢

本项目入选了 **Xiaomi MiMo Orbit-百万亿 Token 创造者激励计划**。感谢 **Xiaomi MiMo Orbit** 提供的免费 Token。

## 📄 许可证

MIT License