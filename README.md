# MetaSeal (元印) 🛡️

[English](#english) | [简体中文](#简体中文)

---

<a id="english"></a>
## 🌐 English

**MetaSeal** is a creator-centric, local-first minimalist desktop application designed for digital asset provenance, copyright protection, and anti-AI-scraping defense. Built with Tauri and Rust, it offers a seamless, high-performance, and secure offline environment to cryptographically seal your creative works.

### ✨ Core Features
1. **Multi-Modal Protection**: 
   - **Images**: Invisible Frequency Domain (DCT) Watermarking & ONNX Adversarial AI Shield (~420MB local engine).
   - **Text**: Zero-Width Steganography (ZWSP) injection for `.txt` and `.md` formats.
   - **Code**: Cryptographic AST comment signatures for developers.
2. **Decentralized Anchoring**: Instantly anchor asset hashes to the Blockchain via OpenTimestamps (OTS) and the Arweave Permaweb.
3. **Apple-Style Minimalism**: A Zen-inspired, highly polished user interface featuring strict native typography and distraction-free operation.
4. **Local-First Architecture**: 100% offline processing. Your assets never leave your machine during the encryption phase.

### 🏗️ Project Architecture
```text
MetaSeal/
├── src/                  # React Frontend (Apple-Style UI UI/UX)
│   ├── App.tsx           # Main Unified View (Images/Docs/Code/Scanner)
│   ├── App.css           # Custom CSS Variables & macOS Styling
│   └── components/       # Reusable UI Components
├── src-tauri/            # Rust Backend (High-Performance Core)
│   ├── src/
│   │   ├── main.rs       # Command Registration & Tauri Entry Point
│   │   ├── image_engine.rs # OpenCV DCT & Watermark Logic
│   │   ├── doc_engine.rs   # Zero-Width Steganography Injector
│   │   ├── code_engine.rs  # Cryptographic Code Signer
│   │   ├── t2_engine.rs    # AI Adversarial Noise Generator
│   │   └── model_manager.rs # ONNX Model Lifecycle & Allocation
│   └── Cargo.toml        # Rust Dependencies
```

### 🚀 Build & Run
**Prerequisites:** Node.js (v18+), Rust (1.70+), and OS-specific build tools (e.g., Xcode for macOS).
```bash
# Install Node dependencies
npm install

# Run in development mode
npm run tauri dev

# Compile for production
npm run tauri build
```

### ⚠️ Disclaimer
This software is provided "as is", without warranty of any kind. It is intended for technical exchange and personal creative protection only. The author shall not be held liable for any direct or indirect legal consequences arising from the use of this tool.

### 📄 License
This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for details.

---

**Copyright (c) 2026 xastle. All rights reserved.**

---

<a id="简体中文"></a>
## 🇨🇳 简体中文

**MetaSeal (元印)** 是一款以创作者为中心、本地优先的极简桌面应用程序，专为数字资产溯源、版权确权及防范 AI 恶意抓取而设计。基于 Tauri 与 Rust 构建，为您提供无缝、高性能且绝对安全的离线加密确权环境。

### ✨ 核心特性
1. **全通态版权保护矩阵**: 
   - **图像资产**: 基础频域离散余弦变换 (DCT) 盲水印机制，支持一键挂载 ONNX 对抗性 AI 盾阵引擎（~420MB 本地算力环境）。
   - **文档确权**: 针对纯文本流的零宽隐写术 (Zero-Width Steganography) 深度注入，抵抗跨平台复制抹除。
   - **源码保密**: 面向开发者的 AST 密码学散列头部签名自动植入。
2. **去中心化归档矩阵**: 支持将资产特征指纹一键锚定至 OpenTimestamps (比特币时间戳) 与 Arweave 永久存储引擎。
3. **“少即是多”的禅意美学**: 采用全面贴合 macOS System Settings 风格的 UI 设计，抛弃繁杂，专注于干净、克制的沉浸式创作流。
4. **完全本地化离线计算**: 拒绝云端窃取。从读取、哈希计算到加密生成，所有文件数据 100% 在本机闭环处理。

### 🏗️ 目录规范与架构
```text
MetaSeal/
├── src/                  # React 前端逻辑层 (Apple 极简风格 UI)
│   ├── App.tsx           # 全域主控视图 (图像/文档/编码/查验/历史)
│   ├── App.css           # 原生级响应式样式池与 CSS 变量引擎
│   └── components/       # 可复用组件 (如数字证书卡片)
├── src-tauri/            # Rust 核心引擎层 (高性能、低内存占用)
│   ├── src/
│   │   ├── main.rs       # Tauri 进程主入口与双向通讯命令桥
│   │   ├── image_engine.rs # OpenCV DCT 频域水印解算逻辑
│   │   ├── doc_engine.rs   # 零宽字符注入隔离机制核心
│   │   ├── code_engine.rs  # 密码学防篡改签名引擎
│   │   ├── t2_engine.rs    # AI 风格窃取对抗噪声引擎
│   │   └── model_manager.rs # ONNX 专家级运行库及系统卷分配器
│   └── Cargo.toml        # Rust 核心包依赖树
```

### 🚀 编译与开发向导
**基础前置环境:** Node.js (v18+), Rust (1.70+), 以及对应操作系统的原生编译链 (例如 macOS 需安装 Xcode Command Line Tools)。
```bash
# 获取并安装包含 Webview2 的前端依赖包
npm install

# 启动冷编译并拉起热重载开发调试台
npm run tauri dev

# 执行全量强类型校验并封装为系统原生安装包 (例如 .dmg / .exe / .AppImage)
npm run tauri build
```

### ⚠️ 免责声明
本软件按“原样”提供，不附带任何形式的保证。本工具仅供技术交流与创作者自我保护使用，作者不对由于使用本工具造成的任何直接或间接法律后果承担责任。

### 📄 开源协议说明
本项目遵循 **Apache License 2.0** 开源协议发行，允许商业使用、修改及分发。详见工程根目录下的 [LICENSE](LICENSE) 文档。

---

**Copyright (c) 2026 xastle. All rights reserved.**
