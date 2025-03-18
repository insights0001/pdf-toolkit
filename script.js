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
                    const { PDFDocument } = await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm');

                    const pdfDoc = await PDFDocument.load(existingPdfBytes);
                    const pages = pdfDoc.getPages();

                    // Reduce image quality and optimize structure
                    for (let page of pages) {
                        const { width, height } = page.getSize();
                        page.setSize(width * 0.9, height * 0.9); // Slightly reduce size to optimize
                    }

                    // Remove unnecessary metadata
                    pdfDoc.setTitle("");
                    pdfDoc.setAuthor("");
                    pdfDoc.setSubject("");

                    const compressedPdfBytes = await pdfDoc.save();
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
