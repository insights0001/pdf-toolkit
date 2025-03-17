document.getElementById("pdfFile").addEventListener("change", handleFile);

async function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function () {
        const pdfData = new Uint8Array(reader.result);
        const compressedPdf = await compressPDF(pdfData);
        downloadCompressedPDF(compressedPdf);
    };
    reader.readAsArrayBuffer(file);
}

async function compressPDF(pdfData) {
    const pdfDoc = await PDFLib.PDFDocument.load(pdfData);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
        const { width, height } = page.getSize();

        // Scale images down
        page.setSize(width * 0.9, height * 0.9); 

        // Reduce embedded images' quality
        const jpgImages = page.node.resources.get(PDFLib.Name.of('XObject')) || {};
        for (const key of Object.keys(jpgImages)) {
            const image = jpgImages[key];
            if (image instanceof PDFLib.JPEGImage) {
                const compressedImage = await PDFLib.JPEGImage.embed(pdfDoc, image.bytes, { quality: 0.6 });
                page.drawImage(compressedImage, { x: 0, y: 0, width, height });
            }
        }
    }

    return await pdfDoc.save();
}

function downloadCompressedPDF(pdfBytes) {
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.getElementById("downloadLink");
    link.href = URL.createObjectURL(blob);
    link.style.display = "block";
    link.download = "compressed.pdf";
}
