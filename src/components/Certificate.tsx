import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DownloadSimple, X } from "@phosphor-icons/react";

interface CertificateProps {
  fileName: string;
  fileHash: string;
  timestamp: string;
  otsProof: string;
  arweaveTxId?: string;
  t1Enabled: boolean;
  t2Enabled: boolean;
  authorName: string;
  copyrightSuffix: string;
  onClose: () => void;
}

const Certificate: React.FC<CertificateProps> = ({ 
  fileName, 
  fileHash, 
  timestamp, 
  otsProof, 
  arweaveTxId,
  t1Enabled, 
  t2Enabled,
  authorName,
  copyrightSuffix,
  onClose 
}) => {
  const certificateRef = React.useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!certificateRef.current) return;
    
    const canvas = await html2canvas(certificateRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`MetaSeal_Certificate_${fileName.split('.')[0]}.pdf`);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-col gap-4 w-full max-w-2xl text-slate-900">
        
        {/* Certificate Paper */}
        <div ref={certificateRef} className="bg-white px-12 py-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] relative overflow-hidden border border-slate-200">
          
          <div className="absolute inset-0 m-4 border border-slate-200/50 pointer-events-none" />
          <div className="absolute inset-0 m-[18px] border border-slate-100 pointer-events-none" />
          
          <div className="flex justify-between items-end border-b-2 border-slate-900 pb-4 mb-10">
            <div className="font-serif italic text-2xl font-semibold tracking-tighter">MetaSeal</div>
            <div className="text-[10px] font-mono tracking-widest text-slate-400">ID: MS-{fileHash.substring(0,12).toUpperCase()}</div>
          </div>

          <h1 className="text-3xl font-semibold tracking-tighter text-slate-900 mb-1">数字资产原创存证证书</h1>
          <h2 className="text-xs tracking-widest uppercase text-slate-400 font-medium mb-12">Certificate of Provenance & Protection</h2>

          <div className="text-sm leading-relaxed text-slate-600 mb-12 text-justify">
            兹证明，该项由人类创作者 <span className="font-semibold text-slate-900">{authorName}</span> 产出的数字资产已通过 <span className="font-semibold text-slate-900">MetaSeal (元印)</span> 保护引擎进行全链路版权保护及防篡改处理。
            其加密特征码已成功提取并锚定至去中心化信任网络。{copyrightSuffix && ` (注: ${copyrightSuffix})`}
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-12 border-l border-slate-200 pl-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">资产名称 Asset</div>
              <div className="font-medium text-sm text-slate-900 truncate">{fileName}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">存证时间 Checkpoint</div>
              <div className="font-medium text-sm text-slate-900 truncate">{timestamp}</div>
            </div>
            <div className="col-span-2">
              <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">唯一特征码 SHA-256 Hash</div>
              <div className="font-mono text-xs text-slate-800 break-all bg-slate-50 p-3 rounded">{fileHash}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-16">
            <div className="p-4 bg-slate-50 border border-slate-100/50">
              <div className="font-mono text-[10px] text-slate-400 mb-2">[ LAYER 1 ]</div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>数字版权印记</span>
                <span className={t1Enabled ? "text-emerald-500" : "text-slate-300"}>{t1Enabled ? "INJECTED" : "OMITTED"}</span>
              </div>
              <div className="text-[10px] text-slate-500">Invisible watermark injection.</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100/50">
              <div className="font-mono text-[10px] text-slate-400 mb-2">[ LAYER 2 ]</div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>反抓取对抗层</span>
                <span className={t2Enabled ? "text-emerald-500" : "text-slate-300"}>{t2Enabled ? "ACTIVE" : "OMITTED"}</span>
              </div>
              <div className="text-[10px] text-slate-500">Adversarial noise shield.</div>
            </div>
          </div>

          <div className="flex justify-between items-end border-t border-slate-100 pt-8 mt-4">
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-mono bg-slate-900 text-white px-2 py-0.5 inline-block">OTS ANCHOR: {otsProof.substring(0, 16)}...</div>
              {arweaveTxId && arweaveTxId !== "LOCAL_ONLY" && (
                <div className="text-[10px] font-mono bg-blue-600 text-white px-2 py-0.5 inline-block">ARWEAVE DB: {arweaveTxId.substring(0, 16)}...</div>
              )}
            </div>
            <div className="text-right">
              <div className="border-b border-slate-300 w-32 mb-2"></div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500">验证中心官方签发</div>
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={downloadPDF} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded-2xl hover:bg-slate-800 transition-colors btn-tactile shadow-lg">
            <DownloadSimple weight="bold" /> 保存法律存证件 (.PDF)
          </button>
          <button onClick={onClose} className="flex items-center justify-center w-12 h-12 bg-white text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors btn-tactile">
            <X weight="bold" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Certificate;
