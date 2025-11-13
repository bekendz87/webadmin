import React from 'react';
import jsPDF from 'jspdf';

interface PDFGeneratorProps {
  title?: string;
  content: string;
  fileName?: string;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ 
  title = 'Document', 
  content, 
  fileName = 'document.pdf' 
}) => {
  
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    
    // Add content
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(content, 170);
    doc.text(splitText, 20, 40);
    
    // Save the PDF
    doc.save(fileName);
  };

  return (
    <button 
      onClick={generatePDF}
      className="pdf-generate-btn"
    >
      Generate PDF
    </button>
  );
};

export default PDFGenerator;
