document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const uploadArea = document.getElementById("uploadArea");
  const compressBtn = document.querySelector(".compress-btn");
  const fileName = document.getElementById("fileName");
  let selectedFile = null;

  // Fix 1: Proper click handling for upload area
  uploadArea.addEventListener("click", (e) => {
    if (e.target.tagName !== "INPUT") {
      fileInput.click();
    }
  });

  // Fix 2: Proper file input handling
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      selectedFile = fileInput.files[0];
      fileName.textContent = selectedFile.name;
      uploadArea.classList.add("file-selected");
    } else {
      selectedFile = null;
      fileName.textContent = "";
      uploadArea.classList.remove("file-selected");
    }
  });

  // Fix 3: Reset UI on new file selection
  const resetUI = () => {
    fileInput.value = "";
    selectedFile = null;
    fileName.textContent = "";
    uploadArea.classList.remove("file-selected");
  };

  // ... (rest of your existing drag-and-drop and compression code) ...

  // Modified compress button handler
  compressBtn.addEventListener("click", async () => {
    if (!selectedFile) {
      alert("Please select a PDF file first!");
      resetUI();
      return;
    }
    
    // ... (rest of compression logic) ...
  });
});
