# 🌻 Sunflower 图片压缩小工具

基于TinyPNG API开发的图片质量压缩工具，支持多种图片格式的智能压缩，**当前最佳的图片压缩小工具**！友好且完全开源免费！

## ✨ 功能特点

- **超越官网限制**：支持JPG、PNG、WebP等多种图片格式压缩，支持批量图片处理；对比官网，支持 **超过5M** 的图片压缩！操作比官网网页版本更方便！
- **智能压缩**：使用TinyPNG API进行智能无损压缩，自动压缩到最佳质量，并且不损失显示效果
- **格式转换**：可自定义输出格式，轻松转换图片类型
- **简洁界面**：简洁直观的用户界面，mini级别的应用体积，适合在电脑上使用的最佳图片压缩工具！
- **跨平台支持**：支持Windows、macOS系统，一次安装随处使用
- **小技巧**：因为TinyPNG会自动压缩到最佳质量，如果你对压缩后的质量不满意，可以重复把**压缩后**的图片再上传压缩一次，直到满意为止。

## 📷 页面预览
![image](assets/image.png)

## 📥 下载安装

### 方式一：直接下载

访问[Releases页面](https://github.com/yourusername/sunflower-image-compressor/releases)下载最新版本的安装包：
- Windows用户：下载 `.exe` 安装文件
- macOS用户：下载 `.dmg` 安装文件

### 方式二：从源码构建

1. 确保已安装Node.js (建议版本14+)和npm
2. 克隆本项目
3. 运行 `npm install` 安装依赖
4. 运行 `npm start` 启动应用
5. 打包应用：
   - Windows: `npm run build:win`
   - macOS: `npm run build:mac`

## 🔑 API密钥获取

1. 访问[TinyPNG开发者页面](https://tinypng.com/developers)
2. 注册账号并申请API密钥（免费）
3. 每月有500次免费压缩额度
4. 在应用中输入获取的API密钥即可使用

## 📝 使用说明

1. **上传图片**：拖放图片到指定区域或点击选择文件
2. **设置压缩选项**：
   - 选择输出格式（保持原格式/JPG/PNG/WebP）
   - 输入TinyPNG API密钥
   - 选择输出目录
3. **开始压缩**：点击"开始压缩"按钮
4. **查看结果**：压缩完成后可查看预览并保存结果

## ❓ 常见问题

### 为什么需要API密钥？
Sunflower使用TinyPNG的API服务进行图片压缩，需要有效的API密钥才能工作。TinyPNG是目前最好的压缩工具，压缩效果最佳，轻便灵敏，但官网只能支持5M以内图片压缩，而我们的工具突破了这个限制，可以支持更大图片的压缩。

### 压缩后的图片质量会下降吗？
TinyPNG使用智能算法，可以在几乎不损失视觉质量的情况下大幅减小文件体积，是超级棒的压缩工具。

### 如何保存我的API密钥？
应用会自动保存您输入的API密钥到用户数据目录中的配置文件，无需每次手动输入。

### 免费版本有什么限制？
免费账户每月有500次压缩限制，大部分个人用户完全够用。如果需要更多次数，可以注册多个账号获取更多API密钥。

## 🔧 技术栈

- **Electron**: 跨平台桌面应用框架
- **Node.js**: JavaScript运行环境
- **TinyPNG API**: 图片压缩服务

## 🤝 贡献指南

欢迎提交问题报告和功能建议。如果您想贡献代码，请遵循以下步骤：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 📄 开源许可

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

## 📞 联系方式

如有问题或建议，请通过 GitHub Issues 与我们联系。

---

如果您觉得这个工具有帮助，请给项目点个⭐️，这是对我们最大的支持！
