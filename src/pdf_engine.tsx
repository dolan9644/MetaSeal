
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Certificate from './components/Certificate';
import { invoke } from '@tauri-apps/api/core';

export const autoGenerateAndSavePdf = async (record: any, settings: any, bundlePath: string) => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '800px'; // Give it a fixed width so it formats correctly
  document.body.appendChild(container);

  const root = createRoot(container);
  
  await new Promise<void>(resolve => {
    root.render(
      <Certificate 
        fileName={record.name} fileHash={record.hash} timestamp={record.timestamp}
        otsProof={record.ots} arweaveTxId={record.arweave} t1Enabled={record.t1Enabled} 
        t2Enabled={record.t2Enabled} authorName={settings.author_name} 
        copyrightSuffix={settings.copyright_suffix} onClose={() => {}} 
      />
    );
    // Give React time to flush layout
    setTimeout(resolve, 100); 
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
  const arrayBuffer = pdf.output('arraybuffer');
  
  root.unmount();
  document.body.removeChild(container);
  
  const safeFilename = record.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  await invoke('save_pdf', { 
    path: `${bundlePath}/Certificate_${safeFilename}.pdf`, 
    data: Array.from(new Uint8Array(arrayBuffer)) 
  });
};
