import { store } from "./store.js";
import { $, showView, closeMenu, sampleRandom } from "./utils.js";
import { renderCard } from "./game.js";

export function initModeSelection() {
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      store.mode = btn.dataset.mode;
    });
  });
}

export function refreshSetupView() {
  const hasDeck = store.rawVocabulary && Object.keys(store.rawVocabulary).length > 0;
  const total = hasDeck ? Object.keys(store.rawVocabulary).length : 0;

  document.getElementById("setup-empty").style.display = hasDeck ? "none" : "block";
  document.getElementById("setup-ready").style.display = hasDeck ? "block" : "none";

  if (hasDeck) {
    const count = Math.min(store.cardCount, total);
    store.cardCount = count;
    document.getElementById("deck-info-text").textContent = `${total} words loaded`;
    document.getElementById("card-count-input").max = total;
    document.getElementById("card-count-input").value = count;
    document.getElementById("card-total-hint").textContent = `of ${total} total`;

    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.classList.toggle("selected", btn.dataset.mode === store.mode);
    });

    document.getElementById("timer-input").value = store.timerSeconds;
  }

  document.getElementById("menu-info").textContent = hasDeck
    ? `${total} words loaded`
    : "No deck loaded";

  const startBtn = document.getElementById("menu-start");
  startBtn.disabled = !hasDeck;
}

export function startGame() {
  if (!store.rawVocabulary || Object.keys(store.rawVocabulary).length === 0) return;
  closeMenu();
  store.resetGame();
  store.gameDeck = sampleRandom(store.rawVocabulary, store.cardCount);
  showView("view-game");
  renderCard();
}

export function setupReadyInit() {
  initModeSelection();

  document.getElementById("card-count-input").addEventListener("input", (e) => {
    const max = store.rawVocabulary ? Object.keys(store.rawVocabulary).length : 1;
    let val = parseInt(e.target.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > max) val = max;
    e.target.value = val;
    store.cardCount = val;
  });

  document.getElementById("menu-start").addEventListener("click", startGame);

  document.getElementById("timer-input").addEventListener("input", (e) => {
    let val = parseInt(e.target.value);
    if (!isNaN(val)) {
      store.timerSeconds = val;
    }
  });

  document.getElementById("timer-input").addEventListener("change", (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val) || val < 2) val = 2;
    if (val > 30) val = 30;
    e.target.value = val;
    store.timerSeconds = val;
  });
}
