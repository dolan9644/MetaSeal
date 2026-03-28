import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";
import Certificate from "./components/Certificate";

// --- Localization ---
const translations = {
  "zh-CN": {
    brand: "元印 MetaSeal",
    nav_images: "图片保护",
    nav_text: "文字确权",
    nav_code: "代码安全",
    nav_scanner: "查验真伪",
    nav_history: "保护记录",
    nav_settings: "软件设置",
    drop_hint: "点击或拖拽文件到这里开始保护",
    drop_hint_multi: "支持同时选择多个文件",
    execute_btn: "开始保护",
    processing: "正在处理中，请稍候...",
    settings_title: "软件设置",
    settings_header_general: "常规设置",
    settings_header_identity: "创作者信息",
    settings_header_paths: "存储位置",
    settings_lang: "显示语言",
    settings_theme: "界面主题",
    settings_author: "作者全名",
    settings_author_name: "用于水印的署名",
    settings_copyright: "额外版权声明",
    settings_paths: "文件保存路径",
    settings_source: "默认读取目录",
    settings_output: "默认输出目录",
    settings_choose: "选择目录",
    settings_format: "输出格式",
    format_original: "保持原格式",
    onboarding_desc: "由于 MetaSeal 是完全本地运行的，您的原图不会上传到服务器。请先设置一个【保存目录】来存放保护后的文件。",
    onboarding_btn: "去设置目录",
    verify_watermark_found: "🟢 已检测到版权印记",
    verify_watermark_not_found: "🔴 未检测到版权印记",
    status_verifying: "🔍 正在分析文件指纹...",
    status_scanning: "🔍 正在搜索待保护资产...",
    status_compiling: "🚀 正在计算加密指纹...",
    error_no_output: "请先在设置中挂载【输出目录】。",
    engine_header_suite: "保护功能开关",
    settings_arweave: "Arweave 密钥文件",
    settings_arweave_desc: "导入您的 Arweave .json 密钥以开启永久存证功能",
    tech_standard_title: "隐藏数字水印",
    tech_standard_desc: "在图片中嵌入肉眼看不见的署名信息。即使图片被压缩、截图或剪裁，依然可以还原作者身份。",
    tech_enhanced_title: "防 AI 抓取保护",
    tech_enhanced_desc: "针对 AI 训练进行干扰，防止您的画风或作品被 AI 无偿爬取和模拟。开启后处理时间会稍长。",
    archive_ots_title: "区块链时间戳存证",
    archive_ots_desc: "免费将作品指纹锚定至比特币区块链，生成不可伪造的时间证明。无需账号，无需付费。",
    archive_arweave_title: "永久存档 (Arweave)",
    archive_arweave_desc: "将受保护的作品永久备份至去中心化存储网络，任何人无法删除。",
    archive_arweave_link: "[ 📚 免费注册 ArConnect 钱包指南 ]",
  },
  "en-US": {
    brand: "MetaSeal",
    nav_images: "Image Protect",
    nav_text: "Text Protect",
    nav_code: "Code Protect",
    nav_scanner: "Asset Verify",
    nav_history: "History",
    nav_settings: "Settings",
    drop_hint: "Click or drop files here to protect",
    drop_hint_multi: "Supports multiple files at once",
    execute_btn: "Protect Now",
    processing: "Processing...",
    settings_title: "Settings",
    settings_header_general: "General",
    settings_header_identity: "Creator Identity",
    settings_header_paths: "Storage Paths",
    settings_lang: "Language",
    settings_theme: "Theme",
    settings_author: "Creator Name",
    settings_author_name: "Name for watermark",
    settings_copyright: "Copyright Suffix",
    settings_paths: "Directories",
    settings_source: "Source Folder",
    settings_output: "Output Folder",
    settings_choose: "Select",
    settings_format: "Output Format",
    format_original: "Keep Original",
    onboarding_desc: "MetaSeal runs 100% locally. Please set an [Output Folder] to save your protected assets.",
    onboarding_btn: "Set Folder",
    verify_watermark_found: "🟢 Watermark Detected",
    verify_watermark_not_found: "🔴 No Watermark Found",
    status_verifying: "🔍 Analyzing fingerprint...",
    status_scanning: "🔍 Scanning folder...",
    status_compiling: "🚀 Calculating hash...",
    error_no_output: "Error: Please set Output Folder in Settings.",
    engine_header_suite: "Protection Options",
    settings_arweave: "Arweave Wallet Key",
    settings_arweave_desc: "Import your .json key to enable permanent backup",
    tech_standard_title: "Invisible Watermark",
    tech_standard_desc: "Injects invisible data into pixels. Resists compression, screenshots, and cropping.",
    tech_enhanced_title: "Anti-AI Shield",
    tech_enhanced_desc: "Disrupts AI scraping and style mimicry. Processing takes slightly longer.",
    archive_ots_title: "Blockchain Timestamp (OTS)",
    archive_ots_desc: "Anchor your work fingerprint to Bitcoin blockchain. Free, no account needed.",
    archive_arweave_title: "Permanent Archive (Arweave)",
    archive_arweave_desc: "Permanently back up your protected work to decentralized storage. Cannot be deleted.",
    archive_arweave_link: "[ 📚 Get a free ArConnect wallet ]",
  }
};

