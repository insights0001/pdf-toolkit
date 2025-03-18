import { PDFDocument, rgb } from 'pdf-lib';

// Function to compress images inside the PDF
async function compressImages(pdfDoc, quality = 0.5) {
    const pages = pdfDoc.getPages();
    
    for (const page of pages) {
        const { width, height } = page.getSize();
        const images = page.node.Resources?.XObject;

        if (images) {
            for (const key in images) {
                const image = images[key];

                if (image.lookupMaybe("Subtype")?.toString() === "/Image") {
                    const bytes = image.getContent();
                    const img = new Image();
                    img.src = URL.createObjectURL(new Blob([bytes]));
                    
                    await new Promise(resolve => img.onload = resolve);

                    // Draw compressed image
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width * quality;
                    canvas.height = img.height * quality;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Convert to WebP (or JPEG fallback)
                    const newImageData = await new Promise(resolve => 
                        canvas.toBlob(blob => resolve(blob), "image/webp", quality) ||
                        canvas.toBlob(blob => resolve(blob), "image/jpeg", quality)
                    );

                    const compressedBytes = new Uint8Array(await newImageData.arrayBuffer());

                    // Embed compressed image
                    const compressedImage = await pdfDoc.embedPng(compressedBytes);
                    page.drawImage(compressedImage, { x: 0, y: 0, width, height });
                }
            }
        }
    }
}

// Main function to optimize PDF
async function compressPDF(pdfBytes) {
    const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });

    // Remove metadata and unused objects
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    
    await compressImages(pdfDoc, 0.5); // Adjust image compression level

    return await pdfDoc.save({ useObjectStreams: true });
}

// Usage Example:
const inputPdf = await fetch("example.pdf").then(res => res.arrayBuffer());
const compressedPdf = await compressPDF(inputPdf);

// Create a downloadable link
const blob = new Blob([compressedPdf], { type: "application/pdf" });
const link = document.createElement("a");
link.href = URL.createObjectURL(blob);
link.download = "compressed.pdf";
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
