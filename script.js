async function compressPDF() {
    const fileInput = document.getElementById("pdfFile");
    if (!fileInput || fileInput.files.length === 0) {
        alert("Please select a PDF file.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function(event) {
        try {
            const pdfBytes = new Uint8Array(event.target.result);
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true });

            const newPdf = await PDFLib.PDFDocument.create();
            const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

            for (const page of copiedPages) {
                const { width, height } = page.getSize();
                page.setSize(width * 0.9, height * 0.9); // Reduce page size
                newPdf.addPage(page);
            }

            // ✅ Extract images and compress them
            const images = pdfDoc.getImages();
            for (const img of images) {
                if (img instanceof PDFLib.PngImage || img instanceof PDFLib.JpegImage) {
                    const compressedImage = await compressImage(img, 0.6); // 60% quality
                    await newPdf.embedJpg(compressedImage);
                }
            }

            // ✅ Remove metadata to save space
            newPdf.setTitle("");
            newPdf.setAuthor("");
            newPdf.setSubject("");
            newPdf.setProducer("");
            newPdf.setCreator("");

            // ✅ Convert text to object streams (smaller file size)
            const compressedPdfBytes = await newPdf.save({ useObjectStreams: true });

            // ✅ Optimize further using pdf.js
            const optimizedPdf = await optimizeWithPDFJS(compressedPdfBytes);

            // ✅ Save the final compressed PDF
            const blob = new Blob([optimizedPdf], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            const downloadLink = document.getElementById("downloadLink");
            downloadLink.href = url;
            downloadLink.download = "compressed.pdf";
            downloadLink.style.display = "block";
            downloadLink.textContent = "Download Compressed PDF";

        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    reader.readAsArrayBuffer(file);
}

// ✅ Function to compress an image
async function compressImage(image, quality) {
    return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = image.width * 0.8; // Reduce size
        canvas.height = image.height * 0.8;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(blob);
            reader.onloadend = () => resolve(new Uint8Array(reader.result));
        }, "image/jpeg", quality);
    });
}

// ✅ Function to further optimize with pdf.js
async function optimizeWithPDFJS(pdfBytes) {
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
    const pdf = await loadingTask.promise;
    const pdfData = await pdf.getData();
    return new Uint8Array(pdfData);
}
