import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
      scale: 2,
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
    <div className="certificate-overlay">
      <div className="certificate-modal">
        <div className="certificate-actions">
          <button onClick={downloadPDF} className="cert-btn primary">下载 PDF 证书</button>
          <button onClick={onClose} className="cert-btn secondary">关闭</button>
        </div>
        
        <div className="certificate-paper" ref={certificateRef}>
          {/* Decorative Border */}
          <div className="cert-border"></div>
          
          <div className="cert-content">
            <div className="cert-header">
              <div className="cert-logo">◈</div>
              <div className="cert-id">CERTIFICATE ID: MS-{fileHash.substring(0, 12).toUpperCase()}</div>
            </div>

            <h1 className="cert-title">数字资产原创存证证书</h1>
            <h2 className="cert-subtitle">Certificate of Provenance & Protection</h2>

            <div className="cert-statement">
              兹证明，该项由人类创作者 <strong>{authorName}</strong> 产出的数字艺术资产已通过 <strong>MetaSeal (元印)</strong> 保护引擎进行全链路版权保护及法律存证。
              所有加密特征已锚定至去中心化信任网络。{copyrightSuffix && ` (注: ${copyrightSuffix})`}
            </div>

            <div className="cert-grid">
              <div className="cert-item">
                <label>资产名称 Asset Name</label>
                <div className="value">{fileName}</div>
              </div>
              <div className="cert-item">
                <label>数字指纹 SHA-256 Hash</label>
                <div className="value mono">{fileHash}</div>
              </div>
              <div className="cert-item">
                <label>存证时间 Timestamp</label>
                <div className="value">{timestamp}</div>
              </div>
            </div>

            <div className="cert-divider"></div>

            <div className="cert-engine-stats">
              <div className="engine-card">
                <div className="engine-status">{t1Enabled ? '✓' : '—'}</div>
                <div className="engine-label">数字水印 (Invisible Watermark)</div>
                <div className="engine-desc">作者标识已安全嵌入。</div>
              </div>
              <div className="engine-card">
                <div className="engine-status">{t2Enabled ? '✓' : '—'}</div>
                <div className="engine-label">AI 干扰防护 (Anti-AI Training)</div>
                <div className="engine-desc">已应用对抗性噪声。</div>
              </div>
            </div>

            <div className="cert-footer">
              <div className="trust-badges">
                <div className="badge">
                  <span>BITCOIN ARCHIVE (OTS)</span>
                  <small>证明: {otsProof.substring(0, 8)}...</small>
                </div>
                {arweaveTxId && (
                  <div className="badge">
                    <span>PERMAWEB (ARWEAVE)</span>
                    <small>存证: {arweaveTxId.substring(0, 10)}...</small>
                  </div>
                )}
              </div>
              
              <div className="cert-signature">
                <div className="sig-line"></div>
                <div className="sig-label">MetaSeal 验证中心官方签章</div>
              </div>
            </div>

            <div className="cert-watermark">METASEAL PROTOCOL</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