// --- SVG Icons ---
const ImageIcon = () => <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
const TextIcon = () => <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const CodeIcon = () => <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>;
const HistoryIcon = () => <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SettingsIcon = () => <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SearchIcon = () => <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
const UploadArrowIcon = () => <svg className="drop-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0-15l-4.5 4.5m4.5-4.5l4.5 4.5" /></svg>;
const VerifyMagnifyIcon = () => <svg className="drop-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// --- Brand Logo ---
const BrandLogoElement = () => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', paddingLeft: '12px' }}>
    <svg style={{ width: '32px', height: '32px', marginRight: '10px', color: 'var(--text-main)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 1 0 7.79 4.5" />
    </svg>
    <span style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '2px', color: 'var(--text-main)', fontFamily: 'serif' }}>MetaSeal</span>
  </div>
);

function App() {
  // --- States ---
  const [settings, setSettings] = useState<any>({
    language: "zh-CN",
    theme: "light",
    author_name: "Anonymous",
    copyright_suffix: "All Rights Reserved",
    source_dir: null,
    output_dir: null,
    format_preference: "original",
    arweave_key: ""
  });

  const [activeTab, setActiveTab] = useState('Images');
  const [status, setStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [lastProtectedFile, setLastProtectedFile] = useState<any>(null);
  const [scannerResult, setScannerResult] = useState<any>(null);
  const [historyLog, setHistoryLog] = useState<any[]>([]);

  // Protection Options
  const [isT1Enabled, setIsT1Enabled] = useState(true);
  const [isT2Enabled, setIsT2Enabled] = useState(false);
  const [isOtsEnabled, setIsOtsEnabled] = useState(false);
  const [isArweaveEnabled, setIsArweaveEnabled] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(localStorage.getItem('metaseal_onboarding_dismissed') === 'true');
  const [toggleWarning, setToggleWarning] = useState("");

  const t = translations[settings.language as keyof typeof translations] || translations["zh-CN"];

  // --- Effects ---
  useEffect(() => {
    invoke("load_settings").then((res: any) => {
      if (res) {
        setSettings(res);
        if (['dark', 'light'].includes(res.theme)) {
          document.documentElement.setAttribute('data-theme', res.theme);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (settings.theme !== 'system') {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
  }, [settings.theme]);

  // --- Handlers ---
  const saveSettingsToRust = async (newSettings: any) => {
    setSettings(newSettings);
    await invoke("save_settings", { settings: newSettings });
  };

  const handlePickFolder = async (key: 'source_dir' | 'output_dir') => {
    try {
      const selected = await open({ directory: true, multiple: false });
      if (selected) {
        const newSettings = { ...settings, [key]: selected };
        saveSettingsToRust(newSettings);
      }
    } catch (e) {
      console.error("Failed to open directory dialog:", e);
      setStatus("❌ 无法打开目录选择器，请检查权限。");
    }
  };

  const handlePickArweaveKey = async () => {
    try {
      const selected = await open({
        filters: [{ name: 'JSON Key', extensions: ['json'] }],
        multiple: false
      });
      if (selected) {
        const newSettings = { ...settings, arweave_key: selected as string };
        saveSettingsToRust(newSettings);
      }
    } catch (e) {
      console.error("Failed to open file dialog:", e);
      setStatus("❌ 无法打开文件选择器，请检查权限。");
    }
  };

  const handlePickFileAndProtect = async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [
          { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] },
          { name: 'Documents', extensions: ['txt', 'md', 'csv'] },
          { name: 'Code', extensions: ['rs', 'js', 'ts', 'py', 'c', 'cpp', 'go'] }
        ]
      });
      const batchId = Date.now();
      if (selected && Array.isArray(selected)) {
        for (const file of selected) {
          await handleExecuteProtection(file, batchId);
        }
      } else if (selected) {
        await handleExecuteProtection(selected as string, batchId);
      }
    } catch (e) {
      console.error("File picker error:", e);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Actual path retrieval handled by tauri://drag-drop listener below
  };

  // Tauri drag-drop listener
  useEffect(() => {
    let unlisten: any;
    import('@tauri-apps/api/event').then(({ listen }) => {
      listen("tauri://drag-drop", (event: any) => {
        const paths = event.payload.paths;
        if (paths && paths.length > 0) {
          const batchId = Date.now();
          for (const path of paths) {
            handleExecuteProtection(path, batchId);
          }
        }
      }).then(u => unlisten = u);
    });
    return () => { if (unlisten) unlisten(); };
  }, [activeTab, isT1Enabled, isT2Enabled, isOtsEnabled, isArweaveEnabled, settings.output_dir]);

  const handleVerifyFile = async () => {
    const selected = await open({ multiple: false });
    if (selected) {
      setScannerResult(null);
      setStatus(t.status_verifying);
      try {
        const res: any = await invoke("verify_image_t1", { path: selected as string });
        setScannerResult({ ...res, filePath: selected as string });
        setStatus(res.message.includes('✅') ? t.verify_watermark_found : t.verify_watermark_not_found);
      } catch (e) {
        setScannerResult({ success: false, message: "验证过程中出现错误，请确认文件格式正确。" });
        setStatus(t.verify_watermark_not_found);
      }
    }
  };

  const handleExecuteProtection = async (manualPath?: string, batchId?: number) => {
    const selectedFile = manualPath || `demo_${activeTab.toLowerCase()}_asset.bin`;
    if (!settings.output_dir) {
      setStatus(t.error_no_output);
      setActiveTab('Settings');
      return;
    }

    setIsProcessing(true);
    setStatus(t.status_compiling);

    try {
      let output_path = "";

      if (activeTab === 'Images') {
        // Apply T1 watermark first (if enabled)
        if (isT1Enabled) {
          const t1Res: any = await invoke("protect_image_t1", { path: selectedFile, outputDir: settings.output_dir });
          output_path = t1Res.output_path;
        }
        // Then apply T2 adversarial shield on top (if enabled)
        if (isT2Enabled) {
          const t2Input = output_path || selectedFile;
          const t2Res: any = await invoke("protect_image_t2", { path: t2Input, outputDir: settings.output_dir });
          output_path = t2Res.output_path;
        }
        if (!output_path) {
          throw new Error("请至少启用一种保护方式（数字水印 或 防 AI 抓取）");
        }
      } else if (activeTab === 'Text') {
        const res: any = await invoke("protect_document", { path: selectedFile, outputDir: settings.output_dir });
        output_path = res.output_path;
      } else if (activeTab === 'Code') {
        const res: any = await invoke("protect_code", { path: selectedFile, outputDir: settings.output_dir });
        output_path = res.output_path;
      }

      // Compute file fingerprint
      const hashRes: any = await invoke("compute_file_hash", { path: output_path });
      const hashStr = hashRes.file_hash;

      // OTS blockchain anchoring (real call)
      let otsRes = "UNANCHORED";
      if (isOtsEnabled) {
        setStatus("⛓️ 正在提交区块链存证，请稍候...");
        try {
          const otsResult: any = await invoke("anchor_to_blockchain", { path: output_path });
          otsRes = otsResult.message;
        } catch (e: any) {
          otsRes = `OTS 存证失败: ${e}`;
        }
      }

      // Arweave permanent storage
      let arweaveRes = "LOCAL_ONLY";
      if (isArweaveEnabled && settings.arweave_key) {
        setStatus("🌐 正在上传至 Arweave 永存网络...");
        try {
          const arResult: any = await invoke("anchor_to_arweave", { path: output_path, hash: hashStr });
          arweaveRes = arResult.tx_id;
        } catch (e: any) {
          arweaveRes = `Arweave 上传失败: ${e}`;
        }
      }

      const fileName = selectedFile.split('/').pop() || selectedFile.split('\\').pop() || selectedFile;
      setStatus(`✅ 保护完成：${fileName}`);

      const fileRecord = {
        name: fileName,
        outputPath: output_path,
        hash: hashStr,
        ots: otsRes,
        arweave: arweaveRes,
        timestamp: new Date().toLocaleString(),
        batchId: batchId || Date.now(),
        t1Enabled: isT1Enabled,
        t2Enabled: isT2Enabled,
      };

      setLastProtectedFile(fileRecord);
      setHistoryLog(prev => [fileRecord, ...prev]);
      // Auto-show certificate after successful protection
      setShowCertificate(true);

    } catch (e: any) {
      setStatus(`⚠️ 保护失败：${e.message || e}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Dynamic Explainers ---
  const getFormatSubtext = () => {
    if (activeTab === 'Images') return "支持 .PNG .JPG .WEBP · 可同时选择多个文件";
    if (activeTab === 'Text') return "支持 .TXT .MD .CSV · 暂不支持 .DOCX 富文本格式";
    if (activeTab === 'Code') return "支持 .RS .JS .TS .PY .C .CPP .GO 等源码文件";
    return "";
  };

  const getArchitectureExplainer = () => {
    if (settings.language !== 'zh-CN') return null;
    if (activeTab === 'Images') return (
      <div className="arch-explainer">
        <b>图片保护原理:</b> 通过在像素中嵌入隐藏的水印信息，并在画面中添加抗 AI 干扰层。<br/>
        <b>主要用途:</b> 防止作品被他人盗用、非法二创，以及由于 AI 爬取导致的画风被模拟。<br/>
        <b>使用方法:</b> 设置好保存目录后，将图片拖入上方区域即可。支持同时拖入多张图片。
      </div>
    );
    if (activeTab === 'Text') return (
      <div className="arch-explainer">
        <b>文字确权原理:</b> 在文章中植入肉眼不可见的文字追踪标识。<br/>
        <b>主要用途:</b> 即使文字被整段复制粘贴到社交媒体或公众号，依然可以查出原始作者信息。<br/>
        <b>使用方法:</b> 上传纯文本 (.TXT) 或 Markdown (.MD) 文件。
      </div>
    );
    if (activeTab === 'Code') return (
      <div className="arch-explainer">
        <b>代码安全原理:</b> 在源码头部自动生成基于文件内容的加密签名注释。<br/>
        <b>主要用途:</b> 防止私有代码仓库被非法拉取时丢失版权归属证明。<br/>
        <b>使用方法:</b> 拖入源码文件，系统会自动识别语言并植入数字签章。
      </div>
    );
    return null;
  };

  // --- Sub-Components ---
  const OnboardingModal = () => (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <BrandLogoElement />
        <p>{t.onboarding_desc}</p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button className="primary-btn" onClick={() => {
            setActiveTab('Settings');
            localStorage.setItem('metaseal_onboarding_dismissed', 'true');
            setOnboardingDismissed(true);
          }}>{t.onboarding_btn}</button>
          <button className="secondary-btn" onClick={() => {
            localStorage.setItem('metaseal_onboarding_dismissed', 'true');
            setOnboardingDismissed(true);
          }}>稍后设置</button>
        </div>
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="content-wrapper">
      <div className="page-header">
        <h1 className="page-title">{t.settings_title}</h1>
      </div>

      <div className="settings-section">
        <div className="settings-header">{t.settings_header_general}</div>
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-title">{t.settings_lang}</div>
          </div>
          <select style={{width:'150px'}} value={settings.language} onChange={(e) => saveSettingsToRust({...settings, language: e.target.value})}>
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English</option>
          </select>
        </div>
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-title">{t.settings_theme}</div>
          </div>
          <div className="theme-toggle" style={{width:'150px'}}>
            {['light', 'dark'].map(v => (
              <button key={v} className={settings.theme === v ? 'active' : ''} onClick={() => saveSettingsToRust({...settings, theme: v})}>
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-header">{t.settings_header_identity}</div>
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-title">{t.settings_author}</div>
            <div className="setting-desc">此信息将被严格封装并嵌入资产矩阵深层结构中。</div>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'8px', width:'250px'}}>
            <input type="text" placeholder={t.settings_author_name} value={settings.author_name} onChange={(e) => saveSettingsToRust({...settings, author_name: e.target.value})} />
            <input type="text" placeholder={t.settings_copyright} value={settings.copyright_suffix} onChange={(e) => saveSettingsToRust({...settings, copyright_suffix: e.target.value})} />
          </div>
        </div>
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-title">{t.settings_format}</div>
          </div>
          <select style={{width:'150px'}} value={settings.format_preference} onChange={(e) => saveSettingsToRust({...settings, format_preference: e.target.value})}>
            <option value="original">{t.format_original}</option>
            <option value="png">强制 PNG 无损</option>
            <option value="jpg">强制 JPG 编码</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-header">{t.settings_header_paths}</div>
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-title">{t.settings_source}</div>
            <div className="setting-desc">{settings.source_dir || '当前处于未挂载状态'}</div>
          </div>
          <button className="secondary-btn" onClick={() => handlePickFolder('source_dir')}>{t.settings_choose}</button>
        </div>
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-title">{t.settings_output}</div>
            <div className="setting-desc">{settings.output_dir || '当前处于未挂载状态'}</div>
          </div>
          <button className="secondary-btn" onClick={() => handlePickFolder('output_dir')}>{t.settings_choose}</button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-header">去中心化归档配置</div>
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-title">{t.settings_arweave}</div>
            <div className="setting-desc">{settings.arweave_key ? `已挂载: ...${settings.arweave_key.slice(-15)}` : t.settings_arweave_desc}</div>
          </div>
          <button className="secondary-btn" onClick={handlePickArweaveKey}>{t.settings_choose}</button>
        </div>
      </div>
    </div>
  );

  const EngineView = ({ title }: { title: string }) => (
    <div className="content-wrapper">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
      </div>

      {getArchitectureExplainer()}

      <div className="dropzone"
           onClick={isProcessing ? undefined : handlePickFileAndProtect}
           onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
           onDrop={handleDrop}
           style={{ pointerEvents: isProcessing ? 'none' : 'auto', opacity: isProcessing ? 0.7 : 1 }}>
        <div className="drop-icon-wrapper"><UploadArrowIcon /></div>
        <div className="drop-text">{isProcessing ? t.processing : (status || t.drop_hint)}</div>
        <div className="drop-subtext">{getFormatSubtext()}</div>
      </div>

      <div className="settings-section">
        <div className="settings-header">{t.engine_header_suite}</div>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-title">{t.tech_standard_title}</div>
            <div className="setting-desc">{t.tech_standard_desc}</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={isT1Enabled} onChange={(e) => setIsT1Enabled(e.target.checked)} />
            <span className="slider"></span>
          </label>
        </div>

        {activeTab === 'Images' && (
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-title">{t.tech_enhanced_title}</div>
              <div className="setting-desc">{t.tech_enhanced_desc}</div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={isT2Enabled} onChange={(e) => setIsT2Enabled(e.target.checked)} />
              <span className="slider"></span>
            </label>
          </div>
        )}

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-title">{t.archive_ots_title}</div>
            <div className="setting-desc">{t.archive_ots_desc}</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={isOtsEnabled} onChange={(e) => setIsOtsEnabled(e.target.checked)} />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-title">{t.archive_arweave_title}</div>
            <div className="setting-desc">
              {t.archive_arweave_desc}
              <br />
              <a href="#" className="external-link" onClick={(e) => { e.preventDefault(); window.open("https://www.arconnect.io/", "_blank"); }}>{t.archive_arweave_link}</a>
              {toggleWarning === 'arweave' && (
                <span className="tech-perf-note warning" style={{display: 'block', marginTop: '4px'}}>请先在设置中导入 Arweave 密钥</span>
              )}
            </div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={isArweaveEnabled}
                   onChange={(e) => {
                     if (e.target.checked && (!settings.arweave_key || settings.arweave_key === "")) {
                       setToggleWarning('arweave');
                       setTimeout(() => setToggleWarning(""), 4000);
                       return;
                     }
                     setIsArweaveEnabled(e.target.checked);
                   }} />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const VerifyView = () => {
    const watermarkDetected = scannerResult?.message?.includes('✅');
    const watermarkMessage = scannerResult?.message || '';

    return (
      <div className="content-wrapper">
        <div className="page-header">
          <h1 className="page-title">{t.nav_scanner}</h1>
        </div>

        <div className="arch-explainer">
          <b>查验原理:</b> 对文件内部的数字印记进行技术级分析，判断是否由 MetaSeal 保护，并展示区块链存证信息。<br/>
          <b>支持类型:</b> 受 MetaSeal 保护的图片文件（.PNG、.JPG、.WEBP）
        </div>

        <div className="dropzone"
             onClick={handleVerifyFile}
             onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
             onDrop={handleDrop}>
          <div className="drop-icon-wrapper"><VerifyMagnifyIcon /></div>
          <div className="drop-text">{status || "点击选择或拖拽文件到这里进行查验"}</div>
          <div className="drop-subtext">支持 .PNG .JPG .WEBP 图片文件</div>
        </div>

        {scannerResult && (
          <div style={{marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px'}}>

            {/* Watermark Detection Result */}
            <div className="verify-result-card" style={{borderLeft: `4px solid ${watermarkDetected ? '#34C759' : '#FF3B30'}`}}>
              <div className="verify-status" style={{color: watermarkDetected ? '#34C759' : '#FF3B30', fontWeight: 600}}>
                {watermarkDetected ? t.verify_watermark_found : t.verify_watermark_not_found}
              </div>
              <div className="verify-detail" style={{marginTop: '8px'}}>{watermarkMessage}</div>
            </div>

            {watermarkDetected && (
              <>
                <div className="verify-result-card">
                  <div className="verify-status">⛓️ 区块链存证</div>
                  <div className="verify-detail" style={{marginTop: '8px'}}>
                    如果保护时启用了"区块链时间戳存证"，输出目录中会生成 <code>.ots</code> 证明文件。<br/>
                    可在以下网站验证该文件的比特币时间戳：<br/>
                    <a href="#" className="external-link" style={{marginTop: '6px', display: 'inline-block'}}
                       onClick={(e) => { e.preventDefault(); window.open("https://opentimestamps.org/", "_blank"); }}>
                      🔗 OpenTimestamps 在线验证
                    </a>
                  </div>
                </div>

                <div className="verify-result-card">
                  <div className="verify-status">⚖️ 如何使用版权证书维权</div>
                  <div className="verify-detail" style={{marginTop: '8px', lineHeight: '1.8'}}>
                    <b>第一步：</b>保护作品后点击"查阅版权凭证"生成证书，保存好证书文件夹。<br/>
                    <b>第二步：</b>区块链存证会在 10 分钟内在比特币网络确认，生成不可伪造的时间证明。<br/>
                    <b>第三步：</b>发现侵权时，可将证书文件夹作为原创证明，向平台举报或向法院提交。<br/>
                    <b>证明效力：</b>区块链时间戳 + 文件指纹可证明您在该时间前已拥有该作品。
                  </div>
                </div>
              </>
            )}

            {!watermarkDetected && (
              <div className="verify-result-card" style={{borderLeft: '4px solid #FF9500'}}>
                <div className="verify-status" style={{color: '#FF9500'}}>💡 提示</div>
                <div className="verify-detail" style={{marginTop: '8px'}}>
                  此文件未检测到 MetaSeal 版权印记。可能原因：<br/>
                  · 该文件未经过 MetaSeal 保护<br/>
                  · 文件经过了大幅度压缩或格式转换导致水印减弱<br/>
                  · 该文件为文字或代码类型（请使用对应的保护页面处理）
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const HistoryView = () => {
    // Group history items by batchId
    const seenBatchIds = new Set<number>();
    const batchGroups: any[][] = [];

    for (const item of historyLog) {
      const bid = item.batchId;
      if (!seenBatchIds.has(bid)) {
        seenBatchIds.add(bid);
        batchGroups.push(historyLog.filter(x => x.batchId === bid));
      }
    }

    return (
      <div className="content-wrapper">
        <div className="page-header">
          <h1 className="page-title">{t.nav_history}</h1>
        </div>
        {historyLog.length === 0 ? (
          <div style={{ color: "var(--text-dim)", marginTop: "20px" }}>
            暂无保护记录。处理文件后将在此处显示。
          </div>
        ) : (
          <div className="history-list">
            {batchGroups.map((group: any[], gi: number) => (
              <div key={gi} style={{marginBottom: '16px'}}>
                {group.length > 1 && (
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-dim)',
                    padding: '6px 12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '6px 6px 0 0',
                    borderBottom: '1px solid var(--border-color)'
                  }}>
                    📦 批量保护 · {group.length} 个文件 · {group[0].timestamp}
                  </div>
                )}
                {group.map((log: any, i: number) => (
                  <div key={i} className="history-item" style={{borderRadius: group.length > 1 && i === 0 ? '0' : undefined}}>
                    <div className="history-item-header">
                      <span className="history-item-title">📄 {log.name}</span>
                      {group.length === 1 && <span className="history-item-time">{log.timestamp}</span>}
                    </div>
                    <div className="history-item-meta">
                      🔒 文件指纹：<code style={{fontSize: '11px'}}>{log.hash ? log.hash.substring(0, 20) + '...' : '计算中'}</code>
                    </div>
                    <div className="history-item-meta">
                      {log.ots && log.ots !== 'UNANCHORED'
                        ? `⛓️ 存证：${log.ots.length > 50 ? log.ots.substring(0, 50) + '...' : log.ots}`
                        : '○ 未启用区块链存证'}
                    </div>
                    <div style={{marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                      {log.t1Enabled && <span style={{fontSize:'11px', padding:'2px 8px', background:'#34C75920', color:'#34C759', borderRadius:'4px'}}>版权印记</span>}
                      {log.t2Enabled && <span style={{fontSize:'11px', padding:'2px 8px', background:'#007AFF20', color:'#007AFF', borderRadius:'4px'}}>防AI抓取</span>}
                      {log.ots !== 'UNANCHORED' && <span style={{fontSize:'11px', padding:'2px 8px', background:'#FF950020', color:'#FF9500', borderRadius:'4px'}}>⛓️ 已存证</span>}
                    </div>
                    <button
                      className="secondary-btn"
                      style={{marginTop: '10px', fontSize: '12px', padding: '5px 14px'}}
                      onClick={() => { setLastProtectedFile(log); setShowCertificate(true); }}>
                      查阅版权凭证
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getTabTitle = () => {
    switch(activeTab) {
      case 'Images': return t.nav_images;
      case 'Text': return t.nav_text;
      case 'Code': return t.nav_code;
      default: return "";
    }
  };

  return (
    <div className="app-container" data-theme={settings.theme}>
      {!settings.output_dir && !onboardingDismissed && <OnboardingModal />}

      <div className="sidebar">
        <BrandLogoElement />
        <div className="nav-menu">
          <div className={`nav-item ${activeTab === 'Images' ? 'active' : ''}`} onClick={() => setActiveTab('Images')}>
            <ImageIcon /> <span>{t.nav_images}</span>
          </div>
          <div className={`nav-item ${activeTab === 'Text' ? 'active' : ''}`} onClick={() => setActiveTab('Text')}>
            <TextIcon /> <span>{t.nav_text}</span>
          </div>
          <div className={`nav-item ${activeTab === 'Code' ? 'active' : ''}`} onClick={() => setActiveTab('Code')}>
            <CodeIcon /> <span>{t.nav_code}</span>
          </div>

          <div style={{ height: '16px' }}></div>

          <div className={`nav-item ${activeTab === 'Scanner' ? 'active' : ''}`} onClick={() => setActiveTab('Scanner')}>
            <SearchIcon /> <span>{t.nav_scanner}</span>
          </div>
          <div className={`nav-item ${activeTab === 'History' ? 'active' : ''}`} onClick={() => setActiveTab('History')}>
            <HistoryIcon /> <span>{t.nav_history}</span>
          </div>

          <div style={{ flex: 1 }}></div>

          <div className={`nav-item ${activeTab === 'Settings' ? 'active' : ''}`} onClick={() => setActiveTab('Settings')}>
            <SettingsIcon /> <span>{t.nav_settings}</span>
          </div>
        </div>
      </div>

      <div className="main-content">
        {activeTab === 'Settings' ? <SettingsView /> :
         activeTab === 'Scanner' ? <VerifyView /> :
         activeTab === 'History' ? <HistoryView /> :
         <EngineView title={getTabTitle()} />}
      </div>

      {showCertificate && lastProtectedFile && (
        <Certificate
          fileName={lastProtectedFile.name}
          fileHash={lastProtectedFile.hash}
          timestamp={lastProtectedFile.timestamp}
          otsProof={lastProtectedFile.ots}
          arweaveTxId={lastProtectedFile.arweave}
          t1Enabled={lastProtectedFile.t1Enabled ?? isT1Enabled}
          t2Enabled={lastProtectedFile.t2Enabled ?? isT2Enabled}
          authorName={settings.author_name}
          copyrightSuffix={settings.copyright_suffix}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}

export default App;
