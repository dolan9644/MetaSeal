
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Certificate from './components/Certificate';
import { invoke } from '@tauri-apps/api/core';

export const autoGenerateAndSavePdf = async (record: any, settings: any, bundlePath: string) => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.opacity = '0.01';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '-9999';
  container.style.width = '800px'; 
  document.body.appendChild(container);

  const root = createRoot(container);
  
  await new Promise<void>(resolve => {
    root.render(
      <Certificate 
        fileName={record.name} fileHash={record.hash} timestamp={record.timestamp}
        otsProof={record.ots} arweaveTxId={record.arweave} t1Enabled={record.t1Enabled} 
        t2Enabled={record.t2Enabled} authorName={settings.author_name} 
        copyrightSuffix={settings.copyright_suffix} onClose={() => {}} 
        hideControls={true}
      />
    );
    // Give React time to flush layout and animations
    setTimeout(resolve, 300); 
  });

  const canvas = await html2canvas(container.childNodes[0] as HTMLElement, {
    scale: 2, 
    useCORS: true,
    backgroundColor: '#ffffff'
  });
  
  const imgData = canvas.toDataURL('image/jpeg', 0.85);
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  const dataUri = pdf.output('datauristring');
  const base64Data = typeof dataUri === 'string' ? dataUri.split(',')[1] : '';
  
  root.unmount();
  document.body.removeChild(container);
  
  const safeFilename = record.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  await invoke('save_pdf_b64', { 
    path: `${bundlePath}/Certificate_${safeFilename}.pdf`, 
    b64Data: base64Data 
  });
};
