document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const uploadArea = document.getElementById("uploadArea");
  const compressBtn = document.querySelector(".compress-btn");
  const fileName = document.getElementById("fileName");
  let selectedFile = null;

  // 1. File Selection Handlers
  uploadArea.addEventListener("click", () => fileInput.click());
  
  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) {
      selectedFile = fileInput.files[0];
      fileName.textContent = selectedFile.name;
    }
  });

  // 2. Drag-and-Drop Handlers
  uploadArea.addEventListener("dragover", (e) => e.preventDefault());
  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) {
      selectedFile = e.dataTransfer.files[0];
      fileName.textContent = selectedFile.name;
    }
  });

  // 3. Compression Handler (Fixed)
  compressBtn.addEventListener("click", async () => {
    if (!selectedFile) {
      alert("Please select a PDF first!");
      return;
    }

    compressBtn.disabled = true;
    compressBtn.textContent = "Compressing...";
    
    try {
      const compressedPDF = await compressPDF(selectedFile);
      downloadCompressedPDF(compressedPDF);
    } catch (error) {
      alert(`Error: ${error.message}`); // Show detailed error
    } finally {
      compressBtn.disabled = false;
      compressBtn.textContent = "Compress Now";
    }
  });

  // 4. Fixed compressPDF Function
  async function compressPDF(file) {
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const { PDFDocument } = await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm');
        
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();

        // A. Font Replacement
        const font = await pdfDoc.embedFont(PDFDocument.StandardFonts.Helvetica);
        pages.forEach(page => page.setFont(font));

        // B. Fixed Image Downsampling
        for (const page of pages) {
          const images = await page.getImages();
          for (const image of images) {
            const { width, height } = image.scale;
            image.draw({
              x: 0,
              y: 0,
              width: width * 0.5, // Resize to 50%
              height: height * 0.5,
            });
          }
        }

        // C. Save PDF
        const pdfBytes = await pdfDoc.save();
        resolve(new Uint8Array(pdfBytes));
      } catch (error) {
        reject(error);
      }
    });
  }

  // 5. Download Handler
  function downloadCompressedPDF(pdfBytes) {
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "compressed.pdf";
    link.click();
  }
});
