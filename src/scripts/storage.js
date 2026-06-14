export const STORAGE_KEY = "vocab-data";
export const DARK_KEY = "dark-mode";

export function saveToStorage(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function initDarkMode() {
  const stored = localStorage.getItem(DARK_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = stored !== null ? stored === "true" : prefersDark;
  document.documentElement.classList.toggle("dark", isDark);
}

export function toggleDark() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem(DARK_KEY, isDark);
}
