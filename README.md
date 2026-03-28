<div align="center">

# 元印 · MetaSeal

**为创作者而生的版权保护工具**

*Protect your art. Prove your ownership. Forever.*

[简体中文](#简体中文) | [English](#english)

---

![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey)
![License](https://img.shields.io/badge/license-Apache%202.0-blue)
![Version](https://img.shields.io/badge/version-0.1.14-green)
![Local First](https://img.shields.io/badge/100%25-本地运行-orange)

</div>

---

<a id="简体中文"></a>
## 你的作品，你说了算

你画了一张图，发到网上，被人截图盗用，被 AI 爬去训练，甚至有人反过来说那是他画的。
现在你有了一个武器。

**元印 (MetaSeal)** 做三件事：

1. **在你的作品里打上看不见的印记** — 即使被截图、压缩、裁剪，依然可以扫出你的名字
2. **让 AI 爬虫认不出你的画风** — 你的风格不会被 AI 拿去模仿或训练
3. **用比特币区块链给你的作品打上时间戳** — 全世界任何人都无法伪造"你先画的"这个事实

完全在本地运行。你的原图永远不会离开你的电脑。

---

## 功能一览

### 🖼️ 图片保护

将图片拖进软件，一键完成：

| 保护层 | 是什么 | 能防什么 |
|--------|--------|---------|
| **版权印记** | 嵌入肉眼看不见的署名信息 | 截图盗用、裁剪后仍可追溯 |
| **防 AI 抓取** | 在画面深层加入 AI 无法识别的干扰 | AI 模型无法提取你的画风或风格 |

两种保护可以叠加使用，也可以单独开启。支持一次处理多张图片。

### 📝 文字确权

把文章的 `.txt` / `.md` 文件拖进软件，文字内部会被植入看不见的署名标记。
小偷复制你的文章发到任何平台，把他的文字拖回软件，立刻扫出你的签名。

### 💻 代码保护

把源码文件拖进软件，自动在文件头部注入不可剥离的版权签章。
适合开发者保护私有逻辑或开源项目版权归属。支持 Rust、Python、JavaScript、TypeScript、Go、C/C++ 等。

### ⛓️ 区块链存证

- **时间戳证明** — 将作品指纹锚定至比特币区块链，10 分钟内生成不可伪造的时间证明。**完全免费，无需账号。**
- **永久存档** — 配合 Arweave 钱包，可将作品指纹永久存入去中心化网络（可选）。

### 🔍 查验真伪

把任何图片拖进"查验"页面，立刻知道：
- 这张图是否经过元印保护
- 印记是否完整，版权归属是否可验证
- 如何用区块链存证文件维权

### 📋 版权证书

每次保护完成后自动生成版权证书，包含：
- 文件唯一指纹
- 保护时间戳
- 区块链存证链接
- 可导出为 PDF，作为维权证据

---

## 快速上手

**第一步：设置保存目录**

启动软件 → 软件设置 → 选择一个**输出目录**（保护后的文件保存在这里）。

**第二步：保护你的作品**

切换到"图片保护"→ 将图片拖入中间区域，或点击选择文件（支持同时选择多张）。
处理完成后自动弹出版权证书。

**第三步：查验 / 维权**

如果怀疑某张图盗自你的作品：在"查验真伪"页面拖入那张图，立刻得到检测结果。

---

## 区块链存证怎么用？

开启"区块链时间戳存证"开关（不需要任何账号或付费）→ 保护完成后在输出目录自动生成 `.ots` 证明文件。

如需开启 **Arweave 永久存档**（可选），需要先安装 [ArConnect 钱包](https://www.arconnect.io/)（免费），然后在设置里导入密钥文件。
详细步骤见 [用户指南](docs/USER_GUIDE_zh.md)。

---

## 隐私与安全

- ✅ **100% 本地运行** — 所有处理都在你的电脑上完成，原图从不上传
- ✅ **无账号** — 不需要注册任何账号（除非你要用 Arweave 永久存档）
- ✅ **开源** — 代码完全公开，任何人可以审查

---

## 平台支持

| 系统 | 架构 | 支持情况 |
|------|------|---------|
| macOS | Apple Silicon (M1/M2/M3) | ✅ 完整支持 |
| macOS | Intel | ✅ 完整支持 |
| Windows | x64 | ✅ 完整支持 |

---

## 开发者：从源码构建

```bash
git clone https://github.com/dolan9644/MetaSeal.git
cd MetaSeal
cargo tauri build     # 构建安装包
# 或
cargo taiku dev       # 开发模式预览
```

需要：Rust 1.75+、Node.js 18+、Tauri CLI v2

---

---

<a id="english"></a>
## Your art, your proof, forever.

**MetaSeal** is a local-first desktop app that protects creators from AI scraping and establishes legally-usable proof of ownership — without any technical knowledge required.

### What it does

1. **Invisible watermark** — Embeds your identity into every pixel. Survives screenshots, compression, and cropping.
2. **Anti-AI shield** — Prevents AI scrapers from extracting your art style for training.
3. **Blockchain timestamp** — Anchors your work to the Bitcoin blockchain. The timestamp cannot be forged.

Everything runs locally. Your originals never leave your computer.

---

### Features

**🖼️ Image Protection**
Drop your image in. Choose your layers:
- *Invisible Watermark* — Authorship hidden inside the image, traceable even after heavy editing
- *Anti-AI Shield* — Disrupts AI style extraction at the pixel level

Both layers can be combined. Batch processing supported.

**📝 Text Protection**
Protects `.txt` / `.md` files with invisible signatures. Even after copy-paste across platforms, the signature travels with the text.

**💻 Code Protection**
Injects a cryptographic copyright signature into source file headers. Supports Rust, Python, JS, TS, Go, C/C++, and more.

**⛓️ Blockchain Timestamping**
Free, no account needed. Anchors your file fingerprint to the Bitcoin blockchain. Auto-generates a `.ots` proof file.

**🔍 Verify**
Drop any image into the Verify tab. Instantly see: is it watermarked? How to use the blockchain proof for a copyright claim?

**📋 Copyright Certificate**
Auto-generated after every protection. Contains file fingerprint, timestamp, and blockchain proof. Exportable as PDF for legal use.

---

### Quick Start

1. Set an output folder in Settings
2. Drop your files onto the protection zone
3. A certificate auto-appears after each successful protection
4. Use the Verify tab to check any suspicious image

---

### Build from Source

```bash
git clone https://github.com/dolan9644/MetaSeal.git
cd MetaSeal
cargo tauri build
```

Requires: Rust 1.75+, Node.js 18+, Tauri CLI v2

---

### License

**Apache License 2.0** · Copyright © 2026 xastle
