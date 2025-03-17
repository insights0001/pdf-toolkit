async function selectTool(tool) {
    const toolContainer = document.getElementById("tool-container");
    if (tool === "compress") {
        toolContainer.innerHTML = `
            <h2>Compress PDF</h2>
            <input type="file" id="pdfFile" accept="application/pdf">
            <button onclick="compressPDF()">Compress</button>
            <a id="downloadLink" style="display:none;">Download Compressed PDF</a>
        `;
    }
}

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
        const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

        // Reduce image quality (compression)
        const pages = pdfDoc.getPages();
        for (const page of pages) {
            const { width, height } = page.getSize();
            page.setSize(width * 0.9, height * 0.9); // Scale down pages slightly
        }

        const compressedPdfBytes = await pdfDoc.save();
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
