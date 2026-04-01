# ⚛️ 元印 MetaSeal (v1.0.0)

> "The very last line of defense for a creator's digital sovereignty."
> **MetaSeal** 是一款以“极致克制”和“去中心化”为核心理念的物理级数字资产确权平台。它将频域盲水印、对抗噪声引擎与区块链凭证矩阵结合在了一个没有任何服务器依赖、无需联网即可运行的沙箱（Tauri + Rust）之内。

![MetaSeal Banner](https://github.com/Dolan9644/MetaSeal/raw/main/public/enso.png)

## 🎯 为什么我们需要 MetaSeal？

在生成式 AI 泛滥的时代，创作者面临着前所未有的被剥夺威慑：作品被肆意爬取“炼丹”（作为训练语料集垫图生图）、无损原图被随意盗用抹除版权。
**MetaSeal 就是你的个人防护装甲和法庭呈堂卷宗生成器。**

## ⚙️ 三重护盾体系 (The Tri-Shield Architecture)

### 1. 🛡️ T1: 频域盲水印 (DCT Invisible Watermark)
纯 Rust 的 2D 离散余弦变换（DCT）引擎，在极度隐蔽的高频段深深烙印您的 Author 信息与哈希溯源印记。
- **视觉无损**：绝对不会像传统工具一样改变您图片原本的调色曝光。
- **高存活率**：无论盗图者如何压缩、截图或重发，拖入我们的 **ScannerLab** 也能立刻解密出所有者的指纹。

### 2. ☢️ T2: AI 防爬毒化装甲 (Gradient Collapse Engine)
利用本地引入的 F-SAM + ONNX 专家级噪声算法，在人眼不可见的微小像素级打入对抗波动。
- **实战功效（即梦 Jimeng / SD 盲测）**：当他人试图把您的作品拉去即梦等 AI 端当“垫图”或训练集时，您图像内部隐藏的波动会让其 AI 神经网络发生梯度爆炸，最后只能生成出一堆诡异模糊的马赛克和废片！完美守护您的独家画风。

### 3. ⛓️ T3: OTS 时序与 Arweave 永久母盒 (Decentralized Vault)
我们淘汰了乱七八糟的保存机制。现在，即便您一键拖拽 100 张资产包，系统也会极其克制地在您的输出盘生成一个唯一的 `MetaSeal_Vault` 母盒空间。
在此母盒内，系统会同时发起：
- **OpenTimestamps (OTS)**：零成本打包写入比特币主网历史中，防篡改。
- **Arweave (可选)**：只要您填入 JWK，文件将物理意义地分块永存于全世界的去中心化节点。法庭上，反方律师甚至无法质疑这份时间戳的绝对真伪。

## 🚀 极简指南 (Quick Start)
1. 在 Github Release 页面下载最新的 `.dmg` 或 `.exe`。
2. 进入软件最底端的 **系统首选项 (Settings)**。
3. 挂载一个自己的输出文件夹，并填入自己合法的版权后缀声明（比如：*Artby Dolan*）。
4. 退回主页面，将图片、PDF文件甚至核心源码扔进去。
5. 当状态栏变绿即大功告成，法务原件已被收录进本地极密母盒！

---

[🇺🇸 English version ↓]

# ⚛️ MetaSeal (v1.0.0)

> "The absolute final layer of protection for creators."
> **MetaSeal** is a highly restrained, decentralized physical-grade digital asset provenance platform. Built atop Tauri and Rust, it fuses frequency-domain invisible watermarks, adversarial anti-crawling noise, and blockchain ledgers into an offline-first, zero-knowledge sanctuary. 

## 🎯 Why MetaSeal?

In an era of unchecked generative AI scraping, artists suffer from unauthorized style-transfer ("img2img" model feeding) and complete erasure of attribution.
**MetaSeal acts as your localized armor and automated legal-evidence generator.**

## ⚙️ The Tri-Shield Architecture

### 1. 🛡️ T1: DCT Invisible Watermarks
A pure-Rust 2D Discrete Cosine Transform engine embedding your authorship signature deep into the frequency domain.
- **Visually Lossless**: Zero perceptible degradation to your artwork's color grading or exposure.
- **Resilient**: Endures compression, deliberate cropping, and screenshotting. Drop any tampered image back into the **ScannerLab** to instantly decipher the encrypted creator fingerprint.

### 2. ☢️ T2: Gradient Collapse Engine (Anti-Crawling)
A robust on-device (ONNX) adversarial noise injection layer targeting AI perception.
- **Proven against Midjourney & Jimeng**: Through double-blind adversarial testing, whenever a malicious user attempts to use your protected piece as an `img2img` reference, the injected adversarial perturbations force neural networks into cascading gradient collapse—spitting out highly distorted, chaotic, or pixelated garbage instead of a coherent style clone.

### 3. ⛓️ T3: Decentralized `MetaSeal_Vault` Storage
No more messy desktops. Whether you drop one or hundreds of files simultaneously, the system securely routes everything into a unified `MetaSeal_Vault`.
Inside, your assets automatically trigger:
- **OpenTimestamps (OTS)**: Zero-cost, immutable timestamping onto the Bitcoin mainnet.
- **Arweave Permastorage (Optional)**: Automatically distributes an encrypted bundle to the global generic permaweb by simply inputting your JWK. Undeniable proof-of-existence in any international court of law.

## 🚀 Quick Start
1. Grab the latest `.dmg` or `.exe` release.
2. Navigate to **Settings**, specify your local designated Output Directory, and type in your authorship declaration (e.g., *Art by Dolan*).
3. Switch back to the dropzone and toss in images, texts, or raw source code.
4. Let the vault work in silence. Once the status bar turns green, your cryptographic bundle is safely stored in the `MetaSeal_Vault`.
