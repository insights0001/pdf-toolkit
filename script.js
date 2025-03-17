async function compressPDF() {
    const fileInput = document.getElementById("pdfFile");
    const downloadLink = document.getElementById("downloadLink");

    if (!fileInput.files.length) {
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

            copiedPages.forEach((page) => {
                const { width, height } = page.getSize();
                page.setSize(width * 0.9, height * 0.9); // Reduce page size slightly
                newPdf.addPage(page);
            });

            const compressedPdfBytes = await newPdf.save({ useObjectStreams: true });
            const blob = new Blob([compressedPdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            // Show download button
            downloadLink.href = url;
            downloadLink.download = "compressed.pdf";
            downloadLink.textContent = "Download Compressed PDF";
            downloadLink.classList.remove("hidden");
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    reader.readAsArrayBuffer(file);
}
