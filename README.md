# MetaSeal (元印) 🛡️

**Professional Digital Asset Provenance & Anti-AI Protection Suite**

MetaSeal is a high-performance, local-first desktop application designed for creators who require absolute control over their digital intellectual property. By combining frequency-domain steganography, adversarial machine learning, and decentralized ledger technology, MetaSeal provides a "cryptographic seal" for images, documents, and source code.

[English](#english) | [简体中文](#简体中文)

---

<a id="english"></a>
## 🌐 English

### 📘 Overview
MetaSeal addresses the growing challenges of digital copyright in the age of Generative AI. It allows creators to embed invisible, resilient ownership data into their files and anchor them to global blockchains, ensuring that provenance remains intact regardless of how the asset is distributed, compressed, or scraped.

### 🚀 Core Technologies & Implementation

#### 1. Image Protection: Multi-Layer Defense
*   **Invisible Watermarking (T1)**: Uses **Discrete Cosine Transform (DCT)** to embed ownership eigenvalues directly into the frequency domain of the image. This method is resilient against lossy compression (JPEG), resizing, and screenshots.
*   **Adversarial AI Shield (T2)**: Powered by an **ONNX-based Neural Engine**, it injects subliminal adversarial perturbations (noise) into the image. This "poisoning" prevents AI scrapers from accurately extracting style matrices or using the art for model training without causing structural degradation to the AI's output.

#### 2. Text Provenance: Zero-Width Steganography
*   **ZWSP Injection**: Embeds a unique cryptographic signature using **Zero-Width Space (ZWSP)** characters. These characters are invisible to the human eye and standard text editors but can be detected by the MetaSeal scanner, tracking the origin of text even after being copied and pasted across platforms.

#### 3. Source Code Integrity
*   **Cryptographic Signatures**: Automatically injects a UUID-based, Apache 2.0 compliant signature block into the header of source files. It supports multiple languages (Rust, Python, JS, etc.) by respecting specific comment syntaxes, ensuring legal ownership is declared at the file level.

#### 4. Decentralized Anchoring (Dweb)
*   **OpenTimestamps (OTS)**: Anchors a SHA-256 hash of the protected file to the **Bitcoin Blockchain**. This provides a trustless, zero-cost Proof of Existence (PoE) with a precise timestamp.
*   **Arweave Permaweb**: Optionally backups asset metadata and hashes to Arweave, ensuring that the record of your creation survives as long as the internet exists.

### 💻 Supported Platforms
| Platform | Architecture | Support Level | Features |
| :--- | :--- | :--- | :--- |
| **macOS** | Apple Silicon (M1/2/3) | **Native / Full** | All Engines + ONNX Accel |
| **macOS** | Intel (x86_64) | **Partial** | DCT Watermark + Text/Code (ONNX requires custom build) |
| **Windows** | x64/x86 | **Full** | All Engines + ONNX Runtime |

---

<a id="简体中文"></a>
## 🇨🇳 简体中文

### 📘 项目概述
**元印 (MetaSeal)** 是一款为创作者打造的专业级数字资产防护工具。在生成式 AI 时代，元印通过融合**频域隐写术**、**对抗性机器学习**与**去中心化账本技术**，为图片、文档、源码提供不可逆的“数字签名”。

### 🚀 技术实现方案

#### 1. 图像防护：多维防御矩阵
*   **隐藏水印 (T1 均衡档)**：采用 **离散余弦变换 (DCT)** 算法，将版权特征值植入图像的频域。该技术具备极强的抗攻击性，在经历高强度压缩（JPEG）、二次截图、比例裁剪后，仍能准确提取作者信息。
*   **AI 对抗盾阵 (T2 增强档)**：基于 **ONNX 本地神经网络引擎**，在图像中植入人眼不可察觉的对抗性扰动（Adversarial Perturbations）。这种“样本投毒”技术可以有效干扰爬虫 AI 的风格提取，防止您的绘画风格被 AI 无偿学习。

#### 2. 文字确权：零宽字符隐写
*   **ZWSP 注入**：利用**零宽字符 (Zero-Width Space)** 在文本流中嵌入加密署名。这些字符在常规编辑器中完全隐形，但在元印查验引擎下无所遁形。即使文字经由社交软件多次复制粘贴，其权属指纹依然存在。

#### 3. 源码保护： AST 注释签章
*   **密码学签名**：自动识别编程语言语境，并在文件头部植入符合 Apache 2.0 规范的 UUID 签章块。支持 Rust, Python, JavaScript, C++ 等主流语言，确保每一行代码都带有合法的著作权声明。

#### 4. 去中心化锚定 (区块链存证)
*   **OpenTimestamps (OTS)**：将受保护文件的 SHA-256 哈希值锚定至**比特币区块链**。利用工作量证明 (PoW) 提供具有法律效力的“存在性证明”，记录精确到秒的创作时间。
*   **Arweave 永久存储**：支持将资产指纹与元数据同步至 Arweave 永存网，实现真正的“一处保存，万年流传”。

### 💻 平台兼容性矩阵
| 操作系统 | 硬件架构 | 支持等级 | 核心功能 |
| :--- | :--- | :--- | :--- |
| **macOS** | Apple Silicon (M1/2/3) | **原生全功能** | 全防护引擎 + 硬件加速 |
| **macOS** | Intel (x86_64) | **标准级支持** | DCT 水印 + 文档/源码 (AI 增强引擎需手动编译) |
| **Windows** | x64/x86 | **全功能支持** | 全防护引擎 + ONNX 运行时 |

### 🛡️ 安全与隐私架构
*   **100% 本地化**：所有加密、哈希计算、AI 扰动生成均在您的电脑端侧完成。
*   **零数据离机**：MetaSeal 拒绝任何形式的云端上传，您的原件始终处于您的物理控制之下。

### 📄 License
**Apache License 2.0**.

**Copyright (c) 2026 xastle. All rights reserved.**

