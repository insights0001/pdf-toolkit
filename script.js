document.addEventListener("DOMContentLoaded", () => {
  // ... previous setup code ...

  async function compressPDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // 1. CORRECT PDF-LIB IMPORT
      const { PDFDocument, StandardFonts } = await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm');
      
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // 2. PROPER FONT EMBEDDING
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // 3. SAFE IMAGE PROCESSING
      for (const page of pages) {
        // Set font for all text
        page.setFont(helveticaFont);
        
        // Process images only if they exist
        const images = await page.getImages();
        if (images.length > 0) {
          images.forEach(image => {
            const { width, height } = image.scale;
            image.scale(width * 0.8, height * 0.8); // More conservative scaling
          });
        }
      }

      // 4. SAFE METADATA REMOVAL
      pdfDoc.setTitle("Compressed PDF");
      pdfDoc.setAuthor("");
      
      const pdfBytes = await pdfDoc.save();
      return new Uint8Array(pdfBytes);
      
    } catch (error) {
      throw new Error(`Failed to compress PDF: ${error.message}`);
    }
  }

  // ... rest of the code ...
});
