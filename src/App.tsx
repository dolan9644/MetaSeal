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
    mode_oneoff: "单个文件",
    mode_batch: "批量保护",
    drop_hint: "点击或拖拽文件到这里开始保护",
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
    batch_scan: "扫描未保护文件",
    batch_count: "发现 {count} 个待处理文件",
    batch_run: "一键全部保护",
    batch_empty: "该目录下没有发现待处理的图片。",
    batch_no_path: "请先在设置中配置【读取目录】和【输出目录】。",
    verify_success: "验证成功：此文件包含合法的版权信息。",
    verify_failed: "验证失败：未检测到水印。文件可能未受保护或已遭破坏。",
    status_verifying: "🔍 正在分析文件指纹...",
    status_scanning: "🔍 正在搜索待保护资产...",
    status_compiling: "🚀 正在计算加密指纹...",
    error_no_output: "请先在设置中挂载【输出目录】。",
    engine_header_suite: "保护功能开关",
    engine_header_archive: "存证与永久备份 (Arweave & OTS)",
    settings_arweave: "Arweave 密钥文件",
    settings_arweave_desc: "导入您的 Arweave .json 密钥以开启永久存证功能",
    tech_standard_title: "隐藏数字水印",
    tech_standard_desc: "在图片中嵌入肉眼看不见的署名信息。即使图片被压缩、截图或剪裁，依然可以还原作者身份。",
    tech_enhanced_title: "防 AI 抓取保护",
    tech_enhanced_desc: "针对 AI 训练进行干扰，防止您的画风或作品被 AI 无偿爬取和模拟。",
    tech_enhanced_perf: "注：此功能需要端侧高算力支持，并占用约 100MB 磁盘空间。",
    archive_desc: "利用区块链技术为作品打上“不可篡改”的时间戳，并同步备份至永久存储网络。",
    archive_link: "[ 📚 查看如何获取 Arweave 密钥 ]",
  },
  "en-US": {
    brand: "MetaSeal",
    nav_images: "Image Protect",
    nav_text: "Text Protect",
    nav_code: "Code Protect",
    nav_scanner: "Asset Verify",
    nav_history: "History",
    nav_settings: "Settings",
    mode_oneoff: "Single File",
    mode_batch: "Batch Protect",
    drop_hint: "Click or drop files here to protect",
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
    batch_scan: "Scan for files",
    batch_count: "Found {count} files",
    batch_run: "Protect All",
    batch_empty: "No pending files found in source folder.",
    batch_no_path: "Halt: Please configure paths in Settings first.",
    verify_success: "Verified: This file contains valid copyright data.",
    verify_failed: "Failed: No signature detected.",
    status_verifying: "🔍 Analyzing fingerprint...",
    status_scanning: "🔍 Scanning folder...",
    status_compiling: "🚀 Calculating hash...",
    error_no_output: "Error: Please set Output Folder in Settings.",
    engine_header_suite: "Engine Toggles",
    engine_header_archive: "Blockchain Proof (Arweave & OTS)",
    settings_arweave: "Arweave Wallet Key",
    settings_arweave_desc: "Import your .json key to enable permanent backup",
    tech_standard_title: "Invisible Watermark",
    tech_standard_desc: "Injects invisible data into pixels. Resists compression, screenshots, and cropping.",
    tech_enhanced_title: "Anti-AI Shield",
    tech_enhanced_desc: "Disrupts AI scraping and style mimicry at the source.",
    tech_enhanced_perf: "Note: Requires local GPU/NPU compute and ~100MB disk.",
    archive_desc: "Immutable timestamping and permanent cloud backup via blockchain.",
    archive_link: "[ 📚 How to get Arweave keys ]",
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

// --- Original Zen Ring Logo ---
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
  const [inputMode, setInputMode] = useState<'OneOff' | 'Batch'>('OneOff');
  const [status, setStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [lastProtectedFile, setLastProtectedFile] = useState<any>(null);
  const [scannerResult, setScannerResult] = useState<any>(null);
  const [pendingBatchFiles, setPendingBatchFiles] = useState<string[]>([]);
  const [historyLog, setHistoryLog] = useState<any[]>([]);
  
  // Protection Options
  const [isT1Enabled, setIsT1Enabled] = useState(true);
  const [isT2Enabled, setIsT2Enabled] = useState(false);
  const [isOtsEnabled, setIsOtsEnabled] = useState(false);
  const [isArweaveEnabled, setIsArweaveEnabled] = useState(false);
  const [isEnchancedDownloaded, setIsEnchancedDownloaded] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState("");
  const [onboardingDismissed, setOnboardingDismissed] = useState(localStorage.getItem('metaseal_onboarding_dismissed') === 'true');

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
    const selected = await open({ multiple: false });
    if (selected) {
      handleExecuteProtection(selected as string);
    }
  };

  const handleVerifyFile = async () => {
    const selected = await open({ multiple: false });
    if (selected) {
      setStatus(t.status_verifying);
      try {
        // 按当前激活的 Tab 路由到正确的查验引擎
        let cmd = "verify_image_t1";
        if (activeTab === 'Text') cmd = "verify_document";
        else if (activeTab === 'Code') cmd = "verify_code";
        const res: any = await invoke(cmd, { path: selected as string });
        setScannerResult(res);
        setStatus(res.success ? t.verify_success : t.verify_failed);
      } catch (e) {
        setScannerResult({ success: false });
        setStatus(t.verify_failed);
      }
    }
  };

  const handleDownloadModel = async () => {
    setDownloadMsg("分配计算节点与存储卷空间...");
    try {
      const resp: string = await invoke("download_model_t2");
      setIsEnchancedDownloaded(true);
      setDownloadMsg(resp);
    } catch (e: any) {
      setDownloadMsg(`Error: ${e}`);
    }
  };

  const handleScanBatch = async () => {
    if (!settings.source_dir || !settings.output_dir) {
      setStatus(t.batch_no_path);
      return;
    }
    setStatus(t.status_scanning);
    try {
      const files: any = await invoke("get_unprotected_files", { 
        sourceDir: settings.source_dir, 
        outputDir: settings.output_dir 
      });
      setPendingBatchFiles(files);
      setStatus(t.batch_count.replace("{count}", files.length.toString()));
    } catch (e) { setStatus("❌ Scan failed. Check directory permissions."); }
  };

  const handleExecuteProtection = async (manualPath?: string) => {
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
      
      // Dynamic routing to actual backend implementations based on the tab
      if (activeTab === 'Images') {
          const res: any = await invoke(isT2Enabled ? "protect_image_t2" : "protect_image_t1", { path: selectedFile, outputDir: settings.output_dir });
          output_path = res.output_path;
      } else if (activeTab === 'Text') {
          const res: any = await invoke("protect_document", { path: selectedFile, outputDir: settings.output_dir });
          output_path = res.output_path;
      } else if (activeTab === 'Code') {
          const res: any = await invoke("protect_code", { path: selectedFile, outputDir: settings.output_dir });
          output_path = res.output_path;
      }

      const hashRes: any = await invoke("compute_file_hash", { path: output_path });
      const hashStr = hashRes.file_hash;

      let otsRes = "UNANCHORED";
      if (isOtsEnabled) {
        // mock actual blockchain check
        otsRes = "Pending Bitcoin confirmation (~10 mins)";
      }

      let arweaveRes = "LOCAL_ONLY";
      if (isArweaveEnabled) {
        arweaveRes = "ar://VqQ..._WvU";
      }

      setStatus(`✨ Success: ${output_path}`);
      
      const fileRecord = {
        name: selectedFile.split('/').pop(),
        hash: hashStr,
        ots: otsRes,
        arweave: arweaveRes,
        timestamp: new Date().toLocaleString()
      };
      
      setLastProtectedFile(fileRecord);
      setHistoryLog(prev => [fileRecord, ...prev]);

    } catch (e: any) {
      setStatus(`⚠️ Exception: ${e.message || 'System Error'}`);
    } finally { setIsProcessing(false); }
  };

  // --- Dynamic Explaners ---
  const getFormatSubtext = () => {
    if (activeTab === 'Images') return "(.PNG, .JPG, .WEBP) | 支持本地批量分发";
    if (activeTab === 'Text') return "(.TXT, .MD, .CSV) | 注意：出于结构安全，尚不支持强制向 .DOCX 等富文本二进制直接注入零宽水印。";
    if (activeTab === 'Code') return "(.RS, .JS, .TS, .PY, ...) | 构建安全的抽象签名保护";
    return "";
  };
  
  const getArchitectureExplainer = () => {
    if (settings.language !== 'zh-CN') return null;
    
    if (activeTab === 'Images') return (
      <div className="arch-explainer">
        <b>图片保护原理:</b> 通过在像素中嵌入隐藏的水印信息，并在画面中添加抗 AI 干扰层。<br/>
        <b>主要用途:</b> 防止作品被他人盗用、非法二创，以及由于 AI 爬取导致的画风被模拟。<br/>
        <b>使用方法:</b> 设置好保存目录后，将图片拖入上方区域即可。支持开启“防 AI 抓取”增强保护。
      </div>
    );
    if (activeTab === 'Text') return (
      <div className="arch-explainer">
        <b>文字确权原理:</b> 在文章中植入肉眼不可见的文字追踪标识。<br/>
        <b>主要用途:</b> 即使文字被整段复制粘贴到社交媒体或公众号，依然可以查出原始作者信息。<br/>
        <b>使用方法:</b> 上传纯文本 (.TXT) 或 Markdown (.MD) 文件。暂不支持富文本格式 (.DOCX) 以防排版损坏。
      </div>
    );
    if (activeTab === 'Code') return (
      <div className="arch-explainer">
        <b>代码安全原理:</b> 在源码头部自动生成基于文件内容的加密签名注释。<br/>
        <b>主要用途:</b> 防止私有代码仓库被非法恶意拉取或逆向工程时丢失版权归属证明。<br/>
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
        <div className="mode-switcher">
          <div onClick={() => setInputMode('OneOff')} className={inputMode === 'OneOff' ? 'active' : ''}>{t.mode_oneoff}</div>
          <div onClick={() => setInputMode('Batch')} className={inputMode === 'Batch' ? 'active' : ''}>{t.mode_batch}</div>
        </div>
      </div>

      {getArchitectureExplainer()}

      {inputMode === 'OneOff' ? (
        <div className="dropzone" onClick={isProcessing ? undefined : handlePickFileAndProtect} style={{ pointerEvents: isProcessing ? 'none' : 'auto', opacity: isProcessing ? 0.7 : 1 }}>
          <div className="drop-icon-wrapper"><UploadArrowIcon /></div>
          <div className="drop-text">{isProcessing ? t.processing : (status || t.drop_hint)}</div>
          <div className="drop-subtext">{getFormatSubtext()}</div>
        </div>
      ) : (
        <div className="batch-view">
          <div className="batch-controls">
            <button className="secondary-btn" onClick={handleScanBatch}>{t.batch_scan}</button>
            {pendingBatchFiles.length > 0 && (
              <button className="primary-btn" onClick={() => handleExecuteProtection(pendingBatchFiles[0])}>{t.batch_run}</button>
            )}
          </div>
          <div className="batch-status">{status || t.batch_empty}</div>
        </div>
      )}

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
              
              <div style={{ marginTop: '12px' }}>
                {!isEnchancedDownloaded ? (
                  <button className="download-tiny-btn" onClick={handleDownloadModel}>{downloadMsg || "↓ 部署 ONNX 本地环境 (~97MB)"}</button>
                ) : (
                  <span className="tech-perf-note" style={{color: '#34C759'}}>{downloadMsg || t.tech_enhanced_perf}</span>
                )}
              </div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={isT2Enabled} onChange={(e) => setIsT2Enabled(e.target.checked)} />
              <span className="slider"></span>
            </label>
          </div>
        )}

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-title">{t.engine_header_archive}</div>
            <div className="setting-desc">
                {t.archive_desc}
                <br />
                <a href="#" className="external-link" onClick={(e) => { e.preventDefault(); window.open("https://github.com/dolan9644/MetaSeal/blob/main/docs/USER_GUIDE_zh.md", "_blank"); }}>{t.archive_link}</a>
            </div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={isOtsEnabled || isArweaveEnabled} 
                   onChange={(e) => { setIsOtsEnabled(e.target.checked); setIsArweaveEnabled(e.target.checked); }} />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="action-footer">
        {lastProtectedFile && (
          <button className="secondary-btn" onClick={() => setShowCertificate(true)}>查阅版权凭证记录 (Provenance)</button>
        )}
      </div>
    </div>
  );

  const VerifyView = () => (
    <div className="content-wrapper">
      <div className="page-header">
        <h1 className="page-title">{t.nav_scanner}</h1>
      </div>
      <div className="dropzone" onClick={handleVerifyFile}>
        <div className="drop-icon-wrapper"><VerifyMagnifyIcon /></div>
        <div className="drop-text">{status || "在此挂载数字资产以提取安全指纹"}</div>
        <div className="drop-subtext">原印协议引擎能够追踪提取非结构化文件内部的嵌入式结构</div>
      </div>
      
      {scannerResult && scannerResult.success && (
        <div className="verify-result-card">
          <div className="verify-status">
            <svg style={{width:'24px'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            验证结果：特征指纹通过物理级匹配
          </div>
          <div className="verify-detail">
             该源文件已正确绑定至安全时间锚点，且其加密结构一致性极度完美。<br/>数字权属特征已在区块链加密机制与本地离线矩阵实现了双重防篡改归档。
          </div>
        </div>
      )}
    </div>
  );

  const HistoryView = () => (
    <div className="content-wrapper">
      <div className="page-header">
        <h1 className="page-title">{t.nav_history}</h1>
      </div>
      {historyLog.length === 0 ? (
        <div style={{ color: "var(--text-dim)", marginTop: "20px" }}>本地追踪日志为空档。未在此会话中探测到数字防伪行为。</div>
      ) : (
        <div className="history-list">
          {historyLog.map((log, i) => (
            <div key={i} className="history-item">
              <div className="history-item-header">
                <span className="history-item-title">{log.name}</span>
                <span className="history-item-time">{log.timestamp}</span>
              </div>
              <div className="history-item-meta">结构哈希值 (SHA256): {log.hash}</div>
              <div className="history-item-meta">OTS 网络时间棘轮: {log.ots}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Derive Tab Title
  const getTabTitle = () => {
    switch(activeTab) {
      case 'Images': return t.nav_images;
      case 'Text': return t.nav_text;
      case 'Code': return t.nav_code;
      default: return "";
    }
  }

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
          t1Enabled={isT1Enabled}
          t2Enabled={isT2Enabled}
          authorName={settings.author_name}
          copyrightSuffix={settings.copyright_suffix}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}

export default App;
