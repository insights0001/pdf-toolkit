document.addEventListener("DOMContentLoaded", async function () {
  const fileInput = document.getElementById("fileInput");
  const uploadArea = document.getElementById("uploadArea");
  const compressBtn = document.querySelector(".compress-btn");
  const progressBar = document.getElementById("progressBar");
  const progressContainer = document.querySelector(".progress-container");

  let selectedFile = null;

  // Open file dialog when clicking the upload area
  uploadArea.addEventListener("click", () => fileInput.click());

  // Handle file selection
  fileInput.addEventListener("change", function () {
    if (fileInput.files.length > 0) {
      selectedFile = fileInput.files[0];
      document.querySelector(".upload-area p").textContent = selectedFile.name;
    }
  });

  // Drag-and-drop handlers
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      selectedFile = file;
      document.querySelector(".upload-area p").textContent = file.name;
    }
  });

  // Compress button click handler
  compressBtn.addEventListener("click", async function () {
    if (!selectedFile) {
      alert("Please select a PDF file first.");
      return;
    }

    // Disable button and show progress bar
    compressBtn.textContent = "Compressing...";
    compressBtn.disabled = true;
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";

    // Simulate progress (replace with actual steps)
    const simulateProgress = () => {
      let width = 0;
      const interval = setInterval(() => {
        if (width >= 100) clearInterval(interval);
        progressBar.style.width = width + "%";
        width += 10;
      }, 300);
    };

    simulateProgress();

    try {
      const compressedPDF = await compressPDF(selectedFile);
      downloadCompressedPDF(compressedPDF);
    } catch (error) {
      alert("Compression failed: " + error.message);
    } finally {
      compressBtn.textContent = "Compress Now";
      compressBtn.disabled = false;
      progressContainer.style.display = "none";
    }
  });

  // Validate file type
  function validateFile(file) {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return false;
    }
    return true;
  }

  // Compress PDF
  async function compressPDF(file) {
    const compressionLevel = document.getElementById("compressionLevel").value;
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async function (event) {
        try {
          const existingPdfBytes = new Uint8Array(event.target.result);
          const { PDFDocument, StandardFonts } = await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm');
          const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });

          // Font replacement (skip for "Low" compression)
          const pages = pdfDoc.getPages();
          if (compressionLevel !== "low") {
            const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            for (const page of pages) {
              page.setFont(timesRomanFont);
            }
          }

          // Image optimization (for "High" compression)
          if (compressionLevel === "high") {
            await downsampleImages(pdfDoc);
          }

          // Save optimized PDF
          const compressedPdfBytes = await pdfDoc.save({
            useObjectStreams: true,
            updateFieldAppearances: false,
          });

          resolve(compressedPdfBytes);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  // Download compressed PDF
  function downloadCompressedPDF(pdfBytes) {
    const originalSize = (selectedFile.size / 1024).toFixed(2) + " KB";
    const compressedSize = (pdfBytes.length / 1024).toFixed(2) + " KB";

    // Display feedback
    const feedback = document.createElement("div");
    feedback.className = "size-feedback";
    feedback.innerHTML = `
      <p>Original: ${originalSize}</p>
      <p>Compressed: ${compressedSize}</p>
    `;
    document.body.appendChild(feedback);

    // Download logic
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "compressed.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Remove feedback after 5 seconds
    setTimeout(() => feedback.remove(), 5000);
  }

  // Example image downsampling (simplified)
  async function downsampleImages(pdfDoc) {
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const images = await page.getImages();
      for (const image of images) {
        const { width, height } = image.scale;
        image.scale({ width: width * 0.5, height: height * 0.5 });
      }
    }
  }
});
