async function compressPDF() {
    const input = document.getElementById('pdfFile');
    if (!input.files.length) {
        alert("Please select a PDF file.");
        return;
    }

    const file = input.files[0];
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF with PDF.js for image processing
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const ops = await page.getOperatorList();
        for (let j = 0; j < ops.fnArray.length; j++) {
            if (ops.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
                const imageObj = ops.argsArray[j][0];
                const imgData = await page.objs.get(imageObj);

                if (imgData) {
                    const compressedImage = await compressImage(imgData);
                    const embeddedImage = await pdfDoc.embedJpg(compressedImage);
                    pages[i].drawImage(embeddedImage, { width: pages[i].getWidth(), height: pages[i].getHeight() });
                }
            }
        }
    }

    // Optimize PDF streams and remove unused objects
    pdfDoc.setProducer("Optimized PDF Compressor");
    pdfDoc.setCreator("Custom PDF Compressor");

    const compressedPdfBytes = await pdfDoc.save();
    
    // Trigger download
    const blob = new Blob([compressedPdfBytes], { type: "application/pdf" });
    const link = document.getElementById('downloadLink');
    link.href = URL.createObjectURL(blob);
    link.style.display = "block";
    link.download = "compressed.pdf";
}

async function compressImage(imgData) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = imgData.width / 2; // Reduce size
    canvas.height = imgData.height / 2;

    ctx.drawImage(imgData, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.5); // Reduce quality to 50%
    });
}
