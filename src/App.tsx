import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { open as openShell } from "@tauri-apps/plugin-shell";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageSquare, TextAa, MagnifyingGlass, ClockCounterClockwise,
  Gear, UploadSimple, CheckCircle, WarningCircle, ShieldCheck,
  FileText, CodeBlock, Record, DownloadSimple, ArrowUpRight
} from "@phosphor-icons/react";
import { cn } from "./lib/utils";
import Certificate from "./components/Certificate";

// --- Localization ---
const translations = {
  "zh-CN": {
    brand: "元印 MetaSeal",
    nav_images: "图像保护",
    nav_text: "文本确权",
    nav_code: "源码签章",
    nav_scanner: "查验版权",
    nav_history: "操作记录",
    nav_settings: "系统设置",
    drop_hint: "点击或拖拽文件至此区域",
    processing: "量子沙箱运算中...",
    settings_title: "系统配置",
    onboarding_desc: "初始化沙箱：请先挂载一个物理输出枢纽。所有文件均在您的本地隔离层处理，绝不涉及任何云上传。",
    onboarding_btn: "挂载磁盘枢纽",
    status_verifying: "零知识哈希数据解包中...",
    status_compiling: "物理引擎构建保护层...",
    error_no_output: "警告：需先配置输出目录",
    tech_standard_title: "盲水印 (无损隐身涂层)",
    tech_standard_desc: "在频域注入隐写信息。经过优化保证肉眼无反差，强烈抵抗截屏压制。绝对不侵犯画师原本高保真画质。",
    tech_enhanced_title: "AI 毒化引擎 (反爬装甲)",
    tech_enhanced_desc: "构建致盲对抗干扰（基于 F-SAM 与 ONNX Resnet 拓扑），导致模型梯度崩溃。保证不带来过曝性二次伤害。",
    archive_ots_title: "去中心化存证矩阵",
    archive_ots_desc: "永久锚定至比特币主网引擎或 Arweave 节点。打包生成具备强法律效力的单体包裹合集（Certificate Bundle）。",
  }
};

const FluidToggle = ({ checked, onChange, labelActive, labelInactive }: { checked: boolean; onChange: (b: boolean) => void, labelActive: string, labelInactive: string }) => (
  <div className="flex items-center gap-3">
    <span className={cn("text-[10px] font-bold tracking-widest uppercase transition-colors", checked ? "text-slate-900" : "text-slate-400")}>{checked ? labelActive : labelInactive}</span>
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2",
        checked ? "bg-slate-900" : "bg-slate-200"
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0"
        )}
        style={{ x: checked ? 20 : 0 }}
      />
    </button>
  </div>
);

