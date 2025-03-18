document.addEventListener("DOMContentLoaded", async function () {
    const fileInput = document.getElementById("fileInput");
    const uploadArea = document.querySelector(".upload-area");
    const compressBtn = document.querySelector(".compress-btn");

    let selectedFile = null;

    // Handle file selection
    fileInput.addEventListener("change", function () {
        selectedFile = fileInput.files[0];
        if (selectedFile) {
            document.querySelector(".upload-area p").textContent = selectedFile.name;
        }
    });

    // Handle compression button click
    compressBtn.addEventListener("click", async function () {
        if (!selectedFile) {
            alert("Please select a PDF file first.");
            return;
        }

        compressBtn.textContent = "Compressing...";
        compressBtn.disabled = true;

        try {
            const compressedPDF = await compressPDF(selectedFile);
            downloadCompressedPDF(compressedPDF);
        } catch (error) {
            alert("Compression failed: " + error.message);
        }

        compressBtn.textContent = "Compress Now";
        compressBtn.disabled = false;
    });

    async function compressPDF(file) {
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onload = async function (event) {
                try {
                    const existingPdfBytes = new Uint8Array(event.target.result);
                    const { PDFDocument, StandardFonts, rgb } = await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm');

                    const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
                    const pages = pdfDoc.getPages();

                    // Reduce page size
                    for (let page of pages) {
                        const { width, height } = page.getSize();
                        page.setSize(width * 0.85, height * 0.85);
                    }

                    // Remove metadata
                    pdfDoc.setTitle("");
                    pdfDoc.setAuthor("");
                    pdfDoc.setSubject("");

                    // Remove annotations
                    for (let page of pages) {
                        page.node.set("Annots", null);
                    }

                    // Compress images
                    const jpgImages = pdfDoc.getImages();
                    for (const img of jpgImages) {
                        const reducedImg = await pdfDoc.embedJpg(img.bytes, { quality: 0.3 });
                        img.replaceWith(reducedImg);
                    }

                    const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: true });
                    resolve(compressedPdfBytes);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
    }

    function downloadCompressedPDF(pdfBytes) {
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "compressed.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
