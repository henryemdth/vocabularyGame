import { store } from "./store.js";
import { $, showView, validateVocabulary } from "./utils.js";
import { saveToStorage } from "./storage.js";
import { refreshSetupView } from "./setup-ready.js";

export function loadDefaultDeck() {
  const errorEl = document.getElementById("upload-error");
  errorEl.textContent = "";
  errorEl.style.display = "none";

  try {
    const el = document.getElementById("default-vocab-data");
    if (!el || !el.dataset.value) throw new Error("Default deck data not found");
    const data = JSON.parse(el.dataset.value);
    validateVocabulary(data);
    store.rawVocabulary = data;
    saveToStorage(data);
    refreshSetupView();
    showView("view-setup");
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = "block";
  }
}

export function newDeck() {
  localStorage.removeItem("vocab-data");
  store.rawVocabulary = null;
  store.resetGame();
  document.getElementById("file-input").value = "";
  document.getElementById("upload-error").style.display = "none";
  refreshSetupView();
  showView("view-setup");
}

export function setupInit() {
  document.getElementById("upload-inline-btn").addEventListener("click", () => {
    document.getElementById("file-input").click();
  });

  document.getElementById("load-default-btn").addEventListener("click", loadDefaultDeck);

  document.getElementById("file-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const errorEl = document.getElementById("upload-error");
    errorEl.textContent = "";
    errorEl.style.display = "none";

    if (!file.name.endsWith(".json")) {
      errorEl.textContent = "Please upload a .json file";
      errorEl.style.display = "block";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        validateVocabulary(data);
        store.rawVocabulary = data;
        saveToStorage(data);
        refreshSetupView();
        showView("view-setup");
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = "block";
      }
    };
    reader.onerror = () => {
      errorEl.textContent = "Error reading file";
      errorEl.style.display = "block";
    };
    reader.readAsText(file);
  });
}
