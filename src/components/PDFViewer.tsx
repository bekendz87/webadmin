import React, { useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PDFViewerProps {
  fileUrl?: string;
  height?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  fileUrl, 
  height = '600px' 
}) => {
  const [pdfFile, setPdfFile] = useState<string | null>(fileUrl || null);
  
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const fileUrl = URL.createObjectURL(file);
      setPdfFile(fileUrl);
    }
  };

  return (
    <div className="pdf-viewer-container">
      {!pdfFile && (
        <div className="upload-section">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="file-input"
          />
        </div>
      )}
      
      {pdfFile && (
        <div style={{ height }}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <Viewer
              fileUrl={pdfFile}
              plugins={[defaultLayoutPluginInstance]}
            />
          </Worker>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
