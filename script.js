function selectTool(tool) {
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

function compressPDF() {
    alert("compressPDF function is working!"); // Simple test alert
}
