document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("fileInput");
    const uploadArea = document.querySelector(".upload-area");
    const compressBtn = document.querySelector(".compress-btn");
    
    // Handle file selection
    fileInput.addEventListener("change", function () {
        let file = fileInput.files[0];
        if (file) {
            document.querySelector(".upload-area p").textContent = file.name;
            console.log("Selected file:", file.name);
        }
    });

    // Handle file drop (drag & drop support)
    uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = "#a777e3";
    });

    uploadArea.addEventListener("dragleave", () => {
        uploadArea.style.borderColor = "#fff";
    });

    uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        fileInput.files = e.dataTransfer.files;
        let file = fileInput.files[0];
        if (file) {
            document.querySelector(".upload-area p").textContent = file.name;
            console.log("Dropped file:", file.name);
        }
    });

    // Handle compression button click
    compressBtn.addEventListener("click", function () {
        let file = fileInput.files[0];
        if (!file) {
            alert("Please select a PDF file first.");
            return;
        }

        console.log("Compressing file:", file.name);
        compressPDF(file);
    });

    // PDF Compression Function
    function compressPDF(file) {
        // Placeholder: Implement actual compression logic
        console.log("Compression in progress...");

        // Simulating compression delay
        setTimeout(() => {
            alert("Compression complete! (Mock Result)");
        }, 2000);
    }
});