export default function App() {
  const [settings, setSettings] = useState<any>({
    language: "zh-CN",
    author_name: "Anonymous Creator",
    copyright_suffix: "All Rights Reserved",
    source_dir: null,
    output_dir: null,
    arweave_key: ""
  });

  const [activeTab, setActiveTab] = useState('Images');
  const [status, setStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [lastProtectedFile, setLastProtectedFile] = useState<any>(null);
  const [scannerResult, setScannerResult] = useState<any>(null);
  const [historyLog, setHistoryLog] = useState<any[]>([]);

  const [isT1Enabled, setIsT1Enabled] = useState(true);
  const [isT2Enabled, setIsT2Enabled] = useState(false);
  const [isOtsEnabled, setIsOtsEnabled] = useState(false);
  const [isDownloadingModel, setIsDownloadingModel] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(localStorage.getItem('metaseal_onboarding_dismissed') === 'true');

  const t = translations["zh-CN"];

  useEffect(() => {
    invoke("load_settings").then((res: any) => {
      if (res) setSettings(res);
    });
  }, []);

  const saveSettingsToRust = async (newSettings: any) => {
    setSettings(newSettings);
    await invoke("save_settings", { settings: newSettings });
  };

  const handlePickFolder = async (key: 'source_dir' | 'output_dir') => {
    try {
      const selected = await open({ directory: true, multiple: false });
      if (selected) saveSettingsToRust({ ...settings, [key]: selected });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  useEffect(() => {
    let unlisten: any;
    import('@tauri-apps/api/event').then(({ listen }) => {
      listen("tauri://drag-drop", (event: any) => {
        const paths = event.payload.paths;
        if (paths?.length) {
          if (activeTab === 'Scanner') {
             detectTypeAndVerify(paths[0]);
          } else {
             // Create a random hex batch ID for single session folder drops
             const batchId = Math.random().toString(16).substr(2, 6);
             paths.forEach((p: string) => handleExecuteProtection(p, batchId));
          }
        }
      }).then(u => unlisten = u);
    });
    return () => { if (unlisten) unlisten(); };
  }, [activeTab, isT1Enabled, isT2Enabled, isOtsEnabled, settings.output_dir]);

  const detectTypeAndVerify = async (path: string) => {
    setScannerResult(null);
    setStatus(t.status_verifying);
    
    // Check if it's a Bundle drop (dir or ends with proof extensions)
    if (path.endsWith('.ots') || path.endsWith('.json') || !path.includes('.')) {
      let targetPath = path;
      if (path.endsWith('certificate.json') || path.endsWith('.ots')) {
         targetPath = path.substring(0, Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\')));
      }
      try {
        const res: any = await invoke("verify_certificate_bundle", { path: targetPath });
        setScannerResult({ success: res.success, message: res.message, originalPath: targetPath });
        setStatus(res.message.includes('✅') ? "认证特征完整" : "验证告警");
        return;
      } catch (e: any) {
        if (!path.includes('.')) {
          setScannerResult({ success: false, message: e.toString() });
          setStatus("包裹结构性解密失败");
          return;
        }
      }
    }

    const ext = path.toLowerCase().split('.').pop() || "";
    let command = "verify_image_t1";
    if (['txt', 'md', 'csv'].includes(ext)) command = "verify_document";
    if (['rs', 'js', 'ts', 'py', 'c', 'cpp', 'go'].includes(ext)) command = "verify_code";

    try {
      const res: any = await invoke(command, { path });
      setScannerResult({ ...res, originalPath: path });
      setStatus(res.message.includes('✅') ? "印记解析完成" : "非法特征");
    } catch (e: any) {
      setScannerResult({ success: false, message: e.toString() });
      setStatus("审计程序判定数据包防伪缺失");
    }
  };

  const handlePickVerifyFile = async () => {
    const selected = await open({ multiple: false });
    if (selected) detectTypeAndVerify(selected as string);
  };

  const handlePickFileAndProtect = async () => {
    const selected = await open({
      multiple: true,
      filters: [{ name: 'Assets', extensions: ['png', 'jpg', 'webp', 'txt', 'md', 'rs', 'js', 'ts', 'py', 'c'] }]
    });
    const batchId = Math.random().toString(16).substr(2, 6);
    if (Array.isArray(selected)) {
      for (const f of selected) await handleExecuteProtection(f, batchId);
    } else if (selected) {
      await handleExecuteProtection(selected as string, batchId);
    }
  };

  const downloadExpertModel = async () => {
    try {
      setIsProcessing(true);
      setIsDownloadingModel(true);
      setStatus("跨国物理专线拉取中 (ONNX 模型), 请保持网络畅通...");
      await invoke("download_model_t2");
      setStatus("底层对抗流形文件系统 (ONNX) 拉取成功！✅ 极度安全。");
    } catch(e:any) {
      setStatus(`拉取失败: ${e.toString()} ❌ 请检查网络或科学桥接。`);
    } finally {
      setIsDownloadingModel(false);
      setTimeout(() => setIsProcessing(false), 3000);
    }
  }

  const handleExecuteProtection = async (manualPath: string, batchId: string) => {
    if (!settings.output_dir) {
      setStatus("❗系统拒绝调度：请先在最下方【系统设置】里挂载输出枢纽。");
      return;
    }
    setIsProcessing(true);
    setStatus(t.status_compiling);

    try {
      const fileName = manualPath.split(/[/\\]/).pop() || manualPath;
      const originalHashRes: any = await invoke("compute_file_hash", { path: manualPath });
      
      let output_path = "";
      if (activeTab === 'Images') {
        if (isT1Enabled) {
          const t1Res: any = await invoke("protect_image_t1", { path: manualPath, outputDir: settings.output_dir });
          output_path = t1Res.output_path;
        }
        if (isT2Enabled) {
          const t2Res: any = await invoke("protect_image_t2", { path: output_path || manualPath, outputDir: settings.output_dir });
          output_path = t2Res.output_path;
        }
      } else if (activeTab === 'Text') {
        const res: any = await invoke("protect_document", { path: manualPath, outputDir: settings.output_dir });
        output_path = res.output_path;
      } else if (activeTab === 'Code') {
        const res: any = await invoke("protect_code", { path: manualPath, outputDir: settings.output_dir });
        output_path = res.output_path;
      }
      if (!output_path) throw new Error("需至少启用一个保护层约束。");

      const protectedHashRes: any = await invoke("compute_file_hash", { path: output_path });
      let otsRes = "UNANCHORED";
      if (isOtsEnabled) {
        setStatus("去中心化时间戳分发中...");
        try { otsRes = (await invoke("anchor_to_blockchain", { path: output_path }) as any).message; } catch(e:any) { otsRes = e.toString(); }
      }

      setStatus(`法律凭证封包中... (Batch ID: ${batchId})`);
      const bundleRes: any = await invoke("generate_certificate_bundle", {
        originalPath: manualPath,
        protectedPath: output_path,
        originalHash: originalHashRes.file_hash,
        protectedHash: protectedHashRes.file_hash,
        author: settings.author_name,
        copyrightSuffix: settings.copyright_suffix,
        t1Enabled: isT1Enabled,
        t2Enabled: isT2Enabled,
        otsProof: otsRes,
        arweaveTx: "LOCAL_ONLY",
        batchId: Array.isArray(manualPath) ? batchId : batchId // Single folder anti-pollution
      });

      setStatus(`防篡改矩阵部署：${fileName}`);

      const record = {
        name: fileName,
        outputPath: bundleRes.output_path,
        hash: protectedHashRes.file_hash,
        ots: otsRes,
        arweave: "LOCAL_ONLY",
        timestamp: new Date().toLocaleString(),
        batchId,
        t1Enabled: isT1Enabled,
        t2Enabled: isT2Enabled,
      };

      setLastProtectedFile(record);
      setHistoryLog(prev => [record, ...prev]);
      
      setStatus(`✅ 已受保护并完美收录于 MetaSeal_Vault 极密母盒`);
    } catch(e:any) {
      setStatus(`系统判定引擎终止: ${e.message || e}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => {
    const active = activeTab === id;
    return (
      <button 
        onClick={() => setActiveTab(id)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative group text-sm font-medium",
          active ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        )}>
        <Icon weight={active ? "fill" : "duotone"} className="w-5 h-5" />
        {label}
        {active && (
          <motion.div layoutId="nav-bg" className="absolute inset-0 bg-slate-900 -z-10 rounded-2xl" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar - Mac OS Glass style */}
      <div className="w-64 border-r border-slate-200/80 bg-white/60 backdrop-blur-xl flex flex-col z-20 shrink-0">
        <div className="h-24 flex items-center px-8 border-b border-slate-100/50">
          <img src="/enso.png" width={28} height={28} alt="MetaSeal Enso" className="mr-3 filter brightness-0" />
          <span className="font-semibold text-xl tracking-tight">元印 MetaSeal</span>
        </div>
        <div className="p-5 flex flex-col gap-1.5 flex-1 overflow-y-auto">
          <SidebarItem id="Images" icon={ImageSquare} label={t.nav_images} />
          <SidebarItem id="Text" icon={TextAa} label={t.nav_text} />
          <SidebarItem id="Code" icon={CodeBlock} label={t.nav_code} />
          <div className="h-px bg-slate-200/50 my-5 mx-3" />
          <SidebarItem id="Scanner" icon={MagnifyingGlass} label={t.nav_scanner} />
          <SidebarItem id="History" icon={ClockCounterClockwise} label={t.nav_history} />
          <div className="flex-1" />
          <SidebarItem id="Settings" icon={Gear} label={t.nav_settings} />
        </div>
      </div>

      {/* Main Glass Workspace */}
      <main className="flex-1 relative bg-slate-50/50 overflow-y-auto w-full z-10">
        
        <AnimatePresence>
          {!settings.output_dir && !onboardingDismissed && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-md">
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", damping: 25 }}
                className="bg-white/90 backdrop-blur-2xl border border-white/50 rounded-3xl p-10 max-w-md shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6 shadow-inner">
                  <img src="/enso.png" width={40} height={40} className="filter grayscale opacity-60" />
                </div>
                <h2 className="text-2xl font-semibold mb-3 tracking-tight">物理沙箱初始化</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">{t.onboarding_desc}</p>
                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setActiveTab('Settings'); setOnboardingDismissed(true); }} 
                  className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-medium shadow-xl shadow-slate-900/10">
                  {t.onboarding_btn}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-8 md:p-12 lg:px-16 w-full max-w-7xl mx-auto flex flex-col min-h-full">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="flex-1 flex flex-col gap-10"
          >
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter text-slate-900">
              {activeTab === 'Images' ? '图像资产保护' :
               activeTab === 'Text' ? '纯文本确权' : 
               activeTab === 'Code' ? '工程源码保护' :
               activeTab === 'Scanner' ? '质检解包与法务取证室' :
               activeTab === 'History' ? '操作日志' : '全局控制台'}
            </h1>

            {['Images', 'Text', 'Code'].includes(activeTab) && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[60vh] min-h-[500px]">
                <div className="lg:col-span-6 flex flex-col gap-5">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-2">Security Strategies</div>
                  
                  <motion.div whileHover={{ y: -2 }} className="bg-white rounded-3xl p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                      <div className="pr-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          <CheckCircle weight="fill" className={isT1Enabled ? "text-slate-900" : "text-slate-300"} />
                          {t.tech_standard_title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">{t.tech_standard_desc}</p>
                      </div>
                      <FluidToggle checked={isT1Enabled} onChange={setIsT1Enabled} labelActive="部署 ON" labelInactive="休眠" />
                    </div>
                  </motion.div>

                  {activeTab === 'Images' && (
                    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-3xl p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between z-10">
                      <div className="flex justify-between items-start">
                        <div className="pr-4">
                          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <WarningCircle weight="fill" className={isT2Enabled ? "text-slate-900" : "text-slate-300"} />
                            {t.tech_enhanced_title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-2 leading-relaxed">{t.tech_enhanced_desc}</p>
                          <button onClick={downloadExpertModel} disabled={isDownloadingModel} className={cn("mt-4 flex items-center gap-1.5 text-xs transition-colors font-medium underline-offset-4", isDownloadingModel ? "text-amber-500 cursor-wait" : "text-slate-500 hover:text-slate-900 hover:underline")}>
                            <DownloadSimple className={isDownloadingModel ? "animate-bounce" : ""} /> {isDownloadingModel ? "正在拉取核心组件 (14MB)..." : "拉取 ONNX 本地离线引擎包"}
                          </button>
                        </div>
                        <FluidToggle checked={isT2Enabled} onChange={setIsT2Enabled} labelActive="部署 ON" labelInactive="休眠" />
                      </div>
                    </motion.div>
                  )}

                  <motion.div whileHover={{ y: -2 }} className="bg-white rounded-3xl p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                      <div className="pr-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          <ShieldCheck weight="fill" className={isOtsEnabled ? "text-slate-900" : "text-slate-300"} />
                          {t.archive_ots_title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">{t.archive_ots_desc}</p>
                        <button onClick={() => openShell("https://github.com/Dolan")} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                          <ArrowUpRight /> 查阅新手如何配置上链
                        </button>
                      </div>
                      <FluidToggle checked={isOtsEnabled} onChange={setIsOtsEnabled} labelActive="部署 ON" labelInactive="休眠" />
                    </div>
                  </motion.div>
                </div>

                <div className="lg:col-span-6 flex flex-col h-full relative">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-2 mb-5 opacity-0">Dropzone</div>
                  <motion.div 
                    whileHover={!isProcessing ? { scale: 1.01 } : {}} whileTap={!isProcessing ? { scale: 0.99 } : {}}
                    onClick={isProcessing ? undefined : handlePickFileAndProtect}
                    onDragOver={handleDragOver}
                    className={cn(
                      "flex-1 bg-white rounded-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden relative",
                      isProcessing ? "border-slate-100 scale-100 pointer-events-none" : "border-slate-200 border-dashed hover:border-slate-400"
                    )}
                  >
                    {isProcessing || isDownloadingModel ? (
                      <div className="flex flex-col items-center z-10">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}>
                          <Record weight="duotone" className="w-20 h-20 text-slate-900" />
                        </motion.div>
                        <p className="mt-8 font-medium tracking-wide text-slate-600 animate-pulse">{status}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-slate-400 group-hover:text-slate-600 transition-colors z-10 text-center px-4">
                        <UploadSimple weight="duotone" className="w-20 h-20 mb-6 text-slate-300" />
                        <h4 className="text-xl font-medium text-slate-800 tracking-tight mb-3">
                          {activeTab === 'Images' ? '放入您的原始画稿 / 商业设计图，注入防爬装甲' :
                           activeTab === 'Text' ? '放入您的首发小说 / 研究底稿 / 研报，埋入隐形防伪' :
                           '放入尚未开源的核心切片算法，锚记您的首发署名'}
                        </h4>
                        <p className="text-sm font-medium tracking-wide opacity-60 bg-slate-100 px-4 py-1.5 rounded-full mb-2">
                           {activeTab === 'Images' ? '(支持 .png, .jpg, .webp)' :
                           activeTab === 'Text' ? '(支持 .txt, .md, .csv)' :
                           '(支持 .rs, .py, .js, .ts, .c, .cpp)'}
                        </p>
                        <p className="text-xs font-medium tracking-wide opacity-50">⚡ 纯静默式处理 | 支持无损 99+ 多文件并发</p>
                      </div>
                    )}
                    
                    {/* Background liquid effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent pointer-events-none" />
                  </motion.div>
                </div>
              </div>
            )}

            {activeTab === 'Scanner' && (
              <div className="flex flex-col mx-auto w-full max-w-4xl h-[60vh]">
                <div className="text-sm font-semibold text-slate-500 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> 法律数据分析与反篡改实验台
                </div>
                
                {/* 彻底分离的冷感色调与质检盒外形 */}
                <motion.div 
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={handlePickVerifyFile}
                  onDragOver={handleDragOver}
                  className="w-full flex-1 bg-slate-900 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer border border-slate-800 relative overflow-hidden ring-4 ring-slate-900/5 shadow-2xl shadow-slate-900/40"
                >
                  {/* Scanner Grid Line */}
                  <motion.div 
                     animate={{ y: ["-10%", "110%"] }} 
                     transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                     className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-emerald-500/10 border-b border-emerald-500/30 z-0 pointer-events-none" />
                     
                  <MagnifyingGlass weight="duotone" className="w-20 h-20 text-slate-600 mb-8 z-10" />
                  <h4 className="text-xl font-medium text-slate-300 z-10 tracking-widest">{status || "拖入疑似抄袭图像 / OTS时间戳文件 / 或包裹(Certificate)"}</h4>
                  <p className="text-slate-500 text-sm mt-3 font-mono z-10 uppercase">&lt; 唤醒哈希底片深层分析 &gt;</p>
                </motion.div>

                <AnimatePresence mode="popLayout">
                  {scannerResult && (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="w-full mt-6"
                    >
                      <div className={cn("p-8 rounded-3xl flex flex-col gap-4 border", scannerResult.message?.includes('✅') ? "bg-emerald-950/40 border-emerald-900 text-emerald-100 backdrop-blur-xl" : "bg-rose-950/40 border-rose-900 text-rose-100 backdrop-blur-xl")}>
                        <div className="flex items-center gap-4">
                          {scannerResult.message?.includes('✅') ? <CheckCircle weight="fill" className="w-8 h-8 text-emerald-400" /> : <WarningCircle weight="fill" className="w-8 h-8 text-rose-500" />}
                          <h4 className="font-semibold text-lg uppercase tracking-widest">
                            {scannerResult.message?.includes('✅') ? "版权溯源匹配达成" : "未挂载鉴权印记或已被篡改"}
                          </h4>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap mt-2 font-mono opacity-80">{scannerResult.message}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeTab === 'History' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {historyLog.map((log, i) => (
                  <motion.div key={i} whileHover={{ y: -4 }} className="bg-white rounded-3xl p-7 flex flex-col shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 relative group overflow-hidden">
                    <div className="flex justify-between items-start mb-6 z-10">
                      <FileText weight="duotone" className="w-10 h-10 text-slate-300" />
                      <span className="text-xs font-medium bg-slate-100 text-slate-500 px-3 py-1 rounded-full">批次: {log.batchId}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 truncate mb-2 z-10">{log.name}</h4>
                    <div className="text-[10px] font-mono text-slate-400 truncate mb-8 bg-slate-50 p-3 rounded-xl border border-slate-100 z-10">{log.hash}</div>
                    
                    <div className="mt-auto flex justify-between items-center z-10">
                      <div className="flex gap-2">
                        {log.t1Enabled && <div className="w-2 h-2 rounded-full bg-slate-900" title="T1 开启" />}
                        {log.t2Enabled && <div className="w-2 h-2 rounded-full bg-slate-500" title="T2 开启" />}
                        {log.ots !== 'UNANCHORED' && <div className="w-2 h-2 rounded-full bg-slate-300" title="OTS 开启" />}
                      </div>
                      <button onClick={() => { setLastProtectedFile(log); setShowCertificate(true); }} className="text-xs font-semibold text-slate-900 tracking-wide hover:underline underline-offset-4">
                        审阅法务凭借 &rarr;
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'Settings' && (
              <div className="max-w-4xl w-full flex flex-col gap-8">
                <div className="bg-white rounded-3xl p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
                  <h3 className="font-semibold text-xl text-slate-900 mb-8 border-b border-slate-100 pb-4">创作者法律署名配置</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-semibold text-slate-700">署名标识 (Author)</label>
                      <input type="text" value={settings.author_name} onChange={(e) => saveSettingsToRust({...settings, author_name: e.target.value})} className="px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none transition-all font-medium text-sm" />
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-semibold text-slate-700">追加声明条款 (Suffix)</label>
                      <input type="text" value={settings.copyright_suffix} onChange={(e) => saveSettingsToRust({...settings, copyright_suffix: e.target.value})} className="px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none transition-all font-medium text-sm" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-3xl p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
                  <h3 className="font-semibold text-xl text-slate-900 mb-8 border-b border-slate-100 pb-4">Arweave 底层网关连接 (JWK)</h3>
                  <div className="flex flex-col gap-3">
                     <label className="text-sm font-semibold text-slate-700">密钥挂载 (选填以激活永存记录)</label>
                     <input type="password" placeholder="[您的 JWK JSON 文本，系统严格确保仅用于底层通讯不泄露]" value={settings.arweave_key || ''} onChange={(e) => saveSettingsToRust({...settings, arweave_key: e.target.value})} className="px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none transition-all font-medium text-sm font-mono tracking-widest" />
                     <button onClick={() => openShell("https://github.com/Dolan")} className="text-xs text-slate-400 hover:text-slate-900 transition-colors block mt-2 underline-offset-4 text-left">获取教程：什么是 Arweave JWK？如何白嫖上链？</button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
                  <h3 className="font-semibold text-xl text-slate-900 mb-8 border-b border-slate-100 pb-4">本地防拥堵与沙箱输出链路</h3>
                  <div className="flex flex-col gap-8">
                    <div className="flex justify-between items-center group">
                      <div>
                        <div className="text-sm font-semibold text-slate-700 mb-1.5">主分配输出枢纽 (自动收纳多重会话夹)</div>
                        <div className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 inline-block">{settings.output_dir || '当前处于未挂载状态，引擎拒绝执行。'}</div>
                      </div>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handlePickFolder('output_dir')} className={cn("px-6 py-3 text-sm font-semibold rounded-2xl transition-all shadow-lg", settings.output_dir ? "bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-none" : "bg-slate-900 text-white shadow-slate-900/20")}>
                        {settings.output_dir ? '重新分配枢纽' : '指认挂载点'}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {showCertificate && lastProtectedFile && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }} animate={{ opacity: 1, backdropFilter: "blur(12px)" }} exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 p-8 overflow-y-auto cursor-pointer"
            onClick={() => setShowCertificate(false)}
          >
            <motion.div onClick={(e) => e.stopPropagation()} initial={{ y: 30, scale: 0.95, filter: "blur(10px)" }} animate={{ y: 0, scale: 1, filter: "blur(0px)" }} exit={{ y: 20, scale: 0.95, filter: "blur(10px)", opacity: 0 }} transition={{ type: "spring", damping: 25 }} className="w-full max-w-4xl relative shadow-2xl overflow-hidden rounded-2xl cursor-auto my-auto">
              <Certificate
                fileName={lastProtectedFile.name} fileHash={lastProtectedFile.hash} timestamp={lastProtectedFile.timestamp} otsProof={lastProtectedFile.ots} arweaveTxId={lastProtectedFile.arweave} t1Enabled={lastProtectedFile.t1Enabled} t2Enabled={lastProtectedFile.t2Enabled} authorName={settings.author_name} copyrightSuffix={settings.copyright_suffix} onClose={() => setShowCertificate(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
