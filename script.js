document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("pdfFile");
    const compressButton = document.getElementById("compressButton");
    const downloadLink = document.getElementById("downloadLink");

    compressButton.addEventListener("click", async () => {
        if (fileInput.files.length === 0) {
            alert("Please select a PDF file first.");
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async function (event) {
            const pdfData = new Uint8Array(event.target.result);
            
            try {
                const pdfDoc = await PDFLib.PDFDocument.load(pdfData);

                // Reduce image quality and optimize size
                const pages = pdfDoc.getPages();
                for (const page of pages) {
                    const { width, height } = page.getSize();
                    page.setSize(width * 0.9, height * 0.9); // Slightly scale down
                }

                const compressedPdfBytes = await pdfDoc.save();

                // Create a download link
                const blob = new Blob([compressedPdfBytes], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                downloadLink.href = url;
                downloadLink.download = "compressed.pdf";
                downloadLink.style.display = "block";
                downloadLink.textContent = "Download Compressed PDF";
            } catch (error) {
                console.error("Compression Error:", error);
                alert("Error compressing PDF. Check console for details.");
            }
        };

        reader.readAsArrayBuffer(file);
    });
});
