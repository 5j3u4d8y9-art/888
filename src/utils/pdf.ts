import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Exports a target DOM element to a high-quality A4 PDF file using html2canvas and jsPDF.
 * Implements clean multi-page pagination if content overflows.
 */
export async function exportElementToPDF(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Target element with id "${elementId}" not found for PDF export.`);
    return false;
  }

  // Find scrollable parent to reset scroll temporarily for capturing perfect image
  const scrollContainer = element.parentElement;
  const originalScrollTop = scrollContainer ? scrollContainer.scrollTop : 0;

  try {
    // 1. Reset scroll so html2canvas starts from the very top of the elements
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }

    // 2. Capture the canvas with optimized parameters
    // scale: 2 is perfect for high quality text while keeping the size small & fast
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: true,
      backgroundColor: '#ffffff',
    });

    // 3. Restore the scroll container back to its original view position
    if (scrollContainer) {
      scrollContainer.scrollTop = originalScrollTop;
    }

    // 4. Calculate dimensions for PDF A4 format
    const imgWidth = 210; // A4 width: 210mm
    const pageHeight = 295; // A4 height: 297mm (leaving a small 2mm offset margin)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add page with high resolution image
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Output remaining pages if it exceeds 1 page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    // 5. Try triggering the download (works in normal windows and supporting frames)
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Failed to generate automated PDF:', error);
    
    // Fallback: restore scroll if error occurs
    if (scrollContainer) {
      scrollContainer.scrollTop = originalScrollTop;
    }
    return false;
  }
}
