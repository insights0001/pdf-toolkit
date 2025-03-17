async function compressPDF() {
    alert("Compress function started!"); // Debugging alert

    const fileInput = document.getElementById("pdfFile");
    if (!fileInput || fileInput.files.length === 0) {
        alert("Please select a PDF file.");
        return;
    }

    alert("File selected!"); // Debugging alert

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function(event) {
        alert("File reading started!"); // Debugging alert

        try {
            const pdfBytes = new Uint8Array(event.target.result);
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true });

            alert("PDF loaded!"); // Debugging alert

            const newPdf = await PDFLib.PDFDocument.create();
            const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

            copiedPages.forEach((page) => {
                const { width, height } = page.getSize();
                page.setSize(width * 0.8, height * 0.8); // Reduce page size
                newPdf.addPage(page);
            });

            alert("Compression complete!"); // Debugging alert

            const compressedPdfBytes = await newPdf.save({ useObjectStreams: true });
            const blob = new Blob([compressedPdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            const downloadLink = document.getElementById("downloadLink");
            downloadLink.href = url;
            downloadLink.download = "compressed.pdf";
            downloadLink.style.display = "block";
            downloadLink.textContent = "Download Compressed PDF";

            alert("Download link ready!"); // Debugging alert

        } catch (error) {
            alert("Error: " + error.message); // Show error
        }
    };

    reader.readAsArrayBuffer(file);
}
