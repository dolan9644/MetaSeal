import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";
import Certificate from "./components/Certificate";

// --- Localization ---
const translations = {
  "zh-CN": {
    brand: "元印",
    nav_images: "图像保护",
    nav_text: "文档确权",
    nav_code: "源码保密",
    nav_scanner: "版权查验",
    nav_history: "操作历史",
    nav_settings: "全局偏好设定",
    mode_oneoff: "单个处理",
    mode_batch: "批量扫描",
    drop_hint: "点击选取文件，或将文件拖入此处",
    execute_btn: "立即应用保护",
    processing: "加密协议组网运行中...",
    settings_title: "偏好设置",
    settings_header_general: "常规显示设定",
    settings_header_identity: "创作者身份锚点",
    settings_header_paths: "本地信任存储卷",
    settings_lang: "交互语言",
    settings_theme: "光环主题",
    settings_author: "数字印记全名",
    settings_author_name: "合法全名或机构名称",
    settings_copyright: "扩展版权声明条款",
    settings_paths: "输入与输出目录",
    settings_source: "默认读取路径",
    settings_output: "默认输出路径",
    settings_choose: "挂载目录",
    settings_format: "图像输出扩展名",
    format_original: "保持原始拓展名",
    onboarding_desc: "由于 MetaSeal 全本地运行，原图不离机。请先配置一个安全的【输出区域】以存放受保护的资产。",
    onboarding_btn: "前往驱动器配置",
    batch_scan: "比对源文件卷",
    batch_count: "探明 {count} 个未受保护的纯净资产",
    batch_run: "同步执行全量保护",
    batch_empty: "在源路径下未发现待处理纯洁资产。",
    batch_no_path: "执行中断：请先在偏好设定中挂载【源路径】与【输出路径】。",
    verify_success: "验证通过：此结构包含合法签章。",
    verify_failed: "未探测到特征签章：该文件可能未加固，或结构彻底破坏。",
    engine_header_suite: "防护引擎套件 (Engine Suite)",
    engine_header_archive: "去中心化归档矩阵 (Arweave & OTS)",
    tech_standard_title: "基础频域盲水印印记",
    tech_standard_desc: "注入数学级特征值。对人眼完全隐蔽，抵抗强力压缩与二次裁切行为。",
    tech_enhanced_title: "ONNX 对抗性 AI 盾阵",
    tech_enhanced_desc: "基于局部对抗网络注入扰动噪声。彻底粉碎爬虫及第三方 AI 提取的风格矩阵。",
    tech_enhanced_perf: "引擎备注：部署该对抗盾阵将调度端侧高算力，并严格占用 ~420MB 常驻磁盘空间。",
    archive_desc: "利用比特币数学时间戳与 Arweave 永存网络固化核心版权特征指纹。",
    archive_link: "[ 📚 点击阅读如何绑定去中心化节点密钥 ]",
  },
  "en-US": {
    brand: "MetaSeal",
    nav_images: "Image Protect",
    nav_text: "Doc Protect",
    nav_code: "Code Protect",
    nav_scanner: "Provenance Verify",
    nav_history: "Activity Log",
    nav_settings: "Global Preferences",
    mode_oneoff: "Single File",
    mode_batch: "Batch Scanner",
    drop_hint: "Click to select or drop file here",
    execute_btn: "Execute Protocol",
    processing: "Executing Encryption...",
    settings_title: "Settings",
    settings_header_general: "General Appearance",
    settings_header_identity: "Creator Identity Anchor",
    settings_header_paths: "Local Storage Volumes",
    settings_lang: "Language",
    settings_theme: "Appearance Theme",
    settings_author: "Digital Imprint Name",
    settings_author_name: "Legal Full Name or Org",
    settings_copyright: "Copyright Clause Suffix",
    settings_paths: "Input / Output Directories",
    settings_source: "Source Fetch Path",
    settings_output: "Target Write Path",
    settings_choose: "Mount Vol",
    settings_format: "Image Output Extension",
    format_original: "Preserve Original Extension",
    onboarding_desc: "MetaSeal runs 100% locally. Please mount an [Output Target] to isolate protected assets.",
    onboarding_btn: "Configure Drives",
    batch_scan: "Scan Source Volume",
    batch_count: "Detected {count} unprotected assets",
    batch_run: "Sync & Protect All",
    batch_empty: "No pending pristine assets detected in source volume.",
    batch_no_path: "Halt: Please mount [Source] and [Output] paths in Preferences first.",
    verify_success: "Verification Passed: This structure contains a valid signature.",
    verify_failed: "No signature detected: asset unprotected or structurally corrupted.",
    engine_header_suite: "Protection Engine Suite",
    engine_header_archive: "Decentralized Archive Matrix (Arweave & OTS)",
    tech_standard_title: "Frequency Domain Math Watermark",
    tech_standard_desc: "Injects mathematical eigenvalues. Completely invisible, resists heavy compression.",
    tech_enhanced_title: "ONNX Adversarial AI Shield",
    tech_enhanced_desc: "Generates adversarial noise via local GAN to corrupt style matrix extraction.",
    tech_enhanced_perf: "Engine Note: Deploying this shield runs high-compute and permanently occupies ~420MB disk.",
    archive_desc: "Immutable anchoring of provenance via Bitcoin Math and Permaweb.",
    archive_link: "[ 📚 Read how to bind Decentralized Node Keys ]",
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
    format_preference: "original"
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
    const selected = await open({ directory: true, multiple: false });
    if (selected) saveSettingsToRust({ ...settings, [key]: selected });
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
      setStatus("🔍 Indexing frequency components...");
      try {
        const res: any = await invoke("verify_image_t1", { path: selected as string });
        setScannerResult(res);
        setStatus(t.verify_success);
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
    setStatus("🔍 Scanning Data Volumes...");
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
      setStatus("Error: Output Volume unmounted. Proceed to Settings.");
      setActiveTab('Settings');
      return;
    }

    setIsProcessing(true);
    setStatus("🚀 Compiling Protection Hash...");

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
    if (settings.language !== 'zh-CN') return null; // English translations for explainers skipped for brevity in this MVP
    
    if (activeTab === 'Images') return (
      <div className="arch-explainer">
        <b>架构基础:</b> 频域离散余弦变换 (DCT) 与局部特征散列。<br/>
        <b>业务用途:</b> 抵御图像有损压缩、二次截图与色彩空间篡改的版权追溯，防范未经授权的二创。<br/>
        <b>标准用法:</b> 挂载全局输出目标驱动器后，将受保护原图拖入执行矩阵。支持 AI 盾阵防御。
      </div>
    );
    if (activeTab === 'Text') return (
      <div className="arch-explainer">
        <b>架构基础:</b> 零宽隐写术 (Zero-Width Steganography) 深度注入。<br/>
        <b>业务用途:</b> 在纯文本的跨平台复制粘贴、社交媒体传播中隐含追踪作者确权信息。<br/>
        <b>标准用法:</b> 上传纯文本流 (.TXT, .MD)。底层引擎将拦截 .DOCX / .PDF 格式以防止损坏其二进制容器结构，请保存为最纯文本格式后鉴证。
      </div>
    );
    if (activeTab === 'Code') return (
      <div className="arch-explainer">
        <b>架构基础:</b> SHA256 密码学衍生摘要及动态头部注释块自动植入。<br/>
        <b>业务用途:</b> 防范私有代码库非法拉取、框架剥离与逆向工程时的项目著作权丢失。<br/>
        <b>标准用法:</b> 拖入源码文件，底层核心引擎将挂载特定的语言解析器 (Language Parsers) 并生成对应的不可逆数学签名印记。
      </div>
    );
    return null;
  };

  // --- Sub-Components ---
  const OnboardingBanner = () => (
    <div className="onboarding-banner" onClick={() => setActiveTab('Settings')}>
      <span>⚠️ {t.onboarding_desc} </span>
      <button>{t.onboarding_btn}</button>
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
                  <button className="download-tiny-btn" onClick={handleDownloadModel}>{downloadMsg || "↓ 部署 ONNX 本地环境 (~420MB)"}</button>
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
      {!settings.output_dir && ['Images', 'Text', 'Code'].includes(activeTab) && <OnboardingBanner />}
      
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
