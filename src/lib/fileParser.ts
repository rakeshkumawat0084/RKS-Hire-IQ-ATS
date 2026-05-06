import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up worker for pdf.js safely in browser context
const VERSION = '5.6.205';
const pdfWorkerUrl = `https://unpkg.com/pdfjs-dist@${VERSION}/build/pdf.worker.min.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    if (!fullText.trim()) {
      throw new Error('The PDF file appears to be empty or contains only images/scanned content that cannot be read.');
    }

    return fullText;
  } catch (error: any) {
    console.error('PDF parsing error:', error);
    if (error.name === 'InvalidPDFException' || error.message?.includes('Invalid PDF structure')) {
      throw new Error('The PDF file is corrupted or not a valid PDF document.');
    }
    if (error.message?.includes('Password')) {
      throw new Error('The PDF file is password protected. Please remove the password and try again.');
    }
    throw new Error('Failed to extract text from PDF. It might be corrupted or in an unsupported format.');
  }
};

export const extractTextFromDocx = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (!result.value.trim()) {
       throw new Error('The DOCX file appears to be empty or contains only non-text elements.');
    }
    
    return result.value;
  } catch (error: any) {
    console.error('DOCX parsing error:', error);
    if (error.message?.includes('not a zip file') || error.message?.includes('corrupted')) {
      throw new Error('The DOCX file is corrupted or not a valid Word document (only .docx is supported, not .doc).');
    }
    throw new Error('Failed to extract text from DOCX. It might be corrupted or in an unsupported format.');
  }
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  if (!file || file.size === 0) {
    throw new Error('The selected file is empty.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  
  try {
    if (extension === 'pdf') {
      return await extractTextFromPdf(file);
    } else if (extension === 'docx') {
      return await extractTextFromDocx(file);
    } else if (extension === 'txt') {
      const text = await file.text();
      if (!text.trim()) throw new Error('The text file is empty.');
      return text;
    } else {
      throw new Error(`Unsupported file type (.${extension}). Please upload a PDF, DOCX, or TXT file.`);
    }
  } catch (err: any) {
    // Re-throw the specific error if it's already one of our custom errors
    throw err;
  }
};
