async function compressPDF() {
    const fileInput = document.getElementById("pdfFile");
    if (fileInput.files.length === 0) {
        alert("Please select a PDF file.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function(event) {
        const pdfBytes = new Uint8Array(event.target.result);
        const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true });

        // Compress images and reduce quality
        const pages = pdfDoc.getPages();
        for (const page of pages) {
            const { width, height } = page.getSize();
            page.setSize(width * 0.85, height * 0.85); // Reduce page size

            // Optional: Remove embedded fonts and metadata
            pdfDoc.setTitle("");
            pdfDoc.setAuthor("");
            pdfDoc.setSubject("");
        }

        // Save compressed PDF with optimizations
        const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: true });
        const blob = new Blob([compressedPdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        const downloadLink = document.getElementById("downloadLink");
        downloadLink.href = url;
        downloadLink.download = "compressed.pdf";
        downloadLink.style.display = "block";
        downloadLink.textContent = "Download Compressed PDF";
    };

    reader.readAsArrayBuffer(file);
}
