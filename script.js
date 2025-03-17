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

        const newPdf = await PDFLib.PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

        copiedPages.forEach((page) => {
            const { width, height } = page.getSize();
            page.setSize(width * 0.8, height * 0.8); // Scale down pages further
            newPdf.addPage(page);
        });

        // Remove metadata to reduce size
        newPdf.setTitle("");
        newPdf.setAuthor("");
        newPdf.setSubject("");

        // Save with compression
        const compressedPdfBytes = await newPdf.save({ useObjectStreams: true });
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
