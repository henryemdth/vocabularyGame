import { store } from "./store.js";
import { $, shuffle, sampleRandom, generateOptions, getPrompt, validateVocabulary } from "./utils.js";
import { CountdownTimer, TIMER_SECONDS, FEEDBACK_DELAY, OPT_COLORS, OPT_BGS } from "./timer.js";
import { saveToStorage, loadFromStorage, initDarkMode, toggleDark } from "./storage.js";

let timer = null;
let startTime = 0;

function showView(id) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  $(id).classList.add("active");
}

function closeMenu() {
  document.getElementById("hamburger").classList.remove("open");
}

function initModeSelection() {
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      store.mode = btn.dataset.mode;
    });
  });
}

function refreshSetupView() {
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
  }

  document.getElementById("menu-info").textContent = hasDeck
    ? `${total} words loaded`
    : "No deck loaded";

  const startBtn = document.getElementById("menu-start");
  startBtn.disabled = !hasDeck;
}

function getCurrentMode() {
  return store.mode === "C"
    ? (Math.random() < 0.5 ? "A" : "B")
    : store.mode;
}

function startGame() {
  if (!store.rawVocabulary || Object.keys(store.rawVocabulary).length === 0) return;
  closeMenu();
  store.resetGame();
  store.gameDeck = sampleRandom(store.rawVocabulary, store.cardCount);
  startTime = Date.now();
  showView("view-game");
  renderCard();
}

function renderCard() {
  if (store.currentIndex >= store.gameDeck.length) { endGame(); return; }
  store.isAnswered = false;
  const deck = store.gameDeck;
  const idx = store.currentIndex;
  const current = deck[idx];
  const mode = getCurrentMode();

  const { prompt } = getPrompt(current, mode);
  const options = generateOptions(deck, idx, mode);

  $("card-progress").textContent = `Card ${idx + 1} / ${deck.length}`;
  $("card-prompt").textContent = prompt;

  const container = $("options-container");
  container.innerHTML = "";
  options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.style.setProperty("--opt-color", OPT_COLORS[i % 4]);
    btn.style.setProperty("--opt-bg", OPT_BGS[i % 4]);
    btn.addEventListener("click", () => handleAnswer(btn, opt, current, mode));
    container.appendChild(btn);
  });

  $("card-feedback").className = "feedback";
  $("card-feedback").textContent = "";
  startTimer(mode);
}

function startTimer(mode) {
  if (timer) timer.stop();
  const bar = $("timer-bar");
  bar.style.width = "100%";
  bar.style.removeProperty("background");

  timer = new CountdownTimer(
    TIMER_SECONDS,
    (remaining, total) => {
      const pct = (remaining / total) * 100;
      bar.style.width = `${pct}%`;
    },
    () => {
      if (!store.isAnswered) {
        store.isAnswered = true;
        showFeedback(null, store.gameDeck[store.currentIndex], mode);
        setTimeout(advanceCard, FEEDBACK_DELAY);
      }
    }
  );
  timer.start();
}

function handleAnswer(btn, selected, current, mode) {
  if (store.isAnswered) return;
  store.isAnswered = true;
  timer.stop();
  const correct = mode === "A" ? current.word : current.meaning;
  const isCorrect = selected === correct;
  if (isCorrect) store.score++;
  showFeedback(selected, current, mode, isCorrect);
  setTimeout(advanceCard, FEEDBACK_DELAY);
}

function showFeedback(selected, current, mode, isCorrect) {
  const correct = mode === "A" ? current.word : current.meaning;
  const feedbackEl = $("card-feedback");
  document.querySelectorAll(".option-btn").forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === correct) {
      btn.classList.add("correct");
    } else if (selected && btn.textContent === selected && !isCorrect) {
      btn.classList.add("incorrect");
    }
  });
  if (isCorrect === undefined) {
    feedbackEl.className = "feedback feedback-timeout";
    feedbackEl.textContent = `Time's up! The answer was: ${correct}`;
  } else if (isCorrect) {
    feedbackEl.className = "feedback feedback-correct";
    feedbackEl.textContent = "Correct!";
  } else {
    feedbackEl.className = "feedback feedback-incorrect";
    feedbackEl.textContent = `The answer was: ${correct}`;
  }
}

function advanceCard() {
  store.currentIndex++;
  if (store.currentIndex >= store.gameDeck.length) {
    endGame();
  } else {
    renderCard();
  }
}

function endGame() {
  if (timer) timer.stop();
  const total = store.gameDeck.length;
  const pct = total > 0 ? Math.round((store.score / total) * 100) : 0;
  const elapsed = Math.round((Date.now() - startTime) / 1000);

  const pctEl = $("result-pct");
  if (pct >= 80) {
    pctEl.style.color = "var(--green)";
  } else if (pct >= 50) {
    pctEl.style.color = "var(--orange)";
  } else {
    pctEl.style.color = "var(--red)";
  }

  $("result-score").textContent = `${store.score} / ${total}`;
  pctEl.textContent = `${pct}% Accuracy`;
  $("result-time").textContent = `Time: ${elapsed}s`;
  $("result-correct").textContent = store.score;
  $("result-incorrect").textContent = total - store.score;
  showView("view-results");
}

function playAgain() {
  store.resetGame();
  store.gameDeck = sampleRandom(store.rawVocabulary, store.cardCount);
  startTime = Date.now();
  showView("view-game");
  renderCard();
}

function newDeck() {
  localStorage.removeItem("vocab-data");
  store.rawVocabulary = null;
  store.resetGame();
  document.getElementById("file-input").value = "";
  document.getElementById("upload-error").style.display = "none";
  refreshSetupView();
  showView("view-setup");
}

function goToSetup() {
  if (timer) timer.stop();
  store.resetGame();
  refreshSetupView();
  showView("view-setup");
}

export function init() {
  initDarkMode();

  const saved = loadFromStorage();
  if (saved && Object.keys(saved).length > 0) {
    store.rawVocabulary = saved;
  }
  refreshSetupView();

  document.getElementById("hamburger-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("hamburger").classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!document.getElementById("hamburger").contains(e.target)) {
      closeMenu();
    }
  });

  document.querySelectorAll(".dark-toggle").forEach((btn) => {
    btn.addEventListener("click", toggleDark);
  });

  document.getElementById("menu-load").addEventListener("click", () => {
    document.getElementById("file-input").click();
    closeMenu();
  });

  document.getElementById("menu-start").addEventListener("click", startGame);

  document.getElementById("upload-inline-btn").addEventListener("click", () => {
    document.getElementById("file-input").click();
  });

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

  document.getElementById("card-count-input").addEventListener("input", (e) => {
    const max = store.rawVocabulary ? Object.keys(store.rawVocabulary).length : 1;
    let val = parseInt(e.target.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > max) val = max;
    e.target.value = val;
    store.cardCount = val;
  });

  document.getElementById("play-again-btn").addEventListener("click", playAgain);
  document.getElementById("new-deck-btn").addEventListener("click", newDeck);
  document.getElementById("configure-btn").addEventListener("click", goToSetup);

  initModeSelection();
  showView("view-setup");
}
