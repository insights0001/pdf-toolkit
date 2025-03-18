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
                    const { PDFDocument, rgb } = await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm');

                    const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });

                    // Reduce Image Quality & DPI
                    for (const page of pdfDoc.getPages()) {
                        const { width, height } = page.getSize();
                        page.setSize(width * 0.85, height * 0.85); // Reduce page size

                        const embeddedImages = page.node.dict.get(pdfDoc.context.obj("XObject")) || {};
                        for (const key in embeddedImages) {
                            const img = await pdfDoc.embedPng(await embeddedImages[key].data);
                            page.drawImage(img, {
                                x: 0,
                                y: 0,
                                width: width * 0.85,
                                height: height * 0.85,
                                opacity: 0.8, // Reduce opacity slightly for compression
                            });
                        }
                    }

                    // Flatten Forms (Remove interactive elements)
                    const form = pdfDoc.getForm();
                    if (form) {
                        form.flatten();
                    }

                    // Remove Annotations (Comments, Highlights, etc.)
                    pdfDoc.getPages().forEach(page => {
                        page.node.set(pdfDoc.context.obj("Annots"), []);
                    });

                    // Remove Metadata & Optimize Structure
                    pdfDoc.setTitle("");
                    pdfDoc.setAuthor("");
                    pdfDoc.setSubject("");
                    pdfDoc.setProducer("");
                    pdfDoc.setCreator("");

                    // Compress Fonts (Subset fonts to include only used characters)
                    pdfDoc.getFonts().forEach(font => {
                        font.subset();
                    });

                    // Save compressed PDF
                    const compressedPdfBytes = await pdfDoc.save({
                        useObjectStreams: true, // Further compression
                        updateFieldAppearances: false, // Reduce form complexity
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
